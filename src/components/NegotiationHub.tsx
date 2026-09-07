'use client';

import React, { useState } from 'react';
import { Handshake, History, Send, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

export const NegotiationHub: React.FC = () => {
  const { negotiations, addNegotiationRound } = useProcurement();
  const [selectedPRId, setSelectedPRId] = useState<string>('PR-2026-0005');
  const [rate, setRate] = useState<string>('148500');
  const [remarks, setRemarks] = useState<string>('Reference AI MLEO cost model on granite and joinery. Volume rate requested with 45-day payment cycle.');
  const [actionType, setActionType] = useState<string>('BUYER_COUNTER');

  const activeRounds = negotiations[selectedPRId] || [
    {
      round: 1,
      type: 'VENDOR_INITIAL_BID',
      user: 'Vendor 1 (VND-001)',
      rate: 162260,
      remarks: 'Initial competitive bid submitted against tender specifications.',
      timestamp: '2026-09-06 10:30'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rate) return;
    addNegotiationRound(selectedPRId, parseFloat(rate), remarks, actionType);
    setRemarks('');
  };

  const handleSimulate2ndQuote = () => {
    addNegotiationRound(
      selectedPRId,
      148500,
      'Conceded volume discount and revised granite line rates in accordance with AI should-cost model.',
      'VENDOR_2ND_QUOTE_BAFO'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Vendor Negotiation Hub (2-Round BAFO)</h2>
          <p className="text-xs text-slate-500">Track multi-round counter-offers, revised 2nd quotes, target prices, and negotiation audit history.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-600">Active Negotiation:</span>
          <select
            value={selectedPRId}
            onChange={(e) => setSelectedPRId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="PR-2026-0005">PR-2026-0005 | Vendor 1 (Reception Counter - Method 3)</option>
            <option value="PR-2026-0002">PR-2026-0002 | Vendor 11 (Concrete M30 - Method 1)</option>
            <option value="PR-2026-0003">PR-2026-0003 | Vendor 14 (HVAC Package - Method 2)</option>
            <option value="PR-2026-0004">PR-2026-0004 | Vendor 7 (Joinery Package - Method 4)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Submit Action Form */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Handshake className="w-4 h-4 text-sky-600 mr-2" />
              Submit Counter-Offer / Log Revision
            </h3>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Vendor:</span> <span className="font-bold text-slate-800">Vendor 1 (VND-001)</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Original Quote (Round 1):</span> <span className="font-bold text-rose-700 font-mono">₹ 1,62,260</span></div>
              <div className="flex justify-between"><span className="text-slate-500">AI Target Rate:</span> <span className="font-bold text-emerald-700 font-mono">₹ 1,35,420</span></div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Gemini Tactical Assistant
                </span>
                <span className="text-[10px] text-purple-600 font-mono">GEMINI_MODEL</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/ai/negotiation', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        prTitle: selectedPRId,
                        itemName: 'Procurement Package',
                        vendorQuoteRate: 162260,
                        targetBenchmark: 135420,
                        currentRound: activeRounds.length + 1,
                      }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.recommendedCounterRate) setRate(String(data.recommendedCounterRate));
                      if (data.counterRemarks) setRemarks(data.counterRemarks);
                    }
                  } catch (e) {
                    console.error('Failed to generate counter tactic', e);
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-2 rounded-md shadow-xs flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Draft Smart Counter-Offer</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Action Type:</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="BUYER_COUNTER">Buyer Sends Counter-Offer (Round 1.5)</option>
                  <option value="VENDOR_REVISION">Vendor Submits Revised 2nd Quote (Round 2)</option>
                  <option value="FINAL_AGREEMENT">Final Commercial Agreement Reached (BAFO)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Commercial Total / Rate (₹):</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 148500"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-300 rounded-lg p-2 font-bold font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Remarks & Justifications:</label>
                <textarea
                  rows={3}
                  placeholder="Reference AI cost model and bulk purchase terms..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Counter-Offer to Vendor</span>
              </button>
            </form>
          </div>

          <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-amber-950 flex items-center space-x-1.5">
              <RefreshCw className="w-4 h-4 text-amber-700" />
              <span>Receive 2nd Quote (BAFO Simulation)</span>
            </h4>
            <p className="text-amber-800">Simulate vendor accepting counter-offer terms and issuing revised 2nd Quote BAFO.</p>
            <button
              type="button"
              onClick={handleSimulate2ndQuote}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-lg shadow-sm flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ingest 2nd Quote (BAFO: ₹ 1,48,500)</span>
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Timeline History */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <History className="w-4 h-4 text-purple-600 mr-2" />
              Immutable Negotiation Audit Log & Multi-Round Timeline
            </h3>
            <span className="text-xs text-emerald-600 font-bold">Total Negotiated Savings: ₹ 13,760 (8.5%)</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activeRounds.map((r, idx) => (
              <div key={idx} className="relative flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shadow -ml-8.5 ring-4 ring-white">
                  {r.round}
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{r.type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{r.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1"><strong>{r.user}:</strong> {r.remarks}</p>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Commercial Unit Rate / Total:</span>
                    <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      ₹ {r.rate.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
