'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Briefcase, CheckCircle2 } from 'lucide-react';
import { PRModule } from './PRModule';
import { CategoryManagerHub } from './CategoryManagerHub';
import { useProcurement } from '../context/ProcurementContext';
import type { BOQAndRFQManagementModuleProps, PurchaseRequest } from '@/types';
import { UI_STRINGS } from '@/constants';

export const BOQAndRFQManagementModule: React.FC<BOQAndRFQManagementModuleProps> = ({
  initialSubTab = 'boq_studio',
  selectedPRId: initialSelectedPRId,
  onOpenNewPRModal,
  onRouteToPPO,
  onRouteToNegotiation,
}) => {
  let prs: PurchaseRequest[] = [];
  try {
    const proc = useProcurement();
    prs = proc.prs;
  } catch {
    // Fallback when rendered outside ProcurementProvider in unit tests
  }
  const normalizedInitial = initialSubTab === 'rfq_hub' ? 'rfq_hub' : 'boq_studio';
  const [activeSubTab, setActiveSubTab] = useState<'boq_studio' | 'rfq_hub'>(normalizedInitial);
  const [selectedPRId, setSelectedPRId] = useState<string>(initialSelectedPRId ?? 'PR-2026-0005');
  const [lastSubmittedPR, setLastSubmittedPR] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (initialSubTab === 'rfq_hub') {
      setActiveSubTab('rfq_hub');
    } else {
      setActiveSubTab('boq_studio');
    }
  }, [initialSubTab]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {UI_STRINGS.boqAndRfqModule.badgeCombinedRole}
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1.5 tracking-tight text-white">
              {UI_STRINGS.boqAndRfqModule.title}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {UI_STRINGS.boqAndRfqModule.subtitle}
            </p>
          </div>

          {/* Sub-Tabs: BOQ Studio vs RFQ Hub */}
          <div className="flex items-center bg-brand-950/80 p-1.5 rounded-xl border border-sky-500/20 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveSubTab('boq_studio')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'boq_studio'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-brand-800/60'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-300" />
              <span>{UI_STRINGS.boqAndRfqModule.tabBOQStudio}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('rfq_hub')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'rfq_hub'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-brand-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4 text-emerald-300" />
              <span>{UI_STRINGS.boqAndRfqModule.tabRFQHub}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-View Content Area */}
      {activeSubTab === 'boq_studio' && (
        <PRModule
          onNavigateToBOQ={(prId) => {
            const targetId = prId || 'PR-2026-0005';
            setSelectedPRId(targetId);
            const foundTitle = prs.find(p => p.id === targetId)?.title;
            setLastSubmittedPR({
              id: targetId,
              title: foundTitle || 'Fabrication & Installation of Reception Counter',
            });
            setActiveSubTab('rfq_hub');
          }}
          onSelectPRForBOQ={(prId) => {
            const targetId = prId || 'PR-2026-0005';
            setSelectedPRId(targetId);
            const foundTitle = prs.find(p => p.id === targetId)?.title;
            setLastSubmittedPR({
              id: targetId,
              title: foundTitle || 'Fabrication & Installation of Reception Counter',
            });
          }}
          onViewPRSummary={(prId) => {
            if (prId) setSelectedPRId(prId);
            setActiveSubTab('boq_studio');
          }}
          onOpenNewPRModal={onOpenNewPRModal}
        />
      )}

      {activeSubTab === 'rfq_hub' && (
        <div className="space-y-4">
          {lastSubmittedPR && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950">
                    PR Submitted &amp; Ingested: Requisition <span className="font-mono">{lastSubmittedPR.id}</span>
                  </span>
                  <span className="text-emerald-800 ml-2">
                    is directly active in the RFQ &amp; Commercial Command Center below.
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('boq_studio')}
                  className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  BOQ Studio &amp; PR Requisitions
                </button>
              </div>
            </div>
          )}

          <CategoryManagerHub
            initialPRId={selectedPRId}
            onRouteToPPO={onRouteToPPO}
            onRouteToNegotiation={onRouteToNegotiation}
          />
        </div>
      )}
    </div>
  );
};
