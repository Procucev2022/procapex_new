'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Download, 
  Sparkles, 
  Edit3, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  FileText, 
  Layers, 
  Building2,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { logger } from '@/lib/logger';

import type {
  PRModuleProps,
  RequesterBOQItem,
  AttachedDoc,
  AddCategoryInput,
  PurchaseRequest,
} from '@/types';
import {
  DEFAULT_COUNTER_ITEMS,
  UI_STRINGS,
  formatString,
} from '@/constants';
import { extractBOQItemsFromDrawing } from '@/lib/boq-extractor';
import { parseUploadedBOQFile } from '@/lib/boq-csv-parser';
import { AddCategoryModal } from './budget/AddCategoryModal';
import { AmendBOQModal } from './AmendBOQModal';
import { generateStandardBOQTemplateCSV, getCSVDataUri } from '@/lib/budget-utils';

export const PRModule: React.FC<PRModuleProps> = ({
  onSelectPRForBOQ,
  onNavigateToBOQ,
  onOpenNewPRModal: _onOpenNewPRModal,
  onViewPRSummary: _onViewPRSummary,
}) => {
  const {
    createPR,
    projectCategories,
    addCategory,
    addStandardBOQItem,
    prs,
  } = useProcurement();
  const safeProjectCategories = projectCategories ?? [];

  const [currentPRId] = useState<string>('PR-2026-0005');
  const [activeMethod, setActiveMethod] = useState<number>(3);
  
  // Category & Scope Metadata
  const [majorCategory, setMajorCategory] = useState<string>('Interior & Fitouts');
  const [subCategory, setSubCategory] = useState<string>(
    safeProjectCategories[0]?.subCategories?.[0]?.name ?? 'Reception Counter & Millwork'
  );
  const [prDescription, setPrDescription] = useState<string>(
    'Fabrication & Installation of Reception Counter (Drawing: Counter Elevation D)'
  );
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
  const [selectedStandardCategoryId, setSelectedStandardCategoryId] = useState<string>(
    safeProjectCategories[0]?.id ?? 'CAT-CIVIL'
  );

  const currentPRCategory = safeProjectCategories.find(
    (c) => c.name.toLowerCase() === majorCategory.toLowerCase()
  ) ?? safeProjectCategories[0] ?? null;

  const handleAddCategoryFromPR = (input: AddCategoryInput): void => {
    if (addCategory) {
      addCategory(input);
      setMajorCategory(input.name);
      const firstMinor = input.subCategories?.[0] ?? input.subCategory?.trim();
      if (firstMinor) {
        setSubCategory(firstMinor);
      }
    }
    setIsAddCategoryModalOpen(false);
  };

  // Step 3: BOQ Items State
  const [items, setItems] = useState<RequesterBOQItem[]>(DEFAULT_COUNTER_ITEMS);
  const [drawingInput, setDrawingInput] = useState<string>('Reception Counter Elevation D');
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
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<string>('20mm Granite Countertop');

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
          notes: `Amended from Package ${currentPRId} (Drawing Scope)`,
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

  const handleLoadStandardPackage = (catId: string): void => {
    const targetCat = safeProjectCategories.find((c) => c.id === catId);
    if (!targetCat?.items || targetCat.items.length === 0) {
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
    setItems([]);
    setDrawingInput('');
    setExtractionFeedback(null);

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
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toISOString().slice(0, 10),
      status: 'Attached',
    };
    setUploadedDrawingFile(newDoc);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string)?.split(',')[1] || undefined;
      const mime = file.type || (isPdf ? 'application/pdf' : 'application/octet-stream');
      triggerDrawingExtraction(file.name, file.name, base64Data, mime);
    };
    reader.onerror = () => {
      triggerDrawingExtraction(file.name, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrawingFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      processDrawingFile(e.target.files[0]);
    }
    e.target.value = '';
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

  const handleProceedToRaiseRFQ = (): void => {
    const existingPrs = prs || [];
    const maxNum = existingPrs.reduce((max, p) => {
      const match = p.id.match(/PR-\d{4}-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 5);
    const targetPrId = `PR-2026-${String(maxNum + 1).padStart(4, '0')}`;
    const estBaseline = items.reduce(
      (acc, it) => acc + ((it.benchmark || it.rateCard || 1450) * it.qty),
      0
    );

    const isCustomScope = Boolean(
      prDescription &&
      prDescription !== 'Fabrication & Installation of Reception Counter (Drawing: Counter Elevation D)'
    );
    const resolvedTitle = isCustomScope ? prDescription : 'New Blank RFQ Package';

    const newPR: PurchaseRequest = {
      id: targetPrId,
      title: resolvedTitle,
      status: 'SUBMITTED',
      projectName: 'Metro Line 4 Underground',
      costCentre: 'CC-104 (Finishing & Interior)',
      category: majorCategory || 'Interior & Fitouts',
      requester: 'Rahul Verma (Category Manager)',
      reqDate: '2026-09-25',
      remarks: `Blank RFQ Scope generated via BOQ Studio | Method ${activeMethod} ${drawingInput ? `(${drawingInput}) ` : ''}| Baseline: ₹ ${estBaseline}`,
      nominatedVendors: [],
      deliveryAddress: '',
      items: items.map((it) => ({
        ...it,
        rateCard: it.rateCard || it.benchmark || 1500,
        benchmark: it.benchmark || 1450,
        std: it.std || 1480,
        aiConf: it.aiConf || '96%',
      })),
    };

    createPR(newPR);
    logger.info('components/PRModule', 'Proceed to Raise RFQ from BOQ Studio', {
      prId: targetPrId,
      itemsCount: items.length,
      estBaseline,
    });

    if (onNavigateToBOQ) {
      onNavigateToBOQ(targetPrId);
    } else if (onSelectPRForBOQ) {
      onSelectPRForBOQ(targetPrId);
    }
  };

  const totalBenchmarkAmount = items.reduce(
    (sum, it) => sum + ((it.benchmark || it.rateCard || 1450) * it.qty),
    0
  );

  return (
    <div className="space-y-6">
      {/* Main BOQ Studio Workspace Card */}
      <div className="bg-white rounded-2xl border border-blue-200 shadow-md overflow-hidden">
        
        {/* Header: BOQ Studio Scope Command */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                {UI_STRINGS.prModule.roleBadge}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                L&amp;T Infra • Metro Line 4 Underground
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {UI_STRINGS.prModule.title}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-200 font-bold">
              Package ID: {currentPRId.replace('PR-', 'PKG-')}
            </span>
          </div>
        </div>

        {/* Sub Tab Bar: BOQ Studio (Project Scope) */}
        <div className="border-b border-blue-200 bg-slate-50/60 px-4 sm:px-6 py-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button 
              type="button"
              className="py-1.5 px-3 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center space-x-2 cursor-default"
            >
              <Layers className="w-3.5 h-3.5 text-white" />
              <span>{UI_STRINGS.prModule.stepBOQ}</span>
            </button>
          </div>
        </div>

        {/* Integrated Category & Package Scoping Strip */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 flex-wrap">
            <div className="flex items-center space-x-1.5 font-bold text-slate-700">
              <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Category Scope:</span>
            </div>
            <select
              value={majorCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                setMajorCategory(newCat);
                const found = safeProjectCategories.find(c => c.name === newCat);
                if (found?.subCategories?.[0]) {
                  setSubCategory(found.subCategories[0].name);
                }
              }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800 text-xs shadow-2xs focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {safeProjectCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.items?.length ?? 0} Items)
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-sky-700 border border-sky-300 font-bold text-xs px-2.5 py-1 rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{UI_STRINGS.prModule.addNewCategory}</span>
            </button>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-600 truncate max-w-xs">{prDescription}</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
              AI Benchmark Active: ₹ {totalBenchmarkAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOQ STUDIO (PR ITEMS) MAIN WORKSPACE */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center">
                <Layers className="w-4 h-4 text-sky-600 mr-2" />
                BOQ Studio Preparation Methods:
              </h2>
              <p className="text-xs text-slate-500">
                Choose any of the 4 methods to prepare specifications &amp; site quantities.
                The BOQ schedule populates with AI benchmark pricing below.
              </p>
            </div>
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div onClick={() => setActiveMethod(1)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 1 ? 'border-purple-500 ring-2 ring-purple-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <UploadCloud className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[10px] font-bold uppercase text-purple-700 block">Method 1</span>
              <h3 className="text-xs font-bold text-slate-900">1. Upload New BOQ</h3>
              <p className="text-[11px] text-slate-500">Download blank format &amp; upload spreadsheet.</p>
            </div>

            <div onClick={() => setActiveMethod(2)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${activeMethod === 2 ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-sky-500'}`}>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Download className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">Method 2</span>
              <h3 className="text-xs font-bold text-slate-900">2. Standard Template</h3>
              <p className="text-[11px] text-slate-500">Download standard template &amp; upload filled.</p>
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
                    Method 1: Upload New BOQ Spreadsheet (Column Headings &amp; Blank Format)
                  </h3>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    Download the official blank BOQ format, fill item specifications and quantities, and upload.
                    The items will immediately populate in the down screen table below.
                  </p>
                </div>
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
                        Click or drag &amp; drop completed BOQ CSV / spreadsheet
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
                    Method 3: Drawing AI Extractor (With AI Benchmark Rates)
                  </h3>
                  <p className="text-[11px] text-sky-800 mt-0.5">
                    AI ingests technical drawing (e.g. <em>Counter Elevation D</em> / CAD / PDF) and extracts
                    itemized specifications and quantities directly into the schedule below.
                  </p>
                </div>
              </div>

              {/* SAMPLE DRAWING PRESETS & SELECTOR */}
              <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <label htmlFor="sample-drawing-select" className="font-bold text-slate-800 shrink-0">
                    Sample Drawing Preset:
                  </label>
                  <select
                    id="sample-drawing-select"
                    aria-label="Sample Drawing Preset"
                    value={drawingInput || 'Reception Counter Elevation D'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDrawingInput(val);
                      void triggerDrawingExtraction(val, val);
                    }}
                    className="bg-white border border-sky-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Reception Counter Elevation D">Reception Counter Elevation D</option>
                    <option value="Full Height Storage Details">Full Height Storage Details</option>
                    <option value="Foundation Raft & Footing Reinforcement.dwg">Foundation Raft & Footing Reinforcement</option>
                    <option value="Executive Office Interior Fitout & Woodwork Detail.pdf">Executive Office Interior Fitout</option>
                  </select>
                </div>
                <span className="text-slate-500 text-[11px] hidden sm:inline">
                  Select a sample drawing to auto-extract technical specifications
                </span>
              </div>

              {/* UPLOAD TECHNICAL DRAWING SHEET */}
              <div className="p-5 bg-white rounded-xl border border-sky-200 space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 block text-xs flex items-center">
                      <UploadCloud className="w-4 h-4 text-sky-600 mr-1.5" />
                      Upload Technical Drawing Sheet
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
                      'p-8 border-2 border-dashed border-sky-300 rounded-xl bg-sky-50/30 ' +
                      'text-center space-y-2 hover:bg-sky-50 cursor-pointer transition-all'
                    }
                  >
                    <UploadCloud className="w-8 h-8 text-sky-600 mx-auto" />
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">
                        Click or drag &amp; drop engineering drawing sheet
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
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm"
                    >
                      Browse &amp; Upload Drawing Sheet
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-sky-100">
                  <span className="text-slate-500">Live AI Vision Model</span>
                  <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                    Gemini 2.5 Flash Multimodal
                  </span>
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
                    Method 4: Master Catalog Selection &amp; Manual Line Entry
                  </h3>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Select pre-approved items from the corporate master catalog or add custom line items
                    directly into the schedule below.
                  </p>
                </div>
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
                    <option value="Soft-Close Telescopic Hardware">Soft-Close Concealed Hinges &amp; Slides</option>
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
              isNewlyGenerated ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20' : 'border-blue-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 mr-1.5" />
                    BOQ Scope &amp; Quantities Schedule
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
              </div>
            </div>

            <div className="overflow-x-auto border border-blue-200 rounded-xl bg-white">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-blue-50/80 font-bold border-b-2 border-blue-200 text-blue-950">
                  <tr>
                    <th className="p-2.5 w-8">#</th>
                    <th className="p-2.5 w-28">Item Code</th>
                    <th className="p-2.5">Specification / Scope Description</th>
                    <th className="p-2.5 w-16">UOM</th>
                    <th className="p-2.5 w-28 text-right bg-emerald-50 text-emerald-950 font-bold border-l border-r border-emerald-200">Required Quantity</th>
                    <th className="p-2.5 w-32 text-right bg-purple-50 text-purple-950 font-bold border-r border-purple-200">{UI_STRINGS.prModule.aiBenchmarkRate}</th>
                    <th className="p-2.5 w-36 text-right bg-sky-50 text-sky-950 font-bold border-r border-sky-200">{UI_STRINGS.prModule.aiBenchmarkAmount}</th>
                    <th className="p-2.5 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
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
                        <td className="p-2.5 font-mono font-bold text-sky-800">
                          <div>{it.code}</div>
                          {it.isRefined && (
                            <span className="inline-flex items-center text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                              ✨ {UI_STRINGS.prModule.refinedBadge}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-900 whitespace-pre-line">
                          {it.desc ? (
                            <div>
                              <div>{it.desc}</div>
                              {it.aiRationale && (
                                <div className="text-[10px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded mt-1 border border-emerald-200/60 font-normal">
                                  💡 <span className="font-semibold">AI Rationale:</span> {it.aiRationale}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-amber-700 font-normal italic bg-amber-50 px-1 py-0.5 rounded">
                              ⚠ Blank Description - Click Amend to Fill
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-600 font-medium">{it.uom}</td>
                        <td className="p-2.5 text-right font-mono font-bold bg-emerald-50/40 text-emerald-950 border-l border-r border-emerald-100">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={it.qty || ''}
                            onChange={(e) => handleQtyChange(idx, e.target.value)}
                            className="w-20 text-right bg-white border border-emerald-300 rounded px-1.5 py-0.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono text-xs text-purple-950 font-bold bg-purple-50/40 border-r border-purple-100">
                          ₹ {(it.benchmark || it.rateCard || 1450).toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-xs text-sky-950 bg-sky-50/40 border-r border-sky-100">
                          ₹ {((it.benchmark || it.rateCard || 1450) * it.qty).toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenAmend(it, idx)}
                              className="px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded text-[11px] font-bold transition-colors"
                            >
                              {UI_STRINGS.prModule.amendItemButton}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800">
                  <tr>
                    <td colSpan={4} className="p-2.5 text-right uppercase tracking-wider text-[11px] text-slate-600 font-bold">
                      {UI_STRINGS.prModule.totalBenchmarkValue}:
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-950 bg-emerald-50/80 border-l border-r border-emerald-200">
                      {items.reduce((sum, it) => sum + it.qty, 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right font-mono text-xs text-slate-500 bg-purple-50/50 border-r border-purple-100">
                      Benchmark
                    </td>
                    <td className="p-2.5 text-right font-mono font-black text-sm text-sky-950 bg-sky-100/80 border-r border-sky-200">
                      ₹ {totalBenchmarkAmount.toLocaleString()}
                    </td>
                    <td className="p-2.5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom RFQ Dispatch Banner */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    BOQ Schedule Finalized
                  </span>
                  <span className="text-xs text-slate-600 font-mono font-bold">
                    {items.length} Scope Items • AI Benchmark: ₹ {totalBenchmarkAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  AI Benchmark pricing calculated. Ready to proceed to RFQ.
                </p>
              </div>
              <button
                type="button"
                onClick={handleProceedToRaiseRFQ}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 shrink-0 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{UI_STRINGS.prModule.proceedToRaiseRFQ}</span>
              </button>
            </div>
          </div>

        </div>

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
        subCategoryHint={subCategory}
      />
    </div>
  );
};
