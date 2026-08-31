
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import {
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

/* ================= SCHEMA ================= */

const upcomingPaymentSchema = z.object({
  data: z.array(
    z.object({
      dealerId: z.string().min(1),
      loanId: z.string().min(1),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      outstandingAmount: z.number().nonnegative(),
    })
  ),
});

/* ================= HANDLER ================= */

export async function POST(request: Request) {
  /* 🔐 AUTH */
  const authHeader = request.headers.get('Authorization');
  const expectedApiKey = process.env.DEALER_API_SECRET_KEY;

  if (!expectedApiKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedApiKey}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  /* 📦 PARSE BODY */
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  /* ✅ VALIDATE */
  const validated = upcomingPaymentSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      {
        error: 'Invalid request body',
        details: validated.error.flatten(),
      },
      { status: 400 }
    );
  }

  const paymentData = validated.data.data;

  /* 💾 FIRESTORE WRITE (CLIENT SDK – BATCHED) */
  try {
    const BATCH_LIMIT = 25; // 🔑 SAFE LIMIT FOR CLIENT SDK

    for (let i = 0; i < paymentData.length; i += BATCH_LIMIT) {
      const slice = paymentData.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db1);

      for (const row of slice) {
        // Ensure dealer doc exists
        const dealerRef = doc(db1, 'upcomingPayments', row.dealerId);
        batch.set(
          dealerRef,
          {
            dealerId: row.dealerId,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        // Loan-level document
        const loanRef = doc(
          db1,
          'upcomingPayments',
          row.dealerId,
          'loans',
          row.loanId
        );

        if (row.outstandingAmount === 0) {
          batch.delete(loanRef);
        } else {
          batch.set(
            loanRef,
            {
              loanId: row.loanId,
              dueDate: row.dueDate,
              outstandingAmount: row.outstandingAmount,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }

      // ✅ Commit each small batch safely
      await batch.commit();
    }

    return NextResponse.json(
      { message: 'Upcoming payments stored successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Firestore error:', error);
    return NextResponse.json(
      { error: 'Failed to store upcoming payments' },
      { status: 500 }
    );
  }
}
