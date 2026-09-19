'use client';

import React, { useState } from 'react';
import { Send, Calendar, Clock, X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { UI_STRINGS, API_VENDOR_INTIMATION_SCHEMA } from '@/constants';
import { validateSchema } from '@/lib/validator';
import type { ManagedVendor, SendCatalogueIntimationInput } from '@/types';

interface SendCatalogueIntimationModalProps {
  isOpen: boolean;
  vendor: ManagedVendor | null;
  onClose: () => void;
  onSend: (input: SendCatalogueIntimationInput) => void;
}

export const SendCatalogueIntimationModal: React.FC<SendCatalogueIntimationModalProps> = ({
  isOpen,
  vendor,
  onClose,
  onSend,
}) => {
  const [selectedTimeline, setSelectedTimeline] = useState<number>(14);
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);
  const [customDate, setCustomDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSentSuccess, setIsSentSuccess] = useState<boolean>(false);

  if (!isOpen || !vendor) return null;

  const handleTimelineSelect = (days: number): void => {
    setSelectedTimeline(days);
    setIsCustomDate(false);
  };

  const handleCustomDateSelect = (): void => {
    setIsCustomDate(true);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: SendCatalogueIntimationInput = {
      vendorId: vendor.id,
      deadlineDays: selectedTimeline,
      customDeadline: isCustomDate ? customDate : undefined,
      notes: notes.trim() || undefined,
    };

    const validation = validateSchema(payload, API_VENDOR_INTIMATION_SCHEMA);
    if (!validation.isValid) {
      setErrorMsg(validation.errorSummary || 'Validation failed');
      return;
    }

    onSend(payload);
    setIsSentSuccess(true);
    setTimeout(() => {
      setIsSentSuccess(false);
      onClose();
    }, 1200);
  };

  const assignedCats = vendor.categories && vendor.categories.length > 0
    ? vendor.categories
    : [vendor.category];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {UI_STRINGS.vendorManagement.sendIntimationModalTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {UI_STRINGS.vendorManagement.sendIntimationModalSubtitle}
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

        {isSentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-black text-slate-900">Intimation Transmitted!</h4>
            <p className="text-xs text-slate-500">
              Official catalogue pricing request sent to {vendor.name}. Status updated to Awaiting Input.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Vendor & Category Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">{vendor.name}</span>
                <span className="text-[10px] font-mono font-bold text-slate-500">{vendor.id}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-semibold mr-1">Categories:</span>
                {assignedCats.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Strict Isolation Notice */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-black text-emerald-900 text-[11px] block">
                  {UI_STRINGS.vendorManagement.rfqIsolationNotice}
                </span>
                <p className="text-[10px] text-emerald-800 leading-relaxed">
                  {UI_STRINGS.vendorManagement.rfqIsolationDescription}
                </p>
              </div>
            </div>

            {/* Timeline Picker */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{UI_STRINGS.vendorManagement.intimationTimelineLabel} *</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleTimelineSelect(7)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    !isCustomDate && selectedTimeline === 7
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {UI_STRINGS.vendorManagement.intimationDaysPreset7}
                </button>
                <button
                  type="button"
                  onClick={() => handleTimelineSelect(14)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    !isCustomDate && selectedTimeline === 14
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {UI_STRINGS.vendorManagement.intimationDaysPreset14}
                </button>
                <button
                  type="button"
                  onClick={() => handleTimelineSelect(30)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    !isCustomDate && selectedTimeline === 30
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {UI_STRINGS.vendorManagement.intimationDaysPreset30}
                </button>
                <button
                  type="button"
                  onClick={handleCustomDateSelect}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all flex items-center justify-center space-x-1 ${
                    isCustomDate
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{UI_STRINGS.vendorManagement.intimationDaysPresetCustom}</span>
                </button>
              </div>

              {isCustomDate && (
                <div className="pt-2 space-y-1">
                  <label htmlFor="custom-deadline-input" className="block text-slate-600 font-semibold">
                    {UI_STRINGS.vendorManagement.intimationCustomDateLabel}
                  </label>
                  <input
                    id="custom-deadline-input"
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full border rounded-xl p-2 bg-slate-50 focus:bg-white border-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Notes / Instructions */}
            <div className="space-y-1">
              <label htmlFor="intimation-notes-input" className="block font-bold text-slate-700 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{UI_STRINGS.vendorManagement.intimationNotesLabel}</span>
              </label>
              <textarea
                id="intimation-notes-input"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={UI_STRINGS.vendorManagement.intimationNotesPlaceholder}
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200 text-slate-800"
              />
            </div>

            {errorMsg && (
              <p className="text-rose-600 text-xs font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{UI_STRINGS.vendorManagement.intimationConfirmSendButton}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
