import React, { useState } from 'react';
import {
  Building2,
  Download,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Percent,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { CategoryBudgetSummaryProps } from '@/types';
import { UI_STRINGS, formatString } from '@/constants';
import {
  computeCategorySummaryMetrics,
  generateCategorySummaryCSV,
  getCSVDataUri,
} from '@/lib/budget-utils';

const SQFT_PRESETS = [100, 125, 150, 200];

export const CategoryBudgetSummary: React.FC<CategoryBudgetSummaryProps> = ({
  categories,
  budgetState,
  onSelectCategory,
  onUpdateProjectSqFt,
}) => {
  const strings = UI_STRINGS.budgetPlanning;
  const metrics = computeCategorySummaryMetrics(categories, budgetState);

  const [sqFtInput, setSqFtInput] = useState<string>(budgetState.totalProjectSqFt.toString());

  const handleSqFtChange = (val: string): void => {
    setSqFtInput(val);
    const num = Number(val);
    if (!isNaN(num) && num >= 500 && num <= 50000000) {
      onUpdateProjectSqFt(num);
    }
  };

  const handlePresetClick = (presetK: number): void => {
    const newSqFt = presetK * 1000;
    setSqFtInput(newSqFt.toString());
    onUpdateProjectSqFt(newSqFt);
  };

  const formatINR = (val: number): string => `₹ ${val.toLocaleString('en-IN')}`;
  const formatCrores = (val: number): string => `₹ ${(val / 10000000).toFixed(2)} Cr`;

  const summaryCSVDataUri = getCSVDataUri(generateCategorySummaryCSV(categories, budgetState));
  const summaryCSVFilename = `Category_Budget_Summary_${budgetState.projectId}.csv`;

  const variancePerSqFt = budgetState.baselineCostPerSqFt - budgetState.costPerSqFt;
  const isFavorable = variancePerSqFt >= 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-6">
      {/* Top Bar: Title & Sq. Ft. Provision */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {strings.categorySummaryTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            {strings.categorySummarySubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          {/* Declarative Export Category Summary Button */}
          <a
            href={summaryCSVDataUri}
            download={summaryCSVFilename}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 border border-slate-200 shrink-0"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{strings.downloadCategorySummaryButton}</span>
          </a>
        </div>
      </div>

      {/* Built-up Area (Sq. Ft.) Provision & Rate Banner */}
      <div className="mt-6 p-4 rounded-xl bg-brand-900 text-white border border-brand-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Area Provision Input */}
          <div className="flex-1 max-w-md">
            <label htmlFor="project-sqft-input" className="block text-xs font-bold text-indigo-200 mb-1.5">
              {strings.projectAreaSqFtLabel}
            </label>
            <div className="relative">
              <input
                id="project-sqft-input"
                type="number"
                min="500"
                max="50000000"
                value={sqFtInput}
                onChange={(e) => handleSqFtChange(e.target.value)}
                placeholder={strings.projectAreaSqFtPlaceholder}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-indigo-500/40 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-indigo-300 font-medium">
                sq. ft.
              </span>
            </div>

            {/* Quick Area Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
              {SQFT_PRESETS.map((presetK) => (
                <button
                  key={presetK}
                  type="button"
                  onClick={() => handlePresetClick(presetK)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    budgetState.totalProjectSqFt === presetK * 1000
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {formatString(strings.quickPresetSqFtTemplate, { preset: presetK })}
                </button>
              ))}
            </div>
          </div>

          {/* Rate Per Sq. Ft. Executive Metrics */}
          <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-indigo-900/60 pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="text-[11px] text-indigo-300 font-semibold">{strings.costPerSqFtLabel}</div>
              <div className="text-xl font-black text-white mt-0.5">
                {formatString(strings.sqFtRateTemplate, { rate: budgetState.costPerSqFt.toLocaleString('en-IN') })}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Estimated</div>
            </div>

            <div>
              <div className="text-[11px] text-indigo-300 font-semibold">{strings.baselineCostPerSqFtLabel}</div>
              <div className="text-xl font-black text-slate-300 mt-0.5">
                {formatString(strings.sqFtRateTemplate, { rate: budgetState.baselineCostPerSqFt.toLocaleString('en-IN') })}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Approved</div>
            </div>

            <div>
              <div className="text-[11px] text-indigo-300 font-semibold">Variance / Sq.Ft</div>
              <div
                className={`text-xl font-black mt-0.5 flex items-center gap-1 ${
                  isFavorable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isFavorable ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                <span>
                  {formatString(strings.sqFtRateTemplate, {
                    rate: Math.abs(variancePerSqFt).toLocaleString('en-IN'),
                  })}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isFavorable ? strings.statusUnderBudget : strings.statusOverBudget}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Summary Breakdown Table */}
      <div className="overflow-x-auto mt-6 border border-blue-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-blue-50/80 text-blue-950 font-bold border-b-2 border-blue-200">
              <th className="py-3 px-4">{strings.thCategory}</th>
              <th className="py-3 px-3 text-center">{strings.thItems}</th>
              <th className="py-3 px-4 text-right">{strings.thBaseline}</th>
              <th className="py-3 px-4 text-right">{strings.thEstimated}</th>
              <th className="py-3 px-4 text-right">{strings.thCostPerSqFt}</th>
              <th className="py-3 px-3 text-right">{strings.thShare}</th>
              <th className="py-3 px-4 text-right">{strings.thVariance}</th>
              <th className="py-3 px-4 text-center">{strings.thAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {metrics.map((row) => {
              const isSurplus = row.varianceAmount >= 0;
              return (
                <tr key={row.categoryId} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {row.shortCode}
                      </span>
                      <span>{row.categoryName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{row.costCenter}</div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-600 font-medium">
                    {row.itemCount}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 font-semibold">
                    <div>{formatCrores(row.baselineBudget)}</div>
                    <div className="text-[10px] text-slate-400">{formatINR(row.baselineBudget)}</div>
                  </td>
                  <td className="py-3 px-4 text-right text-indigo-950 font-bold">
                    <div>{formatCrores(row.estimatedCost)}</div>
                    <div className="text-[10px] text-indigo-600">{formatINR(row.estimatedCost)}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    <div className="text-sm">
                      {formatString(strings.sqFtRateTemplate, { rate: row.costPerSqFt.toLocaleString('en-IN') })}
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(row.budgetSharePercent * 2, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-700">
                    <div className="flex items-center justify-end gap-1">
                      <span>{row.budgetSharePercent}%</span>
                      <Percent className="w-3 h-3 text-slate-400" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <div className={`flex items-center justify-end gap-1 ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isSurplus ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span>{formatINR(Math.abs(row.varianceAmount))}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {row.variancePercent > 0 ? `+${row.variancePercent}%` : `${row.variancePercent}%`}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectCategory(row.categoryId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                    >
                      <span>{strings.viewBOQAction}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
              <td className="py-3.5 px-4">{strings.totalRowLabel}</td>
              <td className="py-3.5 px-3 text-center">
                {categories.reduce((acc, cat) => acc + cat.items.length, 0)}
              </td>
              <td className="py-3.5 px-4 text-right">
                {formatCrores(budgetState.totalBaselineBudget)}
              </td>
              <td className="py-3.5 px-4 text-right text-indigo-900">
                {formatCrores(budgetState.totalEstimatedBOQCost)}
              </td>
              <td className="py-3.5 px-4 text-right text-sm">
                {formatString(strings.sqFtRateTemplate, {
                  rate: Math.round(budgetState.totalEstimatedBOQCost / (budgetState.totalProjectSqFt || 1)).toLocaleString('en-IN'),
                })}
              </td>
              <td className="py-3.5 px-3 text-right">100.0%</td>
              <td className="py-3.5 px-4 text-right text-emerald-700">
                {formatINR(budgetState.unallocatedVariance)}
              </td>
              <td className="py-3.5 px-4 text-center text-slate-400 text-[10px]">
                6 Categories
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
