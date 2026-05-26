/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MealLog, UserSettings, WaterLog } from '../types';
import { 
  Plus, Trash2, Utensils, Droplet, Dumbbell, Flame, Check, Sparkles 
} from 'lucide-react';

interface MealsNotingProps {
  settings: UserSettings;
  meals: MealLog[];
  waterLogs: WaterLog[];
  onAddMeal: (meal: Omit<MealLog, 'id' | 'timestamp'>) => void;
  onDeleteMeal: (id: string) => void;
  onAddWater: (amountMl: number) => void;
  onResetWater: () => void;
}

const POPULAR_TEMPLATES = [
  { name: 'Black Coffee (Unsweetened)', calories: 5, protein: 0, type: 'Snack' },
  { name: 'Hard Boiled Egg (Large)', calories: 75, protein: 6, type: 'Breakfast' },
  { name: 'Oatmeal with Honey', calories: 250, protein: 7, type: 'Breakfast' },
  { name: 'Grilled Chicken & Rice', calories: 520, protein: 38, type: 'Lunch' },
  { name: 'Avocado Salad with Olive Oil', calories: 310, protein: 4, type: 'Lunch' },
  { name: 'Seared Salmon & Broccoli', calories: 480, protein: 34, type: 'Dinner' },
  { name: 'Whey Protein Shake', calories: 150, protein: 25, type: 'Snack' },
  { name: 'Greek Yogurt (Unsweetened)', calories: 120, protein: 12, type: 'Snack' }
];

export default function MealsNoting({
  settings,
  meals,
  waterLogs,
  onAddMeal,
  onDeleteMeal,
  onAddWater,
  onResetWater,
}: MealsNotingProps) {
  // Input states
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');

  // Today's boundaries
  const today = new Date().toDateString();
  const todaysMeals = meals.filter(
    m => new Date(m.timestamp).toDateString() === today
  );
  const todaysWater = waterLogs.filter(
    w => new Date(w.timestamp).toDateString() === today
  );

  const totalCalories = todaysMeals.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = todaysMeals.reduce((sum, item) => sum + (item.proteinGrams || 0), 0);
  const totalWater = todaysWater.reduce((sum, item) => sum + item.amountMl, 0);

  const caloriesRemaining = Math.max(0, settings.dailyCalorieTarget - totalCalories);
  const caloriesPercent = Math.min(100, (totalCalories / settings.dailyCalorieTarget) * 100);
  const waterPercent = Math.min(100, (totalWater / settings.waterTargetMl) * 100);

  const handleSubmitMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !calories) return;

    onAddMeal({
      name: mealName.trim(),
      calories: parseInt(calories, 10) || 0,
      proteinGrams: protein ? parseInt(protein, 10) : undefined,
      type: mealType,
    });

    // Reset Form
    setMealName('');
    setCalories('');
    setProtein('');
  };

  const handleApplyTemplate = (tpl: typeof POPULAR_TEMPLATES[0]) => {
    onAddMeal({
      name: tpl.name,
      calories: tpl.calories,
      proteinGrams: tpl.protein,
      type: tpl.type as any,
    });
  };

  return (
    <div id="meals-noting-tab" className="p-4 bg-slate-950 text-white scrollbar-thin overflow-y-auto h-full space-y-5">
      {/* Dynamic Calories Budget Circular / Bar HUD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Daily Nutrients Budget
        </h3>
        
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="block text-[10px] text-slate-400 uppercase">CONSUMED</span>
            <span className="text-lg font-black font-mono text-orange-400">{totalCalories}</span>
            <span className="block text-[9px] text-slate-500">kcal</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="block text-[10px] text-slate-400 uppercase">REMAINING</span>
            <span className="text-lg font-black font-mono text-slate-100">{caloriesRemaining}</span>
            <span className="block text-[9px] text-slate-500">kcal</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="block text-[10px] text-slate-400 uppercase">PROTEIN</span>
            <span className="text-lg font-black font-mono text-cyan-400">{totalProtein}g</span>
            <span className="block text-[9px] text-slate-500">of raw intake</span>
          </div>
        </div>

        {/* Calories progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Daily Calorie Balance</span>
            <span className="text-slate-200 font-bold">{caloriesPercent.toFixed(0)}% used</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-850">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                caloriesPercent > 100 
                  ? 'bg-red-500' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${caloriesPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
            <span>0 kcal</span>
            <span>Limit: {settings.dailyCalorieTarget} kcal</span>
          </div>
        </div>
      </div>

      {/* Hydraulic Water Logger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
              Hydration Balance
            </h3>
          </div>
          <button
            onClick={onResetWater}
            id="reset-water-btn"
            className="text-[10px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
          >
            Reset Logs
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Hydraulic Level Visual */}
          <div className="relative w-12 h-16 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-end shrink-0">
            <div 
              className="w-full bg-gradient-to-t from-cyan-600 to-teal-400 transition-all duration-700"
              style={{ height: `${waterPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white drop-shadow-md">
              {waterPercent.toFixed(0)}%
            </span>
          </div>

          {/* Quick logger action tags */}
          <div className="flex-grow space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total water logged today:</span>
              <span className="font-extrabold text-cyan-400">{totalWater} / {settings.waterTargetMl}ml</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onAddWater(250)}
                id="water-add-250"
                className="bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800 py-1 rounded text-xs flex flex-col items-center cursor-pointer"
              >
                <span className="font-bold">+250ml</span>
                <span className="text-[8px] text-slate-500 mt-0.5">Glass</span>
              </button>
              <button
                onClick={() => onAddWater(500)}
                id="water-add-500"
                className="bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800 py-1 rounded text-xs flex flex-col items-center cursor-pointer"
              >
                <span className="font-bold">+500ml</span>
                <span className="text-[8px] text-slate-500 mt-0.5">Swell</span>
              </button>
              <button
                onClick={() => onAddWater(1000)}
                id="water-add-1000"
                className="bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800 py-1 rounded text-xs flex flex-col items-center cursor-pointer"
              >
                <span className="font-bold">+1.0L</span>
                <span className="text-[8px] text-slate-500 mt-0.5">Bottle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Meal Logging Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Utensils className="w-4 h-4 text-orange-400" />
          <span>Note a Custom Meal</span>
        </h3>

        <form onSubmit={handleSubmitMeal} className="space-y-3">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 md:col-span-6">
              <input
                type="text"
                placeholder="What did you eat?"
                value={mealName}
                id="meal-name-field"
                onChange={(e) => setMealName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600"
                required
              />
            </div>
            <div className="col-span-5 md:col-span-2">
              <input
                type="number"
                placeholder="Calories"
                value={calories}
                id="meal-calories-field"
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600"
                required
              />
            </div>
            <div className="col-span-4 md:col-span-2">
              <input
                type="number"
                placeholder="Protein (g)"
                value={protein}
                id="meal-protein-field"
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600"
              />
            </div>
            <div className="col-span-3 md:col-span-2">
              <select
                value={mealType}
                id="meal-type-select"
                onChange={(e: any) => setMealType(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-1.5 text-xs text-slate-300 focus:outline-none transition-colors"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            id="meal-submit-btn"
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add to journal</span>
          </button>
        </form>
      </div>

      {/* Quick click rapid-add templates */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Log Templates</span>
        </h3>
        
        <p className="text-[10px] text-slate-500 mb-3 block">
          Tactile tap-to-add tags for tracking common foods instantly.
        </p>

        <div className="grid grid-cols-2 gap-1.5">
          {POPULAR_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              onClick={() => handleApplyTemplate(tpl)}
              id={`template-btn-${i}`}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-850 text-left transition-all group cursor-pointer"
            >
              <div className="flex flex-col max-w-[80%]">
                <span className="text-[11px] font-medium text-slate-200 truncate">{tpl.name}</span>
                <span className="text-[9px] text-slate-500 mt-0.5">
                  {tpl.calories} kcal • {tpl.protein}g protein
                </span>
              </div>
              <div className="w-5 h-5 rounded-full bg-orange-950/20 group-hover:bg-orange-500 border border-slate-800 group-hover:border-transparent flex items-center justify-center transition-colors">
                <Plus className="w-3 h-3 text-slate-400 group-hover:text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Meals list logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
          Today's Food Journal
        </h3>

        {todaysMeals.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No food entries logged today yet. Enjoy your fasting window!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-56 overflow-y-auto scrollbar-thin">
            {todaysMeals.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex flex-col pr-2">
                  <span className="font-bold text-slate-200">{item.name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.2 bg-slate-950 border border-slate-800 rounded-full font-medium text-[9px]">
                      {item.type}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {item.proteinGrams !== undefined && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400 font-mono">{item.proteinGrams}g pro</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-orange-400 shrink-0">
                    {item.calories} kcal
                  </span>
                  <button
                    onClick={() => onDeleteMeal(item.id)}
                    id={`delete-meal-${item.id}`}
                    aria-label="Delete meal log"
                    className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-slate-950 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
