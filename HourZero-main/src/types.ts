/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FastingProtocol {
  id: string;
  name: string;
  fastingHours: number;
  eatingHours: number;
  description: string;
}

export interface UserSettings {
  name: string;
  targetWeight: number;
  currentWeight: number;
  protocolId: string;
  hasCompletedOnboarding: boolean;
  dailyCalorieTarget: number;
  waterTargetMl: number; // in ml
  appTheme?: 'charcoal' | 'midnight' | 'forest' | 'amethyst';
}

export interface FastingSession {
  id: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  plannedDurationHours: number;
  isCompleted: boolean;
  wasSuccessful: boolean;
  notes?: string;
  endWeight?: number;
}

export interface MealLog {
  id: string;
  timestamp: string; // ISO string
  name: string;
  calories: number;
  proteinGrams?: number;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

export interface WaterLog {
  id: string;
  timestamp: string; // ISO string
  amountMl: number;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface AppThemeConfig {
  id: 'charcoal' | 'midnight' | 'forest' | 'amethyst';
  name: string;
  bg: string;
  cardBg: string;
  borderColor: string;
  primary: string;
  accent: string;
  accentGradient: string;
  glow: string;
  badge: string;
}

export const HourZeroThemes: Record<string, AppThemeConfig> = {
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal Amber',
    bg: 'bg-slate-950',
    cardBg: 'bg-slate-900/80',
    borderColor: 'border-slate-800/80',
    primary: 'text-orange-400',
    accent: 'bg-orange-600 hover:bg-orange-500',
    accentGradient: 'from-amber-500 via-orange-600 to-rose-600',
    glow: 'shadow-orange-500/10',
    badge: 'text-orange-400 bg-orange-950/40 border-orange-850/60'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Indigo',
    bg: 'bg-zinc-950',
    cardBg: 'bg-indigo-950/40',
    borderColor: 'border-indigo-900/40',
    primary: 'text-indigo-400',
    accent: 'bg-indigo-600 hover:bg-indigo-500',
    accentGradient: 'from-blue-600 via-indigo-600 to-violet-600',
    glow: 'shadow-indigo-500/15',
    badge: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/40'
  },
  forest: {
    id: 'forest',
    name: 'Forest Emerald',
    bg: 'bg-stone-950',
    cardBg: 'bg-emerald-950/30',
    borderColor: 'border-emerald-900/45',
    primary: 'text-emerald-400',
    accent: 'bg-emerald-600 hover:bg-emerald-500',
    accentGradient: 'from-teal-500 via-emerald-600 to-green-600',
    glow: 'shadow-emerald-500/10',
    badge: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40'
  },
  amethyst: {
    id: 'amethyst',
    name: 'Deep Amethyst',
    bg: 'bg-slate-950',
    cardBg: 'bg-purple-950/30',
    borderColor: 'border-purple-900/45',
    primary: 'text-purple-400',
    accent: 'bg-purple-600 hover:bg-purple-500',
    accentGradient: 'from-fuchsia-600 via-purple-600 to-violet-600',
    glow: 'shadow-purple-500/10',
    badge: 'text-purple-400 bg-purple-950/40 border-purple-900/40'
  }
};

export function getTheme(themeId?: string): AppThemeConfig {
  return HourZeroThemes[themeId || 'charcoal'] || HourZeroThemes.charcoal;
}

