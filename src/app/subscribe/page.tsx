
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const features = [
    "End-to-end dealer onboarding workflow",
    "Role-based access for your entire team",
    "Centralized document management",
    "Real-time progress tracking and reporting",
    "Automated notifications and escalations",
    "Seamless integration with existing systems",
    "Track external lender dealers, Limits and Invoices",
    "External Dealer Payments tracking"
];

export default function SubscribePage() {
    return (
        <>
            <PageHeader title="Subscribe to Premium" />
            <div className="mt-4 flex justify-center">
                <Card className="w-full max-w-2xl shadow-lg">
                    <CardHeader className="text-center bg-muted/30 p-6 rounded-t-lg">
                        <CardTitle className="text-2xl font-bold text-primary">Unlock Your Growth Potential</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground pt-1">
                            Streamline your dealer network expansion with our premium enterprise solutions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <h3 className="text-md font-semibold mb-3">What you get:</h3>
                            <ul className="space-y-2">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-center p-4 bg-secondary rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Special Introductory Offer</p>
                            <p className="text-3xl font-bold tracking-tight my-1">Contact Us for Pricing</p>
                            <p className="text-xs text-muted-foreground">
                                We offer flexible plans tailored to your business needs.
                            </p>
                        </div>
                        <Button size="lg" className="w-full text-base">
                            Contact Sales to Get Started
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
