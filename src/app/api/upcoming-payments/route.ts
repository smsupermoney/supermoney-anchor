import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db1 } from '@/lib/firebase';
import {
  doc,
  setDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';

/* ================= SCHEMA ================= */

const upcomingPaymentSchema = z.array(
  z.object({
    dealerId: z.string().min(1, 'dealerId is required'),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    outstandingAmount: z
      .number()
      .positive('Outstanding amount must be > 0'),
  })
);

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

  /* 💾 FIRESTORE UPSERT */
  try {
    for (const row of validated.data) {
      await setDoc(
        doc(db1, 'upcomingPayments', row.dealerId),
        {
          dealerId: row.dealerId,
          payments: arrayUnion({
            dueDate: row.dueDate,
            outstandingAmount: row.outstandingAmount,
          }),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
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
