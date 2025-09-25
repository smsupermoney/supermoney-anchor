
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, addDoc, limit } from 'firebase/firestore';
import type { InvoiceStatus } from '@/types';

// Define the schema for the incoming request body
const upsertInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'invoiceNumber is required.'),
  programId: z.string().min(1, 'programId is required.'),
  anchorId: z.string().min(1, 'anchorId is required.'),
  dealerId: z.string().min(1, 'dealerId is required.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  //dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format.'),
  dueDate: z.string().optional(),
  disbursementSentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format.'),
  disburseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Disburse date must be in YYYY-MM-DD format.').optional().or(z.literal('')),
  amount: z.number().positive('Amount must be a positive number.'),
  disbursementSentAmount: z.number().nonnegative('Disbursement amount must be a non-negative number.'),
  status: z.enum(['Initiated', 'Approved', 'Sent to Lender', 'Disbursed', 'Rejected', 'Repaid']),
  remarks: z.string().optional(),
  utrNo: z.string().max(200, "UTR number cannot exceed 200 characters.").optional(),
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
    // This block executes if the request body is not valid JSON.
    return NextResponse.json({ error: 'Invalid JSON body. Please ensure the request body is well-formed JSON with a Content-Type of application/json.' }, { status: 400 });
  }

  const validated = upsertInvoiceSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request body.', details: validated.error.flatten() }, { status: 400 });
  }

  const { invoiceNumber, ...invoiceData } = validated.data;

  // 3. Perform the upsert operation in Firestore
  try {
    const invoicesRef = collection(db1, 'invoices');
    const q = query(invoicesRef, where("invoiceNumber", "==", invoiceNumber), limit(1));
    const existingInvoiceSnapshot = await getDocs(q);

    if (!existingInvoiceSnapshot.empty) {
      // Invoice exists, update it
      const existingDocRef = existingInvoiceSnapshot.docs[0].ref;
      await updateDoc(existingDocRef, invoiceData);
      return NextResponse.json({ message: `Successfully updated invoice ${invoiceNumber}.` }, { status: 200 });
    } else {
      // Invoice doesn't exist, create it
      // Add the invoiceNumber back into the data to be stored
      const newInvoicePayload = { ...invoiceData, invoiceNumber };
      await addDoc(invoicesRef, newInvoicePayload);
      return NextResponse.json({ message: `Successfully created new invoice ${invoiceNumber}.` }, { status: 201 });
    }

  } catch (error) {
    console.error(`Firestore error for invoiceNumber ${invoiceNumber}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: 'Failed to upsert invoice.', details: errorMessage }, { status: 500 });
  }
}
