import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddCategoryModal } from '@/components/budget/AddCategoryModal';
import { UI_STRINGS } from '@/constants';
import type { BudgetCategory } from '@/types';

describe('AddCategoryModal Component', () => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;
  const commonStrings = UI_STRINGS.common;

  const mockExistingCategories: BudgetCategory[] = [
    {
      id: 'CAT-CIVIL',
      name: 'Civil & Structural Works',
      shortCode: 'CIVIL',
      costCenter: 'CC-CIVIL',
      description: 'Civil scope',
      items: [],
      subtotalCost: 0,
      baselineBudget: 1000000,
      committedCost: 0,
      status: 'DRAFT',
    },
  ];

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AddCategoryModal
        isOpen={false}
        onClose={jest.fn()}
        onAddCategory={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with title, inputs, and allows adding/removing minor categories', () => {
    const onAddCategoryMock = jest.fn();
    const onCloseMock = jest.fn();

    render(
      <AddCategoryModal
        isOpen={true}
        onClose={onCloseMock}
        onAddCategory={onAddCategoryMock}
        existingCategories={mockExistingCategories}
      />
    );

    expect(screen.getByText(strings.addCategoryModalTitle)).toBeInTheDocument();
    expect(screen.getByText(strings.minorCategoriesTitle)).toBeInTheDocument();

    // Input Major category
    const majorInput = screen.getByPlaceholderText(strings.categoryNamePlaceholder);
    fireEvent.change(majorInput, { target: { value: 'Mechanical & Plumbing' } });

    // Initial minor category row
    const firstMinor = screen.getByPlaceholderText(strings.subCategoryPlaceholder);
    fireEvent.change(firstMinor, { target: { value: 'HVAC Piping' } });

    // Add second minor category
    const addMinorBtn = screen.getByRole('button', { name: strings.addMinorCategoryButton });
    fireEvent.click(addMinorBtn);

    const secondMinor = screen.getByPlaceholderText(strings.minorCategoryPlaceholder);
    fireEvent.change(secondMinor, { target: { value: 'Ductwork' } });

    // Add third minor category and then remove it
    fireEvent.click(addMinorBtn);
    const removeBtns = screen.getAllByRole('button', { name: strings.removeMinorCategoryButton });
    expect(removeBtns.length).toBe(3);
    fireEvent.click(removeBtns[2]);

    // Fill optional fields
    fireEvent.change(screen.getByPlaceholderText(strings.costCenterPlaceholder), {
      target: { value: 'CC-MEP-01' },
    });
    fireEvent.change(screen.getByPlaceholderText(strings.baselineBudgetPlaceholder), {
      target: { value: '500000' },
    });
    fireEvent.change(screen.getByPlaceholderText(strings.categoryDescPlaceholder), {
      target: { value: 'HVAC and piping systems' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: strings.submitCategoryButton }));

    expect(onAddCategoryMock).toHaveBeenCalledWith({
      name: 'Mechanical & Plumbing',
      majorCategory: 'Mechanical & Plumbing',
      subCategory: 'HVAC Piping',
      subCategories: ['HVAC Piping', 'Ductwork'],
      costCenter: 'CC-MEP-01',
      baselineBudget: 500000,
      description: 'HVAC and piping systems',
    });
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('selects existing major category from dropdown', () => {
    render(
      <AddCategoryModal
        isOpen={true}
        onClose={jest.fn()}
        onAddCategory={jest.fn()}
        existingCategories={mockExistingCategories}
      />
    );

    const select = screen.getByLabelText(strings.majorCategoryLabel);
    fireEvent.change(select, { target: { value: 'Civil & Structural Works' } });

    const majorInput = screen.getByPlaceholderText(strings.categoryNamePlaceholder);
    expect(majorInput).toHaveValue('Civil & Structural Works');
  });

  it('populates initialMajorCategory if provided', () => {
    render(
      <AddCategoryModal
        isOpen={true}
        onClose={jest.fn()}
        onAddCategory={jest.fn()}
        initialMajorCategory="Interior & Fitouts"
      />
    );

    const majorInput = screen.getByPlaceholderText(strings.categoryNamePlaceholder);
    expect(majorInput).toHaveValue('Interior & Fitouts');
  });

  it('handles validation failure on invalid input', () => {
    const onAddCategoryMock = jest.fn();

    render(
      <AddCategoryModal
        isOpen={true}
        onClose={jest.fn()}
        onAddCategory={onAddCategoryMock}
      />
    );

    // Empty name submitted
    const majorInput = screen.getByPlaceholderText(strings.categoryNamePlaceholder);
    fireEvent.change(majorInput, { target: { value: '   ' } });

    fireEvent.click(screen.getByRole('button', { name: strings.submitCategoryButton }));
    expect(onAddCategoryMock).not.toHaveBeenCalled();
  });

  it('handles error thrown by onAddCategory', () => {
    const onAddCategoryMock = jest.fn().mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    render(
      <AddCategoryModal
        isOpen={true}
        onClose={jest.fn()}
        onAddCategory={onAddCategoryMock}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(strings.categoryNamePlaceholder), {
      target: { value: 'Valid Category' },
    });
    fireEvent.click(screen.getByRole('button', { name: strings.submitCategoryButton }));

    expect(screen.getByText('Database connection failed')).toBeInTheDocument();
  });

  it('handles close button click', () => {
    const onCloseMock = jest.fn();

    render(
      <AddCategoryModal
        isOpen={true}
        onClose={onCloseMock}
        onAddCategory={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: commonStrings.close }));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('handles cancel button click', () => {
    const onCloseMock = jest.fn();

    render(
      <AddCategoryModal
        isOpen={true}
        onClose={onCloseMock}
        onAddCategory={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: commonStrings.cancel }));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
