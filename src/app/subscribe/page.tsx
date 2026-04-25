
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, BadgePercent, Building, ShieldCheck } from "lucide-react";

const premiumFeatures = [
    {
        icon: Building,
        title: "Comprehensive Dealer Onboarding",
        description: "A complete, state-driven workflow for bringing new dealers onto the platform, from lead creation to final activation. Manage every step including document collection, site visits, and credit approval with dedicated roles for your team."
    },
    {
        icon: ShieldCheck,
        title: "AI-Powered Risk Assessment",
        description: "Leverage the power of AI to generate on-demand risk scores and in-depth analysis for any dealer. Make informed credit decisions based on invoice history and payment behavior."
    },
    {
        icon: BadgePercent,
        title: "Streamlined Collections",
        description: "A dedicated dashboard for your collections team to track invoice repayments efficiently. Use AI-assistance to automatically extract invoice details and send repayment links to dealers, simplifying the entire collections process."
    },
];

export default function SubscribePage() {
    return (
        <>
            <PageHeader title="Subscribe to Premium Enterprise" />
            <div className="mt-4 flex justify-center">
                <Card className="w-full max-w-3xl shadow-lg">
                    <CardHeader className="text-center bg-muted/30 p-6 rounded-t-lg">
                        <CardTitle className="text-2xl font-bold text-primary">Unlock Your Full Growth Potential</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground pt-1">
                            Supercharge your supply chain with our premium enterprise solutions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div>
                            {premiumFeatures.map((feature, index) => (
                                <div key={index} className="flex items-start gap-6 py-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="!mt-10 text-center p-6 bg-secondary rounded-lg border">
                            <p className="text-sm font-medium text-muted-foreground">Special Introductory Offer</p>
                            <p className="text-3xl font-bold tracking-tight my-1">Contact Us for a Custom Plan</p>
                            <p className="text-xs text-muted-foreground">
                                We offer flexible, tailored plans that scale with your business needs.
                            </p>
                        </div>
                        
                        <Button size="lg" className="w-full text-base font-semibold" asChild>
                            <a href="mailto:nikhil@supermoney.in">
                                Contact Sales to Get Started
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
