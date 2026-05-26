/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FastingProtocol, FastingSession, MealLog, WeightLog } from './types';

export const DEFAULT_PROTOCOLS: FastingProtocol[] = [
  {
    id: '16-8',
    name: '16:8 Protocol',
    fastingHours: 16,
    eatingHours: 8,
    description: 'The standard leanGains beginner protocol. 16 hours of fasting with an 8-hour eating window.',
  },
  {
    id: '18-6',
    name: '18:6 Protocol',
    fastingHours: 18,
    eatingHours: 6,
    description: 'An intermediate fat-loss booster. 18 hours of fasting with a 6-hour eating window.',
  },
  {
    id: '20-4',
    name: '20:4 (Warrior)',
    fastingHours: 20,
    eatingHours: 4,
    description: 'The Warrior diet. 20 hours fasting, typically with one large evening meal during a 4-hour window.',
  },
  {
    id: '24-0',
    name: '24-Hour OMAD',
    fastingHours: 24,
    eatingHours: 0,
    description: 'One Meal A Day. A full 24-hour fast to trigger deep cellular cleaning (autophagy) and high metabolic focus.',
  }
];

// Helper to generate some beautiful historical logs for tracking
export const generateInitialData = (): {
  sessions: FastingSession[];
  meals: MealLog[];
  weights: WeightLog[];
} => {
  const today = new Date();
  
  // Previous 7 days of fasting sessions (some complete, some partly)
  const sessions: FastingSession[] = [
    {
      id: 'session-1',
      startTime: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000 - 16 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      plannedDurationHours: 16,
      isCompleted: true,
      wasSuccessful: true,
      notes: 'Felt very energetic throughout the morning!',
    },
    {
      id: 'session-2',
      startTime: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000 - 16 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      plannedDurationHours: 16,
      isCompleted: true,
      wasSuccessful: true,
      notes: 'Drank a lot of black coffee. Easily met the target.',
    },
    {
      id: 'session-3',
      startTime: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000 - 18 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      plannedDurationHours: 18,
      isCompleted: true,
      wasSuccessful: true,
      notes: 'Tried the 18:6 protocol today. Smooth progression.',
    },
    {
      id: 'session-4',
      startTime: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000 - 15 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(), // ended early
      plannedDurationHours: 16,
      isCompleted: true,
      wasSuccessful: false,
      notes: 'Ended 1 hr early due to a social breakfast. That is okay, back at it tomorrow!',
    },
    {
      id: 'session-5',
      startTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 - 16 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      plannedDurationHours: 16,
      isCompleted: true,
      wasSuccessful: true,
      notes: 'Very clean fast. Weight feels like it is dropping.',
    },
    {
      id: 'session-6',
      startTime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 - 16 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      plannedDurationHours: 16,
      isCompleted: true,
      wasSuccessful: true,
      notes: 'Standard 16:8 protocol complete.',
    },
    {
      id: 'session-7',
      startTime: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 - 16 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      plannedDurationHours: 16,
      isCompleted: true,
      wasSuccessful: true,
      notes: 'Slept really well, fasted easy today.',
    },
  ];

  // Weight logs showing a downward trends over the past week
  const weights: WeightLog[] = [
    { id: 'w-1', date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 81.2 },
    { id: 'w-2', date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 81.0 },
    { id: 'w-3', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 80.7 },
    { id: 'w-4', date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 80.8 },
    { id: 'w-5', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 80.4 },
    { id: 'w-6', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 80.1 },
    { id: 'w-7', date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 79.9 },
    { id: 'w-8', date: today.toISOString().split('T')[0], weight: 79.7 },
  ];

  // Today's meals so far
  const meals: MealLog[] = [
    {
      id: 'meal-1',
      timestamp: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      name: 'Oatmeal with Almonds and Blueberries',
      calories: 420,
      proteinGrams: 14,
      type: 'Breakfast',
    },
    {
      id: 'meal-2',
      timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      name: 'Grilled Chicken Salad with Olive Oil',
      calories: 580,
      proteinGrams: 42,
      type: 'Lunch',
    }
  ];

  return { sessions, meals, weights };
};
