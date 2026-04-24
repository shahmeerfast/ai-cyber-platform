/**
 * components/ReasoningTerminal.tsx
 * Enhanced terminal with CVSS badge, attack stage, and richer step styling.
 */

'use client';

import { useEffect, useRef } from 'react';
import { Terminal, Wifi, WifiOff } from 'lucide-react';

interface ReasoningTerminalProps {
  steps: string[];
  streamingText: string;
  isStreaming: boolean;
  isLoading: boolean;
  mitigationStrategy: string;
  cvssEstimate?: string;
  error: string | null;
}

const STEP_META = [
  { label: '▶ TRIAGE',      color: '#00d4ff' },
  { label: '◈ SIGNATURE',   color: '#7c3aed' },
  { label: '⬡ INTENT',      color: '#ffd60a' },
  { label: '◉ VECTOR',      color: '#ff6b35' },
  { label: '⚠ IMPACT',      color: '#ff2d55' },
  { label: '✓ CLASSIFY',    color: '#00ff88' },
];

export default function ReasoningTerminal({
  steps, streamingText, isStreaming, isLoading, mitigationStrategy, cvssEstimate, error,
}: ReasoningTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps, streamingText]);

  const hasContent = steps.length > 0 || streamingText || mitigationStrategy;

  return (
    <div className="flex flex-col h-full">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-cyan-400" />
          <span className="font-mono text-xs text-cyan-400 tracking-widest">SENTINEL-7 :: CHAIN-OF-THOUGHT ENGINE</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isStreaming ? (
            <><Wifi size={12} className="text-green-400 animate-pulse" /><span className="font-mono text-xs text-green-400">LIVE</span></>
          ) : (
            <><WifiOff size={12} className="text-slate-600" /><span className="font-mono text-xs text-slate-600">IDLE</span></>
          )}
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 terminal-window bg-black/40 rounded-b-lg" style={{ minHeight: 0 }}>
        {/* Boot header */}
        <div className="mb-4">
          <p className="text-cyan-400/50 text-xs">╔══════════════════════════════════════════════════╗</p>
          <p className="text-cyan-400/50 text-xs">║  SENTINEL-7 AI THREAT ANALYSIS ENGINE v3.1.0    ║</p>
          <p className="text-cyan-400/50 text-xs">║  Senior Cybersecurity Auditor — ONLINE           ║</p>
          <p className="text-cyan-400/50 text-xs">╚══════════════════════════════════════════════════╝</p>
        </div>

        {/* Loading */}
        {isLoading && !hasContent && (
          <div className="space-y-2">
            {['Initializing threat analysis modules...', 'Loading MITRE ATT&CK signature database...', 'Engaging chain-of-thought reasoning engine...'].map((msg, i) => (
              <p key={i} className="text-cyan-400/40 text-xs animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                {'>'} {msg}
              </p>
            ))}
            <div className="flex items-center gap-2 mt-3">
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border border-red-500/30 rounded p-3 bg-red-950/20">
            <p className="text-red-400 text-xs font-mono">✗ ANALYSIS FAILED: {error}</p>
            <p className="text-slate-500 text-xs mt-1">Check OPENAI_API_KEY in .env.local</p>
          </div>
        )}

        {/* Idle prompt */}
        {!isLoading && !hasContent && !error && (
          <div className="text-slate-600 text-xs space-y-1">
            <p>{'>'} System ready. Select an attack vector and press ANALYZE.</p>
            <p className="terminal-cursor">&nbsp;</p>
          </div>
        )}

        {/* Completed steps */}
        {steps.map((step, i) => {
          const meta = STEP_META[i] ?? { label: `STEP${i + 1}`, color: '#00d4ff' };
          return (
            <div key={i} className="mb-3 line-appear">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold font-mono" style={{ color: meta.color, textShadow: `0 0 6px ${meta.color}` }}>
                  {meta.label}
                </span>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${meta.color}40, transparent)` }} />
                <span className="text-slate-600 text-xs font-mono">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed pl-2 border-l border-slate-700">{step}</p>
            </div>
          );
        })}

        {/* Streaming step */}
        {streamingText && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-cyan-400 text-xs font-bold font-mono animate-pulse">▶ PROCESSING</span>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/40 to-transparent" />
            </div>
            <p className="text-cyan-300 text-xs leading-relaxed pl-2 border-l border-cyan-800">
              {streamingText}<span className="terminal-cursor" />
            </p>
          </div>
        )}

        {/* Mitigation */}
        {mitigationStrategy && (
          <div className="mt-4 line-appear">
            <div className="border border-green-500/20 rounded p-3 bg-green-950/10">
              <p className="text-green-400 text-xs font-bold font-mono mb-2 flex items-center gap-2">
                <span>▣ MITIGATION STRATEGY</span>
                <div className="flex-1 h-px bg-green-400/20" />
              </p>
              <p className="text-green-300/80 text-xs leading-relaxed">{mitigationStrategy}</p>
            </div>
          </div>
        )}

        {/* CVSS estimate */}
        {cvssEstimate && cvssEstimate !== 'N/A' && (
          <div className="mt-3 line-appear">
            <div className="border border-orange-500/20 rounded p-2.5 bg-orange-950/10">
              <p className="text-orange-400 text-xs font-bold font-mono mb-1">▶ CVSS 3.1 ESTIMATE</p>
              <p className="text-orange-300/80 text-xs font-mono break-all">{cvssEstimate}</p>
            </div>
          </div>
        )}

        {/* Analysis complete */}
        {mitigationStrategy && !isStreaming && (
          <div className="mt-3 text-slate-600 text-xs font-mono">
            <p>{'>'} Analysis complete. Threat report generated.</p>
            <p className="terminal-cursor">&nbsp;</p>
          </div>
        )}
      </div>
    </div>
  );
}
