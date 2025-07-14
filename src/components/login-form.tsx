
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SupermoneyLogo from '@/components/supermoney-logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full !mt-6"
      size="lg"
      aria-disabled={pending}
    >
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

export default function LoginForm() {
  const [errorMessage, formAction] = useActionState(authenticate, undefined);

  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <CardHeader className="text-center space-y-4 pt-8">
        <SupermoneyLogo className="mx-auto" />
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="supplier@example.com"
              required
              defaultValue="anchor@supermoney.in"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="password"
            />
          </div>
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <LoginButton />
        </form>
      </CardContent>
    </Card>
  );
}
