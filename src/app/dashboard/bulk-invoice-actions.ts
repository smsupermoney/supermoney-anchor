
"use server";

import nodemailer from "nodemailer";
import * as xlsx from 'xlsx';
import { getSession } from "@/lib/session";

type ActionResult = {
  message?: string;
  error?: string;
};

type ExcelInvoice = {
    'Invoice Number': string;
    'Dealer Name': string;
    'Invoice Amount': number;
    'Disburse Amount': number;
    'Invoice Date': string | number;
    'Due Date': string | number;
};

// Basic validation for environment variables
const smtpConfigured = !!(process.env.SMTP_HOST || "smtp-relay.gmail.com");

const transporter = smtpConfigured ? nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
}) : null;

const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return "N/A";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
};

const formatDate = (dateValue: string | number) => {
    if (typeof dateValue === 'number') {
        // Handle Excel date serial number
        const date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
        return date.toLocaleDateString('en-IN');
    }
    return dateValue;
};


function generateEmailBody(data: ExcelInvoice[], fileName: string, anchorName: string): string {
    let html = `
        <h1>Bulk Invoice Submission</h1>
        <p>A new set of invoices has been submitted by <strong>${anchorName}</strong> via bulk upload from the file: <strong>${fileName}</strong></p>
        <hr />
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th>Invoice Number</th>
                    <th>Dealer Name</th>
                    <th>Invoice Amount</th>
                    <th>Disburse Amount</th>
                    <th>Invoice Date</th>
                    <th>Due Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(item => {
        html += `
            <tr>
                <td>${item['Invoice Number'] || 'N/A'}</td>
                <td>${item['Dealer Name'] || 'N/A'}</td>
                <td>${formatCurrency(item['Invoice Amount'])}</td>
                <td>${formatCurrency(item['Disburse Amount'])}</td>
                <td>${formatDate(item['Invoice Date'])}</td>
                <td>${formatDate(item['Due Date'])}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <br />
        <p>Please review these submissions in the platform.</p>
        <p>Thank you.</p>
    `;
    return html;
}

export async function sendBulkInvoiceEmail(formData: FormData): Promise<ActionResult> {
  const file = formData.get('excel-file') as File;
  if (!file) {
    return { error: "No file uploaded." };
  }

  if (!smtpConfigured || !transporter) {
    console.error("SMTP environment variables are not configured.");
    return { error: "Email service is not configured on the server. Please contact the administrator." };
  }
  
  const session = await getSession();
  if (!session) {
      return { error: "Authentication failed. Please log in again." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const dataArray = xlsx.utils.sheet_to_json(sheet) as ExcelInvoice[];

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return { error: "The Excel file is empty or not in the correct format." };
    }

    const mailOptions = {
      from: `"Supermoney Platform" <noreply@supermoney.in>`,
      to: "ashwathi@supermoney.in, nitin.chorge@supermoney.in ",
      subject: `Bulk Invoice Submission from ${session.userName} (${file.name})`,
      html: generateEmailBody(dataArray, file.name, session.userName),
    };

    await transporter.sendMail(mailOptions);
    return { message: `${dataArray.length} invoices from ${file.name} have been submitted successfully.` };

  } catch (error) {
    console.error("Error processing Excel file or sending email:", error);
    if (error instanceof Error) {
        return { error: `Failed to process file: ${error.message}` };
    }
    return { error: "An unknown error occurred during the upload process." };
  }
}
