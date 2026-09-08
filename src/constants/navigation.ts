import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  Briefcase,
  FileCheck2,
  Store,
  Building,
  Database,
} from 'lucide-react';
import type { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'boq_raiser_studio', label: '1. Create PR & BOQ Studio', icon: Layers, highlight: true },
  { id: 'pr_approval_queue', label: '2. PR Approvals', icon: CheckSquare },
  { id: 'category_manager_hub', label: '3. Category Manager (Buyer Hub)', icon: Briefcase, highlight: true },
  { id: 'ppo_workorders', label: '4-6. PPO Approval & PO Release', icon: FileCheck2 },
  { id: 'vendor_portal', label: '7. Vendor Portal (Bidding)', icon: Store },
  { id: 'tenant_overview', label: 'Tenant Hierarchy', icon: Building },
  { id: 'masters', label: 'Masters & Audit', icon: Database },
];
