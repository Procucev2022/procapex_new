import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import {
  CategoryStandardBOQMaster,
  AddCategoryModal,
  AddSubCategoryModal,
  AddStandardBOQItemModal,
  StandardBOQUploadModal,
} from '@/components/budget';
import { ProcurementProvider } from '@/context/ProcurementContext';
import { UI_STRINGS, formatString } from '@/constants';
import { generateUniqueItemCode } from '@/context/useBudgetManager';

describe('CategoryStandardBOQMaster & Master Catalog Governance', () => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;
  const commonStrings = UI_STRINGS.common;

  const renderWithContext = (props: { onRouteToBudget?: () => void } = {}): ReturnType<typeof render> => {
    return render(
      <ProcurementProvider>
        <CategoryStandardBOQMaster onRouteToBudget={props.onRouteToBudget} />
      </ProcurementProvider>,
    );
  };

  it('renders all master catalog component exports correctly', () => {
    expect(CategoryStandardBOQMaster).toBeDefined();
    expect(AddCategoryModal).toBeDefined();
    expect(AddSubCategoryModal).toBeDefined();
    expect(AddStandardBOQItemModal).toBeDefined();
  });

  it('renders the Master Catalog header, badges, and action buttons', () => {
    const onRouteMock = jest.fn();
    renderWithContext({ onRouteToBudget: onRouteMock });

    expect(screen.getByText(strings.title)).toBeInTheDocument();
    expect(screen.getByText(strings.badge)).toBeInTheDocument();
    expect(screen.getByText(strings.subtitle)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: strings.addCategoryButton })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.addSubCategoryButton })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.addStandardBOQItemButton })).toBeInTheDocument();

    const routeBtn = screen.getByRole('button', { name: new RegExp(strings.routeToBudgetButton, 'i') });
    expect(routeBtn).toBeInTheDocument();
    fireEvent.click(routeBtn);
    expect(onRouteMock).toHaveBeenCalledTimes(1);
  });

  it('renders all KPI summary metric cards', () => {
    renderWithContext();

    expect(screen.getByText(strings.kpiTotalCategories)).toBeInTheDocument();
    expect(screen.getByText(strings.kpiTotalSubCategories)).toBeInTheDocument();
    expect(screen.getByText(strings.kpiActiveItems)).toBeInTheDocument();
    expect(screen.getByText(strings.kpiOnHoldItems)).toBeInTheDocument();
  });

  it('renders master table with columns and standard BOQ line items', () => {
    renderWithContext();

    expect(screen.getByText(strings.tableColItemCode)).toBeInTheDocument();
    expect(screen.getByText(strings.tableColCategory)).toBeInTheDocument();
    expect(screen.getByText(strings.tableColDescription)).toBeInTheDocument();
    expect(screen.getByText(strings.tableColBenchmarkRate)).toBeInTheDocument();
    expect(screen.getByText(strings.tableColActions)).toBeInTheDocument();

    // Verify presence of sample item
    expect(screen.getByText('CON-RMC-M30')).toBeInTheDocument();
  });

  it('enforces immutability: items show immutable standard badge and have no edit action', () => {
    renderWithContext();

    const immutableBadges = screen.getAllByText(strings.badgeImmutable);
    expect(immutableBadges.length).toBeGreaterThan(0);

    // There should be no "Edit" buttons in the table
    expect(screen.queryByRole('button', { name: commonStrings.edit })).not.toBeInTheDocument();
  });

  it('filters items by search query', () => {
    renderWithContext();

    const searchInput = screen.getByPlaceholderText(strings.searchPlaceholder);

    // Search for specific code
    fireEvent.change(searchInput, { target: { value: 'MEP-CHL-200TR' } });
    expect(screen.getByText('MEP-CHL-200TR')).toBeInTheDocument();
    expect(screen.queryByText('CON-RMC-M30')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('CON-RMC-M30')).toBeInTheDocument();
  });

  it('filters items by category dropdown', () => {
    renderWithContext();

    const categorySelect = screen.getByDisplayValue(strings.allCategories);
    fireEvent.change(categorySelect, { target: { value: 'CAT-CIVIL' } });

    expect(screen.getByText('CON-RMC-M30')).toBeInTheDocument();
    expect(screen.queryByText('MEP-CHL-200TR')).not.toBeInTheDocument();
  });

  it('supports toggling item hold status between ACTIVE and ON_HOLD', () => {
    renderWithContext();

    // Find the first "Put on Hold" button
    const holdButtons = screen.getAllByRole('button', { name: strings.actionPutOnHold });
    expect(holdButtons.length).toBeGreaterThan(0);

    // Click "Put on Hold"
    fireEvent.click(holdButtons[0]);

    // Now there should be at least one "Resume Active" button and ON HOLD badge
    const resumeButtons = screen.getAllByRole('button', { name: strings.actionResumeActive });
    expect(resumeButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(strings.badgeOnHold).length).toBeGreaterThanOrEqual(1);

    // Click "Resume Active" to restore
    fireEvent.click(resumeButtons[0]);
    expect(screen.getAllByRole('button', { name: strings.actionPutOnHold }).length).toBe(holdButtons.length);
  });

  it('filters items using the Status segmented pills (All, Active, On Hold)', () => {
    renderWithContext();

    // Put first item on hold
    const holdButtons = screen.getAllByRole('button', { name: strings.actionPutOnHold });
    fireEvent.click(holdButtons[0]);

    // Click "On Hold Only" pill
    const onHoldPill = screen.getByRole('button', { name: new RegExp(strings.statusOnHold, 'i') });
    fireEvent.click(onHoldPill);

    expect(screen.getAllByText(strings.badgeOnHold).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(strings.badgeActive)).not.toBeInTheDocument();

    // Click "Active Only" pill
    const activePill = screen.getByRole('button', { name: new RegExp(strings.statusActive, 'i') });
    fireEvent.click(activePill);

    expect(screen.getAllByText(strings.badgeActive).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(strings.badgeOnHold)).not.toBeInTheDocument();
  });

  it('adds a new Category through AddCategoryModal and displays success banner', () => {
    renderWithContext();

    const addCatBtn = screen.getByRole('button', { name: strings.addCategoryButton });
    fireEvent.click(addCatBtn);

    expect(screen.getByText(strings.addCategoryModalTitle)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(strings.categoryNamePlaceholder);
    const costCenterInput = screen.getByPlaceholderText(strings.costCenterPlaceholder);
    const descInput = screen.getByPlaceholderText(strings.categoryDescPlaceholder);
    const submitBtn = screen.getByRole('button', { name: strings.submitCategoryButton });

    fireEvent.change(nameInput, { target: { value: 'Solar & Renewable Energy' } });
    fireEvent.change(costCenterInput, { target: { value: 'CC-109 (Green Energy)' } });
    fireEvent.change(descInput, { target: { value: 'Rooftop photovoltaic arrays and inverters' } });

    fireEvent.click(submitBtn);

    // Modal should close and success banner should appear
    expect(screen.queryByText(strings.addCategoryModalTitle)).not.toBeInTheDocument();
    expect(
      screen.getByText(formatString(strings.categoryCreatedSuccessTemplate, { name: 'Solar & Renewable Energy' }))
    ).toBeInTheDocument();
  });

  it('adds a new Sub-Category through AddSubCategoryModal', () => {
    renderWithContext();

    const addSubCatBtn = screen.getByRole('button', { name: strings.addSubCategoryButton });
    fireEvent.click(addSubCatBtn);

    expect(screen.getByText(strings.addSubCategoryModalTitle)).toBeInTheDocument();

    const subNameInput = screen.getByPlaceholderText(strings.subCategoryNamePlaceholder);
    const subDescInput = screen.getByPlaceholderText(strings.subCategoryDescPlaceholder);
    const submitBtn = screen.getByRole('button', { name: strings.submitSubCategoryButton });

    fireEvent.change(subNameInput, { target: { value: 'Inverter Systems' } });
    fireEvent.change(subDescInput, { target: { value: 'Three phase solar inverters' } });

    fireEvent.click(submitBtn);

    expect(screen.queryByText(strings.addSubCategoryModalTitle)).not.toBeInTheDocument();
  });

  it('adds a new Standard BOQ Item with system-generated unique code through AddStandardBOQItemModal', () => {
    renderWithContext();

    const addItemBtn = screen.getByRole('button', { name: strings.addStandardBOQItemButton });
    fireEvent.click(addItemBtn);

    expect(screen.getByText(strings.addItemModalTitle)).toBeInTheDocument();
    expect(screen.getByText(strings.generatedCodeLabel)).toBeInTheDocument();

    const descInput = screen.getByPlaceholderText(strings.itemDescPlaceholder);
    const rateInput = screen.getByPlaceholderText(strings.benchmarkRatePlaceholder);
    const qtyInput = screen.getByPlaceholderText(strings.defaultQtyPlaceholder);
    const submitBtn = screen.getByRole('button', { name: strings.submitItemButton });

    fireEvent.change(descInput, { target: { value: '500kVA Solar Grid Inverter Unit with SCADA Monitoring' } });
    fireEvent.change(rateInput, { target: { value: '1850000' } });
    fireEvent.change(qtyInput, { target: { value: '2' } });

    fireEvent.click(submitBtn);

    // Modal closes and item is added
    expect(screen.queryByText(strings.addItemModalTitle)).not.toBeInTheDocument();
    expect(screen.getAllByText(/500kVA Solar Grid Inverter Unit/i).length).toBeGreaterThan(0);
  });

  it('validates generateUniqueItemCode collision resistance', () => {
    const mockCategories = [
      {
        id: 'CAT-CIVIL',
        name: 'Civil Works',
        shortCode: 'CIVIL',
        costCenter: 'CC-101',
        description: 'Desc',
        items: [
          {
            id: '1',
            code: 'CIVIL-GEN-001',
            categoryId: 'CAT-CIVIL',
            desc: 'Item 1',
            uom: 'Nos',
            benchmarkRate: 100,
            defaultQty: 1,
            qty: 1,
            calculatedCost: 100,
            benchmarkDetails: {
              benchmarkRate: 100,
              masterRateCardRate: 100,
              historicalLowestRate: 100,
              aiConfidence: '90%',
              varianceVsRateCardPercent: 0,
            },
          },
        ],
        subtotalCost: 100,
        baselineBudget: 1000,
        committedCost: 0,
        status: 'DRAFT' as const,
      },
    ];

    const code1 = generateUniqueItemCode(mockCategories, 'CAT-CIVIL');
    expect(code1).toBe('CIVIL-GEN-002');

    // Test with sub-category and with non-existent category
    const codeFallback = generateUniqueItemCode([], 'NON_EXISTENT');
    expect(codeFallback).toBe('CAT-GEN-001');
  });

  it('tests AddCategoryModal edge cases: closed state, validation rejection, and submission exception', () => {
    const onAddCategoryMock = jest.fn();
    const onCloseMock = jest.fn();

    // Closed state
    const { rerender } = render(
      <AddCategoryModal
        isOpen={false}
        onClose={onCloseMock}
        onAddCategory={onAddCategoryMock}
      />
    );
    expect(screen.queryByText(strings.addCategoryModalTitle)).not.toBeInTheDocument();

    // Open state
    rerender(
      <AddCategoryModal
        isOpen={true}
        onClose={onCloseMock}
        onAddCategory={onAddCategoryMock}
      />
    );

    // Cancel button
    const cancelBtn = screen.getByRole('button', { name: commonStrings.cancel });
    fireEvent.click(cancelBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    // Trigger validation error by entering empty name
    const nameInput = screen.getByPlaceholderText(strings.categoryNamePlaceholder);
    const costCenterInput = screen.getByPlaceholderText(strings.costCenterPlaceholder);
    const budgetInput = screen.getByPlaceholderText(strings.baselineBudgetPlaceholder);
    const descInput = screen.getByPlaceholderText(strings.categoryDescPlaceholder);
    const submitBtn = screen.getByRole('button', { name: strings.submitCategoryButton });

    fireEvent.change(nameInput, { target: { value: ' ' } });
    fireEvent.change(costCenterInput, { target: { value: 'CC-999' } });
    fireEvent.change(budgetInput, { target: { value: '250000' } });
    fireEvent.change(descInput, { target: { value: 'Valid Description' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(onAddCategoryMock).not.toHaveBeenCalled();

    // Exception handling when onAddCategory throws non-Error and Error
    onAddCategoryMock.mockImplementationOnce(() => {
      throw 'Raw string failure';
    });
    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText('Failed to save category')).toBeInTheDocument();

    onAddCategoryMock.mockImplementationOnce(() => {
      throw new Error('Category insertion error');
    });
    fireEvent.click(submitBtn);
    expect(screen.getByText('Category insertion error')).toBeInTheDocument();

    // Successful submit
    onAddCategoryMock.mockImplementationOnce(() => {});
    fireEvent.click(submitBtn);
    expect(onAddCategoryMock).toHaveBeenCalledTimes(3);
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });

  it('tests AddSubCategoryModal edge cases: closed state, validation rejection, and submission exception', () => {
    const onAddSubCategoryMock = jest.fn();
    const onCloseMock = jest.fn();
    const mockCategories = [
      {
        id: 'CAT-TEST',
        name: 'Test Category',
        shortCode: 'TEST',
        costCenter: 'CC-TEST',
        description: 'Test Desc',
        items: [],
        subtotalCost: 0,
        baselineBudget: 0,
        committedCost: 0,
        status: 'DRAFT' as const,
      },
      {
        id: 'CAT-TEST2',
        name: 'Test Category 2',
        shortCode: 'TEST2',
        costCenter: 'CC-TEST2',
        description: 'Test Desc 2',
        items: [],
        subtotalCost: 0,
        baselineBudget: 0,
        committedCost: 0,
        status: 'DRAFT' as const,
      },
    ];

    // Closed state
    const { rerender } = render(
      <AddSubCategoryModal
        isOpen={false}
        onClose={onCloseMock}
        categories={mockCategories}
        onAddSubCategory={onAddSubCategoryMock}
      />
    );
    expect(screen.queryByText(strings.addSubCategoryModalTitle)).not.toBeInTheDocument();

    // Open state without initialCategoryId (tests fallback to categories[0].id)
    rerender(
      <AddSubCategoryModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onAddSubCategory={onAddSubCategoryMock}
      />
    );

    // Cancel button
    const cancelBtn = screen.getByRole('button', { name: commonStrings.cancel });
    fireEvent.click(cancelBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    // Change category dropdown
    const catSelect = screen.getByLabelText(new RegExp(strings.selectCategoryLabel, 'i'));
    fireEvent.change(catSelect, { target: { value: 'CAT-TEST2' } });

    // Enter description
    const descInput = screen.getByPlaceholderText(strings.subCategoryDescPlaceholder);
    fireEvent.change(descInput, { target: { value: 'Subcategory Description Notes' } });

    // Validation failure with empty name
    const nameInput = screen.getByPlaceholderText(strings.subCategoryNamePlaceholder);
    const submitBtn = screen.getByRole('button', { name: strings.submitSubCategoryButton });

    fireEvent.change(nameInput, { target: { value: ' ' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(onAddSubCategoryMock).not.toHaveBeenCalled();

    // Exception handling when onAddSubCategory throws non-Error and Error
    onAddSubCategoryMock.mockImplementationOnce(() => {
      throw 'Raw string error in subcategory';
    });
    fireEvent.change(nameInput, { target: { value: 'Valid Sub Name' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText('Failed to save subcategory')).toBeInTheDocument();

    onAddSubCategoryMock.mockImplementationOnce(() => {
      throw new Error('Subcat unique violation');
    });
    fireEvent.click(submitBtn);
    expect(screen.getByText('Subcat unique violation')).toBeInTheDocument();

    // Successful submit
    onAddSubCategoryMock.mockImplementationOnce(() => {});
    fireEvent.click(submitBtn);
    expect(onAddSubCategoryMock).toHaveBeenCalledTimes(3);
    expect(onCloseMock).toHaveBeenCalledTimes(2);

    // Test with initialCategoryId prop provided
    rerender(
      <AddSubCategoryModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        initialCategoryId="CAT-TEST2"
        onAddSubCategory={onAddSubCategoryMock}
      />
    );

    // Test categoryId fallback effect when initial categories was empty
    const { rerender: rerenderSubFallback } = render(
      <AddSubCategoryModal
        isOpen={true}
        onClose={onCloseMock}
        categories={[]}
        onAddSubCategory={onAddSubCategoryMock}
      />
    );
    rerenderSubFallback(
      <AddSubCategoryModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onAddSubCategory={onAddSubCategoryMock}
      />
    );
  });

  it('tests AddStandardBOQItemModal edge cases: closed state, category/subcategory selection, and errors', () => {
    const onAddItemMock = jest.fn();
    const onCloseMock = jest.fn();
    const mockCategories = [
      {
        id: 'CAT-A',
        name: 'Category A',
        shortCode: 'CATA',
        costCenter: 'CC-A',
        description: 'Desc A',
        subCategories: [
          { id: 'SUB-A1', categoryId: 'CAT-A', name: 'Sub A1', shortCode: 'SUBA1' },
        ],
        items: [],
        subtotalCost: 0,
        baselineBudget: 0,
        committedCost: 0,
        status: 'DRAFT' as const,
      },
      {
        id: 'CAT-B',
        name: 'Category B',
        shortCode: 'CATB',
        costCenter: 'CC-B',
        description: 'Desc B',
        items: [],
        subtotalCost: 0,
        baselineBudget: 0,
        committedCost: 0,
        status: 'DRAFT' as const,
      },
    ];

    // Closed state
    const { rerender } = render(
      <AddStandardBOQItemModal
        isOpen={false}
        onClose={onCloseMock}
        categories={mockCategories}
        onAddItem={onAddItemMock}
      />
    );
    expect(screen.queryByText(strings.addItemModalTitle)).not.toBeInTheDocument();

    // Open state without initialCategoryId (tests default selection)
    rerender(
      <AddStandardBOQItemModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onAddItem={onAddItemMock}
      />
    );

    // Cancel button
    const cancelBtn = screen.getByRole('button', { name: commonStrings.cancel });
    fireEvent.click(cancelBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    // Select subcategory
    const subCatSelect = screen.getByLabelText(new RegExp(strings.tableColSubCategory, 'i'));
    fireEvent.change(subCatSelect, { target: { value: 'SUB-A1' } });
    expect(screen.getByText('CATA-SUBA1-001')).toBeInTheDocument();

    // Change category to CAT-B (which has no subcategories)
    const catSelect = screen.getByLabelText(new RegExp(`${strings.tableColCategory} \\*`, 'i'));
    fireEvent.change(catSelect, { target: { value: 'CAT-B' } });
    expect(screen.getByText('CATB-GEN-001')).toBeInTheDocument();

    // UOM and Notes inputs
    const uomSelect = screen.getByLabelText(/Unit of Measure/i);
    fireEvent.change(uomSelect, { target: { value: 'Nos' } });
    const notesInput = screen.getByPlaceholderText(strings.notesPlaceholder);
    fireEvent.change(notesInput, { target: { value: 'Custom fabrication notes' } });

    // Validation rejection with too short description
    const descInput = screen.getByPlaceholderText(strings.itemDescPlaceholder);
    const rateInput = screen.getByPlaceholderText(strings.benchmarkRatePlaceholder);
    const qtyInput = screen.getByPlaceholderText(strings.defaultQtyPlaceholder);
    const submitBtn = screen.getByRole('button', { name: strings.submitItemButton });

    fireEvent.change(descInput, { target: { value: 'A' } }); // length 1 < minLength 3
    fireEvent.change(rateInput, { target: { value: '500' } });
    fireEvent.change(qtyInput, { target: { value: '5' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();

    // Change to valid description
    fireEvent.change(descInput, { target: { value: 'Valid Item Technical Specification' } });

    // Exception handling when onAddItem throws non-Error and Error
    onAddItemMock.mockImplementationOnce(() => {
      throw 'Raw BOQ item failure';
    });
    fireEvent.click(submitBtn);
    expect(screen.getByText('Failed to save standard BOQ item')).toBeInTheDocument();

    onAddItemMock.mockImplementationOnce(() => {
      throw new Error('Duplicate item constraint');
    });
    fireEvent.click(submitBtn);
    expect(screen.getByText('Duplicate item constraint')).toBeInTheDocument();

    // Successful submit
    onAddItemMock.mockImplementationOnce(() => {});
    fireEvent.click(submitBtn);
    expect(onAddItemMock).toHaveBeenCalledTimes(3);
    expect(onCloseMock).toHaveBeenCalledTimes(2);

    // Test with initialCategoryId prop provided
    rerender(
      <AddStandardBOQItemModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        initialCategoryId="CAT-B"
        onAddItem={onAddItemMock}
      />
    );

    // Test categoryId fallback effect when initial categories was empty
    const { rerender: rerenderFallback } = render(
      <AddStandardBOQItemModal
        isOpen={true}
        onClose={onCloseMock}
        categories={[]}
        onAddItem={onAddItemMock}
      />
    );
    rerenderFallback(
      <AddStandardBOQItemModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onAddItem={onAddItemMock}
      />
    );
  });

  it('tests CategoryBOQTable filtering out items on hold', () => {
    const { CategoryBOQTable } = require('@/components/budget');
    const mockCategory = {
      id: 'CAT-ONHOLD-TEST',
      name: 'On-Hold Test Category',
      shortCode: 'TEST',
      costCenter: 'CC-TEST',
      description: 'Test Desc',
      items: [
        {
          id: 'ITM-1',
          code: 'ACTIVE-ITEM',
          categoryId: 'CAT-ONHOLD-TEST',
          desc: 'Active line item',
          uom: 'Nos',
          benchmarkRate: 100,
          defaultQty: 5,
          qty: 5,
          calculatedCost: 500,
          status: 'ACTIVE' as const,
          benchmarkDetails: {
            benchmarkRate: 100,
            masterRateCardRate: 100,
            historicalLowestRate: 100,
            aiConfidence: '99%',
            varianceVsRateCardPercent: 0,
          },
        },
        {
          id: 'ITM-2',
          code: 'HOLD-ITEM',
          categoryId: 'CAT-ONHOLD-TEST',
          desc: 'On-hold line item',
          uom: 'Nos',
          benchmarkRate: 200,
          defaultQty: 10,
          qty: 10,
          calculatedCost: 2000,
          status: 'ON_HOLD' as const,
          benchmarkDetails: {
            benchmarkRate: 200,
            masterRateCardRate: 200,
            historicalLowestRate: 200,
            aiConfidence: '99%',
            varianceVsRateCardPercent: 0,
          },
        },
      ],
      subtotalCost: 500,
      baselineBudget: 1000,
      committedCost: 0,
      status: 'DRAFT' as const,
    };

    render(
      <CategoryBOQTable
        category={mockCategory}
        onUpdateQuantity={jest.fn()}
        onResetCategoryQuantities={jest.fn()}
        onDownloadCategoryBOQ={jest.fn()}
      />
    );

    // Active item is shown, on-hold item is excluded
    expect(screen.getByText('ACTIVE-ITEM')).toBeInTheDocument();
    expect(screen.queryByText('HOLD-ITEM')).not.toBeInTheDocument();
  });

  describe('Standard BOQ CSV Upload Integration', () => {
    it('opens and closes StandardBOQUploadModal from the upload button', () => {
      renderWithContext();

      const uploadBtn = screen.getByRole('button', { name: strings.uploadButton });
      expect(uploadBtn).toBeInTheDocument();

      fireEvent.click(uploadBtn);
      expect(screen.getByText(strings.uploadModalTitle)).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByRole('button', { name: commonStrings.cancel });
      fireEvent.click(closeBtn);
      expect(screen.queryByText(strings.uploadModalTitle)).not.toBeInTheDocument();
    });

    it('allows switching from AddStandardBOQItemModal to StandardBOQUploadModal', () => {
      renderWithContext();

      // Open Add Standard BOQ Item modal
      const addBOQBtn = screen.getByRole('button', { name: strings.addStandardBOQItemButton });
      fireEvent.click(addBOQBtn);
      expect(screen.getByText(strings.addItemModalTitle)).toBeInTheDocument();

      // Click "Switch to Bulk CSV Upload" button
      const switchToUploadBtn = screen.getByRole('button', { name: strings.switchToUploadButton });
      fireEvent.click(switchToUploadBtn);

      // Single item modal should be closed, upload modal should be open
      expect(screen.queryByText(strings.addItemModalTitle)).not.toBeInTheDocument();
      expect(screen.getByText(strings.uploadModalTitle)).toBeInTheDocument();
    });

    it('performs batch upload through the upload modal and renders newly imported items', () => {
      renderWithContext();

      const uploadBtn = screen.getByRole('button', { name: strings.uploadButton });
      fireEvent.click(uploadBtn);

      // Switch to Manual Paste tab
      const pasteTabBtn = screen.getByRole('button', { name: strings.orPasteText });
      fireEvent.click(pasteTabBtn);

      // Paste CSV content
      const csvContent =
        'category,subcategory,description,uom,benchmark_rate,default_qty,notes\n' +
        'CAT-CIVIL,,Heavy Duty Excavation Batch,Cum,450,150,Imported via test';
      const textarea = screen.getByPlaceholderText(strings.pastePlaceholder);
      fireEvent.change(textarea, { target: { value: csvContent } });

      // Confirm import
      const confirmBtn = screen.getByRole('button', {
        name: formatString(strings.confirmImportButtonTemplate, { count: 1 }),
      });
      fireEvent.click(confirmBtn);

      // Modal closes and newly created item is in the table
      expect(screen.queryByText(strings.uploadModalTitle)).not.toBeInTheDocument();
      expect(screen.getByText('Heavy Duty Excavation Batch')).toBeInTheDocument();
    });
  });

  describe('View Mode Switching & Hierarchy Category Cards', () => {
    it('switches between items view and categories & hierarchy view', () => {
      renderWithContext();

      // Initially in items view
      expect(screen.getByText(strings.viewModeBOQItems)).toBeInTheDocument();
      expect(screen.getByText(strings.tableColItemCode)).toBeInTheDocument();

      // Switch to hierarchy view
      const hierarchyTab = screen.getByRole('button', { name: new RegExp(strings.viewModeCategories, 'i') });
      fireEvent.click(hierarchyTab);

      // Table should not be visible, category cards should be visible
      expect(screen.queryByText(strings.tableColItemCode)).not.toBeInTheDocument();
      expect(screen.getByText('Civil & Structural Works')).toBeInTheDocument();
      expect(screen.getByText('Interior & Fitouts (Millwork & Joinery)')).toBeInTheDocument();

      // Switch back to items view
      const itemsTab = screen.getByRole('button', { name: new RegExp(strings.viewModeBOQItems, 'i') });
      fireEvent.click(itemsTab);
      expect(screen.getByText(strings.tableColItemCode)).toBeInTheDocument();
    });

    it('interacts with CategoryCard action buttons in hierarchy view', () => {
      renderWithContext();

      // Switch to hierarchy view
      const hierarchyTab = screen.getByRole('button', { name: new RegExp(strings.viewModeCategories, 'i') });
      fireEvent.click(hierarchyTab);

      // Verify subcategories list title is rendered on cards
      expect(screen.getAllByText(new RegExp(strings.subCategoriesListTitle, 'i')).length).toBeGreaterThan(0);

      // Click Add Sub-Category on first category card
      const addSubCatButtons = screen.getAllByRole('button', { name: new RegExp(strings.addSubCategoryButton, 'i') });
      fireEvent.click(addSubCatButtons[0]);
      expect(screen.getByText(strings.addSubCategoryModalTitle)).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByRole('button', { name: commonStrings.cancel }));
      expect(screen.queryByText(strings.addSubCategoryModalTitle)).not.toBeInTheDocument();

      // Click Add Standard BOQ Item on first category card
      const addItemButtons = screen.getAllByRole('button', { name: new RegExp(strings.addStandardBOQItemButton, 'i') });
      fireEvent.click(addItemButtons[0]);
      expect(screen.getByText(strings.addItemModalTitle)).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByRole('button', { name: commonStrings.cancel }));
      expect(screen.queryByText(strings.addItemModalTitle)).not.toBeInTheDocument();

      // Click View Items on first category card
      const viewItemsButtons = screen.getAllByRole('button', { name: /Showing \d+ standard line item/i });
      fireEvent.click(viewItemsButtons[0]);

      // Should automatically switch back to items view with category filtered
      expect(screen.getByText(strings.tableColItemCode)).toBeInTheDocument();
    });
  });

  describe('Category Empty State & Success Banner Dismissal', () => {
    it('renders informative empty state card when filtering by a category with 0 items', () => {
      renderWithContext();

      // Create a new category with 0 items
      const addCatBtn = screen.getByRole('button', { name: strings.addCategoryButton });
      fireEvent.click(addCatBtn);

      const nameInput = screen.getByPlaceholderText(strings.categoryNamePlaceholder);
      const submitBtn = screen.getByRole('button', { name: strings.submitCategoryButton });

      fireEvent.change(nameInput, { target: { value: 'Landscaping' } });
      fireEvent.click(submitBtn);

      // Banner is shown
      expect(
        screen.getByText(formatString(strings.categoryCreatedSuccessTemplate, { name: 'Landscaping' }))
      ).toBeInTheDocument();

      // New category card is displayed in hierarchy view
      expect(screen.getByText('Landscaping')).toBeInTheDocument();

      // Switch to items view to test table filtering for this empty category
      const itemsTabBtn = screen.getByRole('button', { name: new RegExp(strings.viewModeBOQItems) });
      fireEvent.click(itemsTabBtn);

      // Filter by the new category in items view
      const catSelect = screen.getByDisplayValue(strings.allCategories);
      fireEvent.change(catSelect, { target: { value: 'CAT-LANDSC' } });

      // Empty state card should be visible with title, subtitle, and add first item button
      const expectedTitle = formatString(strings.emptyCategoryBOQTitle, { category: 'Landscaping' });
      expect(screen.getByText(expectedTitle)).toBeInTheDocument();
      expect(screen.getByText(strings.emptyCategoryBOQSubtitle)).toBeInTheDocument();

      // Clicking addFirstItemButton opens AddStandardBOQItemModal
      const addFirstBtn = screen.getByRole('button', { name: strings.addFirstItemButton });
      fireEvent.click(addFirstBtn);
      expect(screen.getByText(strings.addItemModalTitle)).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByRole('button', { name: commonStrings.cancel }));
      expect(screen.queryByText(strings.addItemModalTitle)).not.toBeInTheDocument();
    });

    it('allows dismissing the category created success banner', () => {
      renderWithContext();

      // Create category
      const addCatBtn = screen.getByRole('button', { name: strings.addCategoryButton });
      fireEvent.click(addCatBtn);

      const nameInput = screen.getByPlaceholderText(strings.categoryNamePlaceholder);
      const submitBtn = screen.getByRole('button', { name: strings.submitCategoryButton });

      fireEvent.change(nameInput, { target: { value: 'Acoustics & AV' } });
      fireEvent.click(submitBtn);

      const bannerText = formatString(strings.categoryCreatedSuccessTemplate, { name: 'Acoustics & AV' });
      expect(screen.getByText(bannerText)).toBeInTheDocument();

      // Find the banner's close button and click it
      const closeBtn = screen.getByLabelText('Dismiss notification');
      fireEvent.click(closeBtn);

      expect(screen.queryByText(bannerText)).not.toBeInTheDocument();
    });
  });
});


