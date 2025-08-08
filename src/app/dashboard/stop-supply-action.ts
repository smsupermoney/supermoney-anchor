
"use server";

import { db1 } from "@/lib/firebase";
import { collection, doc, writeBatch, addDoc } from "firebase/firestore";
import nodemailer from "nodemailer";
import { getSession } from "@/lib/session";
import type { StopSupplyLog, User } from "@/types";

type ActionResult = {
  message?: string;
  error?: string;
};

// Basic validation for environment variables
const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = smtpConfigured ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
}) : null;

function generateEmailBody(dealerName: string, anchorName: string): string {
    return `
        <h1>Supply Suspension Notice</h1>
        <p>Dear ${dealerName},</p>
        <p>This is to inform you that your supply chain financing facility with <strong>${anchorName}</strong>, facilitated through the Supermoney platform, has been temporarily suspended due to overdue payments.</p>
        <p>To resolve this and reinstate your facility, please clear your outstanding dues at the earliest.</p>
        <p>If you have any questions or believe this is in error, please contact our support team immediately.</p>
        <br />
        <p>Thank you for your cooperation.</p>
        <p>Sincerely,</p>
        <p>The Supermoney Team</p>
    `;
}

export async function stopSupplyAction(dealer: { id: string; name: string; email?: string; overdueAmount: number }): Promise<ActionResult> {
    const session = await getSession();
    if (!session?.externalId || !session.userName) {
        return { error: "Authentication failed. You must be logged in to perform this action." };
    }

    try {
        const batch = writeBatch(db1);

        // 1. Update dealer status to "Supply Stopped"
        const dealerRef = doc(db1, "dealers", dealer.id);
        batch.update(dealerRef, { status: "Supply Stopped" });

        // 2. Create a log entry in `stopSupplyLogs`
        const logData: StopSupplyLog = {
            dealerId: dealer.id,
            dealerName: dealer.name,
            anchorId: session.externalId,
            anchorName: session.userName,
            overdueAmount: dealer.overdueAmount,
            createdAt: new Date().toISOString(),
        };
        const logRef = doc(collection(db1, "stopSupplyLogs"));
        batch.set(logRef, logData);
        
        // 3. Commit the Firestore changes
        await batch.commit();
        
        // 4. Send email notification if dealer email exists
        if (dealer.email && smtpConfigured && transporter) {
            const mailOptions = {
                from: `"Supermoney Platform" <${process.env.SMTP_USER}>`,
                to: dealer.email,
                subject: `Important: Your Supply from ${session.userName} has been stopped`,
                html: generateEmailBody(dealer.name, session.userName),
            };
             try {
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error("Failed to send 'Stop Supply' email:", emailError);
                // We don't return an error to the user here, as the primary actions (DB update, log) were successful.
                // This should be monitored via server logs.
            }
        } else if (!dealer.email) {
            console.warn(`Could not send 'Stop Supply' email to dealer ${dealer.name} (ID: ${dealer.id}) because no email address is on file.`);
        } else if (!smtpConfigured) {
            console.warn("Could not send 'Stop Supply' email because SMTP is not configured.");
        }


        return { message: `Supply for dealer ${dealer.name} has been stopped and logged.` };
    } catch (error) {
        console.error("Error stopping supply:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return { error: `Failed to stop supply: ${errorMessage}` };
    }
}
