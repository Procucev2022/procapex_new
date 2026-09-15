import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StandardBOQUploadModal } from '@/components/budget/StandardBOQUploadModal';
import { UI_STRINGS } from '@/constants';
import type { BudgetCategory } from '@/types';

describe('StandardBOQUploadModal Component Tests', () => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;
  const commonStrings = UI_STRINGS.common;

  const mockCategories: BudgetCategory[] = [
    {
      id: 'CAT-CIVIL',
      name: 'Civil Works',
      shortCode: 'CIVIL',
      costCenter: 'CC-CIV',
      description: 'Civil and structural works',
      subCategories: [
        { id: 'SUB-FOUND', categoryId: 'CAT-CIVIL', name: 'Foundation', shortCode: 'FOUND' },
      ],
      items: [],
      subtotalCost: 0,
      baselineBudget: 5000000,
      committedCost: 0,
      status: 'DRAFT',
    },
  ];

  const onCloseMock = jest.fn();
  const onImportBatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null when isOpen is false', () => {
    const { container } = render(
      <StandardBOQUploadModal
        isOpen={false}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText(strings.uploadModalTitle)).not.toBeInTheDocument();
  });

  it('renders modal with template download link and close triggers', () => {
    const { rerender } = render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    expect(screen.getByText(strings.uploadModalTitle)).toBeInTheDocument();
    expect(screen.getByText(strings.templateDownloadTitle)).toBeInTheDocument();

    const downloadLink = screen.getByRole('link', { name: new RegExp(strings.downloadTemplateButton, 'i') });
    expect(downloadLink).toHaveAttribute('download', 'standard_boq_template.csv');
    expect(downloadLink.getAttribute('href')).toContain('data:text/csv');

    // Close button
    const closeBtn = screen.getByRole('button', { name: commonStrings.close });
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    // Cancel button
    const cancelBtn = screen.getByRole('button', { name: commonStrings.cancel });
    fireEvent.click(cancelBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });

  it('switches between File Upload and Manual Paste tabs', () => {
    render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    // Default is File Upload mode
    expect(screen.getByText(strings.dropzoneTitle)).toBeInTheDocument();

    // Switch to Paste tab
    const pasteTab = screen.getByRole('button', { name: strings.orPasteText });
    fireEvent.click(pasteTab);
    expect(screen.getByPlaceholderText(strings.pastePlaceholder)).toBeInTheDocument();

    // Switch back to File tab
    const fileTab = screen.getByRole('button', { name: /File Upload/i });
    fireEvent.click(fileTab);
    expect(screen.getByText(strings.dropzoneTitle)).toBeInTheDocument();
  });

  it('handles manual CSV paste, parses valid rows, and imports batch', () => {
    render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    // Switch to Paste tab
    fireEvent.click(screen.getByRole('button', { name: strings.orPasteText }));
    const textarea = screen.getByPlaceholderText(strings.pastePlaceholder);

    const validCSV = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity,Notes
CIVIL,FOUND,Raft Foundation Concrete M35,Cum,5500,200,High strength ready mix`;

    fireEvent.change(textarea, { target: { value: validCSV } });

    // Status badge and preview row
    expect(screen.getByText(/1 valid line item/i)).toBeInTheDocument();
    expect(screen.getByText('CIVIL-FOUND-001')).toBeInTheDocument();
    expect(screen.getByText('Raft Foundation Concrete M35')).toBeInTheDocument();

    // Confirm import
    const importBtn = screen.getByRole('button', { name: /Import 1 Standard Line Item/i });
    expect(importBtn).not.toBeDisabled();
    fireEvent.click(importBtn);

    expect(onImportBatchMock).toHaveBeenCalledTimes(1);
    expect(onImportBatchMock).toHaveBeenCalledWith([
      {
        categoryId: 'CAT-CIVIL',
        subCategoryId: 'SUB-FOUND',
        desc: 'Raft Foundation Concrete M35',
        uom: 'Cum',
        benchmarkRate: 5500,
        defaultQty: 200,
        notes: 'High strength ready mix',
      },
    ]);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('displays parsing diagnostics when CSV has errors', () => {
    render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: strings.orPasteText }));
    const textarea = screen.getByPlaceholderText(strings.pastePlaceholder);

    const invalidCSV = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity
INVALID_CATEGORY,FOUND,Concrete,Cum,5000,10`;

    fireEvent.change(textarea, { target: { value: invalidCSV } });

    expect(screen.getByText(/1 validation issue/i)).toBeInTheDocument();
    expect(screen.getByText(/Unknown Category 'INVALID_CATEGORY'/i)).toBeInTheDocument();

    // Import button should be disabled
    const importBtn = screen.getByRole('button', { name: strings.noValidItemsToImport });
    expect(importBtn).toBeDisabled();
    fireEvent.click(importBtn);
    expect(onImportBatchMock).not.toHaveBeenCalled();
  });

  it('handles clearing CSV text', () => {
    render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: strings.orPasteText }));
    const textarea = screen.getByPlaceholderText(strings.pastePlaceholder);

    fireEvent.change(textarea, {
      target: {
        value: `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity\nCIVIL,FOUND,Spec,Cum,5000,10`,
      },
    });
    expect(screen.getByText('CIVIL-FOUND-001')).toBeInTheDocument();

    // Clear text
    fireEvent.change(textarea, { target: { value: '' } });
    expect(screen.queryByText('CIVIL-FOUND-001')).not.toBeInTheDocument();
  });

  it('handles file upload and dropzone events with FileReader', async () => {
    const csvContent = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity\nCIVIL,FOUND,Uploaded File Concrete,Cum,5000,10`;
    const mockFile = new File([csvContent], 'test_boq_items.csv', { type: 'text/csv' });

    render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    const fileInput = screen.getByLabelText(/Upload CSV File/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('test_boq_items.csv')).toBeInTheDocument();
      expect(screen.getByText('CIVIL-FOUND-001')).toBeInTheDocument();
    });

    // Test drag over and drop
    const dropzone = screen.getByText('test_boq_items.csv').closest('div')!.parentElement!;
    fireEvent.dragOver(dropzone);

    const dropContent = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity\nCIVIL,FOUND,Dropped File Spec,Cum,4500,25`;
    const dropFile = new File([dropContent], 'dropped_boq.csv', { type: 'text/csv' });
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [dropFile],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('dropped_boq.csv')).toBeInTheDocument();
      expect(screen.getByText('Dropped File Spec')).toBeInTheDocument();
    });

    // Drop with empty files list
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [],
      },
    });
  });

  it('renders fallback dash when imported item has no subcategory', () => {
    render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: strings.orPasteText }));
    const textarea = screen.getByPlaceholderText(strings.pastePlaceholder);
    const csvNoSub = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity\nCIVIL,,Item with no subcategory,Cum,5000,10`;
    fireEvent.change(textarea, { target: { value: csvNoSub } });

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('handles empty file upload gracefully', () => {
    render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    const fileInput = screen.getByLabelText(/Upload CSV File/i);
    fireEvent.change(fileInput, { target: { files: [] } });
    expect(screen.getByText(strings.dropzoneTitle)).toBeInTheDocument();
  });

  it('handles early return if handleConfirmImport is triggered with zero items', () => {
    render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    const importBtn = screen.getByRole('button', { name: strings.noValidItemsToImport });
    expect(importBtn).toBeDisabled();
    importBtn.removeAttribute('disabled');
    fireEvent.click(importBtn);
    expect(onImportBatchMock).not.toHaveBeenCalled();
  });

  it('handles exception when onImportBatch throws Error and non-Error', () => {
    render(
      <StandardBOQUploadModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onImportBatch={onImportBatchMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: strings.orPasteText }));
    const textarea = screen.getByPlaceholderText(strings.pastePlaceholder);
    const validCSV = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity\nCIVIL,FOUND,Spec,Cum,5000,10`;
    fireEvent.change(textarea, { target: { value: validCSV } });

    // Error object
    onImportBatchMock.mockImplementationOnce(() => {
      throw new Error('Database transaction timeout during batch insert');
    });
    const importBtn = screen.getByRole('button', { name: /Import 1 Standard Line Item/i });
    fireEvent.click(importBtn);
    expect(screen.getByText(/Database transaction timeout/i)).toBeInTheDocument();

    // Raw string error
    onImportBatchMock.mockImplementationOnce(() => {
      throw 'Raw string failure';
    });
    fireEvent.click(importBtn);
    expect(screen.getByText(/Failed to import standard BOQ items/i)).toBeInTheDocument();
  });
});
