
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DisclaimerPage() {
  return (
    <>
      <PageHeader title="Disclaimer" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Platform Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Last Updated:</strong> [Date]</p>
          
          <p>
            The information provided by the Supermoney Anchor Platform ("we," "us," or "our") on our website and mobile application is for general informational purposes only. All information on the site and our mobile application is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site or our mobile application.
          </p>

          <h3 className="font-semibold pt-4">Financial Disclaimer</h3>
          <p>
            The Service cannot and does not contain financial advice. The financial information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. We do not provide any kind of financial advice.
          </p>

          <h3 className="font-semibold pt-4">External Links Disclaimer</h3>
          <p>
            The Service may contain (or you may be sent through the site or our mobile application) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
