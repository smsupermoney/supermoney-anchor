
'use server';

import { db2 } from "@/lib/firebase";
import { getSession } from "@/lib/session";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

type ActionResult = {
  message?: string;
  error?: string;
};

type CommentActionResult = ActionResult & {
    updatedRemarks?: any[];
}

export async function addComment(leadId: string, leadCategory: 'Dealer' | 'Vendor', comment: string): Promise<CommentActionResult> {
    const session = await getSession();
    if (!session || !session.userName) {
        return { error: 'You must be logged in to add a comment.' };
    }

    try {
        const collectionName = leadCategory.toLowerCase() === 'dealer' ? 'dealers' : 'vendors';
        const leadRef = doc(db2, collectionName, leadId);

        const newRemark = {
            remark: comment,
            timestamp: new Date().toISOString(),
            user: session.userName,
        };

        await updateDoc(leadRef, {
            remarks: arrayUnion(newRemark),
            updatedAt: new Date().toISOString(),
        });

        // Fetch the updated remarks to return
        const updatedDoc = await getDoc(leadRef);
        const updatedData = updatedDoc.data();
        
        revalidatePath(`/leads/${leadId}`);
        return { message: 'Comment added successfully.', updatedRemarks: updatedData?.remarks };

    } catch (e) {
        console.error('Error adding comment:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { error: `Failed to add comment: ${errorMessage}` };
    }
}

export async function updateLeadStatus(leadId: string, leadCategory: 'Dealer' | 'Vendor', status: string): Promise<ActionResult> {
     const session = await getSession();
    if (!session || !session.userName) {
        return { error: 'You must be logged in to update status.' };
    }

    try {
        const collectionName = leadCategory.toLowerCase() === 'dealer' ? 'dealers' : 'vendors';
        const leadRef = doc(db2, collectionName, leadId);
        
        const newRemark = {
            remark: `Status changed to "${status}"`,
            timestamp: new Date().toISOString(),
            user: session.userName,
        };

        await updateDoc(leadRef, {
            status: status,
            updatedAt: new Date().toISOString(),
            remarks: arrayUnion(newRemark),
        });
        
        revalidatePath(`/leads/${leadId}`);
        revalidatePath('/leads');
        return { message: 'Status updated successfully.' };

    } catch (e) {
        console.error('Error updating status:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { error: `Failed to update status: ${errorMessage}` };
    }
}
