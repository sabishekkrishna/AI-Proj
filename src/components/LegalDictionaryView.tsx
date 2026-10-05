import React, { useState } from 'react';
import { BookOpen, Search, HelpCircle, ArrowRight, Tag } from 'lucide-react';
import { LEGAL_DICTIONARY_TERMS, DictionaryTerm } from '../data/legalDictionaryData';

export default function LegalDictionaryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Criminal Law', 'Civil Law', 'Civil Litigation', 'Criminal Procedure', 'Evidence Law', 'Court Procedure', 'Banking / Commercial Law'];

  const filteredTerms = LEGAL_DICTIONARY_TERMS.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category.includes(selectedCategory);
    const matchesSearch =
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.hindiTerm && t.hindiTerm.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.simpleExplanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 font-serif font-bold text-xl mb-1">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>Indian Legal Terms Dictionary (Plain English & Hindi)</span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Indian legal documents and court proceedings are filled with Latin maxims and complex terminology. Search any legal term below to see its formal definition alongside an easy plain-language explanation and real-life example.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search legal term (e.g. 'FIR', 'Bail', 'Injunction', 'Caveat', 'Limitation', 'Affidavit')..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c
                  ? 'bg-amber-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-amber-400/80 transition-all space-y-3 text-slate-900"
          >
            {/* Term Title & Category */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-base text-slate-950 font-serif">
                  {item.term}
                </h3>
                {item.hindiTerm && (
                  <div className="text-xs text-amber-700 font-serif font-medium mt-0.5">
                    {item.hindiTerm}
                  </div>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {item.category}
              </span>
            </div>

            {/* Plain English Explanation */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1">
              <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wide block">
                Simple Explanation (In Everyday Words):
              </span>
              <p className="text-amber-950 leading-relaxed font-sans">{item.simpleExplanation}</p>
            </div>

            {/* Formal Definition */}
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">Formal Legal Definition: </span>
              {item.definition}
            </div>

            {/* Practical Example */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block mb-0.5">Real-Life Example:</span>
              <p className="italic">{item.example}</p>
            </div>

            {/* Related Terms */}
            {item.relatedTerms && item.relatedTerms.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="font-medium text-slate-600">Related:</span>
                {item.relatedTerms.map((rt, i) => (
                  <span
                    key={i}
                    onClick={() => setSearchTerm(rt)}
                    className="bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 px-2 py-0.5 rounded border border-slate-200 cursor-pointer transition-colors"
                  >
                    {rt}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredTerms.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            No matching legal terms found for "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}
