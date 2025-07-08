
import { LayoutDashboard, Users, FileText, Library, GitBranchPlus, AreaChart, UserCog, Bot } from 'lucide-react';
import type { UserRole } from '@/types';

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
};

export const navigationLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['manager', 'supply_chain_head'] },
  { href: '/cfo-dashboard', label: 'CFO Dashboard', icon: Bot, roles: ['cfo'] },
  { href: '/vendors', label: 'Vendors', icon: Users, roles: ['manager', 'supply_chain_head'] },
  { href: '/invoices', label: 'Invoices', icon: FileText, roles: ['manager'] },
  { href: '/programs', label: 'Programs', icon: Library, roles: ['manager'] },
  { href: '/partner-onboarding', label: 'Partner Management', icon: GitBranchPlus, roles: ['manager', 'supply_chain_head'] },
  { href: '/analytics', label: 'Analytics', icon: AreaChart, roles: ['manager', 'cfo'] },
  { href: '/settings', label: 'Settings', icon: UserCog, roles: ['manager'] },
];
