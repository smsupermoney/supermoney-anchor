
"use client";

import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { adminNavigationLinks, anchorNavigationLinks } from './nav';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import SupermoneyLogo from './supermoney-logo';
import { logout } from '@/app/auth/actions';
import type { User } from '@/types';


export default function MainLayout({ children, user }: { children: React.ReactNode, user: User | null }) {
  const pathname = usePathname();
  const isMounted = useMounted();

  const navigationLinks = user?.roleType === 'Admin' ? adminNavigationLinks : anchorNavigationLinks;
  
  if (!isMounted) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="hidden md:block w-[16rem] h-screen" />
        <div className="flex-1" />
      </div>
    )
  }

  if (pathname === '/') {
    return <>{children}</>;
  }

  if (!user) {
    // This could be a loading state or a redirect to login
     return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2 flex justify-center">
            <SupermoneyLogo className="group-data-[collapsible=icon]:hidden" />
          </div>
          <Separator className="my-2" />
          <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User Avatar" />
              <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium leading-none text-sidebar-foreground">{user.userName}</p>
              <p className="text-xs leading-none text-sidebar-foreground/70">
                {user.emailAddress}
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            {navigationLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(link.href)}
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
          <form action={logout}>
            <SidebarMenuButton asChild tooltip={{ children: 'Logout' }} type="submit" className='w-full'>
              <button>
                <LogOut />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-start gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:hidden">
          <SidebarTrigger />
        </header>
        <main className="flex flex-1 flex-col min-w-0">
          <div className="flex-1 p-4">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
