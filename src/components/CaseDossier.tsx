import React, { useState, useEffect, useRef } from 'react';
import { FolderKanban, Plus, Calendar, FileText, CheckCircle2, AlertCircle, Trash2, Edit3, ArrowRight, ShieldCheck, Sparkles, BarChart2, Upload, FileDown, Eye, X, Image as ImageIcon } from 'lucide-react';
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

  // File Upload & Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (c.evidence && c.evidence.some(e => e.fileData)) score += 5; // Extra points for real uploaded document!
    if (c.evidence && c.evidence.length >= 3) score += 5;
    if (c.state && c.district) score += 5;
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

  // Process Document Uploads
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedCase) return;
    setUploadingFiles(true);

    const newItems: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Auto detect type
      const lowerName = file.name.toLowerCase();
      let detectedType: 'document' | 'digital' | 'financial' | 'witness' = 'document';
      if (lowerName.includes('chat') || lowerName.includes('whatsapp') || lowerName.includes('screenshot') || file.type.startsWith('image/')) {
        detectedType = 'digital';
      } else if (lowerName.includes('bank') || lowerName.includes('upi') || lowerName.includes('receipt') || lowerName.includes('bill') || lowerName.includes('invoice') || lowerName.includes('statement')) {
        detectedType = 'financial';
      }

      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      newItems.push({
        id: `ev-file-${Date.now()}-${i}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: detectedType,
        description: `Preserved evidence document (${file.name}, ${formattedSize})`,
        importance: 'Crucial' as const,
        date: new Date().toISOString().split('T')[0],
        fileName: file.name,
        fileSize: formattedSize,
        mimeType: file.type,
        fileData: base64
      });
    }

    try {
      const updatedEvidence = [...selectedCase.evidence, ...newItems];
      const updated = await updateCaseApi(selectedCase.id, { evidence: updatedEvidence });
      setCases(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch (err) {
      console.error(err);
      alert('Failed to save uploaded evidence.');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleDownloadFile = (ev: any) => {
    if (!ev.fileData) return;
    const link = document.createElement('a');
    link.href = ev.fileData;
    link.download = ev.fileName || `${ev.name}.dat`;
    document.body.appendChild(link);
    link.click();
    link.remove();
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

            {/* Evidence & Document Organizer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Evidence & Document Organizer</h3>
                    <p className="text-[11px] text-slate-500">Upload or catalog physical documents, WhatsApp screenshots, UPI proofs, and witnesses.</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
                  {selectedCase.evidence.length} Preserved
                </span>
              </div>

              {/* Document Upload Dropzone */}
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/80 scale-[1.01]'
                    : 'border-slate-300 hover:border-amber-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
                  onChange={e => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center shadow-inner">
                    <Upload className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      {uploadingFiles ? 'Saving and encrypting documents...' : 'Click to Upload or Drag & Drop Evidence Files'}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Upload rent agreements, bank account statements, police complaints, FIR copies, or WhatsApp screenshots (PDF, JPG, PNG, DOC)
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full mt-1">
                    Direct File Preservation Active
                  </span>
                </div>
              </div>

              {/* Evidence Items List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Preserved Evidence Items ({selectedCase.evidence.length})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCase.evidence.map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 relative group hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {ev.fileData && ev.mimeType?.startsWith('image/') ? (
                            <img
                              src={ev.fileData}
                              alt={ev.name}
                              className="w-8 h-8 rounded object-cover border border-slate-200 cursor-pointer"
                              onClick={() => setPreviewItem(ev)}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                              {ev.type === 'document' ? 'DOC' : ev.type === 'financial' ? 'BANK' : ev.type === 'digital' ? 'CHAT' : 'WIT'}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-900 text-xs block truncate max-w-[170px]" title={ev.name}>
                              {ev.name}
                            </span>
                            {ev.fileName && (
                              <span className="text-[10px] text-slate-400 block truncate max-w-[170px]">
                                {ev.fileName} {ev.fileSize ? `(${ev.fileSize})` : ''}
                              </span>
                            )}
                          </div>
                        </div>

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
                            className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">{ev.description}</p>

                      {/* File Actions */}
                      <div className="pt-1 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 uppercase tracking-wide text-[10px]">
                          {ev.type}
                        </span>

                        <div className="flex items-center gap-2">
                          {ev.fileData && (
                            <>
                              <button
                                onClick={() => setPreviewItem(ev)}
                                className="text-amber-700 hover:text-amber-900 font-medium flex items-center gap-0.5 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleDownloadFile(ev)}
                                className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-0.5 cursor-pointer"
                              >
                                <FileDown className="w-3 h-3" />
                                <span>Download</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCase.evidence.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4 italic">
                    No evidence cataloged or uploaded yet. Use the upload area above or add manual notes below.
                  </p>
                )}
              </div>

              {/* Add New Evidence Manually (for witnesses or pending papers) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Manual Evidence Entry (Witnesses / Physical Records)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newEvidenceName}
                    onChange={e => setNewEvidenceName(e.target.value)}
                    placeholder="Evidence name (e.g. Eyewitness Statement or Rent Ledger)"
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
                    placeholder="Brief description or relevance of this item"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                  />
                  <button
                    onClick={handleAddEvidenceItem}
                    disabled={!newEvidenceName}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium rounded-lg text-xs cursor-pointer"
                  >
                    Add Entry
                  </button>
                </div>
              </div>
            </div>

            {/* Document Preview Modal */}
            {previewItem && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{previewItem.name}</h4>
                      <p className="text-[11px] text-slate-500">{previewItem.fileName || previewItem.description}</p>
                    </div>
                    <button
                      onClick={() => setPreviewItem(null)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 rounded-xl p-4 min-h-[250px]">
                    {previewItem.fileData && previewItem.mimeType?.startsWith('image/') ? (
                      <img
                        src={previewItem.fileData}
                        alt={previewItem.name}
                        className="max-h-[500px] w-auto rounded object-contain shadow"
                      />
                    ) : (
                      <div className="text-center space-y-2 p-6">
                        <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                        <div className="text-xs font-semibold text-slate-700">{previewItem.fileName || 'Preserved Document'}</div>
                        <p className="text-[11px] text-slate-500">{previewItem.fileSize || 'Attached File'}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleDownloadFile(previewItem)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileDown className="w-4 h-4 text-amber-400" />
                      <span>Download File</span>
                    </button>
                    <button
                      onClick={() => setPreviewItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

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
