
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { addLead } from "@/app/add-lead/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { spokeStatuses } from "@/lib/data";

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  spoc: z.string().min(1, "SPOC is required."),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  city: z.string().min(1, "City is required."),
  zone: z.string().min(1, "Zone is required."),
  state: z.string().min(1, "State is required."),
  anchorId: z.string(), // Anchor ID will be pre-filled, so no validation needed here.
  product: z.string().min(1, "Product is required."),
  leadSource: z.string().min(1, "Lead Source is required."),
  leadType: z.string().min(1, "Lead Type is required."),
  priority: z.string().optional(),
  dealValue: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("Deal value must be positive.")
  ),
  status: z.string().min(1, "Status is required."),
});

type LeadFormValues = z.infer<typeof formSchema>;

type AddLeadDialogProps = {
  children: React.ReactNode;
};

export default function AddLeadDialog({ children }: AddLeadDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      spoc: "",
      contactNumber: "",
      email: "",
      city: "",
      zone: "",
      state: "",
      product: "",
      leadSource: "",
      leadType: "Fresh",
      priority: "Medium",
      dealValue: 0,
      status: "New"
    },
  });
  
  React.useEffect(() => {
    if (user?.externalId) {
        form.setValue('anchorId', user.externalId);
    }
  }, [user, form]);


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
        setOpen(false);
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Enter the information for a new dealer lead.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
             <div className="grid md:grid-cols-3 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Name</FormLabel> <FormControl> <Input placeholder="e.g., Prime Auto" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="spoc" render={({ field }) => ( <FormItem> <FormLabel>SPOC</FormLabel> <FormControl> <Input placeholder="e.g., Ramesh Patel" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="contactNumber" render={({ field }) => ( <FormItem> <FormLabel>Contact Number</FormLabel> <FormControl> <Input type="tel" placeholder="9876543210" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl> <Input type="email" placeholder="contact@example.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl> <Input placeholder="e.g., Mumbai" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="state" render={({ field }) => ( <FormItem> <FormLabel>State</FormLabel> <FormControl> <Input placeholder="e.g., Maharashtra" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="zone" render={({ field }) => ( <FormItem> <FormLabel>Zone</FormLabel> <FormControl> <Input placeholder="e.g., West" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="product" render={({ field }) => ( <FormItem> <FormLabel>Product</FormLabel> <FormControl> <Input placeholder="e.g., Primary" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="leadSource" render={({ field }) => ( <FormItem> <FormLabel>Lead Source</FormLabel> <FormControl> <Input placeholder="e.g., Connector" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="leadType" render={({ field }) => ( <FormItem> <FormLabel>Lead Type</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select a lead type" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="Fresh">Fresh</SelectItem> <SelectItem value="Re-engaged">Re-engaged</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="priority" render={({ field }) => ( <FormItem> <FormLabel>Priority</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select priority" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="High">High</SelectItem> <SelectItem value="Medium">Medium</SelectItem> <SelectItem value="Low">Low</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select status" /> </SelectTrigger> </FormControl> <SelectContent> {spokeStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="dealValue" render={({ field }) => ( <FormItem> <FormLabel>Deal Value (in Lacs)</FormLabel> <FormControl> <Input type="number" step="0.1" placeholder="e.g., 0.5" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
             </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating...</> : "Create Lead"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

