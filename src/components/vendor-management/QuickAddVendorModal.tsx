'use client';

import React, { useState } from 'react';
import { UserPlus, X, CheckCircle2 } from 'lucide-react';
import { UI_STRINGS } from '@/constants';
import type { ManagedVendor } from '@/types';

interface QuickAddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    vendor: Omit<
      ManagedVendor,
      'id' | 'source' | 'evaluationStatus' | 'ppoRatings' | 'compositeRating' | 'totalPPOsCompleted'
    >
  ) => void;
}

export const QuickAddVendorModal: React.FC<QuickAddVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Civil & Structural Works');
  const [subCategory, setSubCategory] = useState<string>('General Contracting & Civil Works');
  const [gstin, setGstin] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [city, setCity] = useState<string>('Mumbai, Maharashtra');
  const [region, setRegion] = useState<string>('WEST');
  const [capacity, setCapacity] = useState<string>('High');
  const [leadTime, setLeadTime] = useState<string>('7-10 Days');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit({
      name,
      category,
      subCategory,
      region,
      regionLabel: `${region} (${city})`,
      rating: 4.2,
      reviewsCount: 0,
      isRateCard: false,
      rateCardCode: null,
      rateCardStatus: 'Empanelled',
      contactPerson,
      gstin: gstin || 'UNREGISTERED',
      city,
      leadTime,
      badgeText: 'Client Boarded Vendor',
      capacity,
      email,
      phone,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {UI_STRINGS.vendorManagement.quickAddModalTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Onboard an existing trusted contractor to your client tenant vendor database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="company-name-input" className="block font-bold text-slate-700">Company / Contractor Name *</label>
              <input
                id="company-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., BuildWell Civil Infrastructure Pvt Ltd"
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="procurement-category-select" className="block font-bold text-slate-700">Procurement Category *</label>
              <select
                id="procurement-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              >
                <option value="Civil & Structural Works">Civil & Structural Works</option>
                <option value="Interior & Fitouts">Interior & Fitouts</option>
                <option value="MEP (Mechanical & Electrical)">MEP (Mechanical & Electrical)</option>
                <option value="Facade & External Works">Facade & External Works</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="subcategory-input" className="block font-bold text-slate-700">Sub-Category / Trade</label>
              <input
                id="subcategory-input"
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Concrete, Flooring, HVAC"
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="gstin-input" className="block font-bold text-slate-700">GSTIN / Tax ID *</label>
              <input
                id="gstin-input"
                type="text"
                required
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="e.g., 27AABCS1234F1Z9"
                className="w-full font-mono border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-person-input" className="block font-bold text-slate-700">Contact Representative *</label>
              <input
                id="contact-person-input"
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Key Account Manager name"
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email-input" className="block font-bold text-slate-700">Corporate Email</label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@contractor.example.com"
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="phone-input" className="block font-bold text-slate-700">Phone Number</label>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="city-input" className="block font-bold text-slate-700">Operating City / State</label>
              <input
                id="city-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="region-select" className="block font-bold text-slate-700">Operating Region</label>
              <select
                id="region-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              >
                <option value="WEST">West (Mumbai / Pune / Gujarat)</option>
                <option value="NORTH">North (Delhi NCR / Haryana)</option>
                <option value="SOUTH">South (Bengaluru / Chennai)</option>
                <option value="EAST">East (Kolkata / Odisha)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Production Capacity</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              >
                <option value="High">High Capacity</option>
                <option value="Enterprise">Enterprise Scale</option>
                <option value="Medium">Medium Scale</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Lead Time</label>
              <input
                type="text"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                placeholder="e.g. 7-10 Days"
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
            >
              {UI_STRINGS.common.cancel}
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Onboard Client Vendor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
