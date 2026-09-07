'use client';

import React, { useState } from 'react';
import { FileCheck, FileBadge, Download, Check, Plus } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PPOModuleProps {
  onOpenCreatePPO: () => void;
}

export const PPOModule: React.FC<PPOModuleProps> = ({ onOpenCreatePPO }) => {
  const { ppos, pos, approvePPO } = useProcurement();
  const [subTab, setSubTab] = useState<'PPO' | 'PO'>('PPO');

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
    doc.text('OFFICIAL PURCHASE ORDER / WORK ORDER (PHASE 1)', 14, 18);

    // Reference Details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Purchase Order #: ${po.id}`, 14, 34);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue Date: ${po.issueDate}`, 14, 40);
    doc.text(`PPO Reference: ${po.ppoRef}`, 14, 45);
    doc.text(`PR Reference: ${po.prRef}`, 14, 50);

    // Vendor Info
    doc.setFont('helvetica', 'bold');
    doc.text('Vendor / Contractor Details:', 120, 34);
    doc.setFont('helvetica', 'normal');
    doc.text(`${po.vendor}`, 120, 40);
    doc.text('GSTIN: 27AAACV8899Z1ZQ', 120, 45);
    doc.text('Delivery Site: Apex Sky Tower Project, Terminal 2', 120, 50);

    // Items AutoTable
    (doc as any).autoTable({
      startY: 58,
      head: [['#', 'Item Code & Description', 'UOM', 'Qty', 'Unit Rate (INR)', 'Tax Rate', 'Total Amount (INR)']],
      body: [
        ['1', ppo ? ppo.itemDesc : 'Supply of Construction Materials as per BOQ', 'Cum', '450', '4,400.00', '18% GST', '19,80,000.00'],
        ['', 'Applicable GST / Taxes (18%)', '', '', '', '', '3,56,400.00'],
        ['', 'GRAND TOTAL (INC. TAXES)', '', '', '', '', `INR ${(po.amount ?? po.grandTotal ?? 0).toLocaleString()}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [3, 105, 161], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        6: { halign: 'right', fontStyle: 'bold' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;

    // Commercial Terms
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Commercial Terms & Delivery Guidelines:', 14, finalY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(`1. Payment Terms: ${ppo ? ppo.paymentTerms : '30 Days Net upon delivery & QC signoff'}.`, 14, finalY + 18);
    doc.text(`2. Delivery Schedule: ${ppo ? ppo.leadTime : 'Immediate dispatch as per site call-off schedule'}.`, 14, finalY + 23);
    doc.text('3. Quality Standard: All materials must strictly adhere to IS standard test certifications.', 14, finalY + 28);
    doc.text('4. Jurisdiction: Governed under corporate procurement terms and arbitration rules.', 14, finalY + 33);

    // Signatures
    doc.text('_____________________________', 14, finalY + 55);
    doc.text('Authorized Buyer Signatory', 14, finalY + 60);

    doc.text('_____________________________', 130, finalY + 55);
    doc.text('Vendor Acceptance Sign & Stamp', 130, finalY + 60);

    doc.save(`${po.id}_${po.vendor.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Purchase Price Offer (PPO) & Work Orders (PO)</h2>
          <p className="text-xs text-slate-500">Generate internal PPO approvals, route to management, and issue formal Work Orders / Purchase Orders with PDF generation.</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-bold">
        <button
          onClick={() => setSubTab('PPO')}
          className={`pb-3 flex items-center space-x-1.5 ${
            subTab === 'PPO' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Purchase Price Offers (PPO)</span>
        </button>
        <button
          onClick={() => setSubTab('PO')}
          className={`pb-3 flex items-center space-x-1.5 ${
            subTab === 'PO' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileBadge className="w-4 h-4" />
          <span>Issued Work Orders / POs</span>
        </button>
      </div>

      {/* PPO Table */}
      {subTab === 'PPO' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Internal Commercial Approval Documents (PPO)</h3>
            <button
              onClick={onOpenCreatePPO}
              className="text-xs bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft New PPO from Final Negotiation</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">PPO Number</th>
                  <th className="p-3">PR Reference</th>
                  <th className="p-3">Recommended Vendor</th>
                  <th className="p-3 text-right">Negotiated Amount (₹)</th>
                  <th className="p-3">Payment Terms</th>
                  <th className="p-3">Approval Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ppos.map(ppo => (
                  <tr key={ppo.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-sky-700">{ppo.id}</td>
                    <td className="p-3 font-mono text-slate-600">{ppo.prId}</td>
                    <td className="p-3 font-bold text-slate-800">{ppo.vendor}</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">₹ {ppo.grandTotal.toLocaleString()}</td>
                    <td className="p-3 text-slate-600">{ppo.paymentTerms}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ppo.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ppo.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {ppo.status === 'PENDING_APPROVAL' ? (
                        <button
                          onClick={() => approvePPO(ppo.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm"
                        >
                          Approve & Issue PO
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold">PO Generated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PO Table */}
      {subTab === 'PO' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Formally Issued Work Orders & Purchase Orders</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">PPO Ref</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3 text-right">Final Value (₹)</th>
                  <th className="p-3">Issuance Date</th>
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
