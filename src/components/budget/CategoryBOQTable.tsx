import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';

import type { CategoryBOQTableProps } from '@/types';
import { UI_STRINGS, formatString } from '@/constants';
import { generateCategoryCSV, getCSVDataUri } from '@/lib/budget-utils';

export const CategoryBOQTable: React.FC<CategoryBOQTableProps> = ({
  category,
  onUpdateQuantity,
  onResetCategoryQuantities,
}) => {
  const strings = UI_STRINGS.budgetPlanning;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatINR = (val: number): string => `₹ ${val.toLocaleString('en-IN')}`;

  const filteredItems = category.items.filter((item) => {
    if (item.status === 'ON_HOLD') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.code.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
  });

  const csvDataUri = getCSVDataUri(generateCategoryCSV(category));
  const csvFileName = `Standard_BOQ_${category.shortCode}.csv`;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
      {/* Category Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 uppercase tracking-wide">
              {category.shortCode}
            </span>
            <h3 className="text-lg font-black text-slate-900">{category.name}</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {category.costCenter} • {category.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Quantities */}
          <button
            type="button"
            onClick={() => onResetCategoryQuantities(category.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{strings.resetQuantitiesButton}</span>
          </button>

          {/* Declarative Download CSV */}
          <a
            href={csvDataUri}
            download={csvFileName}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{strings.downloadCategoryBOQButton}</span>
          </a>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="my-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={strings.filterSearchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-slate-50/50"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium ml-auto">
          {formatString(strings.itemCountTemplate, { count: filteredItems.length })}
        </div>
      </div>

      {/* Standard BOQ Interactive Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">{strings.tableColItemCode}</th>
              <th className="py-3 px-4 min-w-[280px]">{strings.tableColDescription}</th>
              <th className="py-3 px-3 text-center">{strings.tableColUOM}</th>
              <th className="py-3 px-4 min-w-[200px]">{strings.tableColBenchmarkRate}</th>
              <th className="py-3 px-4 min-w-[130px]">{strings.tableColQuantity}</th>
              <th className="py-3 px-4 text-right min-w-[140px]">{strings.tableColCalculatedCost}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const b = item.benchmarkDetails;
              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Code */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap align-top">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                      {item.code}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 text-slate-800 align-top">
                    <div className="font-semibold text-xs leading-relaxed">{item.desc}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Standard BOQ ID: {item.id}
                    </div>
                  </td>

                  {/* UOM */}
                  <td className="py-3 px-3 text-center align-top font-bold text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px]">{item.uom}</span>
                  </td>

                  {/* Price Benchmarking Breakdown */}
                  <td className="py-3 px-4 align-top">
                    <div className="font-black text-slate-900 text-sm">
                      {formatINR(item.benchmarkRate)}
                      <span className="text-[10px] text-slate-500 font-normal ml-1">/ {item.uom}</span>
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5 mt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-sky-600" />
                        {strings.benchmarkAILabel}: {formatINR(b.benchmarkRate)}
                      </span>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {strings.benchmarkRateCardLabel}: {formatINR(b.masterRateCardRate)}
                      </span>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {strings.benchmarkHistoricalLabel}: {formatINR(b.historicalLowestRate)}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 font-medium">
                      {formatString(strings.benchmarkConfidenceTemplate, { confidence: b.aiConfidence })}
                    </div>
                  </td>

                  {/* Editable Quantity */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.qty}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          onUpdateQuantity(category.id, item.id, isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                      />
                      <span className="text-[11px] font-medium text-slate-500">{item.uom}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Default: {item.defaultQty} {item.uom}
                    </div>
                  </td>

                  {/* Calculated Cost (Qty * Benchmark Rate) */}
                  <td className="py-3 px-4 text-right align-top">
                    <div className="font-black text-sm text-slate-900">
                      {formatINR(item.calculatedCost)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.qty} × ₹{item.benchmarkRate.toLocaleString('en-IN')}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  {strings.noItemsFound}
                </td>
              </tr>
            )}
          </tbody>

          {/* Table Footer: Category Total */}
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td colSpan={4} className="py-3 px-4 font-black text-slate-700 text-xs uppercase">
                {category.name} Total
              </td>
              <td className="py-3 px-4 text-slate-500 font-bold text-right text-xs">
                Subtotal Cost:
              </td>
              <td className="py-3 px-4 text-right font-black text-slate-900 text-base">
                {formatINR(category.subtotalCost)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
