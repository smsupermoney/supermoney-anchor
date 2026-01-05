
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Define the schema for the incoming request body from your Apps Script
const upcomingPaymentSchema = z.object({
  dealerId: z.string().min(1, 'dealerId is required.'),
  next7DaysAmount: z.number().nonnegative(),
  next15DaysAmount: z.number().nonnegative(),
  next30DaysAmount: z.number().nonnegative(),
});

export async function POST(request: Request) {
  // 1. Secure the endpoint with the API key from your environment variables
  const authHeader = request.headers.get('Authorization');
  const expectedApiKey = process.env.DEALER_API_SECRET_KEY;

  if (!expectedApiKey) {
    console.error('DEALER_API_SECRET_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedApiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and validate the incoming JSON body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validated = upcomingPaymentSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request body.', details: validated.error.flatten() }, { status: 400 });
  }

  const { dealerId, ...paymentData } = validated.data;

  // 3. Save the data to Firestore
  try {
    // We will use the dealerId as the document ID for easy lookups and updates.
    // This performs an "upsert": it creates the document if it doesn't exist, or overwrites it if it does.
    const paymentRef = doc(db1, 'upcomingPayments', dealerId);
    
    await setDoc(paymentRef, {
      ...paymentData,
      dealerId: dealerId, // ensure dealerId is stored in the document as well
      updatedAt: serverTimestamp(), // track when the data was last updated
    });

    return NextResponse.json({
      message: `Successfully updated upcoming payments for dealer ${dealerId}.`,
    }, { status: 200 });

  } catch (error) {
    console.error(`Firestore error during upcoming payments update for dealer ${dealerId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: 'Failed to update upcoming payments.', details: errorMessage }, { status: 500 });
  }
}
