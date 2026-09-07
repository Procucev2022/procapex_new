import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PRApprovalQueue } from '@/components/PRApprovalQueue';
import { useProcurement } from '@/context/ProcurementContext';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('PRApprovalQueue Component', () => {
  const mockApprovePRByProjectHead = jest.fn();
  const mockSetActiveRole = jest.fn();
  const mockOnRouteToCategoryManager = jest.fn();

  const samplePRs = [
    {
      id: 'PR-2026-0001',
      title: 'Structural Steel Package',
      projectName: 'Terminal 1',
      requester: 'John Doe',
      costCentre: 'CC-STR-01',
      items: [{ code: 'STL-01' }, { code: 'STL-02' }],
      status: 'SUBMITTED',
    },
    {
      id: 'PR-2026-0002',
      title: 'HVAC Package',
      projectName: 'Terminal 1',
      requester: 'Jane Smith',
      costCentre: 'CC-MEP-02',
      items: [],
      status: 'APPROVED_BY_PROJECT_HEAD',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useProcurement as jest.Mock).mockReturnValue({
      prs: samplePRs,
      activeTenant: { name: 'L&T Infra' },
      approvePRByProjectHead: mockApprovePRByProjectHead,
      setActiveRole: mockSetActiveRole,
    });
  });

  it('renders pending PR approvals queue with correct count and status badges', () => {
    render(<PRApprovalQueue onRouteToCategoryManager={mockOnRouteToCategoryManager} />);

    expect(screen.getByText('Purchase Request Review & Authorization Inbox')).toBeInTheDocument();
    expect(screen.getByText('1 Requisition Awaiting Authorization')).toBeInTheDocument();
    expect(screen.getByText('Structural Steel Package')).toBeInTheDocument();
    expect(screen.getByText('PENDING REVIEW')).toBeInTheDocument();
    expect(screen.getByText('APPROVED_BY_PROJECT_HEAD')).toBeInTheDocument();
    expect(screen.getByText('Authorized & Routed')).toBeInTheDocument();
  });

  it('approves a pending PR and routes to category manager when callback is provided', () => {
    render(<PRApprovalQueue onRouteToCategoryManager={mockOnRouteToCategoryManager} />);

    const approveBtn = screen.getByRole('button', { name: /Approve PR & Route to Category Manager/i });
    fireEvent.click(approveBtn);

    expect(mockApprovePRByProjectHead).toHaveBeenCalledWith('PR-2026-0001');
    expect(mockSetActiveRole).toHaveBeenCalledWith('CATEGORY_MANAGER');
    expect(mockOnRouteToCategoryManager).toHaveBeenCalled();
  });

  it('approves a pending PR gracefully when onRouteToCategoryManager is omitted', () => {
    render(<PRApprovalQueue />);

    const approveBtn = screen.getByRole('button', { name: /Approve PR & Route to Category Manager/i });
    fireEvent.click(approveBtn);

    expect(mockApprovePRByProjectHead).toHaveBeenCalledWith('PR-2026-0001');
    expect(mockSetActiveRole).toHaveBeenCalledWith('CATEGORY_MANAGER');
  });

  it('displays plural "Requisitions" when pending count is not 1', () => {
    (useProcurement as jest.Mock).mockReturnValue({
      prs: [
        { id: 'PR-1', status: 'SUBMITTED' },
        { id: 'PR-2', status: 'SUBMITTED' },
      ],
      activeTenant: { name: 'Tata Projects' },
      approvePRByProjectHead: mockApprovePRByProjectHead,
      setActiveRole: mockSetActiveRole,
    });

    render(<PRApprovalQueue />);
    expect(screen.getByText('2 Requisitions Awaiting Authorization')).toBeInTheDocument();
  });
});
