
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addSingleLead } from "./actions";

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  leadCategory: z.enum(["Dealer", "Vendor"], { required_error: "Lead Category is required."}),
  contactNumber: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  city: z.string().optional(),
  state: z.string().optional(),
  zone: z.string().optional(),
  anchorName: z.string().optional(),
  product: z.string().optional(),
  leadSource: z.string().optional(),
  leadType: z.string().optional(),
  priority: z.string().optional(),
  leadDate: z.string().optional(),
  status: z.string().min(1, "Status is required."),
  assignedTo: z.string().optional(),
  dealValue: z.string().optional(),
  lender: z.string().optional(),
  remarks: z.string().optional(),
  spoc: z.string().optional(),
  initialLeadTat: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export default function AddLeadForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      status: "New",
    },
  });

  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await addSingleLead(values);
      if (result.error) {
        setError(result.error);
      } else {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset({ name: "", status: "New"});
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Prime Auto" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="leadCategory"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Lead Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Dealer">Dealer</SelectItem>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Follow Up">Follow Up</SelectItem>
                             <SelectItem value="Onboarding">Onboarding</SelectItem>
                            <SelectItem value="Not Interested">Not Interested</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Disbursed">Disbursed</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField control={form.control} name="spoc" render={({ field }) => (
                <FormItem><FormLabel>SPOC</FormLabel><FormControl><Input placeholder="Single Point of Contact" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="contactNumber" render={({ field }) => (
                <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input type="tel" placeholder="e.g., 9876543210" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="e.g., contact@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g., Mumbai" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="e.g., Maharashtra" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="zone" render={({ field }) => (
                <FormItem><FormLabel>Zone</FormLabel><FormControl><Input placeholder="e.g., West" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="dealValue" render={({ field }) => (
                <FormItem><FormLabel>Deal Value (Lacs)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5.5" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="lender" render={({ field }) => (
                <FormItem><FormLabel>Lender</FormLabel><FormControl><Input placeholder="e.g., HDFC Bank" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="anchorName" render={({ field }) => (
                <FormItem><FormLabel>Anchor Name</FormLabel><FormControl><Input placeholder="e.g., Reliance Retail" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="product" render={({ field }) => (
                <FormItem><FormLabel>Product</FormLabel><FormControl><Input placeholder="e.g., Primary" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="leadSource" render={({ field }) => (
                <FormItem><FormLabel>Lead Source</FormLabel><FormControl><Input placeholder="e.g., Connector" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="leadType" render={({ field }) => (
                <FormItem><FormLabel>Lead Type</FormLabel><FormControl><Input placeholder="e.g., Fresh" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem><FormLabel>Priority</FormLabel><FormControl><Input placeholder="e.g., High" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="leadDate" render={({ field }) => (
                <FormItem><FormLabel>Lead Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="assignedTo" render={({ field }) => (
                <FormItem><FormLabel>Assigned To</FormLabel><FormControl><Input placeholder="e.g., user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="initialLeadTat" render={({ field }) => (
                <FormItem><FormLabel>Initial Lead TAT</FormLabel><FormControl><Input placeholder="e.g., 2" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any relevant notes or remarks here..."
                      {...field}
                    />
                  </FormControl>
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
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {isSubmitting ? "Adding Lead..." : "Add Lead"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
