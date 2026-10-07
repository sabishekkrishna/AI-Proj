import React from 'react';
import { MessageSquare, PlusCircle, Search, FileText, HeartHandshake, MapPin, Sparkles, Scale, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface HomeHeroProps {
  onNavigate: (tab: string) => void;
  onOpenDemoScenarios: () => void;
}

export default function HomeHero({ onNavigate, onOpenDemoScenarios }: HomeHeroProps) {
  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>AI Legal Assistance for Indian Citizens</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-white leading-tight">
            Understand Your Rights.<br />
            <span className="text-amber-400">Prepare Your Case.</span> Know Your Next Step.
          </h1>

          <div className="text-sm sm:text-base text-amber-200/90 font-serif">
            "अपने अधिकार समझें। अपने मामले की तैयारी करें।"
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Explain your legal problem in everyday language. NyayaSahayak translates complex Indian statutes into simple explanations, maps out essential evidence, and prepares a structured case report before you approach an advocate or court.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('chat')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Start Legal Assistance</span>
            </button>

            <button
              onClick={() => onNavigate('wizard')}
              className="px-6 py-3 bg-slate-800/90 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Prepare My Case</span>
            </button>

            <button
              onClick={onOpenDemoScenarios}
              className="px-5 py-3 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-semibold rounded-xl text-xs sm:text-sm border border-amber-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>10 College Demo Scenarios</span>
            </button>

            <button
              onClick={() => onNavigate('rag')}
              className="px-5 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold rounded-xl text-xs sm:text-sm border border-indigo-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Legal RAG Engine</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block mr-12">
          <Scale className="w-96 h-96 text-amber-400" />
        </div>
      </div>

      {/* 3 Main Action Cards (Section 42 of User Prompt) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: ASK A LEGAL QUESTION */}
        <div
          onClick={() => onNavigate('chat')}
          className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-serif">
              ASK A LEGAL QUESTION
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe your legal problem in normal, everyday language. Get an instant breakdown of relevant Indian laws, evidence you must preserve, and potential next steps.
            </p>
          </div>
          <div className="pt-6 flex items-center gap-1 text-xs font-bold text-amber-700">
            <span>Ask NyayaSahayak AI</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: PREPARE MY CASE */}
        <div
          onClick={() => onNavigate('wizard')}
          className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors font-serif">
              PREPARE MY CASE
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organize facts, evidence, dates, and legal issues through a 7-step guided questionnaire. Generate a formal Case Preparation Report ready to hand over to an advocate.
            </p>
          </div>
          <div className="pt-6 flex items-center gap-1 text-xs font-bold text-blue-700">
            <span>Start 7-Step Case Wizard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: UNDERSTAND INDIAN LAW */}
        <div
          onClick={() => onNavigate('search')}
          className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors font-serif">
              UNDERSTAND INDIAN LAW
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore Central Acts, new Criminal Sanhitas (BNS, BNSS, BSA 2023), Consumer Protection, and IT Acts. Search sections with verified explanations and legal definitions.
            </p>
          </div>
          <div className="pt-6 flex items-center gap-1 text-xs font-bold text-emerald-700">
            <span>Search Indian Law Encyclopedia</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Quick Access Utility Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <button
          onClick={() => onNavigate('analyzer')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-400 text-left transition-colors flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Analyze a Document</div>
            <div className="text-slate-500 text-[11px]">Upload notice, agreement, or FIR for red flags</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('forums')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-400 text-left transition-colors flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <MapPin className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Where Should I Go?</div>
            <div className="text-slate-500 text-[11px]">Find the right court, police station, or commission</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('legalaid')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-400 text-left transition-colors flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <HeartHandshake className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Can I Get Free Legal Help?</div>
            <div className="text-slate-500 text-[11px]">Check NALSA/DLSA Section 12 criteria & 15100</div>
          </div>
        </button>
      </div>
    </div>
  );
}
