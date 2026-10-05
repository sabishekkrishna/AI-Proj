export interface LegalSourceItem {
  id: string;
  act: string;
  section?: string;
  chapter?: string;
  title: string;
  category: string;
  currentStatus: 'Current Law' | 'Historical Reference' | 'Repealed' | 'Model Law';
  oldEquivalent?: string;
  summary: string;
  simpleExplanation: string;
  fullProvisionsSummary: string;
  keyElements: string[];
  remediesOrPenalties: string;
  relevantForums: string[];
  limitationPeriod?: string;
  sourceUrl: string;
  officialSourceType: 'Central Act' | 'Criminal Sanhita' | 'Statutory Regulation' | 'Constitution of India' | 'State Law';
  verifiedDate: string;
  confidence: 'Verified' | 'Likely Relevant' | 'Requires Verification';
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
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  structuredResponse?: StructuredChatResponse;
}

export interface CaseRecord {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  userRole: string;
  opposingParty: string;
  state: string;
  district: string;
  dateOfIncident: string;
  status: 'Draft' | 'Active' | 'Report Generated' | 'Resolved';
  facts: string[];
  parties: { name: string; role: string; details: string }[];
  timeline: { id: string; date: string; event: string; importance?: string }[];
  evidence: {
    id: string;
    name: string;
    type: 'document' | 'digital' | 'financial' | 'witness';
    description: string;
    date?: string;
    importance?: 'Crucial' | 'Supporting' | 'Secondary';
    fileName?: string;
    fileSize?: string;
    mimeType?: string;
    fileData?: string;
  }[];
  report?: CasePreparationReport;
  createdAt: string;
  updatedAt: string;
}

export interface CasePreparationReport {
  caseSummary: {
    title: string;
    userRole: string;
    opposingParty: string;
    category: string;
    location: string;
    incidentDate: string;
    currentStatus: string;
  };
  factsOfTheCase: string[];
  partiesInvolved: { name: string; role: string; details: string }[];
  importantDates: { date: string; event: string }[];
  legalIssues: string[];
  possiblyRelevantLaws: {
    name: string;
    provision?: string;
    simpleExplanation: string;
    whyRelevant: string;
    verificationStatus: string;
  }[];
  evidenceChecklist: {
    documents: string[];
    digital: string[];
    financial: string[];
    witnesses: string[];
  };
  missingInformation: string[];
  possibleLegalRoutes: { route: string; explanation: string }[];
  possibleForum: {
    recommendedForums: string[];
    jurisdictionCaveat: string;
  };
  actionPlan: string[];
  questionsToAskALawyer: string[];
  disclaimer: string;
}

export interface DocumentAnalysisResult {
  documentType: string;
  summary: string;
  partiesInvolved: { name: string; role: string; obligations: string }[];
  criticalDatesAndDeadlines: { dateOrPeriod: string; significance: string }[];
  keyClausesAndProvisions: { clauseTitle: string; contentSummary: string; implication: string }[];
  difficultLegalTerms: { term: string; explanation: string }[];
  highRiskClausesOrRedFlags: string[];
  questionsToAskALawyer: string[];
  missingInformation: string[];
  educationalDisclaimer: string;
}
