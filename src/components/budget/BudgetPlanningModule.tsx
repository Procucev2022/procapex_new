import React, { useState } from 'react';
import { ShieldCheck, Layers, Table } from 'lucide-react';
import type { BudgetPlanningModuleProps } from '@/types';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';
import { BudgetOverviewHeader } from './BudgetOverviewHeader';
import { CategorySelectorTabs } from './CategorySelectorTabs';
import { CategoryBOQTable } from './CategoryBOQTable';
import { CategoryBudgetSummary } from './CategoryBudgetSummary';

export const BudgetPlanningModule: React.FC<BudgetPlanningModuleProps> = () => {
  const strings = UI_STRINGS.budgetPlanning;
  const {
    projectCategories,
    projectBudget,
    updateItemQuantity,
    updateContingencyRate,
    updateProjectSqFt,
    freezeBudgetBaseline,
    resetCategoryQuantities,
    downloadCategoryBOQCSV,
    downloadCategorySummaryCSV,
  } = useProcurement();

  const [activeCategoryId, setActiveCategoryId] = useState<string>('CAT-CIVIL');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  const activeCategory = projectCategories.find((c) => c.id === activeCategoryId);

  const handleSelectCategoryFromSummary = (categoryId: string): void => {
    setActiveCategoryId(categoryId);
    setViewMode('detailed');
  };

  return (
    <div className="space-y-6">
      {/* Finance Manager Role Context Alert Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-200">
              {strings.badge}
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {strings.financeRoleNotice}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Executive Budget KPI & Baseline Overview */}
      <BudgetOverviewHeader
        budgetState={projectBudget}
        onContingencyChange={updateContingencyRate}
        onFreezeBaseline={freezeBudgetBaseline}
        onExportProjectSummary={() => {
          // Handled declaratively via download links
        }}
      />

      {/* 2. View Mode Toggle: Category Summary vs Detailed BOQs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setViewMode('summary')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'summary'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{strings.viewModeSummary}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('detailed')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'detailed'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{strings.viewModeDetailed}</span>
          </button>
        </div>
      </div>

      {/* 3. Render either Category Summary or Detailed BOQ View */}
      {viewMode === 'summary' && (
        <CategoryBudgetSummary
          categories={projectCategories}
          budgetState={projectBudget}
          onSelectCategory={handleSelectCategoryFromSummary}
          onUpdateProjectSqFt={updateProjectSqFt}
          onDownloadSummaryCSV={downloadCategorySummaryCSV}
        />
      )}

      {viewMode === 'detailed' && (
        <>
          {/* Category Selector Cards Grid */}
          <CategorySelectorTabs
            categories={projectCategories}
            activeCategoryId={activeCategoryId}
            totalEstimatedCost={projectBudget.totalEstimatedBOQCost}
            onSelectCategory={setActiveCategoryId}
            onDownloadCategoryBOQ={downloadCategoryBOQCSV}
          />

          {/* Active Category Standard BOQ Table with Price Benchmarking */}
          {activeCategory && (
            <CategoryBOQTable
              category={activeCategory}
              onUpdateQuantity={updateItemQuantity}
              onResetCategoryQuantities={resetCategoryQuantities}
              onDownloadCategoryBOQ={downloadCategoryBOQCSV}
            />
          )}
        </>
      )}
    </div>
  );
};
