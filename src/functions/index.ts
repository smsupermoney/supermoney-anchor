
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { Parser } from "json2csv";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
db.settings({ databaseId: "live" });

// Nodemailer transporter setup, configured inside the function
// to use environment variables populated from secrets.
let transporter: nodemailer.Transporter;

// Function to get all active users
const getActiveUsers = async () => {
  const usersSnapshot = await db.collection("users").where("roleType", "==", "Anchor").get();
  if (usersSnapshot.empty) {
    console.log("No active anchor users found.");
    return [];
  }
  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));
};

// Function to get dealer data for a specific anchor
const getDealerDataForAnchor = async (anchorId: string) => {
  const dealersSnapshot = await db.collection("dealers").where("anchorId", "==", anchorId).get();
  if (dealersSnapshot.empty) {
    return [];
  }
  const dealers = dealersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));
  
  // Fetch limits for these dealers
  const dealerIds = dealers.map(d => d.id);
  if (dealerIds.length === 0) {
      return [];
  }

  // Chunking logic to handle Firestore's 30-item limit for 'in' queries
  const CHUNK_SIZE = 30;
  const dealerIdChunks = [];
  for (let i = 0; i < dealerIds.length; i += CHUNK_SIZE) {
      dealerIdChunks.push(dealerIds.slice(i, i + CHUNK_SIZE));
  }

  const allLimits: admin.firestore.DocumentData[] = [];
  for (const chunk of dealerIdChunks) {
      const limitsSnapshot = await db.collection("dealerLimits").where(admin.firestore.FieldPath.documentId(), 'in', chunk).get();
      limitsSnapshot.forEach(doc => {
          allLimits.push({ id: doc.id, ...doc.data() });
      });
  }

  const limitsMap = new Map(allLimits.map(doc => [doc.id, doc]));

  return dealers.map(dealer => {
      const limit = limitsMap.get(dealer.id);
      return {
          ...dealer,
          overdueAmount: limit?.principalOverdue || 0,
      };
  });
};

// Function to generate email body
const generateEmailBody = (userName: string, overdueAmount: number, overdueCount: number) => {
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
// The .runWith() method configures the function's runtime options, including secrets.
export const sendDailyReports = functions
  .runWith({
    secrets: ["SMTP_USER", "SMTP_PASS"],
  })
  .https.onRequest(async (req, res) => {
    // Initialize transporter inside the function to access secrets
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

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

        const logData: any = {
            userId: user.id,
            userName: user.userName,
            email: user.emailAddress,
            sentAt: new Date(),
        };

        try {
            // Generate CSV
            const csvFields = ["dealerName", "overdueAmount", "status"];
            const json2csvParser = new Parser({ fields: csvFields });
            const csv = json2csvParser.parse(overdueDealers);
            
            // Setup email data
            const mailOptions: nodemailer.SendMailOptions = {
            from: `"Supermoney" <${process.env.SMTP_USER}>`,
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

        } catch (emailError) {
            console.error(`Failed to send email to ${user.emailAddress}:`, emailError);
            logData.status = 'Failure';
            logData.error = (emailError as Error).message;
        }

        await db.collection("email_logs").add(logData);
        }
        
        res.status(200).send("Daily reports process completed successfully.");

    } catch (error) {
        console.error("Error in sendDailyReports function:", error);
        res.status(500).send("An internal error occurred.");
    }
});
