
"use server";

import nodemailer from "nodemailer";
import { type ExtractInvoiceDataOutput } from "@/ai/flows/extract-invoice-data-flow";
import { db1 } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import crypto from "crypto";

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

function generateEmailBody(data: EmailData[], isConsent: boolean): string {
    let html = `
        <h1>New Invoice Submission</h1>
        <p>Please find the details of the newly submitted invoice(s) below:</p>
        <hr />
    `;

    data.forEach((item, index) => {
        const now = new Date();
        const istDateTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

        const pad = (num: number) => String(num).padStart(2, '0');
        const date = `${istDateTime.getFullYear()}-${pad(istDateTime.getMonth() + 1)}-${pad(istDateTime.getDate())}`;
        const time = `${pad(istDateTime.getHours())}:${pad(istDateTime.getMinutes())}:${pad(istDateTime.getSeconds())}`;

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
                <tr><td><strong>Disburse Amount</strong></td><td>${formatCurrency(item.disburseAmount)}</td></tr>` + 
                `${isConsent ? `<tr><td><strong>Consent Received</strong></td><td>${date}, ${time}</td></tr>` : ''}`;     
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

function generateConsentEmailBody(item: EmailData, consentUrl: string): string {
    return `
        <h1>Invoice Consent Required</h1>
        <p>Hello,</p>
        <p>A new invoice has been submitted for your business. Please review the details below and provide your consent.</p>
        <hr />
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <tr><td style="width: 30%;"><strong>Invoice Number</strong></td><td>${item.extractedData?.invoiceNumber || 'N/A'}</td></tr>
            <tr><td><strong>Amount</strong></td><td>${formatCurrency(item.extractedData?.amount)}</td></tr>
            <tr><td><strong>Due Date</strong></td><td>${item.extractedData?.dueDate || 'N/A'}</td></tr>
        </table>
        <br />
        <p>To approve or reject this invoice, please click the button below:</p>
        <a href="${consentUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Provide Consent</a>
        <p>This link will expire in 48 hours.</p>
        <p>Thank you.</p>
    `;
}

export async function sendInvoiceEmail(data: EmailData[], isConsent: boolean): Promise<ActionResult> {
    if (!smtpConfigured || !transporter) {
        console.error("SMTP environment variables are not configured.");
        return { error: "Email service is not configured on the server. Please contact the administrator." };
    }

    // Check for ANC002 specialized workflow
    // We need to fetch dealer info to check anchorId
    for (const item of data) {
        if (item.applicationId) {
            const dealerSnap = await getDocs(query(collection(db1, "dealers"), where("applicationId", "==", item.applicationId)));
            if (!dealerSnap.empty) {
                const dealerData = dealerSnap.docs[0].data();
                if (dealerData.anchorId === 'ANC002') {
                    // Trigger specialized consent workflow
                    const token = crypto.randomBytes(32).toString('hex');
                    const expiry = new Date();
                    expiry.setHours(expiry.getHours() + 48);

                    const consentRef = doc(collection(db1, "invoiceConsents"));
                    await setDoc(consentRef, {
                        invoiceNumber: item.extractedData?.invoiceNumber || 'N/A',
                        dealerId: item.applicationId,
                        token: token,
                        status: 'Pending',
                        expiryTime: expiry.toISOString(),
                        createdAt: new Date().toISOString(),
                        amount: item.extractedData?.amount || 0,
                        dueDate: item.extractedData?.dueDate || 'N/A'
                    });

                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
                    const consentUrl = `${baseUrl}/consent?token=${token}`;

                    const mailOptions = {
                        from: `"Supermoney Platform" <${process.env.SMTP_USER}>`,
                        to: dealerData.emailAddress || dealerData.branchEmailId,
                        subject: `Consent Required: Invoice ${item.extractedData?.invoiceNumber}`,
                        html: generateConsentEmailBody(item, consentUrl),
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                    } catch (e) {
                        console.error("Failed to send consent email:", e);
                    }
                    
                    // After triggering consent email, we don't send the internal notification for this item yet.
                    continue;
                }
            }
        }

        // Default logic for other anchors
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
            html: generateEmailBody(data, isConsent),
            attachments: attachments,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Failed to send email:", error);
            if (error instanceof Error) {
                return { error: `Failed to send email: ${error.message}` };
            }
            return { error: "An unknown error occurred while sending the email." };
        }
    }

    return { message: "Process initiated successfully." };
}
