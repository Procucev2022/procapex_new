import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProcurementProvider, useProcurement } from '@/context/ProcurementContext';
import { BudgetPlanningModule } from '@/components/budget/BudgetPlanningModule';
import { PRModule } from '@/components/PRModule';
import { CategoryStandardBOQMaster } from '@/components/budget/CategoryStandardBOQMaster';
import { UI_STRINGS } from '@/constants';

// Test wrapper that provides ProcurementProvider and a switcher between modules
const IntegratedTestHarness: React.FC = () => {
  const { projectCategories } = useProcurement();
  const [activeModule, setActiveModule] = React.useState<'module1' | 'module2' | 'module3'>('module1');

  return (
    <div>
      <div data-testid="module-switcher">
        <button onClick={() => setActiveModule('module1')}>Show Module 1</button>
        <button onClick={() => setActiveModule('module2')}>Show Module 2</button>
        <button onClick={() => setActiveModule('module3')}>Show Module 3</button>
      </div>

      <div data-testid="active-categories-count">{projectCategories.length}</div>

      {activeModule === 'module1' && <BudgetPlanningModule />}
      {activeModule === 'module2' && <PRModule />}
      {activeModule === 'module3' && <CategoryStandardBOQMaster />}
    </div>
  );
};

describe('Category & Standard BOQ Master Cross-Module Integration', () => {
  beforeEach(() => {
    window.alert = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('adds a new Category with Major & Sub Category in Module 1 and propagates to Module 2 and Module 3', () => {
    render(
      <ProcurementProvider>
        <IntegratedTestHarness />
      </ProcurementProvider>
    );

    // Verify initial categories in Module 1
    expect(screen.getByText(UI_STRINGS.budgetPlanning.categorySummaryTitle)).toBeInTheDocument();

    // Switch to Module 3 (Category & Standard BOQ Master) to create category
    fireEvent.click(screen.getByText('Show Module 3'));

    // Open Add Category Modal in Module 3 via the New Category button
    const openAddCatBtns = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.categoryStandardBOQMaster.addCategoryButton, 'i'),
    });
    fireEvent.click(openAddCatBtns[0]);

    // Modal should be open
    expect(screen.getByText(UI_STRINGS.categoryStandardBOQMaster.addCategoryModalTitle)).toBeInTheDocument();

    // Fill in Major Category and Sub Category
    const majorInput = screen.getByPlaceholderText(UI_STRINGS.categoryStandardBOQMaster.categoryNamePlaceholder);
    const subInput = screen.getByPlaceholderText(UI_STRINGS.categoryStandardBOQMaster.subCategoryPlaceholder);
    const budgetInput = screen.getByPlaceholderText(UI_STRINGS.categoryStandardBOQMaster.baselineBudgetPlaceholder);
    const submitBtn = screen.getByRole('button', {
      name: UI_STRINGS.categoryStandardBOQMaster.submitCategoryButton,
    });

    fireEvent.change(majorInput, { target: { value: 'Fire & Safety Systems' } });
    fireEvent.change(subInput, { target: { value: 'Smoke Detectors & Sprinklers' } });
    fireEvent.change(budgetInput, { target: { value: '2500000' } });

    fireEvent.click(submitBtn);

    // Modal closed
    expect(
      screen.queryByText(UI_STRINGS.categoryStandardBOQMaster.addCategoryModalTitle)
    ).not.toBeInTheDocument();

    // Switch to Module 1 and check that "Fire & Safety Systems" is visible in Category Budget Summary table
    fireEvent.click(screen.getByText('Show Module 1'));
    expect(screen.getByText('Fire & Safety Systems')).toBeInTheDocument();

    // Switch to Module 2 (BOQ & RFQ Management -> PRModule)
    fireEvent.click(screen.getByText('Show Module 2'));

    // In PRModule, go directly to Step 2 (Category Selection)
    const tab2Btn = screen.getByRole('button', { name: /Category Selection/i });
    fireEvent.click(tab2Btn);

    // Step 2 is active: Verify "Fire & Safety Systems" is in Major Category dropdown
    expect(screen.getByRole('option', { name: 'Fire & Safety Systems' })).toBeInTheDocument();

    // Select "Fire & Safety Systems" in Major Category
    const majorSelect = screen.getByDisplayValue(/Interior & Fitouts/i);
    fireEvent.change(majorSelect, { target: { value: 'Fire & Safety Systems' } });

    // Sub Category dropdown should now have "Smoke Detectors & Sprinklers"
    expect(screen.getByRole('option', { name: 'Smoke Detectors & Sprinklers' })).toBeInTheDocument();

    // Switch to Module 3 (Category & Standard BOQ Master)
    fireEvent.click(screen.getByText('Show Module 3'));

    // Module 3 should show "Fire & Safety Systems"
    expect(screen.getByText(UI_STRINGS.categoryStandardBOQMaster.title)).toBeInTheDocument();

    // Switch view to hierarchy mode
    const hierarchyBtn = screen.getByRole('button', { name: /Hierarchy/i });
    fireEvent.click(hierarchyBtn);

    expect(screen.getByText('Fire & Safety Systems')).toBeInTheDocument();
    expect(screen.getByText('Smoke Detectors & Sprinklers')).toBeInTheDocument();
  });

  it('loads standard BOQ items dynamically from Master in Module 2 Method 2', () => {
    render(
      <ProcurementProvider>
        <IntegratedTestHarness />
      </ProcurementProvider>
    );

    // Switch to Module 2
    fireEvent.click(screen.getByText('Show Module 2'));

    // Move to Step 3 tab
    const step3Tab = screen.getByRole('button', { name: /BOQ Studio/i });
    fireEvent.click(step3Tab);

    // Click Method 2 card
    const method2Card = screen.getByText('2. Standard Template');
    fireEvent.click(method2Card);

    // Select Civil Infrastructure package and click load standard package button
    const pkgSelect = screen.getByLabelText(
      UI_STRINGS.categoryStandardBOQMaster.selectStandardPackageLabel
    );
    fireEvent.change(pkgSelect, { target: { value: 'CAT-CIVIL' } });

    const loadPkgBtn = screen.getByRole('button', {
      name: UI_STRINGS.categoryStandardBOQMaster.loadStandardPackageButton,
    });
    fireEvent.click(loadPkgBtn);

    // Verify feedback and schedule items loaded
    expect(
      screen.getByText(/Loaded \d+ items from Civil & Structural Works/i)
    ).toBeInTheDocument();
  });

  it('adds a new standard BOQ item in Module 3 Master and propagates to Module 1 and Module 2', () => {
    render(
      <ProcurementProvider>
        <IntegratedTestHarness />
      </ProcurementProvider>
    );

    // Switch to Module 3
    fireEvent.click(screen.getByText('Show Module 3'));

    // Open Add Standard BOQ Item Modal
    const addItemBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.categoryStandardBOQMaster.addStandardBOQItemButton, 'i'),
    });
    fireEvent.click(addItemBtn);

    expect(screen.getByText(UI_STRINGS.categoryStandardBOQMaster.addItemModalTitle)).toBeInTheDocument();

    // Fill in item description, rate, qty for Civil category (default selected)
    const descInput = screen.getByPlaceholderText(UI_STRINGS.categoryStandardBOQMaster.itemDescPlaceholder);
    const rateInput = screen.getByPlaceholderText(UI_STRINGS.categoryStandardBOQMaster.benchmarkRatePlaceholder);
    const qtyInput = screen.getByPlaceholderText(UI_STRINGS.categoryStandardBOQMaster.defaultQtyPlaceholder);

    fireEvent.change(descInput, { target: { value: 'High Grade Ready Mix Concrete M40' } });
    fireEvent.change(rateInput, { target: { value: '5500' } });
    fireEvent.change(qtyInput, { target: { value: '250' } });

    // Submit the form
    const submitBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.categoryStandardBOQMaster.submitItemButton, 'i'),
    });
    fireEvent.click(submitBtn);

    // Verify item appears in Module 3 items view
    expect(screen.getByText('High Grade Ready Mix Concrete M40')).toBeInTheDocument();

    // Switch to Module 1 - Verify Civil category is present
    fireEvent.click(screen.getByText('Show Module 1'));
    expect(screen.getByText('Civil & Structural Works')).toBeInTheDocument();

    // Switch to Module 2 - Method 2
    fireEvent.click(screen.getByText('Show Module 2'));
    const step3Tab = screen.getByRole('button', { name: /BOQ Studio/i });
    fireEvent.click(step3Tab);
    const method2Card = screen.getByText('2. Standard Template');
    fireEvent.click(method2Card);

    // Select Civil package and load into schedule
    const pkgSelect = screen.getByLabelText(
      UI_STRINGS.categoryStandardBOQMaster.selectStandardPackageLabel
    );
    fireEvent.change(pkgSelect, { target: { value: 'CAT-CIVIL' } });

    const loadPkgBtn = screen.getByRole('button', {
      name: UI_STRINGS.categoryStandardBOQMaster.loadStandardPackageButton,
    });
    fireEvent.click(loadPkgBtn);

    // Verify the newly added item from Master is loaded into the PR BOQ schedule!
    expect(screen.getByText('High Grade Ready Mix Concrete M40')).toBeInTheDocument();
  });

  it('loads standard BOQ master into PR schedule without quantities via Step 2 direct button', () => {
    render(
      <ProcurementProvider>
        <IntegratedTestHarness />
      </ProcurementProvider>
    );

    // Switch to Module 2 (PR)
    fireEvent.click(screen.getByText('Show Module 2'));

    // Navigate to Step 2
    const step2Tab = screen.getByRole('button', { name: /Category Selection/i });
    fireEvent.click(step2Tab);

    // Verify Standard BOQ Master Available banner is present
    const loadFromStep2Btn = screen.getByRole('button', {
      name: /Load .* Standard BOQ \(Without Qty\)/i,
    });
    expect(loadFromStep2Btn).toBeInTheDocument();

    // Click to load without quantity
    fireEvent.click(loadFromStep2Btn);

    // Verify automatically navigated to Step 3 with items loaded without quantity
    expect(
      screen.getByText(/Loaded \d+ items from .* standard catalog into BOQ schedule without quantity/i)
    ).toBeInTheDocument();

    // Verify Method 2 download template link has the 4-column format filename
    const downloadStdLink = screen.getByRole('link', { name: /Download Standard Template/i });
    expect(downloadStdLink).toHaveAttribute('download', expect.stringContaining('Standard_BOQ_Format.csv'));
  });
});
