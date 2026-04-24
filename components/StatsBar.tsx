/**
 * components/StatsBar.tsx
 * HYDRATION FIX: All dynamic values initialised in useEffect only.
 * Server renders safe placeholders; client hydrates with live values.
 */

'use client';

import { useEffect, useState } from 'react';
import { Shield, Cpu, Activity, AlertTriangle, Database, Clock } from 'lucide-react';

export default function StatsBar() {
  const [time, setTime] = useState('--:--:--');
  const [packets, setPackets] = useState('--,---,---');
  const [cpuLoad, setCpuLoad] = useState(0);

  useEffect(() => {
    let count = 1_847_293;
    setPackets(count.toLocaleString());
    setCpuLoad(23);
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
      count += Math.floor(Math.random() * 150 + 50);
      setPackets(count.toLocaleString());
      setCpuLoad(Math.floor(Math.random() * 30 + 15));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'THREATS BLOCKED', value: '1,247',                         color: '#00ff88', Icon: Shield       },
    { label: 'PACKETS SCANNED', value: packets,                          color: '#00d4ff', Icon: Activity     },
    { label: 'ACTIVE ALERTS',   value: '3',                              color: '#ffd60a', Icon: AlertTriangle},
    { label: 'AI ENGINE LOAD',  value: cpuLoad ? `${cpuLoad}%` : '--%', color: cpuLoad > 70 ? '#ff2d55' : '#7c3aed', Icon: Cpu },
    { label: 'MODELS MONITORED',value: '12',                             color: '#00d4ff', Icon: Database     },
    { label: 'SYSTEM TIME',     value: time,                             color: '#64748b', Icon: Clock        },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {stats.map(({ label, value, color, Icon }) => (
        <div key={label} className="glass-panel rounded-lg px-3 py-2.5 flex items-center gap-2.5">
          <div style={{ color }} className="flex-shrink-0"><Icon size={14} /></div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold tabular-nums" style={{ color, textShadow: `0 0 8px ${color}60` }}>
              {value}
            </p>
            <p className="font-mono text-xs text-slate-600 truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
