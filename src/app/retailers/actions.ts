
'use server';

import { db1 } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type ActionResult = {
  message?: string;
  error?: string;
};

const updateLimitSchema = z.object({
  dealerId: z.string().min(1, 'Dealer ID is required.'),
  newLimit: z.preprocess(
    (val) => Number(val),
    z.number().positive('Limit must be a positive number.')
  ),
});

export async function updateDealerLimit(
  dealerId: string,
  newLimit: number
): Promise<ActionResult> {
  const validatedFields = updateLimitSchema.safeParse({ dealerId, newLimit });

  if (!validatedFields.success) {
    return { error: 'Invalid data provided. Please check the form.' };
  }

  try {
    const limitRef = doc(db1, 'dealerLimits', dealerId);
    const limitDoc = await getDoc(limitRef);

    if (!limitDoc.exists()) {
      return { error: 'Dealer limit record not found.' };
    }

    await updateDoc(limitRef, {
      limitAmount: newLimit,
    });

    revalidatePath('/retailers');
    revalidatePath('/dashboard');

    return { message: 'Dealer limit updated successfully.' };
  } catch (error) {
    console.error('Error updating dealer limit:', error);
    if (error instanceof Error) {
      return { error: `Failed to update limit: ${error.message}` };
    }
    return { error: 'An unknown error occurred.' };
  }
}
