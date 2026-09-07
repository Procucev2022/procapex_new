import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/layout';

jest.mock('@/context/ProcurementContext', () => ({
  ProcurementProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-provider">{children}</div>
  ),
}));

describe('RootLayout', () => {
  it('defines metadata correctly', () => {
    expect(metadata.title).toContain('ProCPX');
    expect(metadata.description).toBeDefined();
  });

  it('renders children wrapped with ProcurementProvider', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Child Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('mock-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toHaveTextContent('Child Content');
  });
});
