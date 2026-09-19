'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  PlusCircle,
  StopCircle,
  Trophy,
  ArrowLeft,
  Activity,
  Bot,
  CheckCircle2,
  TrendingDown,
  Users,
} from 'lucide-react';
import { useProcurement } from '@/context/ProcurementContext';
import { UI_STRINGS, formatString } from '@/constants';
import { formatAuctionTimer } from '@/lib/eauction-utils';
import type { BuyerEAuctionPageProps, EAuctionParticipant } from '@/types';

export const BuyerEAuctionPage: React.FC<BuyerEAuctionPageProps> = ({
  prId,
  onBackToNegotiation,
  onAwardToPPO,
}) => {
  const {
    getEAuctionByPRId,
    startEAuction,
    pauseEAuction,
    resumeEAuction,
    extendEAuction,
    concludeEAuction,
    simulateNextCompetitiveBid,
    awardEAuctionToL1,
  } = useProcurement();

  const [showAwardModal, setShowAwardModal] = useState<boolean>(false);
  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string | null>(null);

  const auction = getEAuctionByPRId(prId) || getEAuctionByPRId('PR-2026-0005');

  if (!auction) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <h3 className="text-base font-bold text-slate-800">No E-Auction Session Found</h3>
        <button
          type="button"
          onClick={onBackToNegotiation}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          {UI_STRINGS.eauction.backToNegotiationButton}
        </button>
      </div>
    );
  }

  const isLive = auction.status === 'LIVE' || auction.status === 'EXTENDED';
  const isConcluded = auction.status === 'CONCLUDED' || auction.status === 'AWARDED';

  const handleStartOrResume = (): void => {
    if (auction.status === 'PAUSED') {
      resumeEAuction(auction.id);
    } else {
      startEAuction(auction.id);
    }
  };

  const handleSimulate = (): void => {
    simulateNextCompetitiveBid(auction.id);
  };

  const handleConfirmAward = (): void => {
    const result = awardEAuctionToL1(auction.id);
    if (result) {
      const msg = formatString(UI_STRINGS.eauction.awardSuccessNoticeTemplate, {
        vendor: auction.currentL1VendorName,
        amount: result.winningPrice.toLocaleString(),
      });
      setAwardSuccessMsg(msg);
      setTimeout(() => {
        if (onAwardToPPO) {
          onAwardToPPO(result.winnerVendorId, result.winningPrice);
        }
      }, 1200);
    }
    setShowAwardModal(false);
  };

  const getStatusBadgeClass = (): string => {
    switch (auction.status) {
      case 'LIVE':
        return 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 animate-pulse';
      case 'EXTENDED':
        return 'bg-amber-500 text-slate-950 font-black animate-pulse';
      case 'PAUSED':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'CONCLUDED':
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'AWARDED':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-blue-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToNegotiation}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center space-x-1.5 text-xs font-bold border border-slate-200"
            title="Return to Commercial Negotiation Hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{UI_STRINGS.eauction.backToNegotiationButton}</span>
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Auction ID: {auction.id} • {auction.category}
            </span>
            <h1 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
              {UI_STRINGS.eauction.buyerConsoleTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${getStatusBadgeClass()}`}>
            {auction.status}
          </span>
        </div>
      </div>

      {awardSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{awardSuccessMsg}</span>
        </div>
      )}

      {/* Hero Control & Countdown Console */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-sky-400 font-bold">
              Target Package: {auction.prId}
            </span>
            <h2 className="text-xl font-black text-white leading-snug">{auction.title}</h2>
            <p className="text-xs text-slate-400 max-w-xl">{UI_STRINGS.eauction.buyerConsoleSubtitle}</p>
          </div>

          {/* Big High-Tech Timer Card */}
          <div className="flex items-center space-x-6 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shrink-0">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {UI_STRINGS.eauction.countdownLabel}
              </span>
              <div
                className={`text-4xl font-mono font-black mt-0.5 ${
                  auction.remainingSeconds < 120 && isLive ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {formatAuctionTimer(auction.remainingSeconds)}
              </div>
              {auction.status === 'EXTENDED' && (
                <span className="text-[9px] text-amber-300 font-semibold block mt-1">
                  {UI_STRINGS.eauction.overtimeNotice}
                </span>
              )}
            </div>

            {/* Buyer Live Actions */}
            <div className="flex flex-col gap-1.5 border-l border-slate-700 pl-4">
              {!isLive && !isConcluded && (
                <button
                  type="button"
                  onClick={handleStartOrResume}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{UI_STRINGS.eauction.startAuctionButton}</span>
                </button>
              )}
              {isLive && (
                <>
                  <button
                    type="button"
                    onClick={() => pauseEAuction(auction.id)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>{UI_STRINGS.eauction.pauseAuctionButton}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => extendEAuction(auction.id, 300)}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{UI_STRINGS.eauction.extendAuctionButton}</span>
                  </button>
                </>
              )}
              {!isConcluded && (
                <button
                  type="button"
                  onClick={() => concludeEAuction(auction.id)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>{UI_STRINGS.eauction.concludeAuctionButton}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSimulate}
                disabled={!isLive}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{UI_STRINGS.eauction.simulateBidButton}</span>
              </button>
              {isConcluded && auction.status !== 'AWARDED' && (
                <button
                  type="button"
                  onClick={() => setShowAwardModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-md"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{UI_STRINGS.eauction.awardToL1Button}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {UI_STRINGS.eauction.kpiBaselineBudget}
          </span>
          <span className="text-sm font-mono font-black text-slate-800 mt-1 block">
            ₹ {auction.baselineBudget.toLocaleString()}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {UI_STRINGS.eauction.kpiStartingL1}
          </span>
          <span className="text-sm font-mono font-bold text-slate-700 mt-1 block">
            ₹ {auction.ceilingPrice.toLocaleString()}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            {UI_STRINGS.eauction.kpiCurrentL1}
          </span>
          <span className="text-base font-mono font-black text-emerald-600 mt-0.5 block">
            ₹ {auction.currentL1Price.toLocaleString()}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            {UI_STRINGS.eauction.kpiTotalSavings}
          </span>
          <span className="text-sm font-mono font-black text-emerald-600 mt-1 flex items-center space-x-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>
              ₹ {auction.totalSavings.toLocaleString()} ({auction.savingsPct}%)
            </span>
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {UI_STRINGS.eauction.kpiTotalBids}
          </span>
          <span className="text-sm font-mono font-black text-slate-800 mt-1 flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>{auction.totalBidsCount} Bids</span>
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {UI_STRINGS.eauction.kpiActiveBidders}
          </span>
          <span className="text-sm font-mono font-black text-slate-800 mt-1 flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>{auction.participants.length} Active</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Live Leaderboard (Left) + Bid Audit Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dynamic Live Leaderboard */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black text-slate-900 flex items-center space-x-1.5 uppercase tracking-wide">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{UI_STRINGS.eauction.leaderboardTitle}</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Min Decrement: ₹ {auction.rules.minDecrementAmount.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-14 text-center">{UI_STRINGS.eauction.rankCol}</th>
                  <th className="p-2.5">{UI_STRINGS.eauction.bidderCol}</th>
                  <th className="p-2.5 text-right">{UI_STRINGS.eauction.currentBidCol}</th>
                  <th className="p-2.5 text-right">{UI_STRINGS.eauction.varianceCol}</th>
                  <th className="p-2.5 text-center w-14">{UI_STRINGS.eauction.bidsCountCol}</th>
                  <th className="p-2.5 text-center">{UI_STRINGS.eauction.statusCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auction.participants.map((p: EAuctionParticipant) => {
                  const isL1 = p.currentRank === 1;
                  const gapToL1 = p.currentBid - auction.currentL1Price;
                  return (
                    <tr
                      key={p.vendorId}
                      className={isL1 ? 'bg-amber-50/40 font-semibold' : 'hover:bg-slate-50/60'}
                    >
                      <td className="p-2.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[11px] ${
                            isL1 ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.currentRank}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{p.vendorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.vendorId}</div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        ₹ {p.currentBid.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-mono text-[11px]">
                        {isL1 ? (
                          <span className="text-emerald-600 font-bold">L1 LEADER</span>
                        ) : (
                          <span className="text-slate-500">+₹ {gapToL1.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-mono text-slate-600">{p.bidsPlacedCount}</td>
                      <td className="p-2.5 text-center">
                        {isL1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            Leading
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Outbid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Chronological Live Bid Stream */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>{UI_STRINGS.eauction.liveBidStreamTitle}</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{UI_STRINGS.eauction.liveBidStreamSubtitle}</p>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {auction.bids.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">No bids recorded yet.</div>
            )}
            {auction.bids.map((b) => {
              const isLead = b.rank === 1;
              return (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    isLead
                      ? 'bg-amber-50/50 border-amber-300/80 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{b.vendorName}</span>
                    <span className="font-mono font-black text-slate-900">₹ {b.bidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span className="font-mono">
                      {new Date(b.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    {b.decrementAmount > 0 && (
                      <span className="text-emerald-700 font-bold font-mono">
                        -₹ {b.decrementAmount.toLocaleString()}
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        isLead ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Rank #{b.rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Award Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-amber-600">
              <Trophy className="w-5 h-5" />
              <h3 className="font-black text-base text-slate-900">Award E-Auction to L1 Winner</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to conclude the bidding and formally award{' '}
              <strong>{auction.currentL1VendorName}</strong> at the final e-auction price of{' '}
              <strong>₹ {auction.currentL1Price.toLocaleString()}</strong>?
            </p>
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Starting L1 Quote:</span>
                <span>₹ {auction.ceilingPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600">
                <span>Final E-Auction Price:</span>
                <span>₹ {auction.currentL1Price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-1">
                <span>Total Additional Savings:</span>
                <span>
                  ₹ {auction.totalSavings.toLocaleString()} ({auction.savingsPct}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAwardModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAward}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Award & Route to PPO →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
