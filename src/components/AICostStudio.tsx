'use client';

import React, { useState } from 'react';
import { Sparkles, UserCheck, Send, Lightbulb, AlertCircle } from 'lucide-react';

interface AICostStudioProps {
  onNavigateToNegotiation: () => void;
}

export const AICostStudio: React.FC<AICostStudioProps> = ({ onNavigateToNegotiation }) => {
  const [targetRate, setTargetRate] = useState<number>(4350);
  const [maxLimit, setMaxLimit] = useState<number>(4500);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
              AI Cost Intelligence (FR-08, FR-09)
            </span>
            <h2 className="text-xl font-bold text-slate-900">Bottom-Up MLEO Cost Analysis</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deconstruct outlier rates into Material, Labour, Equipment, and Overheads (MLEO) to establish scientific negotiation leverage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: MLEO Structure */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-purple-600">Cost Composition Engine</span>
              <h3 className="text-base font-bold text-slate-800">Design Mix Concrete M30 with Fly Ash</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Target Fair Rate</span>
              <p className="text-lg font-bold text-purple-700 font-mono">₹ 4,350 / Cum</p>
            </div>
          </div>

          {/* 4 Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-[10px] font-bold uppercase text-blue-700">1. Material (56%)</span>
              <p className="text-base font-extrabold text-blue-950 mt-1 font-mono">₹ 2,436</p>
              <p className="text-[10px] text-blue-600 mt-0.5">Cement, aggregate, sand, fly ash</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-[10px] font-bold uppercase text-amber-700">2. Labour (14%)</span>
              <p className="text-base font-extrabold text-amber-950 mt-1 font-mono">₹ 609</p>
              <p className="text-[10px] text-amber-600 mt-0.5">Batching & transit mixing crew</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-700">3. Equipment (18%)</span>
              <p className="text-base font-extrabold text-emerald-950 mt-1 font-mono">₹ 783</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">Transit mixers, diesel & pump wear</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-[10px] font-bold uppercase text-purple-700">4. Overheads (12%)</span>
              <p className="text-base font-extrabold text-purple-950 mt-1 font-mono">₹ 522</p>
              <p className="text-[10px] text-purple-600 mt-0.5">QC testing & standard contractor margin</p>
            </div>
          </div>

          {/* Key Drivers Identified */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700">AI Identified Cost Inflators vs Market Benchmark:</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-900">Aggregate Transit Surcharge: </span>
                  <span className="text-rose-800">Vendor added +₹250/Cum transport markup vs local quarry index.</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-900">Excess Contractor Margin: </span>
                  <span className="text-rose-800">Quoted margin is 22% vs regional benchmark of 12-14%.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Human in the Loop Override (AI-08) */}
          <div className="pt-4 border-t border-slate-200 space-y-3 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center">
                <UserCheck className="w-4 h-4 text-sky-600 mr-1.5" />
                Buyer Cost Override & Target Formulation (AI-08 Human-in-the-Loop)
              </h4>
              <span className="text-[10px] text-slate-400">Auditable Decision</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Recommended Target Rate (₹):</label>
                <input
                  type="number"
                  value={targetRate}
                  onChange={(e) => setTargetRate(parseFloat(e.target.value))}
                  className="w-full mt-1 text-xs border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Max Walk-Away Limit (₹):</label>
                <input
                  type="number"
                  value={maxLimit}
                  onChange={(e) => setMaxLimit(parseFloat(e.target.value))}
                  className="w-full mt-1 text-xs border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={onNavigateToNegotiation}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Negotiation Hub →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Negotiation Script */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <Lightbulb className="w-4 h-4 text-amber-500 mr-2" />
            AI Negotiation Script & Rationales
          </h3>
          <p className="text-xs text-slate-500">Auto-generated arguments based on market indices to use during vendor calls.</p>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-purple-50/70 rounded-lg border border-purple-200">
              <p className="font-bold text-purple-900">Argument 1: Raw Material Deflation</p>
              <p className="text-purple-800 mt-1">
                &ldquo;OPC 53 cement wholesale index dropped 4.2% locally this month. Your material cost should be ₹2,436/Cum.&rdquo;
              </p>
            </div>
            <div className="p-3 bg-purple-50/70 rounded-lg border border-purple-200">
              <p className="font-bold text-purple-900">Argument 2: Volume Amortization</p>
              <p className="text-purple-800 mt-1">
                &ldquo;For a committed bulk volume of 450 Cum, plant setup overhead amortizes below ₹120/Cum. We counter at ₹4,350/Cum.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
