'use client';

import React, { useState, useMemo } from 'react';
import {
  Building,
  Globe,
  Download,
  UploadCloud,
  UserPlus,
  Search,
  Filter,
  KeyRound,
  Send,
} from 'lucide-react';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';
import { getVendorTemplateCSVDataUri } from '@/lib/vendor-csv';
import { VendorManagementKPICards } from './VendorManagementKPICards';
import { VendorDirectoryTable } from './VendorDirectoryTable';
import { VendorUploadModal } from './VendorUploadModal';
import { QuickAddVendorModal } from './QuickAddVendorModal';
import { VendorEvaluationModal } from './VendorEvaluationModal';
import { PPORatingModal } from './PPORatingModal';
import { VendorCredibilityDrawer } from './VendorCredibilityDrawer';
import { SendCatalogueIntimationModal } from './SendCatalogueIntimationModal';
import type {
  ManagedVendor,
  VendorFilterSource,
  VendorCSVRow,
  VendorEvaluationSubmission,
  VendorPPORating,
  VendorManagementKPIs,
  VendorManagementModuleProps,
  SendCatalogueIntimationInput,
  VendorCatalogueItemPrice,
} from '@/types';

/**
 * Evaluates whether a vendor satisfies the active search query.
 */
function matchesSearchQuery(vendor: ManagedVendor, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return (
    vendor.name.toLowerCase().includes(q) ||
    vendor.gstin.toLowerCase().includes(q) ||
    vendor.city.toLowerCase().includes(q) ||
    vendor.category.toLowerCase().includes(q) ||
    Boolean(vendor.contactPerson?.toLowerCase().includes(q))
  );
}

/**
 * Filter predicate evaluating source, category, and text search.
 */
function matchVendor(
  vendor: ManagedVendor,
  sourceFilter: VendorFilterSource,
  categoryFilter: string,
  searchQuery: string
): boolean {
  if (sourceFilter === 'CLIENT_ONBOARDED' && vendor.source !== 'CLIENT_ONBOARDED') {
    return false;
  }
  if (sourceFilter === 'PROCAPX_PLATFORM' && vendor.source !== 'PROCAPX_PLATFORM') {
    return false;
  }
  if (categoryFilter !== 'ALL' && vendor.category !== categoryFilter) {
    return false;
  }
  return matchesSearchQuery(vendor, searchQuery);
}

export const VendorManagementModule: React.FC<VendorManagementModuleProps> = ({
  onRouteToVendorPortal,
}) => {
  const {
    managedVendors,
    ppos,
    addClientVendors,
    addSingleClientVendor,
    submitVendorEvaluation,
    submitPPORating,
    sendEvaluationInvite,
    activeTenant,
    setActiveRole,
    projectCategories,
    updateVendorCataloguePrices,
    sendVendorCatalogueIntimation,
    updateVendorCategories,
  } = useProcurement();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<VendorFilterSource>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState<boolean>(false);
  const [selectedVendorForEval, setSelectedVendorForEval] = useState<ManagedVendor | null>(null);
  const [selectedVendorForPPO, setSelectedVendorForPPO] = useState<ManagedVendor | null>(null);
  const [selectedVendorForDossier, setSelectedVendorForDossier] = useState<ManagedVendor | null>(null);
  const [dossierInitialTab, setDossierInitialTab] = useState<'credibility' | 'rate_card' | 'catalogue'>('credibility');
  const [selectedVendorForIntimation, setSelectedVendorForIntimation] = useState<ManagedVendor | null>(null);
  const [onboardedNotice, setOnboardedNotice] = useState<{
    vendorName: string;
    vendorId?: string;
  } | null>(null);

  const handleOpenDossier = (
    vendor: ManagedVendor,
    initialTab: 'credibility' | 'rate_card' | 'catalogue' = 'credibility'
  ): void => {
    setSelectedVendorForDossier(vendor);
    setDossierInitialTab(initialTab);
  };

  // Distinct Categories for Filter Dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    managedVendors.forEach((v) => set.add(v.category));
    return Array.from(set);
  }, [managedVendors]);

  // Filtered Vendor List
  const filteredVendors = useMemo(() => {
    return managedVendors.filter((v) =>
      matchVendor(v, sourceFilter, categoryFilter, searchQuery)
    );
  }, [managedVendors, sourceFilter, categoryFilter, searchQuery]);

  // KPI Metrics Calculation
  const kpis: VendorManagementKPIs = useMemo(() => {
    const total = managedVendors.length;
    const clientCount = managedVendors.filter((v) => v.source === 'CLIENT_ONBOARDED').length;
    const procapxCount = managedVendors.filter((v) => v.source === 'PROCAPX_PLATFORM').length;
    const pendingEval = managedVendors.filter((v) => v.evaluationStatus !== 'VERIFIED').length;
    const ppoRatedCount = managedVendors.filter((v) => v.ppoRatings.length > 0).length;

    const ratingSum = managedVendors.reduce((acc, v) => acc + v.compositeRating, 0);
    const avgRating = total > 0 ? Math.round((ratingSum / total) * 10) / 10 : 0;

    return {
      totalVendors: total,
      clientOnboardedCount: clientCount,
      procapxNetworkCount: procapxCount,
      pendingEvaluationsCount: pendingEval,
      ppoRatedVendorsCount: ppoRatedCount,
      averageRating: avgRating,
    };
  }, [managedVendors]);

  const handleImportVendors = (vendors: VendorCSVRow[]): void => {
    addClientVendors(vendors);
    if (vendors.length > 0) {
      setOnboardedNotice({
        vendorName: `${vendors.length} Vendor(s) (including ${vendors[0].name})`,
      });
    }
  };

  const handleQuickAddSubmit = (
    vendorData: Omit<
      ManagedVendor,
      'id' | 'source' | 'evaluationStatus' | 'ppoRatings' | 'compositeRating' | 'totalPPOsCompleted'
    >
  ): void => {
    addSingleClientVendor(vendorData);
    setOnboardedNotice({ vendorName: vendorData.name });
  };

  const handleEvaluationSubmit = (
    vendorId: string,
    submission: VendorEvaluationSubmission
  ): void => {
    submitVendorEvaluation(vendorId, submission);
  };

  const handlePPORatingSubmit = (
    vendorId: string,
    rating: Omit<VendorPPORating, 'id' | 'ratedAt'>
  ): void => {
    submitPPORating(vendorId, rating);
  };

  const handleSaveCataloguePrices = (
    vendorId: string,
    prices: Record<string, VendorCatalogueItemPrice>
  ): void => {
    updateVendorCataloguePrices(vendorId, prices);
    if (selectedVendorForDossier && selectedVendorForDossier.id === vendorId) {
      const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
      setSelectedVendorForDossier((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          cataloguePrices: { ...(prev.cataloguePrices || {}), ...prices },
          catalogueStatus: {
            ...(prev.catalogueStatus || { intimationSent: false }),
            hasSubmittedPrices: true,
            lastSubmittedAt: nowIso,
          },
        };
      });
    }
  };

  const handleSendCatalogueIntimation = (
    input: SendCatalogueIntimationInput
  ): void => {
    sendVendorCatalogueIntimation(input);
    if (selectedVendorForDossier && selectedVendorForDossier.id === input.vendorId) {
      const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const deadlineDate = input.customDeadline
        ? input.customDeadline
        : new Date(Date.now() + input.deadlineDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setSelectedVendorForDossier((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          catalogueStatus: {
            ...(prev.catalogueStatus || { hasSubmittedPrices: false }),
            intimationSent: true,
            intimationSentAt: nowIso,
            intimationDaysAllowed: input.deadlineDays,
            intimationDeadline: deadlineDate,
            intimationNotes: input.notes,
          },
        };
      });
    }
  };

  const handleUpdateVendorCategories = (
    vendorId: string,
    cats: string[]
  ): void => {
    updateVendorCategories(vendorId, cats);
    if (selectedVendorForDossier && selectedVendorForDossier.id === vendorId) {
      setSelectedVendorForDossier((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          categories: cats,
          category: cats[0] || prev.category,
        };
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {UI_STRINGS.vendorManagement.badge}
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              Tenant: <strong className="text-white">{activeTenant.name}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1.5 tracking-tight text-white">
            {UI_STRINGS.vendorManagement.title}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {UI_STRINGS.vendorManagement.subtitle}
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={getVendorTemplateCSVDataUri()}
            download="Client_Vendor_Format_Template.csv"
            className="py-2.5 px-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>{UI_STRINGS.vendorManagement.downloadTemplateButton}</span>
          </a>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{UI_STRINGS.vendorManagement.uploadVendorsButton}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQuickAddModalOpen(true)}
            className="py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{UI_STRINGS.vendorManagement.quickAddButton}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const target = filteredVendors[0] || managedVendors[0];
              if (target) setSelectedVendorForIntimation(target);
            }}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            title="Send Price Update Intimation to vendor with fixed timeline"
          >
            <Send className="w-4 h-4" />
            <span>Send Price Intimation</span>
          </button>
        </div>
      </div>

      {/* Onboarded Vendor Login Notice Banner */}
      {onboardedNotice && (
        <div
          data-testid="vendor-onboarded-alert"
          className="bg-emerald-50 text-emerald-950 p-4 sm:p-5 rounded-2xl border border-emerald-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-extrabold text-emerald-900 flex items-center space-x-1.5">
                <span>🎉 Vendor Onboarded Successfully:</span>
                <span className="text-emerald-800 underline decoration-emerald-500">
                  {onboardedNotice.vendorName}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-mono">
                Vendor Role Credentials: <strong>User ID: welcome</strong> |{' '}
                <strong>Password: welcome</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveRole('VENDOR');
                if (typeof window !== 'undefined') {
                  window.sessionStorage?.removeItem('procapex_vendor_authenticated');
                }
                if (onRouteToVendorPortal) {
                  onRouteToVendorPortal();
                }
              }}
              data-testid="open-vendor-login-gate"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Go to Vendor Login Portal →</span>
            </button>

            <button
              type="button"
              onClick={() => setOnboardedNotice(null)}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <VendorManagementKPICards kpis={kpis} />

      {/* Search & Source Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Source Segmented Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSourceFilter('ALL')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sourceFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            {UI_STRINGS.vendorManagement.filterAll} ({kpis.totalVendors})
          </button>

          <button
            type="button"
            onClick={() => setSourceFilter('CLIENT_ONBOARDED')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              sourceFilter === 'CLIENT_ONBOARDED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Building className="w-3 h-3" />
            <span>{UI_STRINGS.vendorManagement.filterClientOnly} ({kpis.clientOnboardedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceFilter('PROCAPX_PLATFORM')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              sourceFilter === 'PROCAPX_PLATFORM'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>{UI_STRINGS.vendorManagement.filterProcapxOnly} ({kpis.procapxNetworkCount})</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={UI_STRINGS.vendorManagement.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 text-xs border rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-slate-700 font-semibold"
            >
              <option value="ALL">{UI_STRINGS.vendorManagement.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <VendorDirectoryTable
        vendors={filteredVendors}
        onOpenEvaluation={(vendor) => setSelectedVendorForEval(vendor)}
        onOpenPPORating={(vendor) => setSelectedVendorForPPO(vendor)}
        onOpenDossier={handleOpenDossier}
        onOpenIntimation={(vendor) => setSelectedVendorForIntimation(vendor)}
        onSendInvite={sendEvaluationInvite}
      />

      {/* Modals & Credibility Dossier Drawer */}
      <VendorCredibilityDrawer
        isOpen={Boolean(selectedVendorForDossier)}
        vendor={selectedVendorForDossier}
        initialTab={dossierInitialTab}
        onClose={() => setSelectedVendorForDossier(null)}
        projectCategories={projectCategories}
        onSaveCataloguePrices={handleSaveCataloguePrices}
        onOpenIntimationModal={(v) => setSelectedVendorForIntimation(v)}
        onUpdateCategories={handleUpdateVendorCategories}
      />

      <SendCatalogueIntimationModal
        isOpen={Boolean(selectedVendorForIntimation)}
        vendor={selectedVendorForIntimation}
        onClose={() => setSelectedVendorForIntimation(null)}
        onSend={handleSendCatalogueIntimation}
      />

      <VendorUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImport={handleImportVendors}
      />

      <QuickAddVendorModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onSubmit={handleQuickAddSubmit}
        availableCategories={projectCategories.map((c) => c.name)}
      />

      <VendorEvaluationModal
        isOpen={Boolean(selectedVendorForEval)}
        vendor={selectedVendorForEval}
        onClose={() => setSelectedVendorForEval(null)}
        onSubmit={handleEvaluationSubmit}
      />

      <PPORatingModal
        isOpen={Boolean(selectedVendorForPPO)}
        vendor={selectedVendorForPPO}
        ppos={ppos}
        onClose={() => setSelectedVendorForPPO(null)}
        onSubmit={handlePPORatingSubmit}
      />
    </div>
  );
};
