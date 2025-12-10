"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDailyReports = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const json2csv_1 = require("json2csv");
// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_APP_PASSWORD,
    },
});
// Function to get all active users
const getActiveUsers = async () => {
    const usersSnapshot = await db.collection("users").where("roleType", "==", "Anchor").get();
    if (usersSnapshot.empty) {
        console.log("No active anchor users found.");
        return [];
    }
    return usersSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
};
// Function to get dealer data for a specific anchor
const getDealerDataForAnchor = async (anchorId) => {
    const dealersSnapshot = await db.collection("dealers").where("anchorId", "==", anchorId).get();
    if (dealersSnapshot.empty) {
        return [];
    }
    const dealers = dealersSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
    // Fetch limits for these dealers
    const dealerIds = dealers.map(d => d.id);
    if (dealerIds.length === 0) {
        return [];
    }
    const limitsSnapshot = await db.collection("dealerLimits").where(admin.firestore.FieldPath.documentId(), 'in', dealerIds).get();
    const limitsMap = new Map(limitsSnapshot.docs.map(doc => [doc.id, doc.data()]));
    return dealers.map(dealer => {
        const limit = limitsMap.get(dealer.id);
        return Object.assign(Object.assign({}, dealer), { overdueAmount: (limit === null || limit === void 0 ? void 0 : limit.principalOverdue) || 0 });
    });
};
// Function to generate email body
const generateEmailBody = (userName, overdueAmount, overdueCount) => {
    const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(overdueAmount);
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Supermoney Daily Summary</h2>
      <p>Hello ${userName},</p>
      <p>Here is your daily summary from the Supermoney Anchor Platform.</p>
      <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Overdue Summary</h3>
        <p>Total overdue amount: <strong>${formattedAmount}</strong></p>
        <p>Number of dealers with overdue payments: <strong>${overdueCount}</strong></p>
      </div>
      <p>For more details, please visit your dashboard:</p>
      <a href="https://anchor.supermoney.in" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      <p style="margin-top: 30px;">Thank you,</p>
      <p><strong>The Supermoney Team</strong></p>
    </div>
  `;
};
// Main function to be triggered by Cloud Scheduler
exports.sendDailyReports = functions.https.onRequest(async (req, res) => {
    try {
        const users = await getActiveUsers();
        for (const user of users) {
            if (!user.emailAddress) {
                console.log(`User ${user.userName} has no email address, skipping.`);
                continue;
            }
            const dealers = await getDealerDataForAnchor(user.externalId);
            const overdueDealers = dealers.filter((d) => d.overdueAmount > 0);
            const totalOverdueAmount = overdueDealers.reduce((sum, d) => sum + d.overdueAmount, 0);
            const logData = {
                userId: user.id,
                userName: user.userName,
                email: user.emailAddress,
                sentAt: new Date(),
            };
            try {
                // Generate CSV
                const csvFields = ["dealerName", "overdueAmount", "status"];
                const json2csvParser = new json2csv_1.Parser({ fields: csvFields });
                const csv = json2csvParser.parse(overdueDealers);
                // Setup email data
                const mailOptions = {
                    from: `"Supermoney" <${process.env.EMAIL_SERVER_USER}>`,
                    to: user.emailAddress,
                    subject: "Supermoney Daily Dashboard Summary & Dealer Report",
                    html: generateEmailBody(user.userName, totalOverdueAmount, overdueDealers.length),
                    attachments: [
                        {
                            filename: `Daily_Overdue_Report_${new Date().toISOString().split('T')[0]}.csv`,
                            content: csv,
                            contentType: 'text/csv'
                        },
                    ],
                };
                await transporter.sendMail(mailOptions);
                console.log(`Email sent successfully to ${user.emailAddress}`);
                logData.status = 'Success';
            }
            catch (emailError) {
                console.error(`Failed to send email to ${user.emailAddress}:`, emailError);
                logData.status = 'Failure';
                logData.error = emailError.message;
            }
            await db.collection("email_logs").add(logData);
        }
        res.status(200).send("Daily reports process completed successfully.");
    }
    catch (error) {
        console.error("Error in sendDailyReports function:", error);
        res.status(500).send("An internal error occurred.");
    }
});
//# sourceMappingURL=index.js.map