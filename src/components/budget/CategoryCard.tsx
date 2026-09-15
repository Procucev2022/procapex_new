'use client';

import React from 'react';
import { Layers, Plus, Tag, ArrowRight, Download } from 'lucide-react';
import type { CategoryCardProps } from '@/types';
import { UI_STRINGS, formatString } from '@/constants';
import { generateStandardBOQTemplateCSV, getCSVDataUri } from '@/lib/budget-utils';

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onAddSubCategory,
  onAddBOQItem,
  onViewCategoryItems,
}) => {
  const strings = UI_STRINGS.categoryStandardBOQMaster;
  const subCategories = category.subCategories ?? [];
  const itemsCount = category.items.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Card Header: Code Badge & Cost Center */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              {category.shortCode}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {category.costCenter}
            </span>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {formatString(strings.totalItemsBadgeTemplate, { count: itemsCount })}
          </span>
        </div>

        {/* Category Name & Scope */}
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{category.name}</span>
          </h3>
          {category.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Sub-Categories Section */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {strings.subCategoriesListTitle} ({subCategories.length})
            </span>
          </div>

          {subCategories.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              {strings.noSubCategoriesDefined}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {subCategories.map((sub) => (
                <span
                  key={sub.id}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  <Tag className="w-3 h-3 text-indigo-500" />
                  <span className="font-mono font-bold">{sub.shortCode}:</span>
                  <span>{sub.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAddSubCategory(category.id)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{strings.addSubCategoryButton}</span>
          </button>

          <button
            type="button"
            onClick={() => onAddBOQItem(category.id)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{strings.addStandardBOQItemButton}</span>
          </button>

          <a
            href={getCSVDataUri(generateStandardBOQTemplateCSV(category, true))}
            download={`${category.shortCode || 'Category'}_Standard_BOQ_Format.csv`}
            title={formatString(strings.downloadCategoryBOQFormatTemplate, { category: category.name })}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{strings.downloadStandardBOQTemplateButton}</span>
          </a>
        </div>

        <button
          type="button"
          onClick={() => onViewCategoryItems(category.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-1"
        >
          <span>{formatString(strings.showingItemsTemplate, { count: itemsCount })}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    </div>
  );
};
