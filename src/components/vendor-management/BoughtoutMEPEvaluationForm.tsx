'use client';

import React from 'react';
import { BadgeCheck, Globe, Wrench, Clock, Plus, Trash2, UserCheck } from 'lucide-react';
import { UI_STRINGS, POPULAR_BOUGHTOUT_OEMS, DEALERSHIP_TIER_LABELS } from '@/constants';
import type {
  BoughtoutMEPEvaluationData,
  OEMBrandDealership,
  ClientReference,
  DealershipTier,
} from '@/types';

interface BoughtoutMEPEvaluationFormProps {
  data: BoughtoutMEPEvaluationData;
  onChange: (updated: BoughtoutMEPEvaluationData) => void;
}

const ALL_REGIONS = ['West', 'North', 'South', 'East', 'Pan-India'] as const;

export const BoughtoutMEPEvaluationForm: React.FC<BoughtoutMEPEvaluationFormProps> = ({
  data,
  onChange,
}) => {
  const handleToggleRegion = (region: string): void => {
    const current = data.regionsCovered ?? [];
    const updated = current.includes(region)
      ? current.filter((r) => r !== region)
      : [...current, region];
    onChange({ ...data, regionsCovered: updated });
  };

  const handleAddDealership = (): void => {
    const newDealership: OEMBrandDealership = {
      brandName: POPULAR_BOUGHTOUT_OEMS[0] || 'Daikin',
      productCategory: 'HVAC / CCTV Equipment',
      dealershipTier: 'TIER_1_AUTHORIZED',
      validTill: '2028-12-31',
      territoryCovered: ['WEST', 'NORTH'],
    };
    onChange({
      ...data,
      dealerships: [...(data.dealerships ?? []), newDealership],
    });
  };

  const handleRemoveDealership = (index: number): void => {
    const updated = (data.dealerships ?? []).filter((_, i) => i !== index);
    onChange({ ...data, dealerships: updated });
  };

  const handleAddReference = (): void => {
    const newRef: ClientReference = {
      clientName: 'Enterprise Client',
      projectName: 'Corporate HQ MEP Package',
      contactPerson: 'Lead Engineer',
      designation: 'VP Infrastructure',
      contactNumber: '+91 98000 11223',
      email: 'mep.lead@example.com',
      scopeDelivered: 'Chillers & CCTV Integration',
      valueInCr: 3.5,
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
      {/* OEM Authorizations & Dealerships */}
      <div className="p-4 bg-sky-50/50 border border-sky-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-slate-900 flex items-center">
            <BadgeCheck className="w-4 h-4 mr-2 text-sky-600" />
            {UI_STRINGS.vendorManagement.oemDealershipsTitle} ({(data.dealerships ?? []).length})
          </h5>
          <button
            type="button"
            onClick={handleAddDealership}
            className="flex items-center text-[11px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 mr-1" /> Add OEM Authorization
          </button>
        </div>
        <div className="space-y-2">
          {(data.dealerships ?? []).map((deal, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{deal.brandName}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    {DEALERSHIP_TIER_LABELS[deal.dealershipTier as DealershipTier] || deal.dealershipTier}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Category: {deal.productCategory} • Valid Until: {deal.validTill}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDealership(idx)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded self-end sm:self-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Regions Covered */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <label className="font-bold text-slate-900 flex items-center">
          <Globe className="w-4 h-4 mr-2 text-indigo-600" />
          {UI_STRINGS.vendorManagement.regionsCoveredLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_REGIONS.map((region) => {
            const isSelected = data.regionsCovered?.includes(region);
            return (
              <button
                key={region}
                type="button"
                onClick={() => handleToggleRegion(region)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected ? `✓ ${region}` : `+ ${region}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Field Engineers & SLA Window */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-slate-700 font-bold flex items-center">
              <Wrench className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              {UI_STRINGS.vendorManagement.certifiedEngineersLabel}
            </label>
            <input
              type="number"
              min="1"
              value={data.certifiedEngineersCount}
              onChange={(e) => onChange({ ...data, certifiedEngineersCount: Number(e.target.value) })}
              className="w-full border rounded-xl p-2 bg-white border-slate-200 font-bold text-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-slate-700 font-bold flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              {UI_STRINGS.vendorManagement.slaResponseLabel} (Hours)
            </label>
            <input
              type="number"
              min="1"
              max="48"
              value={data.slaResponseTimeHours}
              onChange={(e) => onChange({ ...data, slaResponseTimeHours: Number(e.target.value) })}
              className="w-full border rounded-xl p-2 bg-white border-slate-200 font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
          <label className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.oemWarrantySupportAvailable}
              onChange={(e) => onChange({ ...data, oemWarrantySupportAvailable: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <span className="font-semibold text-slate-800">Direct OEM Warranty Pass-Through</span>
          </label>
          <label className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.annualAmcCapability}
              onChange={(e) => onChange({ ...data, annualAmcCapability: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <span className="font-semibold text-slate-800">Post-Warranty Comprehensive AMC</span>
          </label>
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
            <Plus className="w-3 h-3 mr-1" /> Add Reference
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
