
"use server";

import { requireAnchorOrAdmin } from "@/lib/auth";
import { db1 } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Dealer } from '@/types';

type ActionResult = {
  message?: string;
  error?: string;
};

const updateDetailsSchema = z.object({
  dealerId: z.string().min(1, 'Dealer ID is required.'),
  totalLimit: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Limit must be a non-negative number.')
  ),
  utilisationAmount: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Utilisation must be a non-negative number.')
  ),
  principalOverdue: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Overdue amount must be a non-negative number.')
  ),
  principalDPD: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'DPD must be a non-negative number.')
  ),
  status: z.enum(['Active', 'Inactive', 'Pending', 'Supply Stopped']),
});

export async function updateDealerDetails(
  data: z.infer<typeof updateDetailsSchema>
): Promise<ActionResult> {
  const validatedFields = updateDetailsSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return { error: 'Invalid data provided. Please check the form.' };
  }

  const { dealerId, totalLimit, utilisationAmount, principalOverdue, principalDPD, status } = validatedFields.data;

  if (utilisationAmount > totalLimit) {
      return { error: 'Utilisation amount cannot be greater than the total limit.' };
  }

  const dealerSnap = await getDoc(doc(db1, 'dealers', dealerId));
  const dealerAnchorId = dealerSnap.exists() ? dealerSnap.data().anchorId : '';
  const authError = await requireAnchorOrAdmin(dealerAnchorId);
  if (authError) return authError;

  try {
    const limitRef = doc(db1, 'dealerLimits', dealerId);
    const dealerRef = doc(db1, 'dealers', dealerId);

    // Prepare updates for dealerLimits collection
    await updateDoc(limitRef, {
      limitAmount: totalLimit,
      utilisationAmount: utilisationAmount,
      principalOverdue: principalOverdue,
      principalDPD: principalDPD,
      availableAmount: totalLimit - utilisationAmount, // Recalculate available amount
    });

    // Prepare updates for dealers collection
    await updateDoc(dealerRef, {
        status: status,
    });

    revalidatePath('/dealers');
    revalidatePath('/dashboard');

    return { message: 'Dealer details updated successfully.' };
  } catch (error) {
    console.error('Error updating dealer details:', error);
    if (error instanceof Error) {
      return { error: `Failed to update details: ${error.message}` };
    }
    return { error: 'An unknown error occurred.' };
  }
}
