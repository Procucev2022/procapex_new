'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  UploadCloud, 
  Download, 
  Sparkles, 
  Edit3, 
  Plus, 
  PlusCircle,
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  Paperclip, 
  FileText, 
  MapPin, 
  Layers, 
  FileUp, 
  CreditCard, 
  Store, 
  Users, 
  Truck, 
  ShieldCheck, 
  CheckSquare,
  FolderPlus,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { logger } from '@/lib/logger';

import type {
  PRModuleProps,
  RequesterBOQItem,
  AttachedDoc,
  AddCategoryInput,
  BudgetCategory,
} from '@/types';
import {
  DEFAULT_COUNTER_ITEMS,
  INITIAL_DOCS,
  VENDOR_DATABASE,
  UI_STRINGS,
  formatString,
} from '@/constants';
import { extractBOQItemsFromDrawing } from '@/lib/boq-extractor';
import { parseUploadedBOQFile } from '@/lib/boq-csv-parser';
import { AddCategoryModal } from './budget/AddCategoryModal';
import { AmendBOQModal } from './AmendBOQModal';
import { generateStandardBOQTemplateCSV, getCSVDataUri } from '@/lib/budget-utils';
import { PRHistoryTable } from './pr-history/PRHistoryTable';

export const PRModule: React.FC<PRModuleProps> = ({
  onSelectPRForBOQ,
  onNavigateToBOQ,
  onOpenNewPRModal: _onOpenNewPRModal,
  onViewPRSummary,
}) => {
  const {
    prs,
    createPR,
    approvePRByProjectHead,
    projectCategories,
    addCategory,
    addStandardBOQItem,
    managedVendors,
    circulateRFQ,
    circulatedRFQs,
  } = useProcurement();
  const safeProjectCategories = projectCategories ?? [];
  const allVendors = (managedVendors && managedVendors.length > 0) ? managedVendors : VENDOR_DATABASE;

  const computeNextPRId = (): string => {
    const maxNum = (prs || []).reduce((max, p) => {
      const match = p.id.match(/PR-\d{4}-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 5);
    return `PR-2026-${String(maxNum + 1).padStart(4, '0')}`;
  };

  const [currentPRId, setCurrentPRId] = useState<string>('PR-2026-0005');
  const [activeViewMode, setActiveViewMode] = useState<'wizard' | 'history'>('wizard');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeMethod, setActiveMethod] = useState<number>(3);
  const prSummaryRef = useRef<HTMLDivElement>(null);
  const [submittedPR, setSubmittedPR] = useState<{
    id: string;
    title: string;
    projectName: string;
    costCentre: string;
    category: string;
    requester: string;
    reqDate: string;
    itemsCount: number;
    estBaseline: number;
    status: string;
    deliveryAddress: string;
    nominatedVendors: string[];
    docsCount: number;
  } | null>(null);

  const handleStartNewPR = (): void => {
    const nextId = computeNextPRId();
    setCurrentPRId(nextId);
    setSubmittedPR(null);
    setCurrentStep(1);
    setActiveViewMode('wizard');
    setPrDescription('');
    setDepartmentName('');
    setCostCentre('');
    setSquareFeet('');
    setPriority('');
    setExpectedDate('');
    setMajorCategory('');
    setSubCategory('');
    setPackageCode('');
    setItems([]); // All columns blank
    setDrawingInput('');
    setUploadedDrawingFile(null);
    setUploadedBOQFile(null);
    setExtractionFeedback(null);
    setItemsSourceName('');
    setSelectedSupplierIds([]);
    setDeliveryAddress('');
    setSiteContact('');
    setStagingPlan('');
    setUnloadingReq('');
    setDocuments([]);
  };
  
  // Step 1: General Form State
  const [prCorresponds, setPrCorresponds] = useState<string>('Product');
  const [departmentName, setDepartmentName] = useState<string>('Architecture & Interior Finishing');
  const [prDescription, setPrDescription] = useState<string>('Fabrication & Installation of Reception Counter (Drawing: Counter Elevation D)');
  const [priority, setPriority] = useState<string>('High');
  const [expectedDate, setExpectedDate] = useState<string>('2026-09-25');
  const [costCentre, setCostCentre] = useState<string>('CC-104');
  const [squareFeet, setSquareFeet] = useState<string>('4,500');

  // Step 2: Category State
  const [majorCategory, setMajorCategory] = useState<string>('Interior & Fitouts');
  const [subCategory, setSubCategory] = useState<string>(
    safeProjectCategories[0]?.subCategories?.[0]?.name ?? 'Earthwork & Excavation'
  );
  const [packageCode, setPackageCode] = useState<string>(
    'PKG-2026-INT-001 (Reception Counter & Lobby Joinery Package)'
  );
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
  const [selectedStandardCategoryId, setSelectedStandardCategoryId] = useState<string>(
    safeProjectCategories[0]?.id ?? 'CAT-CIVIL'
  );

  const currentPRCategory = useMemo(() => {
    return (
      safeProjectCategories.find(
        (c) =>
          c.name.trim().toLowerCase() === majorCategory.trim().toLowerCase() ||
          c.name.toLowerCase().includes(majorCategory.toLowerCase()) ||
          majorCategory.toLowerCase().includes(c.name.toLowerCase())
      ) ??
      safeProjectCategories.find(
        (c) => c.id === selectedStandardCategoryId
      ) ??
      safeProjectCategories[0]
    );
  }, [safeProjectCategories, majorCategory, selectedStandardCategoryId]);

  useEffect(() => {
    const matched = safeProjectCategories.find(
      (c) =>
        c.name.trim().toLowerCase() === majorCategory.trim().toLowerCase() ||
        c.name.toLowerCase().includes(majorCategory.toLowerCase()) ||
        majorCategory.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matched && matched.id !== selectedStandardCategoryId) {
      setSelectedStandardCategoryId(matched.id);
    }
  }, [majorCategory, safeProjectCategories, selectedStandardCategoryId]);

  const handleAddCategoryFromPR = (input: AddCategoryInput): void => {
    let createdCat: BudgetCategory | undefined;
    if (addCategory) {
      createdCat = addCategory(input);
    }
    const majorName = input.majorCategory?.trim() || input.name.trim();
    setMajorCategory(majorName);
    if (createdCat) {
      setSelectedStandardCategoryId(createdCat.id);
      if (createdCat.subCategories && createdCat.subCategories.length > 0) {
        setSubCategory(createdCat.subCategories[0].name);
      }
    } else {
      const firstMinor = input.subCategories?.[0] ?? input.subCategory?.trim();
      if (firstMinor) {
        setSubCategory(firstMinor);
      }
    }
    setIsAddCategoryModalOpen(false);
  };

  const handleLoadStandardPackage = (catId: string): void => {
    const targetCat = safeProjectCategories.find((c) => c.id === catId);
    if (!targetCat || targetCat.items.length === 0) {
      setBoqUploadError('Selected package has no standard BOQ items configured.');
      return;
    }
    const mappedItems: RequesterBOQItem[] = targetCat.items.map((it) => ({
      id: it.code,
      code: it.code,
      desc: it.desc,
      uom: it.uom,
      qty: 0,
      benchmark: it.benchmarkRate,
      rateCard: it.benchmarkRate,
      status: 'Active',
    }));
    setItems(mappedItems);
    setItemsSourceName(`Standard Package: ${targetCat.name} (Blank Quantities)`);
    setBoqUploadSuccess(
      `Loaded ${mappedItems.length} items from ${targetCat.name} standard catalog into BOQ schedule without quantity.`
    );
    setBoqUploadError(null);
    setIsNewlyGenerated(true);
  };

  // Step 3: BOQ Items State
  const [items, setItems] = useState<RequesterBOQItem[]>(DEFAULT_COUNTER_ITEMS);
  const [drawingInput, setDrawingInput] = useState<string>('Counter Elevation D');
  const drawingFileInputRef = useRef<HTMLInputElement>(null);
  const boqScheduleRef = useRef<HTMLDivElement>(null);
  const [isExtractingDrawing, setIsExtractingDrawing] = useState<boolean>(false);
  const [extractionStage, setExtractionStage] = useState<string>('');
  const [isNewlyGenerated, setIsNewlyGenerated] = useState<boolean>(false);
  const [uploadedDrawingFile, setUploadedDrawingFile] = useState<AttachedDoc | null>({
    name: 'Counter_Elevation_D_Approved_Drawing.pdf',
    type: 'Architectural Drawing (.pdf)',
    size: '2.4 MB',
    date: '2026-09-06',
    status: 'Attached',
  });
  const [extractionFeedback, setExtractionFeedback] = useState<string | null>(
    'Extracted from Counter Elevation D: 6 itemized specifications with benchmark rates hidden.'
  );
  const method1FileInputRef = useRef<HTMLInputElement>(null);
  const method2FileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef<boolean>(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const [uploadedBOQFile, setUploadedBOQFile] = useState<{
    name: string;
    size: string;
    lineCount: number;
  } | null>(null);
  const [isUploadingBOQ, setIsUploadingBOQ] = useState<boolean>(false);
  const [boqUploadError, setBoqUploadError] = useState<string | null>(null);
  const [boqUploadSuccess, setBoqUploadSuccess] = useState<string | null>(null);
  const [itemsSourceName, setItemsSourceName] = useState<string>('Drawing: Counter Elevation D');
  const [editingItem, setEditingItem] = useState<{ item: RequesterBOQItem; index: number } | null>(null);
  const [isAmendModalOpen, setIsAmendModalOpen] = useState<boolean>(false);

  const handleOpenAmend = (it: RequesterBOQItem, idx: number): void => {
    setEditingItem({ item: it, index: idx });
    setIsAmendModalOpen(true);
  };

  const handleSaveAmendedItem = (
    amendedItem: RequesterBOQItem,
    idx: number,
    addToStandardBOQ: boolean,
    categoryId?: string,
    subCategoryId?: string,
  ): void => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = amendedItem;
      return copy;
    });

    if (addToStandardBOQ && categoryId && addStandardBOQItem) {
      try {
        addStandardBOQItem({
          categoryId,
          subCategoryId: subCategoryId || undefined,
          desc: amendedItem.desc,
          uom: amendedItem.uom,
          defaultQty: amendedItem.qty,
          benchmarkRate: amendedItem.benchmark || amendedItem.rateCard || 1500,
          notes: `Amended from Requisition ${currentPRId} (Drawing Scope)`,
        });

        const catName = safeProjectCategories.find((c) => c.id === categoryId)?.name || categoryId;
        setExtractionFeedback(
          formatString(UI_STRINGS.prModule.itemAddedToStandardBOQSuccessTemplate, {
            code: amendedItem.code,
            category: catName,
          }),
        );
      } catch (err: unknown) {
        logger.warn('components/PRModule', 'Failed to add item to standard BOQ master', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  };

  const handleClearDrawing = (): void => {
    setUploadedDrawingFile(null);
    setDrawingInput('');
    setItems([]);
    setExtractionFeedback(UI_STRINGS.prModule.drawingClearedNotice);
    setItemsSourceName('');
    setIsNewlyGenerated(false);
  };

  // Step 4: Supplier Selection State
  const [selectedRegion, setSelectedRegion] = useState<string>('WEST');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(['VND-001', 'VND-002']);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<string>('20mm Granite Countertop');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 5: Delivery Locations State
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Metro Line 4 Underground Station Yard - Depot 3, Mumbai Central (Entry Gate 2B)');
  const [siteContact, setSiteContact] = useState<string>('Rahul Verma (Site Lead Engineer) • Ph: +91 98201 44520');
  const [stagingPlan, setStagingPlan] = useState<string>('Phase 1: Internal Carcass & Framing (50%) by Sept 18; Phase 2: Countertops & Facings (50%) by Sept 25.');
  const [unloadingReq, setUnloadingReq] = useState<string>('Covered waterproof storage required on-site. Forklift required for 20mm granite crate offloading.');

  // Step 6: Terms & Conditions State
  const [tcPaymentStructure, setTcPaymentStructure] = useState<string>('MILESTONE_10_70_10_10');
  const [tcAdvancePct, setTcAdvancePct] = useState<string>('10%');
  const [tcRetentionPct, setTcRetentionPct] = useState<string>('10%');
  const [tcCreditDays, setTcCreditDays] = useState<string>('30 Calendar Days');
  const [tcAbgRequired, setTcAbgRequired] = useState<string>('YES');
  const [tcTaxTerms, setTcTaxTerms] = useState<string>('GST 18% Extra as Applicable; Statutory TDS under Section 194C / 194J deducted at source; Valid GST E-Invoice with IRN Mandatory.');
  const [tcLeadTime, setTcLeadTime] = useState<string>('12 - 15 Calendar Days');
  const [tcCompletionDate, setTcCompletionDate] = useState<string>('2026-09-25 (Strict Handover)');
  const [tcPhasedDeliveryPlan, setTcPhasedDeliveryPlan] = useState<string>('Phase 1 (Day 10): Internal carcass, BWP ply & structural framing (50%); Phase 2 (Day 18): Granite slab, laminates, hardware & LED profile (50%).');
  const [tcLdClause, setTcLdClause] = useState<string>('0.5% of total order value per week of delay or part thereof, subject to a maximum ceiling of 5.0% of the total PO contract value.');
  const [tcDlp, setTcDlp] = useState<string>('12_MONTHS');
  const [tcWarranty, setTcWarranty] = useState<string>('5 Years for Core Marine Ply & Granite');
  const [tcIncoterms, setTcIncoterms] = useState<string>('FOR_SITE');
  const [tcPriceFirmness, setTcPriceFirmness] = useState<string>('Firm & Fixed (No escalation allowed)');
  const [tcSpecialConditions, setTcSpecialConditions] = useState<string>('1. Mockup sample of granite beveling and laminate edge finish must be approved by Architect prior to batch cutting.\n2. All transit insurance and octroi/entry tolls under Supplier scope till safe offloading at site.');

  const loadTermsPreset = (presetType: string): void => {
    if (presetType === 'standard_construction') {
      setTcPaymentStructure('MILESTONE_10_70_10_10');
      setTcAdvancePct('10%');
      setTcRetentionPct('10%');
      setTcCreditDays('30 Calendar Days');
      setTcAbgRequired('YES');
      setTcTaxTerms('GST 18% Extra as Applicable; Statutory TDS under Section 194C / 194J deducted at source; Valid GST E-Invoice with IRN Mandatory.');
      setTcLeadTime('12 - 15 Calendar Days');
      setTcCompletionDate('2026-09-25 (Strict Handover)');
      setTcPhasedDeliveryPlan('Phase 1 (Day 10): Internal carcass, BWP ply & structural framing (50%); Phase 2 (Day 18): Granite slab, laminates, hardware & LED profile (50%).');
      setTcLdClause('0.5% of total order value per week of delay or part thereof, subject to a maximum ceiling of 5.0% of the total PO contract value.');
      setTcDlp('12_MONTHS');
      setTcWarranty('5 Years for Core Marine Ply & Granite');
      setTcIncoterms('FOR_SITE');
      setTcPriceFirmness('Firm & Fixed (No escalation allowed)');
    } else if (presetType === 'direct_supply') {
      setTcPaymentStructure('CREDIT_30_DAYS');
      setTcAdvancePct('0%');
      setTcRetentionPct('5%');
      setTcCreditDays('30 Calendar Days from GRN');
      setTcAbgRequired('NO');
      setTcTaxTerms('GST 18% Extra as Applicable; Statutory TDS deducted at source; Valid GST E-Invoice with IRN Mandatory.');
      setTcLeadTime('7 - 10 Calendar Days');
      setTcCompletionDate('2026-09-20 (Direct Site Supply)');
      setTcPhasedDeliveryPlan('Single Lot Delivery within 10 Calendar Days from Purchase Order acceptance.');
      setTcLdClause('0.5% per week of delay subject to a maximum of 5% of order value.');
      setTcDlp('12_MONTHS');
      setTcWarranty('1 Year OEM Standard Replacement Warranty');
      setTcIncoterms('FOR_SITE');
      setTcPriceFirmness('Firm & Fixed during delivery period');
    } else if (presetType === 'progressive_ra') {
      setTcPaymentStructure('PROGRESSIVE_RA');
      setTcAdvancePct('5%');
      setTcRetentionPct('10%');
      setTcCreditDays('30 Calendar Days from RA Bill certification');
      setTcAbgRequired('YES');
      setTcTaxTerms('GST 18% Extra as Applicable; Statutory TDS deducted at source; Valid GST E-Invoice with IRN Mandatory.');
      setTcLeadTime('20 - 30 Calendar Days');
      setTcCompletionDate('2026-10-15 (Progressive Handover)');
      setTcPhasedDeliveryPlan('Monthly progress billing based on joint site measurement verified by Client Project Engineer.');
      setTcLdClause('0.5% per week of delay subject to a maximum of 10% of total contract value.');
      setTcDlp('24_MONTHS');
      setTcWarranty('5 Years Structural & Performance Warranty');
      setTcIncoterms('FOR_SITE');
      setTcPriceFirmness('Firm & Fixed for the entire contract duration');
    }
  };

  const handlePaymentStructureChange = (val: string): void => {
    setTcPaymentStructure(val);
    if (val === 'MILESTONE_10_70_10_10') {
      setTcAdvancePct('10%');
      setTcRetentionPct('10%');
      setTcCreditDays('30 Calendar Days');
    } else if (val === 'CREDIT_30_DAYS') {
      setTcAdvancePct('0%');
      setTcRetentionPct('0%');
      setTcCreditDays('30 Days from GRN');
    } else if (val === 'CREDIT_45_DAYS') {
      setTcAdvancePct('0%');
      setTcRetentionPct('0%');
      setTcCreditDays('45 Days from GRN');
    } else if (val === 'PROGRESSIVE_RA') {
      setTcAdvancePct('5%');
      setTcRetentionPct('10%');
      setTcCreditDays('30 Days from RA Certification');
    }
  };

  // Step 7: Documents State
  const [documents, setDocuments] = useState<AttachedDoc[]>(INITIAL_DOCS);

  // Filter vendors based on category, region, and type
  const getFilteredVendors = (): typeof allVendors => {
    const targetCat = (majorCategory || '').toLowerCase().trim();
    let list = allVendors.filter((v) => {
      if (!targetCat) return true;
      const vCat = (v.category || '').toLowerCase().trim();
      const vSub = (v.subCategory || '').toLowerCase().trim();
      return (
        vCat === targetCat ||
        vCat.includes(targetCat) ||
        targetCat.includes(vCat) ||
        vSub.includes(targetCat) ||
        (targetCat.includes('interior') && vCat.includes('interior')) ||
        (targetCat.includes('civil') && vCat.includes('civil')) ||
        (targetCat.includes('mep') && vCat.includes('mep')) ||
        (targetCat.includes('steel') && (vCat.includes('steel') || vCat.includes('civil')))
      );
    });
    if (list.length === 0) list = allVendors;

    if (selectedRegion !== 'ALL') {
      const regFiltered = list.filter((v) => v.region === selectedRegion);
      if (regFiltered.length > 0) list = regFiltered;
    }

    if (selectedTypeFilter === 'RATE_CARD') {
      list = list.filter((v) => v.isRateCard);
    } else if (selectedTypeFilter === 'NON_RATE_CARD') {
      list = list.filter((v) => !v.isRateCard);
    }

    // Sort client-onboarded vendors to the top so they are immediately visible
    return [...list].sort((a, b) => {
      const aClient = a.source === 'CLIENT_ONBOARDED';
      const bClient = b.source === 'CLIENT_ONBOARDED';
      if (aClient && !bClient) return -1;
      if (!aClient && bClient) return 1;
      if (a.isRateCard && !b.isRateCard) return -1;
      if (!a.isRateCard && b.isRateCard) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  };

  const filteredVendors = getFilteredVendors();

  const toggleSupplierSelection = (id: string): void => {
    if (selectedSupplierIds.includes(id)) {
      setSelectedSupplierIds(selectedSupplierIds.filter(item => item !== id));
    } else {
      setSelectedSupplierIds([...selectedSupplierIds, id]);
    }
  };

  const removeSupplierSelection = (id: string): void => {
    setSelectedSupplierIds(selectedSupplierIds.filter(item => item !== id));
  };

  const selectAllRateCardSuppliers = (): void => {
    const list = getFilteredVendors().filter(v => v.isRateCard);
    const idsToAdd = list.map(v => v.id).filter(id => !selectedSupplierIds.includes(id));
    setSelectedSupplierIds([...selectedSupplierIds, ...idsToAdd]);
  };

  const selectAllSuppliers = (): void => {
    const list = getFilteredVendors();
    const idsToAdd = list.map(v => v.id).filter(id => !selectedSupplierIds.includes(id));
    setSelectedSupplierIds([...selectedSupplierIds, ...idsToAdd]);
  };

  const clearAllSuppliers = (): void => {
    setSelectedSupplierIds([]);
  };

  const handleQtyChange = (idx: number, val: string): void => {
    const updated = [...items];
    updated[idx].qty = parseFloat(val) || 0;
    setItems(updated);
  };

  const handleAddLine = (): void => {
    setItems([...items, { code: `ITEM-${items.length + 1}`, desc: 'Custom Site Requisition Line Item', uom: 'Nos', qty: 1 }]);
  };

  const handleRemoveLine = (idx: number): void => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: AttachedDoc[] = Array.from(e.target.files).map(f => ({
        name: f.name,
        type: 'Uploaded Document',
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().slice(0, 10),
        status: 'Attached',
      }));
      setDocuments([...documents, ...newFiles]);
    }
  };

  const triggerDrawingExtraction = async (
    titleOrFileName: string,
    fileName?: string,
    fileBase64?: string,
    fileMimeType?: string,
  ): Promise<void> => {
    setIsExtractingDrawing(true);
    setExtractionStage(UI_STRINGS.prModule.drawingScanningState);
    setItems([]);

    const cleanTitle = titleOrFileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const targetName = fileName ?? cleanTitle;

    try {
      const res = await fetch('/api/ai/extract-drawing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: targetName,
          fileType: targetName.endsWith('.pdf') ? 'application/pdf' : 'application/acad',
          drawingTitleHint: cleanTitle,
          categoryHint: majorCategory,
          fileBase64,
          fileMimeType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!isMountedRef.current) return;
        const resolvedTitle = data.drawingTitle || cleanTitle;
        setDrawingInput(resolvedTitle);
        setItems(data.items || []);
        setItemsSourceName(`Drawing: ${resolvedTitle}`);
        setExtractionFeedback(
          `AI Vision analyzed "${targetName}" and automatically generated ${data.items.length} BOQ specifications below.`
        );
        setIsNewlyGenerated(true);

        if (resolvedTitle && resolvedTitle.toLowerCase() !== 'counter elevation d') {
          setPrDescription(`Scope Execution & Material Procurement for Drawing: ${resolvedTitle}`);
        }

        logger.info('components/PRModule', 'AI Drawing extraction completed', {
          fileName: targetName,
          resolvedTitle,
          itemCount: data.items.length,
          isLiveAi: data.isLiveAi,
        });
      } else {
        const fallback = extractBOQItemsFromDrawing(cleanTitle, majorCategory);
        if (!isMountedRef.current) return;
        setDrawingInput(cleanTitle);
        setItems(fallback);
        setItemsSourceName(`Drawing: ${cleanTitle}`);
        setExtractionFeedback(
          `AI Vision analyzed "${targetName}" and automatically generated ${fallback.length} BOQ specifications below.`
        );
        setIsNewlyGenerated(true);
      }
    } catch {
      const fallback = extractBOQItemsFromDrawing(cleanTitle, majorCategory);
      if (!isMountedRef.current) return;
      setDrawingInput(cleanTitle);
      setItems(fallback);
      setItemsSourceName(`Drawing: ${cleanTitle}`);
      setExtractionFeedback(
        `AI Vision analyzed "${targetName}" and automatically generated ${fallback.length} BOQ specifications below.`
      );
      setIsNewlyGenerated(true);
    } finally {
      if (isMountedRef.current) {
        setIsExtractingDrawing(false);
        setExtractionStage('');
        boqScheduleRef.current?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsNewlyGenerated(false);
          }
        }, 3000);
      }
    }
  };

  const processDrawingFile = (file: File): void => {
    // 1. Immediately wipe previous BOQ and drawing name!
    setItems([]);
    setDrawingInput('');
    setExtractionFeedback(null);

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const isCad = file.name.endsWith('.dwg') || file.name.endsWith('.dxf');
    const isPdf = file.name.endsWith('.pdf');
    const docType = isPdf
      ? 'Architectural Drawing (.pdf)'
      : isCad
      ? 'CAD Engineering Drawing (.dwg)'
      : 'Technical Drawing Sheet';
    const newDoc: AttachedDoc = {
      name: file.name,
      type: docType,
      size: `${sizeMB} MB`,
      date: new Date().toISOString().slice(0, 10),
      status: 'Attached',
    };
    setUploadedDrawingFile(newDoc);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setDocuments((prev) => {
      if (!prev.some((d) => d.name === file.name)) {
        return [newDoc, ...prev];
      }
      return prev;
    });

    const reader = new FileReader();
    reader.onload = () => {
      if (!isMountedRef.current) return;
      const base64 = typeof reader.result === 'string' ? reader.result : undefined;
      triggerDrawingExtraction(cleanName, file.name, base64, file.type);
    };
    reader.onerror = () => {
      if (!isMountedRef.current) return;
      triggerDrawingExtraction(cleanName, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrawingFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      processDrawingFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleExtractSpecsFromDrawing = (): void => {
    if (!drawingInput.trim()) {
      alert('Please enter a drawing title or upload a drawing sheet.');
      return;
    }
    setItems([]);
    triggerDrawingExtraction(drawingInput.trim());
  };

  const handleExtractFromStep7Doc = (doc: AttachedDoc): void => {
    setUploadedDrawingFile(doc);
    const cleanName = doc.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setDrawingInput(cleanName);
    setCurrentStep(3);
    setActiveMethod(3);
    triggerDrawingExtraction(cleanName, doc.name);
  };

  const processBOQSpreadsheetFile = async (file: File): Promise<void> => {
    setIsUploadingBOQ(true);
    setBoqUploadError(null);
    setBoqUploadSuccess(null);

    try {
      const result = await parseUploadedBOQFile(file);
      if (result.error || result.items.length === 0) {
        const errorMsg = result.error || 'No valid line items found in spreadsheet.';
        setBoqUploadError(errorMsg);
        logger.warn('components/PRModule', 'BOQ file parsing error', {
          fileName: file.name,
          error: errorMsg,
        });
      } else {
        setItems(result.items);
        const sizeKB = `${(file.size / 1024).toFixed(1)} KB`;
        setUploadedBOQFile({
          name: file.name,
          size: sizeKB,
          lineCount: result.count,
        });
        setItemsSourceName(`Uploaded: ${file.name}`);
        setBoqUploadSuccess(`Successfully parsed and loaded ${result.count} line items from ${file.name}`);
        setIsNewlyGenerated(true);

        const boqDoc: AttachedDoc = {
          name: file.name,
          type: 'Site BOQ Spreadsheet (.csv)',
          size: sizeKB,
          date: new Date().toISOString().slice(0, 10),
          status: 'Attached',
        };
        setDocuments(prev => (!prev.some(d => d.name === file.name) ? [boqDoc, ...prev] : prev));

        logger.info('components/PRModule', 'BOQ file parsed and loaded into schedule', {
          fileName: file.name,
          count: result.count,
        });

        setTimeout(() => {
          boqScheduleRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);

        setTimeout(() => {
          setIsNewlyGenerated(false);
        }, 3000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown file error';
      setBoqUploadError(msg);
      logger.error('components/PRModule', 'Exception in processBOQSpreadsheetFile', {
        fileName: file.name,
        error: msg,
      });
    } finally {
      setIsUploadingBOQ(false);
    }
  };

  const handleBOQSpreadsheetUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      void processBOQSpreadsheetFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleStandardTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const result = await parseUploadedBOQFile(file);
        if (result.items.length > 0) {
          setItems(result.items);
          setItemsSourceName(`Template: ${file.name}`);
          setIsNewlyGenerated(true);
          setTimeout(() => {
            boqScheduleRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
          setTimeout(() => {
            setIsNewlyGenerated(false);
          }, 3000);
        }
      } catch (err) {
        logger.error('components/PRModule', 'Error uploading standard template', {
          fileName: file.name,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
    e.target.value = '';
  };

  const handleSubmitPR = (): void => {
    const selectedVendorObjs = allVendors.filter(v => selectedSupplierIds.includes(v.id));
    const vendorSummary = selectedVendorObjs.map(v => `${v.name} (${v.isRateCard ? 'Rate Card' : 'Non-Rate Card'})`).join(', ');
    const estBaseline = items.reduce((acc, it) => acc + ((it.rateCard || it.benchmark || 1500) * it.qty), 0);
    const targetPrId = currentPRId || 'PR-2026-0005';

    const newPR = {
      id: targetPrId,
      title: prDescription,
      projectName: 'Metro Line 4 Underground',
      costCentre: costCentre === 'CC-104' ? 'CC-104 (Finishing & Interior)' : costCentre,
      category: majorCategory,
      requester: 'Rahul Verma (Category Manager)',
      reqDate: expectedDate,
      remarks: `Preferred Vendors: ${vendorSummary || 'None Selected'} | Delivery: ${deliveryAddress}`,
      nominatedVendors: selectedSupplierIds,
      deliveryAddress,
      items: items.map(it => ({
        ...it,
        rateCard: it.rateCard || 1500,
        benchmark: it.benchmark || 1450,
        std: it.std || 1480,
        aiConf: it.aiConf || '98%',
      })),
    };

    createPR(newPR);
    if (circulateRFQ && selectedSupplierIds.length > 0) {
      circulateRFQ(targetPrId, selectedSupplierIds, expectedDate);
    }

    setSubmittedPR({
      id: targetPrId,
      title: newPR.title,
      projectName: newPR.projectName,
      costCentre: newPR.costCentre,
      category: newPR.category,
      requester: newPR.requester,
      reqDate: newPR.reqDate,
      itemsCount: items.length,
      estBaseline,
      status: 'SUBMITTED',
      deliveryAddress,
      nominatedVendors: selectedSupplierIds,
      docsCount: documents.length,
    });

    logger.info('components/PRModule', 'Purchase Requisition Submitted', {
      prId: targetPrId,
      title: newPR.title,
      itemsCount: items.length,
      estBaseline,
    });

    if (onSelectPRForBOQ) {
      onSelectPRForBOQ(targetPrId);
    } else if (onNavigateToBOQ) {
      onNavigateToBOQ(targetPrId);
    }
  };

  const renderStars = (rating: number): JSX.Element => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="inline-flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-sm ${star <= full || (star === full + 1 && hasHalf) ? 'text-amber-400' : 'text-slate-300'}`}>
            ★
          </span>
        ))}
        <span className="font-bold font-mono text-slate-800 text-xs ml-1.5">{rating.toFixed(1)}/5</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top View Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveViewMode('wizard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeViewMode === 'wizard'
                ? 'bg-brand-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>1. Requisition Wizard ({currentPRId})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeViewMode === 'history'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>2. All Raised PRs &amp; History ({prs.length})</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleStartNewPR}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise New PR</span>
        </button>
      </div>

      {activeViewMode === 'wizard' && (
      /* Main Multi-Step Form Card */
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Header: Create New Procurement Request CAPEX */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                {UI_STRINGS.prModule.roleBadge}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                L&T Infra • Metro Line 4 Underground
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {UI_STRINGS.prModule.title}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {submittedPR ? (
              <>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-400 text-xs font-mono text-emerald-300 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{UI_STRINGS.prModule.prSuccessfullySubmitted}: {submittedPR.id} (SUBMITTED)</span>
                </span>
                <button
                  type="button"
                  onClick={handleStartNewPR}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{UI_STRINGS.prModule.raiseNewPR}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-sky-500/30 text-xs font-mono text-emerald-300 font-bold">
                  Draft ID: {currentPRId}
                </span>
                <button
                  type="button"
                  onClick={handleStartNewPR}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{UI_STRINGS.prModule.raiseNewPR}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PR Submitted Feedback Banner */}
        {submittedPR && (
          <div className="mx-6 my-4 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                ✓
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="font-mono font-black text-xs bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded">
                    {submittedPR.id}
                  </span>
                  <span className="text-xs font-black text-emerald-900">
                    {UI_STRINGS.prModule.prSuccessfullySubmitted}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                    Status: {submittedPR.status}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 font-medium">
                  Requisition has been successfully submitted and listed in the{' '}
                  <strong>PRs Master Summary</strong> below and ingested into the{' '}
                  <strong>RFQ &amp; Commercial Command Center</strong>.
                </p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-600 mt-1 font-mono">
                  <span>Items: <strong>{submittedPR.itemsCount}</strong></span>
                  <span>•</span>
                  <span>Est Baseline: <strong>₹ {submittedPR.estBaseline.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Docs: <strong>{submittedPR.docsCount} Attached</strong></span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  prSummaryRef.current?.scrollIntoView({ behavior: 'smooth' });
                  if (onViewPRSummary) onViewPRSummary(submittedPR.id);
                }}
                className={
                  'px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold ' +
                  'rounded-xl shadow-sm flex items-center space-x-1.5 transition-all'
                }
              >
                <span>{UI_STRINGS.prModule.viewInPRSummary}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToBOQ) onNavigateToBOQ(submittedPR.id);
                  else if (onSelectPRForBOQ) onSelectPRForBOQ(submittedPR.id);
                }}
                className={
                  'px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold ' +
                  'rounded-xl shadow-sm flex items-center space-x-1.5 transition-all'
                }
              >
                <span>Proceed to RFQ Hub →</span>
              </button>
              <button
                type="button"
                onClick={handleStartNewPR}
                className={
                  'px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold ' +
                  'rounded-xl shadow-sm flex items-center space-x-1 transition-all'
                }
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.prModule.createAnotherPR}</span>
              </button>
            </div>
          </div>
        )}

        {/* 7 Process Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6">
          <nav className="flex space-x-3 sm:space-x-6 overflow-x-auto text-xs sm:text-sm font-semibold scrollbar-none py-1">
            
            <button 
              onClick={() => setCurrentStep(1)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 1 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>1</span>
              <span>{UI_STRINGS.prModule.stepGeneral}</span>
            </button>

            <button 
              onClick={() => setCurrentStep(2)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 2 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>2</span>
              <span>{UI_STRINGS.prModule.stepCategory}</span>
            </button>

            <button 
              onClick={() => setCurrentStep(3)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 3 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>3</span>
              <span>{UI_STRINGS.prModule.stepBOQ}</span>
            </button>

            <button 
              onClick={() => setCurrentStep(4)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 4 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 4 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>4</span>
              <span>{UI_STRINGS.prModule.stepSuppliers}</span>
            </button>

            <button 
              onClick={() => setCurrentStep(5)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 5 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 5 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>5</span>
              <span>{UI_STRINGS.prModule.stepDelivery}</span>
            </button>

            <button 
              onClick={() => setCurrentStep(6)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 6 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 6 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>6</span>
              <span>{UI_STRINGS.prModule.stepTerms}</span>
            </button>

            <button 
              onClick={() => setCurrentStep(7)} 
              className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 transition-all ${currentStep === 7 ? 'font-bold text-sky-600 border-sky-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${currentStep === 7 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>7</span>
              <span>{UI_STRINGS.prModule.stepDocuments}</span>
            </button>

          </nav>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: GENERAL (AS PER USER SCREENSHOT) */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-xs text-slate-700">
              
              {/* PR Corresponds */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-900">
                  PR Corresponds:<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="flex items-center space-x-6 pt-1">
                  {['Product', 'Service', 'TurnKey Projects'].map(opt => (
                    <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="prCorresponds" 
                        value={opt} 
                        checked={prCorresponds === opt} 
                        onChange={(e) => setPrCorresponds(e.target.value)}
                        className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                      />
                      <span className="font-medium text-slate-800">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Department Name */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Department Name:</label>
                <input 
                  type="text" 
                  value={departmentName} 
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full bg-slate-100 text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">
                  Product/Service Description:<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input 
                  type="text" 
                  value={prDescription} 
                  onChange={(e) => setPrDescription(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Square Feet */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">
                  Square Feet :<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input 
                  type="text" 
                  value={squareFeet} 
                  onChange={(e) => setSquareFeet(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Cost Centre */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">
                  Cost Centre:<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <select 
                  value={costCentre} 
                  onChange={(e) => setCostCentre(e.target.value)}
                  className="w-full bg-white text-slate-900 font-bold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Select Cost Centre --</option>
                  <option value="CC-101">CC-101 (Civil Substructure & Foundations)</option>
                  <option value="CC-102">CC-102 (RCC Superstructure & Framing)</option>
                  <option value="CC-103">CC-103 (MEP & HVAC Installation)</option>
                  <option value="CC-104">CC-104 (Finishing, Interior & Millwork)</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Priority :</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Select Priority --</option>
                  <option value="Normal">Normal</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Critical / Urgent</option>
                </select>
              </div>

              {/* Expected Date (Span 2) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block font-bold text-slate-900">
                  Expected Date :<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="max-w-md">
                  <input 
                    type="date" 
                    value={expectedDate} 
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CATEGORY SELECTION */}
        {/* ========================================================================= */}
        {currentStep === 2 && (() => {
          const selectedCatConfig = currentPRCategory;
          const availableSubCats = selectedCatConfig?.subCategories ?? [];

          return (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs">
                <span className="font-bold text-sky-950 block text-sm">
                  Enterprise Category & Package Taxonomy:
                </span>
                <p className="text-sky-800 mt-0.5">
                  Selecting the category will link this PR directly to the Category Manager command center.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-900">
                      {UI_STRINGS.prModule.selectMajorCategory}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddCategoryModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>{UI_STRINGS.prModule.addNewCategory}</span>
                    </button>
                  </div>
                  <select 
                    value={majorCategory} 
                    onChange={(e) => {
                      const selected = e.target.value;
                      setMajorCategory(selected);
                      const cat = safeProjectCategories.find(
                        (c) =>
                          c.name.toLowerCase() === selected.toLowerCase() ||
                          c.id === selected
                      );
                      if (cat) {
                        setSelectedStandardCategoryId(cat.id);
                        if (cat.subCategories && cat.subCategories.length > 0) {
                          setSubCategory(cat.subCategories[0].name);
                        } else {
                          setSubCategory('');
                        }
                      }
                    }}
                    className="w-full bg-white text-slate-900 font-bold border border-slate-300 rounded-lg px-3.5 py-2"
                  >
                    <option value="">Select Major Category...</option>
                    {safeProjectCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {majorCategory &&
                      !safeProjectCategories.some(
                        (c) => c.name.toLowerCase() === majorCategory.toLowerCase()
                      ) && (
                        <option value={majorCategory}>{majorCategory}</option>
                      )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">
                    {UI_STRINGS.prModule.selectSubCategory}
                  </label>
                  <select 
                    value={subCategory} 
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full bg-white text-slate-900 font-bold border border-slate-300 rounded-lg px-3.5 py-2"
                  >
                    <option value="">Select Sub-Category...</option>
                    {availableSubCats.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    {subCategory &&
                      !availableSubCats.some(
                        (s) => s.name.toLowerCase() === subCategory.toLowerCase()
                      ) && (
                        <option value={subCategory}>{subCategory}</option>
                      )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Package Title & Code :*</label>
                  <input 
                    type="text" 
                    value={packageCode} 
                    onChange={(e) => setPackageCode(e.target.value)}
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Designated Category Manager (Auto-Routed) :</label>
                  <div className="p-2 bg-slate-100 rounded-lg border border-slate-300 text-slate-900 font-bold flex items-center space-x-2">
                    <span className="text-sky-700">
                      {selectedCatConfig
                        ? `${selectedCatConfig.name} - Sourcing Command & Category Master`
                        : 'Vikram Mehta (Lead Category Manager - Interior & Fitouts)'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedCatConfig && selectedCatConfig.items.length > 0 && (
                <div
                  className="p-4 bg-emerald-50/90 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 font-bold text-emerald-950">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      <span>
                        Standard BOQ Master ({selectedCatConfig.items.length} items in {selectedCatConfig.name})
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Standard BOQ items configured in {selectedCatConfig.name} can be loaded without quantities.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleLoadStandardPackage(selectedCatConfig.id);
                      setCurrentStep(3);
                      setActiveMethod(2);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm whitespace-nowrap flex items-center space-x-1.5 shrink-0"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Load {selectedCatConfig.name} Standard BOQ (Without Qty) →</span>
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* STEP 3: BOQ STUDIO (PR ITEMS) */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center">
                  <Layers className="w-4 h-4 text-sky-600 mr-2" />
                  BOQ Studio Preparation Methods (In PR Raiser Scope):
                </h2>
                <p className="text-xs text-slate-500">Choose any of the 4 methods to prepare specifications & site quantities. The BOQ schedule populates in the table below.</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                Commercial Rates Hidden
              </span>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => setActiveMethod(1)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 1 ? 'border-purple-500 ring-2 ring-purple-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <UploadCloud className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-[10px] font-bold uppercase text-purple-700 block">Method 1</span>
                <h3 className="text-xs font-bold text-slate-900">1. Upload New BOQ</h3>
                <p className="text-[11px] text-slate-500">Download blank format & upload spreadsheet.</p>
              </div>

              <div onClick={() => setActiveMethod(2)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 2 ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Download className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Method 2</span>
                <h3 className="text-xs font-bold text-slate-900">2. Standard Template</h3>
                <p className="text-[11px] text-slate-500">Download standard template & upload filled.</p>
              </div>

              <div onClick={() => setActiveMethod(3)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 3 ? 'border-sky-500 ring-2 ring-sky-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                </div>
                <span className="text-[10px] font-bold uppercase text-sky-700 block">Method 3 (Active)</span>
                <h3 className="text-xs font-bold text-slate-900">3. Drawing AI Extractor</h3>
                <p className="text-[11px] text-slate-500">Extracts specs for <em>Counter Elevation D</em>.</p>
              </div>

              <div onClick={() => setActiveMethod(4)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 4 ? 'border-amber-500 ring-2 ring-amber-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-700 block">Method 4</span>
                <h3 className="text-xs font-bold text-slate-900">4. Manual / Catalog</h3>
                <p className="text-[11px] text-slate-500">Add from corporate master catalog.</p>
              </div>
            </div>

            {/* METHOD 1 WORKBENCH */}
            {activeMethod === 1 && (
              <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-purple-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-purple-950 flex items-center">
                      <UploadCloud className="w-4 h-4 text-purple-700 mr-1.5" />
                      Method 1: Upload New BOQ Spreadsheet (Column Headings & Blank Format)
                    </h3>
                    <p className="text-[11px] text-purple-800 mt-0.5">
                      Download the official blank BOQ format, fill item specifications and quantities, and upload.
                      The items will immediately populate in the down screen table below.
                    </p>
                  </div>
                  <button onClick={() => setCurrentStep(4)} className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5 shrink-0">
                    <span>Confirm & Move to Step 4: Supplier Selection →</span>
                  </button>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-purple-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Required Spreadsheet Column Headings:</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Standard Structure</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-slate-50 rounded border text-slate-800 font-bold text-center">1. Item Code</div>
                    <div className="p-2 bg-slate-50 rounded border text-slate-800 font-bold text-center">2. Item Description / Specs</div>
                    <div className="p-2 bg-slate-50 rounded border text-slate-800 font-bold text-center">3. Unit (UOM)</div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-950 font-bold text-center">4. Required Qty</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(() => {
                    const activeCatForMethod1 = currentPRCategory ?? safeProjectCategories[0] ?? null;
                    const method1BlankUri = getCSVDataUri(
                      generateStandardBOQTemplateCSV(activeCatForMethod1, true)
                    );
                    const method1BlankFilename = activeCatForMethod1?.shortCode
                      ? `${activeCatForMethod1.shortCode}_Standard_BOQ_Format.csv`
                      : 'Standard_BOQ_Format.csv';

                    return (
                      <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            Option A: Download Standard BOQ Format ({activeCatForMethod1?.name ?? 'Category'})
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Download pre-structured 4-column CSV template for {activeCatForMethod1?.name} (
                            {activeCatForMethod1?.items?.length ?? 0} items configured, without quantities).
                          </p>
                        </div>
                        <a 
                          href={method1BlankUri}
                          download={method1BlankFilename}
                          className={
                            'w-full bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs py-2 '
                            + 'rounded-lg transition-all flex items-center justify-center space-x-1.5 border border-purple-300'
                          }
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Blank BOQ Format (CSV)</span>
                        </a>
                      </div>
                    );
                  })()}

                  <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 block text-xs flex items-center">
                          <UploadCloud className="w-4 h-4 text-purple-600 mr-1.5" />
                          Option B: Upload Completed BOQ (.xlsx / .csv)
                        </span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                          Spreadsheet / CSV
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Upload your site spreadsheet to automatically parse and render line items in the table below.
                      </p>
                    </div>

                    <input 
                      id="method1FileInput"
                      ref={method1FileInputRef} 
                      type="file" 
                      accept=".csv,.tsv,.txt,.xlsx,.xls" 
                      onChange={handleBOQSpreadsheetUpload} 
                      className="hidden" 
                    />

                    {uploadedBOQFile ? (
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                              <FileSpreadsheet className="w-4 h-4 text-purple-700" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 text-xs truncate block" title={uploadedBOQFile.name}>
                                {uploadedBOQFile.name}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {uploadedBOQFile.size} • {uploadedBOQFile.lineCount} Items Parsed
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                            ✓ Parsed
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-purple-200/60">
                          <button
                            type="button"
                            onClick={() => boqScheduleRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
                          >
                            <span>↓ View Loaded Schedule ({uploadedBOQFile.lineCount} Items)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => method1FileInputRef.current?.click()}
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-800 underline"
                          >
                            Re-upload
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            void processBOQSpreadsheetFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => method1FileInputRef.current?.click()}
                        className="p-3 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50/30 text-center space-y-1.5 hover:bg-purple-50 cursor-pointer transition-all"
                      >
                        <UploadCloud className="w-5 h-5 text-purple-600 mx-auto" />
                        <span className="block font-bold text-slate-800 text-xs">
                          Click or drag & drop completed BOQ CSV / spreadsheet
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Supports .csv, .tsv, .txt, .xlsx
                        </span>
                        <button 
                          type="button"
                          disabled={isUploadingBOQ}
                          onClick={(e) => {
                            e.stopPropagation();
                            method1FileInputRef.current?.click();
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs py-2 rounded-lg shadow-sm flex items-center justify-center space-x-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{isUploadingBOQ ? 'Parsing Spreadsheet...' : 'Upload & Parse BOQ File'}</span>
                        </button>
                      </div>
                    )}

                    {boqUploadError && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] font-medium flex items-center space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{boqUploadError}</span>
                      </div>
                    )}

                    {boqUploadSuccess && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{boqUploadSuccess}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 2 WORKBENCH */}
            {activeMethod === 2 && (() => {
              const selectedPkg =
                safeProjectCategories.find((c) => c.id === selectedStandardCategoryId) ??
                currentPRCategory ??
                safeProjectCategories[0] ??
                null;
              const templateCsvUri = getCSVDataUri(
                generateStandardBOQTemplateCSV(selectedPkg, true)
              );
              const templateFilename = selectedPkg?.shortCode
                ? `${selectedPkg.shortCode}_Standard_BOQ_Format.csv`
                : 'Standard_BOQ_Format.csv';

              return (
                <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-emerald-950 flex items-center">
                        <Download className="w-4 h-4 text-emerald-700 mr-1.5" />
                        Method 2: Corporate Standard BOQ Template ({selectedPkg?.name})
                      </h3>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Download the approved corporate package template ({selectedPkg?.items?.length ?? 0} line
                        items) to enter quantities offline, upload the filled template, or load standard BOQ items.
                      </p>
                    </div>
                    <button 
                      onClick={() => setCurrentStep(4)} 
                      className={
                        'bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 '
                        + 'rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5 shrink-0'
                      }
                    >
                      <span>Confirm & Move to Step 4: Supplier Selection →</span>
                    </button>
                  </div>

                  {/* Standard Package Selector & Direct Load Provision */}
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="w-full sm:w-2/3 space-y-1">
                      <label htmlFor="method2-pkg-select" className="block font-bold text-slate-900 text-xs">
                        {UI_STRINGS.categoryStandardBOQMaster.selectStandardPackageLabel}
                      </label>
                      <select
                        id="method2-pkg-select"
                        value={selectedStandardCategoryId}
                        onChange={(e) => {
                          const newCatId = e.target.value;
                          setSelectedStandardCategoryId(newCatId);
                          const found = safeProjectCategories.find((c) => c.id === newCatId);
                          if (found) {
                            setMajorCategory(found.name);
                            if (found.subCategories && found.subCategories.length > 0) {
                              setSubCategory(found.subCategories[0].name);
                            }
                          }
                        }}
                        className="w-full bg-white text-slate-900 font-semibold border border-emerald-300 rounded-lg px-3 py-2 text-xs"
                      >
                        {safeProjectCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} ({cat.items.length} Standard BOQ Items)
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadStandardPackage(selectedStandardCategoryId)}
                      className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center justify-center space-x-1.5 shrink-0 transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                      <span>{UI_STRINGS.categoryStandardBOQMaster.loadStandardPackageButton}</span>
                    </button>
                  </div>

                  {boqUploadError && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] font-medium flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{boqUploadError}</span>
                    </div>
                  )}

                  {boqUploadSuccess && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{boqUploadSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">1. Download Selected Template</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Download {selectedPkg?.name ?? 'Standard Package'} pre-filled items in CSV format to enter quantities.
                        </p>
                      </div>
                      <a 
                        href={templateCsvUri}
                        download={templateFilename}
                        className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 border border-emerald-300"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Standard Template (CSV)</span>
                      </a>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">2. Upload Filled Standard Template</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Upload completed CSV with your required site quantities to populate the down screen table.
                        </p>
                      </div>

                      <input 
                        id="method2FileInput"
                        ref={method2FileInputRef} 
                        type="file" 
                        accept=".csv,.tsv,.txt,.xlsx,.xls" 
                        onChange={handleStandardTemplateUpload} 
                        className="hidden" 
                      />

                      <button 
                        type="button"
                        onClick={() => method2FileInputRef.current?.click()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Filled Template (CSV)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* METHOD 3 WORKBENCH */}
            {activeMethod === 3 && (
              <div className="p-5 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-sky-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-sky-950 flex items-center">
                      <Sparkles className="w-4 h-4 text-sky-600 mr-1.5" />
                      Method 3: Drawing AI Extractor (Without Commercial Rates)
                    </h3>
                    <p className="text-[11px] text-sky-800 mt-0.5">
                      AI ingests technical drawing (e.g. <em>Counter Elevation D</em> / CAD / PDF) and extracts
                      itemized specifications and quantities directly into the schedule below.
                    </p>
                  </div>
                  <button 
                    onClick={() => setCurrentStep(4)} 
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5 shrink-0"
                  >
                    <span>Confirm & Move to Step 4: Supplier Selection →</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* OPTION A: UPLOAD DRAWING SHEET */}
                  <div className="p-4 bg-white rounded-xl border border-sky-200 space-y-3 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 block text-xs flex items-center">
                          <UploadCloud className="w-4 h-4 text-sky-600 mr-1.5" />
                          Option A: Upload Technical Drawing Sheet
                        </span>
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">
                          CAD / PDF / Image
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Upload architectural elevation, joinery detail, or structural CAD drawing
                        (.pdf, .dwg, .dxf, .png, .jpg).
                      </p>
                    </div>

                    <input 
                      ref={drawingFileInputRef} 
                      type="file" 
                      accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg" 
                      onChange={handleDrawingFileUpload} 
                      className="hidden" 
                    />

                    {uploadedDrawingFile ? (
                      <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-200 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-sky-600" />
                            </div>
                            <div className="min-w-0">
                              <span 
                                className="font-bold text-slate-900 text-xs truncate block" 
                                title={uploadedDrawingFile.name}
                              >
                                {uploadedDrawingFile.name}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {uploadedDrawingFile.size} • {uploadedDrawingFile.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                              ✓ Attached
                            </span>
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded shrink-0">
                              ⚡ {items.length} BOQ Lines Extracted
                            </span>
                          </div>
                        </div>

                        {/* Live Extraction Progress Block */}
                        {isExtractingDrawing && (
                          <div className="p-2.5 bg-sky-100/90 border border-sky-300 rounded-lg space-y-1 animate-pulse">
                            <div className="flex items-center justify-between text-[11px] font-bold text-sky-950">
                              <span className="flex items-center space-x-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                                <span>AI Vision Extraction in Progress...</span>
                              </span>
                              <span className="text-sky-700 font-mono text-[10px]">Processing</span>
                            </div>
                            <p className="text-[10px] text-sky-800">
                              {extractionStage || 'Analyzing CAD vector layers and specifications...'}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-sky-200/60">
                          <button
                            type="button"
                            onClick={() => boqScheduleRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
                          >
                            <span>↓ View Generated BOQ ({items.length} Items)</span>
                          </button>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              aria-label="Generate BOQ from Drawing"
                              disabled={isExtractingDrawing}
                              onClick={() => {
                                triggerDrawingExtraction(uploadedDrawingFile.name, uploadedDrawingFile.name);
                              }}
                              className={
                                'text-[11px] font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1 ' +
                                'rounded-lg shadow-xs flex items-center space-x-1 disabled:opacity-50'
                              }
                            >
                              <Sparkles className={`w-3 h-3 ${isExtractingDrawing ? 'animate-spin' : ''}`} />
                              <span>{isExtractingDrawing ? 'Extracting...' : 'Generate BOQ from Drawing'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => drawingFileInputRef.current?.click()}
                              className={
                                'text-[11px] font-bold text-sky-700 hover:text-sky-900 px-2.5 py-1 ' +
                                'rounded bg-white border border-sky-300 shadow-xs'
                              }
                            >
                              Replace Drawing
                            </button>
                            <button
                              type="button"
                              onClick={handleClearDrawing}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50"
                            >
                              {UI_STRINGS.prModule.clearDrawingButton}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            processDrawingFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => drawingFileInputRef.current?.click()}
                        className={
                          'p-5 border-2 border-dashed border-sky-300 rounded-xl bg-sky-50/30 ' +
                          'text-center space-y-2 hover:bg-sky-50 cursor-pointer transition-all'
                        }
                      >
                        <UploadCloud className="w-6 h-6 text-sky-600 mx-auto" />
                        <div>
                          <span className="block font-bold text-slate-800 text-xs">
                            Click or drag & drop engineering drawing sheet
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Supports PDF, DWG, DXF, PNG, JPG (up to 25MB)
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            drawingFileInputRef.current?.click();
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
                        >
                          Browse & Upload Drawing Sheet
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const sampleDoc: AttachedDoc = {
                              name: 'Counter_Elevation_D_Approved_Drawing.pdf',
                              type: 'Architectural Drawing (.pdf)',
                              size: '2.4 MB',
                              date: '2026-09-06',
                              status: 'Attached',
                            };
                            setUploadedDrawingFile(sampleDoc);
                            setDrawingInput('Counter Elevation D');
                            triggerDrawingExtraction('Counter Elevation D', sampleDoc.name);
                          }}
                          className="text-sky-700 hover:text-sky-900 font-semibold underline"
                        >
                          Load Sample Drawing (Counter Elevation D)
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            const sampleDoc: AttachedDoc = {
                              name: 'Full_Height_Storage_Details_STORAGE_1.pdf',
                              type: 'Architectural Drawing (.pdf)',
                              size: '1.8 MB',
                              date: '2026-09-13',
                              status: 'Attached',
                            };
                            setUploadedDrawingFile(sampleDoc);
                            setDrawingInput('Full Height Storage Details');
                            triggerDrawingExtraction('Full Height Storage Details', sampleDoc.name);
                          }}
                          className="text-sky-700 hover:text-sky-900 font-semibold underline"
                        >
                          Sample: Full Height Storage Details
                        </button>
                      </div>
                      <span className="text-slate-400">Step 3 of 7 Scope</span>
                    </div>
                  </div>

                  {/* OPTION B: DRAWING TITLE & AI EXTRACTION */}
                  <div className="p-4 bg-white rounded-xl border border-sky-200 space-y-3 flex flex-col justify-between text-xs">
                    <div className="space-y-2">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs flex items-center">
                          <Sparkles className="w-4 h-4 text-sky-600 mr-1.5" />
                          Option B: Drawing Title & AI Extractor Workbench
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Specify drawing elevation name or trigger automatic technical specification deconstruction.
                        </p>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-900 mb-1">
                          Enter Drawing Title or Upload Drawing Sheet:
                        </label>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="text" 
                            value={drawingInput} 
                            onChange={(e) => setDrawingInput(e.target.value)}
                            className={
                              'flex-1 bg-white font-bold text-slate-900 border border-sky-300 rounded-lg ' +
                              'px-3 py-2 text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none'
                            } 
                          />
                          <button 
                            disabled={isExtractingDrawing}
                            onClick={handleExtractSpecsFromDrawing}
                            className={
                              'bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 ' +
                              'rounded-lg whitespace-nowrap flex items-center space-x-1.5 shadow-sm disabled:opacity-50'
                            }
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isExtractingDrawing ? 'animate-spin' : ''}`} />
                            <span>
                              {isExtractingDrawing
                                ? 'Extract Specs & Quantities (Processing...)'
                                : 'Extract Specs & Quantities'}
                            </span>
                          </button>
                          {(Boolean(drawingInput) || items.length > 0) && (
                            <button
                              type="button"
                              onClick={handleClearDrawing}
                              className={
                                'px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 ' +
                                'bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 whitespace-nowrap'
                              }
                            >
                              {UI_STRINGS.prModule.clearDrawingButton}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                        <span className="font-semibold text-slate-700">Quick Presets:</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setDrawingInput('Counter Elevation D');
                            triggerDrawingExtraction('Counter Elevation D');
                          }} 
                          className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded border border-sky-200"
                        >
                          Counter Elevation D
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setDrawingInput('Full Height Storage Details');
                            triggerDrawingExtraction('Full Height Storage Details');
                          }} 
                          className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded border border-sky-200"
                        >
                          Full Height Storage Details
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setDrawingInput('Foundation Raft Reinforcement');
                            triggerDrawingExtraction('Foundation Raft Reinforcement');
                          }} 
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded"
                        >
                          Foundation Raft Reinforcement
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold text-sky-900">
                        <span className="flex items-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-700 mr-1" />
                          Drawing Scope Protection:
                        </span>
                        <span className="text-[10px] bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded font-mono font-bold">
                          PR Raiser Scope
                        </span>
                      </div>
                      <span className="text-sky-800 block">
                        Strictly extracts Elevation D specs. Rates hidden for PR Raiser.
                      </span>
                      {extractionFeedback && (
                        <span className="text-emerald-800 font-bold block pt-1 border-t border-sky-200/60">
                          ✓ {extractionFeedback}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* VISUAL EXTRACTION NOTIFICATION BANNER */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5 text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block">
                        {isExtractingDrawing
                          ? '🤖 AI Vision Analyzing CAD Vectors & Specifications...'
                          : `Drawing BOQ Generation Active: ${items.length} Line Items Populated`}
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        {extractionFeedback || 'Engineering line items itemized into schedule below.'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => boqScheduleRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap flex items-center space-x-1 shrink-0 self-start sm:self-center"
                  >
                    <span>Inspect BOQ Schedule Below ↓</span>
                  </button>
                </div>
              </div>
            )}

            {/* METHOD 4 WORKBENCH */}
            {activeMethod === 4 && (
              <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-amber-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-amber-950 flex items-center">
                      <Edit3 className="w-4 h-4 text-amber-700 mr-1.5" />
                      Method 4: Master Catalog Selection & Manual Line Entry
                    </h3>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Select pre-approved items from the corporate master catalog or add custom line items
                      directly into the schedule below.
                    </p>
                  </div>
                  <button onClick={() => setCurrentStep(4)} className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5 shrink-0">
                    <span>Confirm & Move to Step 4: Supplier Selection →</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="flex-1">
                    <label className="block font-bold text-slate-900 mb-1">Search Approved Corporate Catalog:</label>
                    <select 
                      id="nextCatalogPicker" 
                      value={selectedCatalogItem}
                      onChange={(e) => setSelectedCatalogItem(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-lg px-3 py-2"
                    >
                      <option value="20mm Granite Countertop">20mm Polished Jet Black Granite Top</option>
                      <option value="18mm BWP Marine Plywood">18mm Marine Grade BWP Plywood (IS 710)</option>
                      <option value="1.0mm Textured Laminate">1.0mm High Pressure Suede Finish Laminate</option>
                      <option value="Soft-Close Telescopic Hardware">Soft-Close Concealed Hinges & Slides</option>
                      <option value="100mm SS 304 Skirting">100mm SS 304 Plinth Skirting</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      setItems([...items, { code: `CAT-${Math.floor(100 + Math.random() * 900)}`, desc: `${selectedCatalogItem} as per standard`, uom: 'Sqm', qty: 10 }]);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-1 mt-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add from Catalog</span>
                  </button>
                </div>
              </div>
            )}

            {/* DOWN SCREEN BOQ SCHEDULE TABLE */}
            <div 
              ref={boqScheduleRef} 
              className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 transition-all duration-500 ${
                isNewlyGenerated ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 mr-1.5" />
                      Requisition Scope & Quantities Schedule (Down Screen)
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      ✓ Schedule Active ({items.length} Lines)
                    </span>
                    {isNewlyGenerated && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded animate-pulse">
                        ⚡ Newly Loaded: {itemsSourceName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Showing <strong>{items.length} items</strong> from source: <strong className="text-sky-800 underline">{itemsSourceName}</strong>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={handleAddLine} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 border">
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Item</span>
                  </button>
                  <button onClick={() => setCurrentStep(4)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5">
                    <span>Move to Step 4: Supplier Selection →</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-2.5 w-8">#</th>
                      <th className="p-2.5 w-28">Item Code</th>
                      <th className="p-2.5">Specification / Scope Description</th>
                      <th className="p-2.5 w-16">UOM</th>
                      <th className="p-2.5 w-28 text-right bg-emerald-50 text-emerald-950 font-bold border-l border-r border-emerald-200">Required Quantity</th>
                      <th className="p-2.5 w-20 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          <p className="font-bold text-xs text-slate-700">All BOQ schedule columns are currently blank.</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Choose an ingestion method above (CSV Upload, Standard Template, or Technical Drawing)
                            or click below to add lines.
                          </p>
                          <button
                            type="button"
                            onClick={handleAddLine}
                            className="mt-3 inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add First Item</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2.5 font-mono font-bold text-sky-800">{it.code}</td>
                          <td className="p-2.5 font-semibold text-slate-900 whitespace-pre-line">
                            {it.desc ? (
                              it.desc
                            ) : (
                              <input
                                type="text"
                                placeholder="Enter specification description..."
                                value={it.desc}
                                onChange={(e) => {
                                  const updated = [...items];
                                  updated[idx].desc = e.target.value;
                                  setItems(updated);
                                }}
                                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 p-1 rounded"
                              />
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-700">{it.uom}</td>
                          <td className="p-2.5 text-right bg-emerald-50/50 border-l border-r border-emerald-100">
                            <input 
                              type="number" 
                              step="0.1" 
                              value={it.qty === 0 ? '' : it.qty} 
                              placeholder="0.0"
                              onChange={(e) => handleQtyChange(idx, e.target.value)} 
                              className="w-20 text-xs font-bold text-emerald-950 font-mono bg-white border border-emerald-300 p-1 rounded text-right shadow-inner"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenAmend(it, idx)}
                                className="p-1 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded"
                                title="Amend Specification & Quantity"
                                aria-label="Amend item"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(idx)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                title="Remove Item"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Technical Quantities Verified for Requisition. Commercial Rates are hidden for PR Raiser.</span>
                </div>
                <button onClick={() => setCurrentStep(4)} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 whitespace-nowrap">
                  <span>Confirm BOQ & Proceed to Step 4: Supplier Selection →</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SUPPLIER SELECTION (MULTI-SELECT DROPDOWN WITH STARS & RATE CARD CODING) */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-950 via-brand-950 to-slate-900 text-white rounded-2xl shadow-sm border border-emerald-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    Step 4: Vendor Identification & Sourcing
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {majorCategory} • Region: {selectedRegion}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Select Qualified Suppliers (Multi-Select Category & Regional Roster)
                </h3>
                <p className="text-slate-300 mt-0.5">
                  Suppliers carry star performance ratings and color differentiation as <strong className="text-emerald-300">Rate Card Vendors (Pre-negotiated MSAs)</strong> or <strong className="text-sky-300">Non-Rate Card Vendors (Open / RFQ)</strong>.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (selectedSupplierIds.length === 0) {
                    alert('Please select at least one vendor to proceed.');
                    return;
                  }
                  setCurrentStep(5);
                }} 
                className="bg-emerald-500 hover:bg-emerald-400 text-brand-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md whitespace-nowrap flex items-center space-x-1.5 shrink-0"
              >
                <span>Confirm Suppliers & Move to Step 5: Delivery Locations →</span>
              </button>
            </div>

            {/* Filter & Action Toolbar: Region & Rate Card Status */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Regional Filter */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 mr-1" />
                    <span>Filter by Operating Region :*</span>
                  </label>
                  <select 
                    value={selectedRegion} 
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-300 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="ALL">🌐 All Operating Regions</option>
                    <option value="WEST">📍 West (Mumbai / Pune / Gujarat)</option>
                    <option value="NORTH">📍 North (Delhi-NCR / Haryana / UP)</option>
                    <option value="SOUTH">📍 South (Bengaluru / Chennai / Hyderabad)</option>
                    <option value="EAST">📍 East (Kolkata / Odisha / North-East)</option>
                  </select>
                </div>

                {/* 2. Rate Card Status Filter */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900 flex items-center">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>Contractual Rate Card Status :</span>
                  </label>
                  <select 
                    value={selectedTypeFilter} 
                    onChange={(e) => setSelectedTypeFilter(e.target.value)}
                    className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-300 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="ALL">All Vendors (Rate Card & Non-Rate Card)</option>
                    <option value="RATE_CARD">🟢 Rate Card Vendors Only (Pre-Agreed Rates)</option>
                    <option value="NON_RATE_CARD">🔵 Non-Rate Card Vendors Only (Empanelled / RFQ)</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Multi-Select Vendor Dropdown Component */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              
              <div className="space-y-1.5 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <label className="block font-bold text-slate-900 text-xs flex items-center">
                    <Store className="w-4 h-4 text-purple-600 mr-1.5" />
                    <span>Select Sourcing Vendors (Multi-Select Dropdown) :*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Click the dropdown box below to open options and select multiple vendors
                  </span>
                </div>

                {/* Dropdown Trigger Box */}
                <div 
                  data-testid="pr-supplier-dropdown-trigger"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white font-bold text-slate-900 border-2 border-sky-400 hover:border-sky-500 rounded-xl px-4 py-3 text-xs flex items-center justify-between shadow-sm cursor-pointer transition-all select-none"
                >
                  <div className="flex items-center space-x-2 overflow-hidden mr-2">
                    {selectedSupplierIds.length === 0 ? (
                      <span className="text-slate-500 font-normal">Click to select vendors from dropdown...</span>
                    ) : (
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        {selectedSupplierIds.slice(0, 3).map(id => {
                          const v = allVendors.find(item => item.id === id) || { id, name: id, isRateCard: false };
                          return (
                            <span 
                              key={id} 
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${v.isRateCard ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-sky-50 text-sky-900 border-sky-300'}`}
                            >
                              <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                              <span>{v.name}</span>
                            </span>
                          );
                        })}
                        {selectedSupplierIds.length > 3 && (
                          <span className="text-xs font-bold text-slate-600 ml-1">
                            +{selectedSupplierIds.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="bg-sky-100 text-sky-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-sky-300">
                      {selectedSupplierIds.length} selected
                    </span>
                    <ChevronDown className={`w-4 h-4 text-sky-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Collapsible Floating Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-sky-400 rounded-2xl shadow-2xl z-40 p-4 space-y-3">
                    
                    {/* Quick Filter & Action Header inside Dropdown */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-slate-700">Quick Select:</span>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllRateCardSuppliers();
                          }} 
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 transition-all"
                        >
                          + All Rate Card
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllSuppliers();
                          }} 
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] border border-sky-300 transition-all"
                        >
                          + Select All
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            clearAllSuppliers();
                          }} 
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300 transition-all"
                        >
                          Clear
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Multi-Select Enabled</span>
                    </div>

                    {/* Scrollable Options List */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-64 overflow-y-auto bg-slate-50/50">
                      {filteredVendors.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          No vendors match the selected filters.
                        </div>
                      ) : (
                        filteredVendors.map(v => {
                          const isChecked = selectedSupplierIds.includes(v.id);
                          return (
                            <div 
                              key={v.id}
                              onClick={() => toggleSupplierSelection(v.id)}
                              className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-100/80 ${isChecked ? (v.isRateCard ? 'bg-emerald-50/60' : 'bg-sky-50/60') : 'bg-white'}`}
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => {}} 
                                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs font-mono">{v.name} ({v.id})</span>
                                  {v.source === 'CLIENT_ONBOARDED' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white border border-emerald-700 flex items-center space-x-1 shadow-xs">
                                      <span>🏢</span>
                                      <span>Client Boarded</span>
                                    </span>
                                  )}
                                  {v.isRateCard ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center space-x-1">
                                      <span>🟢</span>
                                      <span>Rate Card Vendor</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300 flex items-center space-x-1">
                                      <span>🔵</span>
                                      <span>Non-Rate Card Vendor</span>
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-500">📍 {v.city.split(',')[0]}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 text-xs shrink-0">
                                {renderStars(v.rating)}
                                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Lead: {v.leadTime}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Done / Apply Button inside Dropdown */}
                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      <span className="text-[11px] text-slate-600">
                        <strong className="text-sky-600 font-bold font-mono">{selectedSupplierIds.length}</strong> vendors currently checked
                      </span>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropdownOpen(false);
                        }} 
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-1.5 rounded-lg shadow-sm"
                      >
                        Done / Apply Selection ✓
                      </button>
                    </div>

                  </div>
                </>
                )}

              </div>

              {/* Selected Suppliers Chips (Clean visual pills under the dropdown) */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center">
                    <Users className="w-4 h-4 text-sky-600 mr-1.5" />
                    <span>Selected Vendors (<span className="text-sky-600 font-black font-mono">{selectedSupplierIds.length}</span> selected):</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Click ✕ to remove any vendor</span>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-slate-100/70 rounded-xl border border-dashed border-slate-300 items-center">
                  {selectedSupplierIds.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      No vendors selected yet. Click the dropdown above to select.
                    </span>
                  ) : (
                    selectedSupplierIds.map(id => {
                      const v = allVendors.find((item) => item.id === id) || {
                        id,
                        name: id,
                        rating: 4.5,
                        isRateCard: false,
                        source: undefined,
                      };
                      const isClientBoarded = v.source === 'CLIENT_ONBOARDED';
                      return (
                        <div 
                          key={id}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${v.isRateCard ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-sky-100 text-sky-950 border-sky-300'}`}
                        >
                          <span>{v.isRateCard ? '🟢' : '🔵'}</span>
                          <span>{v.name} ({v.id})</span>
                          {isClientBoarded && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-extrabold shadow-2xs">
                              Client Boarded
                            </span>
                          )}
                          <span className="text-amber-600 font-mono text-[11px]">★ {v.rating.toFixed(1)}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSupplierSelection(id);
                            }} 
                            className="ml-1 text-slate-500 hover:text-rose-600 font-black p-0.5 rounded-full hover:bg-white/80" 
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Confirmation Bar */}
            <div className="p-3.5 bg-slate-50 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span><strong>{selectedSupplierIds.length} vendor(s)</strong> selected for requisition & RFQ quotation.</span>
              </div>
              <button 
                onClick={() => {
                  if (selectedSupplierIds.length === 0) {
                    alert('Please select at least one vendor to proceed.');
                    return;
                  }
                  setCurrentStep(5);
                }} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>Confirm Suppliers & Proceed to Step 5: Delivery Locations →</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: DELIVERY LOCATIONS */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-950 block text-sm">Site Delivery Address & Logistics:</span>
              <p className="text-emerald-800 mt-0.5">Specify delivery unloading coordinates, access gates, and designated site contact.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Delivery Site / Location Address :*</label>
                <textarea 
                  rows={2} 
                  value={deliveryAddress} 
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Site In-Charge / Contact Person :*</label>
                <input 
                  type="text" 
                  value={siteContact} 
                  onChange={(e) => setSiteContact(e.target.value)}
                  className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3.5 py-2" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Delivery Staging & Phasing Plan :</label>
                <textarea 
                  rows={2} 
                  value={stagingPlan} 
                  onChange={(e) => setStagingPlan(e.target.value)}
                  className="w-full bg-white text-slate-900 font-normal border border-slate-300 rounded-lg px-3.5 py-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900">Unloading & Material Handling Requirements :</label>
                <textarea 
                  rows={2} 
                  value={unloadingReq} 
                  onChange={(e) => setUnloadingReq(e.target.value)}
                  className="w-full bg-white text-slate-900 font-normal border border-slate-300 rounded-lg px-3.5 py-2"
                />
              </div>
            </div>

            {/* Bottom Confirmation Bar for Step 5 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Delivery and logistics parameters configured.</span>
              </div>
              <button 
                onClick={() => setCurrentStep(6)} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>Confirm Delivery & Proceed to Step 6: Terms & Conditions →</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: TERMS & CONDITIONS (COMMERCIAL, PAYMENT, DELIVERY & STATUTORY) */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Context Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 via-brand-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-800/80 border border-indigo-400/40 text-indigo-200 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Contractual Terms & Conditions, Payment Milestones & Delivery Schedules</h4>
                  <p className="text-indigo-200/80 text-[11px] mt-0.5">Define requisition-level commercial baseline: payment structure, advance terms, delivery SLA, LD penalty clause, DLP, and warranty conditions.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[10px] uppercase font-bold text-indigo-300 mr-1 hidden sm:inline">Templates:</span>
                <button 
                  type="button" 
                  onClick={() => loadTermsPreset('standard_construction')} 
                  className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all border border-indigo-400/40 shadow-xs"
                >
                  🏢 Milestone / CAPEX
                </button>
                <button 
                  type="button" 
                  onClick={() => loadTermsPreset('direct_supply')} 
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 shadow-xs"
                >
                  📦 Supply / 30-Day Credit
                </button>
                <button 
                  type="button" 
                  onClick={() => loadTermsPreset('progressive_ra')} 
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 shadow-xs"
                >
                  📊 Monthly RA Bills
                </button>
              </div>
            </div>

            {/* SECTION 1: PAYMENT TERMS & FINANCIAL GOVERNANCE */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <CreditCard className="w-4 h-4 text-sky-600" />
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1. Payment Terms & Milestone Structure</h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Payment Milestone Structure :*</label>
                  <select 
                    value={tcPaymentStructure} 
                    onChange={(e) => handlePaymentStructureChange(e.target.value)} 
                    className="w-full bg-slate-50 text-slate-900 font-bold border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="MILESTONE_10_70_10_10">10% Adv + 70% Supply/Progress + 10% Handover + 10% DLP (Standard CAPEX)</option>
                    <option value="CREDIT_30_DAYS">100% Against 30 Days Net Credit post-GRN (Supply Only)</option>
                    <option value="CREDIT_45_DAYS">100% Against 45 Days Net Credit post-GRN (Supply Only)</option>
                    <option value="PROGRESSIVE_RA">Progressive Monthly RA Bills (5% Adv, 85% RA, 10% Retention)</option>
                    <option value="CUSTOM">Custom Structured Milestone Plan (Detailed Below)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Advance Payment (% of Order) :*</label>
                  <input 
                    type="text" 
                    value={tcAdvancePct} 
                    onChange={(e) => setTcAdvancePct(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Retention Money / Security Deposit (%):*</label>
                  <input 
                    type="text" 
                    value={tcRetentionPct} 
                    onChange={(e) => setTcRetentionPct(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Credit Period / Invoice Payment Days :*</label>
                  <input 
                    type="text" 
                    value={tcCreditDays} 
                    onChange={(e) => setTcCreditDays(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Advance Bank Guarantee (ABG) Required? :*</label>
                  <select 
                    value={tcAbgRequired} 
                    onChange={(e) => setTcAbgRequired(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="YES">YES - Mandatory 110% ABG for all Mobilization Advance</option>
                    <option value="NO">NO - Waived for Empanelled Tier-1 Rate Card Vendors</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Statutory TDS & GST Terms :*</label>
                  <input 
                    type="text" 
                    value={tcTaxTerms} 
                    onChange={(e) => setTcTaxTerms(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

              </div>
            </div>

            {/* SECTION 2: DELIVERY TIMELINES, LEAD TIME & LIQUIDATED DAMAGES */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">2. Delivery Timelines, Schedule & Delay Penalties</h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Committed Lead Time / Dispatch SLA :*</label>
                  <input 
                    type="text" 
                    value={tcLeadTime} 
                    onChange={(e) => setTcLeadTime(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Site Handover / Completion Target Date :*</label>
                  <input 
                    type="text" 
                    value={tcCompletionDate} 
                    onChange={(e) => setTcCompletionDate(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block font-bold text-slate-900">Phased Staging & Dispatch Schedule :</label>
                  <textarea 
                    rows={2} 
                    value={tcPhasedDeliveryPlan} 
                    onChange={(e) => setTcPhasedDeliveryPlan(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-normal border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block font-bold text-rose-700">Liquidated Damages (LD) Delay Penalty Clause :*</label>
                  <input 
                    type="text" 
                    value={tcLdClause} 
                    onChange={(e) => setTcLdClause(e.target.value)} 
                    className="w-full bg-rose-50/50 text-rose-950 font-semibold border border-rose-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-400" 
                  />
                </div>

              </div>
            </div>

            {/* SECTION 3: WARRANTY, QUALITY, INCOTERMS & STATUTORY CONDITIONS */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">3. Warranty, Defect Liability, IncoTerms & Special Conditions</h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Defect Liability Period (DLP) :*</label>
                  <select 
                    value={tcDlp} 
                    onChange={(e) => setTcDlp(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="12_MONTHS">12 Months from Final Handover / Completion</option>
                    <option value="24_MONTHS">24 Months from Final Handover / Completion</option>
                    <option value="36_MONTHS">36 Months Comprehensive Warranty</option>
                    <option value="NONE">No DLP (Consumable Direct Supply)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Manufacturer / OEM Warranty Coverage :*</label>
                  <input 
                    type="text" 
                    value={tcWarranty} 
                    onChange={(e) => setTcWarranty(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Price Basis & IncoTerms :*</label>
                  <select 
                    value={tcIncoterms} 
                    onChange={(e) => setTcIncoterms(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="FOR_SITE">FOR Site (Inclusive of Packing, Forwarding, Freight & Transit Insurance)</option>
                    <option value="EX_WORKS">Ex-Works Factory (Client Freight & Transit Scope)</option>
                    <option value="FOB">FOB / Port Delivery</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900">Price Firmness Clause :*</label>
                  <input 
                    type="text" 
                    value={tcPriceFirmness} 
                    onChange={(e) => setTcPriceFirmness(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block font-bold text-slate-900">Special Project Contractual Conditions / Notes :</label>
                  <textarea 
                    rows={2} 
                    value={tcSpecialConditions} 
                    onChange={(e) => setTcSpecialConditions(e.target.value)} 
                    className="w-full bg-white text-slate-900 font-normal border border-slate-300 rounded-lg px-3 py-2 text-xs" 
                  />
                </div>

              </div>
            </div>

            {/* Bottom Confirmation Bar for Step 6 */}
            <div className="p-3.5 bg-slate-50 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Contractual Payment & Delivery Terms configured and ready for validation.</span>
              </div>
              <button 
                onClick={() => setCurrentStep(7)} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>Confirm Terms & Conditions & Proceed to Step 7: Documents →</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: DOCUMENTS & ATTACHMENTS */}
        {/* ========================================================================= */}
        {currentStep === 7 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs">
              <span className="font-bold text-purple-950 block text-sm">Engineering Attachments & Reference Documents:</span>
              <p className="text-purple-800 mt-0.5">
                Attach drawings, specification sheets, and site photos for Category Manager review and RFQ generation.
              </p>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-purple-300 bg-purple-50/40 rounded-2xl p-6 text-center space-y-3">
              <FileUp className="w-8 h-8 text-purple-600 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Drag & Drop Documents or Browse</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF, DWG, DOCX, XLSX, PNG, JPG</p>
              </div>
              <input ref={fileInputRef} type="file" id="nextPrFileInput" multiple className="hidden" onChange={handleFileUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
              >
                + Choose Document Files
              </button>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center">
                  <Paperclip className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                  Attached Documents ({documents.length} files)
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800">
                    <tr>
                      <th className="p-2.5">Document Name</th>
                      <th className="p-2.5 w-36">Document Type</th>
                      <th className="p-2.5 w-24">Size</th>
                      <th className="p-2.5 w-28">Date</th>
                      <th className="p-2.5 w-24 text-center">Status</th>
                      <th className="p-2.5 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {documents.map((doc, idx) => {
                      const isDrawing = /\.(pdf|dwg|dxf|png|jpg|jpeg)$/i.test(doc.name);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900 flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span>{doc.name}</span>
                          </td>
                          <td className="p-2.5 text-slate-600">{doc.type}</td>
                          <td className="p-2.5 font-mono text-slate-500">{doc.size}</td>
                          <td className="p-2.5 font-mono text-slate-500">{doc.date}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {doc.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              {isDrawing && (
                                <button
                                  type="button"
                                  title="Generate BOQ in Step 3 from this drawing"
                                  onClick={() => handleExtractFromStep7Doc(doc)}
                                  className={
                                    'text-[10px] font-bold text-sky-700 hover:text-sky-900 ' +
                                    'bg-sky-50 border border-sky-200 px-2 py-0.5 rounded shadow-2xs'
                                  }
                                >
                                  ⚡ Extract BOQ
                                </button>
                              )}
                              <button
                                onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button 
            onClick={() => setCurrentStep(1)} 
            className="text-rose-600 hover:bg-rose-50 border border-rose-300 font-bold text-xs px-4 py-2 rounded-xl transition-all"
          >
            {UI_STRINGS.prModule.cancelPR}
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-500 font-bold">Step {currentStep}/7</span>

            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)} 
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{UI_STRINGS.prModule.prevStep}</span>
              </button>
            )}

            {currentStep < 7 ? (
              <button 
                onClick={() => setCurrentStep(currentStep + 1)} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-black text-xs px-6 py-2 rounded-xl shadow-md flex items-center space-x-1.5"
              >
                <span>{UI_STRINGS.prModule.nextStep}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : submittedPR ? (
              <button 
                type="button"
                className={
                  'bg-emerald-700 text-white font-black text-xs px-6 py-2 rounded-xl shadow-md ' +
                  'flex items-center space-x-2'
                }
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{UI_STRINGS.prModule.prSuccessfullySubmitted}</span>
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmitPR} 
                className={
                  'bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-2 ' +
                  'rounded-xl shadow-md flex items-center space-x-2'
                }
              >
                <Send className="w-4 h-4" />
                <span>{UI_STRINGS.prModule.submitPR} →</span>
              </button>
            )}
          </div>
        </div>

      </div>
      )}

      {/* Embedded Purchase Requisitions (PRs) Master Summary Table */}
      <div 
        ref={prSummaryRef} 
        id="prs-master-summary-section" 
      >
        <PRHistoryTable
          prs={prs}
          circulatedRFQs={circulatedRFQs}
          onSelectPRForBOQ={onSelectPRForBOQ}
          onNavigateToBOQ={onNavigateToBOQ}
          onApprovePR={approvePRByProjectHead}
          onStartNewPR={handleStartNewPR}
          activePRId={currentPRId}
        />
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategoryFromPR}
        existingCategories={safeProjectCategories}
      />

      {/* Amend BOQ Modal */}
      <AmendBOQModal
        isOpen={isAmendModalOpen}
        item={editingItem?.item || null}
        index={editingItem?.index ?? -1}
        onClose={() => {
          setIsAmendModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveAmendedItem}
        availableCategories={safeProjectCategories}
        currentCategoryName={majorCategory}
      />
    </div>
  );
};
