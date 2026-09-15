'use client';

import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  PauseCircle,
  PlayCircle,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  UploadCloud,
  LayoutGrid,
  List,
  X,
  Download,
} from 'lucide-react';
import type {
  CategoryStandardBOQMasterProps,
  StandardBOQItem,
  CategoryMasterViewMode,
  AddCategoryInput,
  AddStandardBOQItemInput,
} from '@/types';
import { UI_STRINGS, formatString } from '@/constants';
import { useProcurement } from '@/context/ProcurementContext';
import { logger } from '@/lib/logger';
import { generateStandardBOQTemplateCSV, getCSVDataUri } from '@/lib/budget-utils';
import { CategoryCard } from './CategoryCard';
import { AddCategoryModal } from './AddCategoryModal';
import { AddSubCategoryModal } from './AddSubCategoryModal';
import { AddStandardBOQItemModal } from './AddStandardBOQItemModal';
import { StandardBOQUploadModal } from './StandardBOQUploadModal';

type StatusFilter = 'ALL' | 'ACTIVE' | 'ON_HOLD';

export const CategoryStandardBOQMaster: React.FC<CategoryStandardBOQMasterProps> = ({
  onRouteToBudget,
}) => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;
  const {
    projectCategories,
    addCategory,
    addSubCategory,
    addStandardBOQItem,
    uploadBatchStandardBOQItems,
    toggleItemHoldStatus,
  } = useProcurement();

  // View state & feedback
  const [viewMode, setViewMode] = useState<CategoryMasterViewMode>('items');
  const [modalCategoryId, setModalCategoryId] = useState<string | undefined>(undefined);
  const [feedbackNotice, setFeedbackNotice] = useState<{
    title: string;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (feedbackNotice) {
      const timer = setTimeout(() => {
        setFeedbackNotice(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [feedbackNotice]);

  // Modal open states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState<boolean>(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Flatten items with category meta
  interface AugmentedBOQItem extends StandardBOQItem {
    categoryName: string;
    categoryShortCode: string;
    costCenter: string;
  }

  const allItems: AugmentedBOQItem[] = useMemo(() => {
    const list: AugmentedBOQItem[] = [];
    projectCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        list.push({
          ...item,
          categoryName: cat.name,
          categoryShortCode: cat.shortCode,
          costCenter: cat.costCenter,
        });
      });
    });
    return list;
  }, [projectCategories]);

  // Counts for KPIs
  const totalCategories = projectCategories.length;
  const totalSubCategories = useMemo(() => {
    return projectCategories.reduce((sum, c) => sum + (c.subCategories?.length ?? 0), 0);
  }, [projectCategories]);

  const activeItemsCount = useMemo(() => {
    return allItems.filter((i) => i.status !== 'ON_HOLD').length;
  }, [allItems]);

  const onHoldItemsCount = useMemo(() => {
    return allItems.filter((i) => i.status === 'ON_HOLD').length;
  }, [allItems]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && item.status === 'ON_HOLD') return false;
      if (statusFilter === 'ON_HOLD' && item.status !== 'ON_HOLD') return false;

      // Category filter
      if (selectedCategoryFilter !== 'ALL' && item.categoryId !== selectedCategoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = item.code.toLowerCase().includes(q);
        const descMatch = item.desc.toLowerCase().includes(q);
        const catMatch = item.categoryName.toLowerCase().includes(q);
        const subCatMatch = item.subCategoryName ? item.subCategoryName.toLowerCase().includes(q) : false;
        if (!codeMatch && !descMatch && !catMatch && !subCatMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, statusFilter, selectedCategoryFilter, searchQuery]);

  const formatINR = (val: number): string => `₹ ${val.toLocaleString('en-IN')}`;

  const handleToggleHold = (categoryId: string, itemId: string, currentStatus?: string): void => {
    logger.info('ui/CategoryStandardBOQMaster', 'User triggered item hold toggle', {
      categoryId,
      itemId,
      currentStatus,
    });
    toggleItemHoldStatus(categoryId, itemId);
  };

  const handleAddCategory = (input: AddCategoryInput): void => {
    addCategory(input);
    setViewMode('hierarchy');
    setSelectedCategoryFilter('ALL');
    setFeedbackNotice({
      title: strings.categoryCreatedNotice,
      message: formatString(strings.categoryCreatedSuccessTemplate, { name: input.name }),
    });
    logger.info('ui/CategoryStandardBOQMaster', 'Category created successfully', { name: input.name });
  };

  const handleAddItem = (input: AddStandardBOQItemInput): void => {
    const createdItem = addStandardBOQItem(input);
    setFeedbackNotice({
      title: strings.itemCreatedNotice,
      message: formatString(strings.itemCreatedSuccessTemplate, {
        code: createdItem?.code || input.categoryId,
        desc: input.desc,
      }),
    });
    logger.info('ui/CategoryStandardBOQMaster', 'Standard BOQ item added successfully', {
      categoryId: input.categoryId,
      desc: input.desc,
    });
  };

  const handleBatchAddItems = (inputs: AddStandardBOQItemInput[]): StandardBOQItem[] => {
    const items = uploadBatchStandardBOQItems(inputs);
    setFeedbackNotice({
      title: strings.itemCreatedNotice,
      message: formatString(strings.batchSavedSuccessTemplate, { count: items.length }),
    });
    return items;
  };

  const selectedCategoryObj = useMemo(() => {
    return projectCategories.find((c) => c.id === selectedCategoryFilter);
  }, [projectCategories, selectedCategoryFilter]);

  const activeCategoryForDownload = useMemo(() => {
    return selectedCategoryObj ?? projectCategories[0];
  }, [selectedCategoryObj, projectCategories]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {strings.badge}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {strings.badgeImmutable}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <FolderTree className="w-8 h-8 text-sky-400" />
              <span>{strings.title}</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {strings.subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-brand-800/80 hover:bg-brand-700 hover:text-white transition-all flex items-center space-x-2 border border-sky-500/30 shadow-sm"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>{strings.addCategoryButton}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSubCategoryModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-brand-800/80 hover:bg-brand-700 hover:text-white transition-all flex items-center space-x-2 border border-indigo-500/30 shadow-sm"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{strings.addSubCategoryButton}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsItemModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all flex items-center space-x-2 shadow-lg shadow-sky-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>{strings.addStandardBOQItemButton}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-brand-800/80 hover:bg-brand-700 hover:text-white transition-all flex items-center space-x-2 border border-emerald-500/30 shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>{strings.uploadButton}</span>
            </button>

            {onRouteToBudget && (
              <button
                type="button"
                onClick={onRouteToBudget}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-all flex items-center space-x-1.5 border border-slate-700"
              >
                <span>{strings.routeToBudgetButton}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Feedback Alert Banner */}
      {feedbackNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-sm transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-emerald-950">
                {feedbackNotice.title}
              </div>
              <div className="text-xs text-emerald-800 font-medium">
                {feedbackNotice.message}
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setFeedbackNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            {strings.kpiTotalCategories}
          </span>
          <p className="text-2xl font-black text-slate-900">{totalCategories}</p>
          <span className="text-[11px] text-slate-500 font-medium">Standard trade divisions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            {strings.kpiTotalSubCategories}
          </span>
          <p className="text-2xl font-black text-indigo-600">{totalSubCategories}</p>
          <span className="text-[11px] text-slate-500 font-medium">Trade sub-classifications</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            {strings.kpiActiveItems}
          </span>
          <p className="text-2xl font-black text-emerald-600">{activeItemsCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">In active procurement use</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            {strings.kpiOnHoldItems}
          </span>
          <p className="text-2xl font-black text-amber-600">{onHoldItemsCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Excluded from active BOQs</span>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('items')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              viewMode === 'items'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{strings.viewModeBOQItems}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {allItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('hierarchy')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              viewMode === 'hierarchy'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{strings.viewModeCategories}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {totalCategories}
            </span>
          </button>
        </div>
      </div>

      {viewMode === 'hierarchy' ? (
        /* Categories & Hierarchy View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projectCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onAddSubCategory={(catId) => {
                setModalCategoryId(catId);
                setIsSubCategoryModalOpen(true);
              }}
              onAddBOQItem={(catId) => {
                setModalCategoryId(catId);
                setIsItemModalOpen(true);
              }}
              onViewCategoryItems={(catId) => {
                setSelectedCategoryFilter(catId);
                setViewMode('items');
              }}
            />
          ))}
        </div>
      ) : (
        /* Standard BOQ Items View */
        <div className="space-y-6">
          {/* Toolbar: Search, Category Select, Status Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={strings.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Filters Group */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">{strings.tableColCategory}:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ALL">{strings.allCategories}</option>
                  {projectCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.shortCode} – {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Download Category Standard BOQ Template */}
              {activeCategoryForDownload && (
                <a
                  href={getCSVDataUri(generateStandardBOQTemplateCSV(activeCategoryForDownload, true))}
                  download={`${activeCategoryForDownload.shortCode || 'Category'}_Standard_BOQ_Format.csv`}
                  title={formatString(strings.downloadCategoryBOQFormatTemplate, {
                    category: activeCategoryForDownload.name,
                  })}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors inline-flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{strings.downloadStandardBOQTemplateButton}</span>
                </a>
              )}

              {/* Status Segmented Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {strings.allStatuses} ({allItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {strings.statusActive} ({activeItemsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ON_HOLD')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'ON_HOLD'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {strings.statusOnHold} ({onHoldItemsCount})
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Master Standard BOQ Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-900">
                  {formatString(strings.showingItemsTemplate, { count: filteredItems.length })}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Standard rate cards & system codes are audit-locked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[130px]">{strings.tableColItemCode}</th>
                    <th className="py-3.5 px-4 min-w-[160px]">{strings.tableColCategory}</th>
                    <th className="py-3.5 px-4 min-w-[280px]">{strings.tableColDescription}</th>
                    <th className="py-3.5 px-3 text-center">{strings.tableColUOM}</th>
                    <th className="py-3.5 px-4 text-right min-w-[140px]">{strings.tableColBenchmarkRate}</th>
                    <th className="py-3.5 px-4 text-right">{strings.tableColDefaultQty}</th>
                    <th className="py-3.5 px-4 text-right min-w-[130px]">{strings.tableColStandardCost}</th>
                    <th className="py-3.5 px-3 text-center">{strings.tableColStatus}</th>
                    <th className="py-3.5 px-4 text-center min-w-[150px]">{strings.tableColActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 px-6 text-center">
                        {selectedCategoryFilter !== 'ALL' && selectedCategoryObj ? (
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                              <FolderTree className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">
                              {formatString(strings.emptyCategoryBOQTitle, {
                                category: selectedCategoryObj.name,
                              })}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {strings.emptyCategoryBOQSubtitle}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setModalCategoryId(selectedCategoryFilter);
                                setIsItemModalOpen(true);
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-all inline-flex items-center space-x-1.5 shadow-sm"
                            >
                              <Plus className="w-4 h-4" />
                              <span>{strings.addFirstItemButton}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">
                            {strings.noItemsFoundNotice}
                          </span>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isOnHold = item.status === 'ON_HOLD';

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isOnHold ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          {/* Unique Item Code */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1 text-slate-900">
                                {item.code}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal flex items-center gap-0.5 mt-0.5">
                                <Lock className="w-2.5 h-2.5 text-slate-400" />
                                <span>{strings.badgeImmutable}</span>
                              </span>
                            </div>
                          </td>

                          {/* Category & SubCategory */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{item.categoryName}</span>
                              {item.subCategoryName ? (
                                <span className="text-[11px] text-indigo-600 font-medium">
                                  ↳ {item.subCategoryName}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">General</span>
                              )}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="py-3 px-4 font-medium text-slate-700 leading-snug">
                            <div>{item.desc}</div>
                            {item.notes && (
                              <div className="text-[10px] text-slate-400 mt-1 italic">
                                Note: {item.notes}
                              </div>
                            )}
                          </td>

                          {/* UOM */}
                          <td className="py-3 px-3 text-center font-bold text-slate-600">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {item.uom}
                            </span>
                          </td>

                          {/* Benchmark Rate */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {formatINR(item.benchmarkRate)}
                          </td>

                          {/* Default Qty */}
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {item.defaultQty.toLocaleString()}
                          </td>

                          {/* Standard Cost */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {formatINR(item.calculatedCost)}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            {isOnHold ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{strings.badgeOnHold}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{strings.badgeActive}</span>
                              </span>
                            )}
                          </td>

                          {/* Hold Governance Action */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleHold(item.categoryId, item.id, item.status)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm ${
                                isOnHold
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300'
                              }`}
                            >
                              {isOnHold ? (
                                <>
                                  <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{strings.actionResumeActive}</span>
                                </>
                              ) : (
                                <>
                                  <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{strings.actionPutOnHold}</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Informational Banner */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{strings.immutableNotice}</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{strings.onHoldNotice}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
        existingCategories={projectCategories}
      />

      <AddSubCategoryModal
        isOpen={isSubCategoryModalOpen}
        onClose={() => {
          setIsSubCategoryModalOpen(false);
          setModalCategoryId(undefined);
        }}
        categories={projectCategories}
        initialCategoryId={modalCategoryId}
        onAddSubCategory={addSubCategory}
      />

      <AddStandardBOQItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setModalCategoryId(undefined);
        }}
        categories={projectCategories}
        initialCategoryId={modalCategoryId}
        onAddItem={handleAddItem}
        onBatchAddItems={handleBatchAddItems}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      <StandardBOQUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        categories={projectCategories}
        onImportBatch={handleBatchAddItems}
      />
    </div>
  );
};
