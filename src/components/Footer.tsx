import React from 'react';
import { Scale, ExternalLink, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

export default function Footer({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      {/* Upper Footer: Official Government Portals & Helplines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800/80">
          {/* Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
              <Scale className="w-5 h-5 text-amber-400" />
              <span>NyayaSahayak</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              An AI-powered Indian legal awareness and case-preparation platform designed to demystify Indian law for common citizens before they approach an advocate, police station, or court.
            </p>
            <div className="text-[11px] text-amber-400/90 font-medium">
              "अपने अधिकार समझें। अपने मामले की तैयारी करें।"
            </div>
          </div>

          {/* Emergency Helplines */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              Emergency Helplines (India)
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex justify-between border-b border-slate-900 pb-1">
                <span>National Emergency:</span> <strong className="text-white">112</strong>
              </li>
              <li className="flex justify-between border-b border-slate-900 pb-1">
                <span>Cyber Fraud (Golden Hour):</span> <strong className="text-amber-400">1930</strong>
              </li>
              <li className="flex justify-between border-b border-slate-900 pb-1">
                <span>Women Helpline:</span> <strong className="text-white">181</strong>
              </li>
              <li className="flex justify-between border-b border-slate-900 pb-1">
                <span>NALSA Free Legal Aid:</span> <strong className="text-white">15100</strong>
              </li>
              <li className="flex justify-between">
                <span>National Consumer Helpline:</span> <strong className="text-white">1915</strong>
              </li>
            </ul>
          </div>

          {/* Official Indian Legal Portals */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              Official Indian Portals
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="https://indiacode.nic.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 flex items-center gap-1">
                  India Code (Central & State Acts) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 flex items-center gap-1">
                  National Cyber Crime Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://edaakhil.nic.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 flex items-center gap-1">
                  E-Daakhil (Consumer Complaints) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://ecourts.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 flex items-center gap-1">
                  eCourts Services (Case Status) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://nalsa.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 flex items-center gap-1">
                  NALSA (Legal Services Authority) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              Features & Tools
            </h4>
            <ul className="space-y-1 text-xs">
              <li><button onClick={() => onNavigate('chat')} className="hover:text-amber-300">AI Legal Chatbot</button></li>
              <li><button onClick={() => onNavigate('wizard')} className="hover:text-amber-300">Start Guided Case Flow</button></li>
              <li><button onClick={() => onNavigate('analyzer')} className="hover:text-amber-300">Analyze Legal Document</button></li>
              <li><button onClick={() => onNavigate('search')} className="hover:text-amber-300">Indian Law Encyclopedia</button></li>
              <li><button onClick={() => onNavigate('forums')} className="hover:text-amber-300">Court & Forum Finder</button></li>
              <li><button onClick={() => onNavigate('dictionary')} className="hover:text-amber-300">Search Legal Terms</button></li>
            </ul>
          </div>
        </div>

        {/* Lower Legal Disclaimer */}
        <div className="pt-6 text-center text-[11px] text-slate-500 space-y-2">
          <p className="max-w-3xl mx-auto leading-relaxed">
            <strong>Important Legal Disclaimer:</strong> NyayaSahayak is an educational and case-preparation tool. It does not provide qualified legal representation and does not establish an attorney-client relationship. Indian laws, state amendments, and judicial precedents change over time. Verify all procedural timelines, court fees, and applicable provisions with a qualified advocate or official government gazette.
          </p>
          <p>© {new Date().getFullYear()} NyayaSahayak • Built with Google GenAI & Indian Legal RAG Intelligence</p>
        </div>
      </div>
    </footer>
  );
}
