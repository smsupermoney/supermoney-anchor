
"use server";

import nodemailer from "nodemailer";

type EmailData = {
    dealerName: string;
    dealerId: string;
    requiredLimit: string;
};

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

const formatCurrency = (amount: string) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return amount;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(numAmount);
};

function generateEmailBody(data: EmailData): string {
    return `
        <h1>Additional Limit Request</h1>
        <p>A new request for an additional credit limit has been submitted.</p>
        <hr />
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <tr><td style="width: 30%;"><strong>Dealer Name</strong></td><td>${data.dealerName}</td></tr>
            <tr><td><strong>Dealer ID</strong></td><td>${data.dealerId}</td></tr>
            <tr><td><strong>Requested Limit</strong></td><td>${formatCurrency(data.requiredLimit)}</td></tr>
        </table>
        <br />
        <p>Please review this request in the platform.</p>
    `;
}

export async function sendLimitRequestEmail(data: EmailData): Promise<ActionResult> {
    if (!smtpConfigured || !transporter) {
        console.error("SMTP environment variables are not configured.");
        return { error: "Email service is not configured on the server. Please contact the administrator." };
    }

    const mailOptions = {
        from: `"Supermoney Platform" <${process.env.SMTP_USER}>`,
        to: "ashwathi@supermoney.in",
        subject: `Limit Request for Dealer: ${data.dealerName}`,
        html: generateEmailBody(data),
    };

    try {
        await transporter.sendMail(mailOptions);
        return { message: "Limit request sent successfully." };
    } catch (error) {
        console.error("Failed to send email:", error);
        if (error instanceof Error) {
            return { error: `Failed to send email: ${error.message}` };
        }
        return { error: "An unknown error occurred while sending the email." };
    }
}
