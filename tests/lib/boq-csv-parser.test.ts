import {
  splitCSVRow,
  detectDelimiter,
  detectHeaderColumns,
  parseUploadedBOQCSV,
  parseUploadedBOQFile,
} from '@/lib/boq-csv-parser';

describe('boq-csv-parser', () => {
  describe('splitCSVRow', () => {
    it('splits standard comma-separated values', () => {
      const row = 'ITEM-001,Granite Top,Sqm,12.5';
      expect(splitCSVRow(row)).toEqual(['ITEM-001', 'Granite Top', 'Sqm', '12.5']);
    });

    it('handles quoted values with embedded commas and escaped quotes', () => {
      const row = '"ITEM, 001","20mm Granite ""Jet Black""",Sqm,"15,000"';
      expect(splitCSVRow(row)).toEqual(['ITEM, 001', '20mm Granite "Jet Black"', 'Sqm', '15,000']);
    });

    it('handles custom delimiter such as tab or semicolon', () => {
      const row = 'ITEM-001\tGranite Top\tSqm\t12.5';
      expect(splitCSVRow(row, '\t')).toEqual(['ITEM-001', 'Granite Top', 'Sqm', '12.5']);
    });
  });

  describe('detectDelimiter', () => {
    it('detects tab delimiter', () => {
      expect(detectDelimiter('Code\tDesc\tUOM\tQty')).toBe('\t');
    });

    it('detects semicolon delimiter', () => {
      expect(detectDelimiter('Code;Desc;UOM;Qty')).toBe(';');
    });

    it('defaults to comma delimiter', () => {
      expect(detectDelimiter('Code,Desc,UOM,Qty')).toBe(',');
    });
  });

  describe('detectHeaderColumns', () => {
    it('detects standard BOQ column headers', () => {
      const headers = ['Item Code', 'Item Description / Specs', 'Unit (UOM)', 'Required Quantity'];
      const mapping = detectHeaderColumns(headers);
      expect(mapping).toEqual({
        codeIdx: 0,
        descIdx: 1,
        uomIdx: 2,
        qtyIdx: 3,
      });
    });

    it('detects alternative header names like Code, Description, UOM, Qty', () => {
      const headers = ['Item #', 'Material Specification', 'Measurement', 'Units Count'];
      const mapping = detectHeaderColumns(headers);
      expect(mapping).toEqual({
        codeIdx: 0,
        descIdx: 1,
        uomIdx: 2,
        qtyIdx: 3,
      });
    });

    it('returns null if essential description or quantity headers are missing', () => {
      const headers = ['Category', 'Date', 'Author'];
      expect(detectHeaderColumns(headers)).toBeNull();
    });
  });

  describe('parseUploadedBOQCSV', () => {
    it('parses standard blank template CSV data', () => {
      const csv = `Item Code,Item Description / Specs,Unit (UOM),Required Quantity,Remarks
ITEM-001,Granite Countertop 20mm Polished Jet Black,Sqm,12.5,Elevation D
ITEM-002,18mm Marine BWP Plywood IS 710,Sqm,38.0,Carcass`;

      const result = parseUploadedBOQCSV(csv, 'test.csv');
      expect(result.error).toBeUndefined();
      expect(result.count).toBe(2);
      expect(result.items[0]).toEqual({
        code: 'ITEM-001',
        desc: 'Granite Countertop 20mm Polished Jet Black',
        uom: 'Sqm',
        qty: 12.5,
      });
      expect(result.items[1].code).toBe('ITEM-002');
      expect(result.items[1].qty).toBe(38.0);
    });

    it('parses data without headers using fallback positions', () => {
      const csv = `UPL-101,Acoustic Wall Paneling,Sqm,54.2
UPL-102,LED Profile Channel,Rmt,28`;

      const result = parseUploadedBOQCSV(csv);
      expect(result.count).toBe(2);
      expect(result.items[0].code).toBe('UPL-101');
      expect(result.items[0].desc).toBe('Acoustic Wall Paneling');
      expect(result.items[0].qty).toBe(54.2);
    });

    it('parses 3-column rows without code column and generates unique item codes', () => {
      const csv = `False Ceiling Gypsum Board,Sqm,120.5
Fire Rated Door 120min,Nos,4`;

      const result = parseUploadedBOQCSV(csv);
      expect(result.count).toBe(2);
      expect(result.items[0].code).toBe('BOQ-ITEM-001');
      expect(result.items[0].desc).toBe('False Ceiling Gypsum Board');
      expect(result.items[0].uom).toBe('Sqm');
      expect(result.items[0].qty).toBe(120.5);
    });

    it('parses 2-column rows without code and UOM and defaults to Nos and 1.0', () => {
      const csv = `Executive High Back Mesh Chair,8
Visitor Chair with Armrest,12`;

      const result = parseUploadedBOQCSV(csv);
      expect(result.count).toBe(2);
      expect(result.items[0].code).toBe('BOQ-ITEM-001');
      expect(result.items[0].desc).toBe('Executive High Back Mesh Chair');
      expect(result.items[0].uom).toBe('Nos');
      expect(result.items[0].qty).toBe(8);
    });

    it('cleans formatted quantities with currency symbols and commas', () => {
      const csv = `Item Code,Description,UOM,Qty
EQ-01,Heavy Duty Industrial Storage Racks,Sets,"1,250"
EQ-02,Pallet Load Beams,Nos,invalid-qty`;

      const result = parseUploadedBOQCSV(csv);
      expect(result.count).toBe(2);
      expect(result.items[0].qty).toBe(1250);
      expect(result.items[1].qty).toBe(1.0); // fallback for invalid number
    });

    it('parses empty or blank quantities as 0 for standard template workflows', () => {
      const csv = `Item Code,Item Description / Specs,Unit (UOM),Required Quantity
CIV-CON-M30,Ready Mix Concrete M30 Grade,Cum,
CIV-STL-FE500,TMT Fe500D Reinforcement Steel,Ton,   
CIV-BRK-FLY,Fly Ash Bricks,Nos,0`;

      const result = parseUploadedBOQCSV(csv);
      expect(result.count).toBe(3);
      expect(result.items[0].qty).toBe(0);
      expect(result.items[1].qty).toBe(0);
      expect(result.items[2].qty).toBe(0);
    });

    it('handles RFC 4180 multiline quoted specifications without splitting into multiple items', () => {
      const csv = `Item Code,Specification / Scope Description,UOM,Required Quantity
CAIW-INTEWO-001,"18 mm Ply Support Behind Gypsum Sheet
Providing and fixing 18 mm thick plywood supports behind gypsum sheets
including proper alignment, fixing with necessary fasteners",Nos,1
CAIW-INTEWO-002,"12.5 mm Thick Gypsum Board Cladding
Providing and fixing 12.5 mm thick gypsum board cladding over supporting framework
including cutting, fixing with necessary screws",Nos,1`;

      const result = parseUploadedBOQCSV(csv);
      expect(result.count).toBe(2);
      expect(result.items[0].code).toBe('CAIW-INTEWO-001');
      expect(result.items[0].uom).toBe('Nos');
      expect(result.items[0].qty).toBe(1);
      expect(result.items[0].desc).toContain('18 mm Ply Support Behind Gypsum Sheet');
      expect(result.items[0].desc).toContain('Providing and fixing 18 mm thick plywood');

      expect(result.items[1].code).toBe('CAIW-INTEWO-002');
      expect(result.items[1].uom).toBe('Nos');
      expect(result.items[1].qty).toBe(1);
      expect(result.items[1].desc).toContain('12.5 mm Thick Gypsum Board Cladding');
    });

    it('recovers unquoted continuation rows and merges them into the parent item correctly', () => {
      const csv = `Item Code,Specification / Scope Description,UOM,Required Quantity
CAIW-INTEWO-001,18 mm Ply Support Behind Gypsum Sheet,Nos,0.0
Providing and fixing 18 mm thick plywood supports behind gypsum sheets,including proper alignment,fixing with necessary fasteners,1
CAIW-INTEWO-002,12.5 mm Thick Gypsum Board Cladding,Nos,0.0
Providing and fixing 12.5 mm thick gypsum board cladding over framework,including cutting,fixing with screws,1`;

      const result = parseUploadedBOQCSV(csv);
      expect(result.count).toBe(2);
      expect(result.items[0].code).toBe('CAIW-INTEWO-001');
      expect(result.items[0].uom).toBe('Nos');
      expect(result.items[0].qty).toBe(1);
      expect(result.items[0].desc).toContain('18 mm Ply Support Behind Gypsum Sheet');
      expect(result.items[0].desc).toContain('Providing and fixing 18 mm thick plywood');

      expect(result.items[1].code).toBe('CAIW-INTEWO-002');
      expect(result.items[1].uom).toBe('Nos');
      expect(result.items[1].qty).toBe(1);
      expect(result.items[1].desc).toContain('12.5 mm Thick Gypsum Board Cladding');
      expect(result.items[1].desc).toContain('Providing and fixing 12.5 mm thick gypsum');
    });

    it('handles excess columns from unquoted commas within the specification field', () => {
      const csv = `Item Code,Specification,UOM,Quantity
CIV-01,Supply, install and test 25mm GI piping, with brackets,Sqm,50`;

      const result = parseUploadedBOQCSV(csv);
      expect(result.count).toBe(1);
      expect(result.items[0].code).toBe('CIV-01');
      expect(result.items[0].desc).toBe('Supply, install and test 25mm GI piping, with brackets');
      expect(result.items[0].uom).toBe('Sqm');
      expect(result.items[0].qty).toBe(50);
    });

    it('returns error when CSV text is empty or blank', () => {
      expect(parseUploadedBOQCSV('').error).toBeDefined();
      expect(parseUploadedBOQCSV('   \n\r  ').error).toBeDefined();
    });

    it('returns error when no valid line items can be parsed', () => {
      const csv = `Item Code,Description,UOM,Qty
,,,
,,,`;
      const result = parseUploadedBOQCSV(csv);
      expect(result.items).toHaveLength(0);
      expect(result.error).toContain('Could not parse any valid line items');
    });
  });

  describe('parseUploadedBOQFile', () => {
    it('reads File object and parses content', async () => {
      const fileContent = 'Item Code,Description,UOM,Qty\nITM-99,Server Rack Enclosure,Nos,3';
      const file = new File([fileContent], 'server_rack.csv', { type: 'text/csv' });

      const result = await parseUploadedBOQFile(file);
      expect(result.count).toBe(1);
      expect(result.items[0].code).toBe('ITM-99');
      expect(result.items[0].desc).toBe('Server Rack Enclosure');
    });

    it('handles file reading failure gracefully', async () => {
      const file = {
        name: 'corrupted.csv',
        text: () => Promise.reject(new Error('Disk read timeout')),
      } as unknown as File;

      const result = await parseUploadedBOQFile(file);
      expect(result.count).toBe(0);
      expect(result.error).toContain('Disk read timeout');
    });
  });
});
