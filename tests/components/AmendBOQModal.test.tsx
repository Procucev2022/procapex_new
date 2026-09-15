import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AmendBOQModal } from '@/components/AmendBOQModal';
import { UI_STRINGS } from '@/constants';
import type { RequesterBOQItem, AmendCategoryOption } from '@/types';

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
});
