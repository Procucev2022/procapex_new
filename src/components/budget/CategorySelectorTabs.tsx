import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import type { CategorySelectorTabsProps } from '@/types';
import { UI_STRINGS, formatString } from '@/constants';
import { generateCategoryCSV, getCSVDataUri } from '@/lib/budget-utils';

export const CategorySelectorTabs: React.FC<CategorySelectorTabsProps> = ({
  categories,
  activeCategoryId,
  totalEstimatedCost,
  onSelectCategory,
}) => {
  const strings = UI_STRINGS.budgetPlanning;

  const formatINR = (val: number): string => `₹ ${val.toLocaleString('en-IN')}`;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            {strings.categoryAllocationTitle}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {strings.categoryAllocationSubtitle}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          const sharePercent =
            totalEstimatedCost > 0
              ? ((cat.subtotalCost / totalEstimatedCost) * 100).toFixed(1)
              : '0.0';

          const csvDataUri = getCSVDataUri(generateCategoryCSV(cat));
          const csvFileName = `Standard_BOQ_${cat.shortCode}.csv`;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isActive
                  ? 'bg-sky-50/50 border-sky-500 ring-2 ring-sky-400/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              {/* Category Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                    {cat.shortCode}
                  </span>
                  <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
                    {formatString(strings.categoryShareTemplate, { percent: sharePercent })}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                  {cat.costCenter}
                </p>
              </div>

              {/* Subtotal and Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {formatString(strings.itemCountTemplate, { count: cat.items.length })}
                  </div>
                  <div className="text-xs font-black text-slate-800">
                    {formatINR(cat.subtotalCost)}
                  </div>
                </div>

                {/* Declarative Download CSV Link */}
                <a
                  href={csvDataUri}
                  download={csvFileName}
                  onClick={(e) => e.stopPropagation()}
                  title={strings.downloadCategoryBOQButton}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-[11px] font-bold border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">CSV</span>
                </a>
              </div>

              {isActive && (
                <div className="absolute top-2 right-2 text-sky-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
