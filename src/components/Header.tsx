'use client';

import React from 'react';
import { 
  Building2, 
  UserCheck, 
  Calculator,
  Lock,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import type { HeaderProps, UserRole, TenantKey } from '@/types';
import { NAV_ITEMS, UI_STRINGS, PRICING_TIERS } from '@/constants';

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenNewPR: _onOpenNewPR }) => {
  const {
    activeRole,
    setActiveRole,
    activeTenantKey,
    changeTenant,
    activeTenantTier,
    isModuleAllowed,
    isRoleAllowed,
  } = useProcurement();

  const currentTierConfig = PRICING_TIERS[activeTenantTier ?? 'MODULE_3'] ?? PRICING_TIERS.MODULE_3;
  const checkModuleAllowed = isModuleAllowed ?? (() => true);
  const checkRoleAllowed = isRoleAllowed ?? (() => true);

  const handleRoleChange = (role: UserRole): void => {
    setActiveRole(role);
    switch (role) {
      case 'BOQ_RFQ_MANAGER':
      case 'PROJECT_TEAM':
      case 'CATEGORY_MANAGER':
      case 'VENDOR_NEGOTIATION_HUB':
        setCurrentTab('boq_rfq_management');
        break;
      case 'CATEGORY_MANAGER_2':
      case 'PROJECT_HEAD_PPO':
        setCurrentTab('ppo_workorders');
        break;
      case 'FINANCE_HEAD':
        setCurrentTab('budget_planning');
        break;
      case 'VENDOR':
        setCurrentTab('vendor_portal');
        break;
      default:
        break;
    }
  };

  const navItems = NAV_ITEMS;

  return (
    <header className="bg-brand-900 text-white sticky top-0 z-50 shadow-lg border-b border-brand-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('budget_planning')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-brand-600 flex items-center justify-center shadow-md font-black text-xl tracking-wider text-white">
              PX
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
                  {UI_STRINGS.header.brandName}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {UI_STRINGS.header.brandBadge}
                </span>
              </div>
              <p className="text-xs text-sky-200/80 font-medium">{UI_STRINGS.header.brandDescription}</p>
            </div>
          </div>

          {/* Multi-Tenancy Controls: Tenant Selector + 5-Role Governance + Quick Login */}
          <div className="flex items-center space-x-2.5">
            
            {/* 1. TENANT / CLIENT SWITCHER */}
            <div className="flex items-center bg-brand-950/90 rounded-xl px-3 py-1.5 border border-sky-500/30 shadow-inner">
              <Building2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
              <span className="text-xs text-slate-300 font-medium mr-2 hidden sm:inline">{UI_STRINGS.header.clientLabel}</span>
              <select 
                value={activeTenantKey}
                onChange={(e) => changeTenant(e.target.value as TenantKey)}
                aria-label={UI_STRINGS.header.switchClientAria}
                className="bg-brand-800 text-emerald-300 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 border border-brand-600 cursor-pointer"
              >
                <option value="TNT_LNT">🏢 L&T Infra & Construction</option>
                <option value="TNT_TATA">🏢 Tata Projects Global</option>
                <option value="TNT_GODREJ">🏢 Godrej Properties & Living</option>
                <option value="TNT_SHAPOORJI">🏢 Shapoorji Pallonji Real Estate</option>
              </select>
            </div>

            {/* 1B. ACTIVE CLIENT PRICING TIER BADGE */}
            <div 
              onClick={() => setCurrentTab('tenant_overview')}
              title={`Active Subscription: ${currentTierConfig.name}`}
              className="flex items-center bg-brand-950/90 rounded-xl px-2.5 py-1.5 border border-amber-400/40 shadow-inner cursor-pointer hover:border-amber-400 transition-all shrink-0"
            >
              <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 mr-1.5 border border-amber-400/30">
                {currentTierConfig.code}
              </span>
              <span className="text-xs font-black text-amber-300">
                {currentTierConfig.priceFormatted}
                <span className="text-[10px] text-amber-200/60 font-normal">/mo</span>
              </span>
            </div>

            {/* 2. 5-ROLE GOVERNANCE SELECTOR */}
            <div className="flex items-center bg-brand-950/90 rounded-xl px-3 py-1.5 border border-brand-700/80 shadow-inner">
              <UserCheck className="w-4 h-4 text-sky-400 mr-2 shrink-0" />
              <span className="text-xs text-slate-300 font-medium mr-2 hidden sm:inline">{UI_STRINGS.header.roleLabel}</span>
              <select
                value={
                  activeRole === 'PROJECT_TEAM' || activeRole === 'CATEGORY_MANAGER'
                    ? 'BOQ_RFQ_MANAGER'
                    : activeRole
                }
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                aria-label={UI_STRINGS.header.switchRoleAria}
                className="bg-brand-800 text-white text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-sky-400 border border-brand-600 cursor-pointer"
              >
                <option value="BOQ_RFQ_MANAGER" disabled={!checkRoleAllowed('BOQ_RFQ_MANAGER')}>
                  {UI_STRINGS.header.roleOptionBOQRFQManager} {!checkRoleAllowed('BOQ_RFQ_MANAGER') ? '🔒 (Req. M2)' : ''}
                </option>
                <option value="VENDOR_NEGOTIATION_HUB" disabled={!checkRoleAllowed('VENDOR_NEGOTIATION_HUB')}>
                  {UI_STRINGS.header.roleOptionVendorNegotiationHub} {!checkRoleAllowed('VENDOR_NEGOTIATION_HUB') ? '🔒 (Req. M3)' : ''}
                </option>
                <option value="CATEGORY_MANAGER_2" disabled={!checkRoleAllowed('CATEGORY_MANAGER_2')}>
                  {UI_STRINGS.header.roleOptionCategoryManager2} {!checkRoleAllowed('CATEGORY_MANAGER_2') ? '🔒 (Req. M3)' : ''}
                </option>
                <option value="PROJECT_HEAD_PPO" disabled={!checkRoleAllowed('PROJECT_HEAD_PPO')}>
                  {UI_STRINGS.header.roleOptionProjectHeadPPO} {!checkRoleAllowed('PROJECT_HEAD_PPO') ? '🔒 (Req. M3)' : ''}
                </option>
                <option value="FINANCE_HEAD">{UI_STRINGS.header.roleOptionFinanceHead}</option>
                <option value="VENDOR">{UI_STRINGS.header.roleOptionVendor}</option>
              </select>
            </div>

            {/* 3. QUICK ACTION: FINANCE MANAGER LOGIN */}
            <button
              onClick={() => handleRoleChange('FINANCE_HEAD')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 shrink-0 ${
                activeRole === 'FINANCE_HEAD' && currentTab === 'budget_planning'
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : 'bg-indigo-950/90 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">
                {activeRole === 'FINANCE_HEAD' && currentTab === 'budget_planning'
                  ? UI_STRINGS.header.financeManagerActiveLabel
                  : UI_STRINGS.header.financeManagerLoginButton}
              </span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 text-xs font-medium text-slate-300 border-t border-brand-800/80 pt-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isAllowed = checkModuleAllowed(item.id);

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-300" />
                <span>{item.label}</span>
                {!isAllowed && (
                  <span className="text-[9px] bg-slate-800 text-amber-400 border border-amber-500/30 font-bold px-1.5 py-0.2 rounded-full ml-1 flex items-center">
                    <Lock className="w-2.5 h-2.5 mr-0.5" />
                    LOCK
                  </span>
                )}
                {item.id === 'budget_planning' && isAllowed && (
                  <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full ml-1">
                    FINANCE
                  </span>
                )}
                {item.id === 'vendor_management' && isAllowed && (
                  <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full ml-1">
                    DIRECTORY
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
