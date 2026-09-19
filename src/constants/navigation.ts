import {
  Layers,
  FileCheck2,
  Store,
  Building,
  Database,
  Calculator,
  Users,
  FolderTree,
  CreditCard,
} from 'lucide-react';
import type { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'boq_rfq_management', label: 'BOQ Studio & RFQ Management', icon: Layers, highlight: true },
  { id: 'budget_planning', label: 'Project Cost Budget Planning', icon: Calculator, highlight: true },
  { id: 'category_standard_boq_master', label: 'Category & Standard BOQ Master', icon: FolderTree, highlight: true },
  { id: 'vendor_management', label: 'Vendor Directory & Evaluation', icon: Users, highlight: true },
  { id: 'rate_cards', label: 'Rate Card Master & Agreements', icon: CreditCard, highlight: true },
  { id: 'ppo_workorders', label: 'PPO Approvals', icon: FileCheck2 },
  { id: 'vendor_portal', label: 'Vendor Portal (Bidding)', icon: Store },
  { id: 'tenant_overview', label: 'Tenant Hierarchy', icon: Building },
  { id: 'masters', label: 'Masters & Audit', icon: Database },
];

