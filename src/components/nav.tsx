import { LayoutDashboard, Users, FileText, PlusCircle, Library, ShieldCheck, Link2, UserPlus, Settings, FileBarChart, HandCoins, Building, CheckSquare, Eye, MapPin, BadgePercent, UserCheck, IndianRupee, FileUp, Globe, Map, CalendarClock, Mail } from 'lucide-react';
import type { UserSubRole } from '@/types';

export const anchorNavigationLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/programs', label: 'Programs', icon: Library },
  { href: '/retailers', label: 'Dealers', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/upcoming-payments', label: 'Upcoming Payments', icon: CalendarClock },
  { href: '/leads', label: 'Leads', icon: PlusCircle },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const enterpriseAnchorNavigationLinks = [
    ...anchorNavigationLinks,
];

export const adminNavigationLinks = [
  { href: '/add-program', label: 'Add Program', icon: PlusCircle },
  { href: '/add-dealer', label: 'Add Dealer', icon: PlusCircle },
  { href: '/add-invoice', label: 'Add Invoice', icon: PlusCircle },
  { href: '/add-dealer-limit', label: 'Add Upcoming Payments', icon: PlusCircle },
  { href: '/add-anchor', label: 'Add User', icon: UserPlus },
  { href: '/add-lead', label: 'Add Lead', icon: PlusCircle },
  { href: '/update-gst', label: 'Update Dealer GST', icon: FileUp },
  { href: '/update-region', label: 'Update Dealer Region', icon: Map },
  { href: '/update-email', label: 'Update Dealer Email', icon: Mail },
  { href: '/programs', label: 'View Programs', icon: Library },
  { href: '/retailers', label: 'View Dealers', icon: Users },
  { href: '/invoices', label: 'View Invoices', icon: FileText },
  { href: '/upcoming-payments', label: 'Upcoming Payments', icon: CalendarClock },
  { href: '/leads', label: 'View Leads', icon: FileText },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/view-users', label: 'View Users', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const superMoneyUserNavigationLinks = adminNavigationLinks.filter(
  link => ![
    '/add-anchor', 
    '/view-users'
  ].includes(link.href)
);

export const dealerOnboardingNavigationLinks: { href: string; label: string; icon: React.ElementType; subRole: UserSubRole[] }[] = [
  {
    href: '/onboarding-dashboard',
    label: 'Onboarding Dashboard',
    icon: LayoutDashboard,
    subRole: ['sales_person', 'sales_manager', 'onboarding_ops', 'field_inspector', 'legal_compliance', 'regional_manager', 'dealer_admin']
  },
  { 
    href: '/dealer-leads', 
    label: 'Dealer Leads', 
    icon: Building,
    subRole: ['sales_person', 'sales_manager', 'regional_manager'] 
  },
  { 
    href: '/dealer-documents', 
    label: 'Document Verification', 
    icon: CheckSquare,
    subRole: ['onboarding_ops', 'legal_compliance'] 
  },
  { 
    href: '/site-visits', 
    label: 'Site Visit Reports', 
    icon: MapPin,
    subRole: ['field_inspector', 'legal_compliance', 'regional_manager']
  },
  { 
    href: '/business-limit', 
    label: 'Business Limit Approval', 
    icon: BadgePercent,
    subRole: ['regional_manager']
  },
  { 
    href: '/dealer-activation', 
    label: 'Dealer Activation', 
    icon: UserCheck,
    subRole: ['dealer_admin']
  },
  {
    href: '/collection-dashboard',
    label: 'Collection Dashboard',
    icon: IndianRupee,
    subRole: ['onboarding_ops', 'field_inspector', 'legal_compliance', 'regional_manager', 'dealer_admin']
  }
];
