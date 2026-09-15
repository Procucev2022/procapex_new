'use client';

import React from 'react';
import { X, Award, Star } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import { InteriorCredibilitySection } from './InteriorCredibilitySection';
import { BoughtoutCredibilitySection } from './BoughtoutCredibilitySection';
import type { ManagedVendor } from '@/types';

interface VendorCredibilityDrawerProps {
  isOpen: boolean;
  vendor: ManagedVendor | null;
  onClose: () => void;
}

export const VendorCredibilityDrawer: React.FC<VendorCredibilityDrawerProps> = ({
  isOpen,
  vendor,
  onClose,
}) => {
  if (!isOpen || !vendor) return null;

  const interiorData = vendor.categorySpecificProfile?.interiorFitout;
  const boughtoutData = vendor.categorySpecificProfile?.boughtoutMEP;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {vendor.id} • {vendor.category}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{vendor.name}</h3>
              <p className="text-xs text-slate-500">
                {UI_STRINGS.vendorManagement.viewProfileDrawerTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Evaluation Overview */}
        {vendor.evaluationScore && (
          <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xl font-black text-white">
                Evaluation Grade: <span className="text-emerald-400">{vendor.evaluationScore.grade}</span> (
                {vendor.evaluationScore.totalScore}/100 Pts)
              </div>
              <p className="text-xs text-slate-300">
                Status: <strong className="text-emerald-400">{vendor.evaluationScore.status}</strong> • Composite Rating:{' '}
                <strong className="text-amber-300">{vendor.compositeRating} ★</strong>
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-[10px] shrink-0">
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-slate-400 block font-medium">Fin (20)</span>
                <span className="text-xs font-black text-white">{vendor.evaluationScore.financialScore}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-slate-400 block font-medium">Ops (25)</span>
                <span className="text-xs font-black text-white">{vendor.evaluationScore.operationalScore}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-slate-400 block font-medium">Qual (20)</span>
                <span className="text-xs font-black text-white">{vendor.evaluationScore.qualityScore}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-slate-400 block font-medium">Comp (15)</span>
                <span className="text-xs font-black text-white">{vendor.evaluationScore.complianceScore}</span>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-2">
                <span className="text-emerald-300 block font-medium">Cred (20)</span>
                <span className="text-xs font-black text-emerald-400">
                  {vendor.evaluationScore.categoryCredibilityScore ?? 20}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interior & Retail Fit-out Profile */}
        {interiorData && <InteriorCredibilitySection data={interiorData} />}

        {/* Bought-outs & MEP Profile */}
        {boughtoutData && <BoughtoutCredibilitySection data={boughtoutData} />}

        {/* PPO Delivery Track Record */}
        {vendor.ppoRatings.length > 0 && (
          <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
            <h4 className="font-black text-slate-900 flex items-center">
              <Star className="w-4 h-4 mr-2 text-amber-500 fill-amber-400" />
              Verified PPO Delivery Evaluations ({vendor.ppoRatings.length})
            </h4>
            <div className="space-y-2">
              {vendor.ppoRatings.map((ppo) => (
                <div key={ppo.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Order: {ppo.ppoId} • Rated by {ppo.ratedBy}
                    </span>
                    <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg text-xs">
                      {ppo.overallScore} ★
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 italic">&ldquo;{ppo.comments}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {UI_STRINGS.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
