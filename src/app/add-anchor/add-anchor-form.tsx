
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
import { addUser } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole, UserSubRole } from "@/types";

const allUserSubRoles: UserSubRole[] = [
    "Not Subscribed", "sales_person", "sales_manager", "onboarding_ops",
    "field_inspector", "legal_compliance", "regional_manager", "dealer_admin"
];


const formSchema = z.object({
  externalId: z.string().min(1, "External ID is required."),
  userName: z.string().min(1, "User name is required."),
  emailAddress: z.string().email("Invalid email address."),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  roleType: z.enum(["Anchor", "SuperMoney User"]),
  userSubRole: z.string().optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

export default function AddUserForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      externalId: "",
      userName: "",
      emailAddress: "",
      phoneNumber: "",
      password: "",
      roleType: "Anchor",
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await addUser(values);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>User Name / Company Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Stark Industries" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="externalId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>External ID</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., ANC001" {...field} />
                </FormControl>
                <FormDescription>A unique identifier for this user (e.g., Anchor ID, Dealer ID).</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="contact@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input type="tel" placeholder="9876543210" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="roleType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Anchor">Anchor</SelectItem>
                        <SelectItem value="SuperMoney User">SuperMoney User</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="userSubRole"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Sub Role (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a sub role" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                         {allUserSubRoles.map(subRole => (
                            <SelectItem key={subRole} value={subRole}>
                                {subRole}
                            </SelectItem>
                         ))}
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
            {isSubmitting ? "Adding..." : "Add User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
