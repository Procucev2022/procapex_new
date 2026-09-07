'use client';

import React, { useState } from 'react';
import {
  Store,
  Send,
  FileEdit,
  CheckCircle2,
  Clock,
  Split,
  History,
  FileCheck2,
  Award,
  CreditCard,
  Truck,
  ShieldCheck,
  Download,
  AlertTriangle,
  User,
  Check,
  FileText,
  Calculator
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

interface VendorQuoteItem {
  code: string;
  desc: string;
  uom: string;
  qty: number;
  rate1: number;
  targetRate: number;
  rate2: number;
}

const INITIAL_ITEMS: VendorQuoteItem[] = [
  { code: 'CNT-TOP-GRN20', desc: '20mm Polished Jet Black Granite Countertop', uom: 'Sqm', qty: 12.5, rate1: 3900, targetRate: 3380, rate2: 3650 },
  { code: 'CNT-PLY-BWP18', desc: '18mm Marine Grade BWP Plywood (IS 710)', uom: 'Sqm', qty: 38.0, rate1: 1650, targetRate: 1435, rate2: 1540 },
  { code: 'CNT-LAM-1MM', desc: '1.0mm Textured HPL Laminate Fascia', uom: 'Sqm', qty: 24.0, rate1: 980, targetRate: 850, rate2: 910 },
  { code: 'CNT-HDW-SOFT', desc: 'Soft-Close Concealed Hinges & Telescopic Slides', uom: 'Set', qty: 14.0, rate1: 2100, targetRate: 1715, rate2: 1950 },
  { code: 'CNT-LED-PROF', desc: '12V DC Warm White LED Strip in Profile', uom: 'Rmt', qty: 16.0, rate1: 450, targetRate: 365, rate2: 410 },
  { code: 'CNT-SKT-SS304', desc: '100mm SS 304 Brushed Skirting', uom: 'Rmt', qty: 14.0, rate1: 850, targetRate: 705, rate2: 780 }
];

export const VendorPortal: React.FC = () => {
  const [activeVendor, setActiveVendor] = useState<'VND-001' | 'VND-002' | 'VND-005'>('VND-001');
  const [activePR, setActivePR] = useState<'PR-2026-0005' | 'PR-2026-0003'>('PR-2026-0005');
  const [activeTab, setActiveTab] = useState<'quote1' | 'quote2' | 'final' | 'ppo'>('quote1');
  
  const [items, setItems] = useState<VendorQuoteItem[]>(INITIAL_ITEMS);
  const [rfqAccepted, setRfqAccepted] = useState<boolean>(false);
  const [ppoAccepted, setPpoAccepted] = useState<boolean>(false);
  const [quote1Submitted, setQuote1Submitted] = useState<boolean>(false);
  const [quote2Submitted, setQuote2Submitted] = useState<boolean>(false);

  // Round 1 Terms & Conditions State
  const [terms1, setTerms1] = useState({
    paymentStructure: 'PRESET_1',
    creditDays: '30 Days Net',
    advPct: '10%',
    retPct: '10%',
    abg: 'YES',
    leadTime: '12 - 15 Calendar Days',
    deliveryDate: '2026-09-25',
    incoterms: 'FOR_SITE',
    warranty: '12 Months Defect Liability Period + 24 Months OEM Hardware Warranty',
    deviations: '100% Compliant with PR scope specifications. Safe unloading and vertical hoisting included at site.'
  });

  // Round 2 (BAFO) Terms & Conditions State
  const [terms2, setTerms2] = useState({
    paymentStructure: 'PRESET_1',
    creditDays: '30 Days Net',
    advPct: '10%',
    retPct: '10%',
    abg: 'YES',
    leadTime: '12 - 15 Calendar Days',
    deliveryDate: '2026-09-25',
    incoterms: 'FOR_SITE',
    warranty: '12 Months Defect Liability Period + 24 Months OEM Hardware Warranty',
    deviations: 'Concession discount applied referencing buyer target counter-offer. Priority factory staging guaranteed.'
  });

  const handleRate1Change = (idx: number, val: string) => {
    const updated = [...items];
    updated[idx].rate1 = parseFloat(val) || 0;
    setItems(updated);
  };

  const handleRate2Change = (idx: number, val: string) => {
    const updated = [...items];
    updated[idx].rate2 = parseFloat(val) || 0;
    setItems(updated);
  };

  const handlePaymentPreset1 = (preset: string) => {
    let adv = '10%';
    let ret = '10%';
    let cred = '30 Days Net';
    if (preset === 'PRESET_2') {
      adv = '15%';
      ret = '10%';
      cred = '30 Days Net';
    } else if (preset === 'PRESET_3') {
      adv = '0%';
      ret = '5%';
      cred = '30 Days Net';
    } else if (preset === 'PRESET_4') {
      adv = '0%';
      ret = '5%';
      cred = '45 Days Net';
    } else if (preset === 'PRESET_5') {
      adv = '10%';
      ret = '10%';
      cred = '30 Days Net';
    }
    setTerms1(prev => ({ ...prev, paymentStructure: preset, advPct: adv, retPct: ret, creditDays: cred }));
  };

  const handlePaymentPreset2 = (preset: string) => {
    let adv = '10%';
    let ret = '10%';
    let cred = '30 Days Net';
    if (preset === 'PRESET_2') {
      adv = '15%';
      ret = '10%';
      cred = '30 Days Net';
    } else if (preset === 'PRESET_3') {
      adv = '0%';
      ret = '5%';
      cred = '30 Days Net';
    } else if (preset === 'PRESET_4') {
      adv = '0%';
      ret = '5%';
      cred = '45 Days Net';
    } else if (preset === 'PRESET_5') {
      adv = '10%';
      ret = '10%';
      cred = '30 Days Net';
    }
    setTerms2(prev => ({ ...prev, paymentStructure: preset, advPct: adv, retPct: ret, creditDays: cred }));
  };

  // Calculations
  const net1stQuote = items.reduce((acc, it) => acc + it.qty * it.rate1, 0);
  const gst1stQuote = Math.round(net1stQuote * 0.18);
  const gross1stQuote = net1stQuote + gst1stQuote;

  const netBuyerTarget = items.reduce((acc, it) => acc + it.qty * it.targetRate, 0);

  const net2ndQuote = items.reduce((acc, it) => acc + it.qty * it.rate2, 0);
  const gst2ndQuote = Math.round(net2ndQuote * 0.18);
  const gross2ndQuote = net2ndQuote + gst2ndQuote;

  const totalSavings = net1stQuote - net2ndQuote;
  const savingsPct = net1stQuote > 0 ? ((totalSavings / net1stQuote) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      
      {/* 1. VENDOR HEADER & IDENTITY CONTEXT BAR */}
      <div className="bg-gradient-to-r from-purple-950 via-brand-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-purple-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-purple-500/30 text-purple-300 border border-purple-400/40 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Store className="w-3 h-3" />
                <span>Role 7: Vendor Portal & Supplier Workbench</span>
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Active RFQ: <strong className="text-sky-300">{activePR}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1">
              {activeVendor === 'VND-001' ? 'DesignCraft Millworks & Interiors Pvt Ltd (VND-001)' :
               activeVendor === 'VND-002' ? 'Apex Modular Systems Pvt Ltd (VND-002)' :
               'NorthCraft Engineering & Woodworks (VND-005)'}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Project: <strong className="text-white">Godrej Woods, Tower C</strong> • Requisition: <strong className="text-sky-300">Reception Counter Fabrication (Drawing: Counter Elevation D)</strong> • Site: <strong>Sector 43, Noida</strong>
            </p>
          </div>

          {/* Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-purple-900/60 rounded-xl px-3 py-1.5 border border-purple-500/40 shadow-inner">
              <User className="w-3.5 h-3.5 text-purple-300 mr-2 shrink-0" />
              <span className="text-[11px] text-slate-300 mr-1.5 font-medium">Vendor:</span>
              <select
                value={activeVendor}
                onChange={(e) => setActiveVendor(e.target.value as any)}
                className="bg-purple-950 text-purple-200 text-xs font-bold rounded-lg px-2 py-1 border border-purple-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="VND-001">Vendor 1 (DesignCraft Millworks - Mumbai)</option>
                <option value="VND-002">Vendor 2 (Apex Modular Systems - Pune)</option>
                <option value="VND-005">Vendor 5 (NorthCraft Engineering - Noida)</option>
              </select>
            </div>

            <div className="flex items-center bg-slate-900/80 rounded-xl px-3 py-1.5 border border-slate-700 shadow-inner">
              <FileText className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0" />
              <span className="text-[11px] text-slate-300 mr-1.5 font-medium">RFQ:</span>
              <select
                value={activePR}
                onChange={(e) => setActivePR(e.target.value as any)}
                className="bg-slate-800 text-sky-200 text-xs font-bold rounded-lg px-2 py-1 border border-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="PR-2026-0005">PR-2026-0005 (Millwork & Counter)</option>
                <option value="PR-2026-0003">PR-2026-0003 (HVAC Chillers Package)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ribbon: RFQ Closure Deadline, Acceptance & PPO Award */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-purple-800/60 text-xs">
          
          {/* RFQ Closure Countdown */}
          <div className="bg-purple-900/40 p-3 rounded-xl border border-purple-700/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-300 uppercase font-bold block">RFQ Closure Deadline:</span>
              <strong className="text-white text-xs font-mono">15-Sep-2026 18:00 IST</strong>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>3 Days Left</span>
            </span>
          </div>

          {/* RFQ Acceptance Status */}
          <div className="bg-purple-900/40 p-3 rounded-xl border border-purple-700/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-300 uppercase font-bold block">RFQ Participation:</span>
              <strong className="text-emerald-300 text-xs font-sans">
                {rfqAccepted ? '✓ RFQ Accepted & Confirmed' : 'Action: Pending Acceptance'}
              </strong>
            </div>
            {rfqAccepted ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                Active Bidder
              </span>
            ) : (
              <button
                onClick={() => setRfqAccepted(true)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-xs"
              >
                Accept RFQ
              </button>
            )}
          </div>

          {/* PPO Award Status */}
          <div className="bg-purple-900/40 p-3 rounded-xl border border-purple-700/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-300 uppercase font-bold block">Award / PPO Offer:</span>
              <strong className="text-white text-xs font-mono">
                {ppoAccepted ? 'PPO-2026-0005 Accepted' : 'PPO-2026-0005 Ready for Review'}
              </strong>
            </div>
            <button
              onClick={() => setActiveTab('ppo')}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold shadow-xs flex items-center space-x-1"
            >
              <Award className="w-3 h-3" />
              <span>{ppoAccepted ? 'View PO' : 'Review Offer →'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-TAB NAVIGATION (4 INTEGRATED SUB-TABS) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center space-x-1 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('quote1')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'quote1' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>1. 1st Round Quote (Pricing & Terms)</span>
          </button>
          <button
            onClick={() => setActiveTab('quote2')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'quote2' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Split className="w-4 h-4" />
            <span>2. 2nd Quote / BAFO (with 1st Quote Comparison & Terms)</span>
          </button>
          <button
            onClick={() => setActiveTab('final')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'final' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>3. Final Quote & Multi-Round Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('ppo')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'ppo' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>4. PPO Award Review & Acceptance Console</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SUB-TAB 1: 1ST ROUND QUOTATION (PRICING + TERMS & CONDITIONS + SUBMIT) */}
        {/* ========================================================================= */}
        {activeTab === 'quote1' && (
          <div className="space-y-6 pt-4">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-purple-50/70 p-4 rounded-xl border border-purple-200">
              <div>
                <h3 className="text-sm font-black text-purple-950 flex items-center space-x-2">
                  <FileEdit className="w-4 h-4 text-purple-600" />
                  <span>Initial Quotation Schedule (Round 1 Submission)</span>
                </h3>
                <p className="text-xs text-purple-800 mt-0.5">
                  Enter itemized unit rates and specify your commercial terms & conditions below before submitting.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-lg border border-purple-300 text-purple-950">
                {quote1Submitted ? 'Round 1: Submitted ✓' : 'Round 1: Open for Submission'}
              </span>
            </div>

            {/* Section 1.1: Pricing Schedule Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Calculator className="w-3.5 h-3.5 text-purple-600" />
                <span>Part A: Itemized Commercial Pricing Schedule (Unit Rates) :*</span>
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3 w-32">Item Code</th>
                      <th className="p-3">Specification & Scope</th>
                      <th className="p-3 w-20 text-center">UOM</th>
                      <th className="p-3 w-24 text-right">BOQ Qty</th>
                      <th className="p-3 w-36 text-right bg-purple-100 text-purple-950 font-black border-l border-r border-purple-200">
                        1st Quote Unit Rate (₹) *
                      </th>
                      <th className="p-3 w-36 text-right font-mono font-bold text-slate-900">Line Total (₹)</th>
                      <th className="p-3 w-28 text-center">Tech Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {items.map((it, idx) => {
                      const lineTot = it.qty * it.rate1;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-slate-400 text-center">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-sky-800 text-[11px]">{it.code}</td>
                          <td className="p-3 font-sans">
                            <span className="font-bold text-slate-900 block">{it.desc}</span>
                            <span className="text-[10px] text-slate-500 font-normal">Spec: IS Standard • Drawing: Elevation D</span>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700">{it.uom}</td>
                          <td className="p-3 text-right font-bold text-slate-900">{it.qty}</td>
                          <td className="p-3 text-right bg-purple-50/70 border-l border-r border-purple-200">
                            <input
                              type="number"
                              value={it.rate1}
                              onChange={(e) => handleRate1Change(idx, e.target.value)}
                              className="w-24 px-2 py-1 text-xs font-black text-purple-950 font-mono bg-white border border-purple-300 rounded text-right shadow-inner focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            />
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">₹ {Math.round(lineTot).toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Meets Specs
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t font-mono">
                    <tr>
                      <td colSpan={5} className="p-3 text-right font-sans uppercase">Total Net Quotation Subtotal:</td>
                      <td colSpan={2} className="p-3 text-right font-mono text-base font-black text-purple-950">
                        ₹ {Math.round(net1stQuote).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="p-3 text-right font-sans uppercase text-slate-500">Applicable GST @ 18%:</td>
                      <td colSpan={2} className="p-3 text-right font-mono text-slate-700">
                        ₹ {gst1stQuote.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr className="bg-purple-100 text-purple-950 font-black">
                      <td colSpan={5} className="p-3 text-right font-sans uppercase">Gross Quoted Package Bid (Incl. GST):</td>
                      <td colSpan={2} className="p-3 text-right font-mono text-base text-purple-950">
                        ₹ {gross1stQuote.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Section 1.2: Integrated Quoted Terms & Conditions (Editable) */}
            <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-5 space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Part B: Quoted Terms & Conditions (Payment, Delivery & Commercial Clauses) :*</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Customize payment milestones, lead times, and warranty terms for your 1st round quote.</p>
                </div>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200">
                  Editable Quoted Terms
                </span>
              </div>

              {/* Payment Terms & Milestones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block font-bold text-slate-800">Quoted Payment Milestone Formula :</label>
                  <select
                    value={terms1.paymentStructure}
                    onChange={(e) => handlePaymentPreset1(e.target.value)}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="PRESET_1">10% Advance | 70% Progress RA | 10% Handover | 10% DLP (30D Credit) [PR Baseline Standard]</option>
                    <option value="PRESET_2">15% Advance | 75% Progress RA | 10% DLP (30D Credit) [Fast Track / Tooling Mobilization]</option>
                    <option value="PRESET_3">30 Days Net Credit from GRN / Site Delivery (0% Advance, 5% Retention) [Credit Standard]</option>
                    <option value="PRESET_4">45 Days Net Credit from Invoice Submission (0% Advance, 5% Retention) [Enterprise Credit]</option>
                    <option value="PRESET_5">10% Advance | 80% Supply & Erection | 10% Retention (30D Credit) [Master Rate Card]</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Credit Days from Certification :</label>
                  <input
                    type="text"
                    value={terms1.creditDays}
                    onChange={(e) => setTerms1({ ...terms1, creditDays: e.target.value })}
                    className="w-full bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Advance Payment (%):</label>
                  <input
                    type="text"
                    value={terms1.advPct}
                    onChange={(e) => setTerms1({ ...terms1, advPct: e.target.value })}
                    className="w-full bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Retention / DLP Withholding (%):</label>
                  <input
                    type="text"
                    value={terms1.retPct}
                    onChange={(e) => setTerms1({ ...terms1, retPct: e.target.value })}
                    className="w-full bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Advance Bank Guarantee (ABG):</label>
                  <select
                    value={terms1.abg}
                    onChange={(e) => setTerms1({ ...terms1, abg: e.target.value })}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="YES">Yes - ABG Submitted for Advance &gt; 10%</option>
                    <option value="NO">No - Not Applicable for Empanelled Vendor</option>
                  </select>
                </div>
              </div>

              {/* Delivery Timelines & Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-200">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Committed Delivery Lead Time :</label>
                  <input
                    type="text"
                    value={terms1.leadTime}
                    onChange={(e) => setTerms1({ ...terms1, leadTime: e.target.value })}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Expected Site Handover Date :</label>
                  <input
                    type="date"
                    value={terms1.deliveryDate}
                    onChange={(e) => setTerms1({ ...terms1, deliveryDate: e.target.value })}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Quoted Price Basis / IncoTerms :</label>
                  <select
                    value={terms1.incoterms}
                    onChange={(e) => setTerms1({ ...terms1, incoterms: e.target.value })}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="FOR_SITE">FOR Site (Freight, Packing, Handling & Transit Insurance Included)</option>
                    <option value="EX_WORKS">Ex-Works Factory (Client Arranges Logistics)</option>
                  </select>
                </div>
              </div>

              {/* Warranty & Deviations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Warranty & DLP Coverage :</label>
                  <input
                    type="text"
                    value={terms1.warranty}
                    onChange={(e) => setTerms1({ ...terms1, warranty: e.target.value })}
                    className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Commercial Deviations / Specific Scope Notes :</label>
                  <textarea
                    rows={2}
                    value={terms1.deviations}
                    onChange={(e) => setTerms1({ ...terms1, deviations: e.target.value })}
                    className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    placeholder="Specify any technical exceptions or commercial variances..."
                  />
                </div>
              </div>
            </div>

            {/* Section 1.3: SUBMIT 1ST ROUND FORMAL QUOTATION (AFTER TERMS & CONDITIONS) */}
            <div className="p-5 bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 text-white rounded-2xl border border-purple-700 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="font-black text-sm text-white block">Ready to Submit 1st Round Formal Quotation?</span>
                <p className="text-xs text-purple-200">
                  Both your itemized commercial unit rates and quoted terms & conditions will be transmitted directly to Category Manager's 4-Way Commercial Matrix.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuote1Submitted(true);
                  alert(`1st Round Formal Quotation (₹ ${Math.round(net1stQuote).toLocaleString()} + Quoted Terms) submitted successfully to Category Manager!`);
                }}
                className="bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs px-8 py-3.5 rounded-xl shadow-lg flex items-center space-x-2 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{quote1Submitted ? '1st Round Quotation Submitted ✓' : 'Submit 1st Round Formal Quotation (Pricing + Terms) →'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: 2ND QUOTE (WITH 1ST QUOTE COMPARISON + TERMS + SUBMIT) */}
        {/* ========================================================================= */}
        {activeTab === 'quote2' && (
          <div className="space-y-6 pt-4">
            
            {/* Category Manager Counter-Offer Alert Box */}
            <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-white p-5 rounded-2xl border border-sky-700 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-sky-500/30 text-sky-300 border border-sky-400/40 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                      Category Manager Counter-Offer Received
                    </span>
                    <span className="text-xs text-slate-300 font-mono">Negotiation Round 1.5</span>
                  </div>
                  <h3 className="text-base font-black text-white mt-1">Buyer Target Counter Proposal & Concession Request</h3>
                  <p className="text-xs text-sky-200/90 mt-0.5">
                    Category Manager has requested a revised best-and-final-offer (BAFO) referencing AI Should-Cost benchmarks. Review your 1st quote and target rates below.
                  </p>
                </div>
                <div className="text-right bg-sky-900/60 p-3 rounded-xl border border-sky-600 font-mono">
                  <span className="text-[10px] text-sky-300 uppercase font-bold block">Buyer Target Total:</span>
                  <span className="text-lg font-black text-amber-300">₹ {Math.round(netBuyerTarget).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Section 2.1: Side-by-Side Comparison Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Split className="w-3.5 h-3.5 text-purple-600" />
                  <span>Part A: Side-by-Side 2nd Quote Schedule with 1st Quote Comparison :*</span>
                </h4>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  Live Comparison & Variance Tracker
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3 w-56">Item Code & Specification</th>
                      <th className="p-3 w-20 text-right">Qty & UOM</th>
                      {/* 1st Quote Reference Column (Read-Only) */}
                      <th className="p-3 text-right bg-rose-50 font-mono text-rose-950 border-l border-r border-rose-200 min-w-[150px]">
                        1st Quote Rate & Amount (₹)
                        <span className="block text-[9px] text-rose-700 font-sans font-normal">Original Submitted Bid</span>
                      </th>
                      {/* Buyer Target Counter Column */}
                      <th className="p-3 text-right bg-sky-50 font-mono text-sky-950 border-r border-sky-200 min-w-[150px]">
                        Buyer Target Rate (₹)
                        <span className="block text-[9px] text-sky-700 font-sans font-normal">CM Counter-Offer</span>
                      </th>
                      {/* 2nd Quote Input Column (Editable) */}
                      <th className="p-3 text-right bg-emerald-100 font-mono text-emerald-950 border-r border-emerald-300 min-w-[170px]">
                        2nd Quote / BAFO Rate (₹) *
                        <span className="block text-[9px] text-emerald-800 font-sans font-bold">Editable Revised Unit Rate</span>
                      </th>
                      {/* 2nd Quote Line Total */}
                      <th className="p-3 text-right font-mono font-bold text-slate-900 min-w-[130px]">
                        2nd Quote Amount (₹)
                        <span className="block text-[9px] text-slate-500 font-sans font-normal">Qty × 2nd Rate</span>
                      </th>
                      {/* Variance vs 1st Quote */}
                      <th className="p-3 text-center bg-slate-50 font-mono text-slate-800 min-w-[120px]">
                        Variance vs 1st Quote
                        <span className="block text-[9px] text-slate-500 font-sans font-normal">Concession (%)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {items.map((it, idx) => {
                      const amt1 = it.qty * it.rate1;
                      const targetAmt = it.qty * it.targetRate;
                      const amt2 = it.qty * it.rate2;
                      const variance = it.rate1 > 0 ? (((it.rate2 - it.rate1) / it.rate1) * 100).toFixed(1) : '0.0';
                      const deltaTarget = it.rate2 - it.targetRate;

                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                          <td className="p-3 font-sans">
                            <span className="font-bold text-slate-900 block text-xs">{it.desc}</span>
                            <span className="font-mono text-sky-800 text-[10px]">{it.code}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800 font-mono">{it.qty} {it.uom}</td>
                          
                          {/* 1st Quote Reference (Read-Only) */}
                          <td className="p-3 text-right bg-rose-50/50 font-mono border-l border-r border-rose-200">
                            <div className="font-bold text-slate-900 text-xs">₹ {it.rate1.toLocaleString()}</div>
                            <div className="text-[10px] text-rose-700 font-semibold">Amt: ₹ {Math.round(amt1).toLocaleString()}</div>
                          </td>

                          {/* Buyer Target Counter */}
                          <td className="p-3 text-right bg-sky-50/50 font-mono border-r border-sky-200">
                            <div className="font-bold text-sky-950 text-xs">₹ {it.targetRate.toLocaleString()}</div>
                            <div className="text-[10px] text-sky-700 font-semibold">Target: ₹ {Math.round(targetAmt).toLocaleString()}</div>
                          </td>

                          {/* 2nd Quote Rate Input (Editable) */}
                          <td className="p-3 text-right bg-emerald-50/70 border-r border-emerald-300">
                            <div className="flex items-center justify-end space-x-1">
                              <span className="text-emerald-800 text-xs font-bold">₹</span>
                              <input
                                type="number"
                                value={it.rate2}
                                onChange={(e) => handleRate2Change(idx, e.target.value)}
                                className="w-24 px-2 py-1 text-xs font-black text-emerald-950 font-mono bg-white border border-emerald-400 rounded text-right shadow-inner focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                              />
                            </div>
                          </td>

                          {/* 2nd Quote Amount */}
                          <td className="p-3 text-right font-mono font-black text-slate-900 text-xs">
                            ₹ {Math.round(amt2).toLocaleString()}
                          </td>

                          {/* Variance Badge */}
                          <td className="p-3 text-center bg-slate-50">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                              parseFloat(variance) < 0 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {variance}%
                            </span>
                            <div className={`text-[9px] ${deltaTarget <= 0 ? 'text-emerald-700 font-bold' : 'text-amber-700'} mt-0.5`}>
                              {deltaTarget <= 0 ? '✓ Meets Target' : `+₹${deltaTarget} over target`}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900 font-mono">
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-sans uppercase font-black">PACKAGE TOTALS:</td>
                      <td className="p-3 text-right bg-rose-100 text-rose-950 font-black">
                        <div className="text-xs">₹ {Math.round(net1stQuote).toLocaleString()}</div>
                        <div className="text-[9px] font-normal text-rose-800">1st Quote Sum</div>
                      </td>
                      <td className="p-3 text-right bg-sky-100 text-sky-950 font-black">
                        <div className="text-xs">₹ {Math.round(netBuyerTarget).toLocaleString()}</div>
                        <div className="text-[9px] font-normal text-sky-800">Buyer Target Sum</div>
                      </td>
                      <td colSpan={2} className="p-3 text-right bg-emerald-100 text-emerald-950 font-black text-sm">
                        <div className="text-sm">₹ {Math.round(net2ndQuote).toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-800 font-semibold">Net 2nd Quote Subtotal</div>
                      </td>
                      <td className="p-3 text-center bg-slate-100 text-purple-950 font-black">
                        <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-950 text-[10px]">
                          -{savingsPct}% Discount
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 2nd Quote Summary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="bg-white p-3.5 rounded-xl border space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">1st Round Quote Total:</span>
                  <strong className="text-base font-black text-rose-900 font-mono">₹ {Math.round(net1stQuote).toLocaleString()}</strong>
                </div>
                <div className="bg-white p-3.5 rounded-xl border space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Buyer Counter Target:</span>
                  <strong className="text-base font-black text-sky-900 font-mono">₹ {Math.round(netBuyerTarget).toLocaleString()}</strong>
                </div>
                <div className="bg-white p-3.5 rounded-xl border space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Revised 2nd Quote Total:</span>
                  <strong className="text-base font-black text-emerald-900 font-mono">₹ {Math.round(net2ndQuote).toLocaleString()}</strong>
                </div>
                <div className="bg-white p-3.5 rounded-xl border space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Net Concession / Discount:</span>
                  <strong className="text-base font-black text-purple-900 font-mono">₹ {Math.round(totalSavings).toLocaleString()} (-{savingsPct}%)</strong>
                </div>
              </div>
            </div>

            {/* Section 2.2: Round 2 Revised Quoted Terms & Conditions (Editable) */}
            <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-5 space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Part B: Round 2 Revised Terms & Conditions (Payment, Delivery & Commercial Concessions) :*</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Vendors can offer enhanced payment milestones, reduced advance %, or faster lead times for Round 2 BAFO.</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Round 2 Terms Customizer
                </span>
              </div>

              {/* Payment Terms & Milestones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block font-bold text-slate-800">Quoted Payment Milestone Formula :</label>
                  <select
                    value={terms2.paymentStructure}
                    onChange={(e) => handlePaymentPreset2(e.target.value)}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="PRESET_1">10% Advance | 70% Progress RA | 10% Handover | 10% DLP (30D Credit) [PR Baseline Standard]</option>
                    <option value="PRESET_2">15% Advance | 75% Progress RA | 10% DLP (30D Credit) [Fast Track / Tooling Mobilization]</option>
                    <option value="PRESET_3">30 Days Net Credit from GRN / Site Delivery (0% Advance, 5% Retention) [Credit Standard]</option>
                    <option value="PRESET_4">45 Days Net Credit from Invoice Submission (0% Advance, 5% Retention) [Enterprise Credit]</option>
                    <option value="PRESET_5">10% Advance | 80% Supply & Erection | 10% Retention (30D Credit) [Master Rate Card]</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Credit Days from Certification :</label>
                  <input
                    type="text"
                    value={terms2.creditDays}
                    onChange={(e) => setTerms2({ ...terms2, creditDays: e.target.value })}
                    className="w-full bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Advance Payment (%):</label>
                  <input
                    type="text"
                    value={terms2.advPct}
                    onChange={(e) => setTerms2({ ...terms2, advPct: e.target.value })}
                    className="w-full bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Retention / DLP Withholding (%):</label>
                  <input
                    type="text"
                    value={terms2.retPct}
                    onChange={(e) => setTerms2({ ...terms2, retPct: e.target.value })}
                    className="w-full bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Advance Bank Guarantee (ABG):</label>
                  <select
                    value={terms2.abg}
                    onChange={(e) => setTerms2({ ...terms2, abg: e.target.value })}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="YES">Yes - ABG Submitted for Advance &gt; 10%</option>
                    <option value="NO">No - Not Applicable for Empanelled Vendor</option>
                  </select>
                </div>
              </div>

              {/* Delivery Timelines & Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-200">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Committed Delivery Lead Time :</label>
                  <input
                    type="text"
                    value={terms2.leadTime}
                    onChange={(e) => setTerms2({ ...terms2, leadTime: e.target.value })}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Expected Site Handover Date :</label>
                  <input
                    type="date"
                    value={terms2.deliveryDate}
                    onChange={(e) => setTerms2({ ...terms2, deliveryDate: e.target.value })}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Quoted Price Basis / IncoTerms :</label>
                  <select
                    value={terms2.incoterms}
                    onChange={(e) => setTerms2({ ...terms2, incoterms: e.target.value })}
                    className="w-full bg-white font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="FOR_SITE">FOR Site (Freight, Packing, Handling & Transit Insurance Included)</option>
                    <option value="EX_WORKS">Ex-Works Factory (Client Arranges Logistics)</option>
                  </select>
                </div>
              </div>

              {/* Warranty & Deviations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Warranty & DLP Coverage :</label>
                  <input
                    type="text"
                    value={terms2.warranty}
                    onChange={(e) => setTerms2({ ...terms2, warranty: e.target.value })}
                    className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Commercial Deviations & Concession Notes :</label>
                  <textarea
                    rows={2}
                    value={terms2.deviations}
                    onChange={(e) => setTerms2({ ...terms2, deviations: e.target.value })}
                    className="w-full bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    placeholder="Specify any commercial concessions or specific scope notes..."
                  />
                </div>
              </div>
            </div>

            {/* Section 2.3: SUBMIT REVISED 2ND QUOTE (BAFO) (AFTER TERMS & CONDITIONS) */}
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-700 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="font-black text-sm text-white block">Ready to Submit Revised 2nd Quote (BAFO)?</span>
                <p className="text-xs text-emerald-200">
                  Submitting revised 2nd quote and terms will update Category Manager's Negotiation Hub and 4-Way CBA Matrix in real time.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuote2Submitted(true);
                  alert(`Revised 2nd Quote (BAFO: ₹ ${Math.round(net2ndQuote).toLocaleString()} + Revised Terms) submitted successfully to Category Manager!`);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-8 py-3.5 rounded-xl shadow-lg flex items-center space-x-2 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{quote2Submitted ? 'Revised 2nd Quote Submitted ✓' : 'Submit Revised 2nd Quote (BAFO) & Commercial Terms →'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 3: FINAL QUOTE & MULTI-ROUND SUMMARY */}
        {/* ========================================================================= */}
        {activeTab === 'final' && (
          <div className="space-y-5 pt-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Multi-Round Quotation History & Final Settlement Record</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Audit log of 1st Quote, Buyer Counter Target, 2nd Quote (BAFO), and Final Agreed Commercial Package.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-purple-100 text-purple-900 border border-purple-300">
                  BAFO Agreed & Ready for PPO Award
                </span>
              </div>

              {/* Progression Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 space-y-1">
                  <span className="text-[10px] text-rose-800 uppercase font-bold block">Round 1: Initial Quote</span>
                  <strong className="text-base font-black text-rose-950 font-mono">₹ {Math.round(net1stQuote).toLocaleString()}</strong>
                  <p className="text-[10px] text-rose-700">Submitted on RFQ Float</p>
                </div>

                <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200 space-y-1">
                  <span className="text-[10px] text-sky-800 uppercase font-bold block">Round 1.5: Buyer Target</span>
                  <strong className="text-base font-black text-sky-950 font-mono">₹ {Math.round(netBuyerTarget).toLocaleString()}</strong>
                  <p className="text-[10px] text-sky-700">CM Should-Cost Target</p>
                </div>

                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Round 2: 2nd Quote (BAFO)</span>
                  <strong className="text-base font-black text-emerald-950 font-mono">₹ {Math.round(net2ndQuote).toLocaleString()}</strong>
                  <p className="text-[10px] text-emerald-700">Revised BAFO Active</p>
                </div>

                <div className="bg-purple-100 p-3.5 rounded-xl border border-purple-300 space-y-1">
                  <span className="text-[10px] text-purple-900 uppercase font-black block">Final Commercial Award</span>
                  <strong className="text-base font-black text-purple-950 font-mono">₹ {Math.round(net2ndQuote).toLocaleString()}</strong>
                  <p className="text-[10px] text-purple-800 font-bold">Award Settlement Basis</p>
                </div>
              </div>

              {/* Audit Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">Item Code & Specification</th>
                      <th className="p-3 text-right">Qty & UOM</th>
                      <th className="p-3 text-right bg-rose-50 text-rose-950 font-mono">1st Quote Rate (₹)</th>
                      <th className="p-3 text-right bg-sky-50 text-sky-950 font-mono">Buyer Counter Rate (₹)</th>
                      <th className="p-3 text-right bg-emerald-50 text-emerald-950 font-mono">2nd Quote Rate (₹)</th>
                      <th className="p-3 text-right bg-purple-50 text-purple-950 font-mono font-black">Final Agreed Rate (₹)</th>
                      <th className="p-3 text-right font-mono font-bold text-slate-900">Total Net Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {items.map((it, idx) => {
                      const finalAmt = it.qty * it.rate2;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-slate-400 text-center">{idx + 1}</td>
                          <td className="p-3 font-sans">
                            <span className="font-bold text-slate-900 block text-xs">{it.desc}</span>
                            <span className="font-mono text-sky-800 text-[10px]">{it.code}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800 font-mono">{it.qty} {it.uom}</td>
                          <td className="p-3 text-right bg-rose-50/50 font-mono font-bold text-slate-800">₹ {it.rate1.toLocaleString()}</td>
                          <td className="p-3 text-right bg-sky-50/50 font-mono font-bold text-sky-950">₹ {it.targetRate.toLocaleString()}</td>
                          <td className="p-3 text-right bg-emerald-50/50 font-mono font-bold text-emerald-950">₹ {it.rate2.toLocaleString()}</td>
                          <td className="p-3 text-right bg-purple-100 font-mono font-black text-purple-950">₹ {it.rate2.toLocaleString()}</td>
                          <td className="p-3 text-right font-mono font-black text-slate-900">₹ {Math.round(finalAmt).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900 font-mono">
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-sans uppercase font-black">PACKAGE TOTALS:</td>
                      <td className="p-3 text-right bg-rose-100 text-rose-950 font-black">₹ {Math.round(net1stQuote).toLocaleString()}</td>
                      <td className="p-3 text-right bg-sky-100 text-sky-950 font-black">₹ {Math.round(netBuyerTarget).toLocaleString()}</td>
                      <td className="p-3 text-right bg-emerald-100 text-emerald-950 font-black">₹ {Math.round(net2ndQuote).toLocaleString()}</td>
                      <td className="p-3 text-right bg-purple-200 text-purple-950 font-black text-sm">₹ {Math.round(net2ndQuote).toLocaleString()}</td>
                      <td className="p-3 text-right text-purple-950 font-black text-sm">₹ {Math.round(net2ndQuote).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 4: PPO AWARD REVIEW & ACCEPTANCE CONSOLE */}
        {/* ========================================================================= */}
        {activeTab === 'ppo' && (
          <div className="space-y-5 pt-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded">
                      PPO-2026-0005
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ppoAccepted ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {ppoAccepted ? '✓ PPO Accepted & Order Active' : 'Action Required: Pending Vendor Acceptance'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Reception Counter Fabrication (Drawing: Counter Elevation D)</h3>
                  <p className="text-xs text-slate-500">
                    Buyer Entity: <strong>L&T Infra & Construction</strong> • Awarded Vendor: <strong className="text-slate-800">
                      {activeVendor === 'VND-001' ? 'DesignCraft Millworks & Interiors Pvt Ltd' : activeVendor === 'VND-002' ? 'Apex Modular Systems Pvt Ltd' : 'NorthCraft Engineering & Woodworks'}
                    </strong>
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Awarded Grand Total (Incl. 18% GST)</span>
                  <span className="text-2xl font-black text-emerald-700">₹ {gross2ndQuote.toLocaleString()}</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-3 w-10">#</th>
                      <th className="p-3">Item Code & Specification</th>
                      <th className="p-3 text-right">Qty & UOM</th>
                      <th className="p-3 text-right font-mono">Awarded Rate (₹)</th>
                      <th className="p-3 text-right font-mono font-bold">Total Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-sans font-bold text-slate-900">
                          {it.desc} <span className="font-mono text-sky-700 text-[10px] block">{it.code}</span>
                        </td>
                        <td className="p-3 text-right font-bold">{it.qty} {it.uom}</td>
                        <td className="p-3 text-right font-bold text-slate-800">₹ {it.rate2.toLocaleString()}</td>
                        <td className="p-3 text-right font-black text-emerald-950">₹ {Math.round(it.qty * it.rate2).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold font-mono border-t">
                    <tr>
                      <td colSpan={4} className="p-3 text-right font-sans uppercase">Net Award Subtotal:</td>
                      <td className="p-3 text-right text-slate-900">₹ {Math.round(net2ndQuote).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-3 text-right font-sans uppercase text-slate-500">GST @ 18%:</td>
                      <td className="p-3 text-right text-slate-700">₹ {gst2ndQuote.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-purple-100 text-purple-950 font-black text-sm">
                      <td colSpan={4} className="p-3 text-right font-sans uppercase">Gross Order Total:</td>
                      <td className="p-3 text-right text-purple-950">₹ {gross2ndQuote.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Commercial Terms Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Binding Payment Terms:</span>
                  <p className="font-bold text-slate-900">{terms2.advPct} Advance | 70% Progress RA | {terms2.retPct} DLP ({terms2.creditDays})</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Committed Handover & Logistics:</span>
                  <p className="font-bold text-sky-900">Lead Time: {terms2.leadTime} • Target Handover: {terms2.deliveryDate}</p>
                </div>
              </div>

              {/* Acceptance Actions */}
              <div className={`p-5 rounded-xl border ${ppoAccepted ? 'bg-emerald-50 border-emerald-300' : 'bg-purple-50 border-purple-200'} space-y-4`}>
                {ppoAccepted ? (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-950">Order Acknowledged & Binding Contract Activated ✓</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Electronically accepted by <strong>Authorized Signatory</strong> on <strong>06-Sep-2026 16:00 IST</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-black text-purple-950">Vendor Electronic Acceptance & Contract Confirmation</h4>
                    <p className="text-xs text-purple-800 mt-0.5">
                      By accepting this Purchase Price Offer, your organization confirms commercial readiness to deliver as per contracted terms.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-200">
                  <button
                    onClick={() => alert('Downloading official signed PO PDF...')}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>Download Signed PO PDF</span>
                  </button>

                  {!ppoAccepted ? (
                    <button
                      onClick={() => {
                        setPpoAccepted(true);
                        alert('Purchase Price Offer (PPO-2026-0005) accepted and activated!');
                      }}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-md flex items-center space-x-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Purchase Price Offer (PPO) & Confirm Order →</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-300">
                      PO Execution in Progress (Site Mobilization Active)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
