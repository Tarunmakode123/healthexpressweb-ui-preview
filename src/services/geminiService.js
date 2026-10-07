import { HEX_SPECIFICATION, CHATBOT_KNOWLEDGE } from '../data/chatbotKnowledge.js';
import { ALL_SERVICES } from '../data/services.js';
import { processUserMessage } from './chatbotEngine.js';

/**
 * HEALTH EXPRESS — AI AGENT SERVICE (V3.0 - SIMPLIFIED API KEY ARCHITECTURE)
 * 1. Admin enters API Key only (No model names, provider dropdowns, or endpoints needed).
 * 2. Auto-detects provider/model from API key signature:
 *    - Key starts with 'AIza' -> Google Gemini (gemini-2.5-flash)
 *    - Key starts with 'sk-ant' -> Anthropic Claude (claude-3-5-sonnet-20240620)
 *    - Key starts with 'sk-' -> OpenAI GPT (gpt-4o-mini)
 * 3. Bulletproof Fail-Safe: Falls back to local deterministic engine if offline/invalid key.
 */

const DEFAULT_FALLBACK_KEY = '';

// Last engine status telemetry log
let lastEngineStatus = {
  isOnline: true,
  engineType: 'LOCAL_ENGINE',
  activeProvider: 'gemini',
  activeModel: 'gemini-2.5-flash',
  activeKeySource: 'NONE',
  lastError: null,
  lastCheckedAt: new Date().toISOString()
};

/**
 * Automatically detects provider & default model based on API Key signature
 */
export function detectProviderFromKey(key, providerHint = null) {
  if (key && key.trim().length > 0) {
    const k = key.trim();
    if (k.startsWith('sk-ant-')) return { provider: 'anthropic', model: 'claude-3-5-sonnet-20240620' };
    if (k.startsWith('sk-')) return { provider: 'openai', model: 'gpt-4o-mini' };
    if (k.startsWith('AIza')) return { provider: 'gemini', model: 'gemini-2.5-flash' };
  }
  
  const provider = providerHint || localStorage.getItem('hex_admin_active_provider') || 'gemini';
  const defaultModels = {
    gemini: 'gemini-2.5-flash',
    anthropic: 'claude-3-5-sonnet-20240620',
    openai: 'gpt-4o-mini'
  };
  return { provider, model: defaultModels[provider] || 'gemini-2.5-flash' };
}

export function getEffectiveApiKey() {
  const activeProvider = localStorage.getItem('hex_admin_active_provider') || 'gemini';
  
  let key = '';
  if (activeProvider === 'anthropic') {
    key = localStorage.getItem('hex_admin_claude_key') || localStorage.getItem('hex_admin_ai_key') || '';
  } else if (activeProvider === 'openai') {
    key = localStorage.getItem('hex_admin_chatgpt_key') || localStorage.getItem('hex_admin_openai_key') || localStorage.getItem('hex_admin_ai_key') || '';
  } else {
    key = localStorage.getItem('hex_admin_gemini_key') || localStorage.getItem('hex_admin_ai_key') || '';
  }

  // Fallback to any set admin key if active provider key is empty
  if (!key.trim()) {
    key = localStorage.getItem('hex_admin_gemini_key') ||
          localStorage.getItem('hex_admin_claude_key') ||
          localStorage.getItem('hex_admin_chatgpt_key') ||
          localStorage.getItem('hex_admin_ai_key') || '';
  }

  if (key && key.trim().length > 5) {
    return { key: key.trim(), source: 'Admin Panel Override', activeProvider };
  }

  const envKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_CLAUDE_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return { key: envKey.trim(), source: '.env Environment', activeProvider };
  }

  return { key: '', source: 'NONE', activeProvider };
}

export function getGeminiEngineStatus() {
  const { key, source, activeProvider } = getEffectiveApiKey();
  const { provider, model } = detectProviderFromKey(key, activeProvider);
  return {
    ...lastEngineStatus,
    activeProvider: provider,
    activeModel: model,
    activeKeySource: source,
    hasApiKey: Boolean(key)
  };
}

const SYSTEM_INSTRUCTION = `
You are HEX, Health Express's AI care manager: a warm, family-health-manager-style information and navigation assistant.
Health Express is currently piloting in Bengaluru.

NON-NEGOTIABLE OPERATING RULES (DEVELOPER SPECIFICATION V1.0):
1. SOURCE OF TRUTH: Only answer using provided Health Express website/catalog data.
2. NO INVENTION: Never guess, infer, extrapolate or fill missing data. If information is unlisted, say: "I don't have that information available right now. Let me connect you to your Health Manager."
3. NO MEDICAL ADVICE: Never diagnose, interpret symptoms/results, or recommend medicines. Say: "I can help with Health Express services and coordination, but I can't provide medical advice. Let me connect you to your Health Manager."
4. INFORMATIONAL ONLY: You explain and guide. You DO NOT execute bookings, payments, cancellations, or rescheduling. For operational actions, use the escalation phrase: "Let me connect you to your Health Manager."
5. PROVIDER NEUTRALITY: Present factual provider attributes only. NEVER rank or recommend a provider.
6. PRICING RULES: Display MRPs only when explicitly provided in catalog. Use "The price starts from ₹X" only when starting price is explicit. For Home Nursing and Surgery, state that a quotation is required.
7. OUT-OF-AREA: If outside Bengaluru, explain pilot coverage and offer waitlist.
8. PERSONA & TONE: Warm, calm, professional, concise, and clear.
`;

/**
 * Universal Multi-Provider API Dispatcher
 */
async function callLlmProvider(key, promptText, providerHint = null) {
  const { provider, model } = detectProviderFromKey(key, providerHint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second fetch timeout

  try {
    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 400 }
        })
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.error) {
        throw new Error(`Gemini API ${data.error.code || 'Error'}: ${data.error.message}`);
      }
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (provider === 'openai') {
      const url = 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: promptText }
          ],
          temperature: 0.3,
          max_tokens: 400
        })
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.error) {
        throw new Error(`OpenAI API ${data.error.type || 'Error'}: ${data.error.message}`);
      }
      return data.choices?.[0]?.message?.content;
    }

    if (provider === 'anthropic') {
      const url = 'https://api.anthropic.com/v1/messages';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          system: SYSTEM_INSTRUCTION,
          messages: [{ role: 'user', content: promptText }],
          max_tokens: 400,
          temperature: 0.3
        })
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.error) {
        throw new Error(`Claude API ${data.error.type || 'Error'}: ${data.error.message}`);
      }
      return data.content?.[0]?.text;
    }

    throw new Error(`Unsupported AI Key`);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Diagnostic test connection for Admin Panel
 */
export async function testAiConnection(key, providerHint = null) {
  if (!key || key.trim().length < 5) {
    return { success: false, error: 'Please enter a valid API Key string.' };
  }

  const { provider, model } = detectProviderFromKey(key, providerHint);

  try {
    const testPrompt = 'Respond with exact phrase "HEALTH_EXPRESS_AI_OK" to verify API connection.';
    const resultText = await callLlmProvider(key.trim(), testPrompt, providerHint);
    if (resultText && resultText.trim()) {
      return { success: true, message: `Successfully connected to ${provider.toUpperCase()} (${model})` };
    }
    return { success: false, error: 'Received empty response from API endpoint.' };
  } catch (err) {
    return { success: false, error: err.message || 'Connection test failed.' };
  }
}

/**
 * Main AI Assistant Entry Point
 */
export async function askGeminiAssistant(rawQuery, conversationHistory = [], userContext = {}) {
  const { key: activeKey, source: keySource, activeProvider } = getEffectiveApiKey();
  const { provider, model } = detectProviderFromKey(activeKey, activeProvider);

  // If no API key configured, use deterministic Local Engine immediately
  if (!activeKey) {
    lastEngineStatus = {
      isOnline: true,
      engineType: 'LOCAL_ENGINE',
      activeProvider: provider,
      activeModel: model,
      activeKeySource: 'NONE',
      lastError: 'No API Key configured in Admin or ENV',
      lastCheckedAt: new Date().toISOString()
    };
    return processUserMessage(rawQuery, '/', userContext);
  }

  // Pre-process with local engine for instant guardrail verification & RAG retrieval
  const localResult = processUserMessage(rawQuery, '/', userContext);

  // Hard Safety boundaries return local result directly (100% medical/emergency safety)
  if (
    localResult.intent === 'EMERGENCY_RESPONSE' ||
    localResult.intent === 'MEDICAL_ADVICE_REQUEST' ||
    localResult.intent === 'BOOKING_PAYMENT_CANCEL' ||
    localResult.intent === 'CALLBACK_REQUEST' ||
    localResult.intent === 'HUMAN_REQUEST'
  ) {
    return localResult;
  }

  try {
    // Construct RAG Context from catalog & local result
    const catalogContext = ALL_SERVICES.map(s => `[Service: ${s.name} | Category: ${s.category_id} | MRP: ₹${s.price || 'N/A'} | Price: ₹${s.discount_price || 'N/A'} | Prep: ${s.preparation || 'N/A'}]`).join('\n');
    const pilotContext = `Pilot City: Bengaluru | Coverage: ${HEX_SPECIFICATION.geographyPilot.approvedLocalities.join(', ')}`;

    const promptText = `
Website Knowledge Database Context:
${catalogContext}

Pilot Coverage Context:
${pilotContext}

Verified Local Retrieval Data for User Inquiry:
"${localResult.text}"

User Question: "${rawQuery}"

Please formulate a warm, clear, concise response adhering strictly to your HEX Persona and System Rules. Include escalation phrase "Let me connect you to your Health Manager." if information is missing or human action is required.
`;

    const candidateText = await callLlmProvider(activeKey, promptText, activeProvider);

    if (candidateText && candidateText.trim()) {
      lastEngineStatus = {
        isOnline: true,
        engineType: `${provider.toUpperCase()} (${model})`,
        activeProvider: provider,
        activeModel: model,
        activeKeySource: keySource,
        lastError: null,
        lastCheckedAt: new Date().toISOString()
      };

      return {
        intent: 'AI_SYNTHESIS',
        text: candidateText.trim(),
        quickReplies: localResult.quickReplies,
        whatsappMsg: localResult.whatsappMsg
      };
    }
  } catch (err) {
    console.warn(`AI Provider (${provider}/${model}) exception, falling back to local engine:`, err);
    lastEngineStatus = {
      isOnline: false,
      engineType: 'LOCAL_FALLBACK',
      activeProvider: provider,
      activeModel: model,
      activeKeySource: keySource,
      lastError: err.message,
      lastCheckedAt: new Date().toISOString()
    };
  }

  // Fail-Safe Fallback to verified local decision engine if AI fails or is offline
  return localResult;
}

