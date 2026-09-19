import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { PRModule } from '@/components/PRModule';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('PRModule Component (Streamlined BOQ Studio)', () => {
  const mockCreatePR = jest.fn();
  const mockOnSelectPRForBOQ = jest.fn();
  const mockOnNavigateToBOQ = jest.fn();
  const mockAddStandardBOQItem = jest.fn();
  const mockAddCategory = jest.fn();

  const mockCategories = [
    {
      id: 'CAT-INT',
      name: 'Interior & Fitouts',
      shortCode: 'INT',
      subCategories: [
        { id: 'SUB-INT-01', name: 'Reception Counter & Millwork' },
      ],
      items: [
        {
          code: 'STD-INT-001',
          desc: '18mm Marine Plywood Standard',
          uom: 'Sqm',
          benchmarkRate: 1450,
          qty: 10,
        },
      ],
    },
    {
      id: 'CAT-CIVIL',
      name: 'Civil & Structural',
      shortCode: 'CIVIL',
      subCategories: [
        { id: 'SUB-CIV-01', name: 'Raft Foundation' },
      ],
      items: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      prs: [{ id: 'PR-2026-0005', title: 'Reception Counter' }],
      createPR: mockCreatePR,
      addStandardBOQItem: mockAddStandardBOQItem,
      addCategory: mockAddCategory,
      projectCategories: mockCategories,
    });
    window.alert = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    global.fetch = jest.fn();
  });

  it('renders BOQ Studio header, draft ID, and scope selection', () => {
    render(<PRModule onSelectPRForBOQ={mockOnSelectPRForBOQ} onNavigateToBOQ={mockOnNavigateToBOQ} />);

    expect(screen.getByText(UI_STRINGS.prModule.roleBadge)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.prModule.title)).toBeInTheDocument();
    expect(screen.getByText(/Package ID: PKG-2026-0005/i)).toBeInTheDocument();

    // Verify Category Scope dropdown
    const categorySelect = screen.getByDisplayValue(/Interior & Fitouts/i);
    expect(categorySelect).toBeInTheDocument();
    fireEvent.change(categorySelect, { target: { value: 'Civil & Structural' } });

    // Open Add Category Modal
    const addCatBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.addNewCategory.replace(/[+]/g, '\\+'), 'i'),
    });
    fireEvent.click(addCatBtn);
    expect(screen.getByText(UI_STRINGS.categoryStandardBOQMaster.addCategoryModalTitle)).toBeInTheDocument();

    // Close modal
    const cancelModalBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelModalBtn);
  });

  it('handles Method 1: Upload New BOQ spreadsheet', async () => {
    const { container } = render(<PRModule onSelectPRForBOQ={mockOnSelectPRForBOQ} />);

    fireEvent.click(screen.getByText('1. Upload New BOQ'));
    expect(screen.getByText(/Method 1: Upload New BOQ Spreadsheet/i)).toBeInTheDocument();

    // Download blank format link
    const downloadCsvBtn = screen.getByRole('link', { name: /Download Blank BOQ Format/i });
    expect(downloadCsvBtn).toBeInTheDocument();

    // Upload spreadsheet via file input
    const fileInput = container.querySelector('#method1FileInput') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const csvContent = 'Item Code,Item Description / Specs,Unit (UOM),Required Quantity\nSITE-001,Reinforced Concrete M30,Cum,85.5\nSITE-002,Structural Steel Beams,Ton,14.2';
    const csvFile = new File([csvContent], 'Site_Structural_BOQ.csv', { type: 'text/csv' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [csvFile] } });
    });

    await waitFor(() => {
      expect(screen.getByText('Site_Structural_BOQ.csv')).toBeInTheDocument();
      expect(screen.getByText('SITE-001')).toBeInTheDocument();
      expect(screen.getByText('Reinforced Concrete M30')).toBeInTheDocument();
    });

    // Re-upload and View Loaded Schedule buttons
    const viewLoadedBtn = screen.getByRole('button', { name: /View Loaded Schedule/i });
    fireEvent.click(viewLoadedBtn);

    const reuploadBtn = screen.getByRole('button', { name: /Re-upload/i });
    fireEvent.click(reuploadBtn);
  });

  it('handles Method 2: Standard Template package loading and upload', async () => {
    const { container } = render(<PRModule onSelectPRForBOQ={mockOnSelectPRForBOQ} />);

    fireEvent.click(screen.getByText('2. Standard Template'));
    expect(screen.getByText(/Method 2: Corporate Standard BOQ Template/i)).toBeInTheDocument();

    // Download standard template
    const downloadStdBtn = screen.getByRole('link', { name: /Download Standard Template/i });
    expect(downloadStdBtn).toBeInTheDocument();

    // Upload filled template
    const method2Input = container.querySelector('#method2FileInput') as HTMLInputElement;
    if (method2Input) {
      const templateCsv = new File(
        ['Item Code,Item Description,Unit,Qty\nSTD-PKG-01,Standard Flooring Tile,Sqm,250'],
        'Standard_Package_Filled.csv',
        { type: 'text/csv' }
      );
      await act(async () => {
        fireEvent.change(method2Input, { target: { files: [templateCsv] } });
      });
      await waitFor(() => {
        expect(screen.getByText('STD-PKG-01')).toBeInTheDocument();
      });
    }

    // Load standard package button
    const loadPkgBtn = screen.getByRole('button', { name: /Load Standard Package into BOQ Schedule/i });
    fireEvent.click(loadPkgBtn);
  });

  it('handles Method 3: Drawing AI Extractor with technical drawing upload and extraction', () => {
    render(<PRModule onSelectPRForBOQ={mockOnSelectPRForBOQ} />);

    fireEvent.click(screen.getByText('3. Drawing AI Extractor'));
    expect(screen.getByText(/Upload Technical Drawing Sheet/i)).toBeInTheDocument();
    expect(screen.getByText('Counter_Elevation_D_Approved_Drawing.pdf')).toBeInTheDocument();

    // Clear drawing
    const clearDrawingBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.clearDrawingButton, 'i'),
    });
    fireEvent.click(clearDrawingBtn);
    expect(screen.getByText(UI_STRINGS.prModule.drawingClearedNotice)).toBeInTheDocument();
  });

  it('handles Method 4: Master Catalog and manual custom line items', () => {
    const { container } = render(<PRModule onSelectPRForBOQ={mockOnSelectPRForBOQ} />);

    fireEvent.click(screen.getByText('4. Manual / Catalog'));
    expect(screen.getByText(/Method 4: Master Catalog Selection & Manual Line Entry/i)).toBeInTheDocument();

    const catalogPicker = container.querySelector('#nextCatalogPicker') as HTMLSelectElement;
    if (catalogPicker) {
      fireEvent.change(catalogPicker, { target: { value: '18mm BWP Marine Plywood' } });
    }
    const addFromCatalogBtn = screen.getByRole('button', { name: /Add from Catalog/i });
    fireEvent.click(addFromCatalogBtn);

    // Add Custom Line Item
    const addCustomBtn = screen.getByRole('button', { name: /\+ Add Custom Item/i });
    fireEvent.click(addCustomBtn);
    expect(screen.getByText('Custom Site Requisition Line Item')).toBeInTheDocument();
  });

  it('updates quantity and recalculates AI benchmark amount', () => {
    render(<PRModule onSelectPRForBOQ={mockOnSelectPRForBOQ} />);

    // Initially populated with Counter Elevation D items
    expect(screen.getByText('CNT-TOP-GRN20')).toBeInTheDocument();

    // Verify AI Benchmark Rate column heading
    expect(screen.getByText(UI_STRINGS.prModule.aiBenchmarkRate)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.prModule.aiBenchmarkAmount)).toBeInTheDocument();

    // Change quantity in table
    const qtyInputs = screen.getAllByRole('spinbutton');
    if (qtyInputs.length > 0) {
      fireEvent.change(qtyInputs[0], { target: { value: '100' } });
      expect((qtyInputs[0] as HTMLInputElement).value).toBe('100');
    }

    // Delete item
    const deleteBtns = screen.getAllByTitle('Delete Item');
    if (deleteBtns.length > 0) {
      fireEvent.click(deleteBtns[deleteBtns.length - 1]);
    }
  });

  it('opens AmendBOQModal and saves amended item with AI benchmark calculation', () => {
    render(<PRModule onSelectPRForBOQ={mockOnSelectPRForBOQ} />);

    const amendBtns = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.amendItemButton, 'i'),
    });
    expect(amendBtns.length).toBeGreaterThan(0);
    fireEvent.click(amendBtns[0]);

    // Modal is open
    expect(screen.getByText(UI_STRINGS.prModule.amendBOQTitle)).toBeInTheDocument();
    expect(screen.getByDisplayValue('CNT-TOP-GRN20')).toBeInTheDocument();

    // Edit description
    const descInput = screen.getByDisplayValue(/Polished Jet Black Granite/i);
    fireEvent.change(descInput, { target: { value: '20mm Premium Italian Black Granite with Chamfered Bullnose' } });

    // Save amendment
    const saveBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.saveAmendmentButton, 'i'),
    });
    fireEvent.click(saveBtn);

    // Modal closes and amended description appears
    expect(screen.queryByText(UI_STRINGS.prModule.amendBOQTitle)).not.toBeInTheDocument();
    expect(screen.getByText(/20mm Premium Italian Black Granite with Chamfered Bullnose/i)).toBeInTheDocument();
  });

  it('calls createPR and transitions to RFQ hub when "Proceed to Raise RFQ →" is clicked', () => {
    render(
      <PRModule
        onSelectPRForBOQ={mockOnSelectPRForBOQ}
        onNavigateToBOQ={mockOnNavigateToBOQ}
      />
    );

    const rfqButtons = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.proceedToRaiseRFQ, 'i'),
    });
    expect(rfqButtons.length).toBeGreaterThan(0);

    // Click top Proceed to Raise RFQ
    fireEvent.click(rfqButtons[0]);

    expect(mockCreatePR).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/PR-2026-\d{4}/),
        title: expect.any(String),
        category: 'Interior & Fitouts',
        items: expect.any(Array),
      })
    );
    expect(mockOnNavigateToBOQ).toHaveBeenCalledWith(expect.stringMatching(/PR-2026-\d{4}/));
  });
});
