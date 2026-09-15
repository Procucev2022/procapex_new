'use client';

import React from 'react';
import { Hammer, Store, Building2, UserCheck, Plus, Trash2, Cpu } from 'lucide-react';
import { UI_STRINGS, POPULAR_RETAIL_BRANDS } from '@/constants';
import type {
  InteriorFitoutEvaluationData,
  OngoingProject,
  ClientReference,
} from '@/types';

interface InteriorFitoutEvaluationFormProps {
  data: InteriorFitoutEvaluationData;
  onChange: (updated: InteriorFitoutEvaluationData) => void;
}

export const InteriorFitoutEvaluationForm: React.FC<InteriorFitoutEvaluationFormProps> = ({
  data,
  onChange,
}) => {
  const handleCarpentersChange = (count: number): void => {
    onChange({ ...data, carpentersCount: count });
  };

  const handleToggleBrand = (brand: string): void => {
    const current = data.brandsWorkedWith ?? [];
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    onChange({ ...data, brandsWorkedWith: updated });
  };

  const handleAddProject = (): void => {
    const newProject: OngoingProject = {
      projectName: 'New Retail Store Site',
      clientName: 'Client Enterprise',
      locationCity: 'Mumbai',
      valueInLakhs: 150,
      completionPercent: 50,
    };
    onChange({
      ...data,
      ongoingProjects: [...(data.ongoingProjects ?? []), newProject],
    });
  };

  const handleRemoveProject = (index: number): void => {
    const updated = (data.ongoingProjects ?? []).filter((_, i) => i !== index);
    onChange({ ...data, ongoingProjects: updated });
  };

  const handleAddReference = (): void => {
    const newRef: ClientReference = {
      clientName: 'Enterprise Client',
      projectName: 'Flagship Retail Store',
      contactPerson: 'Project Lead',
      designation: 'VP Projects',
      contactNumber: '+91 98000 00000',
      email: 'client@example.com',
      scopeDelivered: 'Joinery & Fitouts',
      valueInCr: 2.5,
    };
    onChange({
      ...data,
      clientReferences: [...(data.clientReferences ?? []), newRef],
    });
  };

  const handleRemoveReference = (index: number): void => {
    const updated = (data.clientReferences ?? []).filter((_, i) => i !== index);
    onChange({ ...data, clientReferences: updated });
  };

  return (
    <div className="space-y-5 text-xs">
      {/* Carpenters & Craftsmen Scale */}
      <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900 flex items-center">
            <Hammer className="w-4 h-4 mr-2 text-amber-600" />
            {UI_STRINGS.vendorManagement.carpentersCountLabel}
          </label>
          <span className="text-sm font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-xl">
            {data.carpentersCount} Skilled Craftsmen
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="120"
          step="5"
          value={data.carpentersCount}
          onChange={(e) => handleCarpentersChange(Number(e.target.value))}
          className="w-full accent-amber-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
          <span>5 (Boutique)</span>
          <span>30 (Standard)</span>
          <span>60+ (Enterprise Scale)</span>
          <span>120 (Mega Commercial)</span>
        </div>
      </div>

      {/* Brands Worked With Till Date */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <label className="font-bold text-slate-900 flex items-center">
          <Store className="w-4 h-4 mr-2 text-indigo-600" />
          {UI_STRINGS.vendorManagement.retailBrandsLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_RETAIL_BRANDS.map((brand) => {
            const isSelected = data.brandsWorkedWith?.includes(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => handleToggleBrand(brand)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected ? `✓ ${brand}` : `+ ${brand}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Machinery & Workshop */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <label className="font-bold text-slate-900 flex items-center">
          <Cpu className="w-4 h-4 mr-2 text-emerald-600" />
          {UI_STRINGS.vendorManagement.workshopCncLabel}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasCncMachine}
              onChange={(e) => onChange({ ...data, hasCncMachine: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <span className="font-semibold text-slate-800">Computerized CNC Router</span>
          </label>
          <label className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasAutoEdgeBander}
              onChange={(e) => onChange({ ...data, hasAutoEdgeBander: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <span className="font-semibold text-slate-800">Automatic Edge Bander</span>
          </label>
        </div>
      </div>

      {/* Active Ongoing Project Sites */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-slate-900 flex items-center">
            <Building2 className="w-4 h-4 mr-2 text-sky-600" />
            {UI_STRINGS.vendorManagement.ongoingProjectsTitle} ({(data.ongoingProjects ?? []).length})
          </h5>
          <button
            type="button"
            onClick={handleAddProject}
            className="flex items-center text-[11px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Project Site
          </button>
        </div>
        <div className="space-y-2">
          {(data.ongoingProjects ?? []).map((proj, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <span className="font-bold text-slate-900">{proj.projectName}</span>
                <span className="text-[11px] text-slate-500 block">
                  Client: <strong>{proj.clientName}</strong> • {proj.locationCity} • ₹{proj.valueInLakhs}L
                </span>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {proj.completionPercent}% Done
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verifiable Client & PMC References */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-slate-900 flex items-center">
            <UserCheck className="w-4 h-4 mr-2 text-emerald-600" />
            {UI_STRINGS.vendorManagement.clientReferencesTitle} ({(data.clientReferences ?? []).length})
          </h5>
          <button
            type="button"
            onClick={handleAddReference}
            className="flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Client Reference
          </button>
        </div>
        <div className="space-y-2">
          {(data.clientReferences ?? []).map((ref, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <span className="font-bold text-slate-900">
                  {ref.clientName} — {ref.projectName}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Ref: {ref.contactPerson} ({ref.designation}) • Phone: {ref.contactNumber} • ₹{ref.valueInCr}Cr
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveReference(idx)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
