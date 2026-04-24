/**
 * components/RiskGauge.tsx
 * Enhanced risk gauge with confidence meter, attack stage badge, and IOC list.
 */

'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RiskGaugeProps {
  score: number;
  confidence?: number;
  attackStage?: string;
  iocSignatures?: string[];
  isLoading?: boolean;
}

function getRiskLevel(score: number) {
  if (score >= 86) return { color: '#ff2d55', label: 'CRITICAL', glow: 'rgba(255,45,85,0.4)' };
  if (score >= 66) return { color: '#ff6b35', label: 'HIGH',     glow: 'rgba(255,107,53,0.3)' };
  if (score >= 41) return { color: '#ffd60a', label: 'MEDIUM',   glow: 'rgba(255,214,10,0.3)' };
  if (score >= 16) return { color: '#00d4ff', label: 'LOW',      glow: 'rgba(0,212,255,0.2)'  };
  return             { color: '#64748b',      label: 'SAFE',     glow: 'rgba(100,116,139,0.1)' };
}

const STAGE_COLORS: Record<string, string> = {
  reconnaissance: '#00d4ff',
  weaponization:  '#ffd60a',
  exploitation:   '#ff6b35',
  exfiltration:   '#ff2d55',
  none:           '#374151',
};

export default function RiskGauge({ score, confidence, attackStage, iocSignatures, isLoading }: RiskGaugeProps) {
  const { color, label, glow } = getRiskLevel(score);
  const chartData = [{ value: score, fill: color }];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative w-44 h-44 rounded-full skeleton" />
        <div className="skeleton h-4 w-24 rounded" />
        <div className="w-full space-y-2 mt-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
      </div>
    );
  }

  const stageColor = STAGE_COLORS[attackStage ?? 'none'] ?? '#374151';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Radial gauge */}
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="62%" outerRadius="88%" startAngle={220} endAngle={-40} data={chartData} barSize={11}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(26,39,68,0.6)' }} dataKey="value" cornerRadius={6} angleAxisId={0} />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center score */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
        >
          <span
            className="font-display text-4xl font-black tabular-nums transition-all duration-700"
            style={{ color, textShadow: `0 0 20px ${color}, 0 0 40px ${glow}` }}
          >
            {score}
          </span>
          <span className="font-mono text-xs text-slate-500 mt-0.5">RISK SCORE</span>
        </div>
      </div>

      {/* Threat level badge */}
      <div
        className="px-4 py-1 rounded-full font-display text-xs font-bold tracking-widest threat-pulse"
        style={{ color, border: `1px solid ${color}60`, backgroundColor: `${color}15` }}
      >
        {label}
      </div>

      {/* Confidence + threat indicator row */}
      <div className="w-full grid grid-cols-2 gap-2 text-center">
        <div className="glass-panel rounded-lg p-2">
          <p className="font-display text-lg font-black" style={{ color: '#00d4ff' }}>
            {confidence ?? '--'}%
          </p>
          <p className="font-mono text-xs text-slate-600">CONFIDENCE</p>
        </div>
        <div className="glass-panel rounded-lg p-2">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <div
              className={`w-2 h-2 rounded-full ${score > 40 ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: score > 40 ? '#ff2d55' : '#00ff88', boxShadow: `0 0 6px ${score > 40 ? '#ff2d55' : '#00ff88'}` }}
            />
            <p className="font-mono text-xs" style={{ color: score > 40 ? '#ff2d55' : '#00ff88' }}>
              {score > 40 ? 'THREAT' : 'CLEAN'}
            </p>
          </div>
          <p className="font-mono text-xs text-slate-600">STATUS</p>
        </div>
      </div>

      {/* Attack stage badge */}
      {attackStage && attackStage !== 'none' && (
        <div className="w-full">
          <p className="font-mono text-xs text-slate-600 mb-1">ATTACK STAGE</p>
          <div
            className="w-full text-center py-1.5 rounded font-mono text-xs font-bold uppercase tracking-widest"
            style={{ color: stageColor, backgroundColor: `${stageColor}15`, border: `1px solid ${stageColor}40` }}
          >
            {attackStage}
          </div>
        </div>
      )}

      {/* IOC Signatures */}
      {iocSignatures && iocSignatures.length > 0 && (
        <div className="w-full">
          <p className="font-mono text-xs text-slate-600 mb-1.5">IOC SIGNATURES</p>
          <div className="space-y-1">
            {iocSignatures.map((ioc, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="font-mono text-xs text-red-500 flex-shrink-0 mt-0.5">▸</span>
                <p className="font-mono text-xs text-slate-400 leading-relaxed">{ioc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
