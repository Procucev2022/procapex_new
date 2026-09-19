'use client';

import React, { useState, useContext, useMemo } from 'react';
import { X, Award, Star, Layers, CreditCard, Zap } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import { ProcurementContext } from '@/context/ProcurementContext';
import { InteriorCredibilitySection } from './InteriorCredibilitySection';
import { BoughtoutCredibilitySection } from './BoughtoutCredibilitySection';
import { VendorCataloguePricingTab } from './VendorCataloguePricingTab';
import { VendorProfileRateCardTab } from '../rate-card/VendorProfileRateCardTab';
import type { ManagedVendor, BudgetCategory, VendorCatalogueItemPrice } from '@/types';

interface VendorCredibilityDrawerProps {
  isOpen: boolean;
  vendor: ManagedVendor | null;
  onClose: () => void;
  initialTab?: 'credibility' | 'rate_card' | 'catalogue';
  projectCategories?: BudgetCategory[];
  onSaveCataloguePrices?: (
    vendorId: string,
    prices: Record<string, VendorCatalogueItemPrice>
  ) => void;
  onOpenIntimationModal?: (vendor: ManagedVendor) => void;
  onUpdateCategories?: (vendorId: string, categories: string[]) => void;
}

export const VendorCredibilityDrawer: React.FC<VendorCredibilityDrawerProps> = ({
  isOpen,
  vendor,
  onClose,
  initialTab,
  projectCategories = [],
  onSaveCataloguePrices,
  onOpenIntimationModal,
  onUpdateCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'credibility' | 'rate_card' | 'catalogue'>(
    initialTab || 'credibility'
  );

  const context = useContext(ProcurementContext);
  const getCoverage = context?.getVendorCategoryRateCardCoverage;

  const rateCardCoverage = useMemo(() => {
    if (!vendor || !getCoverage) return null;
    return getCoverage(vendor.id, vendor.category);
  }, [vendor, getCoverage]);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen || !vendor) return null;

  const interiorData = vendor.categorySpecificProfile?.interiorFitout;
  const boughtoutData = vendor.categorySpecificProfile?.boughtoutMEP;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {vendor.id} • {vendor.category}
                </span>
                {vendor.isRateCard && rateCardCoverage && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('rate_card')}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-emerald-600" />
                    <span>Rate Card: {rateCardCoverage.coveragePct}% Std BOQ</span>
                  </button>
                )}
              </div>
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('credibility')}
            className={`pb-3 font-bold text-xs transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'credibility'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorManagement.tabGeneralEvaluation}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rate_card')}
            className={`pb-3 font-bold text-xs transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'rate_card'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.rateCards.tabRateCard}</span>
            {rateCardCoverage && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded-full ml-1">
                {rateCardCoverage.coveragePct}%
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('catalogue')}
            className={`pb-3 font-bold text-xs transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'catalogue'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorManagement.tabCataloguePricing}</span>
          </button>
        </div>

        {/* Tab: Rate Card & Agreements */}
        {activeTab === 'rate_card' && (
          <VendorProfileRateCardTab
            vendorId={vendor.id}
            vendorName={vendor.name}
            vendorCategory={vendor.category}
            vendorCategories={vendor.categories}
            isVendorPortal={false}
          />
        )}

        {/* Tab 2: Standard BOQ Catalogue Pricing */}
        {activeTab === 'catalogue' && (
          <VendorCataloguePricingTab
            vendor={vendor}
            projectCategories={projectCategories}
            onSaveCataloguePrices={onSaveCataloguePrices || (() => {})}
            onOpenIntimationModal={() => onOpenIntimationModal?.(vendor)}
            onUpdateCategories={onUpdateCategories}
          />
        )}

        {/* Tab 1: Credibility & Audit Scorecard */}
        {activeTab === 'credibility' && (
          <>
            {/* Score & Evaluation Overview */}
            {vendor.evaluationScore && (
              <div className="bg-brand-900 text-white rounded-2xl p-5 shadow-md border border-brand-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        </>
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
