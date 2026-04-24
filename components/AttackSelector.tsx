/**
 * components/AttackSelector.tsx
 * Dropdown for selecting an attack scenario.
 * Shows icon, color, severity class, and description.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, Zap, FlaskConical, Bomb, Biohazard } from 'lucide-react';
import { ATTACK_SCENARIOS, AttackScenarioId } from '@/lib/prompts';

interface AttackSelectorProps {
  selected: AttackScenarioId;
  onChange: (id: AttackScenarioId) => void;
  disabled?: boolean;
}

const ICONS = {
  prompt_injection: Zap,
  model_extraction: FlaskConical,
  dos_llm: Bomb,
  data_poisoning: Biohazard,
};

export default function AttackSelector({ selected, onChange, disabled }: AttackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedScenario = ATTACK_SCENARIOS[selected];
  const SelectedIcon = ICONS[selected];

  const handleSelect = (id: AttackScenarioId) => { onChange(id); setIsOpen(false); };

  return (
    <div className={`relative ${isOpen ? 'z-[80]' : 'z-10'}`}>
      <p className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">[ SELECT ATTACK VECTOR ]</p>

      {/* Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full glass-panel rounded-lg px-4 py-3 flex items-center justify-between transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-500/30 cursor-pointer'
        }`}
        style={{ borderColor: isOpen ? `${selectedScenario.color}40` : undefined }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: selectedScenario.color, boxShadow: `0 0 8px ${selectedScenario.color}` }} />
          <SelectedIcon size={16} style={{ color: selectedScenario.color }} />
          <div className="text-left">
            <p className="font-display text-sm font-semibold tracking-wide" style={{ color: selectedScenario.color }}>
              {selectedScenario.label}
            </p>
            <p className="text-xs text-slate-500 font-mono mt-0.5 hidden sm:block">
              {selectedScenario.severityClass}
            </p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[90] glass-panel rounded-lg overflow-hidden border border-cyan-500/10 max-h-80 overflow-y-auto">
          {(Object.keys(ATTACK_SCENARIOS) as AttackScenarioId[]).map((id) => {
            const s = ATTACK_SCENARIOS[id];
            const Icon = ICONS[id];
            return (
              <button key={id} onClick={() => handleSelect(id)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all duration-200 border-b border-slate-800/50 last:border-0 ${
                  id === selected ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                <Icon size={14} style={{ color: s.color }} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold" style={{ color: s.color }}>{s.label}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{s.severityClass} — {s.description.slice(0, 40)}...</p>
                </div>
                {id === selected && <div className="text-xs font-mono text-cyan-400 flex-shrink-0">ACTIVE</div>}
              </button>
            );
          })}
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-[70]" onClick={() => setIsOpen(false)} />}

      {/* Payload preview */}
      <div className="mt-3 glass-panel rounded p-3">
        <p className="text-xs font-mono text-slate-600 mb-1">EXAMPLE PAYLOAD:</p>
        <p className="text-xs font-mono text-slate-500 leading-relaxed line-clamp-2">
          {selectedScenario.examplePayload}
        </p>
      </div>
    </div>
  );
}
