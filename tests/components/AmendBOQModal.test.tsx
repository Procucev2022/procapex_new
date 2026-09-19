import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AmendBOQModal } from '@/components/AmendBOQModal';
import { UI_STRINGS } from '@/constants';
import type { RequesterBOQItem, AmendCategoryOption, RefineBOQItemResult } from '@/types';

describe('AmendBOQModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const mockItem: RequesterBOQItem = {
    code: 'DWG-SPEC-001',
    desc: '18mm Marine Grade Core Substrate',
    uom: 'Sqm',
    qty: 45,
    benchmark: 2200,
    rateCard: 2200,
  };

  const mockCategories: AmendCategoryOption[] = [
    {
      id: 'cat-interior',
      name: 'Interior & Fitouts',
      subCategories: [
        {
          id: 'sub-millwork',
          name: 'Counter Millwork',
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AmendBOQModal
        isOpen={false}
        item={mockItem}
        index={0}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when item is null', () => {
    const { container } = render(
      <AmendBOQModal
        isOpen={true}
        item={null}
        index={-1}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders fields populated with item data when open', () => {
    render(
      <AmendBOQModal
        isOpen={true}
        item={mockItem}
        index={0}
        onClose={mockOnClose}
        onSave={mockOnSave}
        availableCategories={mockCategories}
      />
    );

    expect(screen.getByText(UI_STRINGS.prModule.amendBOQTitle)).toBeInTheDocument();
    expect(screen.getByDisplayValue('DWG-SPEC-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('18mm Marine Grade Core Substrate')).toBeInTheDocument();
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2200')).toBeInTheDocument();
  });

  it('validates required fields and displays error summary', () => {
    render(
      <AmendBOQModal
        isOpen={true}
        item={mockItem}
        index={0}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const descInput = screen.getByDisplayValue('18mm Marine Grade Core Substrate');
    fireEvent.change(descInput, { target: { value: '' } });

    const saveBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.saveAmendmentButton, 'i') });
    fireEvent.click(saveBtn);

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(screen.getByText(/desc is required/i)).toBeInTheDocument();
  });

  it('saves amended values without adding to Standard BOQ', () => {
    render(
      <AmendBOQModal
        isOpen={true}
        item={mockItem}
        index={0}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const qtyInput = screen.getByDisplayValue('45');
    fireEvent.change(qtyInput, { target: { value: '60' } });

    const rateInput = screen.getByDisplayValue('2200');
    fireEvent.change(rateInput, { target: { value: '2500' } });

    const saveBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.saveAmendmentButton, 'i') });
    fireEvent.click(saveBtn);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'DWG-SPEC-001',
        qty: 60,
        benchmark: 2500,
      }),
      0,
      false,
      undefined,
      undefined
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows toggling "Add to Standard BOQ Master Catalog?" and selecting category', () => {
    render(
      <AmendBOQModal
        isOpen={true}
        item={mockItem}
        index={0}
        onClose={mockOnClose}
        onSave={mockOnSave}
        availableCategories={mockCategories}
        currentCategoryName="Interior & Fitouts"
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const saveBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.prModule.saveAmendmentButton, 'i') });
    fireEvent.click(saveBtn);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'DWG-SPEC-001',
      }),
      0,
      true,
      'cat-interior',
      'sub-millwork'
    );
  });

  describe('AI/LLM Line Item Refinement & Acceptance', () => {
    it('shows error if refining with empty specs input', async () => {
      render(
        <AmendBOQModal
          isOpen={true}
          item={mockItem}
          index={0}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const refineBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.refineWithAiButton.replace(/[()]/g, '\\$&'), 'i'),
      });
      fireEvent.click(refineBtn);

      expect(screen.getByText(/Please enter specifications or engineering notes to refine/i)).toBeInTheDocument();
    });

    it('uses quick preset buttons to populate specs textarea', () => {
      render(
        <AmendBOQModal
          isOpen={true}
          item={mockItem}
          index={0}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const presetBtns = screen.getAllByRole('button', { name: /^\+ /i });
      expect(presetBtns.length).toBeGreaterThan(0);
      fireEvent.click(presetBtns[0]);

      const textarea = screen.getByPlaceholderText(UI_STRINGS.prModule.inputSpecsPlaceholder) as HTMLTextAreaElement;
      expect(textarea.value.length).toBeGreaterThan(10);
    });

    it('refines BOQ with AI and accepts revised line item directly', async () => {
      const mockRefinedResult: RefineBOQItemResult = {
        refinedCode: 'DWG-SPEC-001',
        refinedDesc: '18mm CenturyPly Architect BWP Plywood with 1mm Laminate and Anti-Termite Treatment',
        refinedUom: 'Sqm',
        refinedQty: 45,
        refinedBenchmarkRate: 2850,
        aiRationale: 'Calibrated rate +29% for certified BWP grade and premium anti-termite treatment.',
        specsHighlighted: ['BWP Grade', 'Anti-Termite'],
        modelUsed: 'gemini-2.0-flash-lite',
        isLiveAi: true,
        confidence: '96%',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefinedResult,
      });

      render(
        <AmendBOQModal
          isOpen={true}
          item={mockItem}
          index={0}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByPlaceholderText(UI_STRINGS.prModule.inputSpecsPlaceholder);
      fireEvent.change(textarea, {
        target: { value: 'Upgrade to CenturyPly BWP grade with anti-termite treatment' },
      });

      const refineBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.refineWithAiButton.replace(/[()]/g, '\\$&'), 'i'),
      });
      fireEvent.click(refineBtn);

      await waitFor(() => {
        expect(screen.getByText(UI_STRINGS.prModule.refinedOutputHeading)).toBeInTheDocument();
        expect(screen.getByText(mockRefinedResult.refinedDesc)).toBeInTheDocument();
        expect(screen.getByText('₹2,850')).toBeInTheDocument();
      });

      // Accept Revised BOQ Line Item directly
      const acceptBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.acceptRevisedButton, 'i'),
      });
      fireEvent.click(acceptBtn);

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'DWG-SPEC-001',
          desc: mockRefinedResult.refinedDesc,
          benchmark: 2850,
          isRefined: true,
          status: 'Refined',
        }),
        0,
        false,
        undefined,
        undefined
      );
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('refines BOQ with AI and allows correcting revised values before saving', async () => {
      const mockRefinedResult: RefineBOQItemResult = {
        refinedCode: 'DWG-SPEC-001',
        refinedDesc: '12mm extra-clear toughened safety glass with spider fittings',
        refinedUom: 'Sqm',
        refinedQty: 50,
        refinedBenchmarkRate: 3400,
        aiRationale: 'Commercial architectural glazing.',
        specsHighlighted: ['Toughened Glass'],
        modelUsed: 'gemini-2.0-flash-lite',
        isLiveAi: false,
        confidence: '95%',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefinedResult,
      });

      render(
        <AmendBOQModal
          isOpen={true}
          item={mockItem}
          index={0}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByPlaceholderText(UI_STRINGS.prModule.inputSpecsPlaceholder);
      fireEvent.change(textarea, { target: { value: 'Use 12mm toughened glass' } });

      const refineBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.refineWithAiButton.replace(/[()]/g, '\\$&'), 'i'),
      });
      fireEvent.click(refineBtn);

      await waitFor(() => {
        expect(screen.getByText(UI_STRINGS.prModule.refinedOutputHeading)).toBeInTheDocument();
      });

      // Click "Correct & Adjust Revised BOQ"
      const correctBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.correctAndAcceptButton, 'i'),
      });
      fireEvent.click(correctBtn);

      // Verify the form fields were updated with the refined values
      expect(screen.getByDisplayValue(mockRefinedResult.refinedDesc)).toBeInTheDocument();
      expect(screen.getByDisplayValue('3400')).toBeInTheDocument();

      // User fine-tunes benchmark rate to 3500
      const rateInput = screen.getByDisplayValue('3400');
      fireEvent.change(rateInput, { target: { value: '3500' } });

      // Save amended form
      const saveBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.saveAmendmentButton, 'i'),
      });
      fireEvent.click(saveBtn);

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          desc: mockRefinedResult.refinedDesc,
          benchmark: 3500,
          isRefined: true,
        }),
        0,
        false,
        undefined,
        undefined
      );
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles AI refinement API errors and network exceptions', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'AI Gateway Timeout' }),
      });

      render(
        <AmendBOQModal
          isOpen={true}
          item={mockItem}
          index={0}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByPlaceholderText(UI_STRINGS.prModule.inputSpecsPlaceholder);
      fireEvent.change(textarea, { target: { value: 'Custom specs' } });

      const refineBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.prModule.refineWithAiButton.replace(/[()]/g, '\\$&'), 'i'),
      });
      fireEvent.click(refineBtn);

      await waitFor(() => {
        expect(screen.getByText(/AI Gateway Timeout/i)).toBeInTheDocument();
      });

      // Test network exception
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network disconnected'));
      fireEvent.click(refineBtn);

      await waitFor(() => {
        expect(screen.getByText(/Network disconnected/i)).toBeInTheDocument();
      });
    });
  });
});
