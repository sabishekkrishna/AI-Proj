import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Database, CheckCircle2, AlertTriangle, Plus, RefreshCw, Key, Clock, ShieldAlert } from 'lucide-react';
import { fetchSystemHealthApi, addCustomLegalSourceApi } from '../services/apiService';
import { LegalSourceItem } from '../types';

export default function AdminPanel() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Source Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAct, setNewAct] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Civil Disputes');
  const [newExplanation, setNewExplanation] = useState('');
  const [newForum, setNewForum] = useState('Jurisdictional Civil Court');
  const [newUrl, setNewUrl] = useState('https://indiacode.nic.in');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const data = await fetchSystemHealthApi();
      setHealthData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAct || !newTitle || !newExplanation) return;
    setSubmitting(true);
    try {
      await addCustomLegalSourceApi({
        act: newAct,
        section: newSection,
        title: newTitle,
        category: newCategory,
        simpleExplanation: newExplanation,
        fullProvisionsSummary: newExplanation,
        relevantForums: [newForum],
        sourceUrl: newUrl,
        currentStatus: 'Current Law',
        confidence: 'Verified'
      });
      alert('Statutory source added successfully to Indian Legal Database!');
      setShowAddForm(false);
      setNewAct('');
      setNewSection('');
      setNewTitle('');
      setNewExplanation('');
      loadHealth();
    } catch (err: any) {
      alert(`Failed to add: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-serif font-bold text-xl">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>NyayaSahayak Admin & System Diagnostics</span>
          </div>
          <p className="text-xs text-slate-300">
            Monitor Indian legal knowledge base integrity, AI engine status, and query audit trails.
          </p>
        </div>

        <button
          onClick={loadHealth}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>AI Studio Engine</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-slate-900">
            {healthData?.aiEngine || 'Loading...'}
          </div>
          <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Operational</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>RAG Legal Database</span>
            <Database className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {healthData?.totalLegalSources ?? '--'} Provisions
          </div>
          <div className="text-[11px] text-slate-500">
            BNS, BNSS, BSA, CPA 2019, IT Act
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Case Records</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {healthData?.activeCases ?? '--'} Cases
          </div>
          <div className="text-[11px] text-slate-500">
            Protected & Sandboxed
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>System Uptime</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-slate-900">
            100% Online
          </div>
          <div className="text-[11px] text-slate-500">
            Last check: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Add New Source Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Indian Legal Knowledge Base Management
            </h3>
            <p className="text-xs text-slate-500">
              Admin facility to ingest new statutory acts, Supreme Court precedents, or amendments.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{showAddForm ? 'Cancel' : 'Add Legal Provision'}</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddSource} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1">Act / Legislation Name</label>
                <input
                  type="text"
                  required
                  value={newAct}
                  onChange={e => setNewAct(e.target.value)}
                  placeholder="e.g. Real Estate (Regulation) Act, 2016"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Section / Provision</label>
                <input
                  type="text"
                  value={newSection}
                  onChange={e => setNewSection(e.target.value)}
                  placeholder="e.g. Section 18"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                >
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Civil Disputes">Civil Disputes</option>
                  <option value="Property Law">Property Law</option>
                  <option value="Consumer Protection">Consumer Protection</option>
                  <option value="Employment/Labour">Employment/Labour</option>
                  <option value="Cybercrime">Cybercrime</option>
                  <option value="Banking/Financial Fraud">Banking/Financial Fraud</option>
                  <option value="Rent/Tenancy">Rent/Tenancy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Title / Provision Summary</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Return of Amount and Compensation for Delay in Possession"
                className="w-full bg-white border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Plain-Language Simple Explanation</label>
              <textarea
                rows={3}
                required
                value={newExplanation}
                onChange={e => setNewExplanation(e.target.value)}
                placeholder="Explain what this law means in plain words for an ordinary citizen..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Jurisdictional Forum</label>
                <input
                  type="text"
                  value={newForum}
                  onChange={e => setNewForum(e.target.value)}
                  placeholder="e.g. State Real Estate Regulatory Authority (RERA)"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Official India Code Source URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://indiacode.nic.in"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Provision to Database'}
            </button>
          </form>
        )}
      </div>

      {/* Audit Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            System & RAG Execution Audit Logs
          </h3>
          <span className="text-[11px] text-slate-500">Live Operation Stream</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-[11px]">
          {healthData?.auditLogs?.map((log: any) => (
            <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
              <span className="text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-amber-800 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded shrink-0">
                {log.action}
              </span>
              <span className="text-slate-700 leading-relaxed truncate">{log.details}</span>
            </div>
          ))}

          {(!healthData?.auditLogs || healthData.auditLogs.length === 0) && (
            <div className="text-slate-400 py-4 text-center">No audit logs recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
