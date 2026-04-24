/**
 * components/RiskSparkline.tsx
 *
 * Session risk trend sparkline — renders inside the Analysis Log panel.
 * Shows a mini bar chart of every analysis run this session, color-coded
 * by severity. Gives investors an immediate visual of how threat levels
 * evolved across different attack simulations.
 *
 * Uses Recharts BarChart (already a project dependency — zero extra install).
 */

'use client';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ATTACK_SCENARIOS } from '@/lib/prompts';
import type { HistoryEntry } from './ThreatHistory';

interface RiskSparklineProps {
  entries: HistoryEntry[];
}

/** Map a score to a fill color — identical scale used in RiskGauge */
function scoreColor(score: number): string {
  if (score >= 86) return '#ff2d55';
  if (score >= 66) return '#ff6b35';
  if (score >= 41) return '#ffd60a';
  if (score >= 16) return '#00d4ff';
  return '#374151';
}

/** Abbreviated label so x-axis isn't crowded */
function shortLabel(scenarioId: string): string {
  const map: Record<string, string> = {
    prompt_injection: 'INJ',
    model_extraction: 'EXT',
    dos_llm:          'DOS',
    data_poisoning:   'POI',
  };
  return map[scenarioId] ?? scenarioId.slice(0, 3).toUpperCase();
}

/** Custom tooltip shown on bar hover */
function SparkTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const scenario = ATTACK_SCENARIOS[d.scenarioId as keyof typeof ATTACK_SCENARIOS];
  return (
    <div
      className="glass-panel rounded-lg p-2.5 text-left"
      style={{ border: `1px solid ${d.color}40`, minWidth: 140 }}
    >
      <p className="font-mono text-xs font-bold mb-1" style={{ color: d.color }}>
        {scenario?.label ?? d.scenarioId}
      </p>
      <p className="font-display text-lg font-black" style={{ color: d.color }}>
        {d.score}
        <span className="font-mono text-xs text-slate-500 ml-1">/ 100</span>
      </p>
      <p className="font-mono text-xs text-slate-600 mt-0.5">{d.time}</p>
    </div>
  );
}

export default function RiskSparkline({ entries }: RiskSparklineProps) {
  if (entries.length === 0) return null;

  const data = entries.map((e, i) => ({
    index: i + 1,
    score: e.riskScore,
    color: scoreColor(e.riskScore),
    label: shortLabel(e.scenarioId),
    scenarioId: e.scenarioId,
    time: e.timestamp.toLocaleTimeString('en-US', { hour12: false }),
  }));

  const avg = Math.round(data.reduce((s, d) => s + d.score, 0) / data.length);
  const peak = Math.max(...data.map(d => d.score));

  return (
    <div className="w-full mt-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-xs text-slate-600 uppercase tracking-widest">
          SESSION RISK TREND
        </p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-600">
            AVG <span className="text-slate-400">{avg}</span>
          </span>
          <span className="font-mono text-xs text-slate-600">
            PEAK <span style={{ color: scoreColor(peak) }}>{peak}</span>
          </span>
        </div>
      </div>

      {/* Sparkline chart */}
      <div style={{ height: 72 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 2, left: -28, bottom: 0 }}
            barCategoryGap="20%"
          >
            {/* Faint reference line at threat threshold (41) */}
            <ReferenceLine
              y={41}
              stroke="rgba(255,214,10,0.25)"
              strokeDasharray="3 3"
            />
            {/* Faint reference line at critical threshold (86) */}
            <ReferenceLine
              y={86}
              stroke="rgba(255,45,85,0.2)"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="label"
              tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#374151' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fill: '#1f2937' }}
              axisLine={false}
              tickLine={false}
              tickCount={3}
            />
            <Tooltip
              content={<SparkTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="score" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color}
                  style={{ filter: `drop-shadow(0 0 4px ${d.color}80)` }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Threat threshold legend */}
      <div className="flex items-center gap-3 mt-1.5 justify-end">
        <div className="flex items-center gap-1">
          <div className="w-4 h-px border-t border-dashed border-yellow-400/40" />
          <span className="font-mono text-xs text-slate-700">THREAT(41)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-px border-t border-dashed border-red-500/30" />
          <span className="font-mono text-xs text-slate-700">CRIT(86)</span>
        </div>
      </div>
    </div>
  );
}
