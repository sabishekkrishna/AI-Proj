import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Scale, Calendar, MapPin, Users, FolderCheck, Mail, Target, Sparkles } from 'lucide-react';
import { CaseRecord } from '../types';
import { createCaseApi } from '../services/apiService';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi NCR', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh'
];

const CATEGORIES = [
  'Criminal Law', 'Civil Disputes', 'Family Law', 'Property Law', 'Consumer Protection',
  'Employment/Labour', 'Cybercrime', 'Banking/Financial Fraud', 'Motor Vehicle/Accident',
  'Rent/Tenancy', 'Contract Disputes', 'Intellectual Property', 'Domestic Violence',
  'Defamation', 'Senior Citizen Issues', 'Other'
];

interface CaseWizardProps {
  onCaseCreated: (newCase: CaseRecord) => void;
  onJumpToChat: (prompt: string) => void;
}

export default function CaseWizard({ onCaseCreated, onJumpToChat }: CaseWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Civil Disputes',
    description: '',
    dateOfIncident: new Date().toISOString().split('T')[0],
    state: 'Delhi NCR',
    district: '',
    userRole: 'Complainant / Aggrieved Person',
    opposingPartyName: '',
    opposingPartyRole: 'Opposing Party',
    evidenceList: '',
    priorContact: 'None so far',
    desiredOutcome: 'Recovery of money/deposit and compensation for loss'
  });

  const [preliminaryUnderstanding, setPreliminaryUnderstanding] = useState<string | null>(null);

  const nextStep = () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      generatePreliminaryCase();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const generatePreliminaryCase = async () => {
    setLoading(true);
    try {
      const facts = [
        formData.description,
        `Date of incident or commencement: ${formData.dateOfIncident}.`,
        `Location: ${formData.district ? formData.district + ', ' : ''}${formData.state}.`,
        formData.priorContact ? `Prior actions taken: ${formData.priorContact}.` : 'No prior legal contact made.',
        `Desired relief or outcome: ${formData.desiredOutcome}.`
      ];

      const parties = [
        { name: 'You (Complainant)', role: formData.userRole, details: 'Initiating party' },
        { name: formData.opposingPartyName || 'Opposing Party', role: formData.opposingPartyRole, details: 'Counterparty to dispute' }
      ];

      const timeline = [
        { id: 't1', date: formData.dateOfIncident, event: 'Incident or transaction dispute occurred' }
      ];

      const evidence = formData.evidenceList
        .split('\n')
        .filter(e => e.trim().length > 0)
        .map((item, idx) => ({
          id: `ev-${Date.now()}-${idx}`,
          name: item.trim(),
          type: (item.toLowerCase().includes('bank') || item.toLowerCase().includes('upi') || item.toLowerCase().includes('receipt')
            ? 'financial'
            : item.toLowerCase().includes('whatsapp') || item.toLowerCase().includes('email') || item.toLowerCase().includes('chat')
            ? 'digital'
            : 'document') as 'document' | 'digital' | 'financial' | 'witness',
          description: 'Document identified during case creation',
          importance: 'Crucial' as const
        }));

      const newCaseRecord = await createCaseApi({
        title: formData.title || `${formData.category} regarding ${formData.description.slice(0, 45)}...`,
        category: formData.category,
        description: formData.description,
        userRole: formData.userRole,
        opposingParty: formData.opposingPartyName,
        state: formData.state,
        district: formData.district,
        dateOfIncident: formData.dateOfIncident,
        status: 'Active',
        facts,
        parties,
        timeline,
        evidence
      });

      const summary = `Based on your answers, your matter is classified under ${formData.category}. The dispute involves ${formData.userRole} against ${formData.opposingPartyName || 'the opposing party'} in ${formData.state}. Key evidence specified includes ${evidence.length} items.`;
      setPreliminaryUnderstanding(summary);
      onCaseCreated(newCaseRecord);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif">Start New Case Preparation</h2>
            <p className="text-xs text-slate-300">
              7-step guided questionnaire to organize facts, parties, and evidence before consulting a lawyer.
            </p>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-7 gap-1.5 mt-5">
          {[1, 2, 3, 4, 5, 6, 7].map(s => (
            <div key={s} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  s < step
                    ? 'bg-amber-400'
                    : s === step
                    ? 'bg-amber-500 shadow-sm shadow-amber-400/50'
                    : 'bg-slate-800'
                }`}
              />
              <span className="text-[10px] text-slate-400 block text-center truncate">
                Step {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {preliminaryUnderstanding ? (
          /* Step Complete: Preliminary Understanding Output */
          <div className="space-y-6 text-slate-800">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-emerald-950">Preliminary Case Assessment Created!</h3>
                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                  Your case details have been saved to your <strong>Case Dossier</strong>. You can now chat with the AI for deep legal insights or generate the complete Case Preparation Report.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Summary of Facts Recorded</h4>
              <p className="text-slate-700 leading-relaxed">{preliminaryUnderstanding}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Category</span>
                  <span className="font-semibold text-slate-800">{formData.category}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Jurisdiction</span>
                  <span className="font-semibold text-slate-800">{formData.state}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Opposing Party</span>
                  <span className="font-semibold text-slate-800">{formData.opposingPartyName || 'Opposing Party'}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Incident Date</span>
                  <span className="font-semibold text-slate-800">{formData.dateOfIncident}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => onJumpToChat(`I created a case regarding ${formData.category}: "${formData.description}". What are the first legal steps under Indian law?`)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Discuss with AI Assistant</span>
              </button>
              <button
                onClick={() => setPreliminaryUnderstanding(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
              >
                Create Another Case
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Step 1: What happened? */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <h3>Step 1: What Happened?</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Describe the dispute or incident in your own words. Include how the problem began.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Legal Category (Best Guess)
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Case Title / Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Non-return of security deposit for Flat 301"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Narrative of Facts
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details: What agreement existed? What was promised? What went wrong? What was the financial or personal impact?"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            )}

            {/* Step 2: When did it happen? */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <h3>Step 2: When Did It Happen?</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Timelines are crucial under the Indian Limitation Act to determine if your claim is within time.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Incident / Occurrence of Dispute
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfIncident}
                    onChange={e => setFormData({ ...formData, dateOfIncident: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                  <strong>Limitation Warning:</strong> Most consumer complaints have a 2-year window; cheque bounce cases have a strict 30-day notice rule; road accident MACT claims have a 6-month limit.
                </div>
              </div>
            )}

            {/* Step 3: Where did it happen? */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <h3>Step 3: Where Did It Happen?</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Territorial jurisdiction dictates which court, police station, or consumer commission handles your matter.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / Union Territory
                    </label>
                    <select
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      District / City
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. South Delhi, Bengaluru Urban, Pune"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Who is involved? */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <Users className="w-5 h-5 text-amber-600" />
                  <h3>Step 4: Who Is Involved?</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Identify your role and details of the person, landlord, employer, or company you have a dispute with.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Role in the Dispute
                  </label>
                  <input
                    type="text"
                    value={formData.userRole}
                    onChange={e => setFormData({ ...formData, userRole: e.target.value })}
                    placeholder="e.g. Tenant, Consumer, Full-time Employee, Victim of Fraud"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Opposing Party (Person / Company Name)
                    </label>
                    <input
                      type="text"
                      value={formData.opposingPartyName}
                      onChange={e => setFormData({ ...formData, opposingPartyName: e.target.value })}
                      placeholder="e.g. Landlord Ramesh Kumar or XYZ Technologies Pvt Ltd"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Opposing Party Role
                    </label>
                    <input
                      type="text"
                      value={formData.opposingPartyRole}
                      onChange={e => setFormData({ ...formData, opposingPartyRole: e.target.value })}
                      placeholder="e.g. Landlord, Employer, Manufacturer, Builder"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: What evidence do you have? */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <FolderCheck className="w-5 h-5 text-amber-600" />
                  <h3>Step 5: What Evidence Do You Have?</h3>
                </div>
                <p className="text-xs text-slate-500">
                  List any written agreements, WhatsApp chats, emails, invoices, bank receipts, or witnesses (one per line).
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Evidence Items (Enter each item on a new line)
                  </label>
                  <textarea
                    rows={5}
                    value={formData.evidenceList}
                    onChange={e => setFormData({ ...formData, evidenceList: e.target.value })}
                    placeholder="Registered Agreement copy&#10;Bank account statement showing transfer&#10;WhatsApp chat screenshots&#10;Email communication with customer service&#10;Colleague who witnessed the interaction"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Have you already contacted anyone? */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <h3>Step 6: Have You Contacted Anyone Already?</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Did you send an email, WhatsApp message, written complaint, police visit, or legal notice?
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prior Contact & Responses Received
                  </label>
                  <textarea
                    rows={4}
                    value={formData.priorContact}
                    onChange={e => setFormData({ ...formData, priorContact: e.target.value })}
                    placeholder="e.g. Sent written email on 15 Jan requesting refund. Opposing party replied refusing to pay. No formal advocate notice sent yet."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Step 7: What outcome do you want? */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <Target className="w-5 h-5 text-amber-600" />
                  <h3>Step 7: What Outcome Are You Seeking?</h3>
                </div>
                <p className="text-xs text-slate-500">
                  What practical relief or remedy do you want from the legal process?
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Desired Remedy or Outcome
                  </label>
                  <textarea
                    rows={4}
                    value={formData.desiredOutcome}
                    onChange={e => setFormData({ ...formData, desiredOutcome: e.target.value })}
                    placeholder="e.g. Full refund of ₹60,000 security deposit with interest, along with compensation for mental harassment."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={nextStep}
                disabled={loading || (step === 1 && !formData.description.trim())}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{step === 7 ? (loading ? 'Analyzing Case...' : 'Generate Case Understanding') : 'Continue to Step ' + (step + 1)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
