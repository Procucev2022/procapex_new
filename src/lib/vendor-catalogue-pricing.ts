/**
 * Vendor Catalogue Pricing Utilities
 *
 * Provides benchmark rate aggregation across vendor catalogue price submissions
 * for AI Costing algorithms, variance calculation, and catalogue status tracking.
 */

import type { ManagedVendor, VendorCatalogueItemPrice } from '@/types';
import { getStoredVendors } from '@/lib/vendor-storage';

export interface VendorCatalogueBenchmarkResult {
  itemCode?: string;
  category?: string;
  benchmarkRate: number;
  minRate: number;
  maxRate: number;
  vendorCount: number;
  contributingVendors: Array<{
    vendorId: string;
    vendorName: string;
    vendorPrice: number;
  }>;
}

/**
 * Calculates variance percentage between vendor price and benchmark rate.
 * Positive indicates vendor price is higher than benchmark; negative indicates lower.
 */
export function calculateCatalogueVariance(vendorPrice: number, benchmarkRate: number): number {
  if (!benchmarkRate || benchmarkRate <= 0) return 0;
  if (!vendorPrice || vendorPrice <= 0) return 0;
  return Math.round(((vendorPrice - benchmarkRate) / benchmarkRate) * 1000) / 10;
}

/**
 * Aggregates vendor catalogue prices for a given item code or description/category
 * to derive empirical market intelligence for AI costing engines.
 */
export function getVendorCatalogueBenchmark(
  itemCodeOrDesc: string,
  category?: string,
  customVendors?: ManagedVendor[]
): VendorCatalogueBenchmarkResult | null {
  if (!itemCodeOrDesc?.trim()) {
    return null;
  }
  const vendors = customVendors || getStoredVendors();
  const searchKey = itemCodeOrDesc.toLowerCase().trim();
  const catKey = category?.toLowerCase().trim();

  const matchingPrices: Array<{
    vendorId: string;
    vendorName: string;
    item: VendorCatalogueItemPrice;
  }> = [];

  for (const v of vendors) {
    if (!v.cataloguePrices) continue;

    for (const [code, priceItem] of Object.entries(v.cataloguePrices)) {
      if (priceItem.vendorPrice <= 0) continue;

      const codeMatches = code.toLowerCase() === searchKey;
      const descMatches = priceItem.itemDesc.toLowerCase().includes(searchKey) ||
        searchKey.includes(priceItem.itemDesc.toLowerCase());
      const catMatches = !catKey || priceItem.category.toLowerCase() === catKey;

      if ((codeMatches || descMatches) && catMatches) {
        matchingPrices.push({
          vendorId: v.id,
          vendorName: v.name,
          item: priceItem,
        });
      }
    }
  }

  if (matchingPrices.length === 0) {
    return null;
  }

  const rates = matchingPrices.map((m) => m.item.vendorPrice);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const sum = rates.reduce((acc, r) => acc + r, 0);
  const benchmarkRate = Math.round(sum / rates.length);

  return {
    itemCode: matchingPrices[0].item.itemCode,
    category: matchingPrices[0].item.category,
    benchmarkRate,
    minRate,
    maxRate,
    vendorCount: matchingPrices.length,
    contributingVendors: matchingPrices.map((m) => ({
      vendorId: m.vendorId,
      vendorName: m.vendorName,
      vendorPrice: m.item.vendorPrice,
    })),
  };
}
