
import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import MainLayout from '@/components/main-layout';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import type { User } from '@/types';

export const metadata: Metadata = {
  title: 'Anchor Dashboard',
  description: 'A supply chain financing platform.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore();
  const session = await getIronSession<User>(cookies(), sessionOptions);
  const user = session.id ? {
    id: session.id,
    userName: session.userName,
    roleType: session.roleType,
    emailAddress: session.emailAddress,
    externalId: session.externalId,
  } as User : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <MainLayout user={user}>
          {children}
        </MainLayout>
        <Toaster />
      </body>
    </html>
  );
}
