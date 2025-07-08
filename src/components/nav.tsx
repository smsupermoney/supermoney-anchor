
import { LayoutDashboard, Users, FileText, Library, GitBranchPlus, AreaChart, UserCog, Bot } from 'lucide-react';

export const navigationLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendors', label: 'Vendors', icon: Users },
  // { href: '/dealers', label: 'Dealers', icon: Users }, // Add this back if needed
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/programs', label: 'Programs', icon: Library },
  { href: '/partner-onboarding', label: 'Partner Management', icon: GitBranchPlus },
  { href: '/analytics', label: 'Analytics', icon: AreaChart },
  { href: '/cfo-dashboard', label: 'CFO Dashboard', icon: Bot },
  { href: '/settings', label: 'Settings', icon: UserCog },
];
