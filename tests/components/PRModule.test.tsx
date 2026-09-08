import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PRModule } from '@/components/PRModule';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('PRModule Component', () => {
  const mockCreatePR = jest.fn();
  const mockOnSelectPRForBOQ = jest.fn();
  const mockOnNavigateToBOQ = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      prs: [{ id: 'PR-2026-0005', title: 'Reception Counter' }],
      createPR: mockCreatePR,
    });
    window.alert = jest.fn();
  });

  it('renders Step 1 (General Details) and updates all general fields', () => {
    const { container } = render(<PRModule onSelectPRForBOQ={mockOnSelectPRForBOQ} />);

    expect(screen.getByText(UI_STRINGS.prModule.roleBadge)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.prModule.title)).toBeInTheDocument();
    expect(screen.getByText(/Step 1\/7/i)).toBeInTheDocument();

    const descInput = screen.getByDisplayValue(/Fabrication & Installation of Reception Counter/i);
    fireEvent.change(descInput, { target: { value: 'Updated Scope' } });
    expect(screen.getByDisplayValue('Updated Scope')).toBeInTheDocument();

    const deptInput = screen.getByDisplayValue(/Architecture & Interior Finishing/i);
    fireEvent.change(deptInput, { target: { value: 'Civil Finishing' } });

    const prioritySelect = screen.getByDisplayValue('High Priority');
    fireEvent.change(prioritySelect, { target: { value: 'Urgent' } });

    const costCentreSelect = screen.getByDisplayValue(/CC-104/i);
    fireEvent.change(costCentreSelect, { target: { value: 'CC-101' } });

    const dateInput = screen.getByDisplayValue('2026-09-25');
    fireEvent.change(dateInput, { target: { value: '2026-10-01' } });

    const sqftInput = screen.getByDisplayValue('4,500');
    fireEvent.change(sqftInput, { target: { value: '5,000' } });

    const serviceRadio = container.querySelector('input[value="Service"]') as HTMLInputElement;
    if (serviceRadio) {
      fireEvent.click(serviceRadio);
    }

    // Direct click Tab 1 to cover tab 1 button onClick
    const tab1Btn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepGeneral, 'i') });
    fireEvent.click(tab1Btn);
    expect(screen.getByText(/Step 1\/7/i)).toBeInTheDocument();
  });

  it('interacts with Step 2 (Category Selection)', () => {
    const { container } = render(<PRModule />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepCategory, 'i') }));
    expect(screen.getByText(/Step 2\/7/i)).toBeInTheDocument();

    const majorCategorySelect = container.querySelector('select') as HTMLSelectElement;
    if (majorCategorySelect) {
      fireEvent.change(majorCategorySelect, { target: { value: 'Civil & Structural' } });
    }

    const textInputs = container.querySelectorAll('input[type="text"]');
    if (textInputs.length > 0) {
      fireEvent.change(textInputs[0], { target: { value: 'Custom Sub-Category' } });
    }
    if (textInputs.length > 1) {
      fireEvent.change(textInputs[1], { target: { value: 'PKG-CUSTOM-001' } });
    }

    // Step 2 Next button
    const nextBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.nextStep, 'i') });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Step 3\/7/i)).toBeInTheDocument();
  });

  it('interacts with Step 3 (BOQ Studio) and all 4 ingestion methods', () => {
    const { container } = render(<PRModule />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepBOQ.replace(/[()]/g, '\\$&'), 'i') }));
    expect(screen.getByText(/Step 3\/7/i)).toBeInTheDocument();

    // Switch to Method 1
    fireEvent.click(screen.getByText('1. Upload New BOQ'));
    const downloadCsvBtn = screen.getByRole('link', { name: /Download Blank BOQ Format/i });
    fireEvent.click(downloadCsvBtn);

    const uploadSpreadsheetBtn = screen.getByRole('button', { name: /Upload & Parse BOQ File/i });
    fireEvent.click(uploadSpreadsheetBtn);

    const method1MoveBtn = screen.getByRole('button', { name: /Confirm & Move to Step 4: Supplier Selection →/i });
    fireEvent.click(method1MoveBtn);
    expect(screen.getByText(/Step 4\/7/i)).toBeInTheDocument();

    // Back to Step 3, test Method 2
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepBOQ.replace(/[()]/g, '\\$&'), 'i') }));
    fireEvent.click(screen.getByText('2. Standard Template'));
    const downloadStdBtn = screen.getByRole('link', { name: /Download Standard Template/i });
    fireEvent.click(downloadStdBtn);

    const uploadStdBtn = screen.getByRole('button', { name: /Upload Filled Template/i });
    fireEvent.click(uploadStdBtn);

    const method2MoveBtn = screen.getByRole('button', { name: /Confirm & Move to Step 4: Supplier Selection →/i });
    fireEvent.click(method2MoveBtn);
    expect(screen.getByText(/Step 4\/7/i)).toBeInTheDocument();

    // Back to Step 3, test Method 4
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepBOQ.replace(/[()]/g, '\\$&'), 'i') }));
    fireEvent.click(screen.getByText('4. Manual / Catalog'));
    const addFromCatalogBtn = screen.getByRole('button', { name: /Add from Catalog/i });
    fireEvent.click(addFromCatalogBtn);

    const method4MoveBtn = screen.getByRole('button', { name: /Confirm & Move to Step 4: Supplier Selection →/i });
    fireEvent.click(method4MoveBtn);
    expect(screen.getByText(/Step 4\/7/i)).toBeInTheDocument();

    // Back to Step 3, test Method 3
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepBOQ.replace(/[()]/g, '\\$&'), 'i') }));
    fireEvent.click(screen.getByText('3. Drawing AI Extractor'));
    const drawingInput = screen.getByDisplayValue('Counter Elevation D');
    fireEvent.change(drawingInput, { target: { value: 'Elevation Front View' } });

    const extractBtn = screen.getByRole('button', { name: /Extract Specs & Quantities/i });
    fireEvent.click(extractBtn);

    const method3MoveBtn = screen.getByRole('button', { name: /Confirm & Move to Step 4: Supplier Selection →/i });
    fireEvent.click(method3MoveBtn);
    expect(screen.getByText(/Step 4\/7/i)).toBeInTheDocument();

    // Back to Step 3, test Down Screen Schedule actions
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepBOQ.replace(/[()]/g, '\\$&'), 'i') }));
    const addCustomBtn = screen.getByRole('button', { name: /\+ Add Custom Item/i });
    fireEvent.click(addCustomBtn);
    expect(screen.getByText('Custom Site Requisition Line Item')).toBeInTheDocument();

    // Edit Quantity
    const qtyInputs = screen.getAllByRole('spinbutton');
    if (qtyInputs.length > 0) {
      fireEvent.change(qtyInputs[0], { target: { value: '99' } });
      fireEvent.change(qtyInputs[0], { target: { value: '' } });
    }

    // Delete Line
    const deleteButtons = container.querySelectorAll('button.text-rose-500');
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    }

    // Move to Step 4 via bottom down-screen button
    const bottomConfirmBtn = screen.getByRole('button', { name: /Confirm BOQ & Proceed to Step 4/i });
    fireEvent.click(bottomConfirmBtn);
    expect(screen.getByText(/Step 4\/7/i)).toBeInTheDocument();
  });

  it('interacts with Step 4 (Supplier Selection), filters, chips, dropdown, and validation', () => {
    const { container } = render(<PRModule />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepSuppliers, 'i') }));
    expect(screen.getByText(/Step 4\/7/i)).toBeInTheDocument();

    // Test Region filters
    const selects = container.querySelectorAll('select');
    const regionSelect = selects[0];
    fireEvent.change(regionSelect, { target: { value: 'NORTH' } });
    fireEvent.change(regionSelect, { target: { value: 'SOUTH' } });
    fireEvent.change(regionSelect, { target: { value: 'ALL' } });

    // Test Type filters
    const typeSelect = selects[1];
    fireEvent.change(typeSelect, { target: { value: 'RATE_CARD' } });
    fireEvent.change(typeSelect, { target: { value: 'NON_RATE_CARD' } });
    fireEvent.change(typeSelect, { target: { value: 'ALL' } });

    // Open dropdown
    const dropdownTrigger = container.querySelector('.border-2.border-sky-400') as HTMLElement;
    fireEvent.click(dropdownTrigger);

    // Quick select buttons
    const selectAllBtn = screen.getByRole('button', { name: /\+ Select All/i });
    fireEvent.click(selectAllBtn);

    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtn);

    const rateCardBtn = screen.getByRole('button', { name: /\+ All Rate Card/i });
    fireEvent.click(rateCardBtn);

    // Toggle individual supplier checkbox in dropdown (both uncheck and check)
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 1) {
      fireEvent.click(checkboxes[0]); // toggle
      fireEvent.click(checkboxes[1]); // toggle another
    }

    // Done / Apply button
    const doneBtn = screen.getByRole('button', { name: /Done \/ Apply Selection/i });
    fireEvent.click(doneBtn);

    // Remove supplier chip
    const removeChipBtns = container.querySelectorAll('button[title="Remove"]');
    if (removeChipBtns.length > 0) {
      fireEvent.click(removeChipBtns[0]);
    }

    // Clear suppliers to trigger validation alerts
    fireEvent.click(dropdownTrigger);
    const clearBtnInside = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtnInside);
    const doneBtnInside = screen.getByRole('button', { name: /Done \/ Apply Selection/i });
    fireEvent.click(doneBtnInside);

    // Test header button validation
    const headerProceedBtn = screen.getByRole('button', { name: /Confirm Suppliers & Move to Step 5/i });
    fireEvent.click(headerProceedBtn);
    expect(window.alert).toHaveBeenCalledWith('Please select at least one vendor to proceed.');

    // Test bottom button validation
    const bottomProceedBtn = screen.getByRole('button', { name: /Confirm Suppliers & Proceed to Step 5/i });
    fireEvent.click(bottomProceedBtn);
    expect(window.alert).toHaveBeenCalledWith('Please select at least one vendor to proceed.');

    // Re-select suppliers and proceed
    fireEvent.click(dropdownTrigger);
    fireEvent.click(screen.getByRole('button', { name: /\+ Select All/i }));
    fireEvent.click(screen.getByRole('button', { name: /Done \/ Apply Selection/i }));
    fireEvent.click(headerProceedBtn);

    expect(screen.getByText(/Step 5\/7/i)).toBeInTheDocument();
  });

  it('interacts with Step 5 (Delivery Locations)', () => {
    render(<PRModule />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepDelivery, 'i') }));
    expect(screen.getByText(/Step 5\/7/i)).toBeInTheDocument();

    const addrInput = screen.getByDisplayValue(/Metro Line 4 Underground Station Yard/i);
    fireEvent.change(addrInput, { target: { value: 'Site Yard East Gate' } });

    const contactInput = screen.getByDisplayValue(/Rahul Verma/i);
    fireEvent.change(contactInput, { target: { value: 'Anand Kumar' } });

    const stagingInput = screen.getByDisplayValue(/Phase 1: Internal Carcass/i);
    fireEvent.change(stagingInput, { target: { value: 'Single lot staging' } });

    const unloadingInput = screen.getByDisplayValue(/Covered waterproof storage required/i);
    fireEvent.change(unloadingInput, { target: { value: 'Heavy crane needed' } });

    const confirmDeliveryBtn = screen.getByRole('button', { name: /Confirm Delivery & Proceed to Step 6/i });
    fireEvent.click(confirmDeliveryBtn);
    expect(screen.getByText(/Step 6\/7/i)).toBeInTheDocument();
  });

  it('interacts with Step 6 (Terms & Conditions) presets and custom structures', () => {
    const { container } = render(<PRModule />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepTerms, 'i') }));
    expect(screen.getByText(/Step 6\/7/i)).toBeInTheDocument();

    // Presets
    const directSupplyPreset = screen.getByRole('button', { name: /Supply \/ 30-Day Credit/i });
    fireEvent.click(directSupplyPreset);

    const progressiveRaPreset = screen.getByRole('button', { name: /Monthly RA Bills/i });
    fireEvent.click(progressiveRaPreset);

    const standardCapexPreset = screen.getByRole('button', { name: /Milestone \/ CAPEX/i });
    fireEvent.click(standardCapexPreset);

    // Payment structures
    const selects = container.querySelectorAll('select');
    const paymentStructureSelect = selects[0];

    fireEvent.change(paymentStructureSelect, { target: { value: 'CREDIT_30_DAYS' } });
    fireEvent.change(paymentStructureSelect, { target: { value: 'CREDIT_45_DAYS' } });
    fireEvent.change(paymentStructureSelect, { target: { value: 'PROGRESSIVE_RA' } });
    fireEvent.change(paymentStructureSelect, { target: { value: 'MILESTONE_10_70_10_10' } });
    fireEvent.change(paymentStructureSelect, { target: { value: 'CUSTOM' } });

    // Change other inputs
    const [advanceInput, retentionInput] = screen.getAllByDisplayValue('10%');
    fireEvent.change(advanceInput, { target: { value: '15%' } });
    fireEvent.change(retentionInput, { target: { value: '5%' } });

    const creditDaysInput = screen.getByDisplayValue('30 Calendar Days');
    fireEvent.change(creditDaysInput, { target: { value: '60 Calendar Days' } });

    const abgSelect = selects[1];
    fireEvent.change(abgSelect, { target: { value: 'NO' } });

    const taxInput = screen.getByDisplayValue(/GST 18% Extra/i);
    fireEvent.change(taxInput, { target: { value: 'GST 12% extra' } });

    const leadTimeInput = screen.getByDisplayValue('12 - 15 Calendar Days');
    fireEvent.change(leadTimeInput, { target: { value: '20 Calendar Days' } });

    const completionInput = screen.getByDisplayValue(/2026-09-25/i);
    fireEvent.change(completionInput, { target: { value: '2026-10-30' } });

    const phasedTextarea = screen.getByDisplayValue(/Phase 1 \(Day 10\)/i);
    fireEvent.change(phasedTextarea, { target: { value: 'Phased 3 lots' } });

    const ldClauseInput = screen.getByDisplayValue(/0.5% of total order value/i);
    fireEvent.change(ldClauseInput, { target: { value: '1% per week max 10%' } });

    const dlpSelect = selects[2];
    fireEvent.change(dlpSelect, { target: { value: '24_MONTHS' } });

    const warrantyInput = screen.getByDisplayValue(/5 Years for Core Marine/i);
    fireEvent.change(warrantyInput, { target: { value: '3 Years Warranty' } });

    const incoSelect = selects[3];
    fireEvent.change(incoSelect, { target: { value: 'EX_WORKS' } });

    const firmnessInput = screen.getByDisplayValue(/Firm & Fixed \(No escalation/i);
    fireEvent.change(firmnessInput, { target: { value: 'Variable Rates' } });

    const specialConditionsInput = screen.getByDisplayValue(/Mockup sample of granite/i);
    fireEvent.change(specialConditionsInput, { target: { value: 'Special sample requirements' } });

    const confirmTermsBtn = screen.getByRole('button', { name: /Confirm Terms & Conditions & Proceed to Step 7/i });
    fireEvent.click(confirmTermsBtn);
    expect(screen.getByText(/Step 7\/7/i)).toBeInTheDocument();
  });

  it('interacts with Step 7 (Documents), handles upload, delete, submission and navigation callbacks', () => {
    const { container } = render(
      <PRModule 
        onSelectPRForBOQ={mockOnSelectPRForBOQ} 
        onNavigateToBOQ={mockOnNavigateToBOQ} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepDocuments, 'i') }));
    expect(screen.getByText(/Step 7\/7/i)).toBeInTheDocument();

    const chooseDocsBtn = screen.getByRole('button', { name: /\+ Choose Document Files/i });
    fireEvent.click(chooseDocsBtn);

    const fileInput = container.querySelector('#nextPrFileInput') as HTMLInputElement;
    if (fileInput) {
      const file = new File(['sample specs'], 'structural_drawing.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(screen.getByText('structural_drawing.pdf')).toBeInTheDocument();

      fireEvent.change(fileInput, { target: { files: [] } });
    }

    const deleteButtons = container.querySelectorAll('button.text-rose-500');
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
    }

    const submitBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.submitToProjectHead, 'i') });
    fireEvent.click(submitBtn);

    expect(mockCreatePR).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        projectName: 'Metro Line 4 Underground',
        category: 'Interior & Fitouts',
      })
    );
    expect(mockOnSelectPRForBOQ).toHaveBeenCalledWith('PR-2026-0005');
  });

  it('handles submission with only onNavigateToBOQ provided', () => {
    render(<PRModule onNavigateToBOQ={mockOnNavigateToBOQ} />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepDocuments, 'i') }));
    const submitBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.submitToProjectHead, 'i') });
    fireEvent.click(submitBtn);

    expect(mockCreatePR).toHaveBeenCalled();
    expect(mockOnNavigateToBOQ).toHaveBeenCalledWith('PR-2026-0005');
  });

  it('handles navigation via Previous, Next, and Cancel buttons', () => {
    render(<PRModule />);

    expect(screen.getByText(/Step 1\/7/i)).toBeInTheDocument();

    // Next
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.nextStep, 'i') }));
    expect(screen.getByText(/Step 2\/7/i)).toBeInTheDocument();

    // Previous
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.prevStep, 'i') }));
    expect(screen.getByText(/Step 1\/7/i)).toBeInTheDocument();

    // Cancel PR resets to Step 1
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.nextStep, 'i') }));
    expect(screen.getByText(/Step 2\/7/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.cancelPR, 'i') }));
    expect(screen.getByText(/Step 1\/7/i)).toBeInTheDocument();
  });

  it('closes vendor dropdown when clicking outside', () => {
    const { container } = render(<PRModule />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepSuppliers, 'i') }));

    const dropdownTrigger = container.querySelector('.border-2.border-sky-400') as HTMLElement;
    if (dropdownTrigger) {
      fireEvent.click(dropdownTrigger);
      expect(screen.getByText(/Multi-Select Enabled/i)).toBeInTheDocument();

      const backdrop = container.querySelector('.fixed.inset-0.z-30') as HTMLElement;
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(screen.queryByText(/Multi-Select Enabled/i)).not.toBeInTheDocument();
      }
    }
  });
});
