/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FastingSession, UserSettings, FastingProtocol, getTheme } from '../types';
import { DEFAULT_PROTOCOLS } from '../data';
import { 
  Play, Square, Edit2, CheckCircle2, AlertTriangle, 
  Flame, Moon, Sun, Award, HelpCircle, ChevronRight, Zap
} from 'lucide-react';

interface FastingTimerProps {
  settings: UserSettings;
  activeSession: FastingSession | null;
  onStartFast: (protocolId: string, customOffsetMinutes?: number) => void;
  onEndFast: (wasSuccessful: boolean, endWeight?: number, notes?: string) => void;
  onEditStartTime: (newStartTimeISO: string) => void;
}

export default function FastingTimer({
  settings,
  activeSession,
  onStartFast,
  onEndFast,
  onEditStartTime,
}: FastingTimerProps) {
  const activeTheme = getTheme(settings.appTheme);
  
  // Local state for counting
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedProtoId, setSelectedProtoId] = useState(settings.protocolId || '16-8');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutesBack, setEditMinutesBack] = useState('0');
  const [isEndingShow, setIsEndingShow] = useState(false);
  
  // End session ratings
  const [endWeight, setEndWeight] = useState(settings.currentWeight.toString());
  const [fastNotes, setFastNotes] = useState('');
  const [earlyConfirm, setEarlyConfirm] = useState(false);

  // Protocols lookup
  const currentProto = DEFAULT_PROTOCOLS.find(p => p.id === selectedProtoId) || DEFAULT_PROTOCOLS[0];

  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(activeSession.startTime).getTime();
      const now = new Date().getTime();
      const diffMs = now - start;
      const secs = Math.max(0, Math.floor(diffMs / 1000));
      setElapsedSeconds(secs);
    }, 1000);

    // Initial run
    const start = new Date(activeSession.startTime).getTime();
    const now = new Date().getTime();
    setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));

    return () => clearInterval(interval);
  }, [activeSession]);

  const targetHours = activeSession ? activeSession.plannedDurationHours : currentProto.fastingHours;
  const targetSeconds = targetHours * 3600;
  const progressPercent = Math.min(100, (elapsedSeconds / targetSeconds) * 100);

  // Helper formats
  const formatTimeStr = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);

  // Biological stage estimation helper
  const getFastingStage = (hours: number) => {
    if (hours < 2) {
      return {
        title: 'Anabolic Phase',
        desc: 'Blood sugar and insulin are elevated as your body absorbs food energy.',
        color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30',
        benefit: 'Refueling cell glycogen levels'
      };
    } else if (hours < 12) {
      return {
        title: 'Insulin Peak Descent',
        desc: 'Insulin levels begin a distinct glide path toward base. Blood sugar stabilizes.',
        color: 'text-blue-400 bg-blue-950/40 border-blue-800/30',
        benefit: 'Pancreatic rest cycle active'
      };
    } else if (hours < 16) {
      return {
        title: 'Lipolysis Initiated',
        desc: 'Liver glycogen is dropping. Growth hormone spikes and lipolysis (fat breakdown) starts.',
        color: 'text-amber-400 bg-amber-950/40 border-amber-800/30',
        benefit: 'Fat burning & lipid oxidation'
      };
    } else if (hours < 20) {
      return {
        title: 'Ketosis & Light Autophagy',
        desc: 'Ketone body production escalates. Cellular recycling and cleanups begin.',
        color: 'text-orange-400 bg-orange-950/40 border-orange-800/30',
        benefit: 'Mitochondrial efficiency boost'
      };
    } else {
      return {
        title: 'Deep Autophagy & HGH Peak',
        desc: 'Cells undergo thorough deep renewal. Human Growth Hormone (HGH) peaks up to 5x level.',
        color: 'text-rose-400 bg-rose-950/40 border-rose-800/30',
        benefit: 'Autophagosomal cell cleansing'
      };
    }
  };

  const currentStage = getFastingStage(elapsedSeconds / 3600);

  // Handle manual back-dating of start time
  const handleEditTimeSave = () => {
    if (!activeSession) return;
    const offsetMins = parseInt(editMinutesBack, 10) || 0;
    const originalStart = new Date(activeSession.startTime);
    // subtract editMinutesBack minutes
    const adjustedStart = new Date(originalStart.getTime() - offsetMins * 60000);
    onEditStartTime(adjustedStart.toISOString());
    setIsEditingTime(false);
    setEditMinutesBack('0');
  };

  const handleStartWithOffset = (offsetMins: number) => {
    onStartFast(selectedProtoId, offsetMins);
  };

  const executeEndFast = () => {
    const isSuccess = elapsedSeconds >= targetSeconds;
    onEndFast(isSuccess, parseFloat(endWeight) || settings.currentWeight, fastNotes.trim());
    setIsEndingShow(false);
    setFastNotes('');
    setEarlyConfirm(false);
  };

  return (
    <div id="fasting-timer-tab" className="flex flex-col h-full bg-slate-950 text-white scrollbar-thin overflow-y-auto">
      {/* Upper Status Cards */}
      <div className="p-4 flex-grow flex flex-col items-center justify-center">
        {activeSession ? (
          /* Active fasting presentation */
          <div className="w-full flex flex-col items-center max-w-sm">
            {/* Visual Header */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-4 animate-pulse ${activeTheme.badge}`}>
              <Flame className="w-3.5 h-3.5" />
              <span>ACTIVE FASTING INDUCTION</span>
            </div>

            {/* Circular Timer Display */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-6">
              {/* SVG Circular Dial Backing */}
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-slate-850"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={`stroke-gradient transition-all duration-1000 ${
                    activeTheme.id === 'charcoal' ? 'stroke-orange-500' :
                    activeTheme.id === 'midnight' ? 'stroke-indigo-500' :
                    activeTheme.id === 'forest' ? 'stroke-emerald-500' : 'stroke-purple-500'
                  }`}
                  strokeWidth="6.5"
                  fill="transparent"
                  strokeDasharray="276.4"
                  strokeDashoffset={276.4 - (276.4 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>

              {/* Ticking Content */}
              <div className="text-center z-10">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  ELAPSED TIME
                </span>
                <span className="block text-4xl font-extrabold font-mono tracking-tight text-white mb-1">
                  {formatTimeStr(elapsedSeconds)}
                </span>
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                  progressPercent >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                }`}>
                  {progressPercent.toFixed(1)}% Done
                </span>
                <span className="block text-[10px] text-slate-500 mt-2">
                  Target: {targetHours}h ({currentProto.name.split(' ')[0]})
                </span>
              </div>
            </div>

            {/* Time Indicators (Start vs Target End) */}
            <div className="grid grid-cols-2 gap-4 w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-center mb-4 text-xs">
              <div>
                <span className="block text-slate-400 mb-0.5">Started Fast</span>
                <span className="font-semibold text-slate-200">
                  {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 mb-0.5">Estimated End</span>
                <span className="font-semibold text-slate-200">
                  {new Date(new Date(activeSession.startTime).getTime() + targetSeconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Biological State Box */}
            <div className={`w-full border rounded-xl p-3.5 mb-4 text-xs transition-colors ${currentStage.color}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{currentStage.title}</span>
              </div>
              <p className="text-slate-300 leading-normal">{currentStage.desc}</p>
              <div className="mt-2 pt-2 border-t border-slate-800/40 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Active Target Benefit:</span>
                <span className="font-bold text-white">{currentStage.benefit}</span>
              </div>
            </div>

            {/* Adjust Started Time Button */}
            {isEditingTime ? (
              <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 mb-4 space-y-2">
                <span className="block text-xs font-semibold text-slate-300">
                  Did you forget to start the timer?
                </span>
                <p className="text-[10px] text-slate-400">
                  Shift the start time back by minutes:
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editMinutesBack}
                    id="edit-time-mins"
                    onChange={(e) => setEditMinutesBack(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-2 py-1 text-xs rounded"
                    placeholder="Minutes eg. 60"
                  />
                  <button
                    onClick={handleEditTimeSave}
                    id="edit-time-save"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded font-bold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingTime(false)}
                    id="edit-time-cancel"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTime(true)}
                id="edit-start-time-btn"
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 px-3 py-1 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-full mb-6 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Log earlier start time</span>
              </button>
            )}

            {/* Action Buttons */}
            {isEndingShow ? (
              <div className="w-full bg-slate-900 border border-rose-950/40 rounded-xl p-4 text-xs space-y-3">
                <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Log Fasting Completion</span>
                </h3>

                {elapsedSeconds < targetSeconds ? (
                  <div className="bg-amber-950/20 border border-amber-900/30 text-amber-300 p-2 rounded leading-normal mb-2">
                    🚨 You are completing early. Target is {targetHours} hours. You have done{' '}
                    {(elapsedSeconds / 3600).toFixed(1)} hours.
                    <label className="flex items-center gap-2 mt-2 font-semibold">
                      <input
                        type="checkbox"
                        checked={earlyConfirm}
                        id="early-confirm-chk"
                        onChange={(e) => setEarlyConfirm(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-orange-500 focus:ring-0"
                      />
                      <span>Confirm early break</span>
                    </label>
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 p-2 rounded leading-normal">
                    🎉 Outstanding job! Fasting goal of {targetHours} hours successfully smashed!
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Current Weight:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={endWeight}
                      id="end-weight-input"
                      onChange={(e) => setEndWeight(e.target.value)}
                      className="w-20 bg-slate-950 border border-slate-800 text-center py-1 rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">
                      Fasting Notes / Journal
                    </label>
                    <textarea
                      placeholder="How did you feel? Any physical changes noticed?"
                      value={fastNotes}
                      id="fast-notes-textarea"
                      onChange={(e) => setFastNotes(e.target.value)}
                      className="w-full h-14 bg-slate-950 border border-slate-800 p-2 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    disabled={elapsedSeconds < targetSeconds && !earlyConfirm}
                    onClick={executeEndFast}
                    id="confirm-end-fast"
                    className="flex-grow py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold cursor-pointer"
                  >
                    Log Complete
                  </button>
                  <button
                    onClick={() => setIsEndingShow(false)}
                    id="cancel-end-fast"
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEndingShow(true)}
                id="stop-fast-action-btn"
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 font-bold py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Fast / Break Fast</span>
              </button>
            )}
          </div>
        ) : (
          /* Idle Screen - select protocol and launch fast */
          <div className="w-full flex flex-col items-center max-w-sm">
            <div className="flex items-center gap-1 text-blue-400 bg-blue-900/10 border border-blue-800/20 px-3 py-1 rounded-full text-xs font-semibold mb-6">
              <Moon className="w-3.5 h-3.5" />
              <span>OFFLINE READY EATING WINDOW</span>
            </div>

            {/* Circular Base Selector Visual */}
            <div className="relative w-60 h-60 flex items-center justify-center border-4 border-dashed border-slate-800 rounded-full mb-6">
              <div className="text-center">
                <Flame className="w-12 h-12 text-slate-600 mx-auto mb-2 animate-bounce" />
                <span className="block text-[10px] text-slate-500 uppercase tracking-widening font-bold">
                  STATE INDICATOR
                </span>
                <span className="block text-2xl font-black text-slate-300 mt-0.5">
                  Ready to Start
                </span>
                <span className={`block text-xs mt-1 font-semibold ${activeTheme.primary}`}>
                  Target: {currentProto.fastingHours} Hr Fast
                </span>
              </div>
            </div>

            {/* Protocol Picker Carousel */}
            <div className="w-full space-y-2 mb-6">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider text-center">
                Select Your Fasting Goal
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_PROTOCOLS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProtoId(p.id)}
                    id={`timer-proto-${p.id}`}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
                      selectedProtoId === p.id
                        ? `border-white ${activeTheme.cardBg} font-bold ring-1 ring-white/10`
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-sm font-black text-white">{p.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{p.fastingHours}h fast / {p.eatingHours}h eat</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick offset fast logic (Forgot to start indicator) */}
            <div className="w-full grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => handleStartWithOffset(0)}
                id="start-offset-now"
                className="bg-slate-900 hover:bg-slate-850 text-[11px] font-semibold py-1.5 px-2 rounded border border-slate-800 cursor-pointer"
              >
                Start Now
              </button>
              <button
                onClick={() => handleStartWithOffset(60)}
                id="start-offset-1h"
                className="bg-slate-900 hover:bg-slate-850 text-[11px] text-center font-semibold py-1.5 px-1 rounded border border-slate-800 cursor-pointer"
              >
                Fasting for 1h
              </button>
              <button
                onClick={() => handleStartWithOffset(120)}
                id="start-offset-2h"
                className="bg-slate-900 hover:bg-slate-850 text-[11px] font-semibold py-1.5 px-1.5 rounded border border-slate-800 cursor-pointer"
              >
                Fasting for 2h
              </button>
            </div>

            {/* Main Action Start Button */}
            <button
              onClick={() => onStartFast(selectedProtoId)}
              id="start-fast-main-btn"
              className={`w-full bg-gradient-to-r ${activeTheme.accentGradient} py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl ${activeTheme.glow} active:scale-98 transition-all cursor-pointer`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Initiate Fasting Window</span>
            </button>
          </div>
        )}
      </div>

      {/* Basic biochemical details footer helper */}
      <div className="bg-slate-900/60 border-t border-slate-800/80 p-4">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Biological Adaptations of {currentProto.name}</span>
        </h4>
        <p className="text-[11px] text-slate-400 leading-normal">
          {currentProto.description} In intermittent fasting, timing your meals reduces calorie load, improves insulin sensitivity, supports visceral fat reduction, and improves mental acuity.
        </p>
      </div>
    </div>
  );
}
