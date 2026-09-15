import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProcurementProvider } from '@/context/ProcurementContext';
import { VendorManagementModule } from '@/components/vendor-management';
import { UI_STRINGS } from '@/constants';

describe('VendorManagementModule Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModule = () =>
    render(
      <ProcurementProvider>
        <VendorManagementModule />
      </ProcurementProvider>
    );

  it('renders title, KPI cards, and directory table headers', () => {
    renderModule();

    expect(screen.getByText(UI_STRINGS.vendorManagement.title)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.vendorManagement.kpiTotalVendors)).toBeInTheDocument();
    expect(screen.getAllByText(UI_STRINGS.vendorManagement.kpiClientOnboarded).length).toBeGreaterThan(0);
    expect(screen.getAllByText(UI_STRINGS.vendorManagement.kpiProcapxNetwork).length).toBeGreaterThan(0);
    expect(screen.getByText(UI_STRINGS.vendorManagement.downloadTemplateButton)).toBeInTheDocument();
  });

  it('visually distinguishes Client Onboarded Vendors from ProCPX Network Vendors with badges', () => {
    const { container } = renderModule();
    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();

    // Verify presence of both Client Onboarded and ProCPX Platform badges in table rows
    const clientBadges = tbody!.querySelectorAll('.bg-emerald-600');
    const procapxBadges = tbody!.querySelectorAll('.bg-sky-600');

    expect(clientBadges.length).toBeGreaterThan(0);
    expect(procapxBadges.length).toBeGreaterThan(0);
  });

  it('filters directory by vendor source (All, Client Only, ProCPX Only)', () => {
    const { container } = renderModule();
    const tbody = () => container.querySelector('tbody')!;

    // Click "Client Onboarded Only" filter
    const clientFilterBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.filterClientOnly, 'i'),
    });
    fireEvent.click(clientFilterBtn);

    expect(tbody().querySelectorAll('.bg-emerald-600').length).toBeGreaterThan(0);
    expect(tbody().querySelectorAll('.bg-sky-600').length).toBe(0);

    // Click "ProCPX Platform Network" filter
    const procapxFilterBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.filterProcapxOnly, 'i'),
    });
    fireEvent.click(procapxFilterBtn);

    expect(tbody().querySelectorAll('.bg-sky-600').length).toBeGreaterThan(0);
    expect(tbody().querySelectorAll('.bg-emerald-600').length).toBe(0);
  });

  it('opens evaluation modal and submits computed vendor rating', () => {
    renderModule();

    // Find first Evaluate button
    const evalButtons = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.actionEvaluate, 'i'),
    });
    fireEvent.click(evalButtons[0]);

    // Modal title should appear
    expect(screen.getByText(UI_STRINGS.vendorManagement.evaluationModalTitle)).toBeInTheDocument();

    // Submit evaluation
    const submitBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.submitEvaluationButton, 'i'),
    });
    fireEvent.click(submitBtn);

    // Modal closes
    expect(screen.queryByText(UI_STRINGS.vendorManagement.evaluationModalTitle)).not.toBeInTheDocument();
  });

  it('opens PPO rating modal and records operational performance', () => {
    renderModule();

    const ratePPOButtons = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.actionRatePPO, 'i'),
    });
    fireEvent.click(ratePPOButtons[0]);

    expect(screen.getByText(UI_STRINGS.vendorManagement.ppoRatingModalTitle)).toBeInTheDocument();

    const submitRatingBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.submitRatingButton, 'i'),
    });
    fireEvent.click(submitRatingBtn);

    expect(screen.queryByText(UI_STRINGS.vendorManagement.ppoRatingModalTitle)).not.toBeInTheDocument();
  });

  it('opens quick add vendor modal and onboards a new client contractor', () => {
    renderModule();

    const quickAddBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.quickAddButton, 'i'),
    });
    fireEvent.click(quickAddBtn);

    expect(screen.getByText(UI_STRINGS.vendorManagement.quickAddModalTitle)).toBeInTheDocument();

    // Fill form
    const nameInput = screen.getByPlaceholderText(/BuildWell Civil Infrastructure/i);
    fireEvent.change(nameInput, { target: { value: 'Delta Precast Structures Ltd' } });

    const gstinInput = screen.getByPlaceholderText(/27AABCS1234F1Z9/i);
    fireEvent.change(gstinInput, { target: { value: '27AABCD9999F1Z0' } });

    const contactInput = screen.getByPlaceholderText(/Key Account Manager name/i);
    fireEvent.change(contactInput, { target: { value: 'Sunil Mehta' } });

    // Submit
    const onboardBtn = screen.getByRole('button', { name: /Onboard Client Vendor/i });
    fireEvent.click(onboardBtn);

    // Modal closes and new vendor is listed
    expect(screen.queryByText(UI_STRINGS.vendorManagement.quickAddModalTitle)).not.toBeInTheDocument();
    expect(screen.getAllByText('Delta Precast Structures Ltd').length).toBeGreaterThan(0);
  });

  it('switches to category credibility evaluation tab and displays specialized technical fields', () => {
    renderModule();

    // Find first Evaluate button
    const evalButtons = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.actionEvaluate, 'i'),
    });
    fireEvent.click(evalButtons[0]);

    // Click Category Evaluation Tab
    const categoryTabBtn = screen.getByRole('button', {
      name: new RegExp(UI_STRINGS.vendorManagement.tabCategoryEvaluation, 'i'),
    });
    fireEvent.click(categoryTabBtn);

    // Verify presence of specialized category sections (e.g. OEM Dealerships or Carpenters count)
    const hasOEMSection = screen.queryByText(new RegExp(UI_STRINGS.vendorManagement.oemDealershipsTitle, 'i'));
    const hasCarpentersSection = screen.queryByText(new RegExp(UI_STRINGS.vendorManagement.carpentersCountLabel, 'i'));
    expect(hasOEMSection || hasCarpentersSection).toBeTruthy();
  });

  it('opens vendor credibility dossier drawer and displays verified client references', () => {
    renderModule();

    // Find and click View Dossier button (eye icon)
    const dossierButtons = screen.getAllByTitle(/View Credibility Dossier/i);
    fireEvent.click(dossierButtons[0]);

    // Drawer opens
    expect(screen.getByText(UI_STRINGS.vendorManagement.viewProfileDrawerTitle)).toBeInTheDocument();

    // Close drawer
    const closeBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.common.close, 'i') });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(UI_STRINGS.vendorManagement.viewProfileDrawerTitle)).not.toBeInTheDocument();
  });
});

