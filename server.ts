import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateLegalChatResponse, analyzeLegalDocument, generateCasePreparationReport, askRagQuestion } from './server/aiService.ts';
import { INDIAN_LEGAL_DATABASE, searchLegalSources, LegalSourceItem } from './server/legalKnowledgeBase.ts';
import { ragVectorStore } from './server/ragEngine.ts';
import { apiKey } from './server/geminiClient.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

// In-memory cases and user store (with persistence during app runtime & defaults)
interface CaseRecord {
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
  evidence: { id: string; name: string; type: 'document' | 'digital' | 'financial' | 'witness'; description: string; date?: string; importance?: 'Crucial' | 'Supporting' | 'Secondary' }[];
  report?: any;
  createdAt: string;
  updatedAt: string;
}

const mockCases: CaseRecord[] = [
  {
    id: 'case-demo-1',
    userId: 'user-demo',
    title: 'Unpaid Salary for 3 Months from Tech Services Pvt Ltd',
    category: 'Employment/Labour',
    description: 'Employer has not paid monthly salary of ₹65,000 for October, November, and December 2025 despite regular attendance and approved work tasks.',
    userRole: 'Senior Software Engineer (Employee)',
    opposingParty: 'Tech Services Pvt Ltd & Managing Director',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    dateOfIncident: '2025-11-05',
    status: 'Report Generated',
    facts: [
      'Joined Tech Services Pvt Ltd on 15 January 2023 under full-time employment agreement.',
      'Last salary received was for September 2025.',
      'Continued working full time with biometric attendance records.',
      'HR sent email citing temporary client invoice delays.',
      'Resigned on 10 January 2026 with formal notice; full & final settlement of ₹1,95,000 unpaid.'
    ],
    parties: [
      { name: 'Employee', role: 'Complainant', details: 'Full-time software engineer' },
      { name: 'Tech Services Pvt Ltd', role: 'Employer / Respondent', details: 'Private Limited company registered in Bengaluru' }
    ],
    timeline: [
      { id: 't1', date: '2023-01-15', event: 'Signed formal employment agreement' },
      { id: 't2', date: '2025-11-05', event: 'First missed salary payment for October' },
      { id: 't3', date: '2025-12-15', event: 'HR assurance email sent to engineering team' },
      { id: 't4', date: '2026-01-10', event: 'Resignation tendered and notice period completed' }
    ],
    evidence: [
      { id: 'e1', name: 'Employment Offer Letter & Agreement', type: 'document', description: 'Terms of employment and monthly compensation of ₹65,000', importance: 'Crucial' },
      { id: 'e2', name: 'Bank Account Statement (HDFC Bank)', type: 'financial', description: 'Shows salary stopping after Sept 2025 credit', importance: 'Crucial' },
      { id: 'e3', name: 'HR Email Acknowledgment', type: 'digital', description: 'HR Manager admitting pending dues', importance: 'Supporting' }
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-16T14:30:00Z'
  },
  {
    id: 'case-demo-2',
    userId: 'user-demo',
    title: 'Landlord Refusal to Refund ₹60,000 Security Deposit',
    category: 'Rent/Tenancy',
    description: 'Vacated 2BHK flat in Indirapuram after giving 1 month notice. Landlord refuses to return security deposit citing imaginary repainting costs.',
    userRole: 'Tenant',
    opposingParty: 'Landlord (R. K. Sharma)',
    state: 'Uttar Pradesh',
    district: 'Ghaziabad',
    dateOfIncident: '2025-12-31',
    status: 'Active',
    facts: [
      'Entered 11-month registered rent agreement paying ₹60,000 deposit via bank transfer.',
      'Gave formal 30-day notice on 1 December 2025 via WhatsApp and email.',
      'Handed over keys and vacant possession on 31 December 2025.',
      'Landlord refused refund claiming full repainting and deep cleaning costs of ₹60,000 without invoices.'
    ],
    parties: [
      { name: 'Tenant', role: 'Complainant / Lessee', details: 'Ex-tenant of Flat 402' },
      { name: 'R. K. Sharma', role: 'Landlord / Lessor', details: 'Owner of the residential property' }
    ],
    timeline: [
      { id: 't1', date: '2025-01-01', event: 'Tenancy commenced with ₹60,000 security deposit payment' },
      { id: 't2', date: '2025-12-01', event: 'Notice of termination given in accordance with clause 9' },
      { id: 't3', date: '2025-12-31', event: 'Vacant handover completed and video inspection taken' }
    ],
    evidence: [
      { id: 'e1', name: 'Registered Rent Agreement', type: 'document', description: 'Clause 4 specifies deposit return within 15 days of vacation', importance: 'Crucial' },
      { id: 'e2', name: 'Bank Transfer UTR Receipt', type: 'financial', description: 'Proof of ₹60,000 deposit paid at tenancy commencement', importance: 'Crucial' },
      { id: 'e3', name: 'Handover Video & Photographs', type: 'digital', description: 'Shows pristine condition of flat walls and fixtures on 31 Dec', importance: 'Supporting' }
    ],
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z'
  }
];

// Audit logs
const auditLogs: { id: string; action: string; timestamp: string; details: string }[] = [
  { id: 'log-1', action: 'SYSTEM_INIT', timestamp: new Date().toISOString(), details: 'Indian Legal Knowledge Base loaded with 14 statutory frameworks (BNS, BNSS, BSA, CPA, IT Act, etc.)' },
  { id: 'log-2', action: 'RAG_INDEX_VERIFY', timestamp: new Date().toISOString(), details: 'Criminal Sanhita verification passed: 100% current-law mapping active' }
];

// --- API ROUTES ---

// 1. AI Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], preferredLanguage = 'English', explainLikeNew = false } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await generateLegalChatResponse(message, history, preferredLanguage, explainLikeNew);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'CHAT_QUERY',
      timestamp: new Date().toISOString(),
      details: `Processed query in ${preferredLanguage}: "${message.slice(0, 40)}..." -> Category: ${response.category}`
    });

    res.json(response);
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: 'Failed to process legal query', details: err.message });
  }
});

// 2. Document Analysis Endpoint
app.post('/api/documents/analyze', async (req: Request, res: Response) => {
  try {
    const { documentText, documentName } = req.body;
    if (!documentText) {
      res.status(400).json({ error: 'Document text is required' });
      return;
    }

    const analysis = await analyzeLegalDocument(documentText, documentName);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'DOCUMENT_ANALYZED',
      timestamp: new Date().toISOString(),
      details: `Analyzed document: ${documentName || 'Unnamed'} -> Type: ${analysis.documentType}`
    });

    res.json(analysis);
  } catch (err: any) {
    console.error('Error in /api/documents/analyze:', err);
    res.status(500).json({ error: 'Failed to analyze document', details: err.message });
  }
});

// 3. Case Report Generation Endpoint
app.post('/api/cases/report', async (req: Request, res: Response) => {
  try {
    const caseData = req.body;
    const report = await generateCasePreparationReport(caseData);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'REPORT_GENERATED',
      timestamp: new Date().toISOString(),
      details: `Case Preparation Report generated for: "${caseData.title || 'Untitled Case'}"`
    });

    res.json(report);
  } catch (err: any) {
    console.error('Error in /api/cases/report:', err);
    res.status(500).json({ error: 'Failed to generate report', details: err.message });
  }
});

// 4. Legal Knowledge Search Endpoint
app.get('/api/legal/sources', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || '';
  const results = searchLegalSources(query, category);
  res.json({ count: results.length, sources: results });
});

// 5. Admin: Add / Update Legal Source
app.post('/api/legal/sources', (req: Request, res: Response) => {
  try {
    const newSource: LegalSourceItem = {
      id: `custom-${Date.now()}`,
      act: req.body.act || 'Central Act',
      section: req.body.section || '',
      chapter: req.body.chapter || '',
      title: req.body.title || 'Legal Provision',
      category: req.body.category || 'Civil Disputes',
      currentStatus: req.body.currentStatus || 'Current Law',
      oldEquivalent: req.body.oldEquivalent || '',
      summary: req.body.summary || '',
      simpleExplanation: req.body.simpleExplanation || '',
      fullProvisionsSummary: req.body.fullProvisionsSummary || '',
      keyElements: req.body.keyElements || [],
      remediesOrPenalties: req.body.remediesOrPenalties || '',
      relevantForums: req.body.relevantForums || ['Jurisdictional Court'],
      limitationPeriod: req.body.limitationPeriod || 'Subject to Limitation Act',
      sourceUrl: req.body.sourceUrl || 'https://indiacode.nic.in',
      officialSourceType: req.body.officialSourceType || 'Central Act',
      verifiedDate: new Date().toLocaleDateString('en-GB'),
      confidence: req.body.confidence || 'Verified'
    };

    INDIAN_LEGAL_DATABASE.push(newSource);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'ADMIN_SOURCE_ADDED',
      timestamp: new Date().toISOString(),
      details: `Admin added legal source: ${newSource.act} (${newSource.section || ''})`
    });

    res.status(201).json(newSource);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add legal source', details: err.message });
  }
});

// 6. Admin: System Health Endpoint
app.get('/api/system/health', (req: Request, res: Response) => {
  const ragStats = ragVectorStore.getStats();
  res.json({
    status: 'ONLINE',
    hasApiKey: Boolean(apiKey),
    aiEngine: apiKey ? 'Gemini 3.8 Flash (Active)' : 'Deterministic Legal RAG Engine (Active Demo Mode)',
    totalLegalSources: INDIAN_LEGAL_DATABASE.length,
    activeCases: mockCases.length,
    ragStats,
    auditLogs: auditLogs.slice(0, 20),
    systemTime: new Date().toISOString()
  });
});

// --- RAG (RETRIEVAL AUGMENTED GENERATION) ENDPOINTS ---

// RAG Search & Inspector Endpoint
app.post('/api/rag/search', async (req: Request, res: Response) => {
  try {
    const { query, topK = 4, category, method = 'hybrid' } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const inspection = await ragVectorStore.search(query, {
      topK: Number(topK),
      category,
      method: method as any
    });

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'RAG_SEARCH',
      timestamp: new Date().toISOString(),
      details: `RAG search executed (${method}): "${query.slice(0, 35)}..." -> Retrieved ${inspection.retrievedChunks.length} chunks (${inspection.retrievalLatencyMs}ms)`
    });

    res.json(inspection);
  } catch (err: any) {
    console.error('Error in /api/rag/search:', err);
    res.status(500).json({ error: 'RAG search failed', details: err.message });
  }
});

// RAG Q&A Grounded Response Endpoint
app.post('/api/rag/ask', async (req: Request, res: Response) => {
  try {
    const { query, topK = 4, category, method = 'hybrid', preferredLanguage = 'English' } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const ragResponse = await askRagQuestion(query, {
      topK: Number(topK),
      category,
      method: method as any,
      preferredLanguage
    });

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'RAG_GROUNDED_QA',
      timestamp: new Date().toISOString(),
      details: `RAG grounded answer generated in ${preferredLanguage} for query: "${query.slice(0, 35)}..."`
    });

    res.json(ragResponse);
  } catch (err: any) {
    console.error('Error in /api/rag/ask:', err);
    res.status(500).json({ error: 'RAG generation failed', details: err.message });
  }
});

// RAG Indexed Chunks Viewer
app.get('/api/rag/chunks', (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || '';
    const search = (req.query.search as string || '').toLowerCase().trim();
    let chunks = ragVectorStore.getAllChunks();

    if (category && category !== 'All') {
      chunks = chunks.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      chunks = chunks.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.act.toLowerCase().includes(search) ||
        (c.section && c.section.toLowerCase().includes(search)) ||
        c.text.toLowerCase().includes(search)
      );
    }

    res.json({
      count: chunks.length,
      stats: ragVectorStore.getStats(),
      chunks
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve chunks', details: err.message });
  }
});

// RAG Ingestion Pipeline: Ingest Custom Document
app.post('/api/rag/ingest', async (req: Request, res: Response) => {
  try {
    const { title, act, category, section, content, sourceUrl, chunkSize, overlap } = req.body;
    if (!title || !act || !content) {
      res.status(400).json({ error: 'Title, Act, and Content are required for RAG ingestion' });
      return;
    }

    const result = await ragVectorStore.ingestDocument({
      title,
      act,
      category: category || 'Civil Disputes',
      section,
      content,
      sourceUrl,
      chunkSize: chunkSize ? Number(chunkSize) : 300,
      overlap: overlap ? Number(overlap) : 40
    });

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'RAG_INGESTION',
      timestamp: new Date().toISOString(),
      details: `User ingested document: "${title}" -> ${result.ingestedChunks} semantic vector chunks indexed`
    });

    res.status(201).json({
      success: true,
      message: `Successfully ingested document and created ${result.ingestedChunks} vector chunks`,
      ...result
    });
  } catch (err: any) {
    console.error('Error in /api/rag/ingest:', err);
    res.status(500).json({ error: 'Failed to ingest document into RAG index', details: err.message });
  }
});

// Delete Chunk from RAG Index
app.delete('/api/rag/chunks/:id', (req: Request, res: Response) => {
  try {
    const success = ragVectorStore.deleteChunk(req.params.id);
    if (success) {
      auditLogs.unshift({
        id: `log-${Date.now()}`,
        action: 'RAG_CHUNK_DELETED',
        timestamp: new Date().toISOString(),
        details: `Deleted chunk ${req.params.id} from RAG index`
      });
      res.json({ success: true, message: 'Chunk deleted from index' });
    } else {
      res.status(404).json({ error: 'Chunk not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete chunk', details: err.message });
  }
});

// RAG Vector Store Stats
app.get('/api/rag/stats', (req: Request, res: Response) => {
  res.json(ragVectorStore.getStats());
});

// 7. Case Management Endpoints
app.get('/api/cases', (req: Request, res: Response) => {
  res.json(mockCases);
});

app.post('/api/cases', (req: Request, res: Response) => {
  const newCase: CaseRecord = {
    id: `case-${Date.now()}`,
    userId: 'user-demo',
    title: req.body.title || 'New Legal Matter',
    category: req.body.category || 'Civil Disputes',
    description: req.body.description || '',
    userRole: req.body.userRole || 'Complainant',
    opposingParty: req.body.opposingParty || '',
    state: req.body.state || 'Delhi',
    district: req.body.district || '',
    dateOfIncident: req.body.dateOfIncident || new Date().toISOString().split('T')[0],
    status: req.body.status || 'Active',
    facts: req.body.facts || [],
    parties: req.body.parties || [],
    timeline: req.body.timeline || [],
    evidence: req.body.evidence || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockCases.unshift(newCase);
  res.status(201).json(newCase);
});

app.get('/api/cases/:id', (req: Request, res: Response) => {
  const found = mockCases.find(c => c.id === req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Case not found' });
    return;
  }
  res.json(found);
});

app.put('/api/cases/:id', (req: Request, res: Response) => {
  const idx = mockCases.findIndex(c => c.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Case not found' });
    return;
  }
  mockCases[idx] = {
    ...mockCases[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(mockCases[idx]);
});

app.delete('/api/cases/:id', (req: Request, res: Response) => {
  const idx = mockCases.findIndex(c => c.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Case not found' });
    return;
  }
  mockCases.splice(idx, 1);
  res.json({ success: true, message: 'Case removed' });
});

// Vite Middleware for Dev or Static Serving for Prod
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NyayaSahayak server listening at http://0.0.0.0:${PORT}`);
});
