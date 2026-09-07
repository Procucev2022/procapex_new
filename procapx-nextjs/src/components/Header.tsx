'use client';

import React from 'react';
import { 
  Shield, 
  PlusCircle, 
  LayoutDashboard, 
  FileText, 
  Layers, 
  Scale, 
  Sparkles, 
  MessageSquareDiff, 
  FileCheck2, 
  Database 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewPR: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenNewPR }) => {
  const { activeRole, setActiveRole } = useProcurement();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prs', label: 'Purchase Requests (PR)', icon: FileText },
    { id: 'boq', label: 'BOQ Studio (AI GFC / Upload)', icon: Layers },
    { id: 'commercial', label: 'Commercial Evaluation', icon: Scale },
    { id: 'ai-cost', label: 'AI Cost Analysis & MLEO', icon: Sparkles, highlight: true },
    { id: 'negotiation', label: 'Vendor Negotiation', icon: MessageSquareDiff },
    { id: 'ppo', label: 'PPO & Work Orders (PO)', icon: FileCheck2 },
    { id: 'masters', label: 'Masters & Audit Trail', icon: Database },
  ];

  return (
    <header className="bg-[#082f49] text-white sticky top-0 z-50 shadow-md border-b border-[#0c4a6e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-inner font-bold text-xl tracking-wider text-white">
              PX
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
                  ProCPX
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Next.js App
                </span>
              </div>
              <p className="text-xs text-sky-200/80 font-medium">Procurement & AI Cost Intelligence Platform</p>
            </div>
          </div>

          {/* Role Switcher & Action */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-[#031726]/60 rounded-xl px-3 py-1.5 border border-[#0c4a6e]/60 shadow-inner">
              <Shield className="w-4 h-4 text-sky-400 mr-2" />
              <span className="text-xs text-slate-300 font-medium mr-2">Role:</span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="bg-[#0c4a6e] text-white text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-sky-400 border border-sky-600/50 cursor-pointer"
              >
                <option value="BUYER">Buyer / Procurement</option>
                <option value="REQUESTER">Requester (Site/Project)</option>
                <option value="ESTIMATOR">Estimator / BOQ User</option>
                <option value="APPROVER">Approver (Management)</option>
                <option value="BUYER_ADMIN">Buyer Admin</option>
                <option value="VENDOR">Vendor Portal</option>
              </select>
            </div>

            <button
              onClick={onOpenNewPR}
              className="bg-sky-500 hover:bg-sky-400 text-[#031726] font-semibold text-xs px-3.5 py-2 rounded-lg transition-all shadow hover:shadow-sky-500/20 flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Purchase Request</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 text-xs font-medium text-slate-300 border-t border-[#0c4a6e]/80 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-2 rounded-md flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0c4a6e] text-white font-bold'
                    : 'hover:text-white hover:bg-[#0c4a6e]/50'
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
