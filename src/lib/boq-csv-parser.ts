import type { RequesterBOQItem } from '@/types';
import { logger } from '@/lib/logger';

export interface BOQParseResult {
  items: RequesterBOQItem[];
  count: number;
  error?: string;
}

export interface ColumnMapping {
  codeIdx: number;
  descIdx: number;
  uomIdx: number;
  qtyIdx: number;
}

interface ParsedRowFields {
  code: string;
  desc: string;
  uom: string;
  qty: number;
  isContinuation: boolean;
}

const ACTION_VERBS = [
  'providing', 'supplying', 'fixing', 'installing', 'fabrication', 'execution', 'laying',
  'dismantling', 'excavation', 'painting', 'plastering', 'application', 'including', 'construction', 'p/f', 's/f',
];

const KNOWN_UOMS = new Set([
  'nos', 'sqm', 'cum', 'rmt', 'kg', 'mtr', 'set', 'lot', 'ls', 'pcs', 'sqft', 'cuft', 'ltr', 'box', 'roll', 'ton',
]);

/** Splits CSV text into logical rows respecting multiline quoted fields (RFC 4180). */
export function splitCSVIntoRows(csvText: string): string[] {
  const rows: string[] = [];
  let currentRow = '';
  let insideQuotes = false;
  let i = 0;

  while (i < csvText.length) {
    const char = csvText[i];
    if (char === '"') {
      const isEscaped: boolean = insideQuotes && csvText[i + 1] === '"';
      currentRow += isEscaped ? '""' : '"';
      insideQuotes = isEscaped ? insideQuotes : !insideQuotes;
      i += isEscaped ? 2 : 1;
    } else if (!insideQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && csvText[i + 1] === '\n') i += 1;
      if (currentRow.trim()) rows.push(currentRow.trim());
      currentRow = '';
      i += 1;
    } else {
      currentRow += char;
      i += 1;
    }
  }
  if (currentRow.trim()) rows.push(currentRow.trim());
  return rows;
}

/** Splits a single CSV row line respecting quoted fields that contain commas or delimiters. */
export function splitCSVRow(line: string, delimiter = ','): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());
  return values;
}

/** Automatically detects row delimiter: comma, tab, or semicolon. */
export function detectDelimiter(line: string): string {
  const tabCount = (line.match(/\t/g) ?? []).length;
  const semiCount = (line.match(/;/g) ?? []).length;
  const commaCount = (line.match(/,/g) ?? []).length;
  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  if (semiCount > commaCount && semiCount > tabCount) return ';';
  return ',';
}

/** Maps column indices for code, description, UOM, and quantity. */
export function detectHeaderColumns(headers: string[]): ColumnMapping | null {
  let codeIdx = -1;
  let descIdx = -1;
  let uomIdx = -1;
  let qtyIdx = -1;

  headers.forEach((rawHeader, idx) => {
    const clean = rawHeader.trim().toLowerCase();
    if (codeIdx === -1 && /(^item\s*code|^item\s*#|^item\s*id|^sl\.?\s*no|^s\.?\s*no|^code$|^#$)/i.test(clean)) {
      codeIdx = idx;
    } else if (qtyIdx === -1 && /(quantity|required|units?\s*count|^qty$|amount)/i.test(clean)) {
      qtyIdx = idx;
    } else if (uomIdx === -1 && /(^uom$|unit\s*\(uom\)|\bunit\b|measurement|measure)/i.test(clean)) {
      uomIdx = idx;
    } else if (descIdx === -1 && /(desc|specification|spec|scope|material|title|item\s*name)/i.test(clean)) {
      descIdx = idx;
    }
  });

  return descIdx !== -1 && qtyIdx !== -1 ? { codeIdx, descIdx, uomIdx, qtyIdx } : null;
}

export function isLikelyItemCode(val: string): boolean {
  if (!val || val.trim().length === 0 || val.trim().length > 35) return false;
  const clean = val.trim();
  if (clean.split(/\s+/).length > 3) return false;
  const lower = clean.toLowerCase();
  return !ACTION_VERBS.some((verb) => lower.startsWith(verb));
}

function resolveFallbackMapping(colCount: number): ColumnMapping {
  if (colCount >= 4) return { codeIdx: 0, descIdx: 1, uomIdx: 2, qtyIdx: 3 };
  if (colCount === 3) return { codeIdx: -1, descIdx: 0, uomIdx: 1, qtyIdx: 2 };
  return { codeIdx: -1, descIdx: 0, uomIdx: -1, qtyIdx: 1 };
}

function parseQuantityValue(rawQty: string | undefined): number {
  if (!rawQty || rawQty.trim() === '') return 0;
  const clean = rawQty.replace(/[^0-9.-]+/g, '');
  if (!clean) return 1.0;
  const parsed = parseFloat(clean);
  return !isNaN(parsed) && parsed >= 0 ? parsed : 1.0;
}

function isContinuationRow(cols: string[], mapping: ColumnMapping, prevItem?: RequesterBOQItem): boolean {
  if (!prevItem || mapping.codeIdx === -1 || cols.length === 0) return false;
  const firstCol = cols[0]?.trim() || '';
  if (!firstCol) return true;
  const lower = firstCol.toLowerCase();
  return ACTION_VERBS.some((verb) => lower.startsWith(verb));
}

function parseUnquotedContinuationRow(cols: string[]): ParsedRowFields {
  const lastCol = cols[cols.length - 1].trim();
  const lastQty = parseQuantityValue(lastCol);
  const textCols = lastQty > 0 ? cols.slice(0, cols.length - 1) : cols;
  return {
    code: '',
    desc: textCols.map((c) => c.trim()).filter(Boolean).join(', '),
    uom: '',
    qty: lastQty,
    isContinuation: true,
  };
}

function parseExcessColsRow(cols: string[], mapping: ColumnMapping): ParsedRowFields {
  const rawCode = mapping.codeIdx >= 0 ? cols[mapping.codeIdx]?.trim() : '';
  const qty = parseQuantityValue(cols[cols.length - 1]?.trim());
  const secondLast = cols[cols.length - 2]?.trim().toLowerCase();
  const hasUom = KNOWN_UOMS.has(secondLast);
  const uom = hasUom ? cols[cols.length - 2].trim() : 'Nos';
  const descEndIdx = hasUom ? cols.length - 2 : cols.length - 1;
  const descStartIdx = mapping.codeIdx === 0 ? 1 : 0;
  const desc = cols.slice(descStartIdx, descEndIdx).map((c) => c.trim()).filter(Boolean).join(', ');
  return { code: rawCode, desc, uom, qty, isContinuation: false };
}

function parseStandardRow(cols: string[], mapping: ColumnMapping): ParsedRowFields {
  const code = mapping.codeIdx >= 0 ? (cols[mapping.codeIdx]?.trim() || '') : '';
  const desc = mapping.descIdx >= 0 ? (cols[mapping.descIdx]?.trim() || '') : '';
  const uom = mapping.uomIdx >= 0 ? (cols[mapping.uomIdx]?.trim() || 'Nos') : 'Nos';
  const qty = mapping.qtyIdx >= 0 ? parseQuantityValue(cols[mapping.qtyIdx]?.trim()) : 1.0;
  return { code, desc, uom, qty, isContinuation: false };
}

function extractRowFields(
  cols: string[],
  mapping: ColumnMapping,
  expectedColCount: number,
  prevItem?: RequesterBOQItem
): ParsedRowFields {
  if (isContinuationRow(cols, mapping, prevItem)) {
    return parseUnquotedContinuationRow(cols);
  }
  if (cols.length > expectedColCount && mapping.codeIdx === 0) {
    return parseExcessColsRow(cols, mapping);
  }
  return parseStandardRow(cols, mapping);
}

function mergeContinuationIntoItem(prevItem: RequesterBOQItem, continuation: ParsedRowFields): void {
  const connector = prevItem.desc.includes('\n') ? '\n' : (prevItem.desc ? '\n' : '');
  prevItem.desc = `${prevItem.desc}${connector}${continuation.desc}`;
  if (continuation.qty > 0 && prevItem.qty === 0) {
    prevItem.qty = continuation.qty;
  }
  if (continuation.uom && (!prevItem.uom || prevItem.uom === 'Nos')) {
    prevItem.uom = continuation.uom;
  }
}

function processParsedRow(parsed: ParsedRowFields, items: RequesterBOQItem[]): void {
  const prevItem = items[items.length - 1];
  if (parsed.isContinuation && prevItem) {
    mergeContinuationIntoItem(prevItem, parsed);
    return;
  }
  if (parsed.desc) {
    items.push({
      code: parsed.code || `BOQ-ITEM-${String(items.length + 1).padStart(3, '0')}`,
      desc: parsed.desc,
      uom: parsed.uom || 'Nos',
      qty: parsed.qty,
    });
  }
}

function parseRowsIntoItems(
  rawRows: string[],
  delimiter: string,
  mapping: ColumnMapping,
  expectedColCount: number,
  startIndex: number
): RequesterBOQItem[] {
  const items: RequesterBOQItem[] = [];
  for (let i = startIndex; i < rawRows.length; i += 1) {
    const cols = splitCSVRow(rawRows[i], delimiter);
    if (cols.length === 0 || cols.every((c) => !c.trim())) continue;
    const prevItem = items[items.length - 1];
    const parsed = extractRowFields(cols, mapping, expectedColCount, prevItem);
    processParsedRow(parsed, items);
  }
  return items;
}

/** Parses raw CSV or TSV text and converts each row into a RequesterBOQItem. */
export function parseUploadedBOQCSV(csvText: string, fileName?: string): BOQParseResult {
  if (!csvText?.trim()) {
    return { items: [], count: 0, error: 'The uploaded file is empty. Please upload a valid CSV file.' };
  }
  const rawRows = splitCSVIntoRows(csvText);
  if (rawRows.length === 0) {
    return { items: [], count: 0, error: 'The file contains no readable text rows.' };
  }

  const delimiter = detectDelimiter(rawRows[0]);
  const headerCols = splitCSVRow(rawRows[0], delimiter);
  const detectedMapping = detectHeaderColumns(headerCols);
  const startIndex = detectedMapping ? 1 : 0;
  const mapping = detectedMapping || resolveFallbackMapping(headerCols.length);
  const expectedColCount = detectedMapping ? headerCols.length : (mapping.codeIdx === 0 ? 4 : 3);

  const items = parseRowsIntoItems(rawRows, delimiter, mapping, expectedColCount, startIndex);
  if (items.length === 0) {
    return { items: [], count: 0, error: 'Could not parse any valid line items from spreadsheet.' };
  }

  logger.info('lib/boq-csv-parser', 'Successfully parsed uploaded BOQ CSV', {
    fileName: fileName || 'unnamed.csv',
    itemCount: items.length,
    firstItemCode: items[0].code,
  });

  return { items, count: items.length };
}

/** Reads text content from a File using file.text() with a fallback to FileReader. */
function readFileContentAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsText(file);
  });
}

/** Reads a File object and extracts BOQ items from CSV, TSV, or spreadsheet text. */
export async function parseUploadedBOQFile(file: File): Promise<BOQParseResult> {
  try {
    const text = await readFileContentAsText(file);
    return parseUploadedBOQCSV(text, file.name);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown file reading error';
    logger.error('lib/boq-csv-parser', 'Failed to read uploaded BOQ file', { fileName: file.name, error: errMsg });
    return { items: [], count: 0, error: `Failed to read file: ${errMsg}` };
  }
}
