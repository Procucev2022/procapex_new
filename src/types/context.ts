import type {
  TenantConfig,
  TenantKey,
  UserRole,
  PurchaseRequest,
  VendorQuote,
  NegotiationEvent,
  PPOItem,
  PurchaseOrder,
  AuditLog,
} from './procurement';

export interface ProcurementContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeTenantKey: TenantKey;
  activeTenant: TenantConfig;
  changeTenant: (key: TenantKey) => void;
  tenants: Record<TenantKey, TenantConfig>;
  prs: PurchaseRequest[];
  quotes: Record<string, VendorQuote[]>;
  negotiations: Record<string, NegotiationEvent[]>;
  ppos: PPOItem[];
  pos: PurchaseOrder[];
  auditLogs: AuditLog[];
  // PPO 3-Tier Workflow
  tier1Approved: boolean;
  tier2Approved: boolean;
  tier3Approved: boolean;
  poReleased: boolean;
  approveTier1: () => void;
  approveTier2: () => void;
  approveTier3AndReleasePO: () => void;
  resetTiers: () => void;
  // Actions
  createPR: (pr: Omit<PurchaseRequest, 'id' | 'status' | 'buyer'>) => void;
  updatePRStatus: (id: string, status: PurchaseRequest['status'], comments?: string) => void;
  approvePRByProjectHead: (id: string) => void;
  updateBOQItems: (prId: string, items: PurchaseRequest['items']) => void;
  addNegotiationRound: (prId: string, rate: number, remarks: string, actionType: string) => void;
  createPPO: (ppo: Omit<PPOItem, 'id' | 'status' | 'createdDate'>) => void;
  approvePPO: (ppoId: string) => void;
  resetToSampleData: () => void;
}
