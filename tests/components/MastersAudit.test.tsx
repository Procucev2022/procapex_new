import React from 'react';
import { render, screen } from '@testing-library/react';
import { MastersAudit } from '@/components/MastersAudit';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS } from '@/constants';

jest.mock('@/context/ProcurementContext', () => ({
  useProcurement: jest.fn(),
}));

describe('MastersAudit Component', () => {
  const sampleAuditLogs = [
    {
      action: 'PR Created',
      time: '2026-09-07 10:00',
      detail: 'Created PR-2026-0005 for Terminal 1',
      user: 'Rahul Verma (Category Mgr)',
    },
    {
      action: 'Rate Approved',
      time: '2026-09-07 11:30',
      detail: 'Approved fair rate for Concrete M30',
      user: 'Capt. R. K. Nair',
    },
  ];

  beforeEach(() => {
    (useProcurement as jest.Mock).mockReturnValue({
      auditLogs: sampleAuditLogs,
    });
  });

  it('renders standard master rate cards table', () => {
    render(<MastersAudit />);

    expect(screen.getByText(UI_STRINGS.mastersAudit.tableBenchmark)).toBeInTheDocument();
    expect(screen.getByText('CON-RMC-M30')).toBeInTheDocument();
    expect(screen.getByText('STL-TMT-25MM')).toBeInTheDocument();
    expect(screen.getByText('MEP-CHL-200TR')).toBeInTheDocument();
    expect(screen.getByText('FIN-TIL-600X600')).toBeInTheDocument();
  });

  it('renders immutable audit logs trail with user tags', () => {
    render(<MastersAudit />);

    expect(screen.getByText(UI_STRINGS.mastersAudit.auditTrailTitle)).toBeInTheDocument();
    expect(screen.getByText('PR Created')).toBeInTheDocument();
    expect(screen.getByText('Created PR-2026-0005 for Terminal 1')).toBeInTheDocument();
    expect(screen.getByText('User: Rahul Verma (Category Mgr)')).toBeInTheDocument();
    expect(screen.getByText('Rate Approved')).toBeInTheDocument();
  });
});
