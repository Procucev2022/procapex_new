import {
  STANDARD_BOQ_CSV_HEADERS,
  STANDARD_BOQ_CSV_SAMPLE_ROWS,
  STANDARD_BOQ_UPLOAD_ROW_SCHEMA,
} from '@/constants';
import { validateSchema } from '@/lib/validator';
import { logger } from '@/lib/logger';
import { generateUniqueItemCode } from '@/context/useBudgetManager';
import { splitCSVIntoRows } from './boq-csv-parser';
import type { BudgetCategory, ParsedStandardBOQItem, StandardBOQParseResult } from '@/types';

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
 * Generates an RFC 4180 compliant CSV template string containing standard headers
 * and pre-populated sample rows to guide client bulk upload.
 */
export function generateStandardBOQTemplateCSV(): string {
  const headerLine = STANDARD_BOQ_CSV_HEADERS.map(escapeCSVField).join(',');

  const dataLines = STANDARD_BOQ_CSV_SAMPLE_ROWS.map((row) =>
    [
      escapeCSVField(row.category),
      escapeCSVField(row.subCategory),
      escapeCSVField(row.desc),
      escapeCSVField(row.uom),
      escapeCSVField(row.benchmarkRate),
      escapeCSVField(row.defaultQty),
      escapeCSVField(row.notes),
    ].join(',')
  );

  return [headerLine, ...dataLines].join('\r\n');
}

/**
 * Generates a data: URI for declarative JSX `<a download="...">` links,
 * avoiding imperative DOM creation.
 */
export function getStandardBOQTemplateCSVDataUri(): string {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(generateStandardBOQTemplateCSV())}`;
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
 * Resolves a Category by comparing user input against Category ID, shortCode, or Name.
 */
function resolveCategory(
  categoryInput: string,
  categories: BudgetCategory[]
): BudgetCategory | undefined {
  const clean = categoryInput.trim().toUpperCase();
  return categories.find(
    (c) =>
      c.id.toUpperCase() === clean ||
      c.shortCode.toUpperCase() === clean ||
      c.name.toUpperCase() === clean
  );
}

/**
 * Parses raw CSV text, validates columns and field rules, resolves parent categories/sub-categories,
 * and returns validated line items ready for batch addition along with row-by-row error diagnostics.
 */
export function parseStandardBOQCSV(
  csvText: string,
  categories: BudgetCategory[]
): StandardBOQParseResult {
  const errors: string[] = [];
  const validItems: ParsedStandardBOQItem[] = [];

  if (!csvText?.trim()) {
    errors.push('CSV content is empty. Please select a valid CSV file.');
    return { validItems, errors, totalRows: 0 };
  }

  // Parse logical rows respecting RFC 4180 multiline quoted fields
  const lines = splitCSVIntoRows(csvText);

  if (lines.length < 2) {
    errors.push('CSV must contain a header row and at least one data row.');
    return { validItems, errors, totalRows: 0 };
  }

  // Parse headers
  const headers = splitCSVRow(lines[0]).map((h) => h.toLowerCase());
  const categoryIdx = headers.findIndex((h) => h.includes('category') && !h.includes('sub'));
  const subCategoryIdx = headers.findIndex((h) => h.includes('sub'));
  const descIdx = headers.findIndex(
    (h) => h.includes('spec') || h.includes('desc') || h.includes('item')
  );
  const uomIdx = headers.findIndex((h) => h.includes('uom') || h.includes('unit'));
  const rateIdx = headers.findIndex((h) => h.includes('rate') || h.includes('benchmark'));
  const qtyIdx = headers.findIndex((h) => h.includes('qty') || h.includes('quantity'));
  const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('compliance'));

  if (categoryIdx === -1 || descIdx === -1 || rateIdx === -1 || qtyIdx === -1) {
    errors.push(
      "Missing required columns. Required headers: 'Category', 'Specification / Description', 'Benchmark Rate', and 'Default Quantity'."
    );
    return { validItems, errors, totalRows: lines.length - 1 };
  }

  // Deep clone categories array to track sequential unique codes during batch simulation
  const simulatedCategories = categories.map((cat) => ({
    ...cat,
    items: [...cat.items],
  }));

  for (let i = 1; i < lines.length; i += 1) {
    const rawRow = splitCSVRow(lines[i]);
    const rowNum = i + 1;

    const rawCategory = rawRow[categoryIdx] ?? '';
    const rawSubCategory = subCategoryIdx !== -1 ? rawRow[subCategoryIdx] ?? '' : '';
    const rawDesc = rawRow[descIdx] ?? '';
    const rawUom = (uomIdx !== -1 ? rawRow[uomIdx] : '') || 'Nos';
    const rawRate = Number(rawRow[rateIdx]);
    const rawQty = Number(rawRow[qtyIdx]);
    const rawNotes = notesIdx !== -1 ? rawRow[notesIdx] : '';

    const rowPayload = {
      category: rawCategory,
      subCategory: rawSubCategory || undefined,
      desc: rawDesc,
      uom: rawUom,
      benchmarkRate: rawRate,
      defaultQty: rawQty,
      notes: rawNotes || undefined,
    };

    const validation = validateSchema(rowPayload, STANDARD_BOQ_UPLOAD_ROW_SCHEMA);
    if (!validation.isValid) {
      const issueMsg = validation.errors.map((e) => e.message).join('; ');
      errors.push(`Row ${rowNum}: ${issueMsg}`);
      continue;
    }

    // Resolve Category
    const resolvedCat = resolveCategory(rawCategory, simulatedCategories);
    if (!resolvedCat) {
      errors.push(
        `Row ${rowNum}: Unknown Category '${rawCategory}'. Ensure Category exists in Master Catalog before importing items.`
      );
      continue;
    }

    // Resolve Sub-Category if provided
    let resolvedSubCatId: string | undefined;
    let resolvedSubCatName: string | undefined;

    if (rawSubCategory?.trim()) {
      const subClean = rawSubCategory.trim().toUpperCase();
      const sub = resolvedCat.subCategories?.find(
        (s) =>
          s.id.toUpperCase() === subClean ||
          s.shortCode.toUpperCase() === subClean ||
          s.name.toUpperCase() === subClean
      );
      if (sub) {
        resolvedSubCatId = sub.id;
        resolvedSubCatName = sub.name;
      } else {
        errors.push(
          `Row ${rowNum}: Sub-Category '${rawSubCategory}' not found under Category '${resolvedCat.name}'.`
        );
        continue;
      }
    }

    // Compute live preview unique code using the simulated state
    const previewCode = generateUniqueItemCode(
      simulatedCategories,
      resolvedCat.id,
      resolvedSubCatId
    );

    // Append simulated item to prevent collisions within the same batch
    resolvedCat.items.push({
      id: `SIM-${previewCode}`,
      code: previewCode,
      categoryId: resolvedCat.id,
      subCategoryId: resolvedSubCatId,
      subCategoryName: resolvedSubCatName,
      desc: rawDesc.trim(),
      uom: rawUom.trim(),
      benchmarkRate: rawRate,
      defaultQty: rawQty,
      qty: rawQty,
      calculatedCost: Math.round(rawQty * rawRate),
      status: 'ACTIVE',
      isImmutable: true,
      benchmarkDetails: {
        benchmarkRate: rawRate,
        masterRateCardRate: rawRate,
        historicalLowestRate: rawRate,
        aiConfidence: '95%',
        varianceVsRateCardPercent: 0,
      },
    });

    validItems.push({
      categoryId: resolvedCat.id,
      subCategoryId: resolvedSubCatId,
      desc: rawDesc.trim(),
      uom: rawUom.trim(),
      benchmarkRate: rawRate,
      defaultQty: rawQty,
      notes: rawNotes?.trim() || undefined,
      categoryName: resolvedCat.name,
      subCategoryName: resolvedSubCatName,
      previewCode,
      rowNumber: rowNum,
    });
  }

  logger.info('lib/standard-boq-csv', 'Parsed standard BOQ CSV batch', {
    totalRows: lines.length - 1,
    validCount: validItems.length,
    errorCount: errors.length,
  });

  return {
    validItems,
    errors,
    totalRows: lines.length - 1,
  };
}
