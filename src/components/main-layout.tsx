
"use client";

import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger, SidebarSeparator } from '@/components/ui/sidebar';
import { adminNavigationLinks, enterpriseAnchorNavigationLinks, dealerOnboardingNavigationLinks } from './nav';
import Link from 'next/link';
import { Crown, LogOut } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SavexLogo from './savex-logo';
import { logout } from '@/app/auth/actions';
import { useAuth } from '@/context/auth-context';
import SupermoneyLogo from './supermoney-logo';


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMounted = useMounted();
  const { user, loading } = useAuth();

  if (!isMounted || loading) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="hidden md:block w-[16rem] h-screen" />
        <div className="flex-1" />
      </div>
    )
  }

  const isLoginPage = pathname === '/';
  const isSubscribePage = pathname === '/subscribe';

  if (isLoginPage || (isSubscribePage && !user)) {
    return <>{children}</>;
  }


  if (!user) {
    // This handles the redirect case where there's no user, so we show the login page.
    return <>{children}</>;
  }

  const getVisibleLinks = () => {
    if (user.roleType === 'Admin') {
      return adminNavigationLinks;
    }
    // For Anchor role, filter based on subRole if it exists
    return enterpriseAnchorNavigationLinks.filter(link =>
      !link.subRole || (user.userSubRole && link.subRole.includes(user.userSubRole))
    );
  };

  const navigationLinks = getVisibleLinks();

  const subscribedOnboardingLinks = dealerOnboardingNavigationLinks.filter(link =>
    user.userSubRole && link.subRole.includes(user.userSubRole)
  );


  return (
    <SidebarProvider>
      <Sidebar variant="sidebar">
        <SidebarHeader>
          <div className="p-2 flex justify-center">
            <SavexLogo className="group-data-[collapsible=icon]:hidden" />
          </div>
          <SidebarSeparator className="my-2" />
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
                  isActive={pathname === link.href}
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

          <SidebarSeparator className="my-2" />

          <SidebarMenu>
            {user?.userSubRole === 'Not Subscribed' && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Subscribe to premium' }} isActive={pathname === '/subscribe'}>
                  <Link href="/subscribe">
                    <Crown />
                    <span>Subscribe to premium</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {user?.userSubRole && user.userSubRole !== 'Not Subscribed' && subscribedOnboardingLinks.map((link) => (
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
        <div className="flex flex-col flex-1 min-w-0 min-h-screen">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-start gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:hidden">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4">
              {children}
          </main>
          <footer className="mt-auto border-t bg-background px-4 py-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      <a href="#" className="text-primary hover:underline">Disclaimer</a>
                      <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
                  </div>
                  <SupermoneyLogo />
              </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
