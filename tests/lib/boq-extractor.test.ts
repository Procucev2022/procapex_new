import { extractBOQItemsFromDrawing, cleanDrawingTitle } from '@/lib/boq-extractor';
import { DEFAULT_COUNTER_ITEMS, DRAWING_BOQ_CATALOGS } from '@/constants/boq';

describe('extractBOQItemsFromDrawing', () => {
  it('extracts civil & foundation BOQ items for civil drawings', () => {
    const items = extractBOQItemsFromDrawing('Foundation Raft & Footing Reinforcement.dwg');
    expect(items).toHaveLength(DRAWING_BOQ_CATALOGS.CIVIL.length);
    expect(items[0].code).toBe('FND-RCC-M30');
    expect(items.some(it => it.code === 'CIV-WAT-PROOF')).toBe(true);
  });

  it('extracts electrical items for electrical drawings', () => {
    const items = extractBOQItemsFromDrawing('Substation Power & Lighting Plan.pdf');
    expect(items).toHaveLength(DRAWING_BOQ_CATALOGS.ELECTRICAL.length);
    expect(items[0].code).toBe('ELE-XFR-1500K');
    expect(items.some(it => it.code === 'ELE-CBL-4C300')).toBe(true);
  });

  it('extracts MEP & HVAC items for HVAC drawings', () => {
    const items = extractBOQItemsFromDrawing('HVAC Chiller Plant & AHU Ducting Layout.dwg');
    expect(items).toHaveLength(DRAWING_BOQ_CATALOGS.MEP.length);
    expect(items[0].code).toBe('MEP-CHL-200TR');
    expect(items.some(it => it.code === 'MEP-DCT-GI18')).toBe(true);
  });

  it('extracts plumbing & fire fighting items for plumbing drawings', () => {
    const items = extractBOQItemsFromDrawing('Plumbing Drainage & Fire Sprinkler Schematic.pdf');
    expect(items).toHaveLength(DRAWING_BOQ_CATALOGS.PLUMBING.length);
    expect(items[0].code).toBe('PLB-PIP-CPVC');
    expect(items.some(it => it.code === 'FIR-SPR-PEND')).toBe(true);
  });

  it('extracts facade & glazing items for facade drawings', () => {
    const items = extractBOQItemsFromDrawing('Facade Curtain Wall & DGU Glazing Elevation.dwg');
    expect(items).toHaveLength(DRAWING_BOQ_CATALOGS.FACADE.length);
    expect(items[0].code).toBe('FAC-DGU-24MM');
    expect(items.some(it => it.code === 'FAC-ACP-4MM')).toBe(true);
  });

  it('extracts structural steel items for PEB & steel drawings', () => {
    const items = extractBOQItemsFromDrawing('Structural Steel PEB Shed Roof & Truss Details.dwg');
    expect(items).toHaveLength(DRAWING_BOQ_CATALOGS.STEEL.length);
    expect(items[0].code).toBe('STL-E350-BEAM');
    expect(items.some(it => it.code === 'STL-PRF-ROOF')).toBe(true);
  });

  it('extracts counter items for millwork & interior drawings', () => {
    const items = extractBOQItemsFromDrawing('Counter Elevation D.pdf');
    expect(items).toHaveLength(DEFAULT_COUNTER_ITEMS.length);
    expect(items[0].code).toBe('CNT-TOP-GRN20');
  });

  it('generates custom technical specifications for unknown drawing titles', () => {
    const items = extractBOQItemsFromDrawing('Custom Special Acoustical Ceiling Detail.pdf');
    expect(items).toHaveLength(6);
    expect(items[0].code).toMatch(/^CUS-SPEC-001/);
    expect(items[0].desc).toContain('Custom Special Acoustical Ceiling Detail.pdf');
  });

  it('extracts architectural items for architectural drawings', () => {
    const items = extractBOQItemsFromDrawing('Ground Floor Architectural Plan & Layout.dwg');
    expect(items).toHaveLength(DRAWING_BOQ_CATALOGS.ARCHITECTURAL.length);
    expect(items[0].code).toBe('ARC-MSN-AAC200');
    expect(items.some(it => it.code === 'ARC-FLR-VIT800')).toBe(true);
  });

  it('extracts interior fitout items for interior fitout drawings', () => {
    const items = extractBOQItemsFromDrawing('Executive Office Interior Fitout & Woodwork Detail.pdf');
    expect(items).toHaveLength(DRAWING_BOQ_CATALOGS.INTERIOR.length);
    expect(items[0].code).toBe('INT-LAM-PLY18');
    expect(items.some(it => it.code === 'INT-GRN-TOP20')).toBe(true);
  });

  it('uses categoryHint when drawing filename is generic', () => {
    const items = extractBOQItemsFromDrawing('drawing-sheet-01.pdf', 'Civil Infrastructure');
    expect(items).toHaveLength(DRAWING_BOQ_CATALOGS.CIVIL.length);
    expect(items[0].code).toBe('FND-RCC-M30');
  });

  it('handles empty or special character titles gracefully', () => {
    const items = extractBOQItemsFromDrawing('123!@#');
    expect(items).toHaveLength(6);
    expect(items[0].code).toBe('DWG-SPEC-001');
  });

  it('extracts full height storage woodwork & millwork items for interior storage drawings', () => {
    const items = extractBOQItemsFromDrawing('Full Height Storage Details.pdf');
    expect(items).toHaveLength(6);
    expect(items[0].code).toBe('STR-PLY-20MM');
    expect(items[0].desc).toContain('20mm Marine Grade BWP Plywood Carcass');
    expect(items.some(it => it.code === 'STR-LAM-BLK')).toBe(true);
    expect(items.some(it => it.code === 'STR-LAM-WAL')).toBe(true);
    expect(items.some(it => it.code === 'STR-SHT-FULL')).toBe(true);
    expect(items.some(it => it.code === 'STR-HDW-SOFT')).toBe(true);
    expect(items.some(it => it.code === 'STR-PLN-75MM')).toBe(true);
  });

  it('extracts industrial pallet racking items for industrial warehouse racking drawings', () => {
    const items = extractBOQItemsFromDrawing('Industrial Warehouse Pallet Racking.dwg');
    expect(items).toHaveLength(6);
    expect(items[0].code).toBe('STR-RCK-500K');
    expect(items[0].desc).toContain('Storage Racks');
    expect(items.some(it => it.code === 'STR-SHL-CRCA')).toBe(true);
    expect(items.some(it => it.code === 'STR-PLT-BEAM')).toBe(true);
  });

  it('falls back to custom specs when categoryHint does not match any domain', () => {
    const items = extractBOQItemsFromDrawing('drawing-sheet-02.pdf', 'Unknown Scope Category');
    expect(items).toHaveLength(6);
    expect(items[0].code).toMatch(/^DRA-SPEC-001/);
  });

  it('handles completely empty title string and whitespace', () => {
    const items = extractBOQItemsFromDrawing('   ');
    expect(items).toHaveLength(6);
    expect(items[0].code).toBe('DWG-SPEC-001');
    expect(items[0].desc).toContain('Technical Drawing');
  });

  it('cleans drawing titles properly with cleanDrawingTitle', () => {
    expect(cleanDrawingTitle('')).toBe('Technical Drawing');
    expect(cleanDrawingTitle('.pdf')).toBe('Technical Drawing');
    expect(cleanDrawingTitle('my_awesome-drawing.dwg')).toBe('my awesome drawing');
  });
});
