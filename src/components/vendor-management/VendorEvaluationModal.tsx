'use client';

import React, { useState, useMemo } from 'react';
import { Award, X, Star, Sparkles } from 'lucide-react';
import {
  UI_STRINGS,
  DEFAULT_BASELINE_EVALUATION_DATA,
  DEFAULT_INTERIOR_EVALUATION_DATA,
  DEFAULT_BOUGHTOUT_EVALUATION_DATA,
} from '@/constants';
import { calculateVendorEvaluationScore } from '@/lib/vendor-evaluation';
import { BaselineAuditForm } from './BaselineAuditForm';
import { InteriorFitoutEvaluationForm } from './InteriorFitoutEvaluationForm';
import { BoughtoutMEPEvaluationForm } from './BoughtoutMEPEvaluationForm';
import type {
  ManagedVendor,
  VendorEvaluationSubmission,
  BaselineEvaluationData,
  InteriorFitoutEvaluationData,
  BoughtoutMEPEvaluationData,
} from '@/types';

interface VendorEvaluationModalProps {
  isOpen: boolean;
  vendor: ManagedVendor | null;
  onClose: () => void;
  onSubmit: (vendorId: string, submission: VendorEvaluationSubmission) => void;
}

export const VendorEvaluationModal: React.FC<VendorEvaluationModalProps> = ({
  isOpen,
  vendor,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'BASELINE' | 'CATEGORY'>('BASELINE');

  const [baselineData, setBaselineData] = useState<BaselineEvaluationData>(
    DEFAULT_BASELINE_EVALUATION_DATA
  );

  const [submissionNotes, setSubmissionNotes] = useState<string>(
    'Factory audit verified by category manager. Strong solvency and verified delivery credentials.'
  );

  const [interiorData, setInteriorData] = useState<InteriorFitoutEvaluationData>(
    DEFAULT_INTERIOR_EVALUATION_DATA
  );

  const [boughtoutData, setBoughtoutData] = useState<BoughtoutMEPEvaluationData>(
    DEFAULT_BOUGHTOUT_EVALUATION_DATA
  );

  const isInterior = useMemo(
    () =>
      Boolean(
        vendor?.category.toLowerCase().includes('interior') ||
          vendor?.category.toLowerCase().includes('fitout') ||
          vendor?.subCategory.toLowerCase().includes('joinery')
      ),
    [vendor]
  );

  const currentSubmission: VendorEvaluationSubmission = useMemo(
    () => ({
      ...baselineData,
      submissionNotes,
      categorySpecificData: isInterior
        ? { interiorFitout: interiorData }
        : { boughtoutMEP: boughtoutData },
    }),
    [baselineData, submissionNotes, isInterior, interiorData, boughtoutData]
  );

  const previewScore = useMemo(
    () => calculateVendorEvaluationScore(currentSubmission),
    [currentSubmission]
  );

  if (!isOpen || !vendor) return null;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit(vendor.id, currentSubmission);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {vendor.id}
                </span>
                <span className="text-xs text-slate-400 font-semibold">• {vendor.category}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {UI_STRINGS.vendorManagement.evaluationModalTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Evaluating: <strong className="text-slate-800">{vendor.name}</strong>
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

        {/* Real-time System Scoring Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center">
              <Star className="w-3.5 h-3.5 mr-1 fill-amber-400" />
              Automated System Scoring Engine
            </span>
            <div className="text-xl font-black text-white">
              Grade: <span className="text-emerald-400">{previewScore.grade}</span> ({previewScore.totalScore}/100 Pts)
            </div>
            <p className="text-[11px] text-slate-300">
              System Star Rating: <strong className="text-amber-300">{previewScore.calculatedRating} ★</strong> • Status:{' '}
              <strong className={previewScore.status === 'VERIFIED' ? 'text-emerald-400' : 'text-rose-400'}>
                {previewScore.status}
              </strong>
            </p>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] shrink-0">
            <div className="bg-white/10 rounded-xl p-2">
              <span className="text-slate-400 block font-medium">Fin (20)</span>
              <span className="text-xs font-black text-white">{previewScore.financialScore}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <span className="text-slate-400 block font-medium">Ops (25)</span>
              <span className="text-xs font-black text-white">{previewScore.operationalScore}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <span className="text-slate-400 block font-medium">Qual (20)</span>
              <span className="text-xs font-black text-white">{previewScore.qualityScore}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <span className="text-slate-400 block font-medium">Comp (15)</span>
              <span className="text-xs font-black text-white">{previewScore.complianceScore}</span>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-2">
              <span className="text-emerald-300 block font-medium">Cred (20)</span>
              <span className="text-xs font-black text-emerald-400">{previewScore.categoryCredibilityScore}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('BASELINE')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'BASELINE'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {UI_STRINGS.vendorManagement.tabGeneralEvaluation}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CATEGORY')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'CATEGORY'
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorManagement.tabCategoryEvaluation}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {activeTab === 'BASELINE' ? (
            <BaselineAuditForm data={baselineData} onChange={setBaselineData} />
          ) : isInterior ? (
            <InteriorFitoutEvaluationForm data={interiorData} onChange={setInteriorData} />
          ) : (
            <BoughtoutMEPEvaluationForm data={boughtoutData} onChange={setBoughtoutData} />
          )}

          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold">Evaluation Notes / Auditor Observations</label>
            <textarea
              rows={2}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-slate-500 font-semibold text-[11px]">
              {activeTab === 'BASELINE'
                ? 'Tip: Switch to Tab 2 to verify category credibility & references'
                : 'Category credibility contributes up to 20 points'}
            </span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
              >
                {UI_STRINGS.common.cancel}
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>{UI_STRINGS.vendorManagement.submitEvaluationButton}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
