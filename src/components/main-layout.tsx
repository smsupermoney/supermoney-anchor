
"use client";

import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger, SidebarSeparator } from '@/components/ui/sidebar';
import { adminNavigationLinks, superMoneyUserNavigationLinks, enterpriseAnchorNavigationLinks, dealerOnboardingNavigationLinks } from '@/components/nav';
import Link from 'next/link';
import { Crown, LogOut, UserX } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CompanyLogo from './company-logo';
import { logout } from '@/app/auth/actions';
import { useAuth } from '@/context/auth-context';
import SupermoneyLogo from './supermoney-logo';
import { clearImpersonation } from '@/app/select-anchor/actions';
import { Button } from './ui/button';


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
  const isSelectAnchorPage = pathname === '/select-anchor';
  const isLegalPage = ['/privacy-policy', '/disclaimer', '/terms-and-conditions', '/api/upcoming-payments'].includes(pathname);


  if (isLoginPage || isSelectAnchorPage || (isSubscribePage && !user) || (isLegalPage && !user)) {
    return <>{children}</>;
  }


  if (!user) {
    // This handles the redirect case where there's no user, so we show the login page.
    return <>{children}</>;
  }

  const getVisibleLinks = () => {
    if (user.originalUser) {
        // If impersonating, always show anchor links
        return enterpriseAnchorNavigationLinks;
    }
    if (user.roleType === 'Admin') {
      return adminNavigationLinks;
    }
    if (user.roleType === 'SuperMoney User') {
      return superMoneyUserNavigationLinks;
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

  const getInitials = (name: string) => {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    <SidebarProvider>
      <Sidebar variant="sidebar">
        <SidebarHeader>
          <div className="p-2 flex justify-center">
            <CompanyLogo url={user.logoImage}/>
          </div>
          <SidebarSeparator className="my-2" />
          <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(user.userName)}</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden min-w-0">
              <p className="text-sm font-medium leading-none text-sidebar-foreground truncate">{user.userName}</p>
              <p className="text-xs leading-none text-sidebar-foreground/70 truncate">
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
            {user?.userSubRole === 'Not Subscribed' && !user.originalUser && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Subscribe to Premium' }} isActive={pathname === '/subscribe'}>
                  <Link href="/subscribe">
                    <Crown />
                    <span>Subscribe to Premium</span>
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
        {user?.originalUser && (
            <div className="bg-yellow-100 border-b-2 border-yellow-300 text-yellow-900 text-sm text-center p-2 flex items-center justify-center gap-4 sticky top-0 z-20">
                <p>Viewing as <strong>{user.userName}</strong>.</p>
                <form action={clearImpersonation}>
                    <Button variant="ghost" size="sm" className="h-auto p-1 text-yellow-900 hover:bg-yellow-200">
                        <UserX className="mr-2 h-4 w-4" /> Exit View
                    </Button>
                </form>
            </div>
        )}
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
                      <a href="https://www.supermoney.in/PrivacyPolicies.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
                      <Link href="/disclaimer" className="text-primary hover:underline">Disclaimer</Link>
                      <a href="https://www.supermoney.in/Terms&Conditions.htm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms and Conditions</a>
                  </div>
                  <SupermoneyLogo />
              </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
