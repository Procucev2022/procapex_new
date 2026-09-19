import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UI_STRINGS } from '@/constants';
import { QuickAddVendorModal } from '@/components/vendor-management/QuickAddVendorModal';
import { VendorCategoryBadge } from '@/components/vendor-management/VendorCategoryBadge';
import { VendorCredibilityDrawer } from '@/components/vendor-management/VendorCredibilityDrawer';
import { VendorCataloguePricingTab } from '@/components/vendor-management/VendorCataloguePricingTab';
import { SendCatalogueIntimationModal } from '@/components/vendor-management/SendCatalogueIntimationModal';
import {
  getVendorCatalogueBenchmark,
  calculateCatalogueVariance,
} from '@/lib/vendor-catalogue-pricing';
import { refineBOQItemWithAI } from '@/lib/gemini';
import type { ManagedVendor, BudgetCategory } from '@/types';

describe('Vendor Multi-Category Boarding & Standard BOQ Catalogue Pricing', () => {
  const mockVendor: ManagedVendor = {
    id: 'VND-TEST-001',
    name: 'Apex Infrastructure & Fitouts',
    category: 'Civil & Structural Works',
    categories: ['Civil & Structural Works', 'Interior & Fitouts'],
    subCategory: 'General Contracting',
    region: 'WEST',
    regionLabel: 'WEST (Mumbai)',
    rating: 4.5,
    reviewsCount: 12,
    isRateCard: false,
    rateCardCode: null,
    rateCardStatus: 'Empanelled',
    contactPerson: 'Rahul Sharma',
    gstin: '27AABCS1234F1Z9',
    city: 'Mumbai',
    leadTime: '7 Days',
    badgeText: 'Client Boarded Vendor',
    capacity: 'High',
    source: 'CLIENT_ONBOARDED',
    evaluationStatus: 'VERIFIED',
    ppoRatings: [],
    compositeRating: 4.5,
    totalPPOsCompleted: 2,
    catalogueStatus: {
      hasSubmittedPrices: false,
      intimationSent: false,
    },
  };

  const mockProjectCategories: BudgetCategory[] = [
    {
      id: 'cat-civil',
      name: 'Civil & Structural Works',
      shortCode: 'CIV',
      costCenter: 'CC-101',
      description: 'Civil and structural works',
      items: [
        {
          id: 'item-civ-001',
          categoryId: 'cat-civil',
          code: 'CIV-001',
          desc: 'Ready-mix concrete M25 grade',
          uom: 'Cum',
          benchmarkRate: 4500,
          defaultQty: 100,
          qty: 100,
          calculatedCost: 450000,
          benchmarkDetails: {
            benchmarkRate: 4500,
            masterRateCardRate: 4500,
            historicalLowestRate: 4400,
            aiConfidence: '95%',
            varianceVsRateCardPercent: 0,
          },
        },
      ],
      subtotalCost: 450000,
      baselineBudget: 500000,
      committedCost: 0,
      status: 'BASELINED',
    },
    {
      id: 'cat-interior',
      name: 'Interior & Fitouts',
      shortCode: 'INT',
      costCenter: 'CC-102',
      description: 'Interior fitouts',
      items: [
        {
          id: 'item-int-001',
          categoryId: 'cat-interior',
          code: 'INT-001',
          desc: '12mm extra-clear toughened glass partition',
          uom: 'Sqm',
          benchmarkRate: 2200,
          defaultQty: 50,
          qty: 50,
          calculatedCost: 110000,
          benchmarkDetails: {
            benchmarkRate: 2200,
            masterRateCardRate: 2200,
            historicalLowestRate: 2100,
            aiConfidence: '92%',
            varianceVsRateCardPercent: 0,
          },
        },
      ],
      subtotalCost: 110000,
      baselineBudget: 150000,
      committedCost: 0,
      status: 'BASELINED',
    },
  ];

  describe('1. QuickAddVendorModal: Multi-Category Selection', () => {
    it('allows selecting more than one category and submits all selected categories', () => {
      const mockSubmit = jest.fn();
      const mockClose = jest.fn();

      render(
        <QuickAddVendorModal
          isOpen
          onClose={mockClose}
          onSubmit={mockSubmit}
          availableCategories={['Civil & Structural Works', 'Interior & Fitouts', 'MEP']}
        />
      );

      // Check multi-category label
      expect(
        screen.getByText(UI_STRINGS.vendorManagement.multiCategorySelectLabel)
      ).toBeInTheDocument();

      // Enter company name
      const nameInput = screen.getByLabelText(/Company \/ Contractor Name/i);
      fireEvent.change(nameInput, { target: { value: 'BuildPro Enterprises' } });

      // Enter GSTIN
      const gstinInput = screen.getByLabelText(/GSTIN \/ Tax ID/i);
      fireEvent.change(gstinInput, { target: { value: '27AABCB1234F1Z5' } });

      // Enter Contact
      const contactInput = screen.getByLabelText(/Contact Representative/i);
      fireEvent.change(contactInput, { target: { value: 'Anil Mehta' } });

      // Click second category to select multiple categories
      const interiorBtn = screen.getByRole('button', { name: /Interior & Fitouts/i });
      fireEvent.click(interiorBtn);

      // Submit form
      const submitBtn = screen.getByRole('button', { name: /Onboard Client Vendor/i });
      fireEvent.click(submitBtn);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      const submittedData = mockSubmit.mock.calls[0][0];
      expect(submittedData.name).toBe('BuildPro Enterprises');
      expect(submittedData.category).toBe('Civil & Structural Works');
      expect(submittedData.categories).toEqual(
        expect.arrayContaining(['Civil & Structural Works', 'Interior & Fitouts'])
      );
      expect(submittedData.categories?.length).toBe(2);
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('2. VendorCategoryBadge: Multi-Category and Status Display', () => {
    it('displays primary category and +1 more badge for multi-category vendor', () => {
      render(<VendorCategoryBadge vendor={mockVendor} />);

      expect(screen.getByText('Civil & Structural Works')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
      expect(screen.getByText('General Contracting')).toBeInTheDocument();
    });

    it('displays Catalogue Baseline Set badge when catalogue rates have been submitted', () => {
      const vendorWithRates: ManagedVendor = {
        ...mockVendor,
        catalogueStatus: {
          hasSubmittedPrices: true,
          intimationSent: false,
        },
      };

      render(<VendorCategoryBadge vendor={vendorWithRates} />);
      expect(screen.getByText('Catalogue Baseline Set')).toBeInTheDocument();
    });
  });

  describe('3. VendorCredibilityDrawer: Tab Navigation', () => {
    it('renders both tabs and switches to Standard BOQ Catalogue Pricing tab', () => {
      render(
        <VendorCredibilityDrawer
          isOpen
          vendor={mockVendor}
          onClose={jest.fn()}
          projectCategories={mockProjectCategories}
          onSaveCataloguePrices={jest.fn()}
        />
      );

      // Both tabs visible
      expect(screen.getByText(UI_STRINGS.vendorManagement.tabGeneralEvaluation)).toBeInTheDocument();
      expect(screen.getByText(UI_STRINGS.vendorManagement.tabCataloguePricing)).toBeInTheDocument();

      // Switch to Catalogue tab
      const catalogueTabBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.tabCataloguePricing, 'i'),
      });
      fireEvent.click(catalogueTabBtn);

      // Standard BOQ Catalogue Pricing contents are displayed
      expect(screen.getByText(UI_STRINGS.vendorManagement.rfqIsolationNotice)).toBeInTheDocument();
      expect(screen.getByText(UI_STRINGS.vendorManagement.rfqIsolationDescription)).toBeInTheDocument();
    });
  });

  describe('4. VendorCataloguePricingTab: Strict RFQ Isolation & Rate Commits', () => {
    it('displays BOQ line items for all assigned categories and computes variance vs benchmark', () => {
      const mockSave = jest.fn();
      const mockOpenIntimation = jest.fn();

      render(
        <VendorCataloguePricingTab
          vendor={mockVendor}
          projectCategories={mockProjectCategories}
          onSaveCataloguePrices={mockSave}
          onOpenIntimationModal={mockOpenIntimation}
        />
      );

      // Isolation banner
      expect(screen.getByText(UI_STRINGS.vendorManagement.rfqIsolationNotice)).toBeInTheDocument();

      // BOQ line items from both assigned categories: CIV-001 and INT-001
      expect(screen.getByText('CIV-001')).toBeInTheDocument();
      expect(screen.getByText('Ready-mix concrete M25 grade')).toBeInTheDocument();
      expect(screen.getByText('INT-001')).toBeInTheDocument();
      expect(screen.getByText('12mm extra-clear toughened glass partition')).toBeInTheDocument();

      // Find rate inputs
      const rateInputs = screen.getAllByPlaceholderText('0');
      expect(rateInputs.length).toBe(2);

      // Enter vendor rate: 4500 for CIV-001 (benchmark 4500 -> 0.0% variance)
      fireEvent.change(rateInputs[0], { target: { value: '4500' } });
      expect(screen.getByText('0.0%')).toBeInTheDocument();

      // Enter vendor rate: 4200 for CIV-001 (benchmark 4500 -> -6.7% variance)
      fireEvent.change(rateInputs[0], { target: { value: '4200' } });
      expect(screen.getByText('-6.7%')).toBeInTheDocument();

      // Enter invalid input (NaN fallback to 0)
      fireEvent.change(rateInputs[0], { target: { value: 'invalid' } });

      // Enter vendor rate: 4200 again
      fireEvent.change(rateInputs[0], { target: { value: '4200' } });

      // Enter vendor rate: 2500 for INT-001 (benchmark 2200 -> +13.6% variance)
      fireEvent.change(rateInputs[1], { target: { value: '2500' } });
      expect(screen.getByText('+13.6%')).toBeInTheDocument();

      // Click "Save & Commit Catalogue Rates"
      const saveButtons = screen.getAllByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.cataloguePricingSaveButton, 'i'),
      });
      fireEvent.click(saveButtons[0]);

      expect(mockSave).toHaveBeenCalledTimes(1);
      const savedMap = mockSave.mock.calls[0][1];
      expect(savedMap['CIV-001'].vendorPrice).toBe(4200);
      expect(savedMap['INT-001'].vendorPrice).toBe(2500);
      expect(screen.getByText(UI_STRINGS.vendorManagement.cataloguePricingSavedNotice)).toBeInTheDocument();
    });

    it('triggers intimation modal opening when clicking Send Intimation button', () => {
      const mockOpenIntimation = jest.fn();

      render(
        <VendorCataloguePricingTab
          vendor={mockVendor}
          projectCategories={mockProjectCategories}
          onSaveCataloguePrices={jest.fn()}
          onOpenIntimationModal={mockOpenIntimation}
        />
      );

      const sendBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.sendIntimationButton, 'i'),
      });
      fireEvent.click(sendBtn);

      expect(mockOpenIntimation).toHaveBeenCalledTimes(1);
    });

    it('filters standard BOQ items by category pills', () => {
      render(
        <VendorCataloguePricingTab
          vendor={mockVendor}
          projectCategories={mockProjectCategories}
          onSaveCataloguePrices={jest.fn()}
          onOpenIntimationModal={jest.fn()}
        />
      );

      // Filter by Civil
      const civilFilterBtn = screen.getByRole('button', { name: /Civil & Structural Works \(1\)/i });
      fireEvent.click(civilFilterBtn);
      expect(screen.getByText('CIV-001')).toBeInTheDocument();
      expect(screen.queryByText('INT-001')).not.toBeInTheDocument();

      // Switch back to All
      const allFilterBtn = screen.getByRole('button', { name: /All Categories \(2\)/i });
      fireEvent.click(allFilterBtn);
      expect(screen.getByText('CIV-001')).toBeInTheDocument();
      expect(screen.getByText('INT-001')).toBeInTheDocument();
    });

    it('allows editing assigned categories and commits changes', () => {
      const mockUpdateCats = jest.fn();

      render(
        <VendorCataloguePricingTab
          vendor={mockVendor}
          projectCategories={mockProjectCategories}
          onSaveCataloguePrices={jest.fn()}
          onOpenIntimationModal={jest.fn()}
          onUpdateCategories={mockUpdateCats}
        />
      );

      // Click Edit Assigned Categories
      fireEvent.click(screen.getByRole('button', { name: /Edit Assigned Categories/i }));
      expect(screen.getByText(/Select all procurement categories where/i)).toBeInTheDocument();

      // Toggle Civil off (it was in assigned categories)
      const civilToggleBtn = screen.getAllByRole('button', { name: /Civil & Structural Works/i })[0];
      fireEvent.click(civilToggleBtn);

      // Click Apply
      fireEvent.click(screen.getByRole('button', { name: /Apply Category Changes/i }));
      expect(mockUpdateCats).toHaveBeenCalledWith(mockVendor.id, ['Interior & Fitouts']);
    });

    it('displays empty state when vendor has no matching categories with standard BOQ', () => {
      const vendorWithOtherCat: ManagedVendor = {
        ...mockVendor,
        category: 'Elevators & Escalators',
        categories: ['Elevators & Escalators'],
      };

      render(
        <VendorCataloguePricingTab
          vendor={vendorWithOtherCat}
          projectCategories={mockProjectCategories}
          onSaveCataloguePrices={jest.fn()}
          onOpenIntimationModal={jest.fn()}
        />
      );

      expect(screen.getByRole('heading', { name: /No Standard BOQ Items Found/i })).toBeInTheDocument();
    });

    it('allows entering notes for items, prevents deselecting all categories, and renders with submitted status', () => {
      const mockSave = jest.fn();
      const vendorWithExistingPrices: ManagedVendor = {
        ...mockVendor,
        catalogueStatus: {
          intimationSent: true,
          intimationSentAt: '2026-09-15',
          intimationDaysAllowed: 7,
          hasSubmittedPrices: true,
          lastSubmittedAt: '2026-09-16 10:00',
        },
        cataloguePrices: {
          'CIV-001': {
            itemCode: 'CIV-001',
            itemDesc: 'Ready-mix concrete M25 grade',
            category: 'Civil & Structural Works',
            uom: 'Cum',
            masterBenchmarkRate: 4500,
            vendorPrice: 4300,
            variancePercent: -4.4,
            notes: 'Existing baseline note',
          },
        },
      };

      render(
        <VendorCataloguePricingTab
          vendor={vendorWithExistingPrices}
          projectCategories={mockProjectCategories}
          onSaveCataloguePrices={mockSave}
          onOpenIntimationModal={jest.fn()}
          onUpdateCategories={jest.fn()}
        />
      );

      // Verify status badge
      expect(screen.getByText(UI_STRINGS.vendorManagement.intimationStatusSubmitted)).toBeInTheDocument();

      // Enter notes for CIV-001
      const noteInput = screen.getAllByPlaceholderText(/Optional rate note/i)[0];
      fireEvent.change(noteInput, { target: { value: 'Grade A concrete with admixture' } });

      // Save and verify notes are in the saved payload
      const saveButtons = screen.getAllByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.cataloguePricingSaveButton, 'i'),
      });
      fireEvent.click(saveButtons[0]);

      expect(mockSave).toHaveBeenCalled();
      const savedMap = mockSave.mock.calls[0][1];
      expect(savedMap['CIV-001'].notes).toBe('Grade A concrete with admixture');

      // Edit categories and test that removing the last remaining category is prevented
      fireEvent.click(screen.getByRole('button', { name: /Edit Assigned Categories/i }));
      const civilBtn = screen.getAllByRole('button', { name: /Civil & Structural Works/i })[0];
      const intBtn = screen.getAllByRole('button', { name: /Interior & Fitouts/i })[0];
      // Deselect Interior
      fireEvent.click(intBtn);
      // Try to deselect Civil (which is the last category left)
      fireEvent.click(civilBtn);
      // Civil should still be selected. Now click Interior again to re-add it
      fireEvent.click(intBtn);
      fireEvent.click(screen.getByRole('button', { name: /Cancel Category Edit/i }));
    });

    it('renders with single category fallback and intimation-sent status without prices submitted', () => {
      const vendorWithIntimationSent: ManagedVendor = {
        ...mockVendor,
        categories: undefined,
        category: 'Civil & Structural Works',
        cataloguePrices: undefined,
        catalogueStatus: {
          intimationSent: true,
          intimationSentAt: '2026-09-15',
          intimationDaysAllowed: 14,
          hasSubmittedPrices: false,
        },
      };

      render(
        <VendorCataloguePricingTab
          vendor={vendorWithIntimationSent}
          projectCategories={mockProjectCategories}
          onSaveCataloguePrices={jest.fn()}
          onOpenIntimationModal={jest.fn()}
        />
      );

      expect(screen.getByText(/Intimation Sent on 2026-09-15/i)).toBeInTheDocument();
      expect(screen.getByText('CIV-001')).toBeInTheDocument();
      expect(screen.queryByText('INT-001')).not.toBeInTheDocument();
    });

    it('handles fallback defaults for empty categories, missing benchmark rate, and default intimation fields', () => {
      const vendorWithDefaults: ManagedVendor = {
        ...mockVendor,
        categories: undefined,
        category: '',
        cataloguePrices: {
          'INT-001': {
            itemCode: 'INT-001',
            itemDesc: '12mm extra-clear toughened glass partition',
            category: 'Interior & Fitouts',
            uom: 'Sqm',
            masterBenchmarkRate: 2200,
            vendorPrice: 2200,
            variancePercent: 0,
            notes: undefined,
          },
        },
        catalogueStatus: {
          intimationSent: true,
          intimationSentAt: undefined,
          intimationDaysAllowed: undefined,
          hasSubmittedPrices: false,
        },
      };

      const categoriesWithFallbackRate: BudgetCategory[] = [
        {
          ...mockProjectCategories[0],
          items: [
            {
              ...mockProjectCategories[0].items[0],
              benchmarkRate: (undefined as unknown as number),
              calculatedCost: 4500,
            },
          ],
        },
      ];

      render(
        <VendorCataloguePricingTab
          vendor={vendorWithDefaults}
          projectCategories={categoriesWithFallbackRate}
          onSaveCataloguePrices={jest.fn()}
          onOpenIntimationModal={jest.fn()}
        />
      );

      expect(screen.getByText(/Intimation Sent on Recent/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /No Standard BOQ Items Found/i })).toBeInTheDocument();
    });
  });

  describe('5. SendCatalogueIntimationModal: Submission Timelines', () => {
    it('allows choosing timeline (7, 14, 30 days) and dispatches intimation', () => {
      const mockSend = jest.fn();
      const mockClose = jest.fn();

      render(
        <SendCatalogueIntimationModal
          isOpen
          vendor={mockVendor}
          onClose={mockClose}
          onSend={mockSend}
        />
      );

      expect(screen.getByText(UI_STRINGS.vendorManagement.sendIntimationModalTitle)).toBeInTheDocument();
      expect(screen.getByText(mockVendor.name)).toBeInTheDocument();

      // Click 7 Days preset
      const days7Btn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.intimationDaysPreset7, 'i'),
      });
      fireEvent.click(days7Btn);

      // Click 14 Days preset
      const days14Btn = screen.getByText(UI_STRINGS.vendorManagement.intimationDaysPreset14);
      fireEvent.click(days14Btn);

      // Click 30 Days preset
      const days30Btn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.intimationDaysPreset30, 'i'),
      });
      fireEvent.click(days30Btn);

      // Enter notes
      const notesInput = screen.getByLabelText(
        new RegExp(UI_STRINGS.vendorManagement.intimationNotesLabel, 'i')
      );
      fireEvent.change(notesInput, { target: { value: 'Please review updated rates for Q3 civil items.' } });

      // Transmit intimation
      const transmitBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.intimationConfirmSendButton, 'i'),
      });
      fireEvent.click(transmitBtn);

      expect(mockSend).toHaveBeenCalledWith({
        vendorId: 'VND-TEST-001',
        deadlineDays: 30,
        customDeadline: undefined,
        notes: 'Please review updated rates for Q3 civil items.',
      });
    });

    it('allows selecting custom date deadline and validates properly', () => {
      const mockSend = jest.fn();
      const mockClose = jest.fn();

      render(
        <SendCatalogueIntimationModal
          isOpen
          vendor={mockVendor}
          onClose={mockClose}
          onSend={mockSend}
        />
      );

      // Click Custom Date preset
      const customBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.intimationDaysPresetCustom, 'i'),
      });
      fireEvent.click(customBtn);

      // Select a date
      const dateInput = screen.getByLabelText(
        new RegExp(UI_STRINGS.vendorManagement.intimationCustomDateLabel, 'i')
      );
      fireEvent.change(dateInput, { target: { value: '2026-10-15' } });

      // Transmit intimation
      const transmitBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.intimationConfirmSendButton, 'i'),
      });
      fireEvent.click(transmitBtn);

      expect(mockSend).toHaveBeenCalledWith({
        vendorId: 'VND-TEST-001',
        deadlineDays: 14,
        customDeadline: '2026-10-15',
        notes: undefined,
      });
    });

    it('displays error notice when validation fails on invalid payload', () => {
      const vendorWithInvalidId: ManagedVendor = {
        ...mockVendor,
        id: '',
      };

      render(
        <SendCatalogueIntimationModal
          isOpen
          vendor={vendorWithInvalidId}
          onClose={jest.fn()}
          onSend={jest.fn()}
        />
      );

      // Transmit intimation
      const transmitBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.intimationConfirmSendButton, 'i'),
      });
      fireEvent.click(transmitBtn);

      // Should show validation error banner
      expect(screen.getByText(/vendorId is required/i)).toBeInTheDocument();
    });

    it('auto-closes modal after successful transmission timer', () => {
      jest.useFakeTimers();
      const mockClose = jest.fn();

      render(
        <SendCatalogueIntimationModal
          isOpen
          vendor={mockVendor}
          onClose={mockClose}
          onSend={jest.fn()}
        />
      );

      const transmitBtn = screen.getByRole('button', {
        name: new RegExp(UI_STRINGS.vendorManagement.intimationConfirmSendButton, 'i'),
      });
      fireEvent.click(transmitBtn);

      expect(screen.getByText(/Intimation Transmitted!/i)).toBeInTheDocument();

      // Fast forward timer
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(mockClose).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });

    it('closes modal when cancel button or close icon is clicked, and renders nothing when isOpen is false', () => {
      const mockClose = jest.fn();
      const { rerender } = render(
        <SendCatalogueIntimationModal
          isOpen
          vendor={mockVendor}
          onClose={mockClose}
          onSend={jest.fn()}
        />
      );

      // Cancel button
      fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.common.cancel }));
      expect(mockClose).toHaveBeenCalledTimes(1);

      // Rerender as closed
      rerender(
        <SendCatalogueIntimationModal
          isOpen={false}
          vendor={mockVendor}
          onClose={mockClose}
          onSend={jest.fn()}
        />
      );
      expect(screen.queryByText(UI_STRINGS.vendorManagement.sendIntimationModalTitle)).not.toBeInTheDocument();
    });
  });

  describe('6. getVendorCatalogueBenchmark & calculateCatalogueVariance Utilities', () => {
    it('correctly calculates positive and negative variances vs benchmark', () => {
      expect(calculateCatalogueVariance(4200, 4500)).toBe(-6.7);
      expect(calculateCatalogueVariance(5000, 4000)).toBe(25);
      expect(calculateCatalogueVariance(4000, 4000)).toBe(0);
      expect(calculateCatalogueVariance(4000, 0)).toBe(0);
      expect(calculateCatalogueVariance(0, 4000)).toBe(0);
    });

    it('aggregates baseline rates across vendors who submitted catalogue prices', () => {
      const testVendors: ManagedVendor[] = [
        {
          ...mockVendor,
          id: 'VND-A',
          name: 'Alpha Contractors',
          cataloguePrices: {
            'CIV-001': {
              itemCode: 'CIV-001',
              itemDesc: 'Ready-mix concrete M25 grade',
              category: 'Civil & Structural Works',
              uom: 'Cum',
              masterBenchmarkRate: 4500,
              vendorPrice: 4200,
              variancePercent: -6.7,
            },
          },
        },
        {
          ...mockVendor,
          id: 'VND-B',
          name: 'Beta Infra',
          cataloguePrices: {
            'CIV-001': {
              itemCode: 'CIV-001',
              itemDesc: 'Ready-mix concrete M25 grade',
              category: 'Civil & Structural Works',
              uom: 'Cum',
              masterBenchmarkRate: 4500,
              vendorPrice: 4400,
              variancePercent: -2.2,
            },
          },
        },
        {
          ...mockVendor,
          id: 'VND-C',
          name: 'Gamma Without Prices',
          cataloguePrices: undefined,
        },
      ];

      const benchmark = getVendorCatalogueBenchmark('CIV-001', undefined, testVendors);
      expect(benchmark).not.toBeNull();
      expect(benchmark?.benchmarkRate).toBe(4300); // (4200 + 4400) / 2
      expect(benchmark?.minRate).toBe(4200);
      expect(benchmark?.maxRate).toBe(4400);
      expect(benchmark?.vendorCount).toBe(2);

      // Item not found
      expect(getVendorCatalogueBenchmark('NON-EXISTENT', undefined, testVendors)).toBeNull();

      // Filter by category
      expect(getVendorCatalogueBenchmark('CIV-001', 'Civil & Structural Works', testVendors)).not.toBeNull();
      expect(getVendorCatalogueBenchmark('CIV-001', 'Plumbing', testVendors)).toBeNull();
      expect(getVendorCatalogueBenchmark('', undefined, testVendors)).toBeNull();

      // Longer query containing item description
      expect(
        getVendorCatalogueBenchmark(
          'Supply of Ready-mix concrete M25 grade for foundation',
          'Civil & Structural Works',
          testVendors
        )
      ).not.toBeNull();
    });
  });

  describe('7. AI Costing Integration: refineBOQItemWithAI', () => {
    it('incorporates vendor catalogue baseline when refining a BOQ item', async () => {
      const result = await refineBOQItemWithAI({
        itemCode: 'CIV-001',
        currentDesc: 'Ready-mix concrete M25 grade',
        currentUom: 'Cum',
        currentQty: 50,
        currentBenchmarkRate: 4500,
        userInputSpecs: 'Upgrade with silica fume and anti-crack polypropylene fibers',
        categoryHint: 'Civil & Structural Works',
      });

      expect(result.refinedCode).toBe('CIV-001');
      expect(result.refinedBenchmarkRate).toBeGreaterThan(4500);
      expect(result.refinedDesc).toContain('silica fume');
      expect(result.aiRationale).toBeDefined();
    });
  });
});
