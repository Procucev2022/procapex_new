import type { BudgetCategory, ProjectBudgetState, CategorySummaryMetrics } from '@/types';
import { UI_STRINGS } from '@/constants';

/**
 * Recalculates total project financial metrics based on updated category subtotals and built-up area.
 */
export function recalculateProjectBudget(
  categories: BudgetCategory[],
  currentBudget: ProjectBudgetState,
  newContingencyRate?: number,
  newSqFt?: number,
): ProjectBudgetState {
  const contingencyRatePercent =
    newContingencyRate !== undefined ? newContingencyRate : currentBudget.contingencyRatePercent;

  const totalProjectSqFt = newSqFt !== undefined ? newSqFt : currentBudget.totalProjectSqFt;
  const safeSqFt = totalProjectSqFt > 0 ? totalProjectSqFt : 1;

  const totalEstimatedBOQCost = categories.reduce((sum, cat) => sum + cat.subtotalCost, 0);
  const contingencyAmount = Math.round(totalEstimatedBOQCost * (contingencyRatePercent / 100));
  const grandTotalBudgeted = totalEstimatedBOQCost + contingencyAmount;
  const totalCommittedCost = categories.reduce((sum, cat) => sum + cat.committedCost, 0);
  const unallocatedVariance = currentBudget.totalBaselineBudget - grandTotalBudgeted;
  const costPerSqFt = Math.round(grandTotalBudgeted / safeSqFt);
  const baselineCostPerSqFt = Math.round(currentBudget.totalBaselineBudget / safeSqFt);

  return {
    ...currentBudget,
    totalEstimatedBOQCost,
    contingencyRatePercent,
    contingencyAmount,
    grandTotalBudgeted,
    totalCommittedCost,
    unallocatedVariance,
    totalProjectSqFt,
    costPerSqFt,
    baselineCostPerSqFt,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}


/**
 * Formats CSV string for a single Category Standard BOQ template.
 */
export function generateCategoryCSV(category: BudgetCategory): string {
  const strings = UI_STRINGS.budgetPlanning;
  const headers = [
    strings.csvHeaderItemCode,
    strings.csvHeaderCategory,
    strings.csvHeaderDescription,
    strings.csvHeaderUOM,
    strings.csvHeaderBenchmarkRate,
    strings.csvHeaderQuantity,
    strings.csvHeaderCalculatedCost,
    strings.csvHeaderHistoricalLow,
    strings.csvHeaderCostCenter,
  ];

  const activeItems = category.items.filter((item) => item.status !== 'ON_HOLD');
  const rows = activeItems.map((item) => [
    `"${item.code}"`,
    `"${category.name}"`,
    `"${item.desc.replace(/"/g, '""')}"`,
    `"${item.uom}"`,
    item.benchmarkRate,
    item.qty,
    item.calculatedCost,
    item.benchmarkDetails.historicalLowestRate,
    `"${category.costCenter}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Formats CSV string for PR Requisition Standard BOQ template (4 columns, without quantities by default).
 * Compatible with PR BOQ upload parser and corporate requisition format.
 */
export function generateStandardBOQTemplateCSV(
  category?: BudgetCategory | null,
  blankQuantity = true,
): string {
  const headers = [
    'Item Code',
    'Item Description / Specs',
    'Unit (UOM)',
    'Required Quantity',
  ];

  if (!category) {
    const starterRow = [
      '"ITEM-001"',
      '"[Enter Item Description / Specifications]"',
      '"Nos"',
      '',
    ];
    return [headers.join(','), starterRow.join(',')].join('\n');
  }

  const activeItems = (category.items ?? []).filter((item) => item.status !== 'ON_HOLD');
  if (activeItems.length === 0) {
    const codePrefix = category.shortCode ? `${category.shortCode.toUpperCase()}-001` : 'ITEM-001';
    const starterRow = [
      `"${codePrefix}"`,
      `"[Enter ${category.name || 'Item'} Description / Specifications]"`,
      '"Nos"',
      '',
    ];
    return [headers.join(','), starterRow.join(',')].join('\n');
  }

  const rows = activeItems.map((item) => [
    `"${item.code}"`,
    `"${item.desc.replace(/"/g, '""')}"`,
    `"${item.uom}"`,
    blankQuantity ? '' : (item.defaultQty ?? item.qty ?? ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Formats CSV string for Consolidated Multi-Category Project Budget.
 */
export function generateProjectCSV(
  categories: BudgetCategory[],
  budgetState: ProjectBudgetState,
): string {
  const strings = UI_STRINGS.budgetPlanning;
  const lines: string[] = [
    `"Project Name: ${budgetState.projectName}"`,
    `"Total Baseline Budget: INR ${budgetState.totalBaselineBudget.toLocaleString('en-IN')}"`,
    `"Total Estimated BOQ Cost: INR ${budgetState.totalEstimatedBOQCost.toLocaleString('en-IN')}"`,
    `"Contingency Buffer (${budgetState.contingencyRatePercent}%): INR ${budgetState.contingencyAmount.toLocaleString('en-IN')}"`,
    `"Grand Total Budget: INR ${budgetState.grandTotalBudgeted.toLocaleString('en-IN')}"`,
    `"Budget Status: ${budgetState.status}"`,
    '',
    [
      strings.csvHeaderItemCode,
      strings.csvHeaderCategory,
      strings.csvHeaderDescription,
      strings.csvHeaderUOM,
      strings.csvHeaderBenchmarkRate,
      strings.csvHeaderQuantity,
      strings.csvHeaderCalculatedCost,
    ].join(','),
  ];

  categories.forEach((cat) => {
    const activeItems = cat.items.filter((item) => item.status !== 'ON_HOLD');
    activeItems.forEach((item) => {
      lines.push(
        [
          `"${item.code}"`,
          `"${cat.name}"`,
          `"${item.desc.replace(/"/g, '""')}"`,
          `"${item.uom}"`,
          item.benchmarkRate,
          item.qty,
          item.calculatedCost,
        ].join(','),
      );
    });
  });

  return lines.join('\n');
}

/**
 * Computes category-level summary metrics, percentage shares, and cost per sq. ft.
 */
export function computeCategorySummaryMetrics(
  categories: BudgetCategory[],
  budgetState: ProjectBudgetState,
): CategorySummaryMetrics[] {
  const safeSqFt = budgetState.totalProjectSqFt > 0 ? budgetState.totalProjectSqFt : 1;
  const totalEstimated = budgetState.totalEstimatedBOQCost > 0 ? budgetState.totalEstimatedBOQCost : 1;

  return categories.map((cat) => {
    const activeItems = cat.items.filter((item) => item.status !== 'ON_HOLD');
    const costPerSqFt = Math.round(cat.subtotalCost / safeSqFt);
    const baselineCostPerSqFt = Math.round(cat.baselineBudget / safeSqFt);
    const budgetSharePercent = Number(((cat.subtotalCost / totalEstimated) * 100).toFixed(1));
    const varianceAmount = cat.baselineBudget - cat.subtotalCost;
    const variancePercent =
      cat.baselineBudget > 0
        ? Number(((varianceAmount / cat.baselineBudget) * 100).toFixed(1))
        : 0;

    let status: 'UNDER_BUDGET' | 'ON_TRACK' | 'OVER_BUDGET' = 'ON_TRACK';
    if (varianceAmount > 0) {
      status = 'UNDER_BUDGET';
    } else if (varianceAmount < 0) {
      status = 'OVER_BUDGET';
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      shortCode: cat.shortCode,
      costCenter: cat.costCenter,
      itemCount: activeItems.length,
      baselineBudget: cat.baselineBudget,
      estimatedCost: cat.subtotalCost,
      costPerSqFt,
      baselineCostPerSqFt,
      budgetSharePercent,
      varianceAmount,
      variancePercent,
      status,
    };
  });
}

/**
 * Formats CSV string for the Category Budget Summary table.
 */
export function generateCategorySummaryCSV(
  categories: BudgetCategory[],
  budgetState: ProjectBudgetState,
): string {
  const strings = UI_STRINGS.budgetPlanning;
  const metrics = computeCategorySummaryMetrics(categories, budgetState);

  const headers = [
    'Category Code',
    'Category Name',
    'Cost Center',
    'Item Count',
    'Baseline Budget (INR)',
    'Estimated Cost (INR)',
    'Rate Per SqFt (INR)',
    'Baseline Rate Per SqFt (INR)',
    'Budget Share (%)',
    'Variance Amount (INR)',
    'Variance (%)',
    'Status',
  ];

  const rows = metrics.map((m) => [
    `"${m.shortCode}"`,
    `"${m.categoryName}"`,
    `"${m.costCenter}"`,
    m.itemCount,
    m.baselineBudget,
    m.estimatedCost,
    m.costPerSqFt,
    m.baselineCostPerSqFt,
    m.budgetSharePercent,
    m.varianceAmount,
    m.variancePercent,
    `"${m.status}"`,
  ]);

  const totalRow = [
    '"TOTAL"',
    `"${strings.totalRowLabel}"`,
    '""',
    categories.reduce((s, c) => s + c.items.length, 0),
    budgetState.totalBaselineBudget,
    budgetState.totalEstimatedBOQCost,
    budgetState.costPerSqFt,
    budgetState.baselineCostPerSqFt,
    100.0,
    budgetState.unallocatedVariance,
    Number(((budgetState.unallocatedVariance / budgetState.totalBaselineBudget) * 100).toFixed(1)),
    `"${budgetState.unallocatedVariance >= 0 ? 'SURPLUS' : 'DEFICIT'}"`,
  ];

  return [headers.join(','), ...rows.map((r) => r.join(',')), totalRow.join(',')].join('\n');
}

/**
 * Converts a raw CSV string to a data: URI for declarative JSX `<a download>` links,
 * avoiding any imperative DOM creation or manipulation.
 */
export function getCSVDataUri(csvContent: string): string {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
}
