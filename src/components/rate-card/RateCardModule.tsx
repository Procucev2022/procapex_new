'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Layers,
  TrendingDown,
  CheckCircle2,
  Zap,
  FileSpreadsheet,
} from 'lucide-react';
import { useProcurement } from '@/context/ProcurementContext';
import type { RateCardModuleProps, RateCardAgreement } from '@/types';
import { UI_STRINGS } from '@/constants';
import { RateCardAgreementCard } from './RateCardAgreementCard';
import { RateCardLineItemsTable } from './RateCardLineItemsTable';
import { CreateRateCardProposalView } from './CreateRateCardProposalView';
import { RateCardNegotiationView } from './RateCardNegotiationView';

export const RateCardModule: React.FC<RateCardModuleProps> = ({
  initialSubTab = 'active',
  onRouteToRFQ,
  onRouteToPPO,
}) => {
  const { rateCards, finalizeRateCard } = useProcurement();

  const [activeSubTab, setActiveSubTab] = useState<'active' | 'create_proposal' | 'negotiations'>(
    initialSubTab
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedAgreement, setSelectedAgreement] = useState<RateCardAgreement | null>(
    rateCards.find((r) => r.status === 'FINALISED') ?? rateCards[0] ?? null
  );

  // Filtered active agreements
  const filteredAgreements = useMemo(() => {
    return rateCards.filter((ag) => {
      const matchesSearch =
        ag.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === 'ALL' || ag.categoryCode === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [rateCards, searchQuery, selectedCategoryFilter]);

  const activeCount = rateCards.filter((r) => r.status === 'FINALISED').length;
  const proposalCount = rateCards.filter((r) => r.status === 'PROPOSAL_SENT' || r.status === 'COUNTER_OFFERED').length;
  const totalItemsCovered = rateCards
    .filter((r) => r.status === 'FINALISED')
    .reduce((sum, r) => sum + r.totalItemsCount, 0);

  return (
    <div className="space-y-6">
      {/* Unified Dark Navy Banner (Standard across all modules) */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {UI_STRINGS.rateCards.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Enterprise Fast-Track Procurement
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-brand-400" />
              {UI_STRINGS.rateCards.title}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {UI_STRINGS.rateCards.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSubTab('create_proposal')}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              New RC Proposal
            </button>
            {onRouteToRFQ && (
              <button
                type="button"
                onClick={onRouteToRFQ}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-brand-400" />
                Go to RFQ Hub
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards inside Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 block">
              Active Rate Cards
            </span>
            <span className="text-xl font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {activeCount} Agreements
            </span>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 block">
              Standard BOQ Coverage
            </span>
            <span className="text-xl font-bold text-brand-300 flex items-center gap-1.5 mt-0.5">
              <FileSpreadsheet className="w-4 h-4 text-brand-400" />
              {totalItemsCovered} Items Locked
            </span>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 block">
              Proposals in Negotiation
            </span>
            <span className="text-xl font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              {proposalCount} Proposals
            </span>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] font-medium text-slate-400 block">
              Fast-Track SLA
            </span>
            <span className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              Direct PPO Eligible
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('active')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === 'active'
              ? 'border-brand-600 text-brand-600 bg-brand-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          {UI_STRINGS.rateCards.tabActiveRateCards}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('create_proposal')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === 'create_proposal'
              ? 'border-brand-600 text-brand-600 bg-brand-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Plus className="w-4 h-4" />
          {UI_STRINGS.rateCards.tabCreateProposal}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('negotiations')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSubTab === 'negotiations'
              ? 'border-brand-600 text-brand-600 bg-brand-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          {UI_STRINGS.rateCards.tabNegotiations}
          {proposalCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
              {proposalCount}
            </span>
          )}
        </button>
      </div>

      {/* Sub-Tab 1: Active Rate Cards Directory */}
      {activeSubTab === 'active' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by vendor name, category, or agreement ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 focus:bg-white focus:border-brand-500 outline-none font-medium text-slate-700"
              >
                <option value="ALL">All Trade Categories</option>
                <option value="CIVIL">Civil & Structural Works</option>
                <option value="INTERIOR">Interior Fitouts & Millwork</option>
                <option value="MEP">MEP & Electrical Services</option>
                <option value="FACADE">External Facade & Glazing</option>
              </select>
            </div>
          </div>

          {/* Agreements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgreements.map((agreement) => (
              <RateCardAgreementCard
                key={agreement.id}
                agreement={agreement}
                isSelected={selectedAgreement?.id === agreement.id}
                onSelectAgreement={(ag) => setSelectedAgreement(ag)}
                onFinalize={(id) => finalizeRateCard(id)}
              />
            ))}
          </div>

          {/* Selected Agreement Inspection Detail */}
          {selectedAgreement && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {selectedAgreement.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      Version {selectedAgreement.version}.0
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedAgreement.vendorName} — {selectedAgreement.categoryName} Master Rate Card
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Effective: {selectedAgreement.effectiveDate} to {selectedAgreement.expiryDate} • Payment: {selectedAgreement.paymentTerms ?? '30 Days Net'} • Lead Time: {selectedAgreement.leadTimeDays ?? 14} Days
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {onRouteToPPO && selectedAgreement.status === 'FINALISED' && (
                    <button
                      type="button"
                      onClick={onRouteToPPO}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      {UI_STRINGS.rateCards.fastTrackButton}
                    </button>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <RateCardLineItemsTable
                items={selectedAgreement.items}
                status={selectedAgreement.status}
              />
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Create Proposal View */}
      {activeSubTab === 'create_proposal' && (
        <CreateRateCardProposalView
          onProposalCreated={(_id) => {
            setActiveSubTab('negotiations');
          }}
          onCancel={() => setActiveSubTab('active')}
        />
      )}

      {/* Sub-Tab 3: Seller Negotiations & Proposals */}
      {activeSubTab === 'negotiations' && (
        <RateCardNegotiationView
          agreements={rateCards}
          onFinalize={(id) => {
            finalizeRateCard(id);
            setActiveSubTab('active');
          }}
        />
      )}
    </div>
  );
};
