"use client";

import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import Header from './header';
import { navigationLinks } from './nav';
import Link from 'next/link';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-2xl font-bold text-primary pl-2 group-data-[collapsible=icon]:hidden">AnchorLink</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navigationLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(link.href)}
                    tooltip={{ children: link.label }}
                  >
                    <link.icon />
                    <span>{link.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Link href="/" legacyBehavior passHref>
            <SidebarMenuButton tooltip={{ children: 'Logout' }}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
