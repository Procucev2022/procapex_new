'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { PPOModule } from '../components/PPOModule';
import { VendorPortal } from '../components/VendorPortal';
import { TenantOverview } from '../components/TenantOverview';
import { MastersAudit } from '../components/MastersAudit';
import { BudgetPlanningModule, CategoryStandardBOQMaster } from '../components/budget';
import { BOQAndRFQManagementModule } from '../components/BOQAndRFQManagementModule';
import { ModuleAccessGate } from '../components/pricing';
import { VendorManagementModule } from '../components/vendor-management';
import { PRApprovalQueue } from '../components/PRApprovalQueue';
import { RateCardModule } from '../components/rate-card';
import { X } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

export default function Home(): JSX.Element {
  const { createPPO, prs, setActiveRole, addItemToRateCard } = useProcurement();
  const [currentTab, setCurrentTab] = useState<string>('budget_planning');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('budget') || search.includes('budget')) {
        setActiveRole('FINANCE_HEAD');
        setCurrentTab('budget_planning');
      } else if (hash.includes('negotiat') || search.includes('negotiat')) {
        setActiveRole('BOQ_RFQ_MANAGER');
        setCurrentTab('boq_rfq_management');
      }
    }
  }, [setActiveRole]);
  
  // Modals state
  const [isNewPPOModalOpen, setIsNewPPOModalOpen] = useState<boolean>(false);

  const [ppoTargetPR, setPpoTargetPR] = useState<string>('PR-2026-0005');
  const [ppoVendor, setPpoVendor] = useState<string>('DesignCraft Millworks & Interiors Pvt Ltd');
  const [ppoUnitRate, setPpoUnitRate] = useState<number>(148500);
  const [ppoTaxRate, setPpoTaxRate] = useState<number>(18);
  const [ppoPaymentTerms, setPpoPaymentTerms] = useState<string>('30 Days Net from delivery & QC signoff');
  const [ppoLeadTime, setPpoLeadTime] = useState<string>('12 Calendar Days');
  const [addToRateCard, setAddToRateCard] = useState<boolean>(true);

  const handleCreatePPOSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const qty = 1;
    const totalVal = ppoUnitRate * qty;
    const taxAmount = (totalVal * ppoTaxRate) / 100;
    const grandTotal = totalVal + taxAmount;

    createPPO({
      prId: ppoTargetPR,
      vendor: ppoVendor,
      itemDesc: `Supply and Delivery as per ${ppoTargetPR}`,
      unitRate: ppoUnitRate,
      qty,
      totalVal,
      taxRate: ppoTaxRate,
      taxAmount,
      grandTotal,
      paymentTerms: ppoPaymentTerms,
      leadTime: ppoLeadTime,
    });
    if (addToRateCard) {
      addItemToRateCard({
        vendorId: 'VND-001',
        categoryCode: 'INTERIOR',
        itemCode: `RC-${Date.now().toString().slice(-4)}`,
        desc: `Supply and Delivery as per ${ppoTargetPR}`,
        uom: 'Ls',
        agreedRate: ppoUnitRate,
        notes: `Added from PPO on ${new Date().toISOString().split('T')[0]}`,
      });
    }
    setIsNewPPOModalOpen(false);
    setCurrentTab('ppo_workorders');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* VIEW 1: BUDGET PLANNING (FINANCE MANAGER) */}
        {currentTab === 'budget_planning' && (
          <ModuleAccessGate moduleId="budget_planning">
            <BudgetPlanningModule
              onRouteToPR={() => setCurrentTab('boq_rfq_management')}
              onRouteToMaster={() => setCurrentTab('category_standard_boq_master')}
            />
          </ModuleAccessGate>
        )}

        {/* VIEW 2: BOQ STUDIO & RFQ MANAGEMENT MODULE */}
        {(currentTab === 'boq_rfq_management' || currentTab === 'boq_raiser_studio' || currentTab === 'category_manager_hub' || currentTab === 'prs' || currentTab === 'boq' || currentTab === 'commercial' || currentTab === 'ai-cost' || currentTab === 'vendor_negotiation_hub' || currentTab === 'negotiation') && (
          <ModuleAccessGate moduleId="boq_rfq_management">
            <BOQAndRFQManagementModule
              initialSubTab={
                currentTab === 'category_manager_hub' || currentTab === 'commercial' || currentTab === 'ai-cost' || currentTab === 'vendor_negotiation_hub' || currentTab === 'negotiation'
                  ? 'rfq_hub'
                  : 'boq_studio'
              }
              onRouteToPPO={() => setCurrentTab('ppo_workorders')}
              onRouteToNegotiation={() => setCurrentTab('boq_rfq_management')}
            />
          </ModuleAccessGate>
        )}

        {/* VIEW: CATEGORY & STANDARD BOQ MASTER (MODULE 2 & 3) */}
        {currentTab === 'category_standard_boq_master' && (
          <ModuleAccessGate moduleId="category_standard_boq_master">
            <CategoryStandardBOQMaster
              onRouteToBudget={() => setCurrentTab('budget_planning')}
            />
          </ModuleAccessGate>
        )}

        {/* VIEW 3: VENDOR DIRECTORY & EVALUATION (MODULE 2 & 3) */}
        {currentTab === 'vendor_management' && (
          <ModuleAccessGate moduleId="vendor_management">
            <VendorManagementModule
              onRouteToVendorPortal={() => {
                setActiveRole('VENDOR');
                setCurrentTab('vendor_portal');
              }}
            />
          </ModuleAccessGate>
        )}


        {/* VIEW: PR APPROVALS (PROJECT HEAD AUDIT QUEUE) */}
        {currentTab === 'pr_approval_queue' && (
          <ModuleAccessGate moduleId="pr_approval_queue">
            <PRApprovalQueue
              onRouteToCategoryManager={() => setCurrentTab('boq_rfq_management')}
            />
          </ModuleAccessGate>
        )}

        {/* VIEW 4: PPO APPROVAL & PO RELEASE */}
        {(currentTab === 'ppo_workorders' || currentTab === 'ppo') && (
          <ModuleAccessGate moduleId="ppo_workorders">
            <PPOModule
              onOpenCreatePPO={() => setIsNewPPOModalOpen(true)}
            />
          </ModuleAccessGate>
        )}

        {/* VIEW: RATE CARD MODULE */}
        {currentTab === 'rate_cards' && (
          <ModuleAccessGate moduleId="rate_cards">
            <RateCardModule
              onRouteToRFQ={() => setCurrentTab('boq_rfq_management')}
              onRouteToPPO={() => setCurrentTab('ppo_workorders')}
            />
          </ModuleAccessGate>
        )}

        {/* VIEW 6: VENDOR PORTAL */}
        {currentTab === 'vendor_portal' && (
          <VendorPortal />
        )}

        {/* VIEW 7: TENANT HIERARCHY */}
        {currentTab === 'tenant_overview' && (
          <TenantOverview />
        )}

        {/* VIEW 8: MASTERS & AUDIT TRAIL */}
        {currentTab === 'masters' && (
          <MastersAudit />
        )}
      </main>

      {/* Modal: New PPO */}
      {isNewPPOModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Purchase Price Offer (PPO)</h3>
              <button onClick={() => setIsNewPPOModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePPOSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Target PR</label>
                  <select
                    value={ppoTargetPR}
                    onChange={(e) => setPpoTargetPR(e.target.value)}
                    className="w-full border rounded-lg p-2 bg-slate-50 font-mono"
                  >
                    {prs.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.title.substring(0, 25)}...</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Awarded Vendor</label>
                  <input
                    type="text"
                    value={ppoVendor}
                    onChange={(e) => setPpoVendor(e.target.value)}
                    className="w-full border rounded-lg p-2 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Final Unit Rate (INR)</label>
                  <input
                    type="number"
                    value={ppoUnitRate}
                    onChange={(e) => setPpoUnitRate(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded-lg p-2 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">GST Rate (%)</label>
                  <input
                    type="number"
                    value={ppoTaxRate}
                    onChange={(e) => setPpoTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded-lg p-2 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Payment Terms</label>
                <input
                  type="text"
                  value={ppoPaymentTerms}
                  onChange={(e) => setPpoPaymentTerms(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Committed Delivery Lead Time</label>
                <input
                  type="text"
                  value={ppoLeadTime}
                  onChange={(e) => setPpoLeadTime(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="addToRateCardCheckbox"
                  checked={addToRateCard}
                  onChange={(e) => setAddToRateCard(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="addToRateCardCheckbox" className="text-xs font-semibold text-emerald-900 cursor-pointer">
                  {UI_STRINGS.rateCards.addToRateCardCheckbox}
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewPPOModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow"
                >
                  Issue PPO to Approval Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
