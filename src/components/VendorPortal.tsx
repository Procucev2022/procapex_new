'use client';

import React, { useMemo, useContext } from 'react';
import { Award, FileText, FileEdit, Layers, CreditCard, Zap } from 'lucide-react';
import type { VendorPortalProps, ManagedVendor } from '@/types';
import { UI_STRINGS } from '@/constants';
import { ProcurementContext } from '@/context/ProcurementContext';
import { VendorCataloguePricingTab } from './vendor-management/VendorCataloguePricingTab';
import { VendorProfileRateCardTab } from './rate-card/VendorProfileRateCardTab';
import { VendorEAuctionPage } from './eauction';
import { VendorLoginView } from './vendor-portal/VendorLoginView';
import { VendorIdentityBar } from './vendor-portal/VendorIdentityBar';
import { VendorRFQSummaryTab } from './vendor-portal/VendorRFQSummaryTab';
import { VendorQuotationSummaryTab } from './vendor-portal/VendorQuotationSummaryTab';
import { VendorPPOAwardTab } from './vendor-portal/VendorPPOAwardTab';
import { useVendorPortal } from './vendor-portal/useVendorPortal';

export const VendorPortal: React.FC<VendorPortalProps> = ({ initialAuthenticated }) => {
  const {
    allVendors,
    activeVendor,
    setActiveVendor,
    activePR,
    setActivePR,
    activeTab,
    setActiveTab,
    activeRound,
    setActiveRound,
    isAuthenticated,
    handleLoginSuccess,
    handleLogout,
    vendorRFQs,
    currentActiveRFQ,
    items,
    isCurrentRFQAccepted,
    handleAcceptRfq,
    ppoAccepted,
    setPpoAccepted,
    quote1Submitted,
    setQuote1Submitted,
    quote2Submitted,
    setQuote2Submitted,
    quote3Submitted,
    setQuote3Submitted,
    terms,
    setTerms,
    handleRate1Change,
    handleRate2Change,
    handleRate3Change,
    activeVendorObj,
    submitVendorQuote,
  } = useVendorPortal(initialAuthenticated);

  const procurement = useContext(ProcurementContext);
  const projectCategories = procurement?.projectCategories ?? [];
  const updateVendorCataloguePrices = procurement?.updateVendorCataloguePrices;
  const rawManagedVendors = procurement?.managedVendors;

  const activeManagedVendor: ManagedVendor = useMemo(() => {
    const list = rawManagedVendors ?? [];
    const found = list.find((v) => v.id === activeVendor);
    if (found) return found;
    return {
      ...activeVendorObj,
      categories: activeVendorObj.categories || [activeVendorObj.category],
    } as ManagedVendor;
  }, [rawManagedVendors, activeVendor, activeVendorObj]);

  if (!isAuthenticated) {
    return (
      <VendorLoginView
        vendors={allVendors}
        selectedVendorId={activeVendor}
        onSelectVendor={setActiveVendor}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      <VendorIdentityBar
        activeVendor={activeVendor}
        activePR={activePR}
        allVendors={allVendors}
        activeVendorObj={activeVendorObj}
        rfqAccepted={isCurrentRFQAccepted}
        ppoAccepted={ppoAccepted}
        availableRFQs={vendorRFQs}
        activeRFQTitle={currentActiveRFQ?.title}
        activeRFQProject={currentActiveRFQ?.projectName}
        onSelectVendor={setActiveVendor}
        onSelectPR={setActivePR}
        onAcceptRfq={() => handleAcceptRfq()}
        onViewPPO={() => setActiveTab('ppo')}
        onLogout={handleLogout}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto gap-1 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('rfq')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'rfq'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorPortal.tabRfqSummary}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('quote');
              setActiveRound(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'quote'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorPortal.tabQuotationSummary}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ppo')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'ppo'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorPortal.tabPPOAward}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rate_card')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'rate_card'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.rateCards.tabRateCard}</span>
            {activeManagedVendor.isRateCard && (
              <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full ml-1">
                Rate Card Active
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalogue')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'catalogue'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_STRINGS.vendorPortal.tabCataloguePricing}</span>
            {activeManagedVendor.catalogueStatus?.intimationSent &&
              !activeManagedVendor.catalogueStatus?.hasSubmittedPrices && (
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full ml-1">
                  Intimation Pending
                </span>
              )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('eauction')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'eauction'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{UI_STRINGS.eauction.tabEAuctionArena}</span>
          </button>
        </div>

        {activeTab === 'rfq' && (
          <VendorRFQSummaryTab
            rfqId={currentActiveRFQ?.id || `RFQ-${activePR.split('-')[1]}-${activePR.split('-')[2] || '0005'}`}
            rfqAccepted={isCurrentRFQAccepted}
            onAcceptRfq={handleAcceptRfq}
            onProceedToQuotation={() => {
              setActiveTab('quote');
              setActiveRound(1);
            }}
            items={items}
            activeVendorName={activeVendorObj.name}
            activeVendorId={activeVendor}
            allVendorRFQs={vendorRFQs}
            onSelectRFQ={(selectedId) => setActivePR(selectedId)}
            activeRFQItem={currentActiveRFQ}
          />
        )}

        {activeTab === 'quote' && (
          <VendorQuotationSummaryTab
            items={items}
            rfqAccepted={isCurrentRFQAccepted}
            onRate1Change={handleRate1Change}
            onRate2Change={handleRate2Change}
            onRate3Change={handleRate3Change}
            quote1Submitted={quote1Submitted}
            quote2Submitted={quote2Submitted}
            quote3Submitted={quote3Submitted}
            onSubmitQuote1={() => {
              setQuote1Submitted(true);
              const total = Math.round(items.reduce((a, b) => a + b.qty * b.rate1, 0));
              const lineRates = items.reduce<Record<string, number>>((acc, it) => {
                acc[it.code] = it.rate1;
                return acc;
              }, {});
              submitVendorQuote?.(
                activePR,
                activeVendor,
                1,
                total,
                `1st Round Formal Quotation submitted by ${activeVendorObj.name}`,
                lineRates
              );
              alert(
                `1st Round Formal Quotation (₹ ${total.toLocaleString()} + Quoted Terms) submitted successfully to Category Manager!`
              );
            }}
            onSubmitQuote2={() => {
              setQuote2Submitted(true);
              const total = Math.round(items.reduce((a, b) => a + b.qty * b.rate2, 0));
              const lineRates = items.reduce<Record<string, number>>((acc, it) => {
                acc[it.code] = it.rate2;
                return acc;
              }, {});
              submitVendorQuote?.(
                activePR,
                activeVendor,
                2,
                total,
                `Revised 2nd Quote (BAFO) submitted by ${activeVendorObj.name}`,
                lineRates
              );
              alert(
                `Revised 2nd Quote (BAFO: ₹ ${total.toLocaleString()} + Revised Terms) submitted successfully to Category Manager!`
              );
            }}
            onSubmitQuote3={() => {
              setQuote3Submitted(true);
              const total = Math.round(items.reduce((a, b) => a + b.qty * (b.rate3 || b.rate2), 0));
              const lineRates = items.reduce<Record<string, number>>((acc, it) => {
                acc[it.code] = it.rate3 || it.rate2;
                return acc;
              }, {});
              submitVendorQuote?.(
                activePR,
                activeVendor,
                3,
                total,
                `3rd & Final Settlement Quote submitted by ${activeVendorObj.name}`,
                lineRates
              );
              alert(
                `3rd & Final Settlement Quote (₹ ${total.toLocaleString()} + Final Terms) submitted successfully to Category Manager!`
              );
            }}
            terms={terms}
            onUpdateTerms={setTerms}
            onProceedToPPO={() => setActiveTab('ppo')}
            activeRound={activeRound}
            onSelectRound={setActiveRound}
          />
        )}

        {activeTab === 'ppo' && (
          <VendorPPOAwardTab
            ppoAccepted={ppoAccepted}
            onAcceptPPO={() => {
              setPpoAccepted(true);
              alert('Purchase Price Offer (PPO-2026-0005) accepted and activated!');
            }}
            items={items}
            activeVendorName={activeVendorObj.name}
            terms={terms}
          />
        )}

        {activeTab === 'rate_card' && (
          <div className="pt-2">
            <VendorProfileRateCardTab
              vendorId={activeManagedVendor.id}
              vendorName={activeManagedVendor.name}
              vendorCategory={activeManagedVendor.category}
              vendorCategories={activeManagedVendor.categories}
              isVendorPortal
            />
          </div>
        )}

        {activeTab === 'catalogue' && (
          <div className="pt-2">
            <VendorCataloguePricingTab
              vendor={activeManagedVendor}
              projectCategories={projectCategories}
              onSaveCataloguePrices={(vendorId, prices) => {
                updateVendorCataloguePrices?.(vendorId, prices);
              }}
            />
          </div>
        )}

        {activeTab === 'eauction' && (
          <div className="pt-2">
            <VendorEAuctionPage
              vendorId={activeVendor}
              vendorName={activeVendorObj.name}
              prId={activePR}
            />
          </div>
        )}
      </div>
    </div>
  );
};
