
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Privacy Policy for Supermoney Anchor Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Last Updated:</strong> [Date]</p>
          
          <p>
            Welcome to the Supermoney Anchor Platform ("us", "we", or "our"). We operate the Supermoney Anchor Platform website and mobile application (the "Service").
          </p>
          
          <p>
            This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data. We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>

          <h3 className="font-semibold pt-4">1. Information Collection and Use</h3>
          <p>
            We collect several different types of information for various purposes to provide and improve our Service to you. This may include, but is not limited to, your name, email address, phone number, and financial information related to invoices and transactions.
          </p>

          <h3 className="font-semibold pt-4">2. Use of Data</h3>
          <p>
            We use the collected data for various purposes: to provide and maintain the Service; to notify you about changes to our Service; to allow you to participate in interactive features of our Service when you choose to do so; to provide customer care and support; to provide analysis or valuable information so that we can improve the Service; to monitor the usage of the Service; to detect, prevent and address technical issues.
          </p>

          <h3 className="font-semibold pt-4">3. Security of Data</h3>
          <p>
            The security of your data is important to us but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>

           <h3 className="font-semibold pt-4">4. Changes to This Privacy Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
