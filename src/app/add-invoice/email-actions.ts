
"use server";

import nodemailer from "nodemailer";
import { type ExtractInvoiceDataOutput } from "@/ai/flows/extract-invoice-data-flow";

type EmailData = {
    fileName: string;
    extractedData?: ExtractInvoiceDataOutput;
    disburseAmount?: number;
    error?: string;
    fileContent?: string; // Base64 data URI
    applicationId?: string;
    customerId?: string;
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

const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return "N/A";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
};

function generateEmailBody(data: EmailData[]): string {
    let html = `
        <h1>New Invoice Submission</h1>
        <p>Please find the details of the newly submitted invoice(s) below:</p>
        <hr />
    `;

    data.forEach((item, index) => {
        const now = new Date();
        const date = now.toISOString().split('T')[0] || 'Not Detected';

        const pad = (num: any) => String(num).padStart(2, '0');
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        html += `
            <h2>Document ${index + 1}: ${item.fileName}</h2>
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        `;
        if (item.extractedData) {
            html += `
                <tr><td style="width: 30%;"><strong>Dealer Name</strong></td><td>${item.extractedData.dealerName || 'Not Detected'}</td></tr>
                <tr><td style="width: 30%;"><strong>Application ID</strong></td><td>${item.applicationId || 'Not Found'}</td></tr>
                <tr><td style="width: 30%;"><strong>Customer ID</strong></td><td>${item.customerId || 'Not Found'}</td></tr>
                <tr><td><strong>Document Type</strong></td><td>${item.extractedData.documentType || 'Not Detected'}</td></tr>
                <tr><td><strong>Invoice Amount</strong></td><td>${formatCurrency(item.extractedData.amount)}</td></tr>
                <tr><td><strong>Disburse Amount</strong></td><td>${formatCurrency(item.disburseAmount)}</td></tr>
                <tr><td><strong>Consent Received</strong></td><td>${date}, ${time}</td></tr>
            `;
        } else if (item.error) {
            html += `<tr><td style="width: 30%;"><strong>Error</strong></td><td style="color: red;">${item.error}</td></tr>`;
        } else {
            html += `<tr><td style="width: 30%;"><strong>Status</strong></td><td>Data could not be extracted.</td></tr>`;
        }
        html += `</table><br />`;
    });

    html += "<p>Thank you.</p>";
    return html;
}

export async function sendInvoiceEmail(data: EmailData[]): Promise<ActionResult> {
    if (!smtpConfigured || !transporter) {
        console.error("SMTP environment variables are not configured.");
        return { error: "Email service is not configured on the server. Please contact the administrator." };
    }

    const attachments = data
        .filter(item => item.fileContent)
        .map(item => ({
            filename: item.fileName,
            path: item.fileContent,
        }));

    const mailOptions = {
        from: `"Supermoney Platform" <${process.env.SMTP_USER}>`,
        to: "invoice@supermoney.in",
        subject: "New Invoice Submission",
        html: generateEmailBody(data),
        attachments: attachments,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { message: "Email sent successfully." };
    } catch (error) {
        console.error("Failed to send email:", error);
        if (error instanceof Error) {
            return { error: `Failed to send email: ${error.message}` };
        }
        return { error: "An unknown error occurred while sending the email." };
    }
}
