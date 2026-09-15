'use client';

import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, X, Download } from 'lucide-react';
import { UI_STRINGS, formatString } from '@/constants';
import { parseVendorCSV, getVendorTemplateCSVDataUri } from '@/lib/vendor-csv';
import type { VendorCSVRow } from '@/types';

interface VendorUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (vendors: VendorCSVRow[]) => void;
}

export const VendorUploadModal: React.FC<VendorUploadModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawCSVText, setRawCSVText] = useState<string>('');
  const [parsedVendors, setParsedVendors] = useState<VendorCSVRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleTextChange = (text: string): void => {
    setRawCSVText(text);
    if (text.trim()) {
      const { validVendors, errors } = parseVendorCSV(text);
      setParsedVendors(validVendors);
      setParseErrors(errors);
    } else {
      setParsedVendors([]);
      setParseErrors([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = (): void => {
    if (parsedVendors.length > 0) {
      onImport(parsedVendors);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {UI_STRINGS.vendorManagement.uploadModalTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {UI_STRINGS.vendorManagement.uploadModalSubtitle}
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

        {/* Template Download Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-emerald-950 flex items-center">
              <Download className="w-4 h-4 mr-1.5 text-emerald-600" />
              <span>Standard Vendor Format (.CSV)</span>
            </h4>
            <p className="text-[11px] text-emerald-800">
              Download the official pre-formatted CSV template with required GSTIN, contact & trade headers.
            </p>
          </div>
          <a
            href={getVendorTemplateCSVDataUri()}
            download="Client_Vendor_Template.csv"
            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorManagement.downloadTemplateButton}</span>
          </a>
        </div>

        {/* File Upload / Paste Area */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            {UI_STRINGS.vendorManagement.uploadDropzoneText}
          </label>
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50 transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="vendor-csv-file-input"
            />
            <label
              htmlFor="vendor-csv-file-input"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline block"
            >
              {fileName ? `Selected: ${fileName}` : 'Choose CSV File from Computer'}
            </label>
            <span className="text-[10px] text-slate-400 block mt-1">
              Supports standard UTF-8 RFC 4180 CSV files
            </span>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500">
              Or paste raw CSV text directly:
            </label>
            <textarea
              rows={4}
              value={rawCSVText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Company Name,Category,Sub-Category,GSTIN,Contact Person,Email,Phone,City,Region,Capacity,Lead Time..."
              className="w-full text-xs font-mono border rounded-xl p-3 bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Validation Errors Notice */}
        {parseErrors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{UI_STRINGS.vendorManagement.uploadErrorHeader} ({parseErrors.length})</span>
            </div>
            <ul className="text-[11px] text-amber-700 space-y-1 pl-6 list-disc max-h-32 overflow-y-auto">
              {parseErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedVendors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {formatString(UI_STRINGS.vendorManagement.uploadParseSuccessTemplate, {
                  count: parsedVendors.length,
                })}
              </span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Company Name</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">GSTIN</th>
                    <th className="p-2.5">Contact</th>
                    <th className="p-2.5">City</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {parsedVendors.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{row.name}</td>
                      <td className="p-2.5">{row.category}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">{row.gstin}</td>
                      <td className="p-2.5">{row.contactPerson}</td>
                      <td className="p-2.5">{row.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
          >
            {UI_STRINGS.common.cancel}
          </button>
          <button
            type="button"
            disabled={parsedVendors.length === 0}
            onClick={handleConfirmImport}
            className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Onboard {parsedVendors.length} Verified Vendor(s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
