import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, ShieldCheck, BookOpen, AlertCircle, Filter, Calendar } from 'lucide-react';
import { LegalSourceItem } from '../types';
import { fetchLegalSourcesApi } from '../services/apiService';

const ALL_CATEGORIES = [
  'All',
  'Criminal Law',
  'Civil Disputes',
  'Family Law',
  'Property Law',
  'Consumer Protection',
  'Employment/Labour',
  'Cybercrime',
  'Banking/Financial Fraud',
  'Motor Vehicle/Accident',
  'Rent/Tenancy',
  'Contract Disputes',
  'Constitutional Rights',
  'Domestic Violence',
  'Defamation'
];

export default function LawSearch() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sources, setSources] = useState<LegalSourceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSources();
  }, [selectedCategory]);

  const loadSources = async (searchQuery: string = query) => {
    setLoading(true);
    try {
      const data = await fetchLegalSourcesApi(searchQuery, selectedCategory);
      setSources(data.sources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSources(query);
  };

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 font-serif font-bold text-xl mb-1">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>Search Indian Law & Authoritative Statutes</span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl">
          Search the Indian Legal Knowledge Base across Central Acts, Criminal Sanhitas (BNS, BNSS, BSA 2023), Consumer Protection, and IT Acts. Explanations are provided in simple language alongside official references.
        </p>

        {/* Current Law Banner */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Current Indian Criminal Law Enforced:</strong> All criminal references reflect the Bharatiya Nyaya Sanhita, 2023 (BNS), BNSS, and BSA in effect from 1 July 2024, with historical IPC/CrPC cross-references clearly noted.
          </span>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by keyword, section, offence, or topic (e.g., 'cheating', 'deposit', 'salary', 'Section 318 BNS', 'accident')..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Found <strong>{sources.length}</strong> authoritative statutory entries</span>
          <span>Verified against Official India Code Repository</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Searching statutory index...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sources.map(s => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-amber-400/60 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {s.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-mono font-semibold text-slate-800">
                        {s.section || 'General Provisions'}
                      </span>
                      {s.chapter && (
                        <>
                          <span className="text-slate-300 hidden sm:inline">•</span>
                          <span className="text-xs text-slate-500 hidden sm:inline">{s.chapter}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-950 mt-1">
                      {s.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        s.confidence === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {s.confidence}
                    </span>
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {s.currentStatus}
                    </span>
                  </div>
                </div>

                {/* Act Name & Old Equivalent */}
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-slate-900 text-sm">{s.act}</div>
                  {s.oldEquivalent && (
                    <div className="text-slate-500 italic bg-amber-50/60 border border-amber-200/60 p-2 rounded-lg">
                      <strong>Historical Predecessor:</strong> {s.oldEquivalent}
                    </div>
                  )}
                </div>

                {/* Plain-Language Explanation */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-xs text-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                    What This Law Generally Means (Simple Language):
                  </span>
                  <p className="leading-relaxed text-slate-700">{s.simpleExplanation}</p>
                </div>

                {/* Full Legal Summary */}
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Statutory Summary: </span>
                  {s.fullProvisionsSummary}
                </div>

                {/* Key Elements & Remedies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">Key Legal Elements:</span>
                    <ul className="space-y-0.5 text-slate-700">
                      {s.keyElements.map((el, i) => (
                        <li key={i}>• {el}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-900">Remedies / Penalty: </span>
                      <span className="text-slate-700">{s.remediesOrPenalties}</span>
                    </div>
                    {s.limitationPeriod && (
                      <div className="text-amber-900 bg-amber-50 p-1.5 rounded text-[11px] font-medium border border-amber-200">
                        <strong>Limitation:</strong> {s.limitationPeriod}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Forums & Official Link */}
                <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-800">Jurisdictional Forums: </span>
                    {s.relevantForums.join(' • ')}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400">Verified: {s.verifiedDate}</span>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold text-xs"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {sources.length === 0 && !loading && (
              <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                No matching legal provisions found for "{query}". Try searching broader terms like "theft", "notice", "contract", or "consumer".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
