/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FastingSession, WeightLog, UserSettings } from '../types';
import { 
  TrendingDown, Calendar, Award, Trash2, Sparkles, Plus, CheckCircle2, ChevronRight, Activity, Smile
} from 'lucide-react';

interface DashboardProps {
  settings: UserSettings;
  sessions: FastingSession[];
  weights: WeightLog[];
  onAddWeight: (weight: number) => void;
  onDeleteWeight: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export default function Dashboard({
  settings,
  sessions,
  weights,
  onAddWeight,
  onDeleteWeight,
  onDeleteSession,
}: DashboardProps) {
  const [newWeight, setNewWeight] = useState(settings.currentWeight.toString());
  const [selectedWeightPoint, setSelectedWeightPoint] = useState<{ date: string; weight: number } | null>(null);

  // Compute Fasting Statistics
  const totalFastedHours = sessions.reduce((sum, s) => {
    if (!s.endTime) return sum;
    const hrs = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (3600 * 1000);
    return sum + Math.max(0, hrs);
  }, 0);

  const completedSessions = sessions.filter(s => s.isCompleted);
  const successfulSessions = sessions.filter(s => s.wasSuccessful);
  const successRate = completedSessions.length > 0 
    ? Math.round((successfulSessions.length / completedSessions.length) * 100) 
    : 100;

  const longestFastSession = sessions.reduce((max, s) => {
    if (!s.endTime) return max;
    const dur = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (3600 * 1000);
    return dur > max ? dur : max;
  }, 0);

  // Consistency streaks
  const currentStreak = (() => {
    // Basic streak calculation looking backwards
    const sorted = [...sessions].sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    let streak = 0;
    for (const s of sorted) {
      if (s.wasSuccessful) streak++;
      else break;
    }
    return streak;
  })();

  // Weight chart calculations - fully custom SVG auto scaling line chart
  const sortedWeights = [...weights].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const renderWeightChart = () => {
    if (sortedWeights.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-48 bg-slate-950/40 border border-slate-850 rounded-xl">
          <TrendingDown className="w-8 h-8 text-slate-600 mb-2" />
          <span className="text-xs text-slate-500">Need at least 2 logged weights to trace chart.</span>
        </div>
      );
    }

    const margin = { top: 15, right: 15, bottom: 25, left: 35 };
    const width = 340;
    const height = 150;
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    // Calc min & max
    const weightValList = sortedWeights.map(w => w.weight);
    const minWeight = Math.min(...weightValList) - 0.5;
    const maxWeight = Math.max(...weightValList) + 0.5;
    const weightRange = maxWeight - minWeight;

    // Convert weights into coordinate points
    const points = sortedWeights.map((w, idx) => {
      const x = margin.left + (idx / (sortedWeights.length - 1)) * chartW;
      const y = margin.top + chartH - ((w.weight - minWeight) / weightRange) * chartH;
      return { x, y, data: w };
    });

    const dPath = points.reduce((path, p, idx) => {
      return path + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, '');

    // Path for gradient underlay
    const gradientPath = points.length > 0 
      ? `${dPath} L ${points[points.length - 1].x} ${margin.top + chartH} L ${points[0].x} ${margin.top + chartH} Z`
      : '';

    // Simple horizontal lines
    const gridLines = [0, 0.5, 1].map((val) => {
      const y = margin.top + chartH * val;
      const weightLabel = maxWeight - val * weightRange;
      return { y, label: weightLabel.toFixed(1) };
    });

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="chart-underlay-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <g key={i}>
              <line 
                x1={margin.left} 
                y1={line.y} 
                x2={width - margin.right} 
                y2={line.y} 
                className="stroke-slate-850" 
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text 
                x={margin.left - 6} 
                y={line.y + 3} 
                textAnchor="end" 
                className="fill-slate-500 font-mono text-[9px]"
              >
                {line.label}
              </text>
            </g>
          ))}

          {/* Date scale label for first & last logs */}
          {sortedWeights.length > 0 && (
            <>
              <text 
                x={margin.left} 
                y={height - 5} 
                className="fill-slate-500 text-[8px]"
                textAnchor="start"
              >
                {new Date(sortedWeights[0].date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </text>
              <text 
                x={width - margin.right} 
                y={height - 5} 
                className="fill-slate-500 text-[8px]"
                textAnchor="end"
              >
                {new Date(sortedWeights[sortedWeights.length - 1].date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </text>
            </>
          )}

          {/* Area Gradient */}
          <path d={gradientPath} fill="url(#chart-underlay-grad)" />

          {/* Main Weight trendline */}
          <path 
            d={dPath} 
            fill="none" 
            className="stroke-orange-500" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Interactive dots */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={selectedWeightPoint?.date === p.data.date ? "6" : "3.5"}
              className={`${
                selectedWeightPoint?.date === p.data.date 
                  ? 'fill-white stroke-orange-500' 
                  : 'fill-orange-500 stroke-slate-900 hover:fill-amber-400'
              } cursor-pointer stroke-2 transition-all`}
              onClick={() => setSelectedWeightPoint({ date: p.data.date, weight: p.data.weight })}
            />
          ))}
        </svg>

        {/* Dynamic Detail Overlay when clicking point */}
        <div className="mt-2 text-center h-5">
          {selectedWeightPoint ? (
            <p className="text-[10px] text-orange-400 font-medium">
              📅 {new Date(selectedWeightPoint.date).toLocaleDateString([], { month: 'long', day: 'numeric' })}:{' '}
              <span className="text-white font-bold">{selectedWeightPoint.weight} kg</span>
            </p>
          ) : (
            <span className="text-[9px] text-slate-500">Tap dots above to view weight points</span>
          )}
        </div>
      </div>
    );
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(newWeight);
    if (!wt) return;
    onAddWeight(wt);
    setSelectedWeightPoint(null);
  };

  return (
    <div id="dashboard-tab" className="p-4 bg-slate-950 text-white scrollbar-thin overflow-y-auto h-full space-y-5">
      {/* Prime Statistics HUD Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-orange-500/10 p-2.5 rounded-lg text-orange-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-medium">Fasting Streak</span>
            <span className="text-lg font-extrabold font-mono text-slate-100">{currentStreak} Days</span>
            <span className="block text-[9px] text-emerald-400 font-medium">Auto-calculated</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2.5 rounded-lg text-cyan-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-medium">Hours Logged</span>
            <span className="text-lg font-extrabold font-mono text-slate-100">{totalFastedHours.toFixed(0)}h</span>
            <span className="block text-[9px] text-slate-500">Total volume</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-emerald-500/15 p-2.5 rounded-lg text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-medium">Success Rate</span>
            <span className="text-lg font-extrabold font-mono text-slate-100">{successRate}%</span>
            <span className="block text-[9px] text-slate-500">Logs complete</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-purple-500/10 p-2.5 rounded-lg text-purple-400 shrink-0">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-medium">Longest Period</span>
            <span className="text-lg font-extrabold font-mono text-slate-100">{longestFastSession.toFixed(1)}h</span>
            <span className="block text-[9px] text-slate-500">Peak Autophagy</span>
          </div>
        </div>
      </div>

      {/* Weight Progress Chart & Logger Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-orange-400" />
              <span>Weight Changes Line</span>
            </h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Goal: {settings.targetWeight} kg | Current: {sortedWeights[sortedWeights.length - 1]?.weight || settings.currentWeight} kg
            </span>
          </div>
        </div>

        {/* Chart plot */}
        {renderWeightChart()}

        {/* Dynamic Weight Quick Logger Widget */}
        <form onSubmit={handleWeightSubmit} className="flex gap-2 items-center bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl">
          <span className="text-xs text-slate-300 flex-grow font-medium">Log your weight today:</span>
          <div className="flex gap-1.5 items-center">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              id="log-weight-input"
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-16 bg-slate-950 border border-slate-800 py-1 text-center font-bold font-mono rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
            <span className="text-xs text-slate-400 font-mono">kg</span>
            <button
              type="submit"
              id="submit-weight-btn"
              className="bg-orange-600 hover:bg-orange-500 py-1 px-2.5 text-xs text-white rounded font-bold cursor-pointer"
            >
              Log
            </button>
          </div>
        </form>
      </div>

      {/* Consistency block grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Fasting Consistency grid</span>
        </h3>

        <div className="flex gap-2 justify-between items-center mb-4">
          <p className="text-[10px] text-slate-400 leading-normal max-w-xs">
            Visual map of your past fast completions. Meet target to keep streaks alive!
          </p>
        </div>

        {/* Dynamic Blocks Row representing past days */}
        <div className="grid grid-cols-8 gap-2 mb-3">
          {Array.from({ length: 8 }).map((_, idx) => {
            const date = new Date();
            date.setDate(date.getDate() - (7 - idx)); // past 8 days
            const dayStr = date.toDateString();
            
            // find if session exists around this day
            const session = sessions.find(s => new Date(s.startTime).toDateString() === dayStr);
            
            let color = 'bg-slate-950 border-slate-850';
            let label = 'No Fast';
            
            if (session) {
              if (session.wasSuccessful) {
                color = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
                label = 'Success';
              } else {
                color = 'bg-rose-500/20 border-rose-500/30 text-rose-400';
                label = 'Broken';
              }
            }

            return (
              <div 
                key={idx} 
                className={`flex flex-col items-center justify-center p-1.5 border rounded-lg text-center ${color}`}
              >
                <span className="text-[9px] text-slate-500 block uppercase font-mono">
                  {date.toLocaleDateString([], { weekday: 'narrow' })}
                </span>
                <span className="text-[9px] font-bold mt-1 max-w-full truncate block leading-none">
                  {date.getDate()}
                </span>
                <span className="text-[7px] text-slate-400 font-medium block scale-90 whitespace-nowrap mt-1">
                  {session ? (session.wasSuccessful ? '100%' : 'Break') : '—'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 text-[9px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded" />
            <span>Target Hit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500/30 rounded" />
            <span>Ended Early</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-slate-950 border border-slate-850 rounded" />
            <span>Rest Day</span>
          </div>
        </div>
      </div>

      {/* History log lines CRUD list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
          Completed Fasting Loops
        </h3>

        {sessions.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No completed fasts logged yet. Finish a timer to start archiving!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto scrollbar-thin">
            {[...sessions].reverse().map((item) => {
              const durSecs = item.endTime 
                ? (new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / 1000 
                : 0;
              const durHrs = durSecs / 3600;

              return (
                <div key={item.id} className="py-3 flex justify-between items-start text-xs">
                  <div className="pr-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">
                        {new Date(item.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className={`px-2 py-0.2 rounded-full font-bold text-[8px] ${
                        item.wasSuccessful 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.wasSuccessful ? 'Hit' : 'Early'}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 font-mono">
                      Started:{' '}
                      {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      | Ended:{' '}
                      {item.endTime 
                        ? new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : 'Active'}
                    </p>

                    {item.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-1.5 rounded border border-slate-850 max-w-sm">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="block font-mono font-bold text-orange-400 text-sm">
                        {durHrs.toFixed(1)}h
                      </span>
                      <span className="block text-[8px] text-slate-500 font-medium">Goal: {item.plannedDurationHours}h</span>
                    </div>
                    
                    <button
                      onClick={() => onDeleteSession(item.id)}
                      id={`delete-session-${item.id}`}
                      aria-label="Delete history entry"
                      className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-slate-950 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
