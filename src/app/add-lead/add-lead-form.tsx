
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
import { indianStates } from "@/lib/location-data";

const zones = ["North", "South", "East", "West", "Central"];
const products = ["Primary", "Secondary", "Cross-sell", "Anchor-led"];
const leadTypes = ["Fresh", "Warm", "Cold", "Re-engaged"];
const priorities = ["High", "Medium", "Low"];


const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  leadCategory: z.enum(["Dealer", "Vendor"], { required_error: "Lead Category is required." }),
  contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits."),
  email: z.string().email("Invalid email address."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  zone: z.string().min(1, "Zone is required."),
  anchorName: z.string().min(1, "Anchor name is required."),
  product: z.string().min(1, "Product is required."),
  leadSource: z.string().min(1, "Lead source is required."),
  leadType: z.string().min(1, "Lead type is required."),
  priority: z.string().min(1, "Priority is required."),
  dealValue: z.string().min(1, "Deal value is required."),
  lender: z.string().min(1, "Lender is required."),
  spoc: z.string().min(1, "SPOC is required."),
  remarks: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const defaultFormValues: LeadFormValues = {
    name: "",
    leadCategory: "Dealer",
    contactNumber: "",
    email: "",
    city: "",
    state: "",
    zone: "",
    anchorName: "",
    product: "",
    leadSource: "",
    leadType: "",
    priority: "",
    dealValue: "",
    lender: "",
    spoc: "",
    remarks: "",
};

const FormLabelWithAsterisk = ({ children }: { children: React.ReactNode }) => (
    <FormLabel>{children} <span className="text-destructive">*</span></FormLabel>
);

export default function AddLeadForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaultFormValues,
  });
  
  const selectedState = form.watch("state");
  const availableCities = React.useMemo(() => {
    return indianStates.find(s => s.name === selectedState)?.cities || [];
  }, [selectedState]);
  
  React.useEffect(() => {
      form.setValue("city", "");
  }, [selectedState, form]);

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
        form.reset(defaultFormValues);
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
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Name</FormLabelWithAsterisk><FormControl><Input placeholder="e.g., Prime Auto" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="leadCategory" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Lead Category</FormLabelWithAsterisk>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Dealer">Dealer</SelectItem><SelectItem value="Vendor">Vendor</SelectItem></SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="spoc" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>SPOC</FormLabelWithAsterisk><FormControl><Input placeholder="Single Point of Contact" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="contactNumber" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Contact Number</FormLabelWithAsterisk><FormControl><Input type="tel" placeholder="e.g., 9876543210" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Email</FormLabelWithAsterisk><FormControl><Input type="email" placeholder="e.g., contact@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>State</FormLabelWithAsterisk>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl>
                        <SelectContent>{indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>City</FormLabelWithAsterisk>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger></FormControl>
                        <SelectContent>{availableCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )}/>
             <FormField control={form.control} name="zone" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Zone</FormLabelWithAsterisk>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a zone" /></SelectTrigger></FormControl>
                        <SelectContent>{zones.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="dealValue" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Deal Value (Lacs)</FormLabelWithAsterisk><FormControl><Input type="number" placeholder="e.g., 5.5" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="lender" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Lender</FormLabelWithAsterisk><FormControl><Input placeholder="e.g., HDFC Bank" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="anchorName" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Anchor Name</FormLabelWithAsterisk><FormControl><Input placeholder="e.g., Reliance Retail" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="product" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Product</FormLabelWithAsterisk>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger></FormControl>
                        <SelectContent>{products.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="leadSource" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Lead Source</FormLabelWithAsterisk><FormControl><Input placeholder="e.g., Connector" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="leadType" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Lead Type</FormLabelWithAsterisk>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a lead type" /></SelectTrigger></FormControl>
                        <SelectContent>{leadTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem><FormLabelWithAsterisk>Priority</FormLabelWithAsterisk>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a priority" /></SelectTrigger></FormControl>
                        <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                </FormItem>
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
