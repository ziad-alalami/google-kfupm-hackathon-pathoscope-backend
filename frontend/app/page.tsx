'use client';

import React, { useState, useEffect, use } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import { getAllNodes, deleteNode, createNode } from "@/lib/api";
import ChatWidget from '../components/ChatWidget';
import BackendParameters from '../components/BackendParameters';  
import NodeDetailsPanel, { UINode } from "../components/NodeDetailsPanel";
import TopBar from "../components/TopBar";

export type SimulationFrame = {
  day: number;
  nodes_state: Record<string, { S: number; E: number; I: number; R: number; D: number }>;
};

function computeTotals(frame: SimulationFrame | undefined) {
  const base = { S: 0, E: 0, I: 0, R: 0, D: 0 };
  if (!frame) return base;
  return Object.values(frame.nodes_state).reduce(
    (acc, s) => ({
      S: acc.S + s.S,
      E: acc.E + s.E,
      I: acc.I + s.I,
      R: acc.R + s.R,
      D: acc.D + s.D,
    }),
    base
  );
}

export default function SimulationDashboard() {
  const [selectedNode, setSelectedNode] = useState<UINode | null>(null);
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [frames, setFrames] = useState<SimulationFrame[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [createDraft, setCreateDraft] = useState<{
    open: boolean;
    lat: number;
    lon: number;
    name: string;
    region: string;
    population: number;
    mobility_coefficient: number;
    initial_infected: number;
  }>({
    open: false,
    lat: 0,
    lon: 0,
    name: "",
    region: "Riyadh",
    population: 10000,
    mobility_coefficient: 0.1,
    initial_infected: 0,
  });

  const currentFrame =
    frames.length > 0
      ? frames[Math.min(Math.max(currentDayIndex, 0), frames.length - 1)]
      : undefined;
  const totals = computeTotals(currentFrame);

  // Get all nodes on mount to show as list 
  useEffect(() => {
    getAllNodes().then((nodes) => {
      console.log("Fetched nodes:", nodes);
      setAllNodes(nodes);
    });
  }, []);

  // Keep selected node's SEIRD state in sync with the current frame
  useEffect(() => {
    if (!selectedNode || !currentFrame) return;
    const state = currentFrame.nodes_state[selectedNode.name];
    if (!state) return;
    setSelectedNode((prev) =>
      prev && prev.node_id === selectedNode.node_id
        ? { ...prev, current_state: state }
        : prev
    );
  }, [currentFrame, selectedNode?.node_id]);

  // Auto-play simulation when "playing" is true
  useEffect(() => {
    if (!playing || frames.length === 0) return;
    const id = window.setInterval(() => {
      setCurrentDayIndex((prev) => {
        const next = prev + 1;
        if (next >= frames.length) {
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, 500);
    return () => window.clearInterval(id);
  }, [playing, frames.length]);

  async function handleDeleteNode(node: UINode) {
    const areaName = node.region || node.name;
    const ok = window.confirm(
      `Are you sure you want to delete the node in ${areaName}?`
    );
    if (!ok) return;
    try {
      await deleteNode(node.node_id);
      // Simple hack for now: reload to refetch nodes from backend
      window.location.reload();
    } catch (e) {
      console.error("Failed to delete node", e);
      alert("Failed to delete node. Check console for details.");
    }
  }

  async function handleCreateConfirm() {
    try {
      await createNode({
        name: createDraft.name || "New Node",
        region: createDraft.region,
        lat: createDraft.lat,
        lon: createDraft.lon,
        population: createDraft.population,
        mobility_coefficient: createDraft.mobility_coefficient,
        initial_infected: createDraft.initial_infected,
      });
      window.location.reload();
    } catch (e) {
      console.error("Failed to create node", e);
      alert("Failed to create node. Check console for details.");
    }
  }

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-slate-950 text-slate-50">
      <div className="flex flex-1 flex-col">
        <TopBar totals={totals} currentDay={currentFrame ? currentFrame.day : 0} />
        <div className="flex flex-1 min-h-0">
          <NodeDetailsPanel 
            nodes={allNodes}
            node={selectedNode} 
            onDelete={handleDeleteNode}
            onNodeClick={setSelectedNode} 
          />
          <div className="flex-1 relative min-w-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <InteractiveMap
                onNodeHover={() => {}}
                onNodeClick={setSelectedNode}
                onBackgroundClick={({ lat, lon }) => {
                  setCreateDraft((prev) => ({
                    ...prev,
                    open: true,
                    lat,
                    lon,
                  }));
                }}
                frames={frames}
                currentDayIndex={currentDayIndex}
              />
            </div>
            {/* Timeline + play controls – always visible, disabled before first simulation */}
            <div className="h-20 border-t border-slate-800 bg-slate-900/80 flex flex-col items-center justify-center px-4 gap-2 relative z-20">
              <input
                type="range"
                min={0}
                max={Math.max(frames.length - 1, 0)}
                value={Math.min(currentDayIndex, Math.max(frames.length - 1, 0))}
                onChange={(e) => setCurrentDayIndex(parseInt(e.target.value, 10))}
                disabled={frames.length === 0}
                className="w-full disabled:opacity-40"
              />
              <button
                onClick={() => frames.length > 0 && setPlaying((p) => !p)}
                disabled={frames.length === 0}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white shadow-md shadow-sky-900/50 disabled:shadow-none text-base"
              >
                <span className="leading-none">
                  {playing ? "⏸" : "⏵"}
                </span>
              </button>
            </div>
          </div>
          <BackendParameters
            onSimulationComplete={(results: any[]) => {
              // Backend returns a plain List[SimulationResult] (one per day)
              const normalized = Array.isArray(results) ? results : [];
              setFrames(normalized);
              setCurrentDayIndex(0);
              setPlaying(true);
            }}
          />
        </div>
      </div>

      {createDraft.open && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-80 space-y-3 text-xs">
            <h2 className="text-sm font-semibold">Create Node</h2>
            <p className="text-[11px] text-slate-400">
              Coordinates are taken from where you clicked on the map. Adjust any fields
              before confirming.
            </p>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-300">Lat</label>
                  <input
                    type="number"
                    value={createDraft.lat}
                    onChange={(e) =>
                      setCreateDraft((p) => ({ ...p, lat: parseFloat(e.target.value || "0") }))
                    }
                    className="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300">Lon</label>
                  <input
                    type="number"
                    value={createDraft.lon}
                    onChange={(e) =>
                      setCreateDraft((p) => ({ ...p, lon: parseFloat(e.target.value || "0") }))
                    }
                    className="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300">Name</label>
                <input
                  type="text"
                  value={createDraft.name}
                  onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300">Region</label>
                <select
                  value={createDraft.region}
                  onChange={(e) => setCreateDraft((p) => ({ ...p, region: e.target.value }))}
                  className="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                >
                  <option value="Riyadh">Riyadh</option>
                  <option value="Jeddah">Jeddah</option>
                  <option value="Eastern Province">Eastern Province</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-300">Population</label>
                  <input
                    type="number"
                    value={createDraft.population}
                    onChange={(e) =>
                      setCreateDraft((p) => ({
                        ...p,
                        population: parseInt(e.target.value || "0", 10),
                      }))
                    }
                    className="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300">Initial infected</label>
                  <input
                    type="number"
                    value={createDraft.initial_infected}
                    onChange={(e) =>
                      setCreateDraft((p) => ({
                        ...p,
                        initial_infected: parseInt(e.target.value || "0", 10),
                      }))
                    }
                    className="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300">Mobility coefficient</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  value={createDraft.mobility_coefficient}
                  onChange={(e) =>
                    setCreateDraft((p) => ({
                      ...p,
                      mobility_coefficient: parseFloat(e.target.value || "0"),
                    }))
                  }
                  className="mt-1 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                className="px-3 py-1 text-[11px] rounded-md border border-slate-700 text-slate-200"
                onClick={() => setCreateDraft((p) => ({ ...p, open: false }))}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 text-[11px] rounded-md bg-sky-600 hover:bg-sky-500 text-slate-50"
                onClick={handleCreateConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget />
    </main>
  );
}
