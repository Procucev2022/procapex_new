'use client';

import React, { useState } from 'react';
import { Sparkles, Check, Trash2, FileText, ShieldCheck } from 'lucide-react';
import type { BOQItem, DrawingScope, BOQStudioProps } from '@/types';
import { DRAWING_NAME_CATALOG, UI_STRINGS, formatString } from '@/constants';

export const BOQStudio: React.FC<BOQStudioProps> = ({ onNavigateToCommercial }) => {
  const [drawingInput, setDrawingInput] = useState<string>('Counter Elevation D');
  const [activeDwg, setActiveDwg] = useState<DrawingScope>(DRAWING_NAME_CATALOG['COUNTER_ELEVATION_D']);
  const [selectedItemSpecs, setSelectedItemSpecs] = useState<BOQItem | null>(null);

  const applyCustomDrawingName = (name: string): void => {
    setDrawingInput(name);
    const lower = name.toLowerCase();
    if (lower.includes('counter') || lower.includes('elevation d')) {
      setActiveDwg(DRAWING_NAME_CATALOG['COUNTER_ELEVATION_D']);
    } else if (lower.includes('raft') || lower.includes('foundation')) {
      setActiveDwg(DRAWING_NAME_CATALOG['FOUNDATION_RAFT']);
    }
  };

  const packageTotal = activeDwg.items.reduce((acc, it) => acc + it.qty * (it.rateCard ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">{UI_STRINGS.boqStudio.scopeBadge}</span>
          <h2 className="text-xl font-bold text-slate-900">{UI_STRINGS.boqStudio.title}</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {UI_STRINGS.boqStudio.subtitle}
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              {UI_STRINGS.boqStudio.drawingNameLabel}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={drawingInput}
                onChange={(e) => setDrawingInput(e.target.value)}
                placeholder={UI_STRINGS.boqStudio.drawingNamePlaceholder}
                className="flex-1 text-xs font-bold text-slate-900 bg-white border-2 border-sky-400 rounded-xl px-3.5 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={() => applyCustomDrawingName(drawingInput)}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{UI_STRINGS.boqStudio.extractButton}</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <span className="font-semibold">{UI_STRINGS.boqStudio.quickPresets}</span>
              <button onClick={() => applyCustomDrawingName('Counter Elevation D')} className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded border border-purple-200">
                Counter Elevation D
              </button>
              <button onClick={() => applyCustomDrawingName('Foundation Raft & Footing Reinforcement')} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded">
                Foundation Raft Reinforcement
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-purple-950">
              <span className="flex items-center"><ShieldCheck className="w-4 h-4 text-purple-600 mr-1.5" /> {UI_STRINGS.boqStudio.scopedBoundary}</span>
              <span className="bg-purple-200 text-purple-900 px-2 py-0.5 rounded text-[10px] font-mono font-bold">{activeDwg.scopeName}</span>
            </div>
            <p className="text-purple-800 text-[11px]">{activeDwg.scopeDesc}</p>
          </div>
        </div>
      </div>

      {/* BOQ Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Check className="w-4 h-4 text-emerald-600 mr-2" />
              Relevant Specifications for Drawing: <span className="text-sky-700 ml-1">{activeDwg.title}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {formatString(UI_STRINGS.boqStudio.specsCountTemplate, {
                count: activeDwg.items.length,
                title: activeDwg.title,
              })}
            </p>
          </div>

          <button
            onClick={onNavigateToCommercial}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-1 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.boqStudio.commercialCheckButton}</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3 w-32">{UI_STRINGS.boqStudio.itemCode}</th>
                <th className="p-3">{UI_STRINGS.boqStudio.itemDescription}</th>
                <th className="p-3 w-20">{UI_STRINGS.boqStudio.uom}</th>
                <th className="p-3 w-20 text-right">{UI_STRINGS.boqStudio.quantity}</th>
                <th className="p-3 w-28 text-right font-mono">{UI_STRINGS.boqStudio.rateCardRate}</th>
                <th className="p-3 w-28 text-right font-mono text-emerald-950 font-bold">{UI_STRINGS.boqStudio.totalAmount}</th>
                <th className="p-3 w-24 text-center">{UI_STRINGS.boqStudio.specsSheet}</th>
                <th className="p-3 w-16 text-center">{UI_STRINGS.boqStudio.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeDwg.items.map((item, idx) => {
                const total = item.qty * (item.rateCard ?? 0);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-sky-800">{item.code}</td>
                    <td className="p-3 font-medium text-slate-900">{item.desc}</td>
                    <td className="p-3 font-bold font-mono text-slate-700">{item.uom}</td>
                    <td className="p-3 text-right font-bold font-mono text-slate-900">{item.qty.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-blue-900">₹ {(item.rateCard ?? 0).toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-950">₹ {total.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedItemSpecs(item)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold rounded border border-purple-200 flex items-center space-x-1 mx-auto"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{UI_STRINGS.boqStudio.specsButton}</span>
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          const updated = activeDwg.items.filter((_, i) => i !== idx);
                          setActiveDwg({ ...activeDwg, items: updated });
                        }}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={6} className="p-3 text-right text-slate-700">{UI_STRINGS.boqStudio.packageTotalLabel}</td>
                <td className="p-3 text-right font-mono text-sm text-blue-950">₹ {packageTotal.toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Spec Modal */}
      {selectedItemSpecs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {formatString(UI_STRINGS.boqStudio.specsModalTitleTemplate, { code: selectedItemSpecs.code })}
              </h3>
              <button onClick={() => setSelectedItemSpecs(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border text-xs space-y-2">
              <p className="font-bold text-slate-900">{selectedItemSpecs.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t">
                <div><span className="text-slate-500">Unit (UOM):</span> <strong>{selectedItemSpecs.uom}</strong></div>
                <div><span className="text-slate-500">Drawing Quantity:</span> <strong>{selectedItemSpecs.qty} {selectedItemSpecs.uom}</strong></div>
                <div><span className="text-slate-500">Master Rate:</span> <strong className="text-blue-700">₹ {(selectedItemSpecs.rateCard ?? 0).toLocaleString()}</strong></div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button onClick={() => setSelectedItemSpecs(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs">
                {UI_STRINGS.boqStudio.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
