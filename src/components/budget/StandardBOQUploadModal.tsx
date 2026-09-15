'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UI_STRINGS, formatString } from '@/constants';
import { parseStandardBOQCSV, getStandardBOQTemplateCSVDataUri } from '@/lib/standard-boq-csv';
import { logger } from '@/lib/logger';
import type { StandardBOQUploadModalProps, ParsedStandardBOQItem } from '@/types';

export const StandardBOQUploadModal: React.FC<StandardBOQUploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  onImportBatch,
}) => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;
  const commonStrings = UI_STRINGS.common;

  const [rawCSVText, setRawCSVText] = useState<string>('');
  const [parsedItems, setParsedItems] = useState<ParsedStandardBOQItem[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [activeInputMode, setActiveInputMode] = useState<'FILE' | 'PASTE'>('FILE');

  if (!isOpen) return null;

  const processCSVContent = (content: string): void => {
    setRawCSVText(content);
    if (content.trim()) {
      const { validItems, errors } = parseStandardBOQCSV(content, categories);
      setParsedItems(validItems);
      setParseErrors(errors);
      logger.info('ui/StandardBOQUploadModal', 'Processed CSV content in modal', {
        validCount: validItems.length,
        errorCount: errors.length,
      });
    } else {
      setParsedItems([]);
      setParseErrors([]);
    }
  };

  const readAndProcessFile = (file: File): void => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      processCSVContent(typeof content === 'string' ? content : '');
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      readAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleConfirmImport = (): void => {
    if (parsedItems.length === 0) return;

    const payload = parsedItems.map((item) => ({
      categoryId: item.categoryId,
      subCategoryId: item.subCategoryId,
      desc: item.desc,
      uom: item.uom,
      benchmarkRate: item.benchmarkRate,
      defaultQty: item.defaultQty,
      notes: item.notes,
    }));

    try {
      onImportBatch(payload);
      logger.info('ui/StandardBOQUploadModal', 'Confirmed batch import of standard BOQ items', {
        itemCount: payload.length,
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to import standard BOQ items';
      setParseErrors((prev) => [msg, ...prev]);
      logger.error('ui/StandardBOQUploadModal', 'Failed to import standard BOQ items', { error: msg });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {strings.uploadModalTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {strings.uploadModalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={commonStrings.close}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Download Card */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-sky-950 flex items-center">
              <Download className="w-4 h-4 mr-1.5 text-sky-600 shrink-0" />
              <span>{strings.templateDownloadTitle}</span>
            </h4>
            <p className="text-[11px] text-sky-800">
              {strings.templateDownloadDesc}
            </p>
          </div>
          <a
            href={getStandardBOQTemplateCSVDataUri()}
            download="standard_boq_template.csv"
            className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs rounded-xl border border-sky-300 shadow-sm hover:shadow transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {strings.downloadTemplateButton}
          </a>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveInputMode('FILE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeInputMode === 'FILE'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            File Upload (.csv)
          </button>
          <button
            type="button"
            onClick={() => setActiveInputMode('PASTE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeInputMode === 'PASTE'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {strings.orPasteText}
          </button>
        </div>

        {/* Input Area */}
        {activeInputMode === 'FILE' ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/30 hover:bg-sky-50/60 rounded-2xl p-6 text-center transition-all cursor-pointer relative"
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              aria-label="Upload CSV File"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                {fileName ? (
                  <span className="text-sky-700 font-mono font-black">{fileName}</span>
                ) : (
                  strings.dropzoneTitle
                )}
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                {strings.dropzoneSubtitle}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="manual-csv-textarea" className="block text-xs font-bold text-slate-700">
              {strings.orPasteText}
            </label>
            <textarea
              id="manual-csv-textarea"
              rows={5}
              value={rawCSVText}
              onChange={(e) => processCSVContent(e.target.value)}
              placeholder={strings.pastePlaceholder}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono text-xs transition-all"
            />
          </div>
        )}

        {/* Validation Status Badges */}
        {(parsedItems.length > 0 || parseErrors.length > 0) && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {formatString(strings.previewValidRowsTemplate, {
                  count: parsedItems.length,
                })}
              </span>
            </div>
            {parseErrors.length > 0 && (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>
                  {formatString(strings.previewErrorsTemplate, {
                    count: parseErrors.length,
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Diagnostics List */}
        {parseErrors.length > 0 && (
          <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-1 text-xs text-rose-800">
            <div className="font-bold mb-1.5 text-rose-900 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Parsing & Validation Diagnostics</span>
            </div>
            {parseErrors.map((err, idx) => (
              <div key={idx} className="font-mono text-[11px] leading-relaxed">
                • {err}
              </div>
            ))}
          </div>
        )}

        {/* Valid Items Preview Table */}
        {parsedItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Standard Items Scheduled for Import</span>
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">
                Live Unique Codes Preview
              </span>
            </div>
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">Generated Code</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Sub-Category</th>
                    <th className="p-2.5">Specification</th>
                    <th className="p-2.5">UOM</th>
                    <th className="p-2.5 text-right">Benchmark Rate</th>
                    <th className="p-2.5 text-right">Default Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                      <td className="p-2.5 text-slate-400 font-mono text-[11px]">{item.rowNumber}</td>
                      <td className="p-2.5 font-mono font-bold text-sky-900">{item.previewCode}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{item.categoryName}</td>
                      <td className="p-2.5 text-slate-600">{item.subCategoryName || '—'}</td>
                      <td className="p-2.5 max-w-xs truncate text-slate-700" title={item.desc}>
                        {item.desc}
                      </td>
                      <td className="p-2.5 text-slate-600">{item.uom}</td>
                      <td className="p-2.5 text-right font-mono text-slate-900">
                        ₹{item.benchmarkRate.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-700">
                        {item.defaultQty.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Immutability Notice */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 text-[11px] text-slate-600">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{strings.immutableNotice}</span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {commonStrings.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedItems.length === 0}
            className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center space-x-2 ${
              parsedItems.length > 0
                ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-200 hover:shadow-lg'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>
              {parsedItems.length > 0
                ? formatString(strings.confirmImportButtonTemplate, {
                    count: parsedItems.length,
                  })
                : strings.noValidItemsToImport}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
