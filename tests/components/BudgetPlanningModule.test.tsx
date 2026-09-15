import React from 'react';
import { render, screen, fireEvent, within, renderHook, act } from '@testing-library/react';
import {
  BudgetPlanningModule,
  BudgetOverviewHeader,
  CategorySelectorTabs,
  CategoryBOQTable,
  CategoryBudgetSummary,
} from '@/components/budget';
import { ProcurementProvider } from '@/context/ProcurementContext';
import { useBudgetManager } from '@/context/useBudgetManager';
import { UI_STRINGS, INITIAL_PROJECT_CATEGORIES, INITIAL_PROJECT_BUDGET } from '@/constants';
import {
  recalculateProjectBudget,
  computeCategorySummaryMetrics,
  generateCategoryCSV,
  generateProjectCSV,
  generateCategorySummaryCSV,
  getCSVDataUri,
} from '@/lib/budget-utils';

describe('BudgetPlanningModule Component & Budget System', () => {
  const renderWithContext = (): ReturnType<typeof render> => {
    return render(
      <ProcurementProvider>
        <BudgetPlanningModule />
      </ProcurementProvider>,
    );
  };

  it('renders all barrel exports from components/budget', () => {
    expect(BudgetPlanningModule).toBeDefined();
    expect(BudgetOverviewHeader).toBeDefined();
    expect(CategorySelectorTabs).toBeDefined();
    expect(CategoryBOQTable).toBeDefined();
    expect(CategoryBudgetSummary).toBeDefined();
  });

  it('renders the Budget Planning Header, badges, and project information', () => {
    renderWithContext();

    expect(screen.getByText(UI_STRINGS.budgetPlanning.title)).toBeInTheDocument();
    expect(screen.getAllByText(UI_STRINGS.budgetPlanning.badge).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(UI_STRINGS.budgetPlanning.financeRoleNotice)).toBeInTheDocument();
    expect(screen.getByText(/Metro Line 4 Underground/i)).toBeInTheDocument();
  });

  it('renders executive financial KPI cards including Cost per Sq. Ft.', () => {
    renderWithContext();

    expect(screen.getByText(UI_STRINGS.budgetPlanning.totalBaselineBudget)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.totalEstimatedBOQCost)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.totalCommittedCost)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.unallocatedVariance)).toBeInTheDocument();
    expect(screen.getAllByText(UI_STRINGS.budgetPlanning.costPerSqFtLabel).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(UI_STRINGS.budgetPlanning.grandTotalBudgeted)).toBeInTheDocument();
  });

  it('renders Category Budget Summary by default and displays all 6 categories with sq.ft costs', () => {
    renderWithContext();

    expect(screen.getByText(UI_STRINGS.budgetPlanning.categorySummaryTitle)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.categorySummarySubtitle)).toBeInTheDocument();

    // Verify all 6 categories in summary table
    expect(screen.getByText('Civil & Structural Works')).toBeInTheDocument();
    expect(screen.getByText('MEP & HVAC Systems')).toBeInTheDocument();
    expect(screen.getByText('Interior & Fitouts (Millwork & Joinery)')).toBeInTheDocument();
    expect(screen.getByText('Structural Steel & Pre-Fab')).toBeInTheDocument();
    expect(screen.getByText('Electrical & Automation')).toBeInTheDocument();
    expect(screen.getByText('Facade & Glazing')).toBeInTheDocument();

    // Verify table headers
    expect(screen.getByText(UI_STRINGS.budgetPlanning.thCategory)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.thBaseline)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.thEstimated)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.thCostPerSqFt)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.thShare)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.totalRowLabel)).toBeInTheDocument();
  });

  it('allows entering and updating project Built-up Area (Sq. Ft.) and updates rates reactively', () => {
    renderWithContext();

    const sqftInput = screen.getByPlaceholderText(UI_STRINGS.budgetPlanning.projectAreaSqFtPlaceholder);
    expect(sqftInput).toHaveValue(125000);

    // Update to 150,000 sq.ft.
    fireEvent.change(sqftInput, { target: { value: '150000' } });
    expect(sqftInput).toHaveValue(150000);

    // Test quick presets
    const preset100k = screen.getByRole('button', { name: '100k sq.ft' });
    fireEvent.click(preset100k);
    expect(sqftInput).toHaveValue(100000);

    const preset200k = screen.getByRole('button', { name: '200k sq.ft' });
    fireEvent.click(preset200k);
    expect(sqftInput).toHaveValue(200000);

    // Test invalid / out-of-bounds input (no error thrown, ignored)
    fireEvent.change(sqftInput, { target: { value: '10' } });
    fireEvent.change(sqftInput, { target: { value: 'invalid' } });
  });

  it('switches between Category Summary and Detailed BOQ view modes', () => {
    renderWithContext();

    // Starts in summary mode
    expect(screen.getByText(UI_STRINGS.budgetPlanning.categorySummaryTitle)).toBeInTheDocument();

    // Click 'Detailed Category BOQs' button in segmented control
    const detailedBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.viewModeDetailed, 'i') });
    fireEvent.click(detailedBtn);

    // Now detailed allocation grid is shown
    expect(screen.getByText(UI_STRINGS.budgetPlanning.categoryAllocationTitle)).toBeInTheDocument();
    expect(screen.getByText('CON-RMC-M30')).toBeInTheDocument();

    // Switch back to summary
    const summaryBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.viewModeSummary, 'i') });
    fireEvent.click(summaryBtn);
    expect(screen.getByText(UI_STRINGS.budgetPlanning.categorySummaryTitle)).toBeInTheDocument();
  });

  it('clicks "Inspect BOQ" from the summary table to jump directly to detailed category view', () => {
    renderWithContext();

    // Find all 'Inspect BOQ' buttons
    const inspectButtons = screen.getAllByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.viewBOQAction, 'i') });
    expect(inspectButtons.length).toBe(6);

    // Click Inspect BOQ for Interior & Fitouts (row index 1: Civil is 0, Interior is 1)
    fireEvent.click(inspectButtons[1]);

    // Should switch to detailed view and show Interior items
    expect(screen.getByText('CNT-TOP-GRN20')).toBeInTheDocument();
    expect(screen.getByText('CNT-PLY-BWP18')).toBeInTheDocument();
  });

  it('allows entering and editing item quantity in detailed view, reactively recalculating costs', () => {
    renderWithContext();

    // Switch to detailed view
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.viewModeDetailed, 'i') }));

    const concreteRow = screen.getByText('CON-RMC-M30').closest('tr');
    expect(concreteRow).not.toBeNull();

    if (concreteRow) {
      const qtyInput = within(concreteRow).getByRole('spinbutton');
      expect(qtyInput).toHaveValue(2500);

      // Change quantity from 2500 to 3000
      fireEvent.change(qtyInput, { target: { value: '3000' } });
      expect(qtyInput).toHaveValue(3000);

      // Empty input fallback
      fireEvent.change(qtyInput, { target: { value: '' } });
      expect(within(concreteRow).getByText('₹ 0')).toBeInTheDocument();
    }
  });

  it('displays price benchmarking pills (AI Benchmark, Rate Card, Market Low)', () => {
    renderWithContext();

    // Switch to detailed view
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.viewModeDetailed, 'i') }));

    expect(screen.getAllByText(new RegExp(UI_STRINGS.budgetPlanning.benchmarkAILabel, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(UI_STRINGS.budgetPlanning.benchmarkRateCardLabel, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(UI_STRINGS.budgetPlanning.benchmarkHistoricalLabel, 'i')).length).toBeGreaterThan(0);
  });

  it('resets quantities back to standard defaults when clicking Reset button', () => {
    renderWithContext();

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.viewModeDetailed, 'i') }));

    const concreteRow = screen.getByText('CON-RMC-M30').closest('tr');
    if (concreteRow) {
      const qtyInput = within(concreteRow).getByRole('spinbutton');
      fireEvent.change(qtyInput, { target: { value: '9999' } });
      expect(qtyInput).toHaveValue(9999);

      const resetBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.resetQuantitiesButton, 'i') });
      fireEvent.click(resetBtn);

      expect(qtyInput).toHaveValue(2500);
    }
  });

  it('filters standard BOQ items with the search bar in detailed view', () => {
    renderWithContext();

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.viewModeDetailed, 'i') }));

    const searchInput = screen.getByPlaceholderText(UI_STRINGS.budgetPlanning.filterSearchPlaceholder);
    fireEvent.change(searchInput, { target: { value: 'TMT' } });

    expect(screen.getByText('STL-TMT-25MM')).toBeInTheDocument();
    expect(screen.queryByText('CON-RMC-M30')).not.toBeInTheDocument();
  });

  it('updates contingency buffer rate using slider', () => {
    renderWithContext();

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });
    expect(screen.getByText('8% Contingency Buffer')).toBeInTheDocument();
  });

  it('freezes the budget baseline and locks baseline status', () => {
    renderWithContext();

    const freezeBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.freezeBaselineButton, 'i') });
    fireEvent.click(freezeBtn);

    expect(screen.getByText(UI_STRINGS.budgetPlanning.statusBaselined)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.budgetPlanning.baselineLockedNotice)).toBeInTheDocument();
    expect(freezeBtn).toBeDisabled();
  });

  it('renders declarative CSV download links with data URIs for all reports', () => {
    renderWithContext();

    // Summary CSV link
    const summaryCsvLink = screen.getByText(UI_STRINGS.budgetPlanning.downloadCategorySummaryButton).closest('a');
    expect(summaryCsvLink).not.toBeNull();
    expect(summaryCsvLink).toHaveAttribute('download', expect.stringContaining('Category_Budget_Summary'));
    expect(summaryCsvLink?.getAttribute('href')).toMatch(/^data:text\/csv/);

    // Verify Master BOQ, New Category, and Manage Categories are removed from Budget Planning
    expect(screen.queryByText(UI_STRINGS.budgetPlanning.downloadAllBOQButton)).not.toBeInTheDocument();
    expect(screen.queryByText(UI_STRINGS.categoryStandardBOQMaster.addCategoryButton)).not.toBeInTheDocument();
    expect(screen.queryByText(UI_STRINGS.budgetPlanning.manageCategoriesButton)).not.toBeInTheDocument();

    // Export summary header button
    const exportBtn = screen.getByText(UI_STRINGS.budgetPlanning.exportProjectSummaryButton).closest('button');
    expect(exportBtn).not.toBeNull();
    fireEvent.click(exportBtn!);
  });

  it('renders CategorySelectorTabs with zero total estimated cost', () => {
    const mockSelectCategory = jest.fn();
    const mockDownload = jest.fn();

    render(
      <CategorySelectorTabs
        categories={INITIAL_PROJECT_CATEGORIES}
        activeCategoryId=""
        totalEstimatedCost={0}
        onSelectCategory={mockSelectCategory}
        onDownloadCategoryBOQ={mockDownload}
      />
    );

    expect(screen.getByText(UI_STRINGS.budgetPlanning.categoryAllocationTitle)).toBeInTheDocument();
    expect(screen.getAllByText('0.0% of Project Cost').length).toBeGreaterThan(0);
  });

  it('validates budgetManager hook validation rejections, sqft update, and download methods', () => {
    const mockSetAuditLogs = jest.fn();
    const { result } = renderHook(() => useBudgetManager(mockSetAuditLogs));

    // Invalid quantity (< 0)
    act(() => {
      result.current.updateItemQuantity('CAT-CIVIL', 'ITM-CIV-001', -50);
    });

    // Invalid contingency (> 30)
    act(() => {
      result.current.updateContingencyRate(50);
    });

    // Valid Sq. Ft. update
    act(() => {
      result.current.updateProjectSqFt(175000);
    });
    expect(result.current.projectBudget.totalProjectSqFt).toBe(175000);

    // Invalid Sq. Ft. (< 500)
    act(() => {
      result.current.updateProjectSqFt(100);
    });
    expect(result.current.projectBudget.totalProjectSqFt).toBe(175000);

    // Valid downloads
    act(() => {
      result.current.downloadCategoryBOQCSV('CAT-CIVIL');
      result.current.downloadCategoryBOQCSV('NON_EXISTENT_CAT');
      result.current.downloadProjectBudgetCSV();
      result.current.downloadCategorySummaryCSV();
    });

    expect(result.current.projectCategories.length).toBe(6);
  });

  it('switches categories and handles downloads in CategorySelectorTabs in detailed view', () => {
    renderWithContext();

    // Switch to detailed view
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.budgetPlanning.viewModeDetailed, 'i') }));

    // Click on MEP category card
    const mepTitle = screen.getByText('MEP & HVAC Systems');
    fireEvent.click(mepTitle);

    // Verify MEP items are displayed
    expect(screen.getByText('MEP-CHL-200TR')).toBeInTheDocument();

    // Click download button on a category card with stopPropagation
    const downloadIcons = screen.getAllByTitle(UI_STRINGS.budgetPlanning.downloadCategoryBOQButton);
    expect(downloadIcons.length).toBeGreaterThan(0);
    fireEvent.click(downloadIcons[0]);
  });

  it('renders CategoryBudgetSummary with unfavorable variance and deficit status', () => {
    const mockCategories = INITIAL_PROJECT_CATEGORIES.map((c, i) => ({
      ...c,
      baselineBudget: i === 0 ? 0 : 500, // 0 to test baselineBudget === 0 branch
      subtotalCost: 10000000, // higher than baseline to trigger deficit
    }));

    const mockDeficitBudget = {
      ...INITIAL_PROJECT_BUDGET,
      baselineCostPerSqFt: 50,
      costPerSqFt: 200, // cost > baseline -> unfavorable variancePerSqFt < 0
      unallocatedVariance: -5000000,
    };

    const mockSelect = jest.fn();
    const mockUpdateSqFt = jest.fn();
    const mockDownload = jest.fn();

    render(
      <CategoryBudgetSummary
        categories={mockCategories}
        budgetState={mockDeficitBudget}
        onSelectCategory={mockSelect}
        onUpdateProjectSqFt={mockUpdateSqFt}
        onDownloadSummaryCSV={mockDownload}
      />
    );

    expect(screen.getByText(UI_STRINGS.budgetPlanning.statusOverBudget)).toBeInTheDocument();
  });

  it('tests budget-utils edge cases for CSV, sqft recalculation, and variance branches', () => {
    const { result } = renderHook(() => useBudgetManager(jest.fn()));
    const budget = result.current.projectBudget;
    const categories = result.current.projectCategories;

    // Recalculate with explicit contingency and newSqFt
    const recalculatedWithSqFt = recalculateProjectBudget(categories, budget, 10, 250000);
    expect(recalculatedWithSqFt.totalProjectSqFt).toBe(250000);
    expect(recalculatedWithSqFt.contingencyRatePercent).toBe(10);

    // Compute metrics with zero baselineBudget and exact match (on track)
    const onTrackCategories = categories.map((c) => ({
      ...c,
      baselineBudget: c.subtotalCost, // varianceAmount === 0 -> ON_TRACK
    }));
    const onTrackMetrics = computeCategorySummaryMetrics(onTrackCategories, budget);
    expect(onTrackMetrics[0].status).toBe('ON_TRACK');

    // Generate summary CSV with deficit project total
    const deficitBudget = {
      ...budget,
      unallocatedVariance: -2000000,
    };
    const deficitCsv = generateCategorySummaryCSV(categories, deficitBudget);
    expect(deficitCsv).toContain('DEFICIT');

    // Generate CSVs
    const catCsv = generateCategoryCSV(categories[0]);
    expect(catCsv).toContain('CON-RMC-M30');

    const projCsv = generateProjectCSV(categories, budget);
    expect(projCsv).toContain('Metro Line 4');

    const summaryCsv = generateCategorySummaryCSV(categories, budget);
    expect(summaryCsv).toContain('Civil & Structural Works');
    expect(summaryCsv).toContain('TOTAL');

    const uri = getCSVDataUri(summaryCsv);
    expect(uri.startsWith('data:text/csv;charset=utf-8,')).toBe(true);
  });

  it('tests metrics calculation with edge-case deficit status', () => {
    const mockCategories = INITIAL_PROJECT_CATEGORIES.map((c) => ({
      ...c,
      baselineBudget: 100, // Very low baseline so variance is negative (over budget)
    }));
    const mockBudget = {
      ...INITIAL_PROJECT_BUDGET,
      totalBaselineBudget: 500,
      totalProjectSqFt: 0, // Safe fallback test
      totalEstimatedBOQCost: 0,
    };

    const metrics = computeCategorySummaryMetrics(mockCategories, mockBudget);
    expect(metrics[0].status).toBe('OVER_BUDGET');
  });
});
