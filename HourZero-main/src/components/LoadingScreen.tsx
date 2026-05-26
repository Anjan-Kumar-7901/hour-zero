/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Flame, Hourglass, Zap, Shield, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onBootFinished: () => void;
}

export default function LoadingScreen({ onBootFinished }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Preparing your fasting dashboard...',
    'Loading progress history...',
    'Syncing fasting insights...',
    'Starting Hour Zero...'
  ];

  useEffect(() => {
    // Increment progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 45);

    // Increment text step indicators
    const stepsInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 550);

    // Call onComplete when finished with tiny buffer
    const timeout = setTimeout(() => {
      onBootFinished();
    }, 2400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepsInterval);
      clearTimeout(timeout);
    };
  }, [onBootFinished]);

  return (
    <div id="hourzero-boot-loader" className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-8 font-sans">
      <div />

      {/* Center glowing logo and name */}
      <div className="text-center space-y-4">
        <div className="relative mx-auto flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-orange-500 via-rose-600 to-amber-500 rounded-3xl shadow-2xl shadow-orange-500/20 animate-pulse">
          <Flame className="w-12 h-12 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping" />
        </div>

        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-amber-200 via-orange-400 to-rose-400 bg-clip-text text-transparent">
            HourZero
          </h2>
          <span className="text-[10px] font-mono tracking-[0.2em] font-extrabold text-orange-500/80 uppercase">
            Precision Fasting Companion
          </span>
        </div>
      </div>

      {/* Progress metrics footer block */}
      <div className="w-full max-w-xs space-y-4">
        {/* Dynamic status line */}
        <div className="flex gap-2 items-center justify-center text-[10px] text-slate-400 font-mono">
          <span className="w-2.5 h-2.5 rounded-full border border-orange-500/40 border-t-orange-500 animate-spin" />
          <span className="truncate">{steps[currentStep]}</span>
        </div>

        {/* Progress bar container */}
        <div className="space-y-1">
          <div className="w-full h-[3px] bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
            <span>PWA SYS-V1</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Tactical status details */}
        <p className="text-[9px] text-slate-600 text-center uppercase tracking-tight font-semibold">
          Built for focus, consistency and longevity.
        </p>
      </div>
    </div>
  );
}
