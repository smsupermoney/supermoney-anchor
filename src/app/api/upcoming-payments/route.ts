
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { collection, writeBatch, query, where, getDocs } from 'firebase/firestore';

// Define the schema for a single upcoming payment object
const upcomingPaymentSchema = z.object({
  invoiceNumber: z.string().min(1, 'invoiceNumber is required.'),
  dealerName: z.string().min(1, 'dealerName is required.'),
  anchorId: z.string().min(1, 'anchorId is required.'),
  amount: z.number().positive('Amount must be a positive number.'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be in YYYY-MM-DD format.'),
});

// Define the schema for the array of payments
const upsertUpcomingPaymentsSchema = z.array(upcomingPaymentSchema);

export async function POST(request: Request) {
  // 1. Secure the endpoint with the API key
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

  const validated = upsertUpcomingPaymentsSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request body.', details: validated.error.flatten() }, { status: 400 });
  }

  const upcomingPayments = validated.data;

  // 3. Perform the upsert operation in Firestore
  try {
    const paymentsRef = collection(db1, 'upcomingPayments');
    const batch = writeBatch(db1);
    let createdCount = 0;
    let updatedCount = 0;

    for (const payment of upcomingPayments) {
      // Query for an existing document with the same invoiceNumber
      const q = query(paymentsRef, where("invoiceNumber", "==", payment.invoiceNumber));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Document doesn't exist, create it with a new unique ID
        const newDocRef = doc(paymentsRef);
        batch.set(newDocRef, payment);
        createdCount++;
      } else {
        // Document exists, update it
        const existingDocRef = querySnapshot.docs[0].ref;
        batch.update(existingDocRef, payment);
        updatedCount++;
      }
    }

    await batch.commit();

    return NextResponse.json({
      message: `Successfully processed payments.`,
      created: createdCount,
      updated: updatedCount,
    }, { status: 200 });

  } catch (error) {
    console.error(`Firestore error during upcoming payments upsert:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: 'Failed to upsert upcoming payments.', details: errorMessage }, { status: 500 });
  }
}
