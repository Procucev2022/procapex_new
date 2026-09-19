'use client';

import React, { useState } from 'react';
import {
  Store,
  ShieldCheck,
  KeyRound,
  Building2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { VendorLoginViewProps } from '@/types';
import { UI_STRINGS } from '@/constants';
import { logger } from '@/lib/logger';

export const VendorLoginView: React.FC<VendorLoginViewProps> = ({
  vendors,
  selectedVendorId,
  onSelectVendor,
  onLoginSuccess,
}) => {
  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) ?? vendors[0];

  const handleQuickFill = (): void => {
    setUserId('welcome');
    setPassword('welcome');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const cleanUser = userId.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'welcome' && cleanPass === 'welcome') {
      setIsLoggingIn(true);
      setErrorMessage(null);
      logger.info('components/VendorLoginView', 'Vendor authenticated successfully', {
        vendorId: selectedVendor?.id,
        vendorName: selectedVendor?.name,
        userId: cleanUser,
      });
      onLoginSuccess(selectedVendorId);
    } else {
      setErrorMessage(UI_STRINGS.vendorPortal.loginError);
      logger.warn('components/VendorLoginView', 'Failed vendor authentication attempt', {
        attemptedUser: cleanUser,
        vendorId: selectedVendor?.id,
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6">
      {/* Container Card */}
      <div className="bg-white rounded-3xl border border-blue-200 shadow-xl overflow-hidden transition-all">
        {/* Brand Banner */}
        <div className="bg-brand-900 text-white p-6 sm:p-8 relative overflow-hidden border-b border-brand-800">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-50/20 text-sky-200 border border-sky-400/40 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Store className="w-3 h-3" />
                <span>{UI_STRINGS.vendorPortal.roleBadge}</span>
              </span>
              <span className="text-[11px] text-sky-200/80 font-mono">
                ProCapX Supplier Network
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {UI_STRINGS.vendorPortal.loginTitle}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              {UI_STRINGS.vendorPortal.loginSubtitle}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Vendor Company Picker */}
          <div className="space-y-1.5">
            <label
              htmlFor="vendor-company-select"
              className="text-xs font-bold text-slate-700 flex items-center justify-between"
            >
              <span className="flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>{UI_STRINGS.vendorPortal.selectVendorCompany}</span>
              </span>
              {selectedVendor?.source === 'CLIENT_ONBOARDED' && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  🏢 {UI_STRINGS.vendorPortal.onboardedBadge}
                </span>
              )}
            </label>
            <select
              id="vendor-company-select"
              data-testid="vendor-company-select"
              value={selectedVendorId}
              onChange={(e) => onSelectVendor(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.source === 'CLIENT_ONBOARDED' ? '🏢 [Client Boarded] ' : '🌐 [ProCPX] '}
                  {v.name} ({v.id}) - {v.city || v.category}
                </option>
              ))}
            </select>
          </div>

          {/* User ID Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="vendor-userid-input"
              className="text-xs font-bold text-slate-700 block"
            >
              {UI_STRINGS.vendorPortal.loginUserIdLabel}
            </label>
            <div className="relative">
              <input
                id="vendor-userid-input"
                data-testid="vendor-userid-input"
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="welcome"
                required
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="vendor-password-input"
              className="text-xs font-bold text-slate-700 block"
            >
              {UI_STRINGS.vendorPortal.loginPasswordLabel}
            </label>
            <div className="relative">
              <input
                id="vendor-password-input"
                data-testid="vendor-password-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="welcome"
                required
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Credentials Info Callout */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5 text-purple-900 font-bold">
                <KeyRound className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>{UI_STRINGS.vendorPortal.loginHint}</span>
              </div>
              <p className="text-[11px] text-purple-700">
                Authorized credentials provisioned upon client vendor onboarding.
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              data-testid="vendor-quickfill-credentials"
              className="shrink-0 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{UI_STRINGS.vendorPortal.quickFillCredentials}</span>
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div
              data-testid="vendor-login-error"
              className="bg-rose-50 border border-rose-300 text-rose-800 rounded-xl p-3 text-xs flex items-start space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            data-testid="vendor-login-submit"
            disabled={isLoggingIn}
            className="w-full py-3 px-4 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
          >
            {isLoggingIn ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>{UI_STRINGS.vendorPortal.loginSuccess}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                <span>{UI_STRINGS.vendorPortal.loginButton}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
