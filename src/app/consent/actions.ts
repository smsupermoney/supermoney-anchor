"use server";

import { db1 } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import nodemailer from "nodemailer";

type ConsentResult = {
    success?: boolean;
    error?: string;
};

const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = smtpConfigured ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
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

        // Update consent status
        await updateDoc(consentDoc.ref, {
            status: action,
            consentTimestamp: new Date().toISOString(),
            ipAddress: ip
        });

        // Update invoice status
        const invoiceQuery = query(collection(db1, "invoices"), where("invoiceNumber", "==", consentData.invoiceNumber));
        const invoiceSnap = await getDocs(invoiceQuery);

        if (!invoiceSnap.empty) {
            const invoiceDoc = invoiceSnap.docs[0];
            await updateDoc(invoiceDoc.ref, {
                status: action === 'Approved' ? 'Consent Approved' : 'Rejected'
            });

            if (action === 'Approved' && smtpConfigured && transporter) {
                // Fetch dealer for branch email
                const dealerDoc = await getDoc(doc(db1, "dealers", consentData.dealerId));
                const dealerData = dealerDoc.exists() ? dealerDoc.data() : null;

                const mailOptions = {
                    from: `"Supermoney Platform" <${process.env.SMTP_USER}>`,
                    to: ["invoice@supermoney.in", dealerData?.branchEmailId].filter(Boolean) as string[],
                    subject: `Invoice Consent Approved: ${consentData.invoiceNumber}`,
                    html: `
                        <h1>Invoice Consent Approved</h1>
                        <p>The dealer has approved the invoice.</p>
                        <hr />
                        <ul>
                            <li><strong>Invoice Number:</strong> ${consentData.invoiceNumber}</li>
                            <li><strong>Dealer Name:</strong> ${dealerData?.dealerName || 'N/A'}</li>
                            <li><strong>Anchor ID:</strong> ${dealerData?.anchorId || 'N/A'}</li>
                            <li><strong>Amount:</strong> ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoiceDoc.data().amount)}</li>
                            <li><strong>Branch Name:</strong> ${dealerData?.branchName || 'N/A'}</li>
                            <li><strong>Consent Timestamp:</strong> ${new Date().toLocaleString()}</li>
                        </ul>
                    `
                };
                await transporter.sendMail(mailOptions);
            }
        }

        return { success: true };
    } catch (e) {
        console.error("Consent processing error:", e);
        return { error: "Internal server error." };
    }
}