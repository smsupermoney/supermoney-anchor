
"use server";

import nodemailer from "nodemailer";
import { getSession } from "@/lib/session";

type EmailData = {
    query: string;
};

type ActionResult = {
    message?: string;
    error?: string;
};

// Basic validation for environment variables
const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT);

const transporter = smtpConfigured ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
}) : null;

function generateEmailBody(query: string, userName: string, userEmail: string): string {
    return `
        <h1>New User Query</h1>
        <p>A new query has been submitted from the Anchor Platform dashboard.</p>
        <hr />
        <h2>User Details</h2>
        <ul>
            <li><strong>Name:</strong> ${userName}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
        </ul>
        <h2>User's Query</h2>
        <p style="padding: 12px; border: 1px solid #eee; background: #f9f9f9; border-radius: 4px;">
            ${query.replace(/\n/g, '<br>')}
        </p>
        <br />
        <p>Please address this query at your earliest convenience.</p>
    `;
}

export async function sendQueryEmail(data: EmailData): Promise<ActionResult> {
    const session = await getSession();

    if (!session) {
        return { error: "Authentication failed. Please log in again." };
    }
    
    if (!smtpConfigured || !transporter) {
        console.error("SMTP environment variables are not configured.");
        return { error: "Email service is not configured on the server. Please contact the administrator." };
    }

    const mailOptions = {
        from: `"Supermoney Platform" <noreply@supermoney.in>`,
        to: "ashwathi@supermoney.in, nitin.chorge@supermoney.in",
        subject: `New Query from Anchor Platform User: ${session.userName}`,
        html: generateEmailBody(data.query, session.userName, session.emailAddress),
    };

    try {
        await transporter.sendMail(mailOptions);
        return { message: "Your query has been sent successfully." };
    } catch (error) {
        console.error("Failed to send email:", error);
        if (error instanceof Error) {
            return { error: `Failed to send email: ${error.message}` };
        }
        return { error: "An unknown error occurred while sending the email." };
    }
}
