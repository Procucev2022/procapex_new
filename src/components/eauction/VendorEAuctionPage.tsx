'use client';

import React, { useState } from 'react';
import {
  Trophy,
  AlertTriangle,
  Send,
  Sliders,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS, formatString } from '@/constants';
import { formatAuctionTimer } from '@/lib/eauction-utils';
import type { VendorEAuctionPageProps } from '@/types';

export const VendorEAuctionPage: React.FC<VendorEAuctionPageProps> = ({
  vendorId,
  vendorName,
  prId = 'PR-2026-0005',
}) => {
  const {
    getEAuctionByPRId,
    submitEAuctionBid,
    setEAuctionProxyFloor,
  } = useProcurement();

  const auction = getEAuctionByPRId(prId) || getEAuctionByPRId('PR-2026-0005');

  const [customBid, setCustomBid] = useState<string>('');
  const [proxyFloorInput, setProxyFloorInput] = useState<string>('');
  const [hasAgreedDeclaration, setHasAgreedDeclaration] = useState<boolean>(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [proxySuccess, setProxySuccess] = useState<string | null>(null);

  if (!auction) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-800">No Active E-Auction for your RFQ</h3>
        <p className="text-xs text-slate-500">You will be notified once the buyer initiates the live bidding room.</p>
      </div>
    );
  }

  const participant = auction.participants.find((p) => p.vendorId === vendorId) || {
    vendorId,
    vendorName,
    maskedName: 'You',
    initialQuote: auction.ceilingPrice,
    currentBid: auction.ceilingPrice,
    currentRank: auction.participants.length + 1,
    bidsPlacedCount: 0,
    isOnline: true,
  };

  const isLive = auction.status === 'LIVE' || auction.status === 'EXTENDED';
  const isL1 = participant.currentRank === 1;
  const minDecrement = auction.rules.minDecrementAmount;
  const nextEligibleBid = participant.currentBid - minDecrement;
  const takeoverBid = Math.min(nextEligibleBid, auction.currentL1Price - minDecrement);

  const handlePlaceBid = (bidAmt: number): void => {
    setBidError(null);
    setBidSuccess(null);

    if (!isLive) {
      setBidError('Auction is currently not active for bidding.');
      return;
    }

    if (!hasAgreedDeclaration) {
      setBidError('Please confirm the legal declaration checkbox before placing your bid.');
      return;
    }

    const res = submitEAuctionBid({
      auctionId: auction.id,
      vendorId: participant.vendorId,
      bidAmount: bidAmt,
    });

    if (!res.isValid) {
      setBidError(res.errorMessage || 'Bid rejected by auction rules.');
    } else {
      setBidSuccess(`Bid of ₹${bidAmt.toLocaleString()} successfully logged!`);
      setCustomBid('');
    }
  };

  const handleSaveProxy = (): void => {
    setProxySuccess(null);
    const floor = Number(proxyFloorInput);
    if (!floor || floor <= 0) {
      return;
    }
    setEAuctionProxyFloor({
      auctionId: auction.id,
      vendorId: participant.vendorId,
      floorPrice: floor,
    });
    setProxySuccess(`Auto-bid reserve floor set to ₹${floor.toLocaleString()}.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Synchronized Countdown Clock */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Supplier Bidding Arena • {auction.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">Package: {auction.prId}</span>
            </div>
            <h1 className="text-xl font-black mt-1 text-white">{UI_STRINGS.eauction.vendorArenaTitle}</h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">{UI_STRINGS.eauction.vendorArenaSubtitle}</p>
          </div>

          <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-center shrink-0 min-w-[170px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {UI_STRINGS.eauction.countdownLabel}
            </span>
            <div
              className={`text-3xl font-mono font-black mt-0.5 ${
                auction.remainingSeconds < 120 && isLive ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {formatAuctionTimer(auction.remainingSeconds)}
            </div>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Status: {auction.status}</span>
          </div>
        </div>
      </div>

      {/* Real-Time Rank Status Hero Card */}
      <div
        className={`p-5 rounded-2xl border transition-all shadow-sm ${
          isL1
            ? 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white border-emerald-500/50'
            : 'bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 text-white border-amber-500/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isL1 ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-amber-500 text-slate-950 shadow-md'
              }`}
            >
              {isL1 ? <Trophy className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-mono font-bold block text-slate-300">
                {participant.vendorName} ({participant.vendorId})
              </span>
              <h2 className="text-lg font-black tracking-tight mt-0.5">
                {isL1
                  ? UI_STRINGS.eauction.vendorStandingLeading
                  : formatString(UI_STRINGS.eauction.vendorStandingOutbid, {
                      rank: String(participant.currentRank),
                    })}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-right bg-black/30 p-3 rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] text-slate-300 uppercase block font-bold">Your Current Bid</span>
              <span className="text-base font-mono font-black text-white">
                ₹ {participant.currentBid.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase block font-bold">Current Market L1</span>
              <span className="text-base font-mono font-black text-emerald-400">
                ₹ {auction.currentL1Price.toLocaleString()}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-300 uppercase block font-bold">Min Decrement Step</span>
              <span className="text-base font-mono font-bold text-amber-300">₹ {minDecrement.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Bidding Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bidding Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>{UI_STRINGS.eauction.quickBidLabel}</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              {formatString(UI_STRINGS.eauction.minNextEligibleBidTemplate, {
                amount: nextEligibleBid.toLocaleString(),
              })}
            </span>
          </div>

          {bidError && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{bidError}</span>
            </div>
          )}

          {bidSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bidSuccess}</span>
            </div>
          )}

          {/* 3 One-Click Quick Decrement Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handlePlaceBid(nextEligibleBid)}
              disabled={!isLive || nextEligibleBid <= 0}
              className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-left transition-all disabled:opacity-40"
            >
              <span className="text-[10px] font-bold text-blue-700 block uppercase">Min Decrement</span>
              <span className="text-sm font-mono font-black text-blue-950 block mt-0.5">
                ₹ {nextEligibleBid.toLocaleString()}
              </span>
              <span className="text-[10px] text-blue-600 font-mono block mt-1">-₹ {minDecrement.toLocaleString()}</span>
            </button>

            <button
              type="button"
              onClick={() => handlePlaceBid(takeoverBid)}
              disabled={!isLive || takeoverBid <= 0}
              className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-left transition-all disabled:opacity-40"
            >
              <span className="text-[10px] font-bold text-emerald-700 block uppercase">L1 Takeover Bid</span>
              <span className="text-sm font-mono font-black text-emerald-950 block mt-0.5">
                ₹ {takeoverBid.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">Take Lead 🏆</span>
            </button>

            <button
              type="button"
              onClick={() => handlePlaceBid(takeoverBid - minDecrement)}
              disabled={!isLive || takeoverBid - minDecrement <= 0}
              className="p-3 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-left transition-all disabled:opacity-40"
            >
              <span className="text-[10px] font-bold text-purple-700 block uppercase">Aggressive Lead</span>
              <span className="text-sm font-mono font-black text-purple-950 block mt-0.5">
                ₹ {(takeoverBid - minDecrement).toLocaleString()}
              </span>
              <span className="text-[10px] text-purple-600 font-mono block mt-1">-2x Step</span>
            </button>
          </div>

          {/* Custom Bid Input */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-slate-700 block">
              {UI_STRINGS.eauction.customBidLabel}
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={customBid}
                  onChange={(e) => setCustomBid(e.target.value)}
                  placeholder={`Max allowable: ${nextEligibleBid.toLocaleString()}`}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handlePlaceBid(Number(customBid))}
                disabled={!isLive || !customBid || Number(customBid) <= 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.eauction.submitBidButton}</span>
              </button>
            </div>
          </div>

          {/* Legal Declaration */}
          <div className="flex items-start space-x-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="bidDeclaration"
              checked={hasAgreedDeclaration}
              onChange={(e) => setHasAgreedDeclaration(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="bidDeclaration" className="text-[11px] text-slate-600 leading-snug cursor-pointer">
              {UI_STRINGS.eauction.bidConfirmationDeclaration}
            </label>
          </div>
        </div>

        {/* Auto-Bidding & Masked Live Room Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Proxy Auto-Bidding Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>{UI_STRINGS.eauction.autoBidTitle}</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{UI_STRINGS.eauction.autoBidSubtitle}</p>
            </div>

            {proxySuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{proxySuccess}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">
                {UI_STRINGS.eauction.autoBidFloorLabel}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={proxyFloorInput}
                  onChange={(e) => setProxyFloorInput(e.target.value)}
                  placeholder="e.g. 4200000"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleSaveProxy}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs"
                >
                  {UI_STRINGS.eauction.saveAutoBidButton}
                </button>
              </div>
            </div>
          </div>

          {/* Masked Live Bids Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Live Competitor Bid Stream
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Competitor names masked for auction integrity</p>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {auction.bids.slice(0, 6).map((b) => {
                const isYou = b.vendorId === participant.vendorId;
                return (
                  <div
                    key={b.id}
                    className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                      isYou ? 'bg-blue-50/70 border-blue-300 font-semibold' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900">{isYou ? 'You' : b.maskedVendorName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">₹ {b.bidAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Rank #{b.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
