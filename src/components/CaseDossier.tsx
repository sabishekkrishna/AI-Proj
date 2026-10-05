import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Calendar, FileText, CheckCircle2, AlertCircle, Trash2, Edit3, ArrowRight, ShieldCheck, Sparkles, BarChart2 } from 'lucide-react';
import { CaseRecord, CasePreparationReport } from '../types';
import { fetchCasesApi, updateCaseApi, deleteCaseApi, generateCaseReportApi } from '../services/apiService';

interface CaseDossierProps {
  onViewReport: (report: CasePreparationReport) => void;
  onStartNewCase: () => void;
  onOpenChatWithCase: (prompt: string) => void;
}

export default function CaseDossier({ onViewReport, onStartNewCase, onOpenChatWithCase }: CaseDossierProps) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  // New Event Form State
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventText, setNewEventText] = useState('');

  // New Evidence Form State
  const [newEvidenceName, setNewEvidenceName] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<'document' | 'digital' | 'financial' | 'witness'>('document');
  const [newEvidenceDesc, setNewEvidenceDesc] = useState('');
  const [newEvidenceImportance, setNewEvidenceImportance] = useState<'Crucial' | 'Supporting' | 'Secondary'>('Crucial');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await fetchCasesApi();
      setCases(data);
      if (data.length > 0 && !selectedCaseId) {
        setSelectedCaseId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Calculate Case Readiness Score
  const calculateReadinessScore = (c: CaseRecord | undefined) => {
    if (!c) return 0;
    let score = 0;
    if (c.title && c.description) score += 20;
    if (c.facts && c.facts.length > 0) score += 15;
    if (c.parties && c.parties.length > 0) score += 15;
    if (c.timeline && c.timeline.length > 0) score += 15;
    if (c.timeline && c.timeline.length >= 3) score += 5;
    if (c.evidence && c.evidence.length > 0) score += 15;
    if (c.evidence && c.evidence.length >= 3) score += 5;
    if (c.state && c.district) score += 10;
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadinessScore(selectedCase);

  const handleAddTimelineEvent = async () => {
    if (!newEventDate || !newEventText || !selectedCase) return;
    const updatedTimeline = [
      ...selectedCase.timeline,
      { id: `t-${Date.now()}`, date: newEventDate, event: newEventText }
    ];

    try {
      const updated = await updateCaseApi(selectedCase.id, { timeline: updatedTimeline });
      setCases(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      setNewEventDate('');
      setNewEventText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTimelineEvent = async (tId: string) => {
    if (!selectedCase) return;
    const updatedTimeline = selectedCase.timeline.filter(t => t.id !== tId);
    try {
      const updated = await updateCaseApi(selectedCase.id, { timeline: updatedTimeline });
      setCases(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvidenceItem = async () => {
    if (!newEvidenceName || !selectedCase) return;
    const updatedEvidence = [
      ...selectedCase.evidence,
      {
        id: `ev-${Date.now()}`,
        name: newEvidenceName,
        type: newEvidenceType,
        description: newEvidenceDesc || 'Item preserved for case preparation',
        importance: newEvidenceImportance
      }
    ];

    try {
      const updated = await updateCaseApi(selectedCase.id, { evidence: updatedEvidence });
      setCases(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      setNewEvidenceName('');
      setNewEvidenceDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvidenceItem = async (eId: string) => {
    if (!selectedCase) return;
    const updatedEvidence = selectedCase.evidence.filter(e => e.id !== eId);
    try {
      const updated = await updateCaseApi(selectedCase.id, { evidence: updatedEvidence });
      setCases(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedCase) return;
    setGeneratingReport(true);
    try {
      const report = await generateCaseReportApi(selectedCase);
      const updated = await updateCaseApi(selectedCase.id, { status: 'Report Generated', report });
      setCases(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      onViewReport(report);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDeleteCase = async (cId: string) => {
    if (!confirm('Are you sure you want to delete this case dossier?')) return;
    try {
      await deleteCaseApi(cId);
      const remaining = cases.filter(c => c.id !== cId);
      setCases(remaining);
      if (selectedCaseId === cId) {
        setSelectedCaseId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-6 px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-amber-600" />
            <span>My Case Dossiers & Readiness</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize facts, timeline, and evidence to prepare a comprehensive dossier before meeting a lawyer.
          </p>
        </div>

        <button
          onClick={onStartNewCase}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Start New Case</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Case Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500 px-1">
            Active Cases ({cases.length})
          </div>

          <div className="space-y-2">
            {cases.map(c => {
              const isSelected = selectedCase?.id === c.id;
              const score = calculateReadinessScore(c);
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {c.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.updatedAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-900 mt-2 line-clamp-1">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {c.description || 'No description provided.'}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Readiness:</span>
                      <span className="font-bold text-slate-800">{score}%</span>
                    </div>

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        c.status === 'Report Generated'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {cases.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6 text-xs text-slate-500">
                No active case dossiers yet. Click "Start New Case" to create your first case.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Case Details, Readiness Meter, Timeline & Evidence */}
        {selectedCase ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Case Overview Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-700">
                      {selectedCase.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      {selectedCase.district ? `${selectedCase.district}, ` : ''}{selectedCase.state}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedCase.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteCase(selectedCase.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Delete Case"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{generatingReport ? 'Analyzing...' : 'Generate Case Report'}</span>
                  </button>
                </div>
              </div>

              {/* Case Readiness Score Meter */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Case Preparation Readiness: <span className="text-amber-700 text-sm">{readinessScore}%</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {readinessScore >= 80 ? 'Comprehensive' : readinessScore >= 50 ? 'Moderate' : 'Initial Draft'}
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                  <strong>Educational Note:</strong> This score measures documentation completeness (facts, dates, evidence, and parties) to help you consult an advocate efficiently. It does <strong>NOT</strong> indicate the probability of winning or court outcome.
                </p>
              </div>

              {/* Facts & Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Your Role</h4>
                  <p className="text-slate-700">{selectedCase.userRole || 'Complainant'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Opposing Party</h4>
                  <p className="text-slate-700">{selectedCase.opposingParty || 'Opposing Party'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Summary of Incident:</span>
                <p className="leading-relaxed">{selectedCase.description}</p>
              </div>

              {/* Discuss in Chat Button */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenChatWithCase(`Regarding my case "${selectedCase.title}" (${selectedCase.category}): ${selectedCase.description}. What evidence and statutory provisions are most crucial under Indian law?`)}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discuss this case in AI Legal Assistant &rarr;</span>
                </button>
              </div>
            </div>

            {/* Interactive Timeline Builder */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Chronological Timeline Builder</h3>
                </div>
                <span className="text-xs text-slate-500">
                  {selectedCase.timeline.length} Events Logged
                </span>
              </div>

              {/* Events List */}
              <div className="space-y-2.5">
                {selectedCase.timeline.map((event, idx) => (
                  <div
                    key={event.id || idx}
                    className="flex items-start justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded shrink-0">
                        {event.date}
                      </span>
                      <p className="text-slate-700 leading-relaxed">{event.event}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTimelineEvent(event.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {selectedCase.timeline.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4 italic">
                    No timeline events yet. Add key dates below (e.g. agreement signed, notice sent, payment made).
                  </p>
                )}
              </div>

              {/* Add New Event Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-slate-800">Add Timeline Milestone</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={newEventText}
                    onChange={e => setNewEventText(e.target.value)}
                    placeholder="Event description (e.g. Vacation notice served)"
                    className="sm:col-span-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                  />
                  <button
                    onClick={handleAddTimelineEvent}
                    disabled={!newEventDate || !newEventText}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium rounded-lg text-xs cursor-pointer"
                  >
                    Add Event
                  </button>
                </div>
              </div>
            </div>

            {/* Evidence Organizer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Evidence & Document Organizer</h3>
                </div>
                <span className="text-xs text-slate-500">
                  {selectedCase.evidence.length} Items Preserved
                </span>
              </div>

              {/* Evidence Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCase.evidence.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs truncate max-w-[200px]">
                        {ev.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            ev.importance === 'Crucial'
                              ? 'bg-red-100 text-red-800'
                              : ev.importance === 'Supporting'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {ev.importance || 'Crucial'}
                        </span>
                        <button
                          onClick={() => handleDeleteEvidenceItem(ev.id)}
                          className="text-slate-400 hover:text-red-600 p-0.5 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                      Type: {ev.type}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{ev.description}</p>
                  </div>
                ))}
              </div>

              {selectedCase.evidence.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4 italic">
                  No evidence cataloged yet. Add documents, receipts, or chat logs below.
                </p>
              )}

              {/* Add New Evidence Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-slate-800">Add Evidence Item</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newEvidenceName}
                    onChange={e => setNewEvidenceName(e.target.value)}
                    placeholder="Evidence name (e.g. Registered Rent Agreement)"
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                  />
                  <select
                    value={newEvidenceType}
                    onChange={e => setNewEvidenceType(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                  >
                    <option value="document">📄 Physical Document</option>
                    <option value="digital">💬 Digital / Chat / Screenshot</option>
                    <option value="financial">💳 Bank / UPI Statement</option>
                    <option value="witness">👥 Witness</option>
                  </select>
                  <select
                    value={newEvidenceImportance}
                    onChange={e => setNewEvidenceImportance(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                  >
                    <option value="Crucial">Crucial (Primary Proof)</option>
                    <option value="Supporting">Supporting (Corroborating)</option>
                    <option value="Secondary">Secondary</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEvidenceDesc}
                    onChange={e => setNewEvidenceDesc(e.target.value)}
                    placeholder="Brief description or relevance of this evidence"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                  />
                  <button
                    onClick={handleAddEvidenceItem}
                    disabled={!newEvidenceName}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium rounded-lg text-xs cursor-pointer"
                  >
                    Add Evidence
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Report Shortcut (if available) */}
            {selectedCase.report && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Case Preparation Report Ready</h4>
                  <p className="text-xs text-emerald-800">
                    A formal structured case report has been compiled for this case.
                  </p>
                </div>
                <button
                  onClick={() => onViewReport(selectedCase.report!)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span>View Case Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
