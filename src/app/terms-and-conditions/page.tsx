
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
  return (
    <>
      <PageHeader title="Terms and Conditions" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Terms and Conditions of Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Last Updated:</strong> [Date]</p>
          
          <p>
            Please read these terms and conditions carefully before using Our Service.
          </p>

          <h3 className="font-semibold pt-4">1. Agreement to Terms</h3>
          <p>
            By using the Supermoney Anchor Platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
          </p>

          <h3 className="font-semibold pt-4">2. Accounts</h3>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service.
          </p>

          <h3 className="font-semibold pt-4">3. Termination</h3>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h3 className="font-semibold pt-4">4. Governing Law</h3>
          <p>
            These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
