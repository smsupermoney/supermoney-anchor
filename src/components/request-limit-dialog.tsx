
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, IndianRupee, Loader2 } from "lucide-react";
import { Combobox } from "./ui/combobox";
import { sendLimitRequestEmail } from "@/app/dashboard/actions";
import type { Dealer } from "@/types";

const formSchema = z.object({
  dealerId: z.string().min(1, "Please select a dealer."),
  requiredLimit: z.string().min(1, "Please enter a required limit."),
});

type LimitFormValues = z.infer<typeof formSchema>;

type RequestLimitDialogProps = {
  children: React.ReactNode;
  dealers: Dealer[];
};

export default function RequestLimitDialog({ children, dealers }: RequestLimitDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<LimitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealerId: "",
      requiredLimit: "",
    },
  });

  const dealerOptions = dealers.map(d => ({ value: d.id, label: d.name }));

  const onSubmit = async (values: LimitFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
        const selectedDealer = dealers.find(d => d.id === values.dealerId);
        if (!selectedDealer) {
            setError("Selected dealer not found.");
            setIsSubmitting(false);
            return;
        }

      const result = await sendLimitRequestEmail({
          dealerId: selectedDealer.id,
          dealerName: selectedDealer.name,
          requiredLimit: values.requiredLimit,
      });

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Additional Limit</DialogTitle>
          <DialogDescription>Select a dealer and specify the desired limit amount.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="dealerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dealer</FormLabel>
                   <Combobox
                        options={dealerOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a dealer..."
                        searchPlaceholder="Search dealers..."
                        emptyMessage="No dealers found."
                        className="w-full"
                    />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requiredLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Limit</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="e.g., 500000" {...field} className="pl-9" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
