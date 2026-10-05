import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, Scale, CheckCircle2, MessageSquare, FolderPlus } from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '../data/demoScenarios';
import { CaseRecord } from '../types';
import { createCaseApi } from '../services/apiService';

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  onCaseImported: (caseRecord: CaseRecord) => void;
}

export default function DemoScenariosModal({
  isOpen,
  onClose,
  onSelectPrompt,
  onCaseImported
}: DemoScenariosModalProps) {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [loadingImport, setLoadingImport] = useState(false);

  if (!isOpen) return null;

  const handleImportCase = async (scenario: DemoScenario) => {
    if (!scenario.simulatedCase) return;
    setLoadingImport(true);
    try {
      const c = scenario.simulatedCase;
      const created = await createCaseApi({
        title: c.title,
        category: c.category,
        description: scenario.description,
        userRole: c.userRole,
        opposingParty: c.opposingParty,
        state: c.state,
        district: c.district,
        dateOfIncident: c.dateOfIncident,
        status: 'Active',
        facts: c.facts,
        parties: [
          { name: 'Complainant', role: c.userRole, details: 'Aggrieved party' },
          { name: c.opposingParty, role: 'Opposing Party', details: 'Respondent' }
        ],
        timeline: c.timeline,
        evidence: c.evidence
      });

      onCaseImported(created);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingImport(false);
    }
  };

  const handleLaunchChat = (scenario: DemoScenario) => {
    onSelectPrompt(scenario.prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif text-white">
                  10 Demonstration Scenarios (College Project Evaluation)
                </h3>
                <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                  Pre-configured
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Click any scenario below to immediately test the AI Legal Assistant or load a pre-built Case Dossier.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-slate-900">
          {/* Left: Scenarios List */}
          <div className="md:col-span-5 space-y-2 border-r border-slate-100 pr-2 max-h-[500px] overflow-y-auto">
            {DEMO_SCENARIOS.map(scen => {
              const isSelected = selectedScenario.id === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => setSelectedScenario(scen)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/10'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      Scenario {scen.number}
                    </span>
                    <span className="text-[10px] text-slate-500">{scen.category}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                    {scen.title}
                  </h4>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Scenario Details & Launch Actions */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {selectedScenario.category}
              </span>
              <h3 className="text-lg font-bold text-slate-950 font-serif mt-1">
                Scenario #{selectedScenario.number}: {selectedScenario.title}
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {selectedScenario.description}
              </p>
            </div>

            {/* Simulated User Question */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 uppercase text-[10px]">
                Simulated Everyday Citizen Query:
              </span>
              <p className="text-slate-900 italic font-mono text-[11px] leading-relaxed">
                "{selectedScenario.prompt}"
              </p>
            </div>

            {/* Applicable Indian Law & Forum */}
            <div className="space-y-2">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg">
                <span className="font-bold text-blue-950 block">Primary Applicable Law:</span>
                <span className="text-blue-900">{selectedScenario.keyLaw}</span>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-lg">
                <span className="font-bold text-purple-950 block">Target Legal Forum:</span>
                <span className="text-purple-900">{selectedScenario.targetForum}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => handleLaunchChat(selectedScenario)}
                className="w-full sm:flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Test in AI Chatbot</span>
              </button>

              {selectedScenario.simulatedCase && (
                <button
                  onClick={() => handleImportCase(selectedScenario)}
                  disabled={loadingImport}
                  className="w-full sm:flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{loadingImport ? 'Loading...' : 'Load Case Dossier'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
