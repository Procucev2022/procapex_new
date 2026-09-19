import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PRHistoryTable } from '@/components/pr-history/PRHistoryTable';
import { RFQCirculationHistoryTable } from '@/components/category-manager/RFQCirculationHistoryTable';
import { ProcurementProvider, useProcurement } from '@/context/ProcurementContext';
import type { PurchaseRequest, VendorRFQItem } from '@/types';

const MOCK_PRS: PurchaseRequest[] = [
  {
    id: 'PR-2026-0005',
    title: 'Fabrication of Reception Counter',
    projectName: 'Metro Line 4 Underground',
    costCentre: 'CC-104',
    category: 'Interior & Fitouts',
    requester: 'Rahul Verma',
    reqDate: '2026-09-25',
    remarks: 'Preferred Vendors: VND-001',
    nominatedVendors: ['VND-001', 'VND-002'],
    deliveryAddress: 'Site 101',
    status: 'SUBMITTED',
    items: [
      {
        code: 'ITEM-1',
        desc: 'Custom Counter Desk',
        uom: 'Nos',
        qty: 2,
        rateCard: 15000,
        benchmark: 14000,
      },
    ],
  },
  {
    id: 'PR-2026-0006',
    title: 'Supply of Toughened Glass Partitions',
    projectName: 'Godrej Woods, Tower C',
    costCentre: 'CC-108',
    category: 'Glazing & Façade',
    requester: 'Sunil Mehta',
    reqDate: '2026-09-28',
    remarks: 'Preferred Vendors: VND-005',
    nominatedVendors: ['VND-005'],
    deliveryAddress: 'Tower C Lobby',
    status: 'APPROVED',
    items: [
      {
        code: 'ITEM-2',
        desc: '12mm Toughened Glass Panel',
        uom: 'Sqm',
        qty: 50,
        rateCard: 3200,
        benchmark: 3000,
      },
    ],
  },
];

const MOCK_CIRCULATED_RFQS: Record<string, VendorRFQItem> = {
  'PR-2026-0005': {
    id: 'RFQ-2026-0005',
    prId: 'PR-2026-0005',
    title: 'Fabrication of Reception Counter',
    projectName: 'Metro Line 4 Underground',
    category: 'Interior & Fitouts',
    closureDate: '2026-09-25',
    site: 'Site 101',
    invitedVendors: ['VND-001', 'VND-002'],
    status: 'PENDING',
    itemsCount: 1,
    items: [],
  },
};

describe('Requisition Pipeline & PR History Integration', () => {
  it('renders all PRs in PRHistoryTable with correct items count and baseline', () => {
    const onSelectPRForBOQ = jest.fn();
    const onApprovePR = jest.fn();
    const onStartNewPR = jest.fn();

    render(
      <PRHistoryTable
        prs={MOCK_PRS}
        circulatedRFQs={MOCK_CIRCULATED_RFQS}
        onSelectPRForBOQ={onSelectPRForBOQ}
        onApprovePR={onApprovePR}
        onStartNewPR={onStartNewPR}
      />
    );

    expect(screen.getByText(/2 Packages in Registry/i)).toBeInTheDocument();
    expect(screen.getByText('PR-2026-0005')).toBeInTheDocument();
    expect(screen.getByText('PR-2026-0006')).toBeInTheDocument();
    expect(screen.getByText('Fabrication of Reception Counter')).toBeInTheDocument();
    expect(screen.getByText('Supply of Toughened Glass Partitions')).toBeInTheDocument();

    // Check Tender Circulated badge on PR-2026-0005
    expect(screen.getByText(/Tender Circulated \(RFQ-2026-0005\)/i)).toBeInTheDocument();

    // Trigger Approve on submitted PR
    const approveButton = screen.getByRole('button', { name: /Approve/i });
    fireEvent.click(approveButton);
    expect(onApprovePR).toHaveBeenCalledWith('PR-2026-0005');

    // Trigger Open in RFQ Hub
    const openButtons = screen.getAllByRole('button', { name: /Open in RFQ Hub/i });
    fireEvent.click(openButtons[0]);
    expect(onSelectPRForBOQ).toHaveBeenCalledWith('PR-2026-0005');

    // Trigger Raise New PR
    const raiseNewBtn = screen.getByRole('button', { name: /New BOQ Package/i });
    fireEvent.click(raiseNewBtn);
    expect(onStartNewPR).toHaveBeenCalledTimes(1);
  });

  it('filters PRs by search term and category dropdown', () => {
    render(
      <PRHistoryTable
        prs={MOCK_PRS}
        circulatedRFQs={MOCK_CIRCULATED_RFQS}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search by Package ID, Title, Project/i);
    fireEvent.change(searchInput, { target: { value: 'Glass' } });

    expect(screen.queryByText('Fabrication of Reception Counter')).not.toBeInTheDocument();
    expect(screen.getByText('Supply of Toughened Glass Partitions')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Fabrication of Reception Counter')).toBeInTheDocument();

    // Filter by Category
    const categorySelect = screen.getByDisplayValue(/All Categories/i);
    fireEvent.change(categorySelect, { target: { value: 'Interior & Fitouts' } });
    expect(screen.getByText('Fabrication of Reception Counter')).toBeInTheDocument();
    expect(screen.queryByText('Supply of Toughened Glass Partitions')).not.toBeInTheDocument();
  });
});

describe('RFQ Tender Circulation History Integration', () => {
  it('renders all circulated RFQs and handles selection & commercial tab navigation', () => {
    const onSelectPR = jest.fn();
    const onOpenCommercialTab = jest.fn();

    render(
      <RFQCirculationHistoryTable
        circulatedRFQs={MOCK_CIRCULATED_RFQS}
        prs={MOCK_PRS}
        activePRId="PR-2026-0005"
        onSelectPR={onSelectPR}
        onOpenCommercialTab={onOpenCommercialTab}
      />
    );

    expect(screen.getByText(/Tender RFQ Circulation Registry/i)).toBeInTheDocument();
    expect(screen.getByText('RFQ-2026-0005')).toBeInTheDocument();

    const openWorkspaceBtns = screen.getAllByRole('button', { name: /Open Workspace/i });
    fireEvent.click(openWorkspaceBtns[0]);
    expect(onOpenCommercialTab).toHaveBeenCalledWith('PR-2026-0005');
  });
});

describe('Procurement Context Transaction & Persistence Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records audit logs and negotiation events on vendor quote submission', () => {
    const TestConsumer: React.FC = () => {
      const {
        prs,
        createPR,
        submitVendorQuote,
        auditLogs,
        negotiations,
      } = useProcurement();

      return (
        <div>
          <div data-testid="prs-count">{prs.length}</div>
          <div data-testid="audit-count">{auditLogs.length}</div>
          <div data-testid="neg-count">{negotiations['PR-2026-0005']?.length || 0}</div>
          <button
            type="button"
            data-testid="create-pr-btn"
            onClick={() =>
              createPR({
                id: 'PR-2026-0006',
                title: 'New Site Electrical Works',
                projectName: 'Metro Line 4 Underground',
                costCentre: 'CC-109',
                category: 'Electrical & MEP',
                requester: 'Rahul Verma',
                reqDate: '2026-10-01',
                remarks: 'Urgent',
                nominatedVendors: ['VND-001'],
                deliveryAddress: 'Site Hub',
                items: [
                  {
                    code: 'ELEC-01',
                    desc: 'Power Distribution Panel',
                    uom: 'Nos',
                    qty: 2,
                    rateCard: 45000,
                    benchmark: 42000,
                  },
                ],
              })
            }
          >
            Create PR
          </button>
          <button
            type="button"
            data-testid="submit-quote-btn"
            onClick={() =>
              submitVendorQuote?.(
                'PR-2026-0005',
                'VND-001',
                1,
                150000,
                'Formal 1st Round Bidding'
              )
            }
          >
            Submit Quote
          </button>
        </div>
      );
    };

    render(
      <ProcurementProvider>
        <TestConsumer />
      </ProcurementProvider>
    );

    expect(screen.getByTestId('prs-count')).toHaveTextContent('4');

    // Create a new PR
    act(() => {
      fireEvent.click(screen.getByTestId('create-pr-btn'));
    });
    expect(screen.getByTestId('prs-count')).toHaveTextContent('5');

    // Submit a vendor quote
    act(() => {
      fireEvent.click(screen.getByTestId('submit-quote-btn'));
    });

    expect(parseInt(screen.getByTestId('neg-count').textContent || '0', 10)).toBeGreaterThan(0);
    expect(parseInt(screen.getByTestId('audit-count').textContent || '0', 10)).toBeGreaterThan(0);

    // Verify localStorage persistence
    const savedPrs = JSON.parse(localStorage.getItem('procapex_prs_v1') || '[]');
    expect(savedPrs.some((p: PurchaseRequest) => p.id === 'PR-2026-0006')).toBe(true);
  });
});
