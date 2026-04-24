/**
 * components/ThreatHistory.tsx
 * Session analysis log + risk sparkline trend chart.
 *
 * Shows every analysis run this session as a badge list,
 * plus a Recharts sparkline of risk scores over time.
 */

'use client';

import { AttackScenarioId, ATTACK_SCENARIOS } from '@/lib/prompts';
import RiskSparkline from './RiskSparkline';

export interface HistoryEntry {
  id: string;
  scenarioId: AttackScenarioId;
  riskScore: number;
  threatDetected: boolean;
  timestamp: Date;
}

interface ThreatHistoryProps {
  entries: HistoryEntry[];
}

function getRiskColor(score: number): string {
  if (score >= 86) return '#ff2d55';
  if (score >= 66) return '#ff6b35';
  if (score >= 41) return '#ffd60a';
  if (score >= 16) return '#00d4ff';
  return '#64748b';
}

export default function ThreatHistory({ entries }: ThreatHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <p className="font-mono text-xs text-slate-700">NO ANALYSIS HISTORY</p>
        <p className="font-mono text-xs text-slate-800">Run an attack simulation to begin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2">
      {/* ── Sparkline trend chart (appears after first run) ── */}
      {entries.length >= 1 && (
        <div className="flex-shrink-0 glass-panel rounded-lg px-3 py-2">
          <RiskSparkline entries={entries} />
        </div>
      )}

      {/* ── Run log list ── */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {[...entries].reverse().map((entry) => {
          const scenario = ATTACK_SCENARIOS[entry.scenarioId];
          const color = getRiskColor(entry.riskScore);

          return (
            <div
              key={entry.id}
              className="glass-panel rounded-lg p-2.5 flex items-center gap-3 line-appear"
            >
              {/* Risk score badge */}
              <div
                className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 font-display font-black text-sm"
                style={{
                  color,
                  backgroundColor: `${color}15`,
                  border: `1px solid ${color}40`,
                }}
              >
                {entry.riskScore}
              </div>

              {/* Scenario + time */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs font-semibold truncate" style={{ color: scenario.color }}>
                  {scenario.label}
                </p>
                <p className="font-mono text-xs text-slate-600">
                  {entry.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                </p>
              </div>

              {/* Threat status dot */}
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.threatDetected ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor: entry.threatDetected ? '#ff2d55' : '#00ff88',
                  boxShadow: `0 0 6px ${entry.threatDetected ? '#ff2d55' : '#00ff88'}`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
