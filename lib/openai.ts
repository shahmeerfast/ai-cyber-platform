/**
 * lib/openai.ts
 * Centralized OpenAI API client. Import this for all OpenAI calls.
 */

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    'OPENAI_API_KEY is not set. Add it to your .env.local file.\nSee .env.example for instructions.'
  );
}

/** Singleton OpenAI client */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Model to use — override via OPENAI_MODEL env var */
export const AI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

/** Full structured response from the AI analysis engine */
export interface ThreatAnalysisResult {
  threat_detected: boolean;
  risk_score: number;
  attack_confidence: number;
  attack_stage: 'reconnaissance' | 'weaponization' | 'exploitation' | 'exfiltration' | 'none';
  reasoning_steps: string[];
  mitigation_strategy: string;
  ioc_signatures: string[];
  cvss_estimate: string;
}
