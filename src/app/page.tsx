
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import SupermoneyLogo from "@/components/supermoney-logo";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const userEmails: Record<UserRole, string> = {
  manager: "sunita.sharma@example.com",
  cfo: "prakash.rao@example.com",
  supply_chain_head: "ankit.desai@example.com",
  salesperson: "rajesh.kumar@example.com",
  regional_manager: "priya.singh@example.com",
  hq_finance_manager: "vijay.sharma@example.com",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("manager");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    let landingPage = '/dashboard';
    if (role === 'cfo') {
      landingPage = '/cfo-dashboard';
    } else if (['salesperson', 'regional_manager', 'hq_finance_manager'].includes(role)) {
      landingPage = '/partner-onboarding';
    }
    router.push(landingPage);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,hsl(var(--primary)/0.1),transparent)]"></div>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
          <SupermoneyLogo className="mx-auto" />
          <CardDescription>Select a role to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">User Persona</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">AP/AR Manager (Sunita)</SelectItem>
                  <SelectItem value="cfo">CFO (Prakash)</SelectItem>
                  <SelectItem value="supply_chain_head">Supply Chain Head (Ankit)</SelectItem>
                  <SelectItem value="salesperson">Salesperson (Rajesh)</SelectItem>
                  <SelectItem value="regional_manager">Regional Manager (Priya)</SelectItem>
                  <SelectItem value="hq_finance_manager">HQ Finance Manager (Vijay)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="user@example.com" required value={userEmails[role]} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Button type="submit" className="w-full !mt-6" size="lg">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
