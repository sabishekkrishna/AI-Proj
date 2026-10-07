import {
  StructuredChatResponse,
  CaseRecord,
  CasePreparationReport,
  DocumentAnalysisResult,
  LegalSourceItem,
  RagInspectionData,
  LegalChunk,
  RagSearchResult
} from '../types';

export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  preferredLanguage: string = 'English',
  explainLikeNew: boolean = false
): Promise<StructuredChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, preferredLanguage, explainLikeNew })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function analyzeDocumentApi(documentText: string, documentName: string): Promise<DocumentAnalysisResult> {
  const response = await fetch('/api/documents/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentText, documentName })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function generateCaseReportApi(caseData: Partial<CaseRecord>): Promise<CasePreparationReport> {
  const response = await fetch('/api/cases/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function fetchLegalSourcesApi(query: string = '', category: string = ''): Promise<{ count: number; sources: LegalSourceItem[] }> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (category && category !== 'All') params.append('category', category);

  const response = await fetch(`/api/legal/sources?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch legal sources');
  }
  return response.json();
}

export async function fetchCasesApi(): Promise<CaseRecord[]> {
  const response = await fetch('/api/cases');
  if (!response.ok) {
    throw new Error('Failed to fetch cases');
  }
  return response.json();
}

export async function createCaseApi(caseData: Partial<CaseRecord>): Promise<CaseRecord> {
  const response = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });

  if (!response.ok) {
    throw new Error('Failed to create case');
  }
  return response.json();
}

export async function updateCaseApi(caseId: string, caseData: Partial<CaseRecord>): Promise<CaseRecord> {
  const response = await fetch(`/api/cases/${caseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });

  if (!response.ok) {
    throw new Error('Failed to update case');
  }
  return response.json();
}

export async function deleteCaseApi(caseId: string): Promise<boolean> {
  const response = await fetch(`/api/cases/${caseId}`, {
    method: 'DELETE'
  });
  return response.ok;
}

export async function fetchSystemHealthApi(): Promise<any> {
  const response = await fetch('/api/system/health');
  if (!response.ok) {
    throw new Error('Failed to fetch system health');
  }
  return response.json();
}

export async function addCustomLegalSourceApi(source: Partial<LegalSourceItem>): Promise<LegalSourceItem> {
  const response = await fetch('/api/legal/sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(source)
  });

  if (!response.ok) {
    throw new Error('Failed to add custom legal source');
  }
  return response.json();
}

// --- RAG (RETRIEVAL AUGMENTED GENERATION) CLIENT API ---

export interface RagAskResult {
  answer: string;
  query: string;
  retrievedChunks: RagSearchResult[];
  ragInspection: RagInspectionData;
  citedProvisions: { act: string; section?: string; title: string; relevance: number }[];
  keyActions: string[];
}

export async function searchRagApi(
  query: string,
  options: { topK?: number; category?: string; method?: 'hybrid' | 'vector' | 'lexical' } = {}
): Promise<RagInspectionData> {
  const response = await fetch('/api/rag/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, ...options })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to execute RAG search');
  }
  return response.json();
}

export async function askRagApi(
  query: string,
  options: { topK?: number; category?: string; method?: 'hybrid' | 'vector' | 'lexical'; preferredLanguage?: string } = {}
): Promise<RagAskResult> {
  const response = await fetch('/api/rag/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, ...options })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate RAG answer');
  }
  return response.json();
}

export async function fetchRagChunksApi(
  category: string = '',
  search: string = ''
): Promise<{ count: number; stats: any; chunks: LegalChunk[] }> {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);

  const response = await fetch(`/api/rag/chunks?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch RAG chunks');
  }
  return response.json();
}

export async function ingestRagDocumentApi(payload: {
  title: string;
  act: string;
  category: string;
  section?: string;
  content: string;
  sourceUrl?: string;
  chunkSize?: number;
  overlap?: number;
}): Promise<{ success: boolean; message: string; ingestedChunks: number; chunks: LegalChunk[] }> {
  const response = await fetch('/api/rag/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to ingest document');
  }
  return response.json();
}

export async function deleteRagChunkApi(chunkId: string): Promise<boolean> {
  const response = await fetch(`/api/rag/chunks/${chunkId}`, {
    method: 'DELETE'
  });
  return response.ok;
}

export async function fetchRagStatsApi(): Promise<any> {
  const response = await fetch('/api/rag/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch RAG stats');
  }
  return response.json();
}
