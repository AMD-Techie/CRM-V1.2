import { KnowledgeSource, KnowledgeDocument, KnowledgeChunk } from '../types/knowledge';
import { knowledgeSourcesApi } from './knowledgeSourcesApi';
import { knowledgeDocumentsApi } from './knowledgeDocumentsApi';
import { knowledgeChunksApi } from './knowledgeChunksApi';

export * from './knowledgeSourcesApi';
export * from './knowledgeDocumentsApi';
export * from './knowledgeChunksApi';
export * from './ragApi';
export * from './knowledgeDiagnosticsApi';
export * from './ragEvaluationApi';

export const knowledgeApi = {
  // Sources
  getKnowledgeSources: () => knowledgeSourcesApi.getKnowledgeSources(),
  getSources: () => knowledgeSourcesApi.getKnowledgeSources(),
  getSourceById: (id: string) => knowledgeSourcesApi.getSourceById(id),
  createKnowledgeSource: (source: Parameters<typeof knowledgeSourcesApi.createKnowledgeSource>[0]) => 
    knowledgeSourcesApi.createKnowledgeSource(source),
  updateSourceConfig: (sourceId: string, config: Parameters<typeof knowledgeSourcesApi.updateSourceConfig>[1]) =>
    knowledgeSourcesApi.updateSourceConfig(sourceId, config),
  reindexSource: (sourceId: string) => knowledgeSourcesApi.reindexSource(sourceId),
  syncSource: (sourceId: string) => knowledgeSourcesApi.reindexSource(sourceId),

  // Documents
  getKnowledgeDocuments: (sourceId?: string) => knowledgeDocumentsApi.getKnowledgeDocuments(sourceId),
  getDocuments: (sourceId?: string) => knowledgeDocumentsApi.getKnowledgeDocuments(sourceId),
  getDocumentById: (id: string) => knowledgeDocumentsApi.getDocumentById(id),
  createDocument: (doc: Parameters<typeof knowledgeDocumentsApi.createDocument>[0]) => 
    knowledgeDocumentsApi.createDocument(doc),
  deleteDocument: (id: string) => knowledgeDocumentsApi.deleteDocument(id),

  // Chunks
  getChunksByDocumentId: (docId: string) => knowledgeChunksApi.getChunksByDocumentId(docId),
  getAllChunks: () => knowledgeChunksApi.getAllChunks()
};
