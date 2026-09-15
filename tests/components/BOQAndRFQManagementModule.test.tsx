import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BOQAndRFQManagementModule } from '@/components/BOQAndRFQManagementModule';
import { UI_STRINGS } from '@/constants';

jest.mock('@/components/PRModule', () => ({
  PRModule: ({ onNavigateToBOQ, onOpenNewPRModal }: { onNavigateToBOQ?: (id: string) => void; onOpenNewPRModal?: () => void }) => (
    <div data-testid="pr-module-mock">
      <span>Mock PRModule Content</span>
      <button onClick={() => onNavigateToBOQ?.('PR-001')}>Navigate to RFQ</button>
      <button onClick={() => onOpenNewPRModal?.()}>Open PR Modal</button>
    </div>
  ),
}));

jest.mock('@/components/CategoryManagerHub', () => ({
  CategoryManagerHub: ({ onRouteToPPO, onRouteToNegotiation }: { onRouteToPPO?: () => void; onRouteToNegotiation?: () => void }) => (
    <div data-testid="cm-hub-mock">
      <span>Mock CategoryManagerHub Content</span>
      <button onClick={() => onRouteToPPO?.()}>Route To PPO</button>
      <button onClick={() => onRouteToNegotiation?.()}>Route To Neg</button>
    </div>
  ),
}));

const mockApprovePRByProjectHead = jest.fn();

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: () => ({
    prs: [
      {
        id: 'PR-2026-0005',
        title: 'Reception Counter Scope',
        projectName: 'Metro Line 4 Underground',
        requester: 'Rahul Verma',
        reqDate: '2026-09-25',
        costCentre: 'CC-104',
        category: 'Interior & Fitouts',
        status: 'SUBMITTED',
        items: [{ code: 'CNT-01', desc: 'Granite Counter', uom: 'Sqm', qty: 10, rateCard: 3500 }],
      },
      {
        id: 'PR-2026-0001',
        title: 'TMT Steel Fe500D',
        projectName: 'Metro Pier Cap',
        requester: 'Amit Sharma',
        reqDate: '2026-09-15',
        costCentre: 'CC-102',
        category: 'Steel',
        status: 'ACCEPTED',
        items: [{ code: 'STL-01', desc: 'Steel Bar', uom: 'Ton', qty: 50, rateCard: 54000 }],
      },
    ],
    approvePRByProjectHead: mockApprovePRByProjectHead,
  }),
}));

describe('BOQAndRFQManagementModule Component', () => {
  const mockOnOpenNewPRModal = jest.fn();
  const mockOnRouteToPPO = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header banner, combined badge, and sub-tab toggle buttons', () => {
    render(
      <BOQAndRFQManagementModule
        onOpenNewPRModal={mockOnOpenNewPRModal}
        onRouteToPPO={mockOnRouteToPPO}
      />
    );

    expect(screen.getByText(UI_STRINGS.boqAndRfqModule.title)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.boqAndRfqModule.subtitle)).toBeInTheDocument();
    expect(screen.getByText(UI_STRINGS.boqAndRfqModule.badgeCombinedRole)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: new RegExp(UI_STRINGS.boqAndRfqModule.tabBOQStudio, 'i') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(UI_STRINGS.boqAndRfqModule.tabRFQHub, 'i') })).toBeInTheDocument();

    // Default tab is boq_studio
    expect(screen.getByTestId('pr-module-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('cm-hub-mock')).not.toBeInTheDocument();
  });

  it('switches sub-tabs when toggle buttons are clicked', () => {
    render(
      <BOQAndRFQManagementModule
        onOpenNewPRModal={mockOnOpenNewPRModal}
        onRouteToPPO={mockOnRouteToPPO}
      />
    );

    // Switch to RFQ Hub
    const rfqBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.boqAndRfqModule.tabRFQHub, 'i') });
    fireEvent.click(rfqBtn);

    expect(screen.getByTestId('cm-hub-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('pr-module-mock')).not.toBeInTheDocument();

    // Switch back to BOQ Studio
    const boqBtn = screen.getByRole('button', { name: new RegExp(UI_STRINGS.boqAndRfqModule.tabBOQStudio, 'i') });
    fireEvent.click(boqBtn);

    expect(screen.getByTestId('pr-module-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('cm-hub-mock')).not.toBeInTheDocument();
  });

  it('switches to rfq_hub when PRModule calls onNavigateToBOQ', () => {
    render(
      <BOQAndRFQManagementModule
        onOpenNewPRModal={mockOnOpenNewPRModal}
        onRouteToPPO={mockOnRouteToPPO}
      />
    );

    const navBtn = screen.getByText('Navigate to RFQ');
    fireEvent.click(navBtn);

    expect(screen.getByTestId('cm-hub-mock')).toBeInTheDocument();
  });

  it('propagates onOpenNewPRModal and onRouteToPPO callbacks to child components', () => {
    render(
      <BOQAndRFQManagementModule
        initialSubTab="boq_studio"
        onOpenNewPRModal={mockOnOpenNewPRModal}
        onRouteToPPO={mockOnRouteToPPO}
      />
    );

    fireEvent.click(screen.getByText('Open PR Modal'));
    expect(mockOnOpenNewPRModal).toHaveBeenCalledTimes(1);

    // Switch to RFQ Hub and test route to PPO
    fireEvent.click(screen.getByRole('button', { name: new RegExp(UI_STRINGS.boqAndRfqModule.tabRFQHub, 'i') }));
    fireEvent.click(screen.getByText('Route To PPO'));
    expect(mockOnRouteToPPO).toHaveBeenCalledTimes(1);
  });

  it('updates sub-tab when initialSubTab prop changes dynamically', () => {
    const { rerender } = render(
      <BOQAndRFQManagementModule
        initialSubTab="boq_studio"
        onOpenNewPRModal={mockOnOpenNewPRModal}
        onRouteToPPO={mockOnRouteToPPO}
      />
    );

    expect(screen.getByTestId('pr-module-mock')).toBeInTheDocument();

    rerender(
      <BOQAndRFQManagementModule
        initialSubTab="rfq_hub"
        onOpenNewPRModal={mockOnOpenNewPRModal}
        onRouteToPPO={mockOnRouteToPPO}
      />
    );

    expect(screen.getByTestId('cm-hub-mock')).toBeInTheDocument();
  });

  it('mounts directly with rfq_hub as initialSubTab', () => {
    render(
      <BOQAndRFQManagementModule
        initialSubTab="rfq_hub"
        onOpenNewPRModal={mockOnOpenNewPRModal}
        onRouteToPPO={mockOnRouteToPPO}
      />
    );

    expect(screen.getByTestId('cm-hub-mock')).toBeInTheDocument();
  });

  it('propagates onRouteToNegotiation callback to CategoryManagerHub', () => {
    const mockOnRouteToNeg = jest.fn();
    render(
      <BOQAndRFQManagementModule
        initialSubTab="rfq_hub"
        onRouteToNegotiation={mockOnRouteToNeg}
      />
    );

    fireEvent.click(screen.getByText('Route To Neg'));
    expect(mockOnRouteToNeg).toHaveBeenCalledTimes(1);
  });

  it('displays PR Submitted & Ingested alert banner in RFQ Hub when PRModule navigates to BOQ', () => {
    render(<BOQAndRFQManagementModule initialSubTab="boq_studio" />);

    // Click mock button that triggers onNavigateToBOQ
    const navBtn = screen.getByText('Navigate to RFQ');
    fireEvent.click(navBtn);

    // RFQ hub is rendered and alert banner is displayed
    expect(screen.getByTestId('cm-hub-mock')).toBeInTheDocument();
    expect(screen.getByText(/PR Submitted & Ingested: Requisition/i)).toBeInTheDocument();
    expect(screen.getByText('PR-001')).toBeInTheDocument();

    // Banner button to return to BOQ Studio & PR Requisitions
    const viewSummaryBtns = screen.getAllByRole('button', {
      name: new RegExp(UI_STRINGS.boqAndRfqModule.tabBOQStudio, 'i'),
    });
    expect(viewSummaryBtns.length).toBeGreaterThan(0);
    fireEvent.click(viewSummaryBtns[0]);

    // Should now show BOQ Studio
    expect(screen.getByTestId('pr-module-mock')).toBeInTheDocument();
  });
});
