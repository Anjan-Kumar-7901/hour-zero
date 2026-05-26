/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserSettings, FastingSession, MealLog, WaterLog, WeightLog, getTheme, HourZeroThemes } from './types';
import { generateInitialData } from './data';
import SplashOpening from './components/SplashOpening';
import FastingTimer from './components/FastingTimer';
import MealsNoting from './components/MealsNoting';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';

import { 
  Flame, Utensils, TrendingDown, Settings, 
  RefreshCw, Plus, Trash2, Smartphone, Monitor, Info, 
  Compass, Share, ArrowUpToLine, ShieldAlert
} from 'lucide-react';

export default function App() {
  // Configured states
  const [isBooting, setIsBooting] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [sessions, setSessions] = useState<FastingSession[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'timer' | 'meals' | 'dashboard' | 'settings'>('timer');
  const [activeSession, setActiveSession] = useState<FastingSession | null>(null);  

  // Settings modification fields
  const [tempName, setTempName] = useState('');
  const [tempTargetWeight, setTempTargetWeight] = useState('');
  const [tempCalorieTarget, setTempCalorieTarget] = useState('');
  const [tempWaterTarget, setTempWaterTarget] = useState('');
  const [tempTheme, setTempTheme] = useState<'charcoal' | 'midnight' | 'forest' | 'amethyst'>('charcoal');

  // Loaded once on boot
  useEffect(() => {
    const savedSettings = localStorage.getItem('fasting_user_settings');
    const savedSessions = localStorage.getItem('fasting_sessions');
    const savedMeals = localStorage.getItem('fasting_meals');
    const savedWater = localStorage.getItem('fasting_water');
    const savedWeights = localStorage.getItem('fasting_weights');
    const savedActiveSession = localStorage.getItem('fasting_active_session');

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
      setSessions(savedSessions ? JSON.parse(savedSessions) : []);
      setMeals(savedMeals ? JSON.parse(savedMeals) : []);
      setWaterLogs(savedWater ? JSON.parse(savedWater) : []);
      setWeights(savedWeights ? JSON.parse(savedWeights) : []);
      if (savedActiveSession) {
        setActiveSession(JSON.parse(savedActiveSession));
      }
    } else {
      const defaultSettings: UserSettings = {
        name: '',
        targetWeight: 72,
        currentWeight: 80,
        protocolId: '16-8',
        hasCompletedOnboarding: false,
        dailyCalorieTarget: 1800,
        waterTargetMl: 2500,
        appTheme: 'charcoal'
      };

      setSettings(defaultSettings);
      setSessions([]);
      setMeals([]);
      setWeights([]);
      setWaterLogs([]);
    }
  }, []);

  // Sync to local storage on changes
  useEffect(() => {
    if (settings) {
      localStorage.setItem('fasting_user_settings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('fasting_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('fasting_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('fasting_water', JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem('fasting_weights', JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('fasting_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('fasting_active_session');
    }
  }, [activeSession]);

  // Sync settings state variables when tab loads
  useEffect(() => {
    if (settings) {
      setTempName(settings.name);
      setTempTargetWeight(settings.targetWeight.toString());
      setTempCalorieTarget(settings.dailyCalorieTarget.toString());
      setTempWaterTarget(settings.waterTargetMl.toString());
      const mappedTheme = settings.appTheme === 'amethyst' ? 'amethyst' : (settings.appTheme || 'charcoal');
      setTempTheme(mappedTheme);
    }
  }, [settings, activeTab]);

  // Actions
  const handleOnboardingComplete = (newSettings: UserSettings) => {
    setSettings(newSettings);
    // Push initial weight log
    const todayStr = new Date().toISOString().split('T')[0];
    const exists = weights.find(w => w.date === todayStr);
    if (!exists) {
      const updatedWeights = [...weights, {
        id: `weight-${Date.now()}`,
        date: todayStr,
        weight: newSettings.currentWeight
      }];
      setWeights(updatedWeights);
    }
  };

  const handleStartFast = (protocolId: string, customOffsetMinutes?: number) => {
    const plannedHours = protocolId === '16-8' ? 16 : protocolId === '18-6' ? 18 : protocolId === '20-4' ? 20 : 24;
    let startTime = new Date();
    
    // Apply offset if retroactively started
    if (customOffsetMinutes) {
      startTime = new Date(startTime.getTime() - customOffsetMinutes * 60000);
    }

    const session: FastingSession = {
      id: `session-${Date.now()}`,
      startTime: startTime.toISOString(),
      plannedDurationHours: plannedHours,
      isCompleted: false,
      wasSuccessful: false,
    };

    setActiveSession(session);
    setActiveTab('timer');
  };

  const handleEndFast = (wasSuccessful: boolean, endWeight?: number, notes?: string) => {
    if (!activeSession) return;

    const completed: FastingSession = {
      ...activeSession,
      endTime: new Date().toISOString(),
      isCompleted: true,
      wasSuccessful,
      notes,
      endWeight,
    };

    setSessions(prev => [...prev, completed]);
    setActiveSession(null);

    // Update weight log with end status if specified
    if (endWeight && settings) {
      const todayStr = new Date().toISOString().split('T')[0];
      const weightExists = weights.some(w => w.date === todayStr);

      const newWeights = weightExists 
        ? weights.map(w => w.date === todayStr ? { ...w, weight: endWeight } : w)
        : [...weights, { id: `weight-end-${Date.now()}`, date: todayStr, weight: endWeight }];

      setWeights(newWeights);
      setSettings({
        ...settings,
        currentWeight: endWeight
      });
    }

    setActiveTab('dashboard');
  };

  const handleEditStartTime = (newStartTimeISO: string) => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      startTime: newStartTimeISO
    });
  };

  const handleAddMeal = (mealData: Omit<MealLog, 'id' | 'timestamp'>) => {
    const newMeal: MealLog = {
      ...mealData,
      id: `meal-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setMeals(prev => [...prev, newMeal]);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleAddWater = (amountMl: number) => {
    const newWater: WaterLog = {
      id: `water-${Date.now()}`,
      timestamp: new Date().toISOString(),
      amountMl,
    };
    setWaterLogs(prev => [...prev, newWater]);
  };

  const handleResetWater = () => {
    const todayStr = new Date().toDateString();
    setWaterLogs(prev => prev.filter(w => new Date(w.timestamp).toDateString() !== todayStr));
  };

  const handleAddWeight = (wtVal: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedWeights = weights.filter(w => w.date !== todayStr);
    
    updatedWeights.push({
      id: `weight-log-${Date.now()}`,
      date: todayStr,
      weight: wtVal,
    });

    setWeights(updatedWeights);

    if (settings) {
      setSettings({
        ...settings,
        currentWeight: wtVal
      });
    }
  };

  const handleDeleteWeight = (id: string) => {
    setWeights(prev => prev.filter(w => w.id !== id));
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSettings({
      ...settings,
      name: tempName || settings.name,
      targetWeight: parseFloat(tempTargetWeight) || settings.targetWeight,
      dailyCalorieTarget: parseInt(tempCalorieTarget, 10) || settings.dailyCalorieTarget,
      waterTargetMl: parseInt(tempWaterTarget, 10) || settings.waterTargetMl,
      appTheme: tempTheme,
    });

    alert('Settings successfully saved locally in iPhone index storage!');
  };

  const handleClearAllData = () => {
    if (confirm('Are you absolutely sure you want to clear your local fasting indexes? This restores onboarding states.')) {
      localStorage.clear();
      setSettings(null);
      setSessions([]);
      setMeals([]);
      setWaterLogs([]);
      setWeights([]);
      setActiveSession(null);
      setActiveTab('timer');
    }
  };

  // Determine current component to render based on Tab selection and Onboarding state
  const renderTabContent = () => {
    if (!settings) return null;

    switch (activeTab) {
      case 'timer':
        return (
          <FastingTimer
            settings={settings}
            activeSession={activeSession}
            onStartFast={handleStartFast}
            onEndFast={handleEndFast}
            onEditStartTime={handleEditStartTime}
          />
        );
      case 'meals':
        return (
          <MealsNoting
            settings={settings}
            meals={meals}
            waterLogs={waterLogs}
            onAddMeal={handleAddMeal}
            onDeleteMeal={handleDeleteMeal}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            settings={settings}
            sessions={sessions}
            weights={weights}
            onAddWeight={handleAddWeight}
            onDeleteWeight={handleDeleteWeight}
            onDeleteSession={handleDeleteSession}
          />
        );
      case 'settings':
        return (
          <div className="p-4 space-y-4 text-white scrollbar-thin overflow-y-auto h-full">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
              Settings
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-3 bg-slate-900 border border-white/10 rounded-xl p-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 py-1.5 px-3 rounded text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Target (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempTargetWeight}
                      onChange={(e) => setTempTargetWeight(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 py-1.5 px-2 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Calories budget
                    </label>
                    <input
                      type="number"
                      value={tempCalorieTarget}
                      onChange={(e) => setTempCalorieTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 py-1.5 px-2 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Water Goal (ml)
                    </label>
                    <input
                      type="number"
                      value={tempWaterTarget}
                      onChange={(e) => setTempWaterTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 py-1.5 px-2 rounded text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850/60">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">
                    App Workspace Design Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(HourZeroThemes) as Array<keyof typeof HourZeroThemes>).map((key) => {
                      const tInfo = HourZeroThemes[key];
                      const isSelected = tempTheme === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setTempTheme(key as 'charcoal' | 'midnight' | 'forest' | 'amethyst')}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                            isSelected
                              ? 'border-[#FF8A00]/30 bg-[#16181D] font-bold text-white'
                              : 'border-white/10 bg-[#16181D] hover:bg-[#1B1E24] text-slate-400'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-[#FF8A00]" />
                          <span className="truncate">{tInfo.name.split(' ')[0]} Theme</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg font-bold text-xs cursor-pointer text-white transition-all bg-[#FF8A00] hover:bg-[#FF9F26]"
              >
                Save Preferences
              </button>
            </form>

            {/* Clear database action */}
            <div className="bg-slate-900 border border-red-950/40 rounded-xl p-4 space-y-2">
              <span className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Reset App Data</span>
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                  This permanently removes all fasting history, weight logs and nutrition records stored on this device.
              </p>
              <button
                onClick={handleClearAllData}
                className="w-full bg-transparent hover:bg-red-500/10 border border-red-500/30 text-red-400 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Clear All Data
              </button>
            </div>
            
            {/* Developer Details */}
            <div className="p-3 bg-slate-950 border border-white/10 rounded-lg text-center font-sans">
              <span className="text-[10px] text-slate-500 font-mono italic">
                Hour Zero - v1.0.0
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const activeTheme = getTheme(settings?.appTheme);

  if (isBooting) {
    return <LoadingScreen onBootFinished={() => setIsBooting(false)} />;
  }

  return (
  <div className={`min-h-screen text-slate-100 flex flex-col font-sans transition-all duration-300 ${activeTheme.bg}`}>
    <div className="flex flex-col justify-center items-center p-4 flex-grow">
      <div className="w-full max-w-[390px] h-[844px] relative flex flex-col bg-slate-950 rounded-[40px] border border-white/10 overflow-hidden">

        {settings && !settings.hasCompletedOnboarding ? (
          <SplashOpening onComplete={handleOnboardingComplete} />
        ) : settings ? (
          <>
            <div className="flex-grow overflow-y-auto">
              {renderTabContent()}
            </div>

            <div className="bg-slate-900/95 border-t border-white/10 backdrop-blur-md flex justify-around py-3 shrink-0">

              <button
                onClick={() => setActiveTab('timer')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'timer'
                    ? `${activeTheme.primary}`
                    : 'text-slate-400'
                }`}
              >
                <Flame className="w-5 h-5" />
                <span>Timer</span>
              </button>

              <button
                onClick={() => setActiveTab('meals')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'meals'
                    ? `${activeTheme.primary}`
                    : 'text-slate-400'
                }`}
              >
                <Utensils className="w-5 h-5" />
                <span>Calories</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'dashboard'
                    ? `${activeTheme.primary}`
                    : 'text-slate-400'
                }`}
              >
                <TrendingDown className="w-5 h-5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer ${
                  activeTab === 'settings'
                    ? `${activeTheme.primary}`
                    : 'text-slate-400'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>

            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <span className="text-xs mt-2 font-mono">
              Initializing local fast indexes...
            </span>
          </div>
        )}

      </div>
    </div>
  </div>
);
}
