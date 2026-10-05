import React, { useState } from 'react';
import { HeartHandshake, CheckCircle2, XCircle, PhoneCall, ExternalLink, HelpCircle, Scale, ShieldCheck } from 'lucide-react';

const STATE_INCOME_THRESHOLDS: { [key: string]: number } = {
  'Delhi NCR': 300000,
  'Maharashtra': 300000,
  'Karnataka': 300000,
  'Tamil Nadu': 300000,
  'Telangana': 300000,
  'Uttar Pradesh': 200000,
  'West Bengal': 150000,
  'Bihar': 150000,
  'Gujarat': 300000,
  'Rajasthan': 150000,
  'Kerala': 300000,
  'Madhya Pradesh': 150000,
  'Other States': 150000
};

export default function LegalAidChecker() {
  const [selectedState, setSelectedState] = useState('Delhi NCR');
  const [isWomanOrChild, setIsWomanOrChild] = useState(false);
  const [isSCorST, setIsSCorST] = useState(false);
  const [isWorkman, setIsWorkman] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInCustody, setIsInCustody] = useState(false);
  const [isDisasterVictim, setIsDisasterVictim] = useState(false);
  const [annualIncome, setAnnualIncome] = useState<number>(180000);

  const threshold = STATE_INCOME_THRESHOLDS[selectedState] || 150000;

  const isEligibleByCategory =
    isWomanOrChild || isSCorST || isWorkman || isDisabled || isInCustody || isDisasterVictim;

  const isEligibleByIncome = annualIncome <= threshold;

  const isEligible = isEligibleByCategory || isEligibleByIncome;

  return (
    <div className="max-w-5xl mx-auto my-6 px-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg space-y-2">
        <div className="flex items-center gap-2 font-serif font-bold text-xl">
          <HeartHandshake className="w-5 h-5 text-amber-400" />
          <span>Can I Get Free Legal Help? (NALSA / DLSA Eligibility)</span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Under Section 12 of the Legal Services Authorities Act, 1987, the Indian Constitution (Article 39A) mandates free legal aid, document drafting, and court fee exemption for vulnerable and low-income citizens.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-amber-300">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>National Legal Aid Helpline: <strong>15100</strong> (Toll-Free, 24/7)</span>
          </div>
          <a
            href="https://nalsa.gov.in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-white underline"
          >
            <span>Official Portal (nalsa.gov.in)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Interactive Eligibility Calculator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-900">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-950">
            Check Your Free Legal Aid Eligibility (Section 12 Criteria)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Answer the questions below to see if you qualify for a free government advocate and court fee waiver.
          </p>
        </div>

        {/* State Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Your State / UT
            </label>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
            >
              {Object.keys(STATE_INCOME_THRESHOLDS).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Estimated Annual Household Income (₹)
            </label>
            <input
              type="number"
              step="10000"
              value={annualIncome}
              onChange={e => setAnnualIncome(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              State Income Threshold: ₹{threshold.toLocaleString('en-IN')}/year
            </span>
          </div>
        </div>

        {/* Automatic Category Checkboxes */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            Do You Belong to Any of These Categories? (Automatic Eligibility under Section 12)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={isWomanOrChild}
                onChange={e => setIsWomanOrChild(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-slate-800 font-medium">Woman or Child (Below 18 years)</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={isSCorST}
                onChange={e => setIsSCorST(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-slate-800 font-medium">Member of Scheduled Caste (SC) or Scheduled Tribe (ST)</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={isWorkman}
                onChange={e => setIsWorkman(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-slate-800 font-medium">Industrial Workman (Factory/Construction Worker)</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={isDisabled}
                onChange={e => setIsDisabled(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-slate-800 font-medium">Person with Physical / Mental Disability</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={isDisasterVictim}
                onChange={e => setIsDisasterVictim(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-slate-800 font-medium">Victim of Mass Disaster, Ethnic Violence, Flood, or Drought</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={isInCustody}
                onChange={e => setIsInCustody(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-slate-800 font-medium">Person in Police Custody / Remand Home</span>
            </label>
          </div>
        </div>

        {/* Result Evaluation Card */}
        <div
          className={`p-5 rounded-2xl border ${
            isEligible
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {isEligible ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <h4 className="text-base font-bold">
                {isEligible
                  ? 'You Appear Eligible for Free Legal Aid!'
                  : 'You May Exceed General Automatic Eligibility'}
              </h4>
              <p className="text-xs leading-relaxed">
                {isEligible
                  ? isEligibleByCategory
                    ? 'You qualify under Section 12 automatic protected criteria (women, children, SC/ST, workmen, disabled). You do NOT have to prove annual income.'
                    : `Your annual income (₹${annualIncome.toLocaleString('en-IN')}) is within the legal threshold for ${selectedState} (₹${threshold.toLocaleString('en-IN')}).`
                  : `Your reported income exceeds the threshold of ₹${threshold.toLocaleString('en-IN')}/year for ${selectedState}. However, discretionary legal aid or Lok Adalat conciliation is still accessible.`}
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step: How to Apply for Legal Aid */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            How to Get Your Free Advocate from the District Court:
          </h4>
          <ol className="space-y-2 text-xs text-slate-800 list-decimal list-inside bg-slate-50 p-4 rounded-xl border border-slate-200">
            <li className="leading-relaxed pl-1">
              <strong>Locate the DLSA Office:</strong> Walk into the District Court complex in your district and ask for the "District Legal Services Authority" (DLSA) office (usually near the entrance or bar library).
            </li>
            <li className="leading-relaxed pl-1">
              <strong>Fill Form 1:</strong> Submit a 1-page application stating your legal problem and attach a photocopy of your Aadhaar card and category/income proof.
            </li>
            <li className="leading-relaxed pl-1">
              <strong>Advocate Allotment:</strong> The Secretary of DLSA (a serving senior judicial officer) scrutinizes the application and assigns a practicing panel advocate free of cost within 3 to 7 working days.
            </li>
            <li className="leading-relaxed pl-1">
              <strong>Zero Expense:</strong> You do not pay advocate fees, court drafting charges, or process fees.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
