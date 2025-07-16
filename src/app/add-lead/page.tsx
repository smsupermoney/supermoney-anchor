"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addLead } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  dealerName: z.string().min(1, "Dealer name is required."),
  contactPerson: z.string().min(1, "Contact person is required."),
  contactEmail: z.string().email("Invalid email address."),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits."),
  businessType: z.string().min(1, "Business type is required."),
  location: z.string().min(1, "Location is required."),
  region: z.string().min(1, "Region is required."),
});

type LeadFormValues = z.infer<typeof formSchema>;

export default function AddLeadPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealerName: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      businessType: "",
      location: "",
      region: "",
    },
  });

  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await addLead(values);
      if (result.error) {
        setError(result.error);
      } else {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset();
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Add New Lead">
        <Button asChild variant="outline" size="sm">
          <Link href="/onboarding-dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </PageHeader>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Lead Details</CardTitle>
          <CardDescription>Enter the information for a new dealer lead.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dealerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dealer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., NextGen Retail" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g., 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Electronics Retail" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mumbai, MH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="North">North</SelectItem>
                          <SelectItem value="South">South</SelectItem>
                          <SelectItem value="East">East</SelectItem>
                          <SelectItem value="West">West</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Lead"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
