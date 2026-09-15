import {
  generateStandardBOQTemplateCSV,
  getStandardBOQTemplateCSVDataUri,
  splitCSVRow,
  parseStandardBOQCSV,
} from '@/lib/standard-boq-csv';
import type { BudgetCategory } from '@/types';

describe('Standard BOQ CSV Parser & Template Engine', () => {
  const mockCategories: BudgetCategory[] = [
    {
      id: 'CAT-CIVIL',
      name: 'Civil Works',
      shortCode: 'CIVIL',
      costCenter: 'CC-CIV',
      description: 'Civil and structural engineering',
      subCategories: [
        { id: 'SUB-FOUND', categoryId: 'CAT-CIVIL', name: 'Foundation', shortCode: 'FOUND' },
        { id: 'SUB-MASONRY', categoryId: 'CAT-CIVIL', name: 'Masonry Works', shortCode: 'MASONRY' },
      ],
      items: [
        {
          id: 'ITM-CIVIL-FOUND-001',
          code: 'CIVIL-FOUND-001',
          categoryId: 'CAT-CIVIL',
          subCategoryId: 'SUB-FOUND',
          desc: 'Existing Foundation Concrete',
          uom: 'Cum',
          benchmarkRate: 5000,
          defaultQty: 100,
          qty: 100,
          calculatedCost: 500000,
          status: 'ACTIVE',
          isImmutable: true,
          benchmarkDetails: {
            benchmarkRate: 5000,
            masterRateCardRate: 5000,
            historicalLowestRate: 5000,
            aiConfidence: '95%',
            varianceVsRateCardPercent: 0,
          },
        },
      ],
      subtotalCost: 500000,
      baselineBudget: 5000000,
      committedCost: 0,
      status: 'DRAFT',
    },
    {
      id: 'CAT-INT',
      name: 'Interior Fitout',
      shortCode: 'INT',
      costCenter: 'CC-INT',
      description: 'Finishing and interior works',
      subCategories: [
        { id: 'SUB-FLOOR', categoryId: 'CAT-INT', name: 'Flooring', shortCode: 'FLOOR' },
      ],
      items: [],
      subtotalCost: 0,
      baselineBudget: 3000000,
      committedCost: 0,
      status: 'DRAFT',
    },
  ];

  describe('generateStandardBOQTemplateCSV & Data URI', () => {
    it('generates an RFC 4180 compliant CSV string with headers and sample rows', () => {
      const csv = generateStandardBOQTemplateCSV();
      expect(csv).toContain('Category Code / Name,Sub-Category Code / Name,Specification / Description');
      expect(csv).toContain('M35 Grade Ready Mix Concrete');
      expect(csv).toContain('CIVIL');
    });

    it('generates valid data: URI for download links', () => {
      const uri = getStandardBOQTemplateCSVDataUri();
      expect(uri.startsWith('data:text/csv;charset=utf-8,')).toBe(true);
      expect(uri).toContain('Specification');
    });
  });

  describe('splitCSVRow', () => {
    it('splits standard comma-separated fields', () => {
      const result = splitCSVRow('CIVIL,FOUND,Concrete Work,Cum,5000,100,Notes');
      expect(result).toEqual(['CIVIL', 'FOUND', 'Concrete Work', 'Cum', '5000', '100', 'Notes']);
    });

    it('handles quoted fields with commas and escaped quotes', () => {
      const result = splitCSVRow('CIVIL,FOUND,"M35 Concrete, Retaining Walls ""High-Spec""",Cum,5000,100');
      expect(result).toEqual([
        'CIVIL',
        'FOUND',
        'M35 Concrete, Retaining Walls "High-Spec"',
        'Cum',
        '5000',
        '100',
      ]);
    });
  });

  describe('parseStandardBOQCSV', () => {
    it('handles empty or whitespace CSV text', () => {
      const result = parseStandardBOQCSV('', mockCategories);
      expect(result.validItems).toHaveLength(0);
      expect(result.errors).toContain('CSV content is empty. Please select a valid CSV file.');
    });

    it('handles CSV with only header row', () => {
      const result = parseStandardBOQCSV(
        'Category Code / Name,Sub-Category Code / Name,Specification / Description,UOM,Benchmark Rate (INR),Default Quantity',
        mockCategories
      );
      expect(result.validItems).toHaveLength(0);
      expect(result.errors).toContain('CSV must contain a header row and at least one data row.');
    });

    it('handles CSV with missing required columns', () => {
      const result = parseStandardBOQCSV(
        'Some Column,Other Column\nVal1,Val2',
        mockCategories
      );
      expect(result.validItems).toHaveLength(0);
      expect(result.errors[0]).toContain('Missing required columns');
    });

    it('parses valid rows with Category shortCode and SubCategory shortCode', () => {
      const csv = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity,Notes
CIVIL,FOUND,Reinforced Bar Support 16mm Fe500D,Ton,65000,15,Mill certified
INT,FLOOR,Italian Marble Flooring 20mm Polish,Sqm,3800,250,Diamond polished finish`;

      const result = parseStandardBOQCSV(csv, mockCategories);
      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(2);

      // Unique code sequentially derived
      expect(result.validItems[0].previewCode).toBe('CIVIL-FOUND-002');
      expect(result.validItems[0].categoryName).toBe('Civil Works');
      expect(result.validItems[0].subCategoryName).toBe('Foundation');

      expect(result.validItems[1].previewCode).toBe('INT-FLOOR-001');
      expect(result.validItems[1].categoryName).toBe('Interior Fitout');
    });

    it('parses valid rows using full Category name and defaults subcategory when empty', () => {
      const csv = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity
Civil Works,,Structural Steel Trusses Welded,Ton,72000,8`;

      const result = parseStandardBOQCSV(csv, mockCategories);
      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(1);
      expect(result.validItems[0].categoryId).toBe('CAT-CIVIL');
      expect(result.validItems[0].previewCode).toBe('CIVIL-GEN-002');
    });

    it('reports validation errors for invalid fields (negative rate, short description)', () => {
      const csv = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity
CIVIL,FOUND,A,Cum,-500,0`;

      const result = parseStandardBOQCSV(csv, mockCategories);
      expect(result.validItems).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Row 2:');
    });

    it('reports error for unknown parent category', () => {
      const csv = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity
UNKNOWN_CAT,FOUND,Valid Specification Item,Nos,1000,10`;

      const result = parseStandardBOQCSV(csv, mockCategories);
      expect(result.validItems).toHaveLength(0);
      expect(result.errors[0]).toContain("Unknown Category 'UNKNOWN_CAT'");
    });

    it('reports error for unknown sub-category under valid category', () => {
      const csv = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity
CIVIL,NON_EXISTENT_SUB,Valid Specification Item,Nos,1000,10`;

      const result = parseStandardBOQCSV(csv, mockCategories);
      expect(result.validItems).toHaveLength(0);
      expect(result.errors[0]).toContain("Sub-Category 'NON_EXISTENT_SUB' not found under Category 'Civil Works'");
    });

    it('avoids unique code collisions across multiple items in the same batch', () => {
      const csv = `Category,SubCategory,Specification,UOM,Benchmark Rate,Default Quantity
CIVIL,FOUND,Item One In Batch,Nos,100,1
CIVIL,FOUND,Item Two In Batch,Nos,200,2
CIVIL,FOUND,Item Three In Batch,Nos,300,3`;

      const result = parseStandardBOQCSV(csv, mockCategories);
      expect(result.validItems).toHaveLength(3);
      expect(result.validItems[0].previewCode).toBe('CIVIL-FOUND-002');
      expect(result.validItems[1].previewCode).toBe('CIVIL-FOUND-003');
      expect(result.validItems[2].previewCode).toBe('CIVIL-FOUND-004');
    });
  });
});
