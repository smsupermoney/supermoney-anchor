import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

// Define the schema for individual updates
const partialUpdateSchema = z.object({
  dealerId: z.string().min(1, 'dealerId is required.'),
  utilisationAmount: z.number().nonnegative().optional(),
  availableAmount: z.number().nonnegative().optional(),
  principalOverdue: z.number().nonnegative().optional(),
  principalDPD: z.number().nonnegative().optional(),
});

// Define the schema for the list of updates
const listUpdateSchema = z.array(partialUpdateSchema);

/**
 * Updated API: Partial Dealer Limit Update (List/Bulk)
 * This endpoint performs a non-destructive update of the dealer's financial metrics for a list of dealers.
 * Fields not provided in the request body for an item remain unchanged in the database.
 */
export async function POST(request: Request) {
  // 1. Secure the endpoint with the existing API key
  const authHeader = request.headers.get('Authorization');
  const expectedApiKey = process.env.DEALER_API_SECRET_KEY;

  if (!expectedApiKey) {
    console.error('DEALER_API_SECRET_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedApiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and validate the request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validated = listUpdateSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ 
      error: 'Invalid request body. Expected a list of update objects.', 
      details: validated.error.flatten() 
    }, { status: 400 });
  }

  const updates = validated.data;

  if (updates.length === 0) {
    return NextResponse.json({ 
      success: true, 
      message: "No updates were provided in the list." 
    }, { status: 200 });
  }

  try {
    const batch = writeBatch(db1);
    const results = {
        total: updates.length,
        updated: 0,
        skipped: 0,
        notFound: [] as string[]
    };

    // 3. Process each update in the list
    for (const update of updates) {
      const { dealerId, ...updateFields } = update;

      // Filter out undefined fields to ensure a true partial update
      const fieldsToUpdate = Object.fromEntries(
        Object.entries(updateFields).filter(([_, value]) => value !== undefined)
      );

      // If no valid update fields are provided for this item, skip it
      if (Object.keys(fieldsToUpdate).length === 0) {
        results.skipped++;
        continue;
      }

      const dealerLimitRef = doc(db1, 'dealerLimits', dealerId);
      
      // 4. Fetch the existing record to ensure it exists
      const docSnap = await getDoc(dealerLimitRef);
      
      if (!docSnap.exists()) {
        results.notFound.push(dealerId);
        continue;
      }

      // 5. Add the update operation to the batch
      batch.update(dealerLimitRef, fieldsToUpdate);
      results.updated++;
    }

    // 6. Commit the batch if there are valid updates
    if (results.updated > 0) {
      await batch.commit();
    }

    // Return appropriate response based on findings
    if (results.updated === 0 && results.notFound.length > 0) {
       return NextResponse.json({ 
          error: 'No valid dealer records were found to update.', 
          details: { notFoundIds: results.notFound } 
        }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Dealer details updated successfully.",
      details: {
          totalProcessed: results.total,
          updatedCount: results.updated,
          notFoundCount: results.notFound.length,
          skippedCount: results.skipped,
          notFoundIds: results.notFound.length > 0 ? results.notFound : undefined
      }
    }, { status: 200 });

  } catch (error) {
    console.error(`Bulk partial update error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ 
      error: 'Failed to update dealer data.', 
      details: errorMessage 
    }, { status: 500 });
  }
}
