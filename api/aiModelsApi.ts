import { AIProvider, AIModelDefinition } from '../types/ai';
import { apiClient } from './client';

export const INITIAL_AI_PROVIDERS: AIProvider[] = [
  {
    id: 'google',
    name: 'Google Gemini',
    status: 'active',
    description: 'Enterprise multimodal reasoning, high token context windows, and real-time execution speeds.'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    status: 'active',
    description: 'State-of-the-art steerability, code generation, and complex qualitative analysis.'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    status: 'active',
    description: 'High-throughput function-calling and enterprise structured response formatting.'
  },
  {
    id: 'local',
    name: 'Local / Self-Hosted',
    status: 'active',
    description: 'On-premise zero-data-retention open-weight models for regulated sovereign workloads.'
  }
];

export const INITIAL_AI_MODELS: AIModelDefinition[] = [
  {
    id: 'gemini-3.7-flash',
    providerId: 'google',
    name: 'Gemini 3.7 Flash',
    tagline: 'Flagship Multimodal Speed & Efficiency',
    capabilities: ['function_calling', 'structured_output', 'multimodal_reasoning', 'high_speed'],
    contextWindow: 1048576,
    supportsTools: true,
    supportsStreaming: true,
    recommendedFor: 'Autonomous outreach, high-frequency lead triage, and real-time copilot chat',
    status: 'available'
  },
  {
    id: 'gemini-2.5-pro',
    providerId: 'google',
    name: 'Gemini 2.5 Pro',
    tagline: 'Deep Reasoning & Complex Enterprise Analysis',
    capabilities: ['deep_reasoning', 'code_execution', 'complex_planning', 'multimodal'],
    contextWindow: 2097152,
    supportsTools: true,
    supportsStreaming: true,
    recommendedFor: 'Deal risk calculations, custom enterprise contract audits, and executive briefing dossiers',
    status: 'available'
  },
  {
    id: 'gemini-2.5-flash',
    providerId: 'google',
    name: 'Gemini 2.5 Flash',
    tagline: 'Balanced Low-Latency Copilot Engine',
    capabilities: ['function_calling', 'structured_output', 'speed'],
    contextWindow: 1048576,
    supportsTools: true,
    supportsStreaming: true,
    recommendedFor: 'Quick WhatsApp drafts and pipeline stage validation',
    status: 'available'
  },
  {
    id: 'claude-3-7-sonnet',
    providerId: 'anthropic',
    name: 'Claude 3.7 Sonnet',
    tagline: 'Hybrid Reasoning & Nuanced Customer Communications',
    capabilities: ['extended_thinking', 'structured_writing', 'tool_use'],
    contextWindow: 200000,
    supportsTools: true,
    supportsStreaming: true,
    recommendedFor: 'Sensitive executive customer negotiations and RFP compliance reviews',
    status: 'available'
  },
  {
    id: 'gpt-4o',
    providerId: 'openai',
    name: 'GPT-4o',
    tagline: 'Omni Multimodal Enterprise Baseline',
    capabilities: ['function_calling', 'structured_outputs', 'json_mode'],
    contextWindow: 128000,
    supportsTools: true,
    supportsStreaming: true,
    recommendedFor: 'Multi-step CRM task dispatch and data ingestion',
    status: 'available'
  },
  {
    id: 'llama-3-3-70b-local',
    providerId: 'local',
    name: 'Llama 3.3 70B (Private VPC)',
    tagline: 'Air-Gapped Sovereign Intelligence',
    capabilities: ['local_inference', 'zero_retention', 'compliance_hardened'],
    contextWindow: 131072,
    supportsTools: true,
    supportsStreaming: true,
    recommendedFor: 'Strict HIPAA / Banking tier private client record processing',
    status: 'available'
  }
];

export const aiModelsApi = {
  async getProviders(): Promise<AIProvider[]> {
    const saved = localStorage.getItem('nova_ai_providers');
    const local = saved ? JSON.parse(saved) : INITIAL_AI_PROVIDERS;
    return apiClient.get<AIProvider[]>('/ai/providers', local);
  },

  async getModels(): Promise<AIModelDefinition[]> {
    const saved = localStorage.getItem('nova_ai_models');
    const local = saved ? JSON.parse(saved) : INITIAL_AI_MODELS;
    return apiClient.get<AIModelDefinition[]>('/ai/models', local);
  },

  async getModelById(modelId: string): Promise<AIModelDefinition | undefined> {
    const models = await aiModelsApi.getModels();
    return models.find(m => m.id === modelId);
  }
};
