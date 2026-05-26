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
    name: 'Dark',

    bg: 'bg-[#0B0B0F]',

    cardBg: 'bg-[#16181D]',

    borderColor: 'border-white/10',

    primary: 'text-[#FF8A00]',

    accent: 'bg-[#FF8A00] hover:bg-[#FF9F26]',

    accentGradient:
      'from-[#FFB547] via-[#FF8A00] to-[#FF5E00]',

    glow: 'shadow-[0_0_25px_rgba(255,138,0,0.15)]',

    badge:
      'text-[#FFB547] bg-[#2A1A0A] border-[#FF8A00]/20'
  },

  midnight: {
    id: 'midnight',
    name: 'OLED Black',
    bg: 'bg-[#0B0B0F]',
    cardBg: 'bg-[#16181D]',
    borderColor: 'border-white/10',
    primary: 'text-[#FF8A00]',
    accent: 'bg-[#FF8A00] hover:bg-[#FF9F26]',
    accentGradient:
      'from-[#FFB547] via-[#FF8A00] to-[#FF5E00]',
    glow: 'shadow-[0_0_25px_rgba(255,138,0,0.15)]',
    badge:
      'text-[#FFB547] bg-[#2A1A0A] border-[#FF8A00]/20'
  },

  forest: {
    id: 'forest',
    name: 'Midnight',
    bg: 'bg-[#0B0B0F]',
    cardBg: 'bg-[#16181D]',
    borderColor: 'border-white/10',
    primary: 'text-[#FF8A00]',
    accent: 'bg-[#FF8A00] hover:bg-[#FF9F26]',
    accentGradient:
      'from-[#FFB547] via-[#FF8A00] to-[#FF5E00]',
    glow: 'shadow-[0_0_25px_rgba(255,138,0,0.15)]',
    badge:
      'text-[#FFB547] bg-[#2A1A0A] border-[#FF8A00]/20'
  },

  amethyst: {
    id: 'amethyst',
    name: 'Carbon',
    bg: 'bg-[#0B0B0F]',
    cardBg: 'bg-[#16181D]',
    borderColor: 'border-white/10',
    primary: 'text-[#FF8A00]',
    accent: 'bg-[#FF8A00] hover:bg-[#FF9F26]',
    accentGradient:
      'from-[#FFB547] via-[#FF8A00] to-[#FF5E00]',
    glow: 'shadow-[0_0_25px_rgba(255,138,0,0.15)]',
    badge:
      'text-[#FFB547] bg-[#2A1A0A] border-[#FF8A00]/20'
  }
};

export function getTheme(themeId?: string): AppThemeConfig {
  return HourZeroThemes[themeId || 'charcoal'] || HourZeroThemes.charcoal;
}

