'use client';

import React from 'react';
import { 
  Building2, 
  UserCheck, 
  PlusCircle, 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { HeaderProps, UserRole, TenantKey } from '@/types';
import { NAV_ITEMS, UI_STRINGS } from '@/constants';

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenNewPR }) => {
  const { activeRole, setActiveRole, activeTenantKey, changeTenant, activeTenant } = useProcurement();

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    switch (role) {
      case 'PROJECT_TEAM':
        setCurrentTab('boq_raiser_studio');
        break;
      case 'PROJECT_HEAD_PR':
        setCurrentTab('pr_approval_queue');
        break;
      case 'CATEGORY_MANAGER':
        setCurrentTab('category_manager_hub');
        break;
      case 'CATEGORY_MANAGER_2':
      case 'PROJECT_HEAD_PPO':
      case 'FINANCE_HEAD':
        setCurrentTab('ppo_workorders');
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
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
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

          {/* Multi-Tenancy Controls: Tenant Selector + 7-Role Governance */}
          <div className="flex items-center space-x-3">
            
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

            {/* 2. 7-ROLE GOVERNANCE SELECTOR */}
            <div className="flex items-center bg-brand-950/90 rounded-xl px-3 py-1.5 border border-brand-700/80 shadow-inner">
              <UserCheck className="w-4 h-4 text-sky-400 mr-2 shrink-0" />
              <span className="text-xs text-slate-300 font-medium mr-2 hidden sm:inline">{UI_STRINGS.header.roleLabel}</span>
              <select
                value={activeRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                aria-label={UI_STRINGS.header.switchRoleAria}
                className="bg-brand-800 text-white text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-sky-400 border border-brand-600 cursor-pointer"
              >
                <option value="PROJECT_TEAM">1. Project Team (PR Raiser & BOQ Studio)</option>
                <option value="PROJECT_HEAD_PR">2. Project Head (PR Approver)</option>
                <option value="CATEGORY_MANAGER">3. Category Manager (Buyer Command Center)</option>
                <option value="CATEGORY_MANAGER_2">4. Category Manager 2 (Procurement Head / PPO Approver)</option>
                <option value="PROJECT_HEAD_PPO">5. Project Head (PPO Approver)</option>
                <option value="FINANCE_HEAD">6. Finance Head (PPO Approver & PO Release)</option>
                <option value="VENDOR">7. Vendor (Supplier Portal & Quotations)</option>
              </select>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => {
                setActiveRole('PROJECT_TEAM');
                setCurrentTab('boq_raiser_studio');
                onOpenNewPR();
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-brand-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center space-x-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">{UI_STRINGS.header.raisePRButton}</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 text-xs font-medium text-slate-300 border-t border-brand-800/80 pt-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-2 rounded-md flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-800 text-white font-bold'
                    : 'hover:text-white hover:bg-brand-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.highlight ? 'text-amber-300' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
