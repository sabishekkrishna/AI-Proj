import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, AlertCircle, FileCheck, ArrowRight, ShieldCheck, Scale, CheckCircle2, HelpCircle, ExternalLink, Sparkles, RefreshCw, BookmarkPlus, Copy, Check, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { StructuredChatResponse, ChatMessageItem, CaseRecord } from '../types';
import { sendChatMessage, fetchSystemHealthApi } from '../services/apiService';
import { getTranslation } from '../data/translations';

interface ChatInterfaceProps {
  preferredLanguage: string;
  explainLikeNew: boolean;
  onPrepareReportFromChat: (initialData: Partial<CaseRecord>) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function ChatInterface({
  preferredLanguage,
  explainLikeNew,
  onPrepareReportFromChat,
  onNavigateToTab
}: ChatInterfaceProps) {
  const t = getTranslation(preferredLanguage);

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: t.chatWelcome
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRagMsgId, setExpandedRagMsgId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<{ hasApiKey: boolean; aiEngine: string } | null>(null);
  const [showKeyHint, setShowKeyHint] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Fetch engine health on load
  useEffect(() => {
    fetchSystemHealthApi()
      .then(data => {
        if (data) {
          setSystemStatus({
            hasApiKey: Boolean(data.hasApiKey),
            aiEngine: data.aiEngine || ''
          });
        }
      })
      .catch(() => {});
  }, []);

  // Update initial welcome message if user changes language before sending messages
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome-msg') {
        return [
          {
            id: 'welcome-msg',
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: t.chatWelcome
          }
        ];
      }
      return prev;
    });
  }, [preferredLanguage, t.chatWelcome]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langMap: Record<string, string> = {
        Hindi: 'hi-IN',
        Tamil: 'ta-IN',
        Telugu: 'te-IN',
        Kannada: 'kn-IN',
        Malayalam: 'ml-IN',
        Bengali: 'bn-IN',
        Marathi: 'mr-IN',
        English: 'en-IN'
      };
      recognition.lang = langMap[preferredLanguage] || 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, [preferredLanguage]);

  const toggleVoice = () => {
    if (!speechRecognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or type your question.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.text)
        .slice(-6)
        .map(m => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text || ''
        }));

      const res = await sendChatMessage(textToSend, history, preferredLanguage, explainLikeNew);

      const assistantMsg: ChatMessageItem = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredResponse: res
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I encountered an issue retrieving legal information: ${err.message || 'Please check your connection and try again.'}`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] max-w-6xl mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden my-4">
      {/* Chat Header Bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">NyayaSahayak AI Legal Assistant</h2>
              {systemStatus?.hasApiKey ? (
                <span className="text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  Gemini AI Active
                </span>
              ) : (
                <button
                  onClick={() => setShowKeyHint(prev => !prev)}
                  className="text-[10px] font-medium bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                  title="Running without GEMINI_API_KEY. Click for local setup instructions."
                >
                  <Cpu className="w-2.5 h-2.5 text-amber-400" />
                  Local RAG Mode
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showKeyHint ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded in Current Indian Laws (BNS, BNSS, BSA, CPA 2019, IT Act)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {explainLikeNew && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">
              <HelpCircle className="w-3 h-3" /> Simple Language Mode Active
            </span>
          )}
          <button
            onClick={() => {
              setMessages([
                {
                  id: 'welcome-reset',
                  sender: 'assistant',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  text: 'Chat history cleared. How may I assist you with your Indian legal questions today?'
                }
              ]);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Localhost Setup Guide Banner (Shown when running locally without GEMINI_API_KEY) */}
      {systemStatus && !systemStatus.hasApiKey && (
        <div className={`bg-amber-950/30 border-b border-amber-900/40 px-5 py-2.5 transition-all text-xs text-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${showKeyHint ? 'block' : 'hidden sm:flex'}`}>
          <div className="flex items-start sm:items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Localhost Mode:</strong> Running with built-in Statutory RAG Engine. To enable full dynamic Gemini AI on localhost, set <code className="bg-amber-900/40 px-1.5 py-0.5 rounded font-mono text-amber-300">GEMINI_API_KEY=your_key</code> in your local <code className="bg-amber-900/40 px-1.5 py-0.5 rounded font-mono text-amber-300">.env</code> file.
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText('GEMINI_API_KEY="your_api_key_here"');
              alert('Copied template: GEMINI_API_KEY="your_api_key_here"\nPaste this into your local .env file.');
            }}
            className="self-end sm:self-auto shrink-0 px-2.5 py-1 bg-amber-900/50 hover:bg-amber-800/60 border border-amber-700/60 rounded text-[11px] font-medium text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            Copy .env line
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map(msg => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-2xl bg-slate-900 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-md">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div className="text-[10px] text-slate-400 text-right mt-1.5">{msg.timestamp}</div>
                </div>
              </div>
            );
          }

          // Simple Text message from Assistant
          if (!msg.structuredResponse) {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-2xl bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 shadow-sm text-slate-800">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100 text-xs font-semibold text-slate-700">
                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                    <span>NyayaSahayak Legal Guide</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-800">{msg.text}</p>
                  <div className="text-[10px] text-slate-400 mt-2">{msg.timestamp}</div>
                </div>
              </div>
            );
          }

          // Full Structured 11-Part Response Card
          const r = msg.structuredResponse;
          return (
            <div key={msg.id} className="flex justify-start w-full">
              <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-md space-y-5 text-slate-800">
                {/* Emergency Alert Banner (if detected) */}
                {r.emergency?.isEmergency && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 text-red-950 space-y-2">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{r.emergency.type}: Immediate Official Assistance Required</span>
                    </div>
                    <p className="text-xs text-red-900 leading-relaxed font-medium">
                      {r.emergency.message}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {r.emergency.helplines.map((h, i) => (
                        <div key={i} className="bg-white border border-red-200 rounded-lg p-2.5 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-red-950">{h.name}</div>
                            <div className="text-[11px] text-red-700">{h.description}</div>
                          </div>
                          <span className="text-base font-extrabold text-red-600 px-2 py-1 bg-red-100/70 rounded">
                            {h.number}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1. Understanding & Legal Category Header */}
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-700 block mb-1">
                      1. Understanding Your Situation
                    </span>
                    <h3 className="text-base font-semibold text-slate-900">{r.understanding}</h3>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {r.engineMode === 'deterministic_rag' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-300" title="Grounded using local Indian statutory RAG knowledge base">
                        <Cpu className="w-2.5 h-2.5 text-amber-700" />
                        Local RAG
                      </span>
                    )}
                    {r.engineMode === 'gemini_ai' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                        Gemini AI
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-amber-400 border border-slate-800">
                      <Scale className="w-3 h-3" />
                      {r.category}
                    </span>
                  </div>
                </div>

                {/* Simple Language Summary (if Explain Like I'm New is active) */}
                {r.simpleLanguageSummary && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950">
                    <div className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Plain-Language Summary (New to Law):</span>
                    </div>
                    <p className="leading-relaxed">{r.simpleLanguageSummary}</p>
                  </div>
                )}

                {/* 3 & 4. Relevant Laws and Meaning */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
                    3. Laws That May Be Relevant & 4. What the Law Means
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {r.relevantLaws.map((law, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{law.act}</span>
                            {law.section && (
                              <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                                {law.section}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                law.verificationStatus === 'Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : law.verificationStatus === 'Likely Relevant'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {law.verificationStatus}
                            </span>
                            <span className="text-[11px] text-slate-500">({law.status})</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{law.explanation}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 italic">
                    {r.lawExplanation}
                  </p>
                </div>

                {/* 5. Important Follow-up Questions */}
                {r.followUpQuestions && r.followUpQuestions.length > 0 && (
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-blue-900 block">
                      5. Important Questions to Answer
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-950">
                      {r.followUpQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold shrink-0">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Evidence You Should Preserve */}
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                    6. Evidence You Should Preserve
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                      <div className="font-semibold text-slate-900 mb-1 text-[11px] uppercase tracking-wide">
                        📄 Documents
                      </div>
                      <ul className="space-y-1 text-slate-600">
                        {r.evidenceToPreserve.documents.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                      <div className="font-semibold text-slate-900 mb-1 text-[11px] uppercase tracking-wide">
                        💬 Digital Proofs
                      </div>
                      <ul className="space-y-1 text-slate-600">
                        {r.evidenceToPreserve.digital.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                      <div className="font-semibold text-slate-900 mb-1 text-[11px] uppercase tracking-wide">
                        💳 Financial Proofs
                      </div>
                      <ul className="space-y-1 text-slate-600">
                        {r.evidenceToPreserve.financial.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                      <div className="font-semibold text-slate-900 mb-1 text-[11px] uppercase tracking-wide">
                        👥 Witnesses
                      </div>
                      <ul className="space-y-1 text-slate-600">
                        {r.evidenceToPreserve.witnesses.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 7 & 8. Next Steps & Possible Forum */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl space-y-1.5">
                    <span className="font-bold text-emerald-950 uppercase tracking-wider block">
                      7. Possible Next Steps
                    </span>
                    <ol className="space-y-1 text-emerald-950 list-decimal list-inside">
                      {r.possibleNextSteps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl space-y-1.5">
                    <span className="font-bold text-purple-950 uppercase tracking-wider block">
                      8. Possible Forum / Authority
                    </span>
                    <ul className="space-y-1 text-purple-950">
                      {r.possibleForum.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 9 & 10. Urgency/Limitation & Warning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                    <span className="font-bold text-amber-900 block mb-1">
                      9. Urgency & Time Limits (Limitation Period)
                    </span>
                    <p className="text-amber-950 leading-relaxed">{r.urgencyAndTimeLimits}</p>
                  </div>

                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">
                      10. Important Warning & Caveat
                    </span>
                    <p className="text-slate-700 leading-relaxed">{r.importantWarning}</p>
                  </div>
                </div>

                {/* RAG Grounding Verification Panel */}
                {r.ragInspection && (
                  <div className="bg-slate-900 text-white rounded-xl p-3 border border-slate-800 text-xs">
                    <div
                      onClick={() => setExpandedRagMsgId(expandedRagMsgId === msg.id ? null : msg.id)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold text-white">
                          RAG Grounding Verified:
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 font-mono">
                          {r.ragInspection.retrievedChunks.length} Statutory Chunks
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                          ({r.ragInspection.retrievalLatencyMs}ms latency • {r.ragInspection.retrievalMethod})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-white text-xs flex items-center gap-1 shrink-0"
                      >
                        <span>{expandedRagMsgId === msg.id ? 'Hide RAG Chunks' : 'Inspect RAG'}</span>
                        {expandedRagMsgId === msg.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {expandedRagMsgId === msg.id && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pb-1">
                          <span>Classification: <strong className="text-slate-200">{r.ragInspection.classifiedCategory}</strong></span>
                          <span>• Model: <strong className="text-slate-200">{r.ragInspection.embeddingModel}</strong></span>
                          <span>• Vector Store: <strong className="text-slate-200">{r.ragInspection.totalIndexedChunks} chunks indexed</strong></span>
                        </div>

                        <div className="space-y-1.5">
                          {r.ragInspection.retrievedChunks.map((rc, cIdx) => (
                            <div
                              key={cIdx}
                              className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80 text-[11px]"
                            >
                              <div className="flex items-center justify-between font-semibold text-amber-300">
                                <span>
                                  #{cIdx + 1} {rc.chunk.act} {rc.chunk.section ? `• ${rc.chunk.section}` : ''} ({rc.chunk.title})
                                </span>
                                <span className="bg-amber-500/20 px-1.5 py-0.2 rounded text-amber-300 font-mono text-[10px]">
                                  {Math.round(rc.score * 100)}% Match
                                </span>
                              </div>
                              <p className="text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                                {rc.chunk.simpleExplanation || rc.chunk.summary}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rc.matchReasons.map((reason, rIdx) => (
                                  <span key={rIdx} className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sources List */}
                {r.sources && r.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Authoritative Sources:</span>
                    {r.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                      >
                        <span>{s.act} {s.section || ''}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}

                {/* 11. Case Preparation Action Banner */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <span>{r.casePreparationOffer}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Generate a structured case dossier, timeline, and personalized questions to take to a lawyer.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        onPrepareReportFromChat({
                          title: r.understanding.slice(0, 60),
                          category: r.category,
                          facts: [r.understanding],
                          evidence: r.evidenceToPreserve.documents.map((d, i) => ({
                            id: `ev-${i}`,
                            name: d,
                            type: 'document',
                            description: 'Document identified during AI analysis',
                            importance: 'Crucial'
                          }))
                        })
                      }
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-lg text-xs hover:brightness-110 flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Generate Case Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-sm flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Retrieving Indian Legal Sources...</span> Cross-referencing current criminal sanhitas, civil procedure, and consumer statutes.
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-white px-4 py-2 border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 whitespace-nowrap text-[11px] uppercase tracking-wide">
            {t.commonInquiries}
          </span>
          {t.quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-700 rounded-full text-xs whitespace-nowrap border border-slate-200/80 transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box and Voice Control */}
      <div className="bg-white p-3 sm:p-4 border-t border-slate-200">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Speak your legal question'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              isListening
                ? t.listening
                : t.inputPlaceholder
            }
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{t.sendBtn}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
