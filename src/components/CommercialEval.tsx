'use client';

import React from 'react';
import { Scale, ArrowLeft, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { COMMERCIAL_COUNTER_ITEMS } from '@/constants';
import { CommercialEvalProps } from '@/types';

export const CommercialEval: React.FC<CommercialEvalProps> = ({ onNavigateToAICost, onNavigateToPPO }) => {
  const counterItems = COMMERCIAL_COUNTER_ITEMS;

  let totalRateCard = 0;
  let totalQuoted = 0;
  let totalBenchmark = 0;
  let totalStd = 0;

  counterItems.forEach(it => {
    totalRateCard += it.qty * it.rateCard;
    totalQuoted += it.qty * it.quotedRate;
    totalBenchmark += it.qty * it.benchmark;
    totalStd += it.qty * it.std;
  });

  const variancePct = (((totalQuoted - totalRateCard) / totalRateCard) * 100).toFixed(1);
  const isAcceptable = parseFloat(variancePct) <= 5.0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">FR-06 & FR-07 Commercial Engine</span>
            <h2 className="text-xl font-bold text-slate-900">Commercial Price Check & 4-Way Comparison</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Normalized 4-way commercial evaluation for drawing: <strong>Counter Elevation D (Millwork Package)</strong> with Line-Item MLEO Costing
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-blue-700">1. Master Rate Card Baseline</p>
          <p className="text-xl font-black text-blue-950 mt-1 font-mono">₹ {Math.round(totalRateCard).toLocaleString()}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Approved corporate schedule rates</p>
        </div>
        <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-amber-700">2. Lowest Vendor Quote (L1)</p>
          <p className="text-xl font-black text-amber-950 mt-1 font-mono">₹ {Math.round(totalQuoted).toLocaleString()}</p>
          <p className="text-[11px] text-amber-700 mt-0.5 font-bold">+{variancePct}% vs Rate Card</p>
        </div>
        <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-purple-700">3. AI Market Benchmark</p>
          <p className="text-xl font-black text-purple-950 mt-1 font-mono">₹ {Math.round(totalBenchmark).toLocaleString()}</p>
          <p className="text-[11px] text-purple-600 mt-0.5">Regional market pricing index</p>
        </div>
        <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-700">4. Internal Historical Std</p>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">₹ {Math.round(totalStd).toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Past 6-month weighted avg</p>
        </div>
      </div>

      {/* 4-Way Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Scale className="w-4 h-4 text-sky-600 mr-2" />
            Itemized 4-Way Commercial Matrix (Counter Elevation D Items)
          </h3>
          <span className="text-xs text-slate-400">Vendor: <strong>Vendor 1 (VND-001)</strong></span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Item Code & Specification</th>
                <th className="p-3 text-right">Qty & UOM</th>
                <th className="p-3 text-right bg-blue-50/80 text-blue-950 border-l border-r border-blue-200 font-mono">1. Rate Card (₹)</th>
                <th className="p-3 text-right bg-amber-50/80 text-amber-950 border-r border-amber-200 font-mono">2. Quoted Rate (₹)</th>
                <th className="p-3 text-right bg-purple-50/80 text-purple-950 border-r border-purple-200 font-mono">
                  3. AI Benchmark (₹)
                  <span className="block text-[9px] text-purple-700 font-normal">MLEO Breakdown</span>
                </th>
                <th className="p-3 text-right text-slate-700 font-mono">4. Internal Std (₹)</th>
                <th className="p-3 text-center">Variance %</th>
                <th className="p-3 text-center">Acceptability</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {counterItems.map((item, idx) => {
                const varPct = (((item.quotedRate - item.rateCard) / item.rateCard) * 100).toFixed(1);
                const itemOk = parseFloat(varPct) <= 5.0;

                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{item.desc}</span>
                      <span className="block font-mono text-[10px] text-slate-400 mt-0.5">{item.code}</span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold">{item.qty} {item.uom}</td>
                    <td className="p-3 text-right font-bold text-blue-900 bg-blue-50/40 border-l border-r border-blue-100 font-mono">
                      <div>₹ {item.rateCard.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Amt: ₹ {Math.round(item.qty * item.rateCard).toLocaleString()}</div>
                    </td>
                    <td className="p-3 text-right font-bold text-amber-900 bg-amber-50/40 border-r border-amber-100 font-mono">
                      <div>₹ {item.quotedRate.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Amt: ₹ {Math.round(item.qty * item.quotedRate).toLocaleString()}</div>
                    </td>
                    <td className="p-3 text-right font-bold text-purple-900 bg-purple-50/40 border-r border-purple-100 font-mono">
                      <div>₹ {item.benchmark.toLocaleString()}</div>
                      <div className="text-[10px] text-purple-800 font-normal">Amt: ₹ {Math.round(item.qty * item.benchmark).toLocaleString()}</div>
                      <div className="mt-1 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-900 border border-purple-200" title="MLEO Breakdown">
                        <span>M:₹{item.mleo.m}</span>
                        <span>L:₹{item.mleo.l}</span>
                        <span>E:₹{item.mleo.e}</span>
                        <span>O:₹{item.mleo.o}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-700 font-mono">
                      <div>₹ {item.std.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Amt: ₹ {Math.round(item.qty * item.std).toLocaleString()}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${parseFloat(varPct) > 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        +{varPct}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${itemOk ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {itemOk ? 'Acceptable' : 'High Variance'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {itemOk ? (
                        <button onClick={onNavigateToPPO} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded shadow-sm">
                          Proceed to PPO
                        </button>
                      ) : (
                        <button onClick={onNavigateToAICost} className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded flex items-center space-x-1 mx-auto shadow-sm whitespace-nowrap">
                          <Sparkles className="w-3 h-3" />
                          <span>Invoke AI Costing</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold font-mono border-t">
              <tr>
                <td className="p-3 uppercase font-sans">Summary Totals:</td>
                <td className="p-3 text-right">{counterItems.reduce((acc, it) => acc + it.qty, 0)} Units</td>
                <td className="p-3 text-right text-blue-900 font-black">₹ {Math.round(totalRateCard).toLocaleString()}</td>
                <td className="p-3 text-right text-amber-900 font-black">₹ {Math.round(totalQuoted).toLocaleString()}</td>
                <td className="p-3 text-right text-purple-900 font-black">₹ {Math.round(totalBenchmark).toLocaleString()}</td>
                <td className="p-3 text-right text-slate-900 font-black">₹ {Math.round(totalStd).toLocaleString()}</td>
                <td className="p-3 text-center text-rose-700 font-bold">+{variancePct}%</td>
                <td colSpan={2} className="p-3 text-center font-sans">
                  <button onClick={onNavigateToAICost} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow">
                    Detailed MLEO Analysis →
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Decision Banner */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-rose-900 flex items-center">
              <AlertTriangle className="w-4 h-4 text-rose-600 mr-2" />
              Commercial Rule Triggered: Quoted counter millwork package is +{variancePct}% above master rate card
            </span>
            <p className="text-[11px] text-rose-700 mt-0.5">
              As per FR-08 & FR-09, invoke bottom-up AI Cost Break-up before conducting vendor negotiation.
            </p>
          </div>
          <button
            onClick={onNavigateToAICost}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open AI Cost Analysis & MLEO →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
