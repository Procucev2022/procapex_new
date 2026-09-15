import React from 'react';
import {
  Wallet,
  Calculator,
  TrendingUp,
  ShieldCheck,
  Download,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import type { BudgetOverviewHeaderProps } from '@/types';
import { UI_STRINGS, formatString } from '@/constants';

export const BudgetOverviewHeader: React.FC<BudgetOverviewHeaderProps> = ({
  budgetState,
  onContingencyChange,
  onFreezeBaseline,
  onExportProjectSummary,
}) => {
  const strings = UI_STRINGS.budgetPlanning;
  const isBaselined = budgetState.status === 'BASELINED';

  const formatINR = (val: number): string => `₹ ${val.toLocaleString('en-IN')}`;
  const formatCrores = (val: number): string => `₹ ${(val / 10000000).toFixed(2)} Cr`;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-6">
      {/* Top Banner: Title, Role Badge, and Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {strings.title}
            </h1>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {strings.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {budgetState.projectName} • {strings.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onExportProjectSummary}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{strings.exportProjectSummaryButton}</span>
          </button>

          <button
            type="button"
            onClick={onFreezeBaseline}
            disabled={isBaselined}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              isBaselined
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isBaselined ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{isBaselined ? strings.statusBaselined : strings.freezeBaselineButton}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
        {/* Card 1: Baseline Budget */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{strings.totalBaselineBudget}</span>
            <Wallet className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatCrores(budgetState.totalBaselineBudget)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {formatINR(budgetState.totalBaselineBudget)}
          </div>
        </div>

        {/* Card 2: Estimated BOQ Cost */}
        <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/60">
          <div className="flex items-center justify-between text-sky-700 text-xs font-semibold mb-2">
            <span>{strings.totalEstimatedBOQCost}</span>
            <Calculator className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-950">
            {formatCrores(budgetState.totalEstimatedBOQCost)}
          </div>
          <div className="text-[11px] text-sky-700 font-medium mt-1">
            {formatINR(budgetState.totalEstimatedBOQCost)}
          </div>
        </div>

        {/* Card 3: Committed Spend */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-2">
            <span>{strings.totalCommittedCost}</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-950">
            {formatCrores(budgetState.totalCommittedCost)}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {formatINR(budgetState.totalCommittedCost)}
          </div>
        </div>

        {/* Card 4: Unallocated Variance */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-2">
            <span>{strings.unallocatedVariance}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-950">
            {formatCrores(budgetState.unallocatedVariance)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {formatINR(budgetState.unallocatedVariance)}
          </div>
        </div>

        {/* Card 5: Cost per Sq. Ft. */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/60">
          <div className="flex items-center justify-between text-indigo-800 text-xs font-semibold mb-2">
            <span>{strings.costPerSqFtLabel}</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-950">
            {formatString(strings.sqFtRateTemplate, { rate: budgetState.costPerSqFt.toLocaleString('en-IN') })}
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">
            {formatString(strings.sqFtAreaTemplate, {
              sqft: budgetState.totalProjectSqFt.toLocaleString('en-IN'),
            })}
          </div>
        </div>
      </div>

      {/* Contingency Buffer & Grand Total Cost Section */}
      <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {strings.contingencyBuffer}
            </span>
            <span className="text-emerald-400 font-extrabold text-sm">
              {formatString(strings.contingencyRateTemplate, { rate: budgetState.contingencyRatePercent })}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            disabled={isBaselined}
            value={budgetState.contingencyRatePercent}
            onChange={(e) => onContingencyChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0% (Tight)</span>
            <span>Buffer: {formatINR(budgetState.contingencyAmount)}</span>
            <span>15% (Conservative)</span>
          </div>
        </div>

        <div className="text-right border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <div className="text-xs text-slate-400 font-semibold">{strings.grandTotalBudgeted}</div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatINR(budgetState.grandTotalBudgeted)}
          </div>
        </div>
      </div>

      {/* Info notice if baseline is locked */}
      {isBaselined && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200/80 rounded-xl text-indigo-900 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{strings.baselineLockedNotice}</span>
        </div>
      )}
    </div>
  );
};
