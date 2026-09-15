import {
  generateVendorTemplateCSV,
  parseVendorCSV,
  splitCSVRow,
} from '@/lib/vendor-csv';

describe('vendor-csv utility', () => {
  it('should generate an RFC 4180 compliant CSV template with required headers', () => {
    const csv = generateVendorTemplateCSV();
    expect(csv).toContain('Company Name');
    expect(csv).toContain('Category');
    expect(csv).toContain('GSTIN');
    expect(csv).toContain('Contact Person');
    expect(csv).toContain('Apex Structural Steel');
  });

  it('should split CSV row respecting quotes and commas', () => {
    const row = 'Vendor A,"Interior, Fitouts & Millwork",27AABC1234F1Z1';
    const split = splitCSVRow(row);
    expect(split).toEqual(['Vendor A', 'Interior, Fitouts & Millwork', '27AABC1234F1Z1']);
  });

  it('should reject empty or single-line CSV data', () => {
    const emptyResult = parseVendorCSV('');
    expect(emptyResult.errors.length).toBeGreaterThan(0);
    expect(emptyResult.validVendors.length).toBe(0);

    const singleLineResult = parseVendorCSV('Company Name,Category,GSTIN\n');
    expect(singleLineResult.errors.length).toBeGreaterThan(0);
  });

  it('should parse valid vendor CSV records correctly', () => {
    const sampleCsv = `Company Name,Category,Sub-Category,GSTIN,Contact Person,Email,Phone,City,Region,Capacity,Lead Time
"Omkar Facades Ltd","Civil & Structural Works","Facade Works","27AABCO1234F1Z9","Ramesh P","ramesh@omkar.example.com","+91 98200 11111","Mumbai, MH","WEST","High","10 Days"`;

    const result = parseVendorCSV(sampleCsv);
    expect(result.errors.length).toBe(0);
    expect(result.validVendors.length).toBe(1);
    expect(result.validVendors[0].name).toBe('Omkar Facades Ltd');
    expect(result.validVendors[0].category).toBe('Civil & Structural Works');
    expect(result.validVendors[0].gstin).toBe('27AABCO1234F1Z9');
  });

  it('should capture validation errors for rows with missing required fields', () => {
    const invalidCsv = `Company Name,Category,Sub-Category,GSTIN,Contact Person,Email,Phone,City,Region,Capacity,Lead Time
"","Civil & Structural Works","Sub","GST","Contact","bad-email","Phone","City","WEST","High","10 Days"`;

    const result = parseVendorCSV(invalidCsv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.validVendors.length).toBe(0);
  });
});
