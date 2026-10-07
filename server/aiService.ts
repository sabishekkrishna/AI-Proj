import { ai } from './geminiClient.ts';
import { searchLegalSources, INDIAN_LEGAL_DATABASE, LegalSourceItem } from './legalKnowledgeBase.ts';
import { ragVectorStore, RagInspectionData } from './ragEngine.ts';

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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
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
        ragInspection
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic Indian Legal RAG engine:', err);
    }
  }

  // Deterministic Fallback Engine (Runs whenever GEMINI_API_KEY is not set or network fails)
  const topSource = relevantSources[0] || INDIAN_LEGAL_DATABASE[0];
  const queryLower = userQuery.toLowerCase();

  let determinedCategory = topSource.category;
  if (queryLower.includes('salary') || queryLower.includes('employer') || queryLower.includes('job') || queryLower.includes('fired')) {
    determinedCategory = 'Employment/Labour';
  } else if (queryLower.includes('landlord') || queryLower.includes('deposit') || queryLower.includes('rent') || queryLower.includes('flat')) {
    determinedCategory = 'Rent/Tenancy';
  } else if (queryLower.includes('cheated') || queryLower.includes('scam') || queryLower.includes('upi') || queryLower.includes('cyber')) {
    determinedCategory = 'Cybercrime';
  } else if (queryLower.includes('product') || queryLower.includes('defective') || queryLower.includes('warranty') || queryLower.includes('flipkart') || queryLower.includes('amazon')) {
    determinedCategory = 'Consumer Protection';
  } else if (queryLower.includes('cheque') || queryLower.includes('bounced') || queryLower.includes('loan')) {
    determinedCategory = 'Banking/Financial Fraud';
  } else if (queryLower.includes('accident') || queryLower.includes('car') || queryLower.includes('bike') || queryLower.includes('mact')) {
    determinedCategory = 'Motor Vehicle/Accident';
  } else if (queryLower.includes('wife') || queryLower.includes('husband') || queryLower.includes('domestic') || queryLower.includes('beating')) {
    determinedCategory = 'Domestic Violence';
  } else if (queryLower.includes('land') || queryLower.includes('plot') || queryLower.includes('property') || queryLower.includes('encroach')) {
    determinedCategory = 'Property Law';
  } else if (queryLower.includes('police') || queryLower.includes('fir') || queryLower.includes('refuse')) {
    determinedCategory = 'Criminal Law';
  }

  const categorySources = INDIAN_LEGAL_DATABASE.filter(s => s.category === determinedCategory);
  const primaryLaw = categorySources[0] || topSource;

  const isHindi = preferredLanguage === 'Hindi';
  const isTamil = preferredLanguage === 'Tamil';
  const isTelugu = preferredLanguage === 'Telugu';

  let understanding = `From what you have described, your issue appears to involve ${determinedCategory.toLowerCase()} regarding "${userQuery.slice(0, 90)}...".`;
  let lawExplanation = primaryLaw.simpleExplanation + ' ' + primaryLaw.fullProvisionsSummary;
  let followUpQuestions = [
    'What is the exact date or time frame when this occurred?',
    'Which Indian State and District did this event take place in?',
    'Do you have any written agreements, invoices, receipts, or chat logs?',
    'Have you already issued a written notice, letter, or registered complaint?'
  ];
  let possibleNextSteps = [
    'Preserve and organize all relevant documents and electronic evidence.',
    'Prepare a clear chronological timeline of events.',
    'Send a formal written demand or legal notice via registered post / speed post.',
    `Approach the appropriate forum (${primaryLaw.relevantForums[0] || 'Jurisdictional Court'}).`,
    'Consult a licensed advocate to formalize your legal petition.'
  ];
  let urgencyAndTimeLimits = primaryLaw.limitationPeriod || 'Statutory limitation period applies. Verify the current limitation window under the Limitation Act, 1963 with an advocate.';
  let importantWarning = 'Important: This is general educational legal guidance. Procedures and state-specific amendments vary. Do not rely solely on automated summaries for court proceedings.';
  let casePreparationOffer = 'Would you like me to prepare a Case Preparation Report from the details you provided?';
  let simpleLanguageSummary = explainLikeNew
    ? `In plain words: You may have a legitimate legal right to seek a remedy under ${primaryLaw.act}. Make sure you keep your documents safe and don't delay reaching out to the right authority.`
    : undefined;

  if (isHindi) {
    understanding = `आपके विवरण के अनुसार, आपका मामला "${userQuery.slice(0, 70)}..." से संबंधित ${determinedCategory} (भारतीय कानून) के अंतर्गत आता है।`;
    lawExplanation = `${primaryLaw.simpleExplanation}। कानून के अनुसार पीड़ित पक्ष को सक्षम न्यायालय अथवा प्राधिकारी के समक्ष विधिक उपचार मांगने का अधिकार है।`;
    followUpQuestions = [
      'यह घटना अथवा विवाद किस निश्चित तिथि को प्रारंभ हुआ?',
      'यह मामला किस राज्य और जिले का है?',
      'क्या आपके पास लिखित अनुबंध, बैंक रसीद, व्हाट्सएप चैट अथवा ईमेल उपलब्ध हैं?',
      'क्या आपने दूसरी पार्टी को पहले कोई लिखित शिकायत अथवा कानूनी नोटिस भेजा है?'
    ];
    possibleNextSteps = [
      'सभी दस्तावेजी व डिजिटल साक्ष्य (व्हाट्सएप चैट, बैंक स्टेटमेंट) सुरक्षित करें।',
      'घटनाक्रम की एक स्पष्ट समय-सारिणी (Timeline) तैयार करें।',
      'वकील के माध्यम से एक औपचारिक कानूनी नोटिस (Legal Notice) भेजें।',
      `उचित कानूनी मंच (${primaryLaw.relevantForums[0] || 'संबंधित न्यायालय'}) में संपर्क करें।`,
      'योग्य अधिवक्ता से परामर्श लेकर औपचारिक याचिका प्रस्तुत करें।'
    ];
    urgencyAndTimeLimits = primaryLaw.limitationPeriod ? `समय सीमा (Limitation): ${primaryLaw.limitationPeriod}` : 'कानूनी मामलों में निश्चित समय-सीमा (Limitation Period) लागू होती है। समय बीतने से पूर्व वकील से परामर्श लें।';
    importantWarning = 'महत्वपूर्ण चेतावनी: यह केवल सामान्य कानूनी जागरूकता है। विभिन्न राज्यों में प्रक्रियाएं भिन्न हो सकती हैं। न्यायालय में जाने से पूर्व किसी योग्य अधिवक्ता से परामर्श अवश्य लें।';
    casePreparationOffer = 'क्या आप चाहेंगे कि मैं आपके द्वारा दी गई जानकारी से एक औपचारिक केस तैयारी रिपोर्ट (Case Preparation Report) तैयार करूँ?';
    simpleLanguageSummary = explainLikeNew
      ? `सरल शब्दों में: ${primaryLaw.act} के तहत आपको कानूनी अधिकार प्राप्त हो सकता है। अपने सभी सबूतों को संभाल कर रखें और देरी न करें।`
      : undefined;
  } else if (isTamil) {
    understanding = `நீங்கள் விவரித்த தகவலின்படி, உங்கள் பிரச்சனை "${userQuery.slice(0, 70)}..." தொடர்பான ${determinedCategory} சட்டப் பிரிவின் கீழ் வருகிறது.`;
    followUpQuestions = [
      'இந்த பிரச்சனை எந்த தேதியில் தொடங்கியது?',
      'எந்த மாநிலம் மற்றும் மாவட்டத்தில் இது நிகழ்ந்தது?',
      'உங்களிடம் ஒப்பந்தம், வங்கி ரசீது அல்லது வாட்ஸ்அப் உரையாடல் உள்ளதா?',
      'எதிர் தரப்பினருக்கு ஏற்கனவே எழுத்துப்பூர்வ கடிதம் அல்லது வக்கீல் நோட்டீஸ் அனுப்பியுள்ளீர்களா?'
    ];
    possibleNextSteps = [
      'அனைத்து ஆவணங்களையும் டிஜிட்டல் சான்றுகளையும் பாதுகாக்கவும்.',
      'சம்பவங்களின் காலவரிசையை (Timeline) தயார் செய்யவும்.',
      'வழக்கறிஞர் மூலம் அதிகாரப்பூர்வ சட்ட அறிவிப்பை (Legal Notice) அனுப்பவும்.',
      'தகுந்த நீதிமன்றம் அல்லது அதிகாரியை அணுகவும்.'
    ];
    importantWarning = 'முக்கிய எச்சரிக்கை: இது பொதுவான சட்ட வழிகாட்டல் மட்டுமே. நீதிமன்ற நடவடிக்கைகளுக்கு தகுதியான வழக்கறிஞரை அணுகவும்.';
    casePreparationOffer = 'நீங்கள் வழங்கிய தகவல்களைக் கொண்டு வழக்கு தயாரிப்பு அறிக்கையை உருவாக்க விரும்புகிறீர்களா?';
  } else if (isTelugu) {
    understanding = `మీరు వివరించిన వివరాల ప్రకారం, మీ సమస్య ${determinedCategory} పరిధిలోకి వస్తుంది.`;
    followUpQuestions = [
      'ఈ సమస్య ఏ తేదీన ప్రారంభమైంది?',
      'ఏ రాష్ట్రం మరియు జిల్లాలో జరిగింది?',
      'మీ వద్ద ఒప్పంద పత్రాలు, బ్యాంక్ రశీదులు లేదా చాట్ వివరాలు ఉన్నాయా?',
      'ఇంతకుముందు లీగల్ నోటీసు పంపించారా?'
    ];
    casePreparationOffer = 'మీరు అందించిన సమాచారంతో పూర్తి కేస్ ప్రిపరేషన్ రిపోర్ట్‌ను సిద్ధం చేయమంటారా?';
  }

  return {
    understanding,
    category: determinedCategory,
    relevantLaws: [
      {
        act: primaryLaw.act,
        section: primaryLaw.section,
        status: primaryLaw.currentStatus,
        explanation: isHindi ? primaryLaw.simpleExplanation : primaryLaw.simpleExplanation,
        verificationStatus: primaryLaw.confidence
      },
      ...(primaryLaw.oldEquivalent
        ? [
            {
              act: primaryLaw.oldEquivalent,
              section: undefined,
              status: 'Historical Reference' as const,
              explanation: isHindi ? 'पूर्ववर्ती कानूनी प्रावधान जो नए कानून से पूर्व लागू था।' : 'Former statutory provision applicable before recent reforms.',
              verificationStatus: 'Verified' as const
            }
          ]
        : [])
    ],
    lawExplanation,
    followUpQuestions,
    evidenceToPreserve: {
      documents: isHindi ? ['अनुबंध पत्र, रसीदें, बिल, या रजिस्टर्ड नोटिस'] : ['Formal agreements, contract letters, receipts, or registered notices'],
      digital: isHindi ? ['व्हाट्सएप व एसएमएस संदेश, ईमेल, और स्क्रीनशॉट'] : ['WhatsApp / SMS conversations, emails, and screenshots with timestamps'],
      financial: isHindi ? ['बैंक पासबुक प्रविष्टियां, खाता विवरण, व यूपीआई यूटीआर संख्याएं'] : ['Bank passbook entries, account statements, and UPI/NEFT transaction IDs'],
      witnesses: isHindi ? ['घटनास्थल अथवा लेन-देन के समय उपस्थित कोई भी सहकर्मी या गवाह'] : ['Any colleagues, family members, or witnesses present at the scene']
    },
    possibleNextSteps,
    possibleForum: primaryLaw.relevantForums,
    urgencyAndTimeLimits,
    importantWarning,
    casePreparationOffer,
    sources: [
      {
        title: primaryLaw.title,
        act: primaryLaw.act,
        section: primaryLaw.section,
        url: primaryLaw.sourceUrl,
        verifiedDate: primaryLaw.verifiedDate
      }
    ],
    emergency,
    simpleLanguageSummary,
    ragInspection
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
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
    } catch (err) {
      console.warn('Gemini RAG answer generation failed, using structured retrieval fallback:', err);
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return JSON.parse(response.text?.trim() || '{}');
    } catch (err) {
      console.warn('Gemini document analyzer fallback triggered:', err);
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return JSON.parse(response.text?.trim() || '{}');
    } catch (err) {
      console.warn('Gemini report generator fallback triggered:', err);
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
