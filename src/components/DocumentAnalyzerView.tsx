import React, { useState } from 'react';
import { FileText, Upload, Sparkles, AlertTriangle, ShieldCheck, HelpCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { DocumentAnalysisResult } from '../types';
import { analyzeDocumentApi } from '../services/apiService';

const SAMPLE_DOCUMENTS = [
  {
    name: 'Sample Advocate Legal Notice (Cheque Bounce)',
    text: `REGISTERED A.D. / SPEED POST
LEGAL DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

To,
Mr. Arvind Verma,
Proprietor, Verma Traders,
B-42, Sector 18, Noida, Uttar Pradesh - 201301.

Under instructions from and on behalf of my client, M/s Sunrise Hardware Solutions, I hereby serve upon you this Statutory Legal Demand Notice:

1. That my client supplied industrial hardware goods worth ₹3,50,000 against Invoice No. SH/2025/892 dated 10th October 2025.
2. That in discharge of your legally enforceable debt and liability, you issued Cheque No. 492019 dated 15th January 2026 for a sum of ₹3,50,000 drawn on State Bank of India, Noida Branch.
3. That my client presented the said cheque for clearance, but the same was dishonoured and returned unpaid by the bank vide Cheque Return Memo dated 28th January 2026 with the remark: "FUNDS INSUFFICIENT".
4. That you have intentionally cheated and defrauded my client.

THEREFORE, I hereby call upon you to make the payment of the said amount of ₹3,50,000 within a period of 15 (FIFTEEN) DAYS from the receipt of this statutory notice, failing which my client shall be constrained to initiate criminal proceedings against you under Section 138 of the Negotiable Instruments Act, 1881, as well as relevant provisions of Bharatiya Nyaya Sanhita, 2023, holding you liable for all costs and consequences.

Advocate Rajesh Malhotra (D/1482/2010)
High Court of Delhi`
  },
  {
    name: 'Sample Landlord Deposit Forfeiture Letter',
    text: `Date: 31st January 2026
To,
Mr. Siddharth Rao,
Former Tenant, Flat 402, Green Valley Apartments, Indirapuram, Ghaziabad.

Subject: Settlement of Security Deposit for Tenancy ended on 31 January 2026.

Dear Siddharth,

This is with reference to the 11-month lease agreement executed on 1 March 2025. You vacated the flat on 31 January 2026. You had deposited an amount of ₹65,000 as refundable security deposit.

Upon post-handover inspection by my facility supervisor, the following damages and expenses were calculated:
1. Complete wall repainting for the entire 2BHK flat: ₹32,000.
2. Deep chemical polishing of Italian marble: ₹15,000.
3. Replacement of wooden door handles and bathroom fittings: ₹10,000.
4. Unpaid building association maintenance surcharge: ₹8,000.

Total deductions amount to ₹65,000.
Hence, the entire security deposit stands adjusted and forfeited. No balance amount is payable to you. Treat this matter as fully and finally settled.

Yours sincerely,
R. K. Sharma (Landlord / Lessor)`
  }
];

export default function DocumentAnalyzerView() {
  const [docText, setDocText] = useState('');
  const [docName, setDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!docText.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeDocumentApi(docText, docName || 'Legal Document');
      setAnalysis(res);
    } catch (err: any) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setDocText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Title */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-serif font-bold text-xl">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Analyze My Legal Document</span>
          </div>
          <p className="text-xs text-slate-300">
            Upload or paste any Indian legal notice, agreement, lease, FIR, summons, or contract. Get plain-English explanations, red flags, and questions for your lawyer.
          </p>
        </div>

        <div className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/80 px-3 py-1.5 rounded-lg max-w-xs">
          <strong>Privacy Note:</strong> Text is analyzed securely. Avoid uploading highly confidential personal credentials or bank passwords.
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Document Text Input
          </div>

          {/* Sample Fill Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Load Sample:</span>
            {SAMPLE_DOCUMENTS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDocName(s.name);
                  setDocText(s.text);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-md text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                {s.name.split(' ')[2] || 'Sample'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <input
            type="text"
            value={docName}
            onChange={e => setDocName(e.target.value)}
            placeholder="Document Name / Title (e.g. Legal Notice from Landlord or Employment Agreement)"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 mb-3"
          />

          <textarea
            rows={8}
            value={docText}
            onChange={e => setDocText(e.target.value)}
            placeholder="Paste text of the legal notice, agreement clauses, contract, or complaint here..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* File Upload Trigger */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer border border-slate-300 transition-colors self-start sm:self-auto">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Text/Doc File</span>
            <input type="file" accept=".txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleAnalyze}
            disabled={!docText.trim() || loading}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Analyzing Legal Clauses...' : 'Analyze Document Now'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Output Results */}
      {analysis && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-900">
          {/* Document Header & Type */}
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Identified Category
              </span>
              <h3 className="text-xl font-bold font-serif text-slate-950 mt-1">
                {analysis.documentType}
              </h3>
            </div>
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              AI Document Interpretation Report
            </div>
          </div>

          {/* 1. Summary */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Executive Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/90">
              {analysis.summary}
            </p>
          </div>

          {/* 2. Critical Dates & Deadlines */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Critical Dates, Deadlines & Timelines</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {analysis.criticalDatesAndDeadlines?.map((d, idx) => (
                <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-0.5">
                  <span className="font-bold text-amber-950 block">{d.dateOrPeriod}</span>
                  <span className="text-amber-900">{d.significance}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Parties & Obligations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Parties Involved & Obligations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {analysis.partiesInvolved?.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                  <div className="text-[11px] text-amber-800 font-semibold">{p.role}</div>
                  <p className="text-slate-600 leading-relaxed">{p.obligations}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Difficult Legal Terms Translated */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>4. Difficult Legal Jargon Explained in Plain English</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {analysis.difficultLegalTerms?.map((term, idx) => (
                <div key={idx} className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-0.5">
                  <span className="font-bold text-blue-950 font-mono">{term.term}</span>
                  <p className="text-blue-900 leading-relaxed">{term.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. High-Risk Clauses / Red Flags */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>5. Potential Red Flags / High-Risk Clauses</span>
            </h4>
            <ul className="space-y-1.5 text-xs bg-red-50/60 border border-red-200 p-4 rounded-xl text-red-950">
              {analysis.highRiskClausesOrRedFlags?.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-red-600 font-bold shrink-0">•</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 6. Questions to Ask a Lawyer */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              6. Specific Questions You Should Ask a Qualified Advocate
            </h4>
            <ul className="space-y-1.5 text-xs bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800">
              {analysis.questionsToAskALawyer?.map((q, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold shrink-0">{idx + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer Footer */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 bg-slate-50 p-3.5 rounded-xl space-y-1">
            <div className="font-semibold text-slate-700">Notice on Legal Validity:</div>
            <p>{analysis.educationalDisclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
