import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import DisclaimerBanner from './components/DisclaimerBanner';
import HomeHero from './components/HomeHero';
import ChatInterface from './components/ChatInterface';
import CaseWizard from './components/CaseWizard';
import CaseDossier from './components/CaseDossier';
import CaseReportView from './components/CaseReportView';
import DocumentAnalyzerView from './components/DocumentAnalyzerView';
import LawSearch from './components/LawSearch';
import ForumFinder from './components/ForumFinder';
import LegalAidChecker from './components/LegalAidChecker';
import LegalDictionaryView from './components/LegalDictionaryView';
import AdminPanel from './components/AdminPanel';
import RagHub from './components/RagHub';
import DemoScenariosModal from './components/DemoScenariosModal';
import { CaseRecord, CasePreparationReport } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('English');
  const [explainLikeNew, setExplainLikeNew] = useState<boolean>(false);
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<CasePreparationReport | null>(null);

  // When user wants to generate report directly from chat
  const handlePrepareReportFromChat = (initialData: Partial<CaseRecord>) => {
    setActiveTab('dossier');
  };

  // When user clicks a demo scenario in chat
  const handleSelectDemoPrompt = (prompt: string) => {
    setActiveTab('chat');
  };

  // When a demo case is imported
  const handleCaseImported = (caseRecord: CaseRecord) => {
    setActiveTab('dossier');
  };

  // View specific report
  const handleViewReport = (report: CasePreparationReport) => {
    setActiveReport(report);
    setActiveTab('report_view');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900 selection:bg-amber-200 selection:text-slate-900">
      {/* Legal Awareness & Emergency Banner */}
      <DisclaimerBanner preferredLanguage={preferredLanguage} />

      {/* Navigation Header */}
      <Header
        activeTab={activeTab === 'report_view' ? 'dossier' : activeTab}
        setActiveTab={tab => {
          setActiveReport(null);
          setActiveTab(tab);
        }}
        preferredLanguage={preferredLanguage}
        setPreferredLanguage={setPreferredLanguage}
        explainLikeNew={explainLikeNew}
        setExplainLikeNew={setExplainLikeNew}
        onOpenDemoScenarios={() => setDemoModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeHero
            onNavigate={tab => setActiveTab(tab)}
            onOpenDemoScenarios={() => setDemoModalOpen(true)}
          />
        )}

        {activeTab === 'chat' && (
          <ChatInterface
            preferredLanguage={preferredLanguage}
            explainLikeNew={explainLikeNew}
            onPrepareReportFromChat={handlePrepareReportFromChat}
            onNavigateToTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'wizard' && (
          <CaseWizard
            onCaseCreated={() => setActiveTab('dossier')}
            onJumpToChat={prompt => {
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'dossier' && (
          <CaseDossier
            onViewReport={handleViewReport}
            onStartNewCase={() => setActiveTab('wizard')}
            onOpenChatWithCase={prompt => {
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'report_view' && activeReport && (
          <CaseReportView
            report={activeReport}
            onBack={() => setActiveTab('dossier')}
          />
        )}

        {activeTab === 'rag' && (
          <RagHub
            preferredLanguage={preferredLanguage}
            onNavigateToChat={prompt => {
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'analyzer' && <DocumentAnalyzerView />}

        {activeTab === 'search' && <LawSearch />}

        {activeTab === 'forums' && <ForumFinder />}

        {activeTab === 'legalaid' && <LegalAidChecker />}

        {activeTab === 'dictionary' && <LegalDictionaryView />}

        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Footer */}
      <Footer onNavigate={tab => setActiveTab(tab)} />

      {/* 10 College Demo Scenarios Modal */}
      <DemoScenariosModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSelectPrompt={handleSelectDemoPrompt}
        onCaseImported={handleCaseImported}
      />
    </div>
  );
}
