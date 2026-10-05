import React, { useState } from 'react';
import { MapPin, ShieldCheck, ExternalLink, HelpCircle, PhoneCall, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { INDIAN_FORUMS, ForumGuideItem } from '../data/courtForumData';

export default function ForumFinder() {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedForum, setSelectedForum] = useState<ForumGuideItem>(INDIAN_FORUMS[0]);

  const categories = ['All', 'Police & Cyber', 'Consumer', 'Labour', 'Civil & Rent', 'Tribunal', 'ADR & Legal Aid'];

  const filteredForums = INDIAN_FORUMS.filter(f => {
    if (selectedFilter === 'All') return true;
    return f.forumType === selectedFilter;
  });

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 font-serif font-bold text-xl mb-1">
          <MapPin className="w-5 h-5 text-amber-400" />
          <span>Where Should I Go? (Indian Court & Forum Guidance)</span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Different legal matters in India must be instituted in specific forums based on the subject matter, monetary value (pecuniary jurisdiction), and location (territorial jurisdiction).
        </p>

        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
          <strong>Important Rule:</strong> Jurisdiction depends on facts, location where the dispute occurred, value of the claim, and applicable state statutes. Always confirm territorial jurisdiction with an advocate.
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === cat
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid: Forum Selection List & Detailed Guide View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forum List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredForums.map(forum => {
            const isSelected = selectedForum.id === forum.id;
            return (
              <div
                key={forum.id}
                onClick={() => setSelectedForum(forum)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {forum.forumType}
                  </span>
                  {forum.officialPortalOrHelpline && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {forum.officialPortalOrHelpline.split('|')[0]}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2">
                  {forum.name}
                </h3>
                {forum.hindiName && (
                  <div className="text-xs text-slate-500 font-serif">{forum.hindiName}</div>
                )}

                <div className="mt-2 text-xs text-slate-600 line-clamp-1">
                  Handles: {forum.typesOfDisputes.join(', ')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Forum Detailed Guide */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-900">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {selectedForum.forumType} Authority
            </span>
            <h3 className="text-xl font-bold font-serif text-slate-950 mt-1">
              {selectedForum.name}
            </h3>
            {selectedForum.hindiName && (
              <p className="text-sm text-slate-500 font-serif">{selectedForum.hindiName}</p>
            )}
          </div>

          {/* Types of Disputes Handled */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Types of Disputes & Problems Handled:
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
              {selectedForum.typesOfDisputes.map((d, i) => (
                <li key={i} className="flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Jurisdiction Rules */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 text-xs space-y-1">
            <div className="font-bold text-purple-950 uppercase text-[11px] tracking-wide">
              Jurisdiction & Territorial Limits:
            </div>
            <p className="text-purple-900 leading-relaxed">
              {selectedForum.pecuniaryOrTerritorialJurisdiction}
            </p>
          </div>

          {/* How to Approach */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              How to Approach this Authority (Step-by-Step):
            </h4>
            <ol className="space-y-2 text-xs text-slate-800 list-decimal list-inside bg-slate-50 p-4 rounded-xl border border-slate-200">
              {selectedForum.howToApproach.map((step, i) => (
                <li key={i} className="leading-relaxed pl-1">{step}</li>
              ))}
            </ol>
          </div>

          {/* Expected Documents & Timeframe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 uppercase text-[11px]">
                📑 Documents Required:
              </div>
              <ul className="space-y-1 text-slate-700">
                {selectedForum.expectedDocuments.map((doc, i) => (
                  <li key={i}>• {doc}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 uppercase text-[11px]">
                ⏱️ Expected Timeframe:
              </div>
              <p className="text-slate-700 leading-relaxed">
                {selectedForum.averageTimeframe}
              </p>
              {selectedForum.officialPortalOrHelpline && (
                <div className="pt-2 text-amber-900 font-semibold text-[11px]">
                  Official Contact: {selectedForum.officialPortalOrHelpline}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
