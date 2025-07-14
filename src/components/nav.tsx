import { LayoutDashboard, Users, FileText, PlusCircle, Library, ShieldCheck, UserCog } from 'lucide-react';

export const navigationLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/programs', label: 'Programs', icon: Library },
  { href: '/retailers', label: 'Dealers', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/leads', label: 'Leads', icon: PlusCircle },
  { href: '/risk-assessment', label: 'Risk Assessment', icon: ShieldCheck },
];
