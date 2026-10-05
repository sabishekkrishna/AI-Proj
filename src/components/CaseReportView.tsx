import React, { useState } from 'react';
import { Printer, Download, Copy, Check, ArrowLeft, Scale, ShieldAlert, CheckCircle2, AlertTriangle, FileSpreadsheet, FileDown } from 'lucide-react';
import { CasePreparationReport } from '../types';
import jsPDF from 'jspdf';

interface CaseReportViewProps {
  report: CasePreparationReport;
  onBack: () => void;
}

export default function CaseReportView({ report, onBack }: CaseReportViewProps) {
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadPdf = () => {
    try {
      setGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 55, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('NyayaSahayak - Case Preparation Report', margin, 32);
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11); // amber-400
      doc.text('OFFICIAL PRE-LITIGATION CLIENT DOSSIER & FACT SHEET', margin, 46);

      y = 75;

      // Title & Metadata
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      const titleLines = doc.splitTextToSize(report.caseSummary.title, contentWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 15 + 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Category: ${report.caseSummary.category}  |  Jurisdiction: ${report.caseSummary.location}  |  Date: ${report.caseSummary.incidentDate}`, margin, y);
      y += 18;

      // Helper to print section titles
      const printSectionHeader = (title: string) => {
        checkPageBreak(30);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F');
        doc.setTextColor(180, 83, 9); // amber-700
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text(title, margin + 8, y + 12);
        y += 24;
      };

      // Helper to print paragraphs
      const printParagraph = (text: string, bold: boolean = false, indent: number = 0) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(text, contentWidth - indent);
        checkPageBreak(lines.length * 12 + 4);
        doc.text(lines, margin + indent, y);
        y += lines.length * 12 + 4;
      };

      // 1. Facts
      printSectionHeader('1. FACTS OF THE CASE (CHRONOLOGICAL)');
      report.factsOfTheCase.forEach((f, i) => {
        printParagraph(`${i + 1}. ${f}`, false, 8);
      });
      y += 5;

      // 2. Parties
      printSectionHeader('2. PARTIES INVOLVED');
      report.partiesInvolved.forEach(p => {
        printParagraph(`• ${p.name} (${p.role}): ${p.details}`, false, 8);
      });
      y += 5;

      // 3. Timeline
      printSectionHeader('3. IMPORTANT DATES TIMELINE');
      report.importantDates.forEach(d => {
        printParagraph(`[${d.date}]  ${d.event}`, false, 8);
      });
      y += 5;

      // 4. Legal Issues
      printSectionHeader('4. LEGAL ISSUES IDENTIFIED');
      report.legalIssues.forEach((issue, i) => {
        printParagraph(`${i + 1}. ${issue}`, false, 8);
      });
      y += 5;

      // 5. Relevant Laws
      printSectionHeader('5. POSSIBLY RELEVANT LAWS & PROVISIONS');
      report.possiblyRelevantLaws.forEach(law => {
        printParagraph(`${law.name} ${law.provision ? `(${law.provision})` : ''} - [${law.verificationStatus}]`, true, 8);
        printParagraph(`Meaning: ${law.simpleExplanation}`, false, 16);
        printParagraph(`Relevance: ${law.whyRelevant}`, false, 16);
        y += 3;
      });
      y += 5;

      // 6. Evidence Checklist
      printSectionHeader('6. EVIDENCE CHECKLIST');
      printParagraph('Physical Documents:', true, 8);
      report.evidenceChecklist.documents.forEach(d => printParagraph(`[ ] ${d}`, false, 16));
      printParagraph('Digital Evidence:', true, 8);
      report.evidenceChecklist.digital.forEach(d => printParagraph(`[ ] ${d}`, false, 16));
      printParagraph('Financial Records:', true, 8);
      report.evidenceChecklist.financial.forEach(d => printParagraph(`[ ] ${d}`, false, 16));
      printParagraph('Witnesses:', true, 8);
      report.evidenceChecklist.witnesses.forEach(d => printParagraph(`[ ] ${d}`, false, 16));
      y += 5;

      // 7. Missing Info
      printSectionHeader('7. MISSING INFORMATION TO GATHER');
      report.missingInformation.forEach((m, i) => printParagraph(`${i + 1}. ${m}`, false, 8));
      y += 5;

      // 8. Legal Routes
      printSectionHeader('8. POSSIBLE LEGAL ROUTES');
      report.possibleLegalRoutes.forEach(r => {
        printParagraph(r.route, true, 8);
        printParagraph(r.explanation, false, 16);
      });
      y += 5;

      // 9. Action Plan
      printSectionHeader('9. STEP-BY-STEP ACTION PLAN');
      report.actionPlan.forEach((a, i) => printParagraph(`${i + 1}. ${a}`, false, 8));
      y += 5;

      // 10. Questions for Lawyer
      printSectionHeader('10. QUESTIONS TO ASK A QUALIFIED ADVOCATE');
      report.questionsToAskALawyer.forEach((q, i) => printParagraph(`${i + 1}. ${q}`, false, 8));
      y += 8;

      // Disclaimer
      checkPageBreak(45);
      doc.setFillColor(254, 243, 199); // amber-100
      doc.rect(margin, y, contentWidth, 38, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const disLines = doc.splitTextToSize(`LEGAL DISCLAIMER: ${report.disclaimer}`, contentWidth - 16);
      doc.text(disLines, margin + 8, y + 13);

      const safeName = (report.caseSummary.title || 'Case').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
      doc.save(`NyayaSahayak_Case_Report_${safeName}.pdf`);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Downloading Markdown version instead.');
      handleDownloadMarkdown();
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      handleDownloadPdf();
    }
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownText();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NyayaSahayak_Case_Report_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateMarkdownText = () => {
    return `
# NYAYASAHAYAK - CASE PREPARATION REPORT
Generated on: ${new Date().toLocaleDateString('en-GB')}
Status: ${report.caseSummary.currentStatus}

## 1. CASE SUMMARY
- Case Title: ${report.caseSummary.title}
- User Role: ${report.caseSummary.userRole}
- Opposing Party: ${report.caseSummary.opposingParty}
- Category: ${report.caseSummary.category}
- Jurisdiction / Location: ${report.caseSummary.location}
- Date of Incident: ${report.caseSummary.incidentDate}

## 2. FACTS OF THE CASE
${report.factsOfTheCase.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 3. PARTIES INVOLVED
${report.partiesInvolved.map(p => `- **${p.name}** (${p.role}): ${p.details}`).join('\n')}

## 4. IMPORTANT DATES & TIMELINE
${report.importantDates.map(d => `- **${d.date}**: ${d.event}`).join('\n')}

## 5. LEGAL ISSUES
${report.legalIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

## 6. POSSIBLY RELEVANT LAWS
${report.possiblyRelevantLaws.map(law => `### ${law.name} ${law.provision ? `(${law.provision})` : ''} [${law.verificationStatus}]\n- Explanation: ${law.simpleExplanation}\n- Why Relevant: ${law.whyRelevant}`).join('\n\n')}

## 7. EVIDENCE CHECKLIST
### Documents
${report.evidenceChecklist.documents.map(e => `- [ ] ${e}`).join('\n')}

### Digital Evidence
${report.evidenceChecklist.digital.map(e => `- [ ] ${e}`).join('\n')}

### Financial Evidence
${report.evidenceChecklist.financial.map(e => `- [ ] ${e}`).join('\n')}

### Witnesses
${report.evidenceChecklist.witnesses.map(e => `- [ ] ${e}`).join('\n')}

## 8. MISSING INFORMATION TO COLLECT
${report.missingInformation.map((m, i) => `${i + 1}. ${m}`).join('\n')}

## 9. POSSIBLE LEGAL ROUTES
${report.possibleLegalRoutes.map(r => `### ${r.route}\n${r.explanation}`).join('\n\n')}

## 10. POSSIBLE FORUMS & JURISDICTION
- Recommended Forums: ${report.possibleForum.recommendedForums.join(', ')}
- Caveat: ${report.possibleForum.jurisdictionCaveat}

## 11. STEP-BY-STEP ACTION PLAN
${report.actionPlan.map((a, i) => `${i + 1}. ${a}`).join('\n')}

## 12. QUESTIONS TO ASK A QUALIFIED ADVOCATE
${report.questionsToAskALawyer.map((q, i) => `${i + 1}. ${q}`).join('\n')}

---
### LEGAL DISCLAIMER
${report.disclaimer}
`;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownText();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NyayaSahayak_Case_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto my-6 px-4">
      {/* Top Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Dossier</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{generatingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 px-3 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <article className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-12 shadow-md space-y-8 text-slate-900 font-sans print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-950 font-serif font-bold text-2xl">
              <Scale className="w-6 h-6 text-amber-600" />
              <span>NyayaSahayak Case Preparation Report</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Official Pre-Litigation Client Dossier & Fact Sheet
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Date Generated: <strong>{new Date().toLocaleDateString('en-GB')}</strong></div>
            <div className="text-[11px] text-amber-700 font-medium">Status: {report.caseSummary.currentStatus}</div>
          </div>
        </div>

        {/* 1. Case Summary Card */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            1. Case Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Case Title</span>
              <span className="font-bold text-slate-900">{report.caseSummary.title}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">User Role</span>
              <span className="font-semibold text-slate-800">{report.caseSummary.userRole}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Opposing Party</span>
              <span className="font-semibold text-slate-800">{report.caseSummary.opposingParty}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Legal Category</span>
              <span className="font-semibold text-slate-800">{report.caseSummary.category}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Location / Jurisdiction</span>
              <span className="font-semibold text-slate-800">{report.caseSummary.location}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date of Incident</span>
              <span className="font-semibold text-slate-800">{report.caseSummary.incidentDate}</span>
            </div>
          </div>
        </section>

        {/* 2. Facts of the Case */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            2. Facts of the Case (Chronological)
          </h2>
          <ol className="space-y-2 text-xs sm:text-sm text-slate-800 list-decimal list-inside bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
            {report.factsOfTheCase.map((fact, idx) => (
              <li key={idx} className="leading-relaxed pl-1">{fact}</li>
            ))}
          </ol>
        </section>

        {/* 3. Parties Involved Table */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            3. Parties Involved
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Party Name</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {report.partiesInvolved.map((p, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-slate-700">{p.role}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Important Dates Timeline */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            4. Important Dates Timeline
          </h2>
          <div className="space-y-2 text-xs">
            {report.importantDates.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded shrink-0">
                  {item.date}
                </span>
                <span className="text-slate-700">{item.event}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Legal Issues */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            5. Legal Issues Identified
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-800">
            {report.legalIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">{idx + 1}.</span>
                <span className="leading-relaxed">{issue}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 6. Possibly Relevant Laws */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            6. Possibly Relevant Laws & Statutory Provisions
          </h2>
          <div className="space-y-3">
            {report.possiblyRelevantLaws.map((law, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">
                    {law.name} {law.provision && `(${law.provision})`}
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {law.verificationStatus}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>General Meaning:</strong> {law.simpleExplanation}
                </p>
                <p className="text-slate-600">
                  <strong>Why Relevant to Facts:</strong> {law.whyRelevant}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Evidence Checklist */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            7. Evidence Checklist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">📄 Physical Documents</h4>
              <ul className="space-y-1 text-slate-700">
                {report.evidenceChecklist.documents.map((d, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded text-amber-600" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">💬 Digital Evidence</h4>
              <ul className="space-y-1 text-slate-700">
                {report.evidenceChecklist.digital.map((d, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded text-amber-600" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">💳 Financial Evidence</h4>
              <ul className="space-y-1 text-slate-700">
                {report.evidenceChecklist.financial.map((d, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded text-amber-600" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">👥 Witnesses</h4>
              <ul className="space-y-1 text-slate-700">
                {report.evidenceChecklist.witnesses.map((d, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded text-amber-600" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Missing Information */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            8. Missing Information to Gather Before Filing
          </h2>
          <ul className="space-y-1 text-xs text-amber-950 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            {report.missingInformation.map((m, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 9. Possible Legal Routes */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            9. Possible Legal Routes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {report.possibleLegalRoutes.map((route, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 mb-1">{route.route}</div>
                <p className="text-slate-600 leading-relaxed">{route.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Possible Forum */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            10. Recommended Forum & Jurisdiction
          </h2>
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-2">
            <div className="font-semibold text-purple-950">
              Potential Authorities/Forums: {report.possibleForum.recommendedForums.join(' • ')}
            </div>
            <p className="text-purple-900 leading-relaxed">
              <strong>Jurisdictional Caveat:</strong> {report.possibleForum.jurisdictionCaveat}
            </p>
          </div>
        </section>

        {/* 11. Step-by-Step Action Plan */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            11. Recommended Step-by-Step Action Plan
          </h2>
          <ol className="space-y-1.5 text-xs text-slate-800 list-decimal list-inside bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/80">
            {report.actionPlan.map((action, idx) => (
              <li key={idx} className="leading-relaxed pl-1">{action}</li>
            ))}
          </ol>
        </section>

        {/* 12. Questions to Ask a Lawyer */}
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-800 border-b border-amber-200 pb-1">
            12. Questions to Ask a Qualified Advocate
          </h2>
          <ul className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            {report.questionsToAskALawyer.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-800">
                <span className="font-bold text-amber-700">{idx + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Legal Disclaimer Footer */}
        <div className="border-t-2 border-slate-200 pt-6 text-[11px] text-slate-500 leading-relaxed space-y-1 bg-slate-50 p-4 rounded-xl">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Formal Legal Disclaimer</span>
          </div>
          <p>{report.disclaimer}</p>
        </div>
      </article>
    </div>
  );
}
