import { ai } from './geminiClient.ts';
import { INDIAN_LEGAL_DATABASE, LegalSourceItem } from './legalKnowledgeBase.ts';

export interface LegalChunk {
  id: string;
  documentId: string;
  act: string;
  section?: string;
  chapter?: string;
  title: string;
  category: string;
  text: string;
  summary: string;
  simpleExplanation: string;
  keyElements: string[];
  remediesOrPenalties: string;
  relevantForums: string[];
  limitationPeriod?: string;
  sourceUrl: string;
  officialSourceType: string;
  verifiedDate: string;
  confidence: 'Verified' | 'Likely Relevant' | 'Requires Verification';
  currentStatus?: string;
  oldEquivalent?: string;
  embedding?: number[];
  tokenCount: number;
  isCustom?: boolean;
}

export interface RagSearchResult {
  chunk: LegalChunk;
  score: number; // 0 to 1
  vectorScore: number;
  lexicalScore: number;
  matchReasons: string[];
}

export interface RagInspectionData {
  query: string;
  classifiedCategory: string;
  retrievalMethod: 'Hybrid (Dense Vector + BM25 Lexical)' | 'Dense Vector Search' | 'BM25 Lexical Search';
  embeddingModel: string;
  queryVectorDimensions: number;
  totalIndexedChunks: number;
  retrievalLatencyMs: number;
  retrievedChunks: RagSearchResult[];
  contextPromptConstructed: string;
}

// In-Memory Vector & Knowledge Store
class RagVectorStore {
  private chunks: LegalChunk[] = [];
  private vectorDimensions = 128; // Fallback semantic hash dimension
  private idfCache: Map<string, number> = new Map();

  constructor() {
    this.bootstrapIndex();
  }

  // Generate lightweight deterministic semantic embedding vector for fallback/offline
  public computeDeterministicEmbedding(text: string, dimensions: number = 128): number[] {
    const vector = new Array(dimensions).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const words = cleaned.split(/\s+/).filter(w => w.length > 1);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const index = Math.abs(hash) % dimensions;
      vector[index] += 1;

      // Also compute bi-gram for semantic context
      if (i > 0) {
        const bigram = `${words[i - 1]}_${word}`;
        let biHash = 0;
        for (let j = 0; j < bigram.length; j++) {
          biHash = (biHash << 5) - biHash + bigram.charCodeAt(j);
          biHash |= 0;
        }
        const biIndex = Math.abs(biHash) % dimensions;
        vector[biIndex] += 1.5;
      }
    }

    // L2 Normalize
    let norm = 0;
    for (let v of vector) norm += v * v;
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < dimensions; i++) {
        vector[i] /= norm;
      }
    }
    return vector;
  }

  // Compute embedding using Gemini embedding model if available, else deterministic
  public async getEmbedding(text: string): Promise<{ vector: number[]; model: string }> {
    if (ai) {
      try {
        const response = await ai.models.embedContent({
          model: 'gemini-embedding-2-preview',
          contents: text
        });
        const values = (response as any).embedding?.values || response.embeddings?.[0]?.values;
        if (values && values.length > 0) {
          return { vector: values, model: 'gemini-embedding-2-preview' };
        }
      } catch (err) {
        console.warn('Gemini embedding API call failed, falling back to local semantic vector index:', err);
      }
    }

    const vector = this.computeDeterministicEmbedding(text, this.vectorDimensions);
    return { vector, model: 'Nyaya-Semantic-Embedding (128d Hybrid)' };
  }

  // Calculate Cosine Similarity
  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  // BM25-style Lexical Score
  private computeLexicalScore(queryTokens: string[], chunk: LegalChunk): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const textLower = `${chunk.act} ${chunk.section || ''} ${chunk.title} ${chunk.category} ${chunk.text} ${chunk.keyElements.join(' ')} ${chunk.oldEquivalent || ''}`.toLowerCase();

    for (const token of queryTokens) {
      if (token.length < 3) continue;

      // Direct section match bonus
      if (chunk.section && chunk.section.toLowerCase().includes(token)) {
        score += 3.5;
        reasons.push(`Exact Section Match: "${token}" in ${chunk.section}`);
      }

      // Title/Act match bonus
      if (chunk.title.toLowerCase().includes(token) || chunk.act.toLowerCase().includes(token)) {
        score += 2.0;
        reasons.push(`Statute / Title Match: "${token}"`);
      }

      // Keyword occurrences
      const matches = (textLower.match(new RegExp(`\\b${token}\\b`, 'g')) || []).length;
      if (matches > 0) {
        score += Math.min(matches * 0.4, 2.0);
        if (!reasons.some(r => r.includes(token))) {
          reasons.push(`Keyword Match: "${token}" (${matches}x)`);
        }
      }
    }

    const normalizedScore = Math.min(score / (queryTokens.length * 2.5 || 1), 1.0);
    return { score: normalizedScore, reasons };
  }

  // Seed knowledge base into chunks
  private bootstrapIndex() {
    for (const item of INDIAN_LEGAL_DATABASE) {
      this.chunkAndIngestSeedItem(item);
    }
  }

  private chunkAndIngestSeedItem(item: LegalSourceItem) {
    const fullText = `${item.title}. ${item.summary} ${item.simpleExplanation} ${item.fullProvisionsSummary} Key Elements: ${item.keyElements.join(', ')}. Remedies: ${item.remediesOrPenalties}. For: ${item.relevantForums.join(', ')}. ${item.limitationPeriod ? `Limitation: ${item.limitationPeriod}.` : ''} ${item.oldEquivalent ? `Old Law: ${item.oldEquivalent}.` : ''}`;

    const chunk: LegalChunk = {
      id: `chunk-${item.id}`,
      documentId: item.id,
      act: item.act,
      section: item.section,
      chapter: item.chapter,
      title: item.title,
      category: item.category,
      text: fullText,
      summary: item.summary,
      simpleExplanation: item.simpleExplanation,
      keyElements: item.keyElements,
      remediesOrPenalties: item.remediesOrPenalties,
      relevantForums: item.relevantForums,
      limitationPeriod: item.limitationPeriod,
      sourceUrl: item.sourceUrl,
      officialSourceType: item.officialSourceType,
      verifiedDate: item.verifiedDate,
      confidence: item.confidence,
      oldEquivalent: item.oldEquivalent,
      embedding: this.computeDeterministicEmbedding(fullText, this.vectorDimensions),
      tokenCount: Math.round(fullText.split(/\s+/).length * 1.3),
      isCustom: false
    };

    this.chunks.push(chunk);
  }

  // Classify Query Category
  public classifyQueryCategory(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('salary') || q.includes('employer') || q.includes('work') || q.includes('wage') || q.includes('job') || q.includes('resign') || q.includes('fired')) return 'Employment/Labour';
    if (q.includes('deposit') || q.includes('rent') || q.includes('landlord') || q.includes('tenant') || q.includes('flat') || q.includes('lease') || q.includes('evict')) return 'Rent/Tenancy';
    if (q.includes('cyber') || q.includes('upi') || q.includes('hack') || q.includes('scam') || q.includes('phishing') || q.includes('otp') || q.includes('online fraud')) return 'Cybercrime';
    if (q.includes('defective') || q.includes('warranty') || q.includes('product') || q.includes('refund') || q.includes('consumer') || q.includes('amazon') || q.includes('flipkart')) return 'Consumer Protection';
    if (q.includes('cheque') || q.includes('bounce') || q.includes('loan') || q.includes('debt') || q.includes('bank') || q.includes('138')) return 'Banking/Financial Fraud';
    if (q.includes('accident') || q.includes('car') || q.includes('bike') || q.includes('truck') || q.includes('mact') || q.includes('hit and run')) return 'Motor Vehicle/Accident';
    if (q.includes('domestic') || q.includes('wife') || q.includes('husband') || q.includes('dowry') || q.includes('abuse') || q.includes('beating')) return 'Domestic Violence';
    if (q.includes('property') || q.includes('plot') || q.includes('land') || q.includes('encroach') || q.includes('builder') || q.includes('flat delay') || q.includes('rera')) return 'Property Law';
    if (q.includes('police') || q.includes('fir') || q.includes('theft') || q.includes('stolen') || q.includes('threat') || q.includes('arrest') || q.includes('assault')) return 'Criminal Law';
    if (q.includes('notice') || q.includes('agreement') || q.includes('contract') || q.includes('breach')) return 'Contract Disputes';
    if (q.includes('defame') || q.includes('reputation') || q.includes('slander')) return 'Defamation';
    return 'Civil Disputes';
  }

  // Hybrid Search (Dense Vector + BM25)
  public async search(
    query: string,
    options: { topK?: number; category?: string; minScore?: number; method?: 'hybrid' | 'vector' | 'lexical' } = {}
  ): Promise<RagInspectionData> {
    const startTime = Date.now();
    const topK = options.topK || 4;
    const method = options.method || 'hybrid';
    const classifiedCategory = options.category && options.category !== 'All' ? options.category : this.classifyQueryCategory(query);

    const queryClean = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const queryTokens = queryClean.split(/\s+/).filter(t => t.length > 2);

    // Get Query Embedding
    const { vector: queryVector, model: embeddingModel } = await this.getEmbedding(query);

    const scoredResults: RagSearchResult[] = [];

    for (const chunk of this.chunks) {
      // 1. Vector Score
      let vectorScore = 0;
      if (chunk.embedding && chunk.embedding.length === queryVector.length) {
        vectorScore = this.cosineSimilarity(queryVector, chunk.embedding);
      } else {
        // Compute fallback similarity on the fly
        const chunkFallback = this.computeDeterministicEmbedding(chunk.text, queryVector.length);
        vectorScore = this.cosineSimilarity(queryVector, chunkFallback);
      }
      vectorScore = Math.max(0, Math.min(1, vectorScore));

      // 2. Lexical Score
      const { score: lexicalScore, reasons: lexicalReasons } = this.computeLexicalScore(queryTokens, chunk);

      // Category matching boost
      let categoryBoost = 0;
      if (classifiedCategory && chunk.category.toLowerCase() === classifiedCategory.toLowerCase()) {
        categoryBoost = 0.15;
      }

      // Method scoring
      let combinedScore = 0;
      if (method === 'vector') {
        combinedScore = vectorScore;
      } else if (method === 'lexical') {
        combinedScore = Math.min(1.0, lexicalScore + (categoryBoost * 0.3));
      } else {
        // Hybrid combination (55% Vector, 35% Lexical + Category Boost)
        combinedScore = Math.min(1.0, vectorScore * 0.55 + lexicalScore * 0.35 + categoryBoost);
      }

      const matchReasons = [...lexicalReasons];
      if (vectorScore > 0.45) {
        matchReasons.unshift(`Semantic Vector Cosine: ${(vectorScore * 100).toFixed(1)}%`);
      }
      if (categoryBoost > 0) {
        matchReasons.push(`Category Alignment: ${chunk.category}`);
      }

      scoredResults.push({
        chunk,
        score: combinedScore,
        vectorScore,
        lexicalScore,
        matchReasons
      });
    }

    // Sort by combined score descending
    scoredResults.sort((a, b) => b.score - a.score);

    const topResults = scoredResults.slice(0, topK);

    // Construct Context Prompt string for inspection & LLM injection
    const contextPromptConstructed = topResults
      .map(
        (r, i) =>
          `[DOCUMENT CHUNK ${i + 1}] (Relevance Score: ${(r.score * 100).toFixed(1)}% | Method: ${method})\n` +
          `Act: ${r.chunk.act} ${r.chunk.section || ''}\n` +
          `Title: ${r.chunk.title}\n` +
          `Category: ${r.chunk.category}\n` +
          `Current Law Status: ${r.chunk.currentStatus || r.chunk.confidence} (Verified: ${r.chunk.verifiedDate})\n` +
          (r.chunk.oldEquivalent ? `Historical Predecessor: ${r.chunk.oldEquivalent}\n` : '') +
          `Statutory Text & Principles: ${r.chunk.text}\n` +
          `Relevant Authorities: ${r.chunk.relevantForums.join(', ')}\n` +
          (r.chunk.limitationPeriod ? `Limitation: ${r.chunk.limitationPeriod}\n` : '') +
          `Source URL: ${r.chunk.sourceUrl}`
      )
      .join('\n\n----------------------------------------\n\n');

    const latencyMs = Date.now() - startTime;

    const retrievalMethodLabel =
      method === 'vector'
        ? 'Dense Vector Search'
        : method === 'lexical'
        ? 'BM25 Lexical Search'
        : 'Hybrid (Dense Vector + BM25 Lexical)';

    return {
      query,
      classifiedCategory,
      retrievalMethod: retrievalMethodLabel as any,
      embeddingModel,
      queryVectorDimensions: queryVector.length,
      totalIndexedChunks: this.chunks.length,
      retrievalLatencyMs: latencyMs,
      retrievedChunks: topResults,
      contextPromptConstructed
    };
  }

  // Document Ingestion Pipeline
  public async ingestDocument(payload: {
    title: string;
    act: string;
    category: string;
    section?: string;
    content: string;
    sourceUrl?: string;
    chunkSize?: number;
    overlap?: number;
  }): Promise<{ ingestedChunks: number; chunks: LegalChunk[] }> {
    const chunkSize = payload.chunkSize || 300; // words
    const overlap = payload.overlap || 40; // words
    const sourceUrl = payload.sourceUrl || 'https://indiacode.nic.in';

    // 1. Text Cleaning
    const cleaned = payload.content.replace(/\r\n/g, '\n').replace(/\t/g, ' ').replace(/\n{3,}/g, '\n\n');

    // 2. Chunking with overlap
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    const textChunks: string[] = [];

    if (words.length <= chunkSize) {
      textChunks.push(words.join(' '));
    } else {
      let startIndex = 0;
      while (startIndex < words.length) {
        const endIndex = Math.min(startIndex + chunkSize, words.length);
        const chunkWords = words.slice(startIndex, endIndex);
        textChunks.push(chunkWords.join(' '));
        if (endIndex === words.length) break;
        startIndex += chunkSize - overlap;
      }
    }

    const documentId = `doc-custom-${Date.now()}`;
    const newChunks: LegalChunk[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i];
      const chunkTitle = textChunks.length > 1 ? `${payload.title} (Part ${i + 1}/${textChunks.length})` : payload.title;

      const { vector } = await this.getEmbedding(chunkText);

      const chunk: LegalChunk = {
        id: `chunk-${documentId}-${i}`,
        documentId,
        act: payload.act,
        section: payload.section || `Provision ${i + 1}`,
        chapter: 'Custom / Added Statutory Reference',
        title: chunkTitle,
        category: payload.category,
        text: chunkText,
        summary: chunkText.slice(0, 160) + '...',
        simpleExplanation: chunkText.slice(0, 200) + '...',
        keyElements: ['Document uploaded to custom RAG index'],
        remediesOrPenalties: 'Refer to statutory provisions in text',
        relevantForums: ['Jurisdictional Court'],
        sourceUrl,
        officialSourceType: 'State Law',
        verifiedDate: new Date().toLocaleDateString('en-GB'),
        confidence: 'Verified',
        embedding: vector,
        tokenCount: Math.round(chunkText.split(/\s+/).length * 1.3),
        isCustom: true
      };

      this.chunks.unshift(chunk);
      newChunks.push(chunk);
    }

    return { ingestedChunks: newChunks.length, chunks: newChunks };
  }

  // Get all chunks (for vector store inspector)
  public getAllChunks(): LegalChunk[] {
    return this.chunks;
  }

  public deleteChunk(chunkId: string): boolean {
    const idx = this.chunks.findIndex(c => c.id === chunkId);
    if (idx !== -1) {
      this.chunks.splice(idx, 1);
      return true;
    }
    return false;
  }

  public getStats() {
    const categoriesMap: Record<string, number> = {};
    for (const c of this.chunks) {
      categoriesMap[c.category] = (categoriesMap[c.category] || 0) + 1;
    }

    return {
      totalChunks: this.chunks.length,
      customChunks: this.chunks.filter(c => c.isCustom).length,
      defaultDimensions: this.vectorDimensions,
      categories: categoriesMap,
      embeddingModel: ai ? 'gemini-embedding-2-preview' : 'Nyaya-Semantic-Embedding (128d Hybrid)'
    };
  }
}

export const ragVectorStore = new RagVectorStore();
