import { StructuredChatResponse, CaseRecord, CasePreparationReport, DocumentAnalysisResult, LegalSourceItem } from '../types';

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
