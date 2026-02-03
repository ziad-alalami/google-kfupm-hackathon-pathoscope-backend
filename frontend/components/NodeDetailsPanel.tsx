"use client";

import React from "react";

export type UINode = {
  node_id: string;
  name: string;
  region: string;
  mobility_coefficient: number;
  population: number;
  current_state: {
    S: number;
    E: number;
    I: number;
    R: number;
    D: number;
  };
};

interface Props {
  node: UINode | null;
  onDelete?: (node: UINode) => void;
}

const NodeDetailsPanel: React.FC<Props> = ({ node, onDelete }) => {
  return (
    <aside className="w-80 shrink-0 border-l border-slate-800 bg-slate-900/80 backdrop-blur-md text-slate-100 flex flex-col shadow-lg">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold tracking-tight">Node Details</h2>
        <p className="text-xs text-slate-400 mt-1">
          Hover or click a node on the map to inspect its SEIRD state.
        </p>
      </div>

      {node ? (
        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-base font-semibold">{node.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Region: {node.region || "N/A"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Node ID: <span className="font-mono text-[11px]">{node.node_id}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-md bg-slate-800/80 p-2">
              <p className="text-[11px] text-slate-400">Population</p>
              <p className="text-sm font-semibold">{node.population.toLocaleString()}</p>
            </div>
            <div className="rounded-md bg-slate-800/80 p-2">
              <p className="text-[11px] text-slate-400">Mobility coeff.</p>
              <p className="text-sm font-semibold">{node.mobility_coefficient}</p>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs font-semibold text-slate-300 mb-1">SEIRD state</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-emerald-900/60 p-2">
                <p className="text-[11px] text-emerald-300">S – Susceptible</p>
                <p className="text-sm font-semibold text-emerald-100">{Math.round(node.current_state.S)}</p>
              </div>
              <div className="rounded-md bg-amber-900/60 p-2">
                <p className="text-[11px] text-amber-300">E – Exposed</p>
                <p className="text-sm font-semibold text-amber-100">{Math.round(node.current_state.E)}</p>
              </div>
              <div className="rounded-md bg-rose-900/60 p-2">
                <p className="text-[11px] text-rose-300">I – Infectious</p>
                <p className="text-sm font-semibold text-rose-100">{Math.round(node.current_state.I)}</p>
              </div>
              <div className="rounded-md bg-sky-900/60 p-2">
                <p className="text-[11px] text-sky-300">R – Recovered</p>
                <p className="text-sm font-semibold text-sky-100">{Math.round(node.current_state.R)}</p>
              </div>
              <div className="rounded-md bg-slate-900/80 p-2 col-span-2">
                <p className="text-[11px] text-slate-300">D – Deceased</p>
                <p className="text-sm font-semibold text-slate-100">{Math.round(node.current_state.D)}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 mt-2 flex justify-between items-center">
            <span className="text-[11px] text-slate-500">
              Deleting a node removes it from the simulation graph.
            </span>
            {onDelete && (
              <button
                className="text-[11px] px-2 py-1 rounded-md bg-rose-700 hover:bg-rose-600 text-slate-50"
                onClick={() => onDelete(node)}
              >
                Delete node
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-sm text-slate-500">
            No node selected yet. Hover over or click a circle on the map to see its
            full SEIRD breakdown and metadata here.
          </p>
        </div>
      )}
    </aside>
  );
};

export default NodeDetailsPanel;
