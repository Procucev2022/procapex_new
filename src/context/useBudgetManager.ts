import { useState, useEffect } from 'react';
import type {
  BudgetCategory,
  ProjectBudgetState,
  AuditLog,
  BudgetManagerHook,
  AddCategoryInput,
  AddSubCategoryInput,
  AddStandardBOQItemInput,
  SubCategory,
  StandardBOQItem,
} from '@/types';
import {
  INITIAL_PROJECT_CATEGORIES,
  INITIAL_PROJECT_BUDGET,
  BUDGET_QUANTITY_UPDATE_SCHEMA,
  BUDGET_CONTINGENCY_SCHEMA,
  BUDGET_SQFT_UPDATE_SCHEMA,
  ADD_CATEGORY_SCHEMA,
  ADD_SUBCATEGORY_SCHEMA,
  ADD_STANDARD_BOQ_ITEM_SCHEMA,
  ITEM_HOLD_TOGGLE_SCHEMA,
} from '@/constants';
import { logger } from '../lib/logger';
import { validateSchema } from '../lib/validator';
import {
  recalculateProjectBudget,
  generateCategoryCSV,
  generateProjectCSV,
  generateCategorySummaryCSV,
} from '../lib/budget-utils';

export const STORAGE_KEY_CATEGORIES = 'procapex_project_categories_v2';
export const STORAGE_KEY_BUDGET = 'procapex_project_budget_v2';

/**
 * Loads project categories from localStorage if available, falling back to INITIAL_PROJECT_CATEGORIES.
 */
export function getStoredCategories(): BudgetCategory[] {
  if (typeof window === 'undefined') {
    return INITIAL_PROJECT_CATEGORIES;
  }
  try {
    const cached = window.localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    logger.warn('context/budget', 'Failed reading categories from localStorage', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return INITIAL_PROJECT_CATEGORIES;
}

/**
 * Loads project budget from localStorage if available, falling back to INITIAL_PROJECT_BUDGET.
 */
export function getStoredBudget(): ProjectBudgetState {
  if (typeof window === 'undefined') {
    return INITIAL_PROJECT_BUDGET;
  }
  try {
    const cached = window.localStorage.getItem(STORAGE_KEY_BUDGET);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.grandTotalBudgeted === 'number') {
        return parsed;
      }
    }
  } catch (err) {
    logger.warn('context/budget', 'Failed reading budget from localStorage', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return INITIAL_PROJECT_BUDGET;
}

/**
 * Merges server categories with local categories, ensuring no local categories,
 * subcategories, or standard BOQ items are lost.
 */
export function mergeCategoryCollections(
  primary: BudgetCategory[],
  secondary: BudgetCategory[],
): BudgetCategory[] {
  const merged = [...primary];
  secondary.forEach((sCat) => {
    const pIndex = merged.findIndex(
      (m) => m.id === sCat.id || m.name.toLowerCase() === sCat.name.toLowerCase(),
    );
    if (pIndex === -1) {
      merged.push(sCat);
      return;
    }
    const pCat = merged[pIndex];
    // Merge subcategories
    if (sCat.subCategories) {
      const existingSubNames = new Set(
        (pCat.subCategories ?? []).map((s) => s.name.toLowerCase()),
      );
      const newSubs = sCat.subCategories.filter(
        (s) => !existingSubNames.has(s.name.toLowerCase()),
      );
      if (newSubs.length > 0) {
        pCat.subCategories = [...(pCat.subCategories ?? []), ...newSubs];
      }
    }
    // Merge items
    if (sCat.items) {
      const existingCodes = new Set(pCat.items.map((it) => it.code.toUpperCase()));
      const newItems = sCat.items.filter((it) => !existingCodes.has(it.code.toUpperCase()));
      if (newItems.length > 0) {
        pCat.items = [...pCat.items, ...newItems];
      }
    }
  });
  return merged;
}

/**
 * Persists categories and budget to localStorage and asynchronously syncs to the database API.
 */
export function persistCategoriesToStorageAndApi(
  categories: BudgetCategory[],
  budget?: ProjectBudgetState,
): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
      if (budget) {
        window.localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budget));
      }
    } catch (err) {
      logger.warn('context/budget', 'Failed saving categories to localStorage', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Background sync to database API
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    window.fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    }).catch((err) => {
      logger.warn('context/budget', 'Background sync to /api/categories failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }
}

/**
 * Automatically derives a clean, uppercase short code from a name.
 */
export function deriveShortCode(name: string): string {
  if (!name?.trim()) return 'CAT';
  const clean = name.trim().toUpperCase();
  const words = clean.split(/[\s&/\\_-]+/).filter(Boolean);
  if (words.length === 0) return 'CAT';
  if (words.length === 1) {
    const single = words[0].replace(/[^A-Z0-9]/g, '');
    return single.slice(0, 6) || 'CAT';
  }
  if (words.length >= 3) {
    const initials = words.map((w) => w[0]).join('').slice(0, 6);
    const cleanInitials = initials.replace(/[^A-Z0-9]/g, '');
    if (cleanInitials.length >= 2) return cleanInitials;
  }
  const first = words[0].replace(/[^A-Z0-9]/g, '').slice(0, 4);
  const second = words[1].replace(/[^A-Z0-9]/g, '').slice(0, 3);
  const combined = `${first}${second}`.slice(0, 6);
  return combined || 'CAT';
}

/**
 * Generates a guaranteed collision-free unique code for a new Standard BOQ item.
 */
export function generateUniqueItemCode(
  categories: BudgetCategory[],
  categoryId: string,
  subCategoryId?: string,
): string {
  const category = categories.find((c) => c.id === categoryId);
  const catPrefix = category?.shortCode
    ? category.shortCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
    : 'CAT';

  let subPrefix = 'GEN';
  if (subCategoryId && category?.subCategories) {
    const sub = category.subCategories.find((s) => s.id === subCategoryId);
    if (sub?.shortCode) {
      subPrefix = sub.shortCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
  }

  const existingCodes = new Set<string>();
  categories.forEach((cat) => {
    cat.items.forEach((item) => existingCodes.add(item.code.toUpperCase()));
  });

  let seq = (category?.items.length ?? 0) + 1;
  let candidate = `${catPrefix}-${subPrefix}-${String(seq).padStart(3, '0')}`;
  while (existingCodes.has(candidate)) {
    seq += 1;
    candidate = `${catPrefix}-${subPrefix}-${String(seq).padStart(3, '0')}`;
  }

  return candidate;
}

export function useBudgetManager(
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>,
): BudgetManagerHook {
  const [projectCategories, setProjectCategories] = useState<BudgetCategory[]>(INITIAL_PROJECT_CATEGORIES);
  const [projectBudget, setProjectBudget] = useState<ProjectBudgetState>(INITIAL_PROJECT_BUDGET);

  // Synchronize with localStorage and database API on mount (prevents SSR hydration mismatch)
  useEffect(() => {
    let isMounted = true;
    if (typeof window === 'undefined') {
      return;
    }

    // 1. Immediately restore cached categories from localStorage upon client hydration
    try {
      const storedCats = getStoredCategories();
      const storedBudget = getStoredBudget();
      if (isMounted && storedCats && storedCats.length > 0) {
        setProjectCategories(storedCats);
      }
      if (isMounted && storedBudget) {
        setProjectBudget(storedBudget);
      }
    } catch (err) {
      logger.warn('context/budget', 'Failed restoring categories from localStorage on mount', {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // 2. Synchronize with database API in background
    if (typeof window.fetch === 'function') {
      const syncWithDb = async (): Promise<void> => {
        try {
          const res = await window.fetch('/api/categories');
          if (!res.ok) return;
          const data = await res.json();
          if (isMounted && data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setProjectCategories((current) => {
              const merged = mergeCategoryCollections(data.categories, current);
              persistCategoriesToStorageAndApi(merged);
              setProjectBudget((prevBudget) => recalculateProjectBudget(merged, prevBudget));
              return merged;
            });
          }
        } catch (err) {
          logger.warn('context/budget', 'Initial fetch from /api/categories failed', {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      };

      void syncWithDb();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const updateItemQuantity = (categoryId: string, itemId: string, newQty: number): void => {
    const validation = validateSchema({ categoryId, itemId, newQty }, BUDGET_QUANTITY_UPDATE_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/budget', 'Invalid budget quantity input', { errors: validation.errors });
      return;
    }

    setProjectCategories((prevCategories) => {
      const updatedCategories = prevCategories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const updatedItems = cat.items.map((item) => {
          if (item.id !== itemId) return item;
          const calculatedCost = Math.round(newQty * item.benchmarkRate);
          return { ...item, qty: newQty, calculatedCost };
        });

        const subtotalCost = updatedItems
          .filter((it) => it.status !== 'ON_HOLD')
          .reduce((acc, it) => acc + it.calculatedCost, 0);
        return { ...cat, items: updatedItems, subtotalCost };
      });

      setProjectBudget((prevBudget) => {
        const nextBudget = recalculateProjectBudget(updatedCategories, prevBudget);
        persistCategoriesToStorageAndApi(updatedCategories, nextBudget);
        return nextBudget;
      });
      return updatedCategories;
    });

    logger.info('context/budget', 'Updated project standard BOQ quantity', { categoryId, itemId, newQty });
  };

  const updateContingencyRate = (newRatePercent: number): void => {
    const validation = validateSchema({ contingencyRatePercent: newRatePercent }, BUDGET_CONTINGENCY_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/budget', 'Invalid contingency rate', { errors: validation.errors });
      return;
    }

    setProjectBudget((prevBudget) => recalculateProjectBudget(projectCategories, prevBudget, newRatePercent));
    logger.info('context/budget', 'Updated project contingency rate', { newRatePercent });
  };

  const freezeBudgetBaseline = (): void => {
    setProjectBudget((prev) => ({
      ...prev,
      status: 'BASELINED',
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: 'Sunil Deshmukh (Chief Financial Officer)',
    }));

    setAuditLogs((prev) => [
      {
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        user: 'Sunil Deshmukh (Chief Financial Officer)',
        action: 'Project Budget Baseline Frozen',
        detail: `Locked financial baseline of ₹${projectBudget.grandTotalBudgeted.toLocaleString('en-IN')}`,
      },
      ...prev,
    ]);

    logger.info('context/budget', 'Project budget baseline locked & frozen');
  };

  const resetCategoryQuantities = (categoryId: string): void => {
    setProjectCategories((prevCategories) => {
      const updatedCategories = prevCategories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const updatedItems = cat.items.map((item) => ({
          ...item,
          qty: item.defaultQty,
          calculatedCost: Math.round(item.defaultQty * item.benchmarkRate),
        }));

        const subtotalCost = updatedItems
          .filter((it) => it.status !== 'ON_HOLD')
          .reduce((acc, it) => acc + it.calculatedCost, 0);
        return { ...cat, items: updatedItems, subtotalCost };
      });

      setProjectBudget((prevBudget) => {
        const nextBudget = recalculateProjectBudget(updatedCategories, prevBudget);
        persistCategoriesToStorageAndApi(updatedCategories, nextBudget);
        return nextBudget;
      });
      return updatedCategories;
    });

    logger.info('context/budget', 'Reset category quantities to standard defaults', { categoryId });
  };

  const updateProjectSqFt = (newSqFt: number): void => {
    const validation = validateSchema({ totalProjectSqFt: newSqFt }, BUDGET_SQFT_UPDATE_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/budget', 'Invalid project square feet input', { errors: validation.errors });
      return;
    }

    setProjectBudget((prevBudget) =>
      recalculateProjectBudget(projectCategories, prevBudget, undefined, newSqFt),
    );
    logger.info('context/budget', 'Updated project built-up area (sq.ft)', { newSqFt });
  };

  const downloadCategoryBOQCSV = (categoryId: string): void => {
    const category = projectCategories.find((c) => c.id === categoryId);
    if (!category) return;
    generateCategoryCSV(category);
    logger.info('context/budget', 'Requested Category Standard BOQ CSV', { categoryId });
  };

  const downloadProjectBudgetCSV = (): void => {
    generateProjectCSV(projectCategories, projectBudget);
    logger.info('context/budget', 'Requested Consolidated Project Budget CSV', {
      projectId: projectBudget.projectId,
    });
  };

  const downloadCategorySummaryCSV = (): void => {
    generateCategorySummaryCSV(projectCategories, projectBudget);
    logger.info('context/budget', 'Requested Category Budget Summary CSV', {
      projectId: projectBudget.projectId,
    });
  };

  const addCategory = (input: AddCategoryInput): BudgetCategory => {
    const validation = validateSchema(input, ADD_CATEGORY_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/budget', 'Rejected invalid category addition payload', { errors: validation.errors });
      throw new Error(`Invalid category payload: ${validation.errors.map((e) => e.message).join(', ')}`);
    }

    const majorName = input.majorCategory?.trim() || input.name.trim();
    const subName = input.subCategory?.trim();

    // Collect all minor categories from input.subCategories array and input.subCategory string
    const subNames: string[] = [];
    if (Array.isArray(input.subCategories)) {
      input.subCategories.forEach((s) => {
        const trimmed = typeof s === 'string' ? s.trim() : '';
        if (trimmed && !subNames.includes(trimmed)) {
          subNames.push(trimmed);
        }
      });
    }
    if (subName && !subNames.includes(subName)) {
      subNames.push(subName);
    }

    const existing = projectCategories.find(
      (c) => c.name.toLowerCase() === majorName.toLowerCase(),
    );

    if (existing) {
      const updatedSubCategories = [...(existing.subCategories || [])];
      subNames.forEach((name) => {
        if (!updatedSubCategories.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
          const subCode = deriveShortCode(name);
          updatedSubCategories.push({
            id: `SUB-${existing.shortCode}-${Date.now().toString().slice(-4)}-${updatedSubCategories.length + 1}`,
            categoryId: existing.id,
            name,
            shortCode: subCode,
            description: input.description,
          });
        }
      });

      const updatedCategory: BudgetCategory = {
        ...existing,
        subCategories: updatedSubCategories,
        baselineBudget: existing.baselineBudget + (input.baselineBudget ?? 0),
      };

      setProjectCategories((prev) => {
        const next = prev.map((c) => (c.id === existing.id ? updatedCategory : c));
        setProjectBudget((prevBudget) => {
          const nextBudget = recalculateProjectBudget(next, prevBudget);
          persistCategoriesToStorageAndApi(next, nextBudget);
          return nextBudget;
        });
        return next;
      });

      setAuditLogs((prev) => [
        {
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'Category Manager (Catalog Master)',
          action: 'Procurement Sub-Category Appended to Master',
          detail: `Updated Category ${existing.name} with Minor Categories: ${subNames.join(', ') || 'N/A'}`,
        },
        ...prev,
      ]);

      logger.info('context/budget', 'Updated existing category with minor categories', {
        categoryId: existing.id,
        majorName,
        subNamesCount: subNames.length,
      });

      return updatedCategory;
    }

    const shortCode = input.shortCode?.trim()
      ? input.shortCode.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '')
      : deriveShortCode(majorName);

    const cleanId = `CAT-${shortCode}`;
    const categoryId = projectCategories.some((c) => c.id === cleanId)
      ? `${cleanId}-${Date.now().toString().slice(-4)}`
      : cleanId;

    const costCenter = input.costCenter?.trim()
      ? input.costCenter.trim()
      : `CC-${shortCode} (${majorName})`;

    const description = input.description?.trim()
      ? input.description.trim()
      : `${majorName} scope of work and specifications`;

    const initialSubCategories: SubCategory[] = subNames.map((name, idx) => ({
      id: `SUB-${shortCode}-${String(idx + 1).padStart(2, '0')}`,
      categoryId,
      name,
      shortCode: deriveShortCode(name),
      description: input.description,
    }));

    const newCategory: BudgetCategory = {
      id: categoryId,
      name: majorName,
      shortCode,
      costCenter,
      description,
      subCategories: initialSubCategories,
      items: [],
      subtotalCost: 0,
      baselineBudget: input.baselineBudget ?? 0,
      committedCost: 0,
      status: 'DRAFT',
    };

    setProjectCategories((prev) => {
      const next = [...prev, newCategory];
      setProjectBudget((prevBudget) => {
        const nextBudget = recalculateProjectBudget(next, prevBudget);
        persistCategoriesToStorageAndApi(next, nextBudget);
        return nextBudget;
      });
      return next;
    });

    setAuditLogs((prev) => [
      {
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        user: 'Category Manager (Catalog Master)',
        action: 'New Procurement Category Added',
        detail: `Created Category ${newCategory.name} (${newCategory.shortCode}) with ${initialSubCategories.length} Minor Categories`,
      },
      ...prev,
    ]);

    logger.info('context/budget', 'Created new standard procurement category', {
      categoryId: newCategory.id,
      name: newCategory.name,
      subCategoriesCount: initialSubCategories.length,
    });

    return newCategory;
  };

  const addSubCategory = (input: AddSubCategoryInput): SubCategory => {
    const validation = validateSchema(input, ADD_SUBCATEGORY_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/budget', 'Rejected invalid subcategory addition payload', { errors: validation.errors });
      throw new Error(`Invalid subcategory payload: ${validation.errors.map((e) => e.message).join(', ')}`);
    }

    const targetCategory = projectCategories.find((c) => c.id === input.categoryId);
    if (!targetCategory) {
      logger.warn('context/budget', 'Cannot add subcategory: Target category not found', { categoryId: input.categoryId });
      throw new Error(`Category not found with ID: ${input.categoryId}`);
    }

    const shortCode = input.shortCode?.trim()
      ? input.shortCode.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '')
      : deriveShortCode(input.name);

    const subCatId = `SUB-${shortCode}-${Date.now().toString().slice(-4)}`;

    const newSubCategory: SubCategory = {
      id: subCatId,
      categoryId: input.categoryId,
      name: input.name.trim(),
      shortCode,
      description: input.description?.trim() || `${input.name.trim()} trade scope`,
    };

    setProjectCategories((prev) => {
      const next = prev.map((cat) => {
        if (cat.id !== input.categoryId) return cat;
        const subCategories = [...(cat.subCategories ?? []), newSubCategory];
        return { ...cat, subCategories };
      });
      persistCategoriesToStorageAndApi(next);
      return next;
    });

    setAuditLogs((prev) => [
      {
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        user: 'Category Manager (Catalog Master)',
        action: 'New Sub-Category Added',
        detail: `Created Sub-Category ${newSubCategory.name} (${newSubCategory.shortCode}) under ${targetCategory.name}`,
      },
      ...prev,
    ]);

    logger.info('context/budget', 'Created new subcategory under category', {
      subCategoryId: newSubCategory.id,
      categoryId: input.categoryId,
      name: newSubCategory.name,
    });

    return newSubCategory;
  };

  const addStandardBOQItem = (input: AddStandardBOQItemInput): StandardBOQItem => {
    const validation = validateSchema(input, ADD_STANDARD_BOQ_ITEM_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/budget', 'Rejected invalid standard BOQ item payload', { errors: validation.errors });
      throw new Error(`Invalid standard BOQ item payload: ${validation.errors.map((e) => e.message).join(', ')}`);
    }

    const targetCategory = projectCategories.find((c) => c.id === input.categoryId);
    if (!targetCategory) {
      logger.warn('context/budget', 'Target category not found for BOQ item', { categoryId: input.categoryId });
      throw new Error(`Category not found with ID: ${input.categoryId}`);
    }

    const subCategory = targetCategory.subCategories?.find((s) => s.id === input.subCategoryId);
    const uniqueCode = generateUniqueItemCode(projectCategories, input.categoryId, input.subCategoryId);
    const calculatedCost = Math.round(input.defaultQty * input.benchmarkRate);
    const itemId = `ITM-${uniqueCode}-${Date.now().toString().slice(-4)}`;

    const newItem: StandardBOQItem = {
      id: itemId,
      code: uniqueCode,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
      subCategoryName: subCategory?.name,
      desc: input.desc.trim(),
      uom: input.uom.trim(),
      benchmarkRate: input.benchmarkRate,
      defaultQty: input.defaultQty,
      qty: input.defaultQty,
      calculatedCost,
      status: 'ACTIVE',
      isImmutable: true,
      benchmarkDetails: {
        benchmarkRate: input.benchmarkRate,
        masterRateCardRate: input.benchmarkRate,
        historicalLowestRate: input.benchmarkRate,
        aiConfidence: '95%',
        varianceVsRateCardPercent: 0,
      },
      notes: input.notes?.trim(),
    };

    setProjectCategories((prev) => {
      const updatedCategories = prev.map((cat) => {
        if (cat.id !== input.categoryId) return cat;
        const updatedItems = [...cat.items, newItem];
        const subtotalCost = updatedItems
          .filter((it) => it.status !== 'ON_HOLD')
          .reduce((acc, it) => acc + it.calculatedCost, 0);
        return { ...cat, items: updatedItems, subtotalCost };
      });

      setProjectBudget((prevBudget) => {
        const nextBudget = recalculateProjectBudget(updatedCategories, prevBudget);
        persistCategoriesToStorageAndApi(updatedCategories, nextBudget);
        return nextBudget;
      });
      return updatedCategories;
    });

    setAuditLogs((prev) => [
      {
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        user: 'Category Manager (Catalog Master)',
        action: 'Standard BOQ Item Created',
        detail: `Added system-coded item ${uniqueCode} to ${targetCategory.name}`,
      },
      ...prev,
    ]);

    logger.info('context/budget', 'Created system-coded standard BOQ line item', {
      itemId: newItem.id,
      code: newItem.code,
      categoryId: input.categoryId,
    });

    return newItem;
  };

  const uploadBatchStandardBOQItems = (inputs: AddStandardBOQItemInput[]): StandardBOQItem[] => {
    if (!inputs || inputs.length === 0) {
      logger.warn('context/budget', 'Empty batch items array passed to uploadBatchStandardBOQItems');
      return [];
    }

    const createdItems: StandardBOQItem[] = [];
    const updatedCategories: BudgetCategory[] = projectCategories.map((c) => ({
      ...c,
      items: [...c.items],
    }));

    inputs.forEach((input) => {
      const validation = validateSchema(input, ADD_STANDARD_BOQ_ITEM_SCHEMA);
      if (!validation.isValid) {
        logger.warn('context/budget', 'Skipping invalid batch item in upload', { errors: validation.errors });
        return;
      }

      const targetCategory = updatedCategories.find((c) => c.id === input.categoryId);
      if (!targetCategory) {
        logger.warn('context/budget', 'Category not found for batch item', { categoryId: input.categoryId });
        return;
      }

      const subCategory = targetCategory.subCategories?.find((s) => s.id === input.subCategoryId);
      const uniqueCode = generateUniqueItemCode(updatedCategories, input.categoryId, input.subCategoryId);
      const calculatedCost = Math.round(input.defaultQty * input.benchmarkRate);
      const itemId = `ITM-${uniqueCode}-${Date.now().toString().slice(-4)}-${createdItems.length}`;

      const newItem: StandardBOQItem = {
        id: itemId,
        code: uniqueCode,
        categoryId: input.categoryId,
        subCategoryId: input.subCategoryId,
        subCategoryName: subCategory?.name,
        desc: input.desc.trim(),
        uom: input.uom.trim(),
        benchmarkRate: input.benchmarkRate,
        defaultQty: input.defaultQty,
        qty: input.defaultQty,
        calculatedCost,
        status: 'ACTIVE',
        isImmutable: true,
        benchmarkDetails: {
          benchmarkRate: input.benchmarkRate,
          masterRateCardRate: input.benchmarkRate,
          historicalLowestRate: input.benchmarkRate,
          aiConfidence: '95%',
          varianceVsRateCardPercent: 0,
        },
        notes: input.notes?.trim(),
      };

      targetCategory.items.push(newItem);
      createdItems.push(newItem);
    });

    updatedCategories.forEach((cat) => {
      cat.subtotalCost = cat.items
        .filter((it) => it.status !== 'ON_HOLD')
        .reduce((acc, it) => acc + it.calculatedCost, 0);
    });

    setProjectCategories(updatedCategories);

    setProjectBudget((prevBudget) => {
      const nextBudget = recalculateProjectBudget(updatedCategories, prevBudget);
      persistCategoriesToStorageAndApi(updatedCategories, nextBudget);
      return nextBudget;
    });

    if (createdItems.length > 0) {
      setAuditLogs((prev) => [
        {
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'Category Manager (Batch Importer)',
          action: 'Standard BOQ Batch Items Uploaded',
          detail: `Imported ${createdItems.length} line items across categories`,
        },
        ...prev,
      ]);

      logger.info('context/budget', 'Batch uploaded standard BOQ line items via CSV', {
        count: createdItems.length,
      });
    }

    return createdItems;
  };

  const toggleItemHoldStatus = (categoryId: string, itemId: string): void => {
    const validation = validateSchema({ categoryId, itemId }, ITEM_HOLD_TOGGLE_SCHEMA);
    if (!validation.isValid) {
      logger.warn('context/budget', 'Invalid item hold toggle payload', { errors: validation.errors });
      return;
    }

    setProjectCategories((prevCategories) => {
      let targetCode = '';
      let nextStatus: 'ACTIVE' | 'ON_HOLD' = 'ACTIVE';

      const updatedCategories = prevCategories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const updatedItems = cat.items.map((item) => {
          if (item.id !== itemId) return item;
          nextStatus = item.status === 'ON_HOLD' ? 'ACTIVE' : 'ON_HOLD';
          targetCode = item.code;
          return { ...item, status: nextStatus };
        });

        const subtotalCost = updatedItems
          .filter((it) => it.status !== 'ON_HOLD')
          .reduce((acc, it) => acc + it.calculatedCost, 0);

        return { ...cat, items: updatedItems, subtotalCost };
      });

      setProjectBudget((prevBudget) => {
        const nextBudget = recalculateProjectBudget(updatedCategories, prevBudget);
        persistCategoriesToStorageAndApi(updatedCategories, nextBudget);
        return nextBudget;
      });

      setAuditLogs((prev) => [
        {
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'Category Manager (Catalog Master)',
          action: nextStatus === 'ON_HOLD' ? 'Standard BOQ Item Put On Hold' : 'Standard BOQ Item Resumed Active',
          detail: `Item ${targetCode || itemId} status updated to ${nextStatus}`,
        },
        ...prev,
      ]);

      logger.info('context/budget', 'Updated standard BOQ item hold status', {
        categoryId,
        itemId,
        newStatus: nextStatus,
      });

      return updatedCategories;
    });
  };

  return {
    projectCategories,
    projectBudget,
    updateItemQuantity,
    updateContingencyRate,
    updateProjectSqFt,
    freezeBudgetBaseline,
    resetCategoryQuantities,
    downloadCategoryBOQCSV,
    downloadProjectBudgetCSV,
    downloadCategorySummaryCSV,
    addCategory,
    addSubCategory,
    addStandardBOQItem,
    uploadBatchStandardBOQItems,
    toggleItemHoldStatus,
  };
}
