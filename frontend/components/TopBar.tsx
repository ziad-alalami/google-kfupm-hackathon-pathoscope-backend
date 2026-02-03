"use client";

import React, { Activity, useEffect, useState } from "react";
import Image from "next/image";

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

const StatBlock = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="flex flex-col items-end">
    <span className="text-[10px] font-bold text-slate-500 tracking-wider leading-none">{label}</span>
    <span className={`text-lg font-medium tabular-nums ${color} leading-tight`}>
      {value.toLocaleString()}
    </span>
  </div>
);

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
    <header className="relative h-14 w-full flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md z-10">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Activity children={undefined}/>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">PathoScope</p>
          <p className="text-[11px] text-slate-400">City-scale SEIRD simulator</p>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-4 py-1 rounded-full shadow-inner">
          <span className="text-sm font-mono font-bold text-blue-400">
            DAY {currentDay.toString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <StatBlock label="TOTAL INFECTED" value={Math.round(totals.I)} color="text-rose-500" />
        <StatBlock label="RECOVERED" value={Math.round(totals.R)} color="text-emerald-500" />
        <StatBlock label="DEATHS" value={Math.round(totals.D)} color="text-slate-100" />
      </div>
      
    </header>
  );
};

export default TopBar;

/*
<div className="flex items-center gap-8 text-xs">
        <div className="flex flex-col text-[13px] text-slate-300 items-center">
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

      </div>
*/