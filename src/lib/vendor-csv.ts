import { VENDOR_CSV_HEADERS, VENDOR_CSV_SAMPLE_ROWS } from '@/constants/vendor-management';
import { CLIENT_VENDOR_CSV_ROW_SCHEMA } from '@/constants/validation';
import { validateSchema } from '@/lib/validator';
import { logger } from '@/lib/logger';
import type { VendorCSVRow } from '@/types/vendor-management';

/**
 * Escapes an individual field value for RFC 4180 CSV compliance.
 */
function escapeCSVField(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC 4180 compliant CSV string containing the standard headers
 * and pre-populated sample rows to guide client vendor onboarding.
 */
export function generateVendorTemplateCSV(): string {
  const headerLine = VENDOR_CSV_HEADERS.map(escapeCSVField).join(',');

  const dataLines = VENDOR_CSV_SAMPLE_ROWS.map((row) =>
    [
      escapeCSVField(row.name),
      escapeCSVField(row.category),
      escapeCSVField(row.subCategory),
      escapeCSVField(row.gstin),
      escapeCSVField(row.contactPerson),
      escapeCSVField(row.email),
      escapeCSVField(row.phone),
      escapeCSVField(row.city),
      escapeCSVField(row.region),
      escapeCSVField(row.capacity),
      escapeCSVField(row.leadTime),
    ].join(',')
  );

  return [headerLine, ...dataLines].join('\r\n');
}

/**
 * Splits a single CSV row line respecting quoted fields that contain commas.
 */
export function splitCSVRow(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        i += 1; // Skip the escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue.trim());
  return values;
}

/**
 * Parses raw CSV text, validates columns and field rules, and returns parsed vendors
 * along with structured error messages for invalid rows.
 */
export function parseVendorCSV(csvText: string): {
  validVendors: VendorCSVRow[];
  errors: string[];
} {
  const errors: string[] = [];
  const validVendors: VendorCSVRow[] = [];

  if (!csvText?.trim()) {
    errors.push('CSV content is empty. Please provide valid CSV data.');
    return { validVendors, errors };
  }

  // Normalize line endings and split
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    errors.push('CSV must contain a header row and at least one data row.');
    return { validVendors, errors };
  }

  // Parse header
  const headers = splitCSVRow(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = headers.findIndex((h) => h.includes('company') || h.includes('name'));
  const categoryIdx = headers.findIndex((h) => h.includes('category') && !h.includes('sub'));
  const subCategoryIdx = headers.findIndex((h) => h.includes('sub'));
  const gstinIdx = headers.findIndex((h) => h.includes('gst') || h.includes('tax'));
  const contactIdx = headers.findIndex((h) => h.includes('contact') || h.includes('person'));
  const emailIdx = headers.findIndex((h) => h.includes('email'));
  const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile'));
  const cityIdx = headers.findIndex((h) => h.includes('city') || h.includes('location'));
  const regionIdx = headers.findIndex((h) => h.includes('region'));
  const capacityIdx = headers.findIndex((h) => h.includes('capacity'));
  const leadTimeIdx = headers.findIndex((h) => h.includes('lead'));

  if (nameIdx === -1 || categoryIdx === -1) {
    errors.push("Missing required columns: 'Company Name' and 'Category' are mandatory.");
    return { validVendors, errors };
  }

  for (let i = 1; i < lines.length; i += 1) {
    const rawRow = splitCSVRow(lines[i]);
    const rowNum = i + 1;

    const rowObj: VendorCSVRow = {
      name: rawRow[nameIdx] ?? '',
      category: rawRow[categoryIdx] ?? '',
      subCategory: (subCategoryIdx !== -1 ? rawRow[subCategoryIdx] : '') || 'General Supply',
      gstin: (gstinIdx !== -1 ? rawRow[gstinIdx] : '') || 'UNREGISTERED',
      contactPerson: (contactIdx !== -1 ? rawRow[contactIdx] : '') || 'Primary Commercial Contact',
      email: (emailIdx !== -1 ? rawRow[emailIdx] : '') || `vendor-${i}@clientboarded.local`,
      phone: (phoneIdx !== -1 ? rawRow[phoneIdx] : '') || '+91 00000 00000',
      city: (cityIdx !== -1 ? rawRow[cityIdx] : '') || 'Enterprise Operations',
      region: (regionIdx !== -1 ? rawRow[regionIdx] : '') || 'WEST',
      capacity: (capacityIdx !== -1 ? rawRow[capacityIdx] : '') || 'High',
      leadTime: (leadTimeIdx !== -1 ? rawRow[leadTimeIdx] : '') || '10-14 Days',
    };

    const validation = validateSchema(rowObj, CLIENT_VENDOR_CSV_ROW_SCHEMA);
    if (!validation.isValid) {
      const issues = validation.errors.map((e) => e.message).join('; ');
      errors.push(`Row ${rowNum} (${rowObj.name || 'Unnamed'}): ${issues}`);
    } else {
      validVendors.push(rowObj);
    }
  }

  logger.info('lib/vendor-csv', 'Parsed vendor CSV batch', {
    totalLines: lines.length - 1,
    validCount: validVendors.length,
    errorCount: errors.length,
  });

  return { validVendors, errors };
}

/**
 * Generates a data: URI for declarative JSX `<a download>` links,
 * avoiding imperative DOM creation.
 */
export function getVendorTemplateCSVDataUri(): string {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(generateVendorTemplateCSV())}`;
}
