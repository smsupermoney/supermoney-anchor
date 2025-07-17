
"use client";

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user, loading } = useAuth();

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <>
      <div className="flex justify-between items-center py-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-right">{value}</span>
      </div>
      <Separator className="last:hidden" />
    </>
  );

  return (
    <>
      <PageHeader title="Settings" />
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>User Account</CardTitle>
            <CardDescription>
              Your personal and role information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-6">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ) : user ? (
              <div className="space-y-1">
                <InfoRow label="User Name / Company" value={user.userName} />
                <InfoRow label="Email Address" value={user.emailAddress} />
                <InfoRow label="Phone Number" value={user.phoneNumber} />
                <InfoRow label="Role" value={<Badge variant={user.roleType === 'Admin' ? 'destructive' : 'default'}>{user.roleType}</Badge>} />
                {user.userSubRole && <InfoRow label="Sub Role" value={<Badge variant="secondary">{user.userSubRole}</Badge>} />}
                <InfoRow label="External/Anchor ID" value={<span className="font-mono text-xs">{user.externalId}</span>} />
              </div>
            ) : (
              <p>User not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
