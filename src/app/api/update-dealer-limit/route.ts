import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, writeBatch } from 'firebase/firestore';

// Define the schema for the incoming request body
const updateLimitSchema = z.object({
  dealerId: z.string().min(1, 'dealerId is required.'),
  limitAmount: z.number().nonnegative('limitAmount must be a non-negative number.'),
  principalOverdue: z.number().nonnegative('principalOverdue must be a non-negative number.'),
  utilisationAmount: z.number().nonnegative('utilisationAmount must be a non-negative number.'),
  availableAmount: z.number().nonnegative('availableAmount must be a non-negative number.'),
  principalDPD: z.number().nonnegative('principalDPD must be a non-negative number.').optional(),
  interestOutstanding: z.number().nonnegative().optional(),
  penalOutstanding: z.number().nonnegative().optional(),
  limitLiveDate: z.string().optional(),
  limitExpiryDate: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Pending', 'Supply Stopped']).optional(),
});

export async function POST(request: Request) {
  // 1. Secure the endpoint with an API key
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

  const validated = updateLimitSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request body.', details: validated.error.flatten() }, { status: 400 });
  }

  const { dealerId, status, ...updateData } = validated.data;

  // 3. Update the documents in Firestore
  try {
    const batch = writeBatch(db1);
    const dealerLimitRef = doc(db1, 'dealerLimits', dealerId);
    
    // Check if the document exists before trying to update
    const docSnap = await getDoc(dealerLimitRef);
    
    if (docSnap.exists()) {
        batch.update(dealerLimitRef, updateData);
    } else {
        // If the dealer doesn't exist in dealerLimits, we can create it.
        batch.set(dealerLimitRef, { ...updateData, dealerId });
    }

    // If status is provided, update the dealers collection
    if (status) {
        const dealerRef = doc(db1, 'dealers', dealerId);
        batch.update(dealerRef, { status });
    }

    await batch.commit();
    
    return NextResponse.json({ 
        message: `Successfully updated ${status ? 'limits and status' : 'limits'} for dealer ${dealerId}.` 
    }, { status: 200 });

  } catch (error) {
    console.error(`Firestore error for dealerId ${dealerId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: 'Failed to update dealer data.', details: errorMessage }, { status: 500 });
  }
}
