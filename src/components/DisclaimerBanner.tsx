import { useState } from 'react';
import { AlertTriangle, ShieldAlert, PhoneCall, X } from 'lucide-react';
import { getTranslation } from '../data/translations';

export default function DisclaimerBanner({ preferredLanguage = 'English' }: { preferredLanguage?: string }) {
  const [dismissed, setDismissed] = useState(false);
  const t = getTranslation(preferredLanguage);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-2.5 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1 bg-amber-100 rounded text-amber-800 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-amber-900">{t.disclaimerTitle}</span>{' '}
            <span>{t.disclaimerText}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-100/80 px-2 py-1 rounded">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency Police: <strong>112</strong> | Cyber Fraud: <strong>1930</strong> | Legal Aid: <strong>15100</strong></span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-900 p-1 hover:bg-amber-200/60 rounded transition-colors"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
