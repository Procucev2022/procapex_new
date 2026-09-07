import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PPOModule } from '@/components/PPOModule';
import { useProcurement } from '@/context/ProcurementContext';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('PPOModule Component', () => {
  const mockApproveTier1 = jest.fn();
  const mockApproveTier2 = jest.fn();
  const mockApproveTier3AndReleasePO = jest.fn();
  const mockApprovePPO = jest.fn();
  const mockOnOpenCreatePPO = jest.fn();

  const sampleTenant = {
    name: 'L&T Construction',
    project: 'Terminal 1',
    team: {
      CATEGORY_MANAGER_2: { name: 'Rajesh Singhania' },
      PROJECT_HEAD_PR: { name: 'Anil Kulkarni' },
      FINANCE_HEAD: { name: 'Sunil Deshmukh' },
    },
  };

  const samplePPOs = [
    {
      id: 'PPO-2026-0015',
      prId: 'PR-2026-0005',
      vendor: 'DesignCraft Millworks',
      itemDesc: 'Reception Counter',
      grandTotal: 175230,
      status: 'PENDING_TIER_1',
    },
    {
      id: 'PPO-2026-0012',
      prId: 'PR-2026-0002',
      vendor: 'Vertex Infratech',
      itemDesc: 'Concrete M30',
      grandTotal: 450000,
      status: 'APPROVED_PO_ISSUED',
    },
  ];

  const samplePOs = [
    {
      id: 'PO-2026-0089',
      ppoRef: 'PPO-2026-0015',
      vendor: 'DesignCraft Millworks',
      amount: 175230,
      issueDate: '2026-09-07',
      status: 'ISSUED',
    },
    {
      id: 'PO-2026-0090',
      ppoRef: '',
      vendor: 'Fallback Vendor',
      grandTotal: 10000,
      status: 'ISSUED',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      ppos: samplePPOs,
      pos: samplePOs,
      activeTenant: sampleTenant,
      tier1Approved: false,
      tier2Approved: false,
      tier3Approved: false,
      poReleased: false,
      approveTier1: mockApproveTier1,
      approveTier2: mockApproveTier2,
      approveTier3AndReleasePO: mockApproveTier3AndReleasePO,
      approvePPO: mockApprovePPO,
    });
  });

  it('renders workflow subtab with Tier 1 in progress', () => {
    render(<PPOModule onOpenCreatePPO={mockOnOpenCreatePPO} />);

    expect(screen.getByText('Multi-Tier PPO Approval & Purchase Order Release')).toBeInTheDocument();
    expect(screen.getByText('TIER 1 IN PROGRESS')).toBeInTheDocument();

    const tier1Btn = screen.getByRole('button', { name: /Sign-off Tier 1/i });
    fireEvent.click(tier1Btn);
    expect(mockApproveTier1).toHaveBeenCalled();
  });

  it('renders Tier 2 in progress when Tier 1 is approved', () => {
    (useProcurement as jest.Mock).mockReturnValue({
      ppos: samplePPOs,
      pos: samplePOs,
      activeTenant: sampleTenant,
      tier1Approved: true,
      tier2Approved: false,
      tier3Approved: false,
      poReleased: false,
      approveTier1: mockApproveTier1,
      approveTier2: mockApproveTier2,
      approveTier3AndReleasePO: mockApproveTier3AndReleasePO,
      approvePPO: mockApprovePPO,
    });

    render(<PPOModule />);

    expect(screen.getByText('TIER 2 IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('Signed by Rajesh Singhania')).toBeInTheDocument();

    const tier2Btn = screen.getByRole('button', { name: /Sign-off Tier 2/i });
    fireEvent.click(tier2Btn);
    expect(mockApproveTier2).toHaveBeenCalled();
  });

  it('renders Tier 3 in progress when Tier 2 is approved', () => {
    (useProcurement as jest.Mock).mockReturnValue({
      ppos: samplePPOs,
      pos: samplePOs,
      activeTenant: sampleTenant,
      tier1Approved: true,
      tier2Approved: true,
      tier3Approved: false,
      poReleased: false,
      approveTier1: mockApproveTier1,
      approveTier2: mockApproveTier2,
      approveTier3AndReleasePO: mockApproveTier3AndReleasePO,
      approvePPO: mockApprovePPO,
    });

    render(<PPOModule />);

    expect(screen.getByText('TIER 3 IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('Signed by Anil Kulkarni')).toBeInTheDocument();

    const tier3Btn = screen.getByRole('button', { name: /Release Purchase Order/i });
    fireEvent.click(tier3Btn);
    expect(mockApproveTier3AndReleasePO).toHaveBeenCalled();
  });

  it('renders PO Released state with download banner when poReleased is true', () => {
    (useProcurement as jest.Mock).mockReturnValue({
      ppos: samplePPOs,
      pos: samplePOs,
      activeTenant: { ...sampleTenant, team: {} },
      tier1Approved: true,
      tier2Approved: true,
      tier3Approved: true,
      poReleased: true,
      approveTier1: mockApproveTier1,
      approveTier2: mockApproveTier2,
      approveTier3AndReleasePO: mockApproveTier3AndReleasePO,
      approvePPO: mockApprovePPO,
    });

    render(<PPOModule />);

    expect(screen.getByText('PO RELEASED')).toBeInTheDocument();
    expect(screen.getByText('Signed by Sunil Deshmukh')).toBeInTheDocument();

    const downloadBannerBtn = screen.getByRole('button', { name: /Download Official PO-2026-0089 PDF/i });
    fireEvent.click(downloadBannerBtn);
  });

  it('switches to All PPOs subtab and handles create PPO and approve PPO actions', () => {
    render(<PPOModule onOpenCreatePPO={mockOnOpenCreatePPO} />);

    const ppoTabBtn = screen.getByRole('button', { name: /All PPOs/i });
    fireEvent.click(ppoTabBtn);

    expect(screen.getByText('Purchase Price Offers (PPOs)')).toBeInTheDocument();
    expect(screen.getByText('PPO-2026-0015')).toBeInTheDocument();

    const createPpoBtn = screen.getByRole('button', { name: /Create PPO/i });
    fireEvent.click(createPpoBtn);
    expect(mockOnOpenCreatePPO).toHaveBeenCalled();

    const approveBtn = screen.getByRole('button', { name: /Approve PPO/i });
    fireEvent.click(approveBtn);
    expect(mockApprovePPO).toHaveBeenCalledWith('PPO-2026-0015');

    // Click back to 3-Tier Approval Workflow tab
    const workflowBtn = screen.getByRole('button', { name: /3-Tier Approval Workflow/i });
    fireEvent.click(workflowBtn);
  });

  it('switches to Issued POs subtab and downloads PO PDF including fallbacks', () => {
    render(<PPOModule />);

    const poTabBtn = screen.getByRole('button', { name: /Issued POs/i });
    fireEvent.click(poTabBtn);

    expect(screen.getByText('Released Purchase Orders / Work Orders')).toBeInTheDocument();
    expect(screen.getByText('PO-2026-0089')).toBeInTheDocument();

    const downloadButtons = screen.getAllByRole('button', { name: /Download PDF PO/i });
    // First PO with valid amount and date
    fireEvent.click(downloadButtons[0]);
    // Second PO testing fallback values
    fireEvent.click(downloadButtons[1]);
  });
});
