import { PresetItem, CostInflator, NegotiationScript } from '@/types';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash-lite';

export const PRESET_ITEMS: PresetItem[] = [
  { name: 'Design Mix Concrete M30 with Fly Ash', qty: 450, uom: 'Cum', quote: 4200 },
  { name: 'TMT Reinforcement Steel Bars Fe500D 25mm', qty: 150, uom: 'Ton', quote: 54000 },
  { name: '20mm Polished Jet Black Granite Countertop', qty: 12.5, uom: 'Sqm', quote: 3550 },
  { name: 'Water Cooled Screw Chiller Unit 200 TR', qty: 2, uom: 'Nos', quote: 3800000 },
];

export const DEFAULT_MLEO_RATIOS = {
  material: 0.55,
  labour: 0.20,
  equipment: 0.10,
  overheads: 0.15,
  targetMarginFactor: 0.92, // 8% target discount baseline
  expectedMarginPercent: 12,
};

export const DEFAULT_COST_INFLATORS: CostInflator[] = [
  {
    title: 'Supplier Risk Premium',
    description: 'Vendor has loaded a 10-14% cushion against spot price spikes and extended payment cycles.'
  },
  {
    title: 'Unoptimized Fabrication Log',
    description: 'Standard shop-drawings show 6% scrap allowance vs industry benchmark of 2.8% for automated CNC processing.'
  }
];

export const DEFAULT_NEGOTIATION_SCRIPTS: NegotiationScript[] = [
  {
    title: 'MLEO Cost Realignment Tactic',
    argument: 'Reference corporate schedule rate and historical PO data. Emphasize off-peak dispatch and guaranteed 30-day payment.'
  },
  {
    title: 'Volume Commitment Counter',
    argument: 'Bundle future phase requisitions in exchange for immediate 6-8% concession on current item unit rate.'
  }
];
