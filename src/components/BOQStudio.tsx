'use client';

import React, { useState } from 'react';
import { Sparkles, Check, Trash2, FileText, Upload, Plus, ShieldCheck } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { BOQItem } from '../types';

interface DrawingScope {
  title: string;
  scopeName: string;
  scopeDesc: string;
  items: BOQItem[];
}

const DRAWING_NAME_CATALOG: Record<string, DrawingScope> = {
  'COUNTER_ELEVATION_D': {
    title: 'Counter Elevation D (Millwork & Counter Detail Drawing)',
    scopeName: 'COUNTER ELEVATION D ONLY',
    scopeDesc: 'Scoped strictly to specifications shown in Counter Elevation D: 20mm Granite/Solid Surface Top, 18mm BWP Plywood Carcass, 1.0mm HPL Textured Laminate, Soft-Close Joinery Hardware, 12V LED Profile & SS 304 Toe-kick.',
    items: [
      {
        code: 'CNT-TOP-GRN20',
        desc: '20mm thick Polished Jet Black Granite / Solid Surface Countertop with full bullnose edge profiling, cutouts for sink/cables, and waterproof backing over 18mm ply underlay',
        uom: 'Sqm',
        qty: 12.5,
        rateCard: 3400,
        benchmark: 3250,
        std: 3300,
        aiConf: '99%'
      },
      {
        code: 'CNT-PLY-BWP18',
        desc: 'Marine Grade Boiling Water Proof (BWP) Plywood 18mm thick (IS 710) with anti-termite and borer treatment for counter internal carcass, vertical dividers & base framing',
        uom: 'Sqm',
        qty: 38.0,
        rateCard: 1450,
        benchmark: 1380,
        std: 1400,
        aiConf: '99%'
      },
      {
        code: 'CNT-LAM-1MM',
        desc: '1.0mm thick High Pressure Textured / Suede Finish Decorative Laminate on all visible external fascias and drawers of Counter Elevation D with balancing laminate on reverse',
        uom: 'Sqm',
        qty: 24.0,
        rateCard: 850,
        benchmark: 800,
        std: 820,
        aiConf: '98%'
      },
      {
        code: 'CNT-HDW-SOFT',
        desc: 'Joinery & Hardware Package: Soft-close 3D adjustable concealed hinges, 45kg capacity full extension telescopic drawer slides, and SS 304 profile handles for Counter Elevation D',
        uom: 'Set',
        qty: 14.0,
        rateCard: 1850,
        benchmark: 1750,
        std: 1800,
        aiConf: '97%'
      },
      {
        code: 'CNT-LED-PROF',
        desc: '12V DC Warm White (3000K) High-CRI LED Strip Light (120 LEDs/m) in recessed slim aluminium channel with frosted diffuser under counter apron & bottom kickplate',
        uom: 'Rmt',
        qty: 16.0,
        rateCard: 420,
        benchmark: 390,
        std: 400,
        aiConf: '96%'
      },
      {
        code: 'CNT-SKT-SS304',
        desc: '100mm high Stainless Steel Grade 304 Brushed Finish Toe-Kick Skirting / Plinth Protection with waterproof silicone sealing at floor junction',
        uom: 'Rmt',
        qty: 14.0,
        rateCard: 580,
        benchmark: 540,
        std: 560,
        aiConf: '98%'
      }
    ]
  },
  'FOUNDATION_RAFT': {
    title: 'Foundation Raft & Footing Reinforcement Drawing (DWG-STR-FND-01)',
    scopeName: 'FOUNDATION RAFT ONLY',
    scopeDesc: 'Scoped strictly to Raft M30 Concrete, 25mm/16mm Fe500D Rebars & 12mm Plywood Formwork.',
    items: [
      {
        code: 'FND-RCC-M30',
        desc: 'Design Mix Reinforced Cement Concrete M30 in Footings & Raft Slabs using 20mm graded aggregate (IS 456 & IS 10262)',
        uom: 'Cum',
        qty: 450,
        rateCard: 4200,
        benchmark: 4350,
        std: 4150,
        aiConf: '99%'
      },
      {
        code: 'FND-REB-25MM',
        desc: 'TMT Reinforcement Rebar Fe500D - 25mm dia for Raft Bottom & Top Main Mesh (IS 1786)',
        uom: 'Ton',
        qty: 55,
        rateCard: 54000,
        benchmark: 53200,
        std: 53800,
        aiConf: '98%'
      }
    ]
  }
};

export const BOQStudio: React.FC<{ selectedPRId: string; onNavigateToCommercial: () => void }> = ({ onNavigateToCommercial }) => {
  const [drawingInput, setDrawingInput] = useState<string>('Counter Elevation D');
  const [activeDwg, setActiveDwg] = useState<DrawingScope>(DRAWING_NAME_CATALOG['COUNTER_ELEVATION_D']);
  const [selectedItemSpecs, setSelectedItemSpecs] = useState<BOQItem | null>(null);

  const applyCustomDrawingName = (name: string) => {
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
          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">Drawing Title Scope Guard</span>
          <h2 className="text-xl font-bold text-slate-900">BOQ Extraction by Drawing Name</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          As per drawing title (e.g. <strong>&ldquo;Counter Elevation D&rdquo;</strong>), extracts <strong>strictly and only the relevant specifications</strong> shown in that specific elevation.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Drawing Name Mentioned in the Drawing:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={drawingInput}
                onChange={(e) => setDrawingInput(e.target.value)}
                placeholder="e.g. Counter Elevation D"
                className="flex-1 text-xs font-bold text-slate-900 bg-white border-2 border-sky-400 rounded-xl px-3.5 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={() => applyCustomDrawingName(drawingInput)}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Extract for this Drawing Name</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <span className="font-semibold">Quick Presets:</span>
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
              <span className="flex items-center"><ShieldCheck className="w-4 h-4 text-purple-600 mr-1.5" /> Scoped Boundary:</span>
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
              Showing <strong>{activeDwg.items.length} line-items</strong> strictly corresponding to specifications shown on: <strong>{activeDwg.title}</strong>
            </p>
          </div>

          <button
            onClick={onNavigateToCommercial}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-1 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Validate & Start Commercial Check →</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3 w-32">Item Code</th>
                <th className="p-3">Specific Technical Description (As per Drawing Elevation D)</th>
                <th className="p-3 w-20">Unit</th>
                <th className="p-3 w-20 text-right">Quantity</th>
                <th className="p-3 w-28 text-right font-mono">Rate Card (₹)</th>
                <th className="p-3 w-28 text-right font-mono text-emerald-950 font-bold">Total Amount (₹)</th>
                <th className="p-3 w-24 text-center">Specs Sheet</th>
                <th className="p-3 w-16 text-center">Action</th>
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
                        <span>Specs</span>
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
                <td colSpan={6} className="p-3 text-right text-slate-700">Drawing Scope Package Total:</td>
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
              <h3 className="text-base font-bold text-slate-900">{selectedItemSpecs.code} | Technical Specifications</h3>
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
              <button onClick={() => setSelectedItemSpecs(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
