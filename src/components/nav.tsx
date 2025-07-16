
import { LayoutDashboard, Users, FileText, PlusCircle, Library, ShieldCheck, Link2, UserPlus, Settings, FileBarChart, HandCoins } from 'lucide-react';

export const anchorNavigationLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/programs', label: 'Programs', icon: Library },
  { href: '/retailers', label: 'Dealers', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/leads', label: 'Leads', icon: PlusCircle },
  { href: '/risk-assessment', label: 'Risk Assessment', icon: ShieldCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
];

// Merged enterprise links for Anchor role
export const enterpriseAnchorNavigationLinks = [
    ...anchorNavigationLinks,
    { href: '/reports', label: 'Reports', icon: FileBarChart, subRole: ['Manager'] },
    { href: '/sanction-request', label: 'Sanction Request', icon: HandCoins, subRole: ['Manager'] },
];


export const adminNavigationLinks = [
  { href: '/add-program', label: 'Add Program', icon: PlusCircle },
  { href: '/add-dealer', label: 'Add Dealer', icon: PlusCircle },
  { href: '/add-dealer-limit', label: 'Add Dealer Limit', icon: Link2 },
  { href: '/add-invoice', label: 'Add Invoice', icon: PlusCircle },
  { href: '/add-anchor', label: 'Add Anchor', icon: UserPlus },
  { href: '/add-lead', label: 'Add Lead', icon: PlusCircle },
  { href: '/programs', label: 'View Programs', icon: Library },
  { href: '/retailers', label: 'View Dealers', icon: Users },
  { href: '/invoices', label: 'View Invoices', icon: FileText },
  { href: '/leads', label: 'View Leads', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];
