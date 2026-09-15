import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { PRModule } from '@/components/PRModule';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('PRModule Drawing AI Extractor & Amendment Workflow', () => {
  const mockAddStandardBOQItem = jest.fn();
  const mockCreatePR = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    (useProcurement as jest.Mock).mockReturnValue({
      prs: [],
      createPR: mockCreatePR,
      addStandardBOQItem: mockAddStandardBOQItem,
      projectCategories: [
        {
          id: 'cat-interior',
          name: 'Interior Finishing & Millwork',
          shortCode: 'INT',
          costCenter: 'CC-101',
          baselineBudget: 5000000,
          allocatedBudget: 5000000,
          actualCommitted: 0,
          forecastFinal: 0,
          variance: 0,
          status: 'On Track',
          subCategories: [
            {
              id: 'sub-counters',
              categoryId: 'cat-interior',
              name: 'Counters & Desks',
              shortCode: 'CNTR',
              description: 'Counters',
              allocatedAmount: 1000000,
              committedAmount: 0,
              itemsCount: 1,
            },
          ],
        },
      ],
    });
    window.alert = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resets drawing and BOQ schedule to blank when user clicks Clear Drawing button', () => {
    render(<PRModule />);

    // Navigate to Step 3 (Technical Specifications / BOQ) and switch to Method 3
    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepBOQ.replace(/[()]/g, '\\$&'), 'i') })
    );
    fireEvent.click(screen.getByText('3. Drawing AI Extractor'));

    // Initial items exist from default
    expect(screen.getByText(/Schedule Active/i)).toBeInTheDocument();

    // Click Clear button in Option B
    const clearButtons = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.clearDrawingButton, 'i'),
    });
    expect(clearButtons.length).toBeGreaterThan(0);
    fireEvent.click(clearButtons[0]);

    // Schedule should now indicate 0 lines / blank
    expect(screen.getByText(/All BOQ schedule columns are currently blank/i)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.prModule.drawingClearedNotice)).toBeInTheDocument();
  });

  it('wipes previous drawing name and BOQ immediately upon new drawing upload, then populates with AI extracted items', async () => {
    const mockExtractedItems = [
      {
        code: 'DWG-AI-001',
        desc: 'Custom Acoustic Fabric Wall Panels 25mm',
        uom: 'Sqm',
        qty: 120,
        benchmark: 3500,
        rateCard: 3500,
        status: 'Active',
        drawingElevation: 'Acoustic Wall Layout Rev B',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        drawingTitle: 'Acoustic Wall Layout Rev B',
        category: 'Interior Finishing & Millwork',
        items: mockExtractedItems,
        isLiveAi: true,
        modelUsed: 'gemini-1.5-pro',
      }),
    });

    const { container } = render(<PRModule />);

    // Navigate to Step 3 and switch to Method 3
    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepBOQ.replace(/[()]/g, '\\$&'), 'i') })
    );
    fireEvent.click(screen.getByText('3. Drawing AI Extractor'));

    // Upload a new drawing file
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['mock content'], 'Acoustic_Wall_Layout_Rev_B.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    // Wait for API call and UI update
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/extract-drawing',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Acoustic_Wall_Layout_Rev_B.pdf'),
        })
      );
    });

    // Verify new drawing name is rendered and new items are present in the table
    await waitFor(() => {
      expect(screen.getByText('Acoustic_Wall_Layout_Rev_B.pdf')).toBeInTheDocument();
      expect(screen.getByText('Custom Acoustic Fabric Wall Panels 25mm')).toBeInTheDocument();
      expect(screen.getByText('DWG-AI-001')).toBeInTheDocument();
    });
  });

  it('allows user to amend a BOQ item and add it to Standard BOQ Master Catalog', async () => {
    render(<PRModule />);

    // Navigate to Step 3 and switch to Method 3
    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepBOQ.replace(/[()]/g, '\\$&'), 'i') })
    );
    fireEvent.click(screen.getByText('3. Drawing AI Extractor'));

    // Find and click the Amend button on the first item
    const amendButtons = screen.getAllByRole('button', {
      name: /Amend item/i,
    });
    expect(amendButtons.length).toBeGreaterThan(0);
    fireEvent.click(amendButtons[0]);

    // Modal should be visible
    expect(screen.getByText(UI_STRINGS.prModule.amendBOQTitle)).toBeInTheDocument();
    const modal = screen.getByRole('dialog');
    const modalScope = within(modal);

    // Modify quantity and description
    const qtyInput = modalScope.getByDisplayValue('12.5');
    fireEvent.change(qtyInput, { target: { value: '85' } });

    const descInput = modalScope.getByDisplayValue(/Polished Jet Black Granite/i);
    fireEvent.change(descInput, { target: { value: '20mm Premium Italian Black Marble Countertop' } });

    // Check "Add to Standard BOQ Master Catalog?"
    const standardCheckbox = modalScope.getByRole('checkbox');
    fireEvent.click(standardCheckbox);
    expect(standardCheckbox).toBeChecked();

    // Save changes
    const saveBtn = modalScope.getByRole('button', {
      name: new RegExp(UI_STRINGS.prModule.saveAmendmentButton, 'i'),
    });
    fireEvent.click(saveBtn);

    // Verify addStandardBOQItem was called with category, code, desc, uom, and rate
    expect(mockAddStandardBOQItem).toHaveBeenCalledWith(
      expect.objectContaining({
        desc: '20mm Premium Italian Black Marble Countertop',
        uom: 'Sqm',
        defaultQty: 85,
      })
    );

    // Verify table updated with new description
    expect(screen.getByText('20mm Premium Italian Black Marble Countertop')).toBeInTheDocument();
  });

  it('extracts realistic interior woodwork BOQ items for Full Height Storage Details drawing without industrial racks', async () => {
    render(<PRModule />);

    // Navigate to Step 3 and switch to Method 3
    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.stepBOQ.replace(/[()]/g, '\\$&'), 'i') })
    );
    fireEvent.click(screen.getByText('3. Drawing AI Extractor'));

    // Click "Full Height Storage Details" quick preset
    const storagePresetBtn = screen.getByRole('button', { name: 'Full Height Storage Details' });
    fireEvent.click(storagePresetBtn);

    // Verify drawing title is populated
    expect(screen.getByDisplayValue('Full Height Storage Details')).toBeInTheDocument();

    // Verify interior woodwork items are populated
    await waitFor(() => {
      expect(screen.getByText('STR-PLY-20MM')).toBeInTheDocument();
      expect(screen.getByText(/20mm Marine Grade BWP Plywood Carcass/i)).toBeInTheDocument();
      expect(screen.getByText('STR-LAM-BLK')).toBeInTheDocument();
      expect(screen.getByText(/21066 lam-01/i)).toBeInTheDocument();
      expect(screen.getByText('STR-LAM-WAL')).toBeInTheDocument();
      expect(screen.getByText(/Magas Walnut 10510 lam-02/i)).toBeInTheDocument();
      expect(screen.getByText('STR-SHT-FULL')).toBeInTheDocument();
      expect(screen.getByText('STR-HDW-SOFT')).toBeInTheDocument();
      expect(screen.getByText('STR-PLN-75MM')).toBeInTheDocument();
    });

    // Ensure industrial warehouse pallet racks are NOT present
    expect(screen.queryByText('STR-RCK-500K')).not.toBeInTheDocument();
    expect(screen.queryByText(/Slotted Angle Industrial Storage Racks/i)).not.toBeInTheDocument();
  });
});
