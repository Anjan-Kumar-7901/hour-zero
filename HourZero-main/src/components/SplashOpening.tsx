/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserSettings, FastingProtocol } from '../types';
import { DEFAULT_PROTOCOLS } from '../data';
import { Sparkles, ArrowRight, Sun, Moon, Flame, Target, Palette } from 'lucide-react';

interface SplashOpeningProps {
  onComplete: (settings: UserSettings) => void;
}

export default function SplashOpening({ onComplete }: SplashOpeningProps) {
  const [name, setName] = useState('Fasting Champ');
  const [currentWeight, setCurrentWeight] = useState(80);
  const [targetWeight, setTargetWeight] = useState(72);
  const [selectedProtocol, setSelectedProtocol] = useState('16-8');
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(1800);
  const [waterTargetMl, setWaterTargetMl] = useState(2500);
  const [selectedTheme, setSelectedTheme] = useState<'charcoal' | 'midnight' | 'forest' | 'amethyst'>('charcoal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      name: name.trim() || 'Fasting Champ',
      currentWeight: Number(currentWeight) || 80,
      targetWeight: Number(targetWeight) || 72,
      protocolId: selectedProtocol,
      hasCompletedOnboarding: true,
      dailyCalorieTarget: Number(dailyCalorieTarget) || 1800,
      waterTargetMl: Number(waterTargetMl) || 2500,
      appTheme: selectedTheme,
    });
  };

  const themesList = [
    { id: 'charcoal', label: 'Dark Orange', color: 'bg-orange-500 border-amber-500' },
    { id: 'midnight', label: 'Cosmic Indigo', color: 'bg-indigo-600 border-blue-500' },
    { id: 'forest', label: 'Midnight Emerald', color: 'bg-emerald-600 border-teal-500' },
    { id: 'amethyst', label: 'Crystal Violet', color: 'bg-purple-600 border-fuchsia-500' }
  ] as const;

  return (
    <div id="splash-onboarding" className="scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent overflow-y-auto h-full flex flex-col justify-between bg-slate-950 text-white p-6 font-sans">
      {/* iOS App Opening Logo Header */}
      <div className="flex flex-col items-center pt-8 pb-4 text-center">
        <div className="relative mb-4 flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 rounded-2xl shadow-xl shadow-orange-500/10">
          <div className="absolute top-2 left-2 text-amber-200">
            <Sun className="w-5 h-5 animate-pulse" />
          </div>
          <div className="absolute bottom-2 right-2 text-rose-200">
            <Moon className="w-5 h-5" />
          </div>
          <Flame className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3.5xl font-black tracking-tighter bg-gradient-to-r from-amber-200 via-orange-400 to-rose-400 bg-clip-text text-transparent">
          HourZero
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xs">
          Track your fasts, build consistency and stay on target.
        </p>
      </div>

      {/* Onboarding form card */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md mb-6 flex-grow flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4 text-orange-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Configure Your Routine</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="onboarding-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              placeholder="e.g. Alex"
              required
            />
          </div>

          {/* Weight row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                id="onboarding-curr-weight"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                id="onboarding-target-weight"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Targets row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Calorie Limit (kcal)
              </label>
              <input
                type="number"
                step="50"
                id="onboarding-calories"
                value={dailyCalorieTarget}
                onChange={(e) => setDailyCalorieTarget(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Water Target (ml)
              </label>
              <input
                type="number"
                step="100"
                id="onboarding-water"
                value={waterTargetMl}
                onChange={(e) => setWaterTargetMl(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Protocol Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Primary Fasting Plan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_PROTOCOLS.map((proto) => {
                const isActive = selectedProtocol === proto.id;
                return (
                  <button
                    key={proto.id}
                    type="button"
                    id={`proto-btn-${proto.id}`}
                    onClick={() => setSelectedProtocol(proto.id)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'border-orange-500 bg-orange-950/30 ring-1 ring-orange-500'
                        : 'border-white/10 bg-slate-950/40 hover:bg-slate-950/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 justify-between w-full">
                      <span className="font-bold text-sm text-white">{proto.name.split(' ')[0]}</span>
                      {isActive && <Target className="w-3 h-3 text-orange-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {proto.description.replace(/\..*$/, '.')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            id="onboarding-start-btn"
            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 active:scale-98 text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
          >
            <span>Start Using Hour Zero</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
