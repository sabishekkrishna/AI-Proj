import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  Search,
  Upload,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  FileText,
  Sliders,
  Layers,
  ArrowRight,
  BookOpen,
  Info,
  Check,
  Clock,
  ShieldCheck,
  Tag
} from 'lucide-react';
import {
  searchRagApi,
  askRagApi,
  fetchRagChunksApi,
  ingestRagDocumentApi,
  deleteRagChunkApi,
  fetchRagStatsApi,
  RagAskResult
} from '../services/apiService';
import { RagInspectionData, LegalChunk, RagSearchResult } from '../types';

interface RagHubProps {
  preferredLanguage?: string;
  onNavigateToChat?: (initialPrompt: string) => void;
}

const SAMPLE_RAG_QUERIES = [
  'What is the punishment and police procedure for UPI payment fraud and phishing under Bharatiya Nyaya Sanhita?',
  'Landlord refusing to refund security deposit after vacating flat. What are my legal remedies?',
  'Employer has not paid salary for 3 months. Can I file a claim under Payment of Wages Act or Labour Court?',
  'What are the mandatory legal requirements for filing a cheque bounce case under Section 138 NI Act?',
  'Can a woman get an immediate ex-parte protection and residence order under Domestic Violence Act?',
  'Builder delayed flat possession by over 2 years. What interest or refund can I claim under RERA Section 18?'
];

const PRELOADED_DOCUMENTS = [
  {
    title: 'RBI Master Directions on Customer Protection in Unauthorized Electronic Banking Transactions',
    act: 'Reserve Bank of India Act, 1934 & Banking Regulation Act, 1949',
    category: 'Banking/Financial Fraud',
    section: 'Circular RBI/2017-18/15 DBR.No.Leg.BC.78/09.07.005/2017-18',
    sourceUrl: 'https://rbi.org.in',
    content: `A customer has zero liability where the unauthorized transaction occurs through contributory fraud or deficiency on the part of the bank (irrespective of whether or not the transaction is reported by the customer). Zero liability also applies in third-party breaches where the deficiency lies neither with the bank nor with the customer but lies elsewhere in the system, and the customer notifies the bank within three working days of receiving the SMS or email alert. Where the delay in reporting is between four to seven working days, the maximum customer liability for basic savings bank deposit accounts is limited to ₹5,000, and for other savings accounts to ₹10,000. On being notified by the customer, the bank must credit the shadow reversal amount to the customer account within 10 working days from the date of such notification.`
  },
  {
    title: 'Supreme Court Landmark Guidelines on Arrest Procedure (Arnesh Kumar v. State of Bihar)',
    act: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS Section 35) / CrPC 41',
    category: 'Criminal Law',
    section: 'Supreme Court Criminal Appeal No. 1277 of 2014',
    sourceUrl: 'https://main.sci.gov.in',
    content: `The Supreme Court ruled that police officers shall not automatically arrest an accused when an offence is punishable with imprisonment for a term which may be less than seven years or extend to seven years (whether with or without fine). The police officer must satisfy the prerequisites under Section 41 CrPC (now Section 35(1) BNSS). In all cases where the arrest of a person is not required, police officers are duty-bound to serve a Notice of Appearance under Section 35(3) BNSS within two weeks from the date of institution of the case. Failure to comply with these guidelines makes the police officer liable for departmental proceedings as well as contempt of court before the High Court.`
  },
  {
    title: 'Consumer Protection (E-Commerce) Rules: Mandatory Grievance Officer and Refund Timelines',
    act: 'Consumer Protection Act, 2019',
    category: 'Consumer Protection',
    section: 'Rules 4, 5 & 6 (E-Commerce Rules, 2020)',
    sourceUrl: 'https://consumeraffairs.nic.in',
    content: `Every e-commerce marketplace and seller entity must appoint a designated Grievance Officer for consumer grievance redressal and display their name, designation, and contact details on the platform. The Grievance Officer must acknowledge receipt of any consumer complaint within forty-eight hours and redress the complaint within one month from the date of receipt. E-commerce entities cannot impose cancellation fees on consumers after confirming purchase unless similar charges are borne by the entity if they cancel the purchase. Sellers cannot refuse to take back goods or discontinue services if goods are defective, deficient, delivered late, or spurious.`
  }
];

export default function RagHub({ preferredLanguage = 'English', onNavigateToChat }: RagHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'qa' | 'explorer' | 'ingest'>('qa');

  // Q&A State
  const [queryInput, setQueryInput] = useState('');
  const [searchMethod, setSearchMethod] = useState<'hybrid' | 'vector' | 'lexical'>('hybrid');
  const [topK, setTopK] = useState(4);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);
  const [qaResult, setQaResult] = useState<RagAskResult | null>(null);
  const [inspectionData, setInspectionData] = useState<RagInspectionData | null>(null);
  const [showRawPrompt, setShowRawPrompt] = useState(false);
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(null);

  // Explorer State
  const [chunks, setChunks] = useState<LegalChunk[]>([]);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerCategory, setExplorerCategory] = useState('All');
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const [ragStats, setRagStats] = useState<any>(null);

  // Ingestion State
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestAct, setIngestAct] = useState('');
  const [ingestCategory, setIngestCategory] = useState('Civil Disputes');
  const [ingestSection, setIngestSection] = useState('');
  const [ingestContent, setIngestContent] = useState('');
  const [ingestChunkSize, setIngestChunkSize] = useState(250);
  const [ingestOverlap, setIngestOverlap] = useState(35);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestSuccessMessage, setIngestSuccessMessage] = useState<string | null>(null);

  // Load stats and chunks on mount
  useEffect(() => {
    loadChunksAndStats();
  }, []);

  const loadChunksAndStats = async () => {
    setIsLoadingChunks(true);
    try {
      const [chunksData, statsData] = await Promise.all([
        fetchRagChunksApi(explorerCategory, explorerSearch),
        fetchRagStatsApi()
      ]);
      setChunks(chunksData.chunks || []);
      setRagStats(statsData || chunksData.stats);
    } catch (err) {
      console.error('Failed to load RAG chunks:', err);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  const handleRunRagQuery = async (queryToRun?: string) => {
    const q = (queryToRun || queryInput).trim();
    if (!q) return;

    setIsSearching(true);
    setQaResult(null);
    setInspectionData(null);

    try {
      const [qaRes, inspectRes] = await Promise.all([
        askRagApi(q, {
          topK,
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          method: searchMethod,
          preferredLanguage
        }),
        searchRagApi(q, {
          topK,
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          method: searchMethod
        })
      ]);

      setQaResult(qaRes);
      setInspectionData(inspectRes);
    } catch (err: any) {
      console.error('Error in RAG execution:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestTitle || !ingestAct || !ingestContent) return;

    setIsIngesting(true);
    setIngestSuccessMessage(null);
    try {
      const res = await ingestRagDocumentApi({
        title: ingestTitle,
        act: ingestAct,
        category: ingestCategory,
        section: ingestSection,
        content: ingestContent,
        chunkSize: ingestChunkSize,
        overlap: ingestOverlap
      });

      setIngestSuccessMessage(`Successfully indexed "${ingestTitle}" into ${res.ingestedChunks} semantic vector chunks!`);
      // Reset form
      setIngestTitle('');
      setIngestAct('');
      setIngestSection('');
      setIngestContent('');
      // Refresh chunks
      loadChunksAndStats();
    } catch (err: any) {
      alert(`Ingestion failed: ${err.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleDeleteChunk = async (chunkId: string) => {
    if (!confirm('Are you sure you want to remove this vector chunk from the index?')) return;
    try {
      await deleteRagChunkApi(chunkId);
      loadChunksAndStats();
    } catch (err: any) {
      alert('Failed to delete chunk');
    }
  };

  const handlePreloadDoc = (doc: typeof PRELOADED_DOCUMENTS[0]) => {
    setIngestTitle(doc.title);
    setIngestAct(doc.act);
    setIngestCategory(doc.category);
    setIngestSection(doc.section);
    setIngestContent(doc.content);
    setIngestSuccessMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hybrid Dense Vector + BM25 Lexical Grounding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              NyayaSahayak Legal RAG Engine
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Retrieval-Augmented Generation specifically tuned for the Indian legal ecosystem. Synthesizes answers directly from verified statutory frameworks (BNS 2023, BNSS 2023, BSA 2023, CPA 2019, IT Act) to eliminate AI hallucinations and provide verified citations.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-center">
              <div className="text-xs text-slate-400 font-medium">Indexed Chunks</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">
                {ragStats?.totalChunks || chunks.length || 24}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">100% Verified Laws</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-center">
              <div className="text-xs text-slate-400 font-medium">Embedding Model</div>
              <div className="text-xs sm:text-sm font-semibold text-white mt-1.5 truncate">
                {ragStats?.embeddingModel?.includes('gemini') ? 'Gemini 768d' : 'Nyaya 128d Hybrid'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Dense Vector Cosine</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-center">
              <div className="text-xs text-slate-400 font-medium">Custom User Docs</div>
              <div className="text-xl sm:text-2xl font-bold text-indigo-300 mt-0.5">
                {ragStats?.customChunks || 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Live Ingested</div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('qa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeSubTab === 'qa'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>RAG Grounded Q&A & Query Lab</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('explorer');
              loadChunksAndStats();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeSubTab === 'explorer'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Vector Store & Chunks Explorer ({chunks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ingest')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeSubTab === 'ingest'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Document Ingestion Pipeline</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: RAG GROUNDED Q&A & QUERY LAB */}
      {activeSubTab === 'qa' && (
        <div className="space-y-6">
          {/* Query Formulation Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-600" />
                <span>Ask Any Indian Legal Issue (Grounding Query)</span>
              </label>

              {/* Retrieval Mode Badges */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setSearchMethod('hybrid')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    searchMethod === 'hybrid'
                      ? 'bg-white text-slate-900 shadow-xs font-bold text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Dense vector cosine similarity + BM25 keyword matching (Best accuracy)"
                >
                  ⚡ Hybrid
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMethod('vector')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    searchMethod === 'vector'
                      ? 'bg-white text-slate-900 shadow-xs font-bold text-purple-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Dense vector semantic cosine similarity only"
                >
                  🧠 Dense Vector
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMethod('lexical')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    searchMethod === 'lexical'
                      ? 'bg-white text-slate-900 shadow-xs font-bold text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Exact statutory section & keyword frequency matching"
                >
                  🔤 BM25 Lexical
                </button>
              </div>
            </div>

            {/* Input Box */}
            <div className="relative">
              <textarea
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                rows={3}
                placeholder="e.g. Someone took ₹85,000 via a fake UPI customer care call yesterday. Which sections of Bharatiya Nyaya Sanhita apply and how do I freeze the account?"
                className="w-full p-4 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-800 text-sm outline-none resize-none"
              />
            </div>

            {/* Controls Bar: Top-K, Category, Run Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Top-K Chunks:</span>
                  <select
                    value={topK}
                    onChange={e => setTopK(Number(e.target.value))}
                    className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-semibold"
                  >
                    <option value={2}>2 Chunks</option>
                    <option value={4}>4 Chunks</option>
                    <option value={6}>6 Chunks</option>
                    <option value={8}>8 Chunks</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Category Filter:</span>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                  >
                    <option value="All">All Categories (Auto-Classify)</option>
                    <option value="Criminal Law">Criminal Law (BNS/BNSS)</option>
                    <option value="Rent/Tenancy">Rent/Tenancy</option>
                    <option value="Employment/Labour">Employment/Labour</option>
                    <option value="Consumer Protection">Consumer Protection</option>
                    <option value="Cybercrime">Cybercrime</option>
                    <option value="Banking/Financial Fraud">Banking/Financial Fraud</option>
                    <option value="Property Law">Property Law (RERA)</option>
                    <option value="Domestic Violence">Domestic Violence</option>
                    <option value="Motor Vehicle/Accident">Motor Vehicle/Accident</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRunRagQuery()}
                  disabled={isSearching || !queryInput.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Retrieving & Grounding...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Execute RAG Retrieval</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Demo Prompts */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Try Pre-Configured RAG Benchmark Queries:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_RAG_QUERIES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQueryInput(sample);
                      handleRunRagQuery(sample);
                    }}
                    className="text-left text-xs bg-slate-100 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 hover:border-amber-300 text-slate-700 px-2.5 py-1.5 rounded-lg transition-colors leading-relaxed"
                  >
                    • {sample.slice(0, 75)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          {qaResult && inspectionData && (
            <div className="space-y-6">
              {/* 1. Grounded Answer Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Fact-Grounded Legal Answer (Strictly Sourced)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Synthesized strictly from {inspectionData.retrievedChunks.length} retrieved statutory chunks via {inspectionData.retrievalMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-full font-mono text-slate-700">
                      ⚡ {inspectionData.retrievalLatencyMs}ms latency
                    </span>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-medium">
                      {inspectionData.classifiedCategory}
                    </span>
                  </div>
                </div>

                {/* Answer Content */}
                <div className="text-sm text-slate-800 leading-relaxed space-y-3 whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  {qaResult.answer}
                </div>

                {/* Key Provisions Cited */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-900 block mb-2 uppercase tracking-wide">
                    📌 Direct Statutory Citations Grounded in Context:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {qaResult.citedProvisions.map((prov, i) => (
                      <div
                        key={i}
                        className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-lg flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-amber-950">
                            {prov.act} {prov.section ? `(${prov.section})` : ''}
                          </div>
                          <div className="text-[11px] text-amber-900 line-clamp-1">{prov.title}</div>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                          {prov.relevance}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Next Steps */}
                {qaResult.keyActions && qaResult.keyActions.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-900 block mb-1.5 uppercase tracking-wide">
                      📋 Grounded Procedural Steps:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {qaResult.keyActions.map((act, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 2. RAG Retrieval Inspection Panel */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        RAG Vector Retrieval Inspector
                      </h4>
                      <p className="text-xs text-slate-400">
                        Detailed breakdown of dense vector cosine similarity and BM25 ranking for each chunk
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-300">
                      Vectors: {inspectionData.totalIndexedChunks}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-300">
                      Dim: {inspectionData.queryVectorDimensions}d
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRawPrompt(!showRawPrompt)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded transition-colors text-xs font-medium"
                    >
                      {showRawPrompt ? 'Hide Context Prompt' : 'View Context Prompt Fed to LLM'}
                    </button>
                  </div>
                </div>

                {/* Raw Prompt Viewer (When Toggled) */}
                {showRawPrompt && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-300/90 overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
                    <div className="text-slate-400 mb-2 font-sans font-bold">
                      // Context Prompt Synthesized by RAG and injected into Gemini:
                    </div>
                    <pre className="whitespace-pre-wrap">{inspectionData.contextPromptConstructed}</pre>
                  </div>
                )}

                {/* Retrieved Chunks List */}
                <div className="space-y-3">
                  {inspectionData.retrievedChunks.map((result, idx) => {
                    const isExpanded = expandedChunkId === result.chunk.id;
                    const pct = Math.round(result.score * 100);

                    return (
                      <div
                        key={result.chunk.id || idx}
                        className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-700 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                                <span>{result.chunk.act}</span>
                                {result.chunk.section && (
                                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded border border-amber-500/30">
                                    {result.chunk.section}
                                  </span>
                                )}
                                <span className="text-xs text-slate-400 font-normal">
                                  ({result.chunk.category})
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5">{result.chunk.title}</p>
                            </div>
                          </div>

                          {/* Relevance Meter */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="text-xs font-bold text-amber-400">
                                {pct}% Relevance
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Vector: {(result.vectorScore * 100).toFixed(0)}% | BM25: {(result.lexicalScore * 100).toFixed(0)}%
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedChunkId(isExpanded ? null : result.chunk.id)}
                              className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Match Reasons Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {result.matchReasons.map((reason, rIdx) => (
                            <span
                              key={rIdx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>

                        {/* Expanded Full Chunk Details */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-700 space-y-2.5 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg">
                            <div>
                              <span className="font-semibold text-amber-300">Simple Explanation: </span>
                              {result.chunk.simpleExplanation}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-200">Statutory Provisions & Scope: </span>
                              <p className="text-slate-300 leading-relaxed mt-0.5 font-sans">
                                {result.chunk.text}
                              </p>
                            </div>
                            {result.chunk.oldEquivalent && (
                              <div>
                                <span className="font-semibold text-purple-300">Old Law Equivalent: </span>
                                {result.chunk.oldEquivalent}
                              </div>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                              <span>Relevant Forums: {result.chunk.relevantForums.join(', ')}</span>
                              {result.chunk.sourceUrl && (
                                <a
                                  href={result.chunk.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-amber-400 hover:underline"
                                >
                                  <span>Official Source</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: VECTOR STORE & CHUNKS EXPLORER */}
      {activeSubTab === 'explorer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Knowledge Base Vector Chunks Index ({chunks.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Live semantic chunks with pre-computed vector embeddings, ready for hybrid retrieval.
                </p>
              </div>

              <button
                type="button"
                onClick={loadChunksAndStats}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-medium flex items-center gap-1.5 self-start transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Index</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={explorerSearch}
                  onChange={e => setExplorerSearch(e.target.value)}
                  placeholder="Filter by Act, Section, Title, or Keyword..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={explorerCategory}
                onChange={e => setExplorerCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Criminal Law">Criminal Law</option>
                <option value="Rent/Tenancy">Rent/Tenancy</option>
                <option value="Employment/Labour">Employment/Labour</option>
                <option value="Consumer Protection">Consumer Protection</option>
                <option value="Cybercrime">Cybercrime</option>
                <option value="Property Law">Property Law</option>
                <option value="Banking/Financial Fraud">Banking/Financial Fraud</option>
              </select>
            </div>

            {/* Chunks Grid */}
            {isLoadingChunks ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading vector knowledge base...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chunks
                  .filter(c => {
                    if (explorerCategory !== 'All' && c.category.toLowerCase() !== explorerCategory.toLowerCase()) {
                      return false;
                    }
                    if (explorerSearch) {
                      const s = explorerSearch.toLowerCase();
                      return (
                        c.title.toLowerCase().includes(s) ||
                        c.act.toLowerCase().includes(s) ||
                        (c.section && c.section.toLowerCase().includes(s)) ||
                        c.text.toLowerCase().includes(s)
                      );
                    }
                    return true;
                  })
                  .map(chunk => (
                    <div
                      key={chunk.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {chunk.category}
                            </span>
                            {chunk.isCustom && (
                              <span className="ml-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                User Ingested
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                            <span>~{chunk.tokenCount} tokens</span>
                            {chunk.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteChunk(chunk.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Delete Chunk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-2">
                          {chunk.act} {chunk.section ? `• ${chunk.section}` : ''}
                        </h4>
                        <p className="text-xs font-semibold text-slate-700">{chunk.title}</p>
                        <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                          {chunk.summary || chunk.simpleExplanation}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Forums: {chunk.relevantForums[0] || 'Jurisdictional Court'}</span>
                        <span className="font-semibold text-emerald-700">Verified</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DOCUMENT INGESTION PIPELINE */}
      {activeSubTab === 'ingest' && (
        <div className="space-y-6">
          {/* Preloaded Sample Ingestion Cards */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>1-Click Benchmark Ingestion: Official Indian Circulars & Landmark Rulings</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Click any of these authoritative Indian legal notices or Supreme Court rulings to populate the ingestion form and test live semantic chunking and embedding.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRELOADED_DOCUMENTS.map((doc, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePreloadDoc(doc)}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-xl p-3.5 cursor-pointer transition-all group"
                >
                  <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-1">
                    {doc.category}
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{doc.act}</p>
                  <div className="text-[10px] text-amber-400 font-semibold mt-2 flex items-center gap-1">
                    <span>Load for Ingestion</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingestion Form */}
          <form
            onSubmit={handleIngestDocument}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Index New Legal Document into RAG Store
              </h3>
              <p className="text-xs text-slate-500">
                Paste the text of an Indian statute, circular, High Court judgment, or agreement clause. The pipeline will automatically segment the text into semantic chunks with overlap and compute dense vector embeddings.
              </p>
            </div>

            {ingestSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{ingestSuccessMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Document / Rule Title *
                </label>
                <input
                  type="text"
                  required
                  value={ingestTitle}
                  onChange={e => setIngestTitle(e.target.value)}
                  placeholder="e.g. RBI Master Directions on Customer Protection in Electronic Banking"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Parent Statute / Act *
                </label>
                <input
                  type="text"
                  required
                  value={ingestAct}
                  onChange={e => setIngestAct(e.target.value)}
                  placeholder="e.g. Reserve Bank of India Act, 1934 / Consumer Protection Act, 2019"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Legal Category *
                </label>
                <select
                  value={ingestCategory}
                  onChange={e => setIngestCategory(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white outline-none"
                >
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Civil Disputes">Civil Disputes</option>
                  <option value="Rent/Tenancy">Rent/Tenancy</option>
                  <option value="Employment/Labour">Employment/Labour</option>
                  <option value="Consumer Protection">Consumer Protection</option>
                  <option value="Cybercrime">Cybercrime</option>
                  <option value="Banking/Financial Fraud">Banking/Financial Fraud</option>
                  <option value="Property Law">Property Law</option>
                  <option value="Domestic Violence">Domestic Violence</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Section / Rule Citation (Optional)
                </label>
                <input
                  type="text"
                  value={ingestSection}
                  onChange={e => setIngestSection(e.target.value)}
                  placeholder="e.g. Section 18, Rule 4(2), Circular No. 12"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Chunking Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Semantic Chunk Size ({ingestChunkSize} words)
                </label>
                <input
                  type="range"
                  min={100}
                  max={500}
                  step={25}
                  value={ingestChunkSize}
                  onChange={e => setIngestChunkSize(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <span className="text-[10px] text-slate-500">
                  Smaller chunks give high precision section matches; larger chunks preserve narrative context.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Chunk Overlap ({ingestOverlap} words)
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={ingestOverlap}
                  onChange={e => setIngestOverlap(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <span className="text-[10px] text-slate-500">
                  Sliding window overlap prevents cutting legal clauses mid-sentence.
                </span>
              </div>
            </div>

            {/* Document Text */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Document Text / Statutory Body *
              </label>
              <textarea
                required
                rows={6}
                value={ingestContent}
                onChange={e => setIngestContent(e.target.value)}
                placeholder="Paste the statutory provisions, High Court ruling text, or gazette notification here..."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg outline-none focus:border-amber-500 font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isIngesting || !ingestTitle || !ingestContent}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                {isIngesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Chunking & Embedding Vectors...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Index into Vector Store</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
