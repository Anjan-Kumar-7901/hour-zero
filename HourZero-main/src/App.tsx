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
  const [simulatedMobileFrame, setSimulatedMobileFrame] = useState(true);

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
      // Lazy-populate with dummy historical values so that they can see dynamic charts instantly!
      const initial = generateInitialData();
      
      const defaultSettings: UserSettings = {
        name: 'Fasting Champ',
        targetWeight: 72.0,
        currentWeight: 79.7,
        protocolId: '16-8',
        hasCompletedOnboarding: false, // will show launch screen first
        dailyCalorieTarget: 1800,
        waterTargetMl: 2500,
        appTheme: 'charcoal'
      };

      setSettings(defaultSettings);
      setSessions(initial.sessions);
      setMeals(initial.meals);
      setWeights(initial.weights);
      setWaterLogs([
        { id: 'w-init-1', timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), amountMl: 500 },
        { id: 'w-init-2', timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), amountMl: 1000 }
      ]);
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
      setTempTheme(settings.appTheme || 'charcoal');
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

    alert('Settings successfully, locally saved in iPhone index storage!');
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
              Application Preferences
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 py-1.5 px-3 rounded text-xs"
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
                      className="w-full bg-slate-950 border border-slate-800 py-1.5 px-2 rounded text-xs font-mono"
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
                      className="w-full bg-slate-950 border border-slate-800 py-1.5 px-2 rounded text-xs font-mono"
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
                      className="w-full bg-slate-950 border border-slate-800 py-1.5 px-2 rounded text-xs font-mono"
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
                          onClick={() => setTempTheme(key)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                            isSelected 
                              ? 'border-white bg-slate-850 font-bold text-white' 
                              : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border border-slate-900 ${
                            key === 'charcoal' ? 'bg-orange-500' :
                            key === 'midnight' ? 'bg-indigo-500' :
                            key === 'forest' ? 'bg-emerald-500' : 'bg-purple-500'
                          }`} />
                          <span className="truncate">{tInfo.name.split(' ')[0]} Theme</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-lg font-bold text-xs cursor-pointer text-white transition-all ${
                  tempTheme === 'charcoal' ? 'bg-orange-600 hover:bg-orange-500' :
                  tempTheme === 'midnight' ? 'bg-indigo-600 hover:bg-indigo-500' :
                  tempTheme === 'forest' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-purple-600 hover:bg-purple-500'
                }`}
              >
                Save Preferences
              </button>
            </form>

            {/* Clear database action */}
            <div className="bg-slate-900 border border-red-950/40 rounded-xl p-4 space-y-2">
              <span className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Erase Local State Cache</span>
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                This removes all local calorie lists, weights trendlines, and completed fast intervals stored securely in this browser iframe.
              </p>
              <button
                onClick={handleClearAllData}
                className="w-full bg-red-950/20 hover:bg-red-950 border border-red-800/60 text-red-200 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset Database Memory
              </button>
            </div>
            
            {/* Developer Details */}
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-center font-sans">
              <span className="text-[10px] text-slate-500 font-mono italic">
                Fasting Timer PWA System - v1.0.0
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
      
      {/* Top Banner instructing how to make it a stunning PWA on iPhone */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-yellow-400/10 rounded text-yellow-400">
            <Info className="w-5 h-5 shrink-0" />
          </span>
          <div>
            <h2 className="text-xs md:text-sm font-bold text-white">
              No MacBook Required — Zero Apple Developer Costs!
            </h2>
            <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">
              This app behaves as an elite iOS App on your iPhone inside Safari using PWA standards.
            </p>
          </div>
        </div>

        {/* View mode buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setSimulatedMobileFrame(true)}
            className={`flex items-center gap-1 text-[11px] py-1 px-2.5 rounded font-semibold transition-all cursor-pointer ${
              simulatedMobileFrame 
                ? `${activeTheme.accent} text-white font-bold shadow` 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 iPhone Shell</span>
          </button>
          
          <button
            onClick={() => setSimulatedMobileFrame(false)}
            className={`flex items-center gap-1 text-[11px] py-1 px-2.5 rounded font-semibold transition-all cursor-pointer ${
              !simulatedMobileFrame 
                ? `${activeTheme.accent} text-white font-bold shadow` 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>💻 Full screen</span>
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="flex-grow flex flex-col md:flex-row justify-center items-center gap-6 p-4 overflow-hidden h-0 shrink-0">
        
        {/* Left column - instructions on how to install it to iPhone */}
        <div className="hidden lg:flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 max-w-sm shrink-0 shadow-lg justify-center self-stretch overflow-y-auto">
          <div className="flex items-center gap-2 text-orange-400 mb-3">
            <Share className="w-5 h-5" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider">PWA Export Instructions</h4>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            A **Progressive Web App (PWA)** bypasses Apple store friction by compiling directly on your device. Follow these exact steps to load it on your home screen:
          </p>

          <ol className="space-y-3.5 text-xs text-slate-400">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-orange-950/40 text-orange-400 font-bold border border-orange-500/20 text-[10px] rounded-full flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-slate-200 block">Deploy or Host</strong>
                Deploy this app or push to free services like **GitHub Pages** or **Cloud Run**.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-orange-950/40 text-orange-400 font-bold border border-orange-500/20 text-[10px] rounded-full flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-slate-200 block">Open in mobile Safari</strong>
                Navigate to the URL on your iPhone using the Safari Browser.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-orange-950/40 text-orange-400 font-bold border border-orange-500/20 text-[10px] rounded-full flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-slate-200 block">Tap the "Share" Button</strong>
                Press the iOS Share button (<Share className="w-3.5 h-3.5 inline mx-0.5" />) in Safari's bottom toolbar.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-orange-950/40 text-orange-400 font-bold border border-orange-500/20 text-[10px] rounded-full flex items-center justify-center shrink-0">4</span>
              <div>
                <strong className="text-slate-200 block">Click "Add to Home Screen"</strong>
                Select the "Add to Home Screen" (<ArrowUpToLine className="w-3.5 h-3.5 inline mx-0.5" />) action inside Safari options list.
              </div>
            </li>
          </ol>

          <div className="mt-5 pt-4 bg-slate-950/50 border-t border-slate-800 rounded p-3 text-[10px] text-slate-500">
            Once saved: The app launches without address bars, features double-tap safety, and stores fasting states indefinitely inside index local storage.
          </div>
        </div>

        {/* Right column / Center - Mobile preview frame shell */}
        <div className={`flex flex-col h-full w-full max-h-[812px] transition-all duration-300 ${
          simulatedMobileFrame 
            ? 'max-w-[375px] rounded-[48px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl relative outline outline-4 outline-slate-900/60 overflow-hidden' 
            : 'max-w-4xl border border-slate-850 rounded-2xl bg-neutral-900 shadow-2xl overflow-hidden'
        }`}>
          
          {/* Simulated Mobile Device Top Notch / Status Bar */}
          {simulatedMobileFrame && (
            <div className="bg-slate-950 text-white px-6 pt-3 pb-2 flex justify-between items-center text-[10px] font-bold select-none z-30 shrink-0">
              <span className="font-mono">9:41</span>
              {/* Camera Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-full flex items-center justify-center" />
              <div className="flex items-center gap-1">
                <span>LTE</span>
                <span className="w-[15px] h-[9px] bg-white rounded-xs inline-block relative ml-0.5">
                  <span className="absolute right-[-2px] top-[2px] w-[2px] h-[5px] bg-white rounded-r-xs" />
                </span>
              </div>
            </div>
          )}

          {/* Core Screen Space */}
          <div className="flex-grow overflow-hidden relative flex flex-col bg-slate-950">
            {settings && !settings.hasCompletedOnboarding ? (
              <SplashOpening onComplete={handleOnboardingComplete} />
            ) : settings ? (
              <>
                {/* Active Inner Screen Space */}
                <div className="flex-grow overflow-hidden">
                  {renderTabContent()}
                </div>

                {/* Simulated iOS Safari bottom navigation tabs controller */}
                <div className="bg-slate-900/95 border-t border-slate-850/80 backdrop-blur-md flex justify-around py-3 shrink-0">
                  <button
                    onClick={() => setActiveTab('timer')}
                    id="tab-select-timer"
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-transform cursor-pointer ${
                      activeTab === 'timer' ? `${activeTheme.primary} scale-102 font-black` : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Flame className={`w-5 h-5 ${activeTab === 'timer' ? 'opacity-90' : ''}`} />
                    <span>Timer</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('meals')}
                    id="tab-select-meals"
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-transform cursor-pointer ${
                      activeTab === 'meals' ? `${activeTheme.primary} scale-102 font-black` : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Utensils className={`w-5 h-5 ${activeTab === 'meals' ? 'opacity-90' : ''}`} />
                    <span>Calories</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('dashboard')}
                    id="tab-select-dashboard"
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-transform cursor-pointer ${
                      activeTab === 'dashboard' ? `${activeTheme.primary} scale-102 font-black` : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingDown className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    id="tab-select-settings"
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-transform cursor-pointer ${
                      activeTab === 'settings' ? `${activeTheme.primary} scale-102 font-black` : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </div>
              </>
            ) : (
              // Loading fallback if settings loads asynchronously
              <div className="flex-grow flex flex-col items-center justify-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-xs mt-2 font-mono">Initializing local fast indexes...</span>
              </div>
            )}
          </div>

          {/* Simulated iOS physical bottom grab bar */}
          {simulatedMobileFrame && (
            <div className="bg-slate-950 pb-2 flex justify-center shrink-0 select-none">
              <span className="w-32 h-1 bg-slate-800 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
