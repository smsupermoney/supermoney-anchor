"use client";

import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import Header from './header';
import { navigationLinks } from './nav';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMounted = useMounted();

  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-2xl font-bold text-primary pl-2 group-data-[collapsible=icon]:hidden">Anchor Dashboard</h2>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navigationLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isMounted ? pathname.startsWith(link.href) : false}
                  tooltip={{ children: link.label }}
                >
                  <Link href={link.href}>
                    <link.icon />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuButton asChild tooltip={{ children: 'Logout' }}>
            <Link href="/">
              <LogOut />
              <span>Logout</span>
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 min-w-0">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
