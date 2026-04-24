/**
 * app/page.tsx
 * Investor-pitch dashboard — all three gaps now resolved:
 *   1. Session risk sparkline wired into right column
 *   2. vercel.json added for deployment
 *   3. next.config.js cleaned up
 */

'use client';

import { useState, useCallback } from 'react';
import { Shield, Zap, RefreshCw, ChevronRight, Lock, Radio, Edit3, X } from 'lucide-react';
import AttackSelector from '@/components/AttackSelector';
import RiskGauge from '@/components/RiskGauge';
import ReasoningTerminal from '@/components/ReasoningTerminal';
import StatsBar from '@/components/StatsBar';
import ThreatHistory, { HistoryEntry } from '@/components/ThreatHistory';
import RiskSparkline from '@/components/RiskSparkline';
import { ATTACK_SCENARIOS, AttackScenarioId } from '@/lib/prompts';
import type { ThreatAnalysisResult } from '@/lib/openai';

export default function DashboardPage() {
  const [selectedScenario, setSelectedScenario] = useState<AttackScenarioId>('prompt_injection');
  const [customPayload, setCustomPayload] = useState('');
  const [showPayloadEditor, setShowPayloadEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Analysis result state
  const [riskScore, setRiskScore] = useState(0);
  const [confidence, setConfidence] = useState<number | undefined>();
  const [attackStage, setAttackStage] = useState<string | undefined>();
  const [iocSignatures, setIocSignatures] = useState<string[]>([]);
  const [cvssEstimate, setCvssEstimate] = useState<string | undefined>();
  const [reasoningSteps, setReasoningSteps] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [mitigationStrategy, setMitigationStrategy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const runAnalysis = useCallback(async () => {
    setIsLoading(true);
    setIsStreaming(false);
    setRiskScore(0);
    setConfidence(undefined);
    setAttackStage(undefined);
    setIocSignatures([]);
    setCvssEstimate(undefined);
    setReasoningSteps([]);
    setStreamingText('');
    setMitigationStrategy('');
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario,
          customPayload: customPayload.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }
      if (!response.body) throw new Error('No response body');

      setIsLoading(false);
      setIsStreaming(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            setIsStreaming(false);
            try {
              const parsed: ThreatAnalysisResult = JSON.parse(buffer);
              setRiskScore(parsed.risk_score ?? 0);
              setConfidence(parsed.attack_confidence);
              setAttackStage(parsed.attack_stage);
              setIocSignatures(parsed.ioc_signatures ?? []);
              setCvssEstimate(parsed.cvss_estimate);
              setReasoningSteps(parsed.reasoning_steps ?? []);
              setMitigationStrategy(parsed.mitigation_strategy ?? '');
              setStreamingText('');
              setHistory(prev => [...prev, {
                id: Date.now().toString(),
                scenarioId: selectedScenario,
                riskScore: parsed.risk_score ?? 0,
                threatDetected: parsed.threat_detected ?? false,
                timestamp: new Date(),
              }]);
            } catch {
              setError('Failed to parse AI response — model may not have returned valid JSON.');
            }
            break outer;
          }

          try {
            const payload = JSON.parse(data);
            if (payload.error) throw new Error(payload.error);
            if (payload.text) { buffer += payload.text; setStreamingText(buffer); }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [selectedScenario, customPayload]);

  const scenario = ATTACK_SCENARIOS[selectedScenario];
  const isActive = isLoading || isStreaming;

  const handleScenarioChange = (id: AttackScenarioId) => {
    setSelectedScenario(id);
    setCustomPayload('');
    setShowPayloadEditor(false);
  };

  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.5) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(255,45,85,0.3) 0%, transparent 70%)' }} />
      </div>

      <div className="scan-line" />

      <div className="relative z-10 flex flex-col min-h-screen p-3 sm:p-4 gap-3">

        {/* ══ HEADER ══════════════════════════════════════ */}
        <header className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield size={28} className="text-cyan-400"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.8))' }} />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border border-cyber-bg" />
            </div>
            <div>
              <h1 className="font-display text-xl font-black tracking-widest text-glow-cyan text-cyan-400">
                SENTINEL<span className="text-slate-500">-</span>7
              </h1>
              <p className="font-mono text-xs text-slate-600 tracking-widest">
                AI CYBERSECURITY PLATFORM <span className="text-slate-700">// INVESTOR DEMO v2.1</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full">
              <Radio size={10} className="text-green-400 animate-pulse" />
              <span className="font-mono text-xs text-slate-400">SYSTEM NOMINAL</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="font-mono text-xs text-slate-500">MITRE ATT&CK v14</span>
            </div>
            <div className="flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-full">
              <Lock size={10} className="text-cyan-400" />
              <span className="font-mono text-xs text-cyan-400">SECURE</span>
            </div>
          </div>
        </header>

        {/* ══ STATS BAR ═══════════════════════════════════ */}
        <StatsBar />

        {/* ══ MAIN GRID ═══════════════════════════════════ */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">

          {/* ── LEFT: Controls + Gauge ── */}
          <div className="lg:col-span-3 flex flex-col gap-3">

            {/* Attack selector */}
            <div className="glass-panel-bright rounded-xl p-4 flex-shrink-0 relative z-30 overflow-visible">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: scenario.color }} />
                <span className="font-display text-xs font-bold tracking-widest text-slate-400">ATTACK VECTOR</span>
              </div>
              <AttackSelector selected={selectedScenario} onChange={handleScenarioChange} disabled={isActive} />

              {/* MITRE tactic */}
              <div className="mt-3 glass-panel rounded p-2">
                <p className="font-mono text-xs text-slate-600 mb-1">MITRE ATT&CK</p>
                <p className="font-mono text-xs text-slate-400">{scenario.mitreTactic}</p>
              </div>

              {/* Custom payload toggle */}
              <button
                onClick={() => setShowPayloadEditor(p => !p)}
                disabled={isActive}
                className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded glass-panel hover:border-cyan-500/30 transition-colors text-xs font-mono text-slate-500 hover:text-slate-300 disabled:opacity-40"
              >
                <span className="flex items-center gap-2">
                  <Edit3 size={11} />
                  {customPayload ? 'CUSTOM PAYLOAD ACTIVE' : 'EDIT PAYLOAD'}
                </span>
                {customPayload && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </button>

              {showPayloadEditor && (
                <div className="mt-2 line-appear">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-mono text-xs text-slate-600">CUSTOM PAYLOAD</p>
                    <button onClick={() => { setCustomPayload(''); setShowPayloadEditor(false); }}>
                      <X size={11} className="text-slate-600 hover:text-slate-400" />
                    </button>
                  </div>
                  <textarea
                    value={customPayload}
                    onChange={e => setCustomPayload(e.target.value)}
                    placeholder={scenario.examplePayload.slice(0, 80) + '...'}
                    rows={4}
                    className="w-full bg-black/40 border border-slate-700 rounded p-2 font-mono text-xs text-slate-300 placeholder-slate-700 resize-none focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              )}
            </div>

            {/* Run button */}
            <button
              onClick={runAnalysis}
              disabled={isActive}
              className={`cyber-btn w-full rounded-xl py-4 font-display font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all duration-300 flex-shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                  : 'text-black border border-cyan-400/40 hover:border-cyan-400'
              }`}
              style={!isActive ? {
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                boxShadow: '0 0 20px rgba(0,212,255,0.4), 0 4px 15px rgba(0,0,0,0.3)',
              } : {}}
            >
              {isLoading ? (
                <><RefreshCw size={16} className="animate-spin" />INITIALIZING...</>
              ) : isStreaming ? (
                <><div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />ANALYZING...</>
              ) : (
                <><Zap size={16} />RUN ANALYSIS<ChevronRight size={14} /></>
              )}
            </button>

            {/* Risk gauge */}
            <div className="glass-panel-bright rounded-xl p-4 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 rounded-full bg-red-500" />
                <span className="font-display text-xs font-bold tracking-widest text-slate-400">RISK ASSESSMENT</span>
              </div>
              <RiskGauge
                score={riskScore}
                confidence={confidence}
                attackStage={attackStage}
                iocSignatures={iocSignatures}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* ── CENTER: Reasoning Terminal ── */}
          <div className="lg:col-span-6 glass-panel-bright rounded-xl overflow-hidden flex flex-col" style={{ minHeight: '400px' }}>
            <div className="flex items-center gap-2 px-4 pt-4 pb-2 flex-shrink-0">
              <div className="w-1.5 h-4 rounded-full bg-cyan-400" />
              <span className="font-display text-xs font-bold tracking-widest text-slate-400">LIVE CHAIN-OF-THOUGHT ENGINE</span>
              {isStreaming && (
                <span className="ml-auto font-mono text-xs text-cyan-400 animate-pulse">● STREAMING</span>
              )}
            </div>
            <div className="flex-1 px-4 pb-4 min-h-0">
              <ReasoningTerminal
                steps={reasoningSteps}
                streamingText={isStreaming ? streamingText : ''}
                isStreaming={isStreaming}
                isLoading={isLoading}
                mitigationStrategy={mitigationStrategy}
                cvssEstimate={cvssEstimate}
                error={error}
              />
            </div>
          </div>

          {/* ── RIGHT: Scenario card + Sparkline + History ── */}
          <div className="lg:col-span-3 flex flex-col gap-3">

            {/* Scenario info */}
            <div className="glass-panel-bright rounded-xl p-4 flex-shrink-0"
              style={{ borderColor: `${scenario.color}25` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: scenario.color }} />
                <span className="font-display text-xs font-bold tracking-widest text-slate-400">ACTIVE SCENARIO</span>
              </div>
              <div className="text-center py-2">
                <p className="text-3xl mb-2">{scenario.icon}</p>
                <p className="font-display text-base font-black tracking-wide" style={{ color: scenario.color }}>
                  {scenario.label}
                </p>
                <div className="inline-block mt-2 px-2 py-0.5 rounded font-mono text-xs"
                  style={{ color: scenario.color, backgroundColor: `${scenario.color}15`, border: `1px solid ${scenario.color}40` }}>
                  {scenario.severityClass}
                </div>
                <p className="font-mono text-xs text-slate-500 mt-2 leading-relaxed">{scenario.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['AI Security', 'LLM Attack', 'Real-time CoT'].map(tag => (
                  <span key={tag} className="font-mono text-xs px-2 py-0.5 rounded border"
                    style={{ color: scenario.color, borderColor: `${scenario.color}40`, backgroundColor: `${scenario.color}10` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ★ SESSION RISK SPARKLINE — gap #1 now fixed ★ */}
            <div className="glass-panel-bright rounded-xl p-4 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 rounded-full bg-cyan-500" />
                <span className="font-display text-xs font-bold tracking-widest text-slate-400">SESSION RISK TREND</span>
              </div>
              <RiskSparkline entries={history} />
            </div>

            {/* Analysis history log */}
            <div className="glass-panel-bright rounded-xl p-4 flex-1" style={{ minHeight: '140px' }}>
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <div className="w-1.5 h-4 rounded-full bg-purple-500" />
                <span className="font-display text-xs font-bold tracking-widest text-slate-400">ANALYSIS LOG</span>
                {history.length > 0 && (
                  <span className="ml-auto font-mono text-xs text-slate-600">
                    {history.length} RUN{history.length !== 1 ? 'S' : ''}
                  </span>
                )}
              </div>
              <div style={{ height: 'calc(100% - 36px)' }}>
                <ThreatHistory entries={history} />
              </div>
            </div>
          </div>

        </div>

        {/* ══ FOOTER ══════════════════════════════════════ */}
        <footer className="flex-shrink-0 flex items-center justify-between">
          <p className="font-mono text-xs text-slate-700">
            SENTINEL-7 © 2025 — AI CYBERSECURITY PLATFORM // INVESTOR DEMO
          </p>
          <p className="font-mono text-xs text-slate-700 hidden sm:block">
            GPT-4o-mini + NEXT.JS 14.2 + EDGE RUNTIME + MITRE ATT&CK v14
          </p>
        </footer>
      </div>
    </div>
  );
}
