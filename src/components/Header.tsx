import React, { useState } from 'react';
import { Scale, MessageSquare, PlusCircle, FolderKanban, Search, FileText, MapPin, HeartHandshake, BookOpen, ShieldCheck, Sparkles, Languages, Check, HelpCircle, Menu, X } from 'lucide-react';
import { getTranslation } from '../data/translations';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  preferredLanguage: string;
  setPreferredLanguage: (lang: string) => void;
  explainLikeNew: boolean;
  setExplainLikeNew: (val: boolean) => void;
  onOpenDemoScenarios: () => void;
}

export const LANGUAGES = [
  { code: 'English', label: 'English', native: 'English' },
  { code: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { code: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { code: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'Bengali', label: 'Bengali', native: 'বাংলা' },
  { code: 'Marathi', label: 'Marathi', native: 'मराठी' }
];

export default function Header({
  activeTab,
  setActiveTab,
  preferredLanguage,
  setPreferredLanguage,
  explainLikeNew,
  setExplainLikeNew,
  onOpenDemoScenarios
}: HeaderProps) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = getTranslation(preferredLanguage);

  const navItems = [
    { id: 'chat', label: t.navAssistant, icon: MessageSquare },
    { id: 'wizard', label: t.navNewCase, icon: PlusCircle },
    { id: 'dossier', label: t.navDossier, icon: FolderKanban },
    { id: 'analyzer', label: t.navAnalyze, icon: FileText },
    { id: 'search', label: t.navSearch, icon: Search },
    { id: 'forums', label: t.navForums, icon: MapPin },
    { id: 'legalaid', label: t.navLegalAid, icon: HeartHandshake },
    { id: 'dictionary', label: t.navDictionary, icon: BookOpen },
    { id: 'admin', label: t.navAdmin, icon: ShieldCheck }
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      {/* Top Bar with Branding & Tools */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('chat')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-900/30 group-hover:scale-105 transition-transform">
            <Scale className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white">
                Nyaya<span className="text-amber-400">Sahayak</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">
                {preferredLanguage !== 'English' ? LANGUAGES.find(l => l.code === preferredLanguage)?.native : 'Indian Law AI'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Explain Like I'm New Toggle */}
          <button
            onClick={() => setExplainLikeNew(!explainLikeNew)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              explainLikeNew
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Convert legal terminology into simple everyday language"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.explainLikeNew}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                explainLikeNew ? 'bg-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-500'
              }`}
            />
          </button>

          {/* College Demo Scenarios Button */}
          <button
            onClick={onOpenDemoScenarios}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-sm transition-all"
            title="Test 10 pre-loaded demonstration scenarios for the college project"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.demoScenarios}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-amber-300">
                {LANGUAGES.find(l => l.code === preferredLanguage)?.native || preferredLanguage}
              </span>
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs"
                onClick={() => setLangMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1">
                  Select Language / भाषा चुनें
                </div>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setPreferredLanguage(lang.code)}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-700/70 transition-colors ${
                      preferredLanguage === lang.code ? 'text-amber-400 font-semibold bg-slate-700/40' : 'text-slate-300'
                    }`}
                  >
                    <span>{lang.native} ({lang.label})</span>
                    {preferredLanguage === lang.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Nav Tabs Bar */}
      <nav className="hidden lg:block bg-slate-950/60 border-t border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-slate-800">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-300">
            <span>Explain Like I'm New to Law:</span>
            <button
              onClick={() => setExplainLikeNew(!explainLikeNew)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                explainLikeNew ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {explainLikeNew ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
