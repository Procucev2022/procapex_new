'use client';

import React, { useState } from 'react';
import { FileCheck, FileBadge, Download, Check, Plus, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PPOModuleProps {
  onOpenCreatePPO?: () => void;
}

export const PPOModule: React.FC<PPOModuleProps> = ({ onOpenCreatePPO }) => {
  const { 
    ppos, 
    pos, 
    activeTenant, 
    tier1Approved, 
    tier2Approved, 
    tier3Approved, 
    poReleased, 
    approveTier1, 
    approveTier2, 
    approveTier3AndReleasePO, 
    approvePPO 
  } = useProcurement();

  const [subTab, setSubTab] = useState<'WORKFLOW' | 'PPO' | 'PO'>('WORKFLOW');

  const downloadPO_PDF = (poId: string) => {
    const po = pos.find(p => p.id === poId);
    const ppo = ppos.find(p => p.id === (po ? po.ppoRef : ''));
    if (!po) return;

    const doc = new jsPDF();

    // Header Banner
    doc.setFillColor(3, 105, 161);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PROCPX PROCUREMENT PLATFORM', 14, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL PURCHASE ORDER / WORK ORDER', 14, 18);

    // Reference Details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Purchase Order #: ${po.id}`, 14, 34);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client Enterprise: ${activeTenant.name}`, 14, 40);
    doc.text(`Project: ${activeTenant.project}`, 14, 45);
    doc.text(`Issue Date: ${po.issueDate || new Date().toISOString().split('T')[0]}`, 14, 50);
    doc.text(`PPO Reference: ${po.ppoRef || 'PPO-2026-0015'}`, 14, 55);

    // Vendor Info
    doc.setFont('helvetica', 'bold');
    doc.text('Vendor / Contractor Details:', 120, 34);
    doc.setFont('helvetica', 'normal');
    doc.text(po.vendor, 120, 40);
    doc.text('Status: Empanelled Contractor', 120, 45);
    doc.text('Payment Terms: 30 Days Net from GRN', 120, 50);

    // Items AutoTable
    (doc as any).autoTable({
      startY: 62,
      head: [['#', 'Item Code & Description', 'UOM', 'Qty', 'Unit Rate (INR)', 'Total Amount (INR)']],
      body: [
        ['1', '20mm Polished Jet Black Granite Top', 'Sqm', '12.5', 'Rs. 3,550', 'Rs. 44,375'],
        ['2', '18mm Marine BWP Plywood IS 710', 'Sqm', '38.0', 'Rs. 1,520', 'Rs. 57,760'],
        ['3', '1.0mm Textured HPL Laminate', 'Sqm', '24.0', 'Rs. 890', 'Rs. 21,360'],
        ['4', 'Soft-Close Hinges & Hardware Package', 'Set', '14.0', 'Rs. 1,780', 'Rs. 24,920'],
        ['5', '12V LED Strip Light with Profile', 'Rmt', '16.0', 'Rs. 420', 'Rs. 6,720'],
        ['6', '100mm SS 304 Brushed Skirting', 'Rmt', '14.0', 'Rs. 780', 'Rs. 10,920'],
        ['', 'Applicable GST / Taxes (18%)', '', '', '', 'Rs. 26,730'],
        ['', 'GRAND TOTAL (INC. TAXES)', '', '', '', `INR ${(po.amount ?? po.grandTotal ?? 175230).toLocaleString()}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [3, 105, 161], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        5: { halign: 'right', fontStyle: 'bold' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 130;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Digital Signatures:', 14, finalY + 15);
    doc.text(`1. Strategic Sourcing: ${activeTenant.team['CATEGORY_MANAGER_2']?.name || 'Category Mgr 2'} (Approved)`, 14, finalY + 22);
    doc.text(`2. Project Budget: ${activeTenant.team['PROJECT_HEAD_PR']?.name || 'Project Head'} (Approved)`, 14, finalY + 28);
    doc.text(`3. Finance Authorization: ${activeTenant.team['FINANCE_HEAD']?.name || 'Finance Head'} (Approved & Released)`, 14, finalY + 34);

    doc.save(`${po.id}_Official_Order.pdf`);
  };

  const getOverallBadge = () => {
    if (poReleased) return { text: 'PO RELEASED', bg: 'bg-emerald-100 text-emerald-900' };
    if (tier2Approved) return { text: 'TIER 3 IN PROGRESS', bg: 'bg-purple-100 text-purple-900' };
    if (tier1Approved) return { text: 'TIER 2 IN PROGRESS', bg: 'bg-amber-100 text-amber-900' };
    return { text: 'TIER 1 IN PROGRESS', bg: 'bg-amber-100 text-amber-900' };
  };

  const badge = getOverallBadge();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-brand-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Multi-Tier PPO Approval & Purchase Order Release</h1>
            <p className="text-xs text-slate-300 mt-1">
              Tier 1: Category Manager 2 → Tier 2: Project Head → Tier 3: Finance Head & PO Release.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSubTab('WORKFLOW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'WORKFLOW' ? 'bg-emerald-500 text-brand-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              3-Tier Approval Workflow
            </button>
            <button
              onClick={() => setSubTab('PPO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'PPO' ? 'bg-emerald-500 text-brand-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              All PPOs ({ppos.length})
            </button>
            <button
              onClick={() => setSubTab('PO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'PO' ? 'bg-emerald-500 text-brand-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Issued POs ({pos.length})
            </button>
          </div>
        </div>
      </div>

      {subTab === 'WORKFLOW' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">PPO-2026-0015 – Reception Counter Joinery Package</h3>
              <p className="text-xs text-slate-500">
                Awarded to: <strong>DesignCraft Millworks & Interiors Pvt Ltd</strong> • Total Value: <strong>₹ 1,75,230 (Incl. 18% GST)</strong>
              </p>
            </div>
            <span className={`text-xs font-mono px-3 py-1 rounded-full font-bold ${badge.bg}`}>
              {badge.text}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* TIER 1 */}
            <div className={`p-4 rounded-xl border-2 transition-all space-y-2 ${tier1Approved ? 'border-emerald-300 bg-emerald-50/20' : 'border-amber-300 bg-white'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Tier 1: Category Manager 2</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tier1Approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {tier1Approved ? 'APPROVED ✓' : 'PENDING'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">Commercial savings validation & strategic sourcing compliance.</p>
              {!tier1Approved ? (
                <button
                  onClick={approveTier1}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg shadow-sm transition-all"
                >
                  ✓ Sign-off Tier 1 (Cat Mgr 2)
                </button>
              ) : (
                <div className="text-[11px] font-bold text-emerald-700 flex items-center pt-1">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  <span>Signed by Rajesh Singhania</span>
                </div>
              )}
            </div>

            {/* TIER 2 */}
            <div className={`p-4 rounded-xl border-2 transition-all space-y-2 ${!tier1Approved ? 'opacity-60 border-slate-200 bg-slate-50' : tier2Approved ? 'border-emerald-300 bg-emerald-50/20' : 'border-amber-300 bg-white'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Tier 2: Project Head</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${!tier1Approved ? 'bg-slate-200 text-slate-600' : tier2Approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {!tier1Approved ? 'AWAITING TIER 1' : tier2Approved ? 'APPROVED ✓' : 'PENDING SIGN-OFF'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">Site budget clearance & milestone sign-off.</p>
              {!tier2Approved ? (
                <button
                  onClick={approveTier2}
                  disabled={!tier1Approved}
                  className={`w-full py-2 rounded-lg font-bold transition-all ${
                    tier1Approved
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  ✓ Sign-off Tier 2 (Project Head)
                </button>
              ) : (
                <div className="text-[11px] font-bold text-emerald-700 flex items-center pt-1">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  <span>Signed by Anil Kulkarni</span>
                </div>
              )}
            </div>

            {/* TIER 3 */}
            <div className={`p-4 rounded-xl border-2 transition-all space-y-2 ${!tier2Approved ? 'opacity-60 border-slate-200 bg-slate-50' : tier3Approved ? 'border-emerald-300 bg-emerald-50/20' : 'border-purple-300 bg-white'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Tier 3: Finance Head</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${!tier2Approved ? 'bg-slate-200 text-slate-600' : tier3Approved ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                  {!tier2Approved ? 'AWAITING TIER 2' : tier3Approved ? 'APPROVED & ISSUED ✓' : 'PENDING FINAL AUDIT'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">Commercial audit & Release Purchase Order.</p>
              {!tier3Approved ? (
                <button
                  onClick={approveTier3AndReleasePO}
                  disabled={!tier2Approved}
                  className={`w-full py-2 rounded-lg font-bold transition-all ${
                    tier2Approved
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  ✓ Release Purchase Order (PO)
                </button>
              ) : (
                <div className="text-[11px] font-bold text-emerald-700 flex items-center pt-1">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  <span>Signed by Sunil Deshmukh</span>
                </div>
              )}
            </div>
          </div>

          {/* RELEASED PO BANNER */}
          {poReleased && (
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="font-black text-emerald-950 text-sm block">
                    🎉 Purchase Order PO-2026-0089 Officially Issued!
                  </span>
                  <p className="text-xs text-emerald-800">
                    All 3 approval tiers passed. Signed contract document ready for download.
                  </p>
                </div>
                <button
                  onClick={() => downloadPO_PDF('PO-2026-0089')}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PO-2026-0089 PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PPO LIST */}
      {subTab === 'PPO' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Purchase Price Offers (PPOs)</h3>
            {onOpenCreatePPO && (
              <button
                onClick={onOpenCreatePPO}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create PPO</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 font-bold border-b text-slate-800">
                <tr>
                  <th className="p-3">PPO Ref</th>
                  <th className="p-3">Target PR</th>
                  <th className="p-3">Awarded Vendor</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Grand Total (INR)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ppos.map(ppo => (
                  <tr key={ppo.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-sky-800">{ppo.id}</td>
                    <td className="p-3 font-mono font-semibold text-slate-600">{ppo.prId}</td>
                    <td className="p-3 font-bold text-slate-800">{ppo.vendor}</td>
                    <td className="p-3 max-w-xs truncate">{ppo.itemDesc}</td>
                    <td className="p-3 text-right font-bold text-emerald-950 font-mono">₹ {ppo.grandTotal.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ppo.status.includes('APPROVED') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ppo.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {ppo.status.includes('PENDING') && (
                        <button
                          onClick={() => approvePPO(ppo.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                        >
                          Approve PPO
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PO LIST */}
      {subTab === 'PO' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Released Purchase Orders / Work Orders</h3>
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 font-bold border-b text-slate-800">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">PPO Ref</th>
                  <th className="p-3">Vendor / Supplier</th>
                  <th className="p-3 text-right">Amount (INR)</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pos.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-emerald-700">{po.id}</td>
                    <td className="p-3 font-mono text-slate-600">{po.ppoRef}</td>
                    <td className="p-3 font-bold text-slate-800">{po.vendor}</td>
                    <td className="p-3 text-right font-bold text-emerald-950 font-mono">₹ {(po.amount ?? po.grandTotal ?? 0).toLocaleString()}</td>
                    <td className="p-3 text-slate-600">{po.issueDate}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{po.status}</span></td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => downloadPO_PDF(po.id)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1 ml-auto"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF PO</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
