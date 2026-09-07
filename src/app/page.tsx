'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Dashboard } from '../components/Dashboard';
import { PRModule } from '../components/PRModule';
import { PRApprovalQueue } from '../components/PRApprovalQueue';
import { CategoryManagerHub } from '../components/CategoryManagerHub';
import { PPOModule } from '../components/PPOModule';
import { VendorPortal } from '../components/VendorPortal';
import { TenantOverview } from '../components/TenantOverview';
import { MastersAudit } from '../components/MastersAudit';
import { PlusCircle, X } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

export default function Home() {
  const { createPR, createPPO, prs } = useProcurement();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPRForBOQ, setSelectedPRForBOQ] = useState<string>('PR-2026-0005');
  
  // Modals state
  const [isNewPRModalOpen, setIsNewPRModalOpen] = useState<boolean>(false);
  const [isNewPPOModalOpen, setIsNewPPOModalOpen] = useState<boolean>(false);

  // Form states
  const [prTitle, setPrTitle] = useState<string>('');
  const [prProject, setPrProject] = useState<string>('');
  const [prCostCentre, setPrCostCentre] = useState<string>('CC-104 (Finishing, Interior & Millwork)');
  const [prCategory, setPrCategory] = useState<string>('Interior & Fitouts');
  const [prDate, setPrDate] = useState<string>(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [prRemarks, setPrRemarks] = useState<string>('');

  const [ppoTargetPR, setPpoTargetPR] = useState<string>('PR-2026-0005');
  const [ppoVendor, setPpoVendor] = useState<string>('DesignCraft Millworks & Interiors Pvt Ltd');
  const [ppoUnitRate, setPpoUnitRate] = useState<number>(148500);
  const [ppoTaxRate, setPpoTaxRate] = useState<number>(18);
  const [ppoPaymentTerms, setPpoPaymentTerms] = useState<string>('30 Days Net from delivery & QC signoff');
  const [ppoLeadTime, setPpoLeadTime] = useState<string>('12 Calendar Days');

  const handleNewPRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPR({
      title: prTitle || 'New Requisition Package',
      projectName: prProject || 'Metro Line 4 Underground',
      costCentre: prCostCentre,
      category: prCategory,
      requester: 'Site Procurement Engineer',
      reqDate: prDate,
      remarks: prRemarks,
      items: [
        { code: 'GEN-ITEM-001', desc: prTitle || 'Custom Scope Item', uom: 'Nos', qty: 100, rateCard: 1000, benchmark: 950, std: 980, aiConf: '92%' }
      ]
    });
    setIsNewPRModalOpen(false);
    setPrTitle('');
    setPrProject('');
    setCurrentTab('pr_approval_queue');
  };

  const handleCreatePPOSubmit = (e: React.FormEvent) => {
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
      qty: qty,
      totalVal: totalVal,
      taxRate: ppoTaxRate,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      paymentTerms: ppoPaymentTerms,
      leadTime: ppoLeadTime
    });
    setIsNewPPOModalOpen(false);
    setCurrentTab('ppo_workorders');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewPR={() => setIsNewPRModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* VIEW 0: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <Dashboard 
            onNavigate={(tab) => {
              if (tab === 'prs') setCurrentTab('boq_raiser_studio');
              else if (tab === 'commercial' || tab === 'ai-cost' || tab === 'negotiation') setCurrentTab('category_manager_hub');
              else if (tab === 'ppo') setCurrentTab('ppo_workorders');
              else setCurrentTab(tab);
            }} 
          />
        )}

        {/* VIEW 1: BOQ STUDIO & PR REQUISITIONS (PR RAISER SCOPE) */}
        {(currentTab === 'boq_raiser_studio' || currentTab === 'prs' || currentTab === 'boq') && (
          <PRModule
            onNavigateToBOQ={(prId: string) => {
              setSelectedPRForBOQ(prId);
              setCurrentTab('pr_approval_queue');
            }}
            onOpenNewPRModal={() => setIsNewPRModalOpen(true)}
          />
        )}

        {/* VIEW 2: PR APPROVALS (PROJECT HEAD) */}
        {currentTab === 'pr_approval_queue' && (
          <PRApprovalQueue
            onRouteToCategoryManager={() => setCurrentTab('category_manager_hub')}
          />
        )}

        {/* VIEW 3: FULL CATEGORY MANAGER SOURCING COMMAND CENTER */}
        {(currentTab === 'category_manager_hub' || currentTab === 'commercial' || currentTab === 'ai-cost' || currentTab === 'negotiation') && (
          <CategoryManagerHub
            onRouteToPPO={() => setCurrentTab('ppo_workorders')}
          />
        )}

        {/* VIEW 4-6: PPO APPROVAL & PO RELEASE */}
        {(currentTab === 'ppo_workorders' || currentTab === 'ppo') && (
          <PPOModule
            onOpenCreatePPO={() => setIsNewPPOModalOpen(true)}
          />
        )}

        {/* VIEW 7: VENDOR PORTAL */}
        {currentTab === 'vendor_portal' && (
          <VendorPortal />
        )}

        {/* VIEW 8: TENANT HIERARCHY */}
        {currentTab === 'tenant_overview' && (
          <TenantOverview />
        )}

        {/* MASTERS & AUDIT TRAIL */}
        {currentTab === 'masters' && (
          <MastersAudit />
        )}
      </main>

      {/* Modal: New PR */}
      {isNewPRModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <PlusCircle className="w-5 h-5 text-sky-600 mr-2" />
                <span>Create New Purchase Request (PR)</span>
              </h3>
              <button onClick={() => setIsNewPRModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewPRSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">PR Title / Package Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Supply of Ready Mix Concrete M30"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    className="w-full border rounded-lg p-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Metro Line 4 Station"
                    value={prProject}
                    onChange={(e) => setPrProject(e.target.value)}
                    className="w-full border rounded-lg p-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Cost Centre</label>
                  <select
                    value={prCostCentre}
                    onChange={(e) => setPrCostCentre(e.target.value)}
                    className="w-full border rounded-lg p-2.5 bg-slate-50 font-semibold"
                  >
                    <option value="CC-101 (Civil & Concrete)">CC-101 (Civil & Concrete)</option>
                    <option value="CC-102 (Structural Steel)">CC-102 (Structural Steel)</option>
                    <option value="CC-103 (MEP & HVAC)">CC-103 (MEP & HVAC)</option>
                    <option value="CC-104 (Finishing, Interior & Millwork)">CC-104 (Finishing, Interior & Millwork)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Procurement Category</label>
                  <select
                    value={prCategory}
                    onChange={(e) => setPrCategory(e.target.value)}
                    className="w-full border rounded-lg p-2.5 bg-slate-50 font-semibold"
                  >
                    <option value="Interior & Fitouts">Interior & Fitouts</option>
                    <option value="Civil Materials">Civil Materials</option>
                    <option value="Structural Steel">Structural Steel</option>
                    <option value="MEP Equipment">MEP Equipment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Required By Date</label>
                <input
                  type="date"
                  value={prDate}
                  onChange={(e) => setPrDate(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Technical Scope Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Additional specifications or urgency notes..."
                  value={prRemarks}
                  onChange={(e) => setPrRemarks(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewPRModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold shadow"
                >
                  Submit PR Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
