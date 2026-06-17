
"use server";

import { db1 } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import nodemailer from "nodemailer";

type ConsentResult = {
    success?: boolean;
    error?: string;
};

const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT);

const transporter = smtpConfigured ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
}) : null;

export async function processConsent(token: string, action: 'Approved' | 'Rejected', ip: string): Promise<ConsentResult> {
    try {
        const consentQuery = query(collection(db1, "invoiceConsents"), where("token", "==", token), where("status", "==", "Pending"));
        const consentSnap = await getDocs(consentQuery);

        if (consentSnap.empty) {
            return { error: "Token invalid or already processed." };
        }

        const consentDoc = consentSnap.docs[0];
        const consentData = consentDoc.data();

        if (new Date(consentData.expiryTime) < new Date()) {
            return { error: "Link expired." };
        }

        // Update consent status in the consents collection
        await updateDoc(consentDoc.ref, {
            status: action,
            consentTimestamp: new Date().toISOString(),
            ipAddress: ip
        });

        // If approved, directly send notification email using data from the consent document
        if (action === 'Approved' && smtpConfigured && transporter) {
            // Fetch dealer for branch email and display details
            const dealerDoc = await getDoc(doc(db1, "dealers", consentData.dealerId));
            const dealerData = dealerDoc.exists() ? dealerDoc.data() : null;

            // Fetch anchor name based on anchorId from dealer record
            let anchorName = 'N/A';
            if (dealerData?.anchorId) {
                const usersRef = collection(db1, 'users');
                const anchorQuery = query(
                    usersRef, 
                    where('roleType', '==', 'Anchor'), 
                    where('externalId', '==', dealerData.anchorId)
                );
                const anchorSnap = await getDocs(anchorQuery);
                if (!anchorSnap.empty) {
                    anchorName = anchorSnap.docs[0].data().userName || 'N/A';
                }
            }

            const mailOptions = {
                from: `"Supermoney Platform" <noreply@supermoney.in>`,
                to: ["invoice@supermoney.in", dealerData?.branchEmailId].filter(Boolean) as string[],
                subject: `JSPL CBoI - Invoice Disbursement Approved: ${consentData.invoiceNumber}`,
                html: `
                    <h1>Invoice Disbursement Approved</h1>
                    <p>The following invoice has been approved for disbursement via dealer consent.</p>
                    <hr />
                    <ul>
                        <li><strong>Invoice Number:</strong> ${consentData.invoiceNumber}</li>
                        <li><strong>Dealer Name:</strong> ${dealerData?.dealerName || 'N/A'}</li>
                        <li><strong>Anchor Name:</strong> ${anchorName}</li>
                        <li><strong>Amount:</strong> ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(consentData.amount || 0)}</li>
                        <li><strong>Branch Name:</strong> ${dealerData?.branchName || 'N/A'}</li>
                        <li><strong>Consent Timestamp:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                `,
                attachments: consentData.fileContent ? [{
                    filename: consentData.fileName || 'invoice.pdf',
                    path: consentData.fileContent,
                }] : []
            };
            await transporter.sendMail(mailOptions);
        }

        return { success: true };
    } catch (e) {
        console.error("Consent processing error:", e);
        return { error: "Internal server error." };
    }
}
