
import { LayoutDashboard, Users, FileText, PlusCircle, Library, ShieldCheck, Link2, UserPlus, Settings, FileBarChart, HandCoins, Building, CheckSquare, Eye, MapPin, BadgePercent, UserCheck } from 'lucide-react';
import type { UserSubRole } from '@/types';

export const anchorNavigationLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/programs', label: 'Programs', icon: Library },
  { href: '/retailers', label: 'Dealers', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/leads', label: 'Leads', icon: PlusCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const enterpriseAnchorNavigationLinks = [
    ...anchorNavigationLinks,
];

export const adminNavigationLinks = [
  { href: '/add-program', label: 'Add Program', icon: PlusCircle },
  { href: '/add-dealer', label: 'Add Dealer', icon: PlusCircle },
  { href: '/add-dealer-limit', label: 'Add Dealer Limit', icon: Link2 },
  { href: '/add-invoice', label: 'Add Invoice', icon: PlusCircle },
  { href: '/add-anchor', label: 'Add User', icon: UserPlus },
  { href: '/add-lead', label: 'Add Lead', icon: PlusCircle },
  { href: '/programs', label: 'View Programs', icon: Library },
  { href: '/retailers', label: 'View Dealers', icon: Users },
  { href: '/invoices', label: 'View Invoices', icon: FileText },
  { href: '/leads', label: 'View Leads', icon: FileText },
  { href: '/view-users', label: 'View Users', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

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
];
