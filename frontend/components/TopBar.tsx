"use client";

import React, { useEffect, useState } from "react";

// Simple aggregation types for SEIRD totals
export type SEIRDTotal = {
  S: number;
  E: number;
  I: number;
  R: number;
  D: number;
};

interface Props {
  totals: SEIRDTotal;
  currentDay: number;
}

const TopBar: React.FC<Props> = ({ totals, currentDay }) => {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow(d.toLocaleString());
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 w-full flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-sky-900/50">
          P
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">PathoScope</p>
          <p className="text-[11px] text-slate-400">City-scale SEIRD simulator</p>
        </div>
      </div>

      <div className="flex items-center gap-8 text-xs">
        <div className="flex flex-col text-[11px] text-slate-300 items-center">
          <span className="text-slate-500">Day {currentDay}</span>
          <div className="flex items-center gap-4 mt-1">
            <div className="text-center">
              <span className="text-emerald-300 mr-1">S</span>
              <span className="text-emerald-100 font-semibold">{Math.round(totals.S)}</span>
            </div>
            <div className="text-center">
              <span className="text-amber-300 mr-1">E</span>
              <span className="text-amber-100 font-semibold">{Math.round(totals.E)}</span>
            </div>
            <div className="text-center">
              <span className="text-rose-300 mr-1">I</span>
              <span className="text-rose-100 font-semibold">{Math.round(totals.I)}</span>
            </div>
            <div className="text-center">
              <span className="text-sky-300 mr-1">R</span>
              <span className="text-sky-100 font-semibold">{Math.round(totals.R)}</span>
            </div>
            <div className="text-center">
              <span className="text-slate-300 mr-1">D</span>
              <span className="text-slate-100 font-semibold">{Math.round(totals.D)}</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono text-right">{now}</div>
      </div>
    </header>
  );
};

export default TopBar;
