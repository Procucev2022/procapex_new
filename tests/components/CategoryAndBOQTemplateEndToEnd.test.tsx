import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddCategoryModal } from '@/components/budget/AddCategoryModal';
import { CategoryCard } from '@/components/budget/CategoryCard';
import { PRModule } from '@/components/PRModule';
import { ProcurementProvider } from '@/context/ProcurementContext';
import { generateStandardBOQTemplateCSV } from '@/lib/budget-utils';
import { UI_STRINGS } from '@/constants';
import type { BudgetCategory } from '@/types';

describe('Category & Standard BOQ Master End-to-End Workflow', () => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;

  describe('AddCategoryModal: Major & Minor Category Creation', () => {
    it('allows creating a Major category and multiple Minor categories', () => {
      const handleAddCategory = jest.fn();
      const handleClose = jest.fn();

      render(
        <AddCategoryModal
          isOpen={true}
          onClose={handleClose}
          onAddCategory={handleAddCategory}
          existingCategories={[]}
        />
      );

      // Verify modal elements
      expect(screen.getByText(strings.addCategoryModalTitle)).toBeInTheDocument();
      expect(screen.getByText(strings.minorCategoriesTitle)).toBeInTheDocument();

      // Enter Major Category
      const majorInput = screen.getByPlaceholderText(strings.categoryNamePlaceholder);
      fireEvent.change(majorInput, { target: { value: 'MEP Infrastructure' } });

      // Enter Minor Category 1
      const minorInput1 = screen.getByPlaceholderText(strings.subCategoryPlaceholder);
      fireEvent.change(minorInput1, { target: { value: 'Chilled Water Piping' } });

      // Click Add Another Minor Category button
      const addMinorBtn = screen.getByText(strings.addMinorCategoryButton);
      fireEvent.click(addMinorBtn);

      // Enter Minor Category 2
      const minorInput2 = screen.getByPlaceholderText(strings.minorCategoryPlaceholder);
      fireEvent.change(minorInput2, { target: { value: 'Centrifugal Chillers' } });

      // Submit
      const submitBtn = screen.getByRole('button', { name: strings.submitCategoryButton });
      fireEvent.click(submitBtn);

      expect(handleAddCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'MEP Infrastructure',
          majorCategory: 'MEP Infrastructure',
          subCategory: 'Chilled Water Piping',
          subCategories: ['Chilled Water Piping', 'Centrifugal Chillers'],
        })
      );
    });
  });

  describe('Standard BOQ Line Items & Template Download Reflection', () => {
    it('reflects all line items added to category in the downloaded CSV template without quantities', () => {
      const sampleCategory: BudgetCategory = {
        id: 'CAT-PLUMB',
        name: 'Plumbing & Drainage',
        shortCode: 'PLUMB',
        costCenter: 'CC-PLUMB',
        description: 'Sanitary fixtures, drainage lines, and water pumps',
        baselineBudget: 3500000,
        committedCost: 0,
        status: 'DRAFT',
        subtotalCost: 175000,
        subCategories: [
          { id: 'SUB-PLUMB-01', categoryId: 'CAT-PLUMB', name: 'Piping', shortCode: 'PIP' },
          { id: 'SUB-PLUMB-02', categoryId: 'CAT-PLUMB', name: 'Fixtures', shortCode: 'FIX' },
        ],
        items: [
          {
            id: 'ITM-PLUMB-001',
            code: 'PLUMB-PIP-001',
            categoryId: 'CAT-PLUMB',
            subCategoryId: 'SUB-PLUMB-01',
            desc: '110mm SWR PVC Soil & Waste Pipe Class B',
            uom: 'Rmt',
            benchmarkRate: 650,
            defaultQty: 100,
            qty: 100,
            calculatedCost: 65000,
            status: 'ACTIVE',
            isImmutable: true,
            benchmarkDetails: {
              benchmarkRate: 650,
              masterRateCardRate: 650,
              historicalLowestRate: 650,
              aiConfidence: '95%',
              varianceVsRateCardPercent: 0,
            },
          },
          {
            id: 'ITM-PLUMB-002',
            code: 'PLUMB-FIX-001',
            categoryId: 'CAT-PLUMB',
            subCategoryId: 'SUB-PLUMB-02',
            desc: 'Wall-Hung Water Closet with Concealed Cistern',
            uom: 'Set',
            benchmarkRate: 11000,
            defaultQty: 10,
            qty: 10,
            calculatedCost: 110000,
            status: 'ACTIVE',
            isImmutable: true,
            benchmarkDetails: {
              benchmarkRate: 11000,
              masterRateCardRate: 11000,
              historicalLowestRate: 11000,
              aiConfidence: '95%',
              varianceVsRateCardPercent: 0,
            },
          },
        ],
      };

      const csvContent = generateStandardBOQTemplateCSV(sampleCategory, true);
      const rows = csvContent.split('\n');

      // Check header row: 4 columns
      expect(rows[0]).toBe('Item Code,Item Description / Specs,Unit (UOM),Required Quantity');

      // Check row 1
      expect(rows[1]).toBe('"PLUMB-PIP-001","110mm SWR PVC Soil & Waste Pipe Class B","Rmt",');

      // Check row 2
      expect(rows[2]).toBe('"PLUMB-FIX-001","Wall-Hung Water Closet with Concealed Cistern","Set",');

      // Total rows = 1 header + 2 items = 3
      expect(rows).toHaveLength(3);
    });

    it('renders direct download button on CategoryCard in Category Master', () => {
      const sampleCategory: BudgetCategory = {
        id: 'CAT-ELEC',
        name: 'Electrical Distribution',
        shortCode: 'ELEC',
        costCenter: 'CC-ELEC',
        description: 'Cables and switchboards',
        baselineBudget: 1500000,
        committedCost: 0,
        status: 'DRAFT',
        subtotalCost: 0,
        subCategories: [],
        items: [],
      };

      render(
        <CategoryCard
          category={sampleCategory}
          onAddSubCategory={jest.fn()}
          onAddBOQItem={jest.fn()}
          onViewCategoryItems={jest.fn()}
        />
      );

      // Download template link should be rendered on CategoryCard
      const downloadLink = screen.getByText(strings.downloadStandardBOQTemplateButton).closest('a');
      expect(downloadLink).toBeInTheDocument();
      expect(downloadLink).toHaveAttribute('download', 'ELEC_Standard_BOQ_Format.csv');
      expect(downloadLink?.getAttribute('href')).toContain('data:text/csv');
    });
  });

  describe('PR Module Category-Specific Standard BOQ Template Download', () => {
    it('downloads the specific Standard BOQ template corresponding to the selected PR category', async () => {
      render(
        <ProcurementProvider>
          <PRModule />
        </ProcurementProvider>
      );

      // Go to Step 2: Category Selection
      const step2Btn = screen.getByRole('button', { name: /Category Selection/i });
      fireEvent.click(step2Btn);

      // Select Civil & Structural Works
      const categorySelect = screen.getByDisplayValue(/Interior & Fitouts/i);
      fireEvent.change(categorySelect, { target: { value: 'Civil & Structural Works' } });

      // Move to Step 3: BOQ Studio
      const step3Btn = screen.getByRole('button', { name: /BOQ Studio/i });
      fireEvent.click(step3Btn);

      // Click Method 1 card to open Method 1 workbench
      const method1Card = screen.getByText('1. Upload New BOQ');
      fireEvent.click(method1Card);

      // Verify Method 1 Option A download link is specifically for Civil & Structural Works
      const downloadCivilLink = screen.getByText(/Download Blank BOQ Format/i).closest('a');
      expect(downloadCivilLink).toBeInTheDocument();
      expect(downloadCivilLink).toHaveAttribute('download', 'CIVIL_Standard_BOQ_Format.csv');

      // Click Method 2 card to open Method 2 workbench
      const method2Card = screen.getByText('2. Standard Template');
      fireEvent.click(method2Card);

      // Verify Method 2 template download is also for Civil & Structural Works
      const method2DownloadLink = screen.getByText('Download Standard Template (CSV)').closest('a');
      expect(method2DownloadLink).toBeInTheDocument();
      expect(method2DownloadLink).toHaveAttribute('download', 'CIVIL_Standard_BOQ_Format.csv');
    });
  });
});
