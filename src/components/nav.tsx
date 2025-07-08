import { LayoutDashboard, Users, FileText, PlusCircle, Library, ShieldCheck } from 'lucide-react';

export const navigationLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/retailers', label: 'Dealers', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/leads', label: 'Leads', icon: PlusCircle },
  { href: '/programs', label: 'Programs', icon: Library },
  { href: '/risk-assessment', label: 'Risk Assessment', icon: ShieldCheck },
];
