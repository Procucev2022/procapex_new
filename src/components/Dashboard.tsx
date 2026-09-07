'use client';

import React from 'react';
import { 
  FileText, 
  Scale, 
  Sparkles, 
  CheckCircle, 
  TrendingDown, 
  GitMerge, 
  Bell, 
  RotateCcw 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { DashboardProps } from '@/types';

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { prs, pos, activeTenant, resetToSampleData } = useProcurement();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#082f49] to-[#0c4a6e] text-white rounded-2xl p-6 shadow-sm border border-[#0c4a6e] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">
                Enterprise Dashboard
              </span>
              <h1 className="text-2xl font-bold mt-1">
                {activeTenant ? `${activeTenant.name} – Sourcing Command` : 'Procurement & AI Cost Intelligence Hub'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Active Project: <strong className="text-white font-semibold">{activeTenant?.project}</strong> • Real-time pipeline across BOQ Studio, Technical Approvals, 4-Way Commercial Matrix, Multi-Tier PPO sign-offs, and Vendor Awards.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3 bg-[#031726]/40 p-3 rounded-xl border border-[#0c4a6e]/50 backdrop-blur-sm">
              <div className="text-right">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Total Savings Identified</p>
                <p className="text-lg font-bold text-emerald-400">₹ 14,85,000</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active PRs</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{prs.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">2 Pending Approval • 2 Accepted</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Evaluation</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">3</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">1 High Variance Alert</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Cost Models</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">6 Items</p>
            <p className="text-[11px] text-purple-600 font-medium mt-1">Avg 94% AI Confidence</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Orders Issued</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{pos.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">100% PPO Compliant</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Pipeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <GitMerge className="w-4 h-4 text-sky-600 mr-2" />
              Live Procurement Pipeline Stages
            </h3>
            <span className="text-xs text-slate-400">Phase 1 Standard Flow</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center cursor-pointer hover:border-sky-300" onClick={() => onNavigate('prs')}>
              <span className="text-[10px] font-bold uppercase text-slate-500">1. PR & BOQ</span>
              <p className="text-lg font-bold text-slate-800 mt-1">2 Requests</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-sky-500 h-full w-2/3"></div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center cursor-pointer hover:border-amber-300" onClick={() => onNavigate('commercial')}>
              <span className="text-[10px] font-bold uppercase text-slate-500">2. Commercial Eval</span>
              <p className="text-lg font-bold text-slate-800 mt-1">2 Active</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full w-1/2"></div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center cursor-pointer hover:border-purple-300" onClick={() => onNavigate('negotiation')}>
              <span className="text-[10px] font-bold uppercase text-slate-500">3. Negotiation</span>
              <p className="text-lg font-bold text-slate-800 mt-1">1 In-Round</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-purple-500 h-full w-3/4"></div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center cursor-pointer hover:border-emerald-300" onClick={() => onNavigate('ppo')}>
              <span className="text-[10px] font-bold uppercase text-slate-500">4. PPO & PO</span>
              <p className="text-lg font-bold text-slate-800 mt-1">{pos.length} Issued</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-full"></div>
              </div>
            </div>
          </div>

          {/* Variance Overview Table */}
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-slate-600 mb-2">Quotation vs Rate Card vs AI Benchmark Variance (Live Items)</h4>
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-right">Master Rate Card</th>
                    <th className="p-2.5 text-right text-rose-700">Vendor Quote (L1)</th>
                    <th className="p-2.5 text-right text-emerald-700">AI Benchmark</th>
                    <th className="p-2.5 text-center">Variance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium">Ready Mix Concrete M30 (Cum)</td>
                    <td className="p-2.5 text-right font-mono">₹ 4,200</td>
                    <td className="p-2.5 text-right font-mono font-bold text-rose-700">₹ 4,950</td>
                    <td className="p-2.5 text-right font-mono text-emerald-700">₹ 4,350</td>
                    <td className="p-2.5 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">+17.8%</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">TMT Rebar Fe500D 25mm (Ton)</td>
                    <td className="p-2.5 text-right font-mono">₹ 54,000</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-700">₹ 53,500</td>
                    <td className="p-2.5 text-right font-mono text-emerald-700">₹ 53,200</td>
                    <td className="p-2.5 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">-0.9%</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">HVAC Chiller Unit 200 TR (Nos)</td>
                    <td className="p-2.5 text-right font-mono">₹ 38,00,000</td>
                    <td className="p-2.5 text-right font-mono font-bold text-rose-700">₹ 41,00,000</td>
                    <td className="p-2.5 text-right font-mono text-emerald-700">₹ 36,50,000</td>
                    <td className="p-2.5 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">+7.9%</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Action Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Bell className="w-4 h-4 text-amber-500 mr-2" />
              Action Required & Alerts
            </h3>
            <div className="space-y-3 mt-3">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Price Acceptability Alert</span>
                  <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded">PR-2026-0002</span>
                </div>
                <p className="text-amber-800 mt-1">Vendor quote is +17.8% above standard rate card for Concrete M30. AI Cost Analysis recommended.</p>
                <button onClick={() => onNavigate('commercial')} className="mt-2 text-xs font-semibold text-amber-900 underline hover:text-amber-950">
                  Review Commercial Check →
                </button>
              </div>

              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs">
                <div className="flex items-center justify-between font-bold text-sky-900">
                  <span>Pending PPO Approval</span>
                  <span className="text-[10px] bg-sky-200 px-1.5 py-0.5 rounded">PPO-2026-0012</span>
                </div>
                <p className="text-sky-800 mt-1">PPO prepared for Vertex Infratech (Concrete M30). Ready for final management signoff.</p>
                <button onClick={() => onNavigate('ppo')} className="mt-2 text-xs font-semibold text-sky-900 underline hover:text-sky-950">
                  Review & Approve PPO →
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={resetToSampleData}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Baseline Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
