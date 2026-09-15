import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { VendorPortal } from '@/components/VendorPortal';
import { VendorManagementModule } from '@/components/vendor-management/VendorManagementModule';
import { ProcurementProvider } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

describe('Vendor Onboarding & Login Page Integration (welcome / welcome)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.sessionStorage.clear();
  });

  it('renders vendor login page by default in vendor role with credentials hint', () => {
    render(
      <ProcurementProvider>
        <VendorPortal />
      </ProcurementProvider>
    );

    // Login Gate is displayed
    expect(screen.getByText(UI_STRINGS.vendorPortal.loginTitle)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.vendorPortal.loginSubtitle)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.vendorPortal.loginHint)).toBeInTheDocument();

    // Inputs present
    expect(screen.getByLabelText(UI_STRINGS.vendorPortal.loginUserIdLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(UI_STRINGS.vendorPortal.loginPasswordLabel)).toBeInTheDocument();

    // Rao Interior works is pre-seeded and listed in company dropdown
    const select = screen.getByTestId('vendor-company-select');
    expect(select).toBeInTheDocument();
    expect(screen.getByText(/Rao Interior works/i)).toBeInTheDocument();
  });

  it('rejects wrong credentials and accepts welcome / welcome for Rao Interior works', async () => {
    render(
      <ProcurementProvider>
        <VendorPortal />
      </ProcurementProvider>
    );

    // Select Rao Interior works
    const companySelect = screen.getByTestId('vendor-company-select');
    fireEvent.change(companySelect, { target: { value: 'CLT-VND-003' } });

    // Enter wrong credentials
    const userInput = screen.getByLabelText(UI_STRINGS.vendorPortal.loginUserIdLabel);
    const passInput = screen.getByLabelText(UI_STRINGS.vendorPortal.loginPasswordLabel);
    fireEvent.change(userInput, { target: { value: 'invalid_user' } });
    fireEvent.change(passInput, { target: { value: 'wrong_pass' } });

    fireEvent.click(screen.getByTestId('vendor-login-submit'));
    expect(screen.getByText(UI_STRINGS.vendorPortal.loginError)).toBeInTheDocument();

    // Enter valid credentials: userid: welcome, password: welcome
    fireEvent.change(userInput, { target: { value: 'welcome' } });
    fireEvent.change(passInput, { target: { value: 'welcome' } });
    fireEvent.click(screen.getByTestId('vendor-login-submit'));

    // Portal dashboard unlocked immediately
    expect(screen.getByText(UI_STRINGS.vendorPortal.roleBadge)).toBeInTheDocument();

    // Verify Rao Interior works is active in portal
    expect(screen.getAllByText(/Rao Interior works/i).length).toBeGreaterThan(0);
    expect(screen.getByText(UI_STRINGS.vendorPortal.sessionActiveBadge)).toBeInTheDocument();

    // Sign out returns to login gate
    fireEvent.click(screen.getByTestId('vendor-logout-button'));
    expect(screen.getByText(UI_STRINGS.vendorPortal.loginTitle)).toBeInTheDocument();
  });

  it('displays credentials alert banner when vendor is onboarded in VendorManagementModule', () => {
    const handleRoute = jest.fn();

    render(
      <ProcurementProvider>
        <VendorManagementModule onRouteToVendorPortal={handleRoute} />
      </ProcurementProvider>
    );

    // Open Quick Add Modal
    fireEvent.click(screen.getByRole('button', { name: UI_STRINGS.vendorManagement.quickAddButton }));

    // Fill form
    fireEvent.change(screen.getByLabelText(/Company \/ Contractor Name/i), {
      target: { value: 'Elite Spaces Fitouts Pvt Ltd' },
    });
    fireEvent.change(screen.getByLabelText(/Procurement Category/i), {
      target: { value: 'Interior & Fitouts' },
    });
    fireEvent.change(screen.getByLabelText(/GSTIN/i), {
      target: { value: '27AABCU9603R1ZM' },
    });
    fireEvent.change(screen.getByLabelText(/Contact Representative/i), {
      target: { value: 'Anand Verma' },
    });
    fireEvent.change(screen.getByLabelText(/Corporate Email/i), {
      target: { value: 'anand@elitespaces.in' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '+91 98200 44556' },
    });
    fireEvent.change(screen.getByLabelText(/Operating City/i), {
      target: { value: 'Mumbai, Maharashtra' },
    });
    fireEvent.change(screen.getByLabelText(/Operating Region/i), {
      target: { value: 'WEST' },
    });

    // Submit quick add
    fireEvent.click(screen.getByRole('button', { name: /Onboard Client Vendor/i }));

    // Check alert banner with welcome / welcome credentials
    const alertBanner = screen.getByTestId('vendor-onboarded-alert');
    expect(alertBanner).toBeInTheDocument();
    expect(within(alertBanner).getByText(/Elite Spaces Fitouts Pvt Ltd/i)).toBeInTheDocument();
    expect(within(alertBanner).getByText(/User ID: welcome/i)).toBeInTheDocument();
    expect(within(alertBanner).getByText(/Password: welcome/i)).toBeInTheDocument();

    // Click Go to Vendor Login Portal
    const openLoginBtn = screen.getByTestId('open-vendor-login-gate');
    fireEvent.click(openLoginBtn);
    expect(handleRoute).toHaveBeenCalledTimes(1);
  });
});
