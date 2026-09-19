'use client';

import React, { useState, useMemo } from 'react';
import { Star, X, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import type { ManagedVendor, PPOItem, VendorPPORating } from '@/types';

interface PPORatingModalProps {
  isOpen: boolean;
  vendor: ManagedVendor | null;
  ppos: PPOItem[];
  onClose: () => void;
  onSubmit: (vendorId: string, rating: Omit<VendorPPORating, 'id' | 'ratedAt'>) => void;
}

export const PPORatingModal: React.FC<PPORatingModalProps> = ({
  isOpen,
  vendor,
  ppos,
  onClose,
  onSubmit,
}) => {
  // Filter PPOs issued to this vendor
  const vendorPPOs = useMemo(() => {
    if (!vendor) return [];
    return ppos.filter(
      (p) =>
        p.vendor.toLowerCase().includes(vendor.name.toLowerCase()) ||
        vendor.name.toLowerCase().includes(p.vendor.toLowerCase())
    );
  }, [vendor, ppos]);

  const [selectedPPOId, setSelectedPPOId] = useState<string>(vendorPPOs[0]?.id || 'PPO-2026-0001');
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [timelinessRating, setTimelinessRating] = useState<number>(4);
  const [commercialRating, setCommercialRating] = useState<number>(5);
  const [comments, setComments] = useState<string>(
    'Material conformed to drawing specs. QC certificates provided on delivery.'
  );

  const overallScore = useMemo(() => {
    const avg = (qualityRating + timelinessRating + commercialRating) / 3;
    return Math.round(avg * 10) / 10;
  }, [qualityRating, timelinessRating, commercialRating]);

  if (!isOpen || !vendor) return null;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit(vendor.id, {
      ppoId: selectedPPOId || 'PPO-2026-MANUAL',
      vendorId: vendor.id,
      qualityRating,
      timelinessRating,
      commercialRating,
      overallScore,
      comments,
      ratedBy: 'Site Procurement & QC Head',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {UI_STRINGS.vendorManagement.ppoRatingModalTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vendor: <strong className="text-slate-800">{vendor.name}</strong> • Current Rating:{' '}
                <strong className="text-amber-600">{vendor.compositeRating} ★</strong>
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

        {/* Dynamic Formula Callout */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Scorecard Weighting
            </span>
            <p className="text-xs text-slate-300">
              {UI_STRINGS.vendorManagement.compositeScoreFormulaNotice}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">PPO Score</span>
            <span className="text-2xl font-black text-emerald-400">{overallScore} ★</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* PPO Selection */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Select Issued PPO to Rate *</label>
            {vendorPPOs.length > 0 ? (
              <select
                value={selectedPPOId}
                onChange={(e) => setSelectedPPOId(e.target.value)}
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200 font-bold text-slate-800"
              >
                {vendorPPOs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} – {p.itemDesc} (₹{p.grandTotal?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{UI_STRINGS.vendorManagement.noPPOsFoundNotice}</p>
                  <p className="text-[11px] text-amber-700">
                    Recording manual delivery review against baseline project order.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rating Sliders / Stars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Dimension 1 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">1. Quality & Specs</span>
                <span className="font-black text-amber-600 text-sm">{qualityRating} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={qualityRating}
                onChange={(e) => setQualityRating(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Material adherence & inspection passes.</p>
            </div>

            {/* Dimension 2 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">2. On-Time Delivery</span>
                <span className="font-black text-amber-600 text-sm">{timelinessRating} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={timelinessRating}
                onChange={(e) => setTimelinessRating(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Dispatch schedule vs agreed lead time.</p>
            </div>

            {/* Dimension 3 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">3. Commercial Integrity</span>
                <span className="font-black text-amber-600 text-sm">{commercialRating} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={commercialRating}
                onChange={(e) => setCommercialRating(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Accurate invoicing & tax compliance.</p>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Delivery Inspection Notes</label>
            <textarea
              rows={3}
              required
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide qualitative feedback on vendor performance..."
              className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
            />
          </div>

          {/* History of Past PPO Ratings */}
          {vendor.ppoRatings.length > 0 && (
            <div className="space-y-2 pt-2">
              <h5 className="font-bold text-slate-800 text-xs flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Previous PPO Ratings ({vendor.ppoRatings.length})
              </h5>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {vendor.ppoRatings.map((rat) => (
                  <div
                    key={rat.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <strong className="text-slate-800">{rat.ppoId}</strong>: {rat.comments}
                      <span className="text-slate-400 block text-[10px]">
                        Rated by {rat.ratedBy} on {rat.ratedAt}
                      </span>
                    </div>
                    <span className="font-bold text-amber-600 text-xs shrink-0">
                      {rat.overallScore} ★
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
            >
              {UI_STRINGS.common.cancel}
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{UI_STRINGS.vendorManagement.submitRatingButton}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
