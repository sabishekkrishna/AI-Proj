import { ai } from './geminiClient.ts';
import { searchLegalSources, INDIAN_LEGAL_DATABASE, type LegalSourceItem } from './legalKnowledgeBase.ts';
import { ragVectorStore, type RagInspectionData } from './ragEngine.ts';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface EmergencyInfo {
  isEmergency: boolean;
  type?: 'Physical Threat' | 'Domestic Violence' | 'Ongoing Cyber/Financial Fraud' | 'Child Endangerment' | 'Imminent Arrest';
  message?: string;
  helplines: { name: string; number: string; description: string }[];
}

export interface StructuredChatResponse {
  understanding: string;
  category: string;
  relevantLaws: {
    act: string;
    section?: string;
    status: string;
    explanation: string;
    verificationStatus: 'Verified' | 'Likely Relevant' | 'Requires Verification';
  }[];
  lawExplanation: string;
  followUpQuestions: string[];
  evidenceToPreserve: {
    documents: string[];
    digital: string[];
    financial: string[];
    witnesses: string[];
  };
  possibleNextSteps: string[];
  possibleForum: string[];
  urgencyAndTimeLimits: string;
  importantWarning: string;
  casePreparationOffer: string;
  sources: { title: string; act: string; section?: string; url: string; verifiedDate: string }[];
  emergency: EmergencyInfo;
  simpleLanguageSummary?: string;
  ragInspection?: RagInspectionData;
  engineMode?: 'gemini_ai' | 'deterministic_rag';
  engineNote?: string;
}

export function detectEmergency(text: string): EmergencyInfo {
  const lower = text.toLowerCase();

  const isCyberFraud =
    (lower.includes('hacked') || lower.includes('otp') || lower.includes('debit card') || lower.includes('upi fraud') || lower.includes('money stolen') || lower.includes('cyber crime') || lower.includes('phishing')) &&
    (lower.includes('today') || lower.includes('just now') || lower.includes('minutes ago') || lower.includes('urgent') || lower.includes('ongoing'));

  const isDomesticViolence =
    lower.includes('beating me') || lower.includes('hitting me') || lower.includes('husband beat') || lower.includes('in laws abuse') || lower.includes('domestic violence') || lower.includes('threatened to kill');

  const isImminentDanger =
    lower.includes('life in danger') || lower.includes('they are outside') || lower.includes('attacking me') || lower.includes('weapon') || lower.includes('suicide') || lower.includes('kill myself');

  if (isImminentDanger) {
    return {
      isEmergency: true,
      type: 'Physical Threat',
      message: 'URGENT SAFETY ALERT: If you are in immediate physical danger, do not wait for legal advice. Contact emergency police assistance immediately.',
      helplines: [
        { name: 'National Emergency Number', number: '112', description: 'Immediate police, fire, and ambulance dispatch across India' },
        { name: 'Police Control Room', number: '100', description: 'Local police emergency' }
      ]
    };
  }

  if (isDomesticViolence) {
    return {
      isEmergency: true,
      type: 'Domestic Violence',
      message: 'SAFETY NOTICE: If you are facing domestic abuse or threats to your personal safety, immediate confidential support is available.',
      helplines: [
        { name: 'National Women Helpline', number: '181', description: '24/7 toll-free crisis helpline for women in distress' },
        { name: 'National Emergency Number', number: '112', description: 'Immediate police response' },
        { name: 'National Legal Aid Helpline', number: '15100', description: 'Free legal aid and Protection Officer assistance' }
      ]
    };
  }

  if (isCyberFraud) {
    return {
      isEmergency: true,
      type: 'Ongoing Cyber/Financial Fraud',
      message: 'GOLDEN HOUR ACTION: If you lost money online within the last few hours, report immediately to freeze the suspect accounts before funds are withdrawn.',
      helplines: [
        { name: 'National Cyber Financial Fraud Helpline', number: '1930', description: 'Citizen Financial Cyber Fraud Reporting System to freeze fraudulent transactions' },
        { name: 'National Cyber Crime Portal', number: 'cybercrime.gov.in', description: 'Official portal to register cyber crime complaints' }
      ]
    };
  }

  return {
    isEmergency: false,
    helplines: []
  };
}

/**
 * Safely calls Gemini models with graceful fallback across responsive models.
 * Avoids socket timeouts or noisy stack traces in log streams.
 */
async function callGeminiGenerate(
  contents: string,
  config?: any,
  systemInstruction?: string
): Promise<string | null> {
  if (!ai) return null;

  // Prioritize lightweight, responsive model, then fallbacks
  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          ...(config || {}),
          ...(systemInstruction ? { systemInstruction } : {})
        }
      });
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (_err: any) {
      // Try next candidate model
      continue;
    }
  }

  // Gracefully transition without throwing noisy stack traces
  console.info('[AI Service] Gemini models temporarily unreachable; transitioning seamlessly to deterministic Indian Legal RAG engine.');
  return null;
}

export async function generateLegalChatResponse(
  userQuery: string,
  history: ChatMessage[],
  preferredLanguage: string = 'English',
  explainLikeNew: boolean = false
): Promise<StructuredChatResponse> {
  const emergency = detectEmergency(userQuery);
  // Perform dense + lexical hybrid RAG retrieval
  const ragInspection = await ragVectorStore.search(userQuery, { topK: 4 });
  const relevantSources: LegalSourceItem[] = ragInspection.retrievedChunks.map(rc => ({
    id: rc.chunk.documentId || rc.chunk.id,
    act: rc.chunk.act,
    section: rc.chunk.section,
    chapter: rc.chunk.chapter,
    title: rc.chunk.title,
    category: rc.chunk.category,
    currentStatus: (rc.chunk.currentStatus as any) || 'Current Law',
    oldEquivalent: rc.chunk.oldEquivalent,
    summary: rc.chunk.summary,
    simpleExplanation: rc.chunk.simpleExplanation,
    fullProvisionsSummary: rc.chunk.text,
    keyElements: rc.chunk.keyElements || [],
    remediesOrPenalties: rc.chunk.remediesOrPenalties || '',
    relevantForums: rc.chunk.relevantForums || ['Jurisdictional Court'],
    limitationPeriod: rc.chunk.limitationPeriod,
    sourceUrl: rc.chunk.sourceUrl,
    officialSourceType: (rc.chunk.officialSourceType as any) || 'Central Act',
    verifiedDate: rc.chunk.verifiedDate,
    confidence: rc.chunk.confidence
  }));

  // Grounding Context constructed by RAG Engine
  const ragContext = ragInspection.contextPromptConstructed;

  if (ai) {
    try {
      const systemInstruction = `
You are NyayaSahayak, an AI legal-information assistant focused strictly on the Indian legal system.
Your purpose is to help ordinary citizens understand legal concepts, organize facts, identify potentially relevant Indian legal provisions, identify evidence, and prepare questions for qualified legal professionals.

CRITICAL RULES:
1. You are NOT an advocate and NOT a substitute for a lawyer. Never guarantee any outcome or say "you will win/lose".
2. Support CURRENT Indian Laws: Account for the criminal reform acts (Bharatiya Nyaya Sanhita 2023 [BNS], Bharatiya Nagarik Suraksha Sanhita 2023 [BNSS], Bharatiya Sakshya Adhiniyam 2023 [BSA]) which replaced IPC, CrPC, and Indian Evidence Act from 1 July 2024. Explicitly mention both current law and historical old sections when relevant so users understand both.
3. NEVER hallucinate section numbers or judgments. If not completely confident, use "Likely Relevant" or "Requires Verification".
4. Do NOT invent limitation periods. If unsure, state that limitation periods apply and must be verified.
5. If user is in an emergency, prioritize safety and official helplines (112, 1930, 181, 15100).
6. Response must be returned strictly formatted as valid JSON adhering to the target schema.
7. CRITICAL LANGUAGE REQUIREMENT: The user has selected the language: "${preferredLanguage}". YOU MUST WRITE YOUR ENTIRE RESPONSE AND ALL TEXT FIELDS (understanding, lawExplanation, followUpQuestions, possibleNextSteps, possibleForum, urgencyAndTimeLimits, importantWarning, casePreparationOffer, simpleLanguageSummary) IN ${preferredLanguage}. Do NOT write in English unless preferredLanguage is English.
8. ${explainLikeNew ? 'Use ultra-simple, everyday conversational language, explaining any legal term in simple analogies.' : 'Use clear, accessible language.'}
`;

      const prompt = `
User Query: "${userQuery}"

Retrieved Authoritative Indian Legal Sources (RAG):
${ragContext || 'No direct statutory match in current seed index. Apply general Indian legal principles with cautious confidence.'}

Previous conversation context:
${history.slice(-4).map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}

Format your output as a single valid JSON object with the following fields:
{
  "understanding": "Brief summary of what the user described",
  "category": "One of the 22 Indian legal categories (e.g. Criminal Law, Rent/Tenancy, Employment/Labour, Consumer Protection, Cybercrime, Property Law, etc.)",
  "relevantLaws": [
    {
      "act": "Act Name (e.g. Bharatiya Nyaya Sanhita, 2023 or Consumer Protection Act, 2019)",
      "section": "Section if known or applicable",
      "status": "Current Law or Historical Reference",
      "explanation": "What this law generally means in simple language",
      "verificationStatus": "Verified or Likely Relevant or Requires Verification"
    }
  ],
  "lawExplanation": "Simple plain-language summary of what the legal position generally entails in India",
  "followUpQuestions": ["Question 1", "Question 2", "Question 3", "Question 4"],
  "evidenceToPreserve": {
    "documents": ["Agreements, receipts, notices, etc."],
    "digital": ["WhatsApp chats, emails, call logs, screenshots"],
    "financial": ["Bank statements, UPI transactions, invoices"],
    "witnesses": ["Colleagues, neighbours, third parties who saw or heard"]
  },
  "possibleNextSteps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "possibleForum": ["Where the user can go: Police, Consumer Forum, Civil Court, Labour Commissioner, etc."],
  "urgencyAndTimeLimits": "Applicable limitation period or procedural time constraints (explicitly state to verify with an advocate)",
  "importantWarning": "Major legal risk, jurisdictional caveat, or procedural caution",
  "casePreparationOffer": "Would you like me to prepare a Case Preparation Report from the information you have provided?",
  "simpleLanguageSummary": "A 2-3 sentence ultra-clear summary for someone who has never studied law"
}
`;

      const rawText = await callGeminiGenerate(
        prompt,
        { responseMimeType: 'application/json' },
        systemInstruction
      );

      if (rawText) {
        const parsed = JSON.parse(rawText);
        return {
          understanding: parsed.understanding || `Based on your description, this issue relates to ${parsed.category || 'an Indian legal matter'}.`,
          category: parsed.category || (relevantSources[0]?.category || 'General Civil/Criminal Matter'),
          relevantLaws: parsed.relevantLaws || relevantSources.map(s => ({
            act: s.act,
            section: s.section,
            status: s.currentStatus,
            explanation: s.simpleExplanation,
            verificationStatus: s.confidence
          })),
          lawExplanation: parsed.lawExplanation || (relevantSources[0]?.simpleExplanation || 'Under Indian law, remedies depend on whether this constitutes a civil wrong or criminal offence.'),
          followUpQuestions: parsed.followUpQuestions || [
            'When did this incident or dispute first occur?',
            'Do you have written agreements, payment receipts, or text messages?',
            'Which Indian state and district are you located in?',
            'Have you sent any formal written communication or notice to the other party?'
          ],
          evidenceToPreserve: parsed.evidenceToPreserve || {
            documents: ['Any written agreements, bills, or notices'],
            digital: ['WhatsApp conversations, emails, and call records'],
            financial: ['Bank account statements, UPI payment receipts'],
            witnesses: ['Persons who witnessed the transactions or dispute']
          },
          possibleNextSteps: parsed.possibleNextSteps || [
            'Preserve all communication and documents without altering them.',
            'Compile a chronological timeline of events and dates.',
            'Send a formal written request or legal notice through an advocate if required.',
            'Approach the appropriate jurisdictional forum or authority.'
          ],
          possibleForum: parsed.possibleForum || (relevantSources[0]?.relevantForums || ['District Civil Court', 'Local Police Station / Consumer Commission']),
          urgencyAndTimeLimits: parsed.urgencyAndTimeLimits || 'Limitation periods in India generally range from 30 days to 3 years depending on the forum. Verify the specific period with an advocate.',
          importantWarning: parsed.importantWarning || 'This is general legal information and not professional legal advice. Always consult a qualified advocate before filing proceedings.',
          casePreparationOffer: 'Would you like me to prepare a structured Case Preparation Report from the details you have provided?',
          sources: relevantSources.map(s => ({
            title: s.title,
            act: s.act,
            section: s.section,
            url: s.sourceUrl,
            verifiedDate: s.verifiedDate
          })),
          emergency,
          simpleLanguageSummary: parsed.simpleLanguageSummary,
          ragInspection,
          engineMode: 'gemini_ai'
        };
      }
    } catch {
      // Proceed gracefully to deterministic engine
    }
  }

  // --- ENHANCED DYNAMIC FALLBACK RAG ENGINE ---
  // Runs whenever GEMINI_API_KEY is not set or network fails.
  // Dynamically matches statutes, generates query-specific questions, evidence, and remedies.
  return generateDynamicFallbackResponse(
    userQuery,
    relevantSources,
    preferredLanguage,
    explainLikeNew,
    emergency,
    ragInspection
  );
}

/**
 * Builds tailored, statute-grounded responses when running without GEMINI_API_KEY or offline.
 * Prevents identical/static boilerplate across queries on localhost.
 */
function generateDynamicFallbackResponse(
  userQuery: string,
  retrievedSources: LegalSourceItem[],
  preferredLanguage: string,
  explainLikeNew: boolean,
  emergency: EmergencyInfo,
  ragInspection: RagInspectionData
): StructuredChatResponse {
  const queryLower = userQuery.toLowerCase();

  // 1. Determine best statutory match from query keywords and RAG results
  let matchedLaw: LegalSourceItem = retrievedSources[0] || INDIAN_LEGAL_DATABASE[0];

  if (queryLower.includes('salary') || queryLower.includes('employer') || queryLower.includes('wage') || queryLower.includes('unpaid') || queryLower.includes('job') || queryLower.includes('resigned') || queryLower.includes('fired')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'labour-unpaid-salary') || matchedLaw;
  } else if (queryLower.includes('deposit') || queryLower.includes('landlord') || queryLower.includes('tenant') || queryLower.includes('rent') || queryLower.includes('flat') || queryLower.includes('vacat')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'tenancy-sec-deposit') || matchedLaw;
  } else if (queryLower.includes('cheque') || queryLower.includes('bounced') || queryLower.includes('bounce') || queryLower.includes('138') || queryLower.includes('dishonour')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'ni-138') || matchedLaw;
  } else if (queryLower.includes('upi') || queryLower.includes('scam') || queryLower.includes('cyber') || queryLower.includes('otp') || queryLower.includes('phish') || queryLower.includes('hacked') || queryLower.includes('cheated online')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'it-66d') || matchedLaw;
  } else if (queryLower.includes('product') || queryLower.includes('defective') || queryLower.includes('warranty') || queryLower.includes('refund') || queryLower.includes('flipkart') || queryLower.includes('amazon') || queryLower.includes('consumer')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'cpa-2-35') || matchedLaw;
  } else if (queryLower.includes('domestic') || queryLower.includes('wife') || queryLower.includes('husband') || queryLower.includes('beating') || queryLower.includes('dowry') || queryLower.includes('abuse') || queryLower.includes('in-laws')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'pwdva-2005') || matchedLaw;
  } else if (queryLower.includes('accident') || queryLower.includes('car') || queryLower.includes('bike') || queryLower.includes('mact') || queryLower.includes('hit and run') || queryLower.includes('injury')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'mva-166') || matchedLaw;
  } else if (queryLower.includes('refuse fir') || queryLower.includes('refused fir') || queryLower.includes('police refuse') || queryLower.includes('sp complaint') || queryLower.includes('police not filing')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'bnss-175') || matchedLaw;
  } else if (queryLower.includes('fir') || queryLower.includes('zero fir') || queryLower.includes('police station')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'bnss-173') || matchedLaw;
  } else if (queryLower.includes('theft') || queryLower.includes('stolen') || queryLower.includes('stole') || queryLower.includes('thief')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'bns-303') || matchedLaw;
  } else if (queryLower.includes('threat') || queryLower.includes('threatening') || queryLower.includes('intimidat') || queryLower.includes('harm')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'bns-351') || matchedLaw;
  } else if (queryLower.includes('defam') || queryLower.includes('reputation') || queryLower.includes('slander') || queryLower.includes('false post')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'bns-356') || matchedLaw;
  } else if (queryLower.includes('encroach') || queryLower.includes('plot') || queryLower.includes('land') || queryLower.includes('stay order') || queryLower.includes('property') || queryLower.includes('dispossess')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'property-injunction') || matchedLaw;
  } else if (queryLower.includes('legal aid') || queryLower.includes('free lawyer') || queryLower.includes('cannot afford') || queryLower.includes('poor')) {
    matchedLaw = INDIAN_LEGAL_DATABASE.find(s => s.id === 'nalsa-12') || matchedLaw;
  }

  const determinedCategory = matchedLaw.category;
  const isHindi = preferredLanguage === 'Hindi';
  const isTamil = preferredLanguage === 'Tamil';
  const isTelugu = preferredLanguage === 'Telugu';

  // 2. Statute-specific follow-up questions
  let followUpQuestions: string[] = [];
  let evidenceToPreserve = {
    documents: ['Formal agreements, contract letters, receipts, or registered notices'],
    digital: ['WhatsApp / SMS conversations, emails, and screenshots with timestamps'],
    financial: ['Bank passbook entries, account statements, and UPI/NEFT transaction IDs'],
    witnesses: ['Any colleagues, family members, or witnesses present at the scene']
  };
  let possibleNextSteps: string[] = [];

  switch (matchedLaw.id) {
    case 'labour-unpaid-salary':
      followUpQuestions = [
        'How many months of salary, incentives, or full & final settlement remain unpaid?',
        'Do you possess your official appointment letter, employment agreement, and recent salary slips?',
        'Have you formally resigned with written notice or raised a grievance via your official email?',
        'What is the registered company name and state where your workplace is situated?'
      ];
      evidenceToPreserve = {
        documents: ['Offer letter, employment contract, and company ID card', 'Salary slips for recent months and Form 16', 'Resignation letter and postal/email acknowledgement'],
        digital: ['HR email communications admitting delay or discussing wages', 'Biometric/login attendance records and approved timesheets'],
        financial: ['Bank statement showing past salary credits and subsequent non-payments', 'Full & final settlement calculation sheet or expense claims'],
        witnesses: ['Colleagues or former employees who faced identical wage withholding']
      };
      possibleNextSteps = [
        'Issue a formal legal demand notice through an advocate giving 15 days to clear pending dues.',
        'File a statutory claim under Section 15 of Payment of Wages Act / Code on Wages before the Labour Commissioner.',
        'Initiate conciliation proceedings before the jurisdictional Labour Conciliation Officer.',
        'For managerial personnel, file a Summary Recovery Suit under Order XXXVII CPC in District Civil Court.'
      ];
      break;

    case 'tenancy-sec-deposit':
      followUpQuestions = [
        'What is the exact security deposit amount withheld by the landlord?',
        'Did you serve written notice of vacation adhering to the tenancy agreement terms?',
        'Has vacant possession and keys been handed over in writing to the landlord?',
        'Has the landlord claimed specific damages or provided repair contractor invoices?'
      ];
      evidenceToPreserve = {
        documents: ['Signed and dated Rental/Lease Agreement', 'Initial security deposit bank transfer receipt or cheque copy', 'Formal handover note or key return confirmation'],
        digital: ['WhatsApp and email threads discussing move-out date and deposit refund', 'Video walkthrough and high-resolution photos of the flat taken on handover day'],
        financial: ['Bank account statement highlighting initial deposit debit', 'All monthly rent transfer receipts and utility bill payment clearances'],
        witnesses: ['Building security guard, society management member, or broker present at inspection']
      };
      possibleNextSteps = [
        'Send a formal legal demand notice via Speed Post demanding deposit refund with 18% statutory interest.',
        'File a complaint before the Rent Authority / Rent Tribunal under the State Tenancy Act.',
        'If tenancy agreement is violated, file a civil recovery suit for money withheld.',
        'Approach Consumer Disputes Redressal Commission if maintenance or landlord service deficiency is involved.'
      ];
      break;

    case 'ni-138':
      followUpQuestions = [
        'What is the exact date of the bank return memo stating "Funds Insufficient"?',
        'Has the mandatory 30-day statutory demand notice been issued via Registered Post AD / Speed Post?',
        'Was the cheque issued in discharge of an existing debt, invoice, or loan agreement?',
        'Did the drawer make any payment or reply within 15 days of receiving your legal notice?'
      ];
      evidenceToPreserve = {
        documents: ['Original bounced cheque and original bank return memo / dishonour slip', 'Office copy of statutory demand notice sent through advocate', 'Postal receipt and online tracking report proving delivery to drawer'],
        digital: ['WhatsApp/email chats acknowledging debt and promising repayment', 'Invoices, purchase orders, or promissory note establishing legal debt'],
        financial: ['Bank statement showing presentation and dishonour of the cheque', 'Account ledger reflecting loan disbursement or goods delivered'],
        witnesses: ['Individuals who witnessed the signing/handover of the cheque']
      };
      possibleNextSteps = [
        'Ensure the statutory demand notice is dispatched strictly within 30 days of the bank return memo date.',
        'Wait mandatory 15 calendar days from the date of delivery of notice for payment.',
        'File a criminal complaint under Section 138 NI Act before the Judicial Magistrate within 30 days thereafter.',
        'Pray for 20% interim compensation under Section 143A of the Negotiable Instruments Act.'
      ];
      break;

    case 'it-66d':
      followUpQuestions = [
        'Did the fraudulent transaction occur within the last 24 hours ("Golden Hour")?',
        'Did the scammer share a payment link, request OTP, or ask you to install AnyDesk/TeamViewer/APK?',
        'Have you called the National Cyber Crime Helpline at 1930 to freeze the fraud beneficiary account?',
        'Which bank, debit/credit card, or UPI app was used for the unauthorized transaction?'
      ];
      evidenceToPreserve = {
        documents: ['Copy of formal complaint filed on cybercrime.gov.in (with Acknowledgement Number)', 'Bank dispute form and chargeback request submission copy'],
        digital: ['Full mobile screenshots of transaction receipts with visible UTR/UPI reference numbers', 'Phone call recording or call logs showing scammer numbers', 'SMS containing fraud links, OTPs, or debit notifications (do not delete)'],
        financial: ['Immediate bank statement reflecting unauthorized debit', 'UPI application transaction receipt showing beneficiary VPA/account'],
        witnesses: ['Bank branch nodal officer or cyber cell investigating officer']
      };
      possibleNextSteps = [
        'Immediately dial 1930 or submit details on cybercrime.gov.in so the Financial Fraud Reporting System can freeze the funds.',
        'Report to your bank fraud monitoring unit within 3 days for Zero Liability protection under RBI circular.',
        'Obtain Section 63 BSA certificate for all electronic transaction screenshots.',
        'Visit your local Cyber Crime Police Station to register an FIR if financial loss is significant.'
      ];
      break;

    case 'cpa-2-35':
      followUpQuestions = [
        'When did you purchase the item/service, and what is the invoice amount?',
        'Is the product still covered under manufacturer warranty or return window?',
        'Did the service center issue a job sheet or repair rejection certificate?',
        'Have you escalated the grievance to the grievance officer of the company?'
      ];
      evidenceToPreserve = {
        documents: ['Tax invoice / retail bill with GST number and date of purchase', 'Warranty card, terms of service, and user manual', 'Service center job cards, repair refusal slips, or inspection reports'],
        digital: ['Customer support chat transcripts, ticket numbers, and email threads', 'Photographs and video recordings demonstrating the defect clearly'],
        financial: ['Credit card / debit card / UPI payment confirmation receipt'],
        witnesses: ['Independent technician or showroom representative who inspected item']
      };
      possibleNextSteps = [
        'Register a formal consumer grievance on the National Consumer Helpline (NCH - 1915 or consumerhelpline.gov.in).',
        'Send a formal legal notice to the manufacturer and seller demanding refund or replacement within 15 days.',
        'File an online consumer complaint via E-Daakhil (edaakhil.nic.in) before District Consumer Commission.',
        'Claim reimbursement of product cost, compensation for mental agony, and litigation expenses.'
      ];
      break;

    case 'pwdva-2005':
      followUpQuestions = [
        'Are you and any children currently in immediate physical safety and shelter?',
        'Do you require an urgent ex-parte Protection Order (restraining violence or communication)?',
        'Has there been an attempt to unlawfully dispossess or evict you from the shared household?',
        'Have you contacted the District Protection Officer, local Sakhi Centre, or Women Helpline 181?'
      ];
      evidenceToPreserve = {
        documents: ['Marriage registration certificate, photographs, or family ration card', 'Earlier police complaints or NCR receipts if previously reported'],
        digital: ['Abusive WhatsApp chats, threatening voice notes, or call logs', 'Photographs and videos documenting physical injuries or damaged belongings'],
        financial: ['Hospital medico-legal case (MLC) records, doctor prescription slips, and bills', 'Details of shared household rent or stridhan items withheld'],
        witnesses: ['Neighbors, relatives, doctors, or protection service providers']
      };
      possibleNextSteps = [
        'If in immediate danger, dial 112 (Emergency) or 181 (Women Helpline) for police protection and shelter.',
        'Approach the District Protection Officer to prepare a Domestic Incident Report (DIR).',
        'File an application under Section 12 PWDVA before the Judicial Magistrate for Protection and Residence Orders.',
        'Seek interim maintenance (Sec 20) and compensation (Sec 22) during pendency of proceedings.'
      ];
      break;

    case 'bnss-175':
    case 'bnss-173':
      followUpQuestions = [
        'Which police station did you approach, and on what date was the complaint presented?',
        'Did the Station House Officer (SHO) provide an entry receipt or General Diary (GD) number?',
        'Is the crime cognizable (e.g. assault, theft, cheating, cyber fraud, molestation)?',
        'Have you prepared a written copy of the complaint with date and time of refusal?'
      ];
      evidenceToPreserve = {
        documents: ['Copy of signed written complaint submitted to the police station', 'Postal receipt and delivery confirmation of complaint sent to the Superintendent of Police (SP/DCP)'],
        digital: ['CCTV footage or recordings showing your visit to the police station', 'Text messages, emails, or call logs concerning the incident'],
        financial: ['Bank or property records related to the underlying crime'],
        witnesses: ['Individuals who accompanied you to the police station']
      };
      possibleNextSteps = [
        'Send the written complaint by Registered Post to the Superintendent of Police (SP/DCP) under Section 175(3) BNSS.',
        'If unresolved after reasonable time, file an application under Section 175(4) BNSS before the Judicial Magistrate.',
        'Attach an affidavit confirming submission to SHO and SP.',
        'Magistrate can order registration of FIR and monitor police investigation report.'
      ];
      break;

    case 'bns-303':
      followUpQuestions = [
        'Where and when was your property removed from your possession?',
        'Do you have purchase bills, IMEI numbers (for electronics), or RC book (for vehicles)?',
        'Have you reported the incident to the police station having territorial jurisdiction?',
        'Are there public or private CCTV cameras located around the scene of theft?'
      ];
      evidenceToPreserve = {
        documents: ['Purchase invoices, registration certificates (RC), or IMEI bar codes', 'Copy of FIR registered under Section 303 BNS'],
        digital: ['CCTV camera footage showing movement or suspicious persons', 'Location history / find-my-device tracking logs'],
        financial: ['Insurance policy document to claim theft compensation'],
        witnesses: ['Eyewitnesses, building security guards, or shopkeepers nearby']
      };
      possibleNextSteps = [
        'Report to the nearest police station immediately to register an FIR under Section 303 BNS (Zero FIR if elsewhere).',
        'For stolen mobiles, block the IMEI number on the CEIR portal (ceir.gov.in).',
        'Notify your insurance provider within statutory policy window with FIR copy.',
        'Preserve CCTV footage before the recording buffer overwrites.'
      ];
      break;

    case 'bns-351':
      followUpQuestions = [
        'What was the exact wording or nature of the threat (death, bodily injury, property damage)?',
        'Was the threat issued in person, over a phone call, or via digital messaging?',
        'Is there immediate danger to your physical safety or family members?',
        'Have you previously had any disputes or litigation with the accused person?'
      ];
      evidenceToPreserve = {
        documents: ['Written record of date, time, and exact statements made during threats', 'Written complaint submitted to police requesting protection'],
        digital: ['Call recordings, voicemail, SMS, or WhatsApp audio clips containing the threats', 'Call history and caller ID screenshots'],
        financial: ['Any extortion or money demands mentioned in the threat'],
        witnesses: ['Persons who heard the call on speaker or witnessed the verbal confrontation']
      };
      possibleNextSteps = [
        'If facing immediate threat to life, call 112 immediately.',
        'Lodge a formal complaint at the local police station under Section 351 BNS.',
        'If threat involves death or grievous hurt (Sec 351(2) BNS, up to 7 years), demand FIR registration.',
        'Seek protective injunction from civil court if threats relate to property or eviction.'
      ];
      break;

    case 'property-injunction':
      followUpQuestions = [
        'Do you hold registered title deeds, sale deeds, and updated mutation/khata records?',
        'When did the opposing party first attempt to encroach or disturb peaceful possession?',
        'Have you had a formal survey conducted by government taluk/revenue surveyors?',
        'Has any criminal trespass complaint (Section 329 BNS) been lodged with local police?'
      ];
      evidenceToPreserve = {
        documents: ['Registered Sale Deed / Gift Deed and chain parent documents', 'Updated Patta, Khata certificate, and latest property tax receipts', 'Government survey sketch, demarcation report, and building sanction plan'],
        digital: ['Date-stamped photographs and videos of the encroachment and boundary markers', 'Drone or CCTV footage of illegal construction work'],
        financial: ['Receipts of tax payments and utility connections in your name'],
        witnesses: ['Adjacent land owners, village administrative officer (VAO), or revenue patwari']
      };
      possibleNextSteps = [
        'File an urgent Suit for Permanent Injunction and Possession in the jurisdictional Civil Court.',
        'File an Interim Application under Order XXXIX Rules 1 & 2 CPC for an immediate ex-parte temporary injunction ("Stay Order").',
        'Lodge a written complaint with the local police station for Criminal Trespass under Section 329 BNS.',
        'Submit an urgent representation to the local municipal or revenue authority to halt unapproved construction.'
      ];
      break;

    case 'mva-166':
      followUpQuestions = [
        'When and where did the accident take place, and which vehicles were involved?',
        'Has the jurisdictional police station registered an FIR and filed the Detailed Accident Report (DAR)?',
        'Did the accident occur within the last 6 months (strict limitation under Section 166(3) MVA)?',
        'Do you have the offending vehicle registration number and third-party insurance policy details?'
      ];
      evidenceToPreserve = {
        documents: ['Copy of FIR, Charge Sheet, and Site Map (Site Panchnama)', 'Detailed Accident Report (DAR) filed by police in MACT', 'Post-mortem report / Medico-legal Case (MLC) certificate'],
        digital: ['Photographs of vehicular damage, skid marks, and accident spot', 'Dashcam or street CCTV video footage'],
        financial: ['All hospital treatment bills, pharmacy receipts, and disability assessment certificates', 'Proof of income (salary slips, ITR) to compute compensation multiplier'],
        witnesses: ['Eye witnesses named in the police panchnama']
      };
      possibleNextSteps = [
        'Ensure the claim petition is filed before MACT strictly within 6 months of accident date.',
        'Obtain the certified copy of DAR from the investigating police officer.',
        'File MACT Claim Petition under Section 166 of Motor Vehicles Act at the District Claims Tribunal.',
        'Claim interim compensation under Section 164 (No Fault Liability) if applicable.'
      ];
      break;

    default:
      followUpQuestions = [
        `What is the exact date or time frame when this ${determinedCategory.toLowerCase()} incident occurred?`,
        'Which Indian State and District did this event take place in?',
        'Do you have any written agreements, invoices, receipts, or chat logs relating to the dispute?',
        'Have you already issued a written notice, letter, or registered complaint to the opposing party?'
      ];
      possibleNextSteps = [
        'Preserve and organize all relevant documents and electronic evidence without altering timestamps.',
        'Prepare a clear chronological timeline of events and communications.',
        'Send a formal written demand or legal notice via registered post / speed post through an advocate.',
        `Approach the appropriate forum (${matchedLaw.relevantForums[0] || 'Jurisdictional Court'}).`,
        'Consult a licensed advocate to formalize your legal petition.'
      ];
      break;
  }

  // 3. Multilingual synthesis
  const snippet = userQuery.trim().slice(0, 80);
  let understanding = `From what you have described regarding "${snippet}...", your issue relates to ${determinedCategory} under Indian law, specifically governed by ${matchedLaw.act}${matchedLaw.section ? ` (${matchedLaw.section})` : ''}.`;
  let lawExplanation = `${matchedLaw.simpleExplanation} ${matchedLaw.fullProvisionsSummary}`;
  let urgencyAndTimeLimits = matchedLaw.limitationPeriod || 'Statutory limitation period applies. Verify the current limitation window under the Limitation Act, 1963 with an advocate.';
  let importantWarning = 'Important: This is structured legal information generated by the Indian Legal RAG knowledge base. Consult a licensed advocate before initiating judicial proceedings.';
  let casePreparationOffer = 'Would you like me to prepare a structured Case Preparation Report from the details you have provided?';
  let simpleLanguageSummary = explainLikeNew
    ? `In plain words: You may have a legitimate legal right to seek a remedy under ${matchedLaw.act}. Make sure you keep your documents safe and don't delay reaching out to the right authority.`
    : undefined;

  if (isHindi) {
    understanding = `आपके विवरण के अनुसार ("${snippet}..."), आपका मामला भारतीय कानून के तहत ${determinedCategory} से संबंधित है, जो मुख्य रूप से ${matchedLaw.act}${matchedLaw.section ? ` (${matchedLaw.section})` : ''} के अंतर्गत आता है।`;
    lawExplanation = `${matchedLaw.simpleExplanation}। कानून के अनुसार पीड़ित पक्ष को सक्षम न्यायालय अथवा प्राधिकारी के समक्ष विधिक उपचार मांगने का अधिकार है।`;
    urgencyAndTimeLimits = matchedLaw.limitationPeriod ? `समय सीमा (Limitation): ${matchedLaw.limitationPeriod}` : 'कानूनी मामलों में निश्चित समय-सीमा (Limitation Period) लागू होती है। समय बीतने से पूर्व वकील से परामर्श लें।';
    importantWarning = 'महत्वपूर्ण चेतावनी: यह केवल सामान्य कानूनी जागरूकता है। विभिन्न राज्यों में प्रक्रियाएं भिन्न हो सकती हैं। न्यायालय में जाने से पूर्व किसी योग्य अधिवक्ता से परामर्श अवश्य लें।';
    casePreparationOffer = 'क्या आप चाहेंगे कि मैं आपके द्वारा दी गई जानकारी से एक औपचारिक केस तैयारी रिपोर्ट (Case Preparation Report) तैयार करूँ?';
    simpleLanguageSummary = explainLikeNew
      ? `सरल शब्दों में: ${matchedLaw.act} के तहत आपको कानूनी अधिकार प्राप्त हो सकता है। अपने सभी सबूतों को संभाल कर रखें और देरी न करें।`
      : undefined;
  } else if (isTamil) {
    understanding = `நீங்கள் விவரித்த தகவலின்படி ("${snippet}..."), உங்கள் பிரச்சனை ${determinedCategory} சட்டப் பிரிவின் கீழ் வருகிறது (${matchedLaw.act}).`;
    casePreparationOffer = 'நீங்கள் வழங்கிய தகவல்களைக் கொண்டு வழக்கு தயாரிப்பு அறிக்கையை உருவாக்க விரும்புகிறீர்களா?';
  } else if (isTelugu) {
    understanding = `మీరు అందించిన వివరాల ప్రకారం ("${snippet}..."), మీ సమస్య ${determinedCategory} పరిధిలోకి వస్తుంది (${matchedLaw.act}).`;
    casePreparationOffer = 'మీరు అందించిన సమాచారంతో పూర్తి కేస్ ప్రిపరేషన్ రిపోర్ట్‌ను సిద్ధం చేయమంటారా?';
  }

  return {
    understanding,
    category: determinedCategory,
    relevantLaws: [
      {
        act: matchedLaw.act,
        section: matchedLaw.section,
        status: matchedLaw.currentStatus,
        explanation: matchedLaw.simpleExplanation,
        verificationStatus: matchedLaw.confidence
      },
      ...(matchedLaw.oldEquivalent
        ? [
            {
              act: matchedLaw.oldEquivalent,
              section: undefined,
              status: 'Historical Reference' as const,
              explanation: isHindi ? 'पूर्ववर्ती कानूनी प्रावधान जो नए कानून से पूर्व लागू था।' : 'Former statutory provision applicable before recent legal reforms.',
              verificationStatus: 'Verified' as const
            }
          ]
        : [])
    ],
    lawExplanation,
    followUpQuestions,
    evidenceToPreserve,
    possibleNextSteps,
    possibleForum: matchedLaw.relevantForums,
    urgencyAndTimeLimits,
    importantWarning,
    casePreparationOffer,
    sources: [
      {
        title: matchedLaw.title,
        act: matchedLaw.act,
        section: matchedLaw.section,
        url: matchedLaw.sourceUrl,
        verifiedDate: matchedLaw.verifiedDate
      }
    ],
    emergency,
    simpleLanguageSummary,
    ragInspection,
    engineMode: 'deterministic_rag',
    engineNote: 'Running via Local Indian Legal RAG Engine. Set GEMINI_API_KEY in your local .env to enable full Gemini AI generation.'
  };
}

export interface RagAskResponse {
  answer: string;
  query: string;
  retrievedChunks: any[];
  ragInspection: RagInspectionData;
  citedProvisions: { act: string; section?: string; title: string; relevance: number }[];
  keyActions: string[];
}

export async function askRagQuestion(
  query: string,
  options: { topK?: number; category?: string; method?: 'hybrid' | 'vector' | 'lexical'; preferredLanguage?: string } = {}
): Promise<RagAskResponse> {
  const topK = options.topK || 4;
  const method = options.method || 'hybrid';
  const preferredLanguage = options.preferredLanguage || 'English';
  const ragInspection = await ragVectorStore.search(query, { topK, category: options.category, method });

  const citedProvisions = ragInspection.retrievedChunks.map(rc => ({
    act: rc.chunk.act,
    section: rc.chunk.section,
    title: rc.chunk.title,
    relevance: Math.round(rc.score * 100)
  }));

  if (ai) {
    try {
      const systemInstruction = `
You are NyayaSahayak's Grounded RAG Assistant for Indian Law.
Your mission is to provide an authoritative, fact-checked response grounded SOLELY in the retrieved legal document chunks provided below.

Rules:
1. Ground every legal claim in the statutory chunks provided in context.
2. Explicitly cite the Acts, Sections, and statutory chapters (e.g. "Section 318 of Bharatiya Nyaya Sanhita, 2023").
3. Distinguish between current Indian legislation (BNS 2023, BNSS 2023, BSA 2023, Consumer Protection Act 2019, IT Act 2000, RERA 2016) and older historical codes where relevant.
4. Give actionable next steps, jurisdictional forums, and evidence preservation guidelines.
5. If the user specifies or selects ${preferredLanguage}, formulate your answer in ${preferredLanguage}.
`;

      const prompt = `
USER QUERY: "${query}"

RETRIEVED STATUTORY CONTEXT FROM NYAYASAHAYAK VECTOR DATABASE:
${ragInspection.contextPromptConstructed}

Return a valid JSON object with:
{
  "answer": "Clear, grounded legal explanation citing the retrieved acts and sections directly. Structured with paragraphs.",
  "keyActions": [
    "Preserve electronic and physical evidence",
    "Identify competent forum",
    "Prepare formal demand or legal notice"
  ]
}
`;

      const rawText = await callGeminiGenerate(
        prompt,
        { responseMimeType: 'application/json' },
        systemInstruction
      );

      if (rawText) {
        const parsed = JSON.parse(rawText);
        return {
          answer: parsed.answer || 'Information retrieved based on authoritative statutory provisions.',
          query,
          retrievedChunks: ragInspection.retrievedChunks,
          ragInspection,
          citedProvisions,
          keyActions: parsed.keyActions || [
            'Preserve all relevant documentary and digital evidence without alterations.',
            'Identify the appropriate jurisdictional court or authority before limitation expires.',
            'Engage a qualified advocate to issue a statutory demand notice.'
          ]
        };
      }
    } catch {
      // Fall through cleanly to structured deterministic RAG synthesis
    }
  }

  // Structured deterministic RAG synthesis
  const topChunk = ragInspection.retrievedChunks[0]?.chunk;
  let answer = '';
  if (topChunk) {
    answer = `Based on the retrieved statutory sources in NyayaSahayak's Indian Legal RAG Knowledge Base (Relevance: ${(ragInspection.retrievedChunks[0].score * 100).toFixed(1)}%), this matter is governed by ${topChunk.act}${topChunk.section ? ' (' + topChunk.section + ')' : ''}: "${topChunk.title}".\n\n` +
      `Summary of Legal Position:\n${topChunk.simpleExplanation}\n\n` +
      `Statutory Provisions & Scope:\n${topChunk.text.slice(0, 350)}...\n\n` +
      `Remedies & Penalties:\n${topChunk.remediesOrPenalties}\n\n` +
      `Competent Forums / Authorities:\n${topChunk.relevantForums.join(', ')}\n\n` +
      (topChunk.limitationPeriod ? `Limitation Period:\n${topChunk.limitationPeriod}\n\n` : '') +
      (topChunk.oldEquivalent ? `Historical Law Predecessor:\n${topChunk.oldEquivalent}` : '');
  } else {
    answer = `No specific statutory chunk reached the similarity threshold for query "${query}". Please check the general Civil/Criminal provisions.`;
  }

  return {
    answer,
    query,
    retrievedChunks: ragInspection.retrievedChunks,
    ragInspection,
    citedProvisions,
    keyActions: [
      'Preserve and catalog all evidence (receipts, notices, chats).',
      `Approach the competent forum: ${topChunk?.relevantForums?.[0] || 'District Court / Police Station'}.`,
      'Obtain legal advice from an advocate to verify limitation periods.'
    ]
  };
}

export async function analyzeLegalDocument(documentText: string, documentName: string = 'Uploaded Document') {
  if (ai) {
    try {
      const prompt = `
Analyze the following Indian legal document text.
Document Title/Filename: "${documentName}"
Text:
"""
${documentText.slice(0, 15000)}
"""

Provide a comprehensive, objective analysis strictly formatted as JSON:
{
  "documentType": "Type of document (e.g. Legal Notice, Residential Rental Agreement, Employment Agreement, Police FIR, Consumer Complaint, Promissory Note, Court Summons)",
  "summary": "Clear executive summary of the document in 3-4 sentences",
  "partiesInvolved": [
    {"name": "Party Name", "role": "Role e.g. Landlord/Tenant, Complainant/Accused, Employer/Employee", "obligations": "Key duties"}
  ],
  "criticalDatesAndDeadlines": [
    {"dateOrPeriod": "e.g. Within 15 days of receipt", "significance": "Why this deadline matters"}
  ],
  "keyClausesAndProvisions": [
    {"clauseTitle": "Title", "contentSummary": "Summary", "implication": "What this means for the user"}
  ],
  "difficultLegalTerms": [
    {"term": "Legal Term e.g. Indefeasible, Force Majeure, Ex-Parte, Liquidated Damages", "explanation": "Simple everyday definition"}
  ],
  "highRiskClausesOrRedFlags": [
    "Any clause that is one-sided, unfair, forfeiture-heavy, or legally questionable"
  ],
  "questionsToAskALawyer": [
    "Specific questions the user should take to an advocate regarding this document"
  ],
  "missingInformation": [
    "Missing elements like signature, stamp duty, date, schedule of property, or arbitration seat"
  ],
  "educationalDisclaimer": "This analysis is informational and does not determine legal validity or constitute formal legal opinion."
}
`;

      const rawText = await callGeminiGenerate(
        prompt,
        { responseMimeType: 'application/json' }
      );

      if (rawText) {
        return JSON.parse(rawText);
      }
    } catch {
      // Graceful fallback to deterministic document analysis
    }
  }

  // Deterministic Fallback Document Analysis
  const isNotice = documentText.toLowerCase().includes('notice') || documentText.toLowerCase().includes('advocate');
  const isAgreement = documentText.toLowerCase().includes('agreement') || documentText.toLowerCase().includes('lessor') || documentText.toLowerCase().includes('tenant');
  const isFIR = documentText.toLowerCase().includes('fir') || documentText.toLowerCase().includes('police') || documentText.toLowerCase().includes('complainant');

  const docType = isNotice ? 'Legal Demand Notice' : isAgreement ? 'Agreement / Contract' : isFIR ? 'Police Information / FIR' : 'Legal Correspondence';

  return {
    documentType: docType,
    summary: `This document appears to be a ${docType}. It outlines terms, demands, or statements between the parties.`,
    partiesInvolved: [
      { name: 'Issuing / First Party', role: 'Claimant / Sender', obligations: 'Asserting claims or contractual terms' },
      { name: 'Recipient / Second Party', role: 'Respondent / Recipient', obligations: 'Review obligations and reply within designated timeframe' }
    ],
    criticalDatesAndDeadlines: [
      { dateOrPeriod: 'Typically 15 to 30 days', significance: 'Standard notice response or dispute resolution window under Indian procedure' }
    ],
    keyClausesAndProvisions: [
      { clauseTitle: 'Subject Matter of Dispute', contentSummary: 'States the background facts and alleged violation.', implication: 'Sets the foundational record for future court filings.' }
    ],
    difficultLegalTerms: [
      { term: 'Without Prejudice', explanation: 'Statements made without conceding any liability or waiving legal rights.' },
      { term: 'Cause of Action', explanation: 'The set of facts that gives a person the legal right to seek judicial remedy.' }
    ],
    highRiskClausesOrRedFlags: [
      'Check whether the timeline given for reply is unusually short (e.g. 7 days).',
      'Verify if any unilateral penalty or forfeiture clause is invoked.'
    ],
    questionsToAskALawyer: [
      'Is a formal reply notice legally mandatory within the stated period?',
      'Does this document contain any admissions that could harm my legal defense?',
      'What are the chances of settling this dispute through mutual mediation?'
    ],
    missingInformation: [
      'Verify whether proper postal tracking receipts or date of service are recorded.',
      'Check whether the document is supported by requisite Indian Stamp Duty where required by state law.'
    ],
    educationalDisclaimer: 'This analysis is informational and does not determine legal validity or constitute formal legal opinion.'
  };
}

export async function generateCasePreparationReport(caseData: {
  title: string;
  category: string;
  userRole: string;
  opposingParty: string;
  state: string;
  district?: string;
  dateOfIncident: string;
  facts: string[];
  parties: { name: string; role: string; details: string }[];
  timeline: { date: string; event: string }[];
  evidence: { name: string; type: string; description: string }[];
  desiredOutcome?: string;
}) {
  const relevantSources = searchLegalSources(caseData.category + ' ' + caseData.facts.join(' '));

  if (ai) {
    try {
      const prompt = `
Create a comprehensive, production-grade Case Preparation Report for an Indian citizen preparing to consult an advocate or approach an authority.
Adhere strictly to Section 7 of NyayaSahayak specifications.

Case Details:
- Title: ${caseData.title}
- Category: ${caseData.category}
- User Role: ${caseData.userRole || 'Complainant / Aggrieved Party'}
- Opposing Party: ${caseData.opposingParty || 'Opposing Party'}
- State & District: ${caseData.state || 'Not specified'}, ${caseData.district || 'Not specified'}
- Date of Incident: ${caseData.dateOfIncident || 'Not specified'}
- Desired Outcome: ${caseData.desiredOutcome || 'Legal remedy and compensation/refund'}
- Facts: ${JSON.stringify(caseData.facts)}
- Parties: ${JSON.stringify(caseData.parties)}
- Timeline: ${JSON.stringify(caseData.timeline)}
- Evidence Listed: ${JSON.stringify(caseData.evidence)}

Retrieved Relevant Statutory Knowledge:
${relevantSources.map(s => `${s.act} (${s.section || ''}): ${s.title} - ${s.simpleExplanation}`).join('\n')}

Format as JSON:
{
  "caseSummary": {
    "title": "${caseData.title}",
    "userRole": "${caseData.userRole || 'Complainant'}",
    "opposingParty": "${caseData.opposingParty || 'Not provided'}",
    "category": "${caseData.category}",
    "location": "${caseData.state || 'India'}",
    "incidentDate": "${caseData.dateOfIncident || 'Not provided'}",
    "currentStatus": "Case Preparation / Pre-Litigation"
  },
  "factsOfTheCase": [
    "Chronological fact statement without inventing facts. Use 'Not provided' for missing details."
  ],
  "partiesInvolved": [
    {"name": "...", "role": "...", "details": "..."}
  ],
  "importantDates": [
    {"date": "...", "event": "..."}
  ],
  "legalIssues": [
    "Whether the conduct violated applicable statutory provisions...",
    "Whether a civil remedy or criminal complaint is warranted...",
    "Which forum possesses pecuniary and territorial jurisdiction..."
  ],
  "possiblyRelevantLaws": [
    {
      "name": "Act Name (BNS 2023, BNSS 2023, Consumer Protection Act 2019, etc.)",
      "provision": "Section if confidently identified",
      "simpleExplanation": "Plain-English explanation",
      "whyRelevant": "Why it applies to the user's facts",
      "verificationStatus": "Verified or Likely Relevant"
    }
  ],
  "evidenceChecklist": {
    "documents": ["Agreements, bills, notices, vouchers"],
    "digital": ["WhatsApp, email, call records (Section 63 BSA certificate needed)"],
    "financial": ["Bank statements, payment slips, UPI vouchers"],
    "witnesses": ["Witness list with relationship and statement summary"]
  },
  "missingInformation": [
    "Information user still needs to collect or confirm"
  ],
  "possibleLegalRoutes": [
    {"route": "Route A: Informal Resolution / Amicable Settlement", "explanation": "..."},
    {"route": "Route B: Statutory Legal Demand Notice", "explanation": "..."},
    {"route": "Route C: Administrative / Police / Tribunal Complaint", "explanation": "..."},
    {"route": "Route D: Civil / Criminal Court Proceedings", "explanation": "..."},
    {"route": "Route E: Alternative Dispute Resolution (Mediation / Lok Adalat)", "explanation": "..."}
  ],
  "possibleForum": {
    "recommendedForums": ["..."],
    "jurisdictionCaveat": "Jurisdiction depends on pecuniary value, territorial cause of action, and state statutes."
  },
  "actionPlan": [
    "1. Preserve all electronic records and apply for Section 63 BSA certificate if needed.",
    "2. Compile verified chronological timeline.",
    "3. Issue statutory notice through advocate.",
    "4. Approach appropriate forum."
  ],
  "questionsToAskALawyer": [
    "Personalized questions for the advocate"
  ],
  "disclaimer": "This Case Preparation Report is generated for organizational and informational purposes. It does not constitute legal representation or legal advice. All facts and legal provisions must be verified with a practicing advocate."
}
`;

      const rawText = await callGeminiGenerate(
        prompt,
        { responseMimeType: 'application/json' }
      );

      if (rawText) {
        return JSON.parse(rawText);
      }
    } catch {
      // Graceful fallback to deterministic report generator
    }
  }

  // Fallback Case Preparation Report generator
  const primarySource = relevantSources[0] || INDIAN_LEGAL_DATABASE[0];

  return {
    caseSummary: {
      title: caseData.title || 'Legal Matter Assessment',
      userRole: caseData.userRole || 'Aggrieved Party / Complainant',
      opposingParty: caseData.opposingParty || 'Opposing Party (Not provided)',
      category: caseData.category || 'General Civil/Criminal Matter',
      location: caseData.state ? `${caseData.district ? caseData.district + ', ' : ''}${caseData.state}` : 'Not provided',
      incidentDate: caseData.dateOfIncident || 'Not provided',
      currentStatus: 'Case Preparation / Pre-Litigation Stage'
    },
    factsOfTheCase: caseData.facts.length > 0 ? caseData.facts : ['User has documented an initial dispute concerning their legal rights under Indian law.'],
    partiesInvolved: caseData.parties.length > 0 ? caseData.parties : [
      { name: 'Complainant', role: 'Aggrieved Party', details: caseData.userRole || 'Initiating inquiry' },
      { name: caseData.opposingParty || 'Opposing Party', role: 'Respondent', details: 'Counterparty to the dispute' }
    ],
    importantDates: caseData.timeline.length > 0 ? caseData.timeline : [
      { date: caseData.dateOfIncident || 'Date not provided', event: 'Initial occurrence of dispute or transaction' }
    ],
    legalIssues: [
      `Whether the opposing party's conduct violates provisions of ${primarySource.act}.`,
      'Whether the matter falls under civil, consumer, labour, or criminal jurisdiction.',
      'What immediate procedural steps and limitation periods apply.'
    ],
    possiblyRelevantLaws: [
      {
        name: primarySource.act,
        provision: primarySource.section || 'General Provisions',
        simpleExplanation: primarySource.simpleExplanation,
        whyRelevant: `Appears directly applicable to ${caseData.category} disputes under Indian law.`,
        verificationStatus: primarySource.confidence
      }
    ],
    evidenceChecklist: {
      documents: caseData.evidence.filter(e => e.type === 'document').map(e => e.name).concat(['Written agreements, receipts, and invoices']),
      digital: caseData.evidence.filter(e => e.type === 'digital').map(e => e.name).concat(['WhatsApp chats, emails, and call recordings']),
      financial: caseData.evidence.filter(e => e.type === 'financial').map(e => e.name).concat(['Bank statements and UPI transaction proofs']),
      witnesses: caseData.evidence.filter(e => e.type === 'witness').map(e => e.name).concat(['Any person who was present during the transaction'])
    },
    missingInformation: [
      'Exact chronological dates of all notices or communications',
      'Certified bank passbook statements or audited invoices',
      'Territorial jurisdiction validation based on where the agreement was signed or cause of action arose'
    ],
    possibleLegalRoutes: [
      { route: 'Route A: Informal Resolution', explanation: 'Attempt written settlement or compromise.' },
      { route: 'Route B: Legal Notice', explanation: 'Send a formal statutory legal notice through an advocate giving 15 to 30 days.' },
      { route: 'Route C: Statutory Complaint', explanation: `File complaint before ${primarySource.relevantForums[0] || 'appropriate authority'}.` },
      { route: 'Route D: Court Proceedings', explanation: 'Initiate formal civil suit or criminal proceedings.' },
      { route: 'Route E: Alternative Dispute Resolution', explanation: 'Explore mediation or Lok Adalat for quick settlement.' }
    ],
    possibleForum: {
      recommendedForums: primarySource.relevantForums,
      jurisdictionCaveat: 'Jurisdiction depends on pecuniary limits and geographical location where cause of action arose.'
    },
    actionPlan: [
      '1. Preserve all electronic records and communication securely.',
      '2. Complete the factual chronological timeline.',
      '3. Gather all physical and digital evidence into a case binder.',
      '4. Send a formal legal notice if advised by an advocate.',
      '5. Approach the designated forum before limitation expires.'
    ],
    questionsToAskALawyer: [
      `Which exact statutory section under current law (${primarySource.act}) applies best?`,
      'What is the precise limitation deadline for instituting legal action?',
      'What are the realistic costs, court fees, and expected timeframe for this forum?',
      'Which piece of evidence is strongest in my case?'
    ],
    disclaimer: 'This Case Preparation Report is generated for informational and organizational purposes. It does not constitute legal representation or legal advice. All facts and legal provisions must be verified with a practicing advocate.'
  };
}
