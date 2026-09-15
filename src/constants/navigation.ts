import {
  Layers,
  FileCheck2,
  Store,
  Building,
  Database,
  Calculator,
  Handshake,
  Users,
  FolderTree,
} from 'lucide-react';
import type { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'budget_planning', label: '1. Budget Planning Module', icon: Calculator, highlight: true },
  { id: 'boq_rfq_management', label: '2. BOQ & RFQ Management Module', icon: Layers, highlight: true },
  { id: 'category_standard_boq_master', label: 'Category & Standard BOQ Master', icon: FolderTree, highlight: true },
  { id: 'vendor_management', label: 'Vendor Directory & Evaluation', icon: Users, highlight: true },
  { id: 'vendor_negotiation_hub', label: '3. Vendor Negotiation Hub', icon: Handshake, highlight: true },
  { id: 'ppo_workorders', label: '4. PPO Approvals', icon: FileCheck2 },
  { id: 'vendor_portal', label: '5. Vendor Portal (Bidding)', icon: Store },
  { id: 'tenant_overview', label: 'Tenant Hierarchy', icon: Building },
  { id: 'masters', label: 'Masters & Audit', icon: Database },
];

