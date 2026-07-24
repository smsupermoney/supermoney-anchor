import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Define the schema for partial updates
// All fields are optional except for dealerId
const partialUpdateSchema = z.object({
  dealerId: z.string().min(1, 'dealerId is required.'),
  utilisationAmount: z.number().nonnegative().optional(),
  availableAmount: z.number().nonnegative().optional(),
  principalOverdue: z.number().nonnegative().optional(),
  principalDPD: z.number().nonnegative().optional(),
});

/**
 * NEW API: Partial Dealer Limit Update
 * This endpoint performs a non-destructive update of the dealer's financial metrics.
 * Fields not provided in the request body remain unchanged in the database.
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

  const validated = partialUpdateSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ 
      error: 'Invalid request body.', 
      details: validated.error.flatten() 
    }, { status: 400 });
  }

  const { dealerId, ...updateFields } = validated.data;

  // 3. Filter out undefined fields to ensure a true partial update
  const fieldsToUpdate = Object.fromEntries(
    Object.entries(updateFields).filter(([_, value]) => value !== undefined)
  );

  // If no valid update fields are provided (only dealerId was sent), return success early
  if (Object.keys(fieldsToUpdate).length === 0) {
    return NextResponse.json({ 
      success: true, 
      message: "Dealer record found, but no fields were provided for update." 
    }, { status: 200 });
  }

  try {
    const dealerLimitRef = doc(db1, 'dealerLimits', dealerId);
    
    // 4. Fetch the existing record to ensure it exists (as per implementation notes)
    const docSnap = await getDoc(dealerLimitRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json({ 
        error: `Dealer limit record not found for ID: ${dealerId}` 
      }, { status: 404 });
    }

    // 5. Update only the provided fields in Firestore
    // updateDoc naturally performs a merge/partial update.
    await updateDoc(dealerLimitRef, fieldsToUpdate);

    return NextResponse.json({ 
      success: true, 
      message: "Dealer details updated successfully." 
    }, { status: 200 });

  } catch (error) {
    console.error(`Partial update error for dealerId ${dealerId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ 
      error: 'Failed to update dealer data.', 
      details: errorMessage 
    }, { status: 500 });
  }
}
