import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryCard } from '@/components/budget/CategoryCard';
import type { BudgetCategory } from '@/types';
import { UI_STRINGS, formatString } from '@/constants';

describe('CategoryCard Component', () => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;

  const mockCategoryWithSubCategories: BudgetCategory = {
    id: 'CAT-CIVIL',
    name: 'Civil & Structural Works',
    shortCode: 'CIVIL',
    costCenter: 'CC-101 (Civil)',
    description: 'Foundations, substructure, and formwork',
    subCategories: [
      {
        id: 'SUB-1',
        categoryId: 'CAT-CIVIL',
        name: 'Earthwork',
        shortCode: 'EARTH',
      },
      {
        id: 'SUB-2',
        categoryId: 'CAT-CIVIL',
        name: 'Formwork',
        shortCode: 'FORM',
      },
    ],
    items: [
      {
        id: 'ITM-1',
        code: 'CIVIL-GEN-001',
        categoryId: 'CAT-CIVIL',
        desc: 'Excavation in ordinary rock',
        uom: 'Cum',
        benchmarkRate: 450,
        defaultQty: 100,
        qty: 100,
        calculatedCost: 45000,
        status: 'ACTIVE',
        benchmarkDetails: {
          benchmarkRate: 450,
          masterRateCardRate: 450,
          historicalLowestRate: 450,
          aiConfidence: '95%',
          varianceVsRateCardPercent: 0,
        },
      },
    ],
    subtotalCost: 45000,
    baselineBudget: 1000000,
    committedCost: 0,
    status: 'DRAFT',
  };

  const mockCategoryWithoutSubCategories: BudgetCategory = {
    id: 'CAT-SOLAR',
    name: 'Solar Works',
    shortCode: 'SOLAR',
    costCenter: 'CC-109 (Solar)',
    description: '',
    items: [],
    subtotalCost: 0,
    baselineBudget: 0,
    committedCost: 0,
    status: 'DRAFT',
  };

  it('renders category with details, badges, and sub-categories list', () => {
    const onAddSubCategoryMock = jest.fn();
    const onAddBOQItemMock = jest.fn();
    const onViewCategoryItemsMock = jest.fn();

    render(
      <CategoryCard
        category={mockCategoryWithSubCategories}
        onAddSubCategory={onAddSubCategoryMock}
        onAddBOQItem={onAddBOQItemMock}
        onViewCategoryItems={onViewCategoryItemsMock}
      />
    );

    expect(screen.getByText('CIVIL')).toBeInTheDocument();
    expect(screen.getByText('CC-101 (Civil)')).toBeInTheDocument();
    expect(screen.getByText('Civil & Structural Works')).toBeInTheDocument();
    expect(screen.getByText('Foundations, substructure, and formwork')).toBeInTheDocument();

    // Check item count badge
    expect(
      screen.getByText(formatString(strings.totalItemsBadgeTemplate, { count: 1 }))
    ).toBeInTheDocument();

    // Check subcategories
    expect(screen.getByText('EARTH:')).toBeInTheDocument();
    expect(screen.getByText('Earthwork')).toBeInTheDocument();
    expect(screen.getByText('FORM:')).toBeInTheDocument();
    expect(screen.getByText('Formwork')).toBeInTheDocument();

    // Click Add Sub-Category button
    const addSubCatBtn = screen.getByRole('button', { name: new RegExp(strings.addSubCategoryButton, 'i') });
    fireEvent.click(addSubCatBtn);
    expect(onAddSubCategoryMock).toHaveBeenCalledWith('CAT-CIVIL');

    // Click Add Standard BOQ Item button
    const addItemBtn = screen.getByRole('button', { name: new RegExp(strings.addStandardBOQItemButton, 'i') });
    fireEvent.click(addItemBtn);
    expect(onAddBOQItemMock).toHaveBeenCalledWith('CAT-CIVIL');

    // Click View Items button
    const viewItemsSpan = screen.getByText(formatString(strings.showingItemsTemplate, { count: 1 }));
    fireEvent.click(viewItemsSpan.closest('button') || viewItemsSpan);
    expect(onViewCategoryItemsMock).toHaveBeenCalledWith('CAT-CIVIL');
  });

  it('renders empty notice when category has no sub-categories and no description', () => {
    render(
      <CategoryCard
        category={mockCategoryWithoutSubCategories}
        onAddSubCategory={jest.fn()}
        onAddBOQItem={jest.fn()}
        onViewCategoryItems={jest.fn()}
      />
    );

    expect(screen.getByText('SOLAR')).toBeInTheDocument();
    expect(screen.getByText('Solar Works')).toBeInTheDocument();
    expect(screen.getByText(strings.noSubCategoriesDefined)).toBeInTheDocument();
  });

  it('renders standard BOQ template download link with valid data URI and filename', () => {
    render(
      <CategoryCard
        category={mockCategoryWithSubCategories}
        onAddSubCategory={jest.fn()}
        onAddBOQItem={jest.fn()}
        onViewCategoryItems={jest.fn()}
      />
    );

    const downloadLink = screen
      .getByText(strings.downloadStandardBOQTemplateButton)
      .closest('a');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('download', 'CIVIL_Standard_BOQ_Format.csv');
    expect(downloadLink?.getAttribute('href')).toContain('data:text/csv;charset=utf-8,');
  });

  it('uses fallback Category in filename when shortCode is absent', () => {
    const noShortCodeCat: BudgetCategory = {
      ...mockCategoryWithoutSubCategories,
      shortCode: '',
    };

    render(
      <CategoryCard
        category={noShortCodeCat}
        onAddSubCategory={jest.fn()}
        onAddBOQItem={jest.fn()}
        onViewCategoryItems={jest.fn()}
      />
    );

    const downloadLink = screen
      .getByText(strings.downloadStandardBOQTemplateButton)
      .closest('a');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('download', 'Category_Standard_BOQ_Format.csv');
  });
});
