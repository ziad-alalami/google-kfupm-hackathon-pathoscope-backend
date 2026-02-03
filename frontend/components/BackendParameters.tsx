"use client";

import React, { useState } from "react";
import { runSimulation } from "@/lib/api";

type PolicyOption =
  | "Mask Mandate"
  | "Lockdown"
  | "School Closure"
  | "Travel Ban"
  | "Remote Work";

const BackendParameters: React.FC<{ onSimulationComplete?: (results: any[]) => void }> = ({
  onSimulationComplete,
}) => {
  const [horizon, setHorizon] = useState(30);
  const [baseR0, setBaseR0] = useState(3.28);
  const [incubation, setIncubation] = useState(5.0);
  const [infectious, setInfectious] = useState(7.0);
  const [ifr, setIfr] = useState(0.02);
  const [selectedPolicies, setSelectedPolicies] = useState<PolicyOption[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    try {
      const body: any = {
        simulation_horizon_days: horizon,
        disease_parameters: {
          base_r0: baseR0,
          incubation_period_days: incubation,
          infectious_period_days: infectious,
          infection_fatality_rate: ifr,
        },
        active_policies: selectedPolicies.map((p) => ({
          policy_type: p,
          impact_on_r0: p === "Lockdown" ? 0.5 : 0.85,
          impact_on_mobility: p === "Lockdown" ? 0.1 : 0.9,
        })),
      };

      const results = await runSimulation(body);
      if (onSimulationComplete) onSimulationComplete(results);
      // results is a list[SimulationResult] from backend
    } catch (e) {
      console.error("Simulation failed", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="w-80 shrink-0 border-l border-slate-800 bg-slate-900/80 backdrop-blur-md text-slate-100 flex flex-col shadow-lg">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold tracking-tight">Simulation Config</h2>
        <p className="text-xs text-slate-400 mt-1">
          These map directly to the backend SEIRD simulation DTO.
        </p>
      </div>

      <div className="p-4 space-y-5 overflow-y-auto text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-300">
            Horizon (days)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            value={horizon}
            onChange={(e) => setHorizon(parseInt(e.target.value || "0", 10))}
            className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300">
              Base R0
            </label>
            <input
              type="number"
              step="0.01"
              value={baseR0}
              onChange={(e) => setBaseR0(parseFloat(e.target.value || "0"))}
              className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300">
              Incubation (days)
            </label>
            <input
              type="number"
              step="0.1"
              value={incubation}
              onChange={(e) => setIncubation(parseFloat(e.target.value || "0"))}
              className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300">
              Infectious (days)
            </label>
            <input
              type="number"
              step="0.1"
              value={infectious}
              onChange={(e) => setInfectious(parseFloat(e.target.value || "0"))}
              className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300">
              IFR
            </label>
            <input
              type="number"
              step="0.0001"
              value={ifr}
              onChange={(e) => setIfr(parseFloat(e.target.value || "0"))}
              className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300">
            Policies (multi-select)
          </label>
          <div className="mt-1 grid grid-cols-1 gap-1">
            {["Mask Mandate", "Lockdown", "School Closure", "Travel Ban", "Remote Work"].map(
              (p) => {
                const checked = selectedPolicies.includes(p as PolicyOption);
                return (
                  <label
                    key={p}
                    className="flex items-center gap-2 text-[11px] text-slate-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedPolicies((prev) => {
                          if (e.target.checked) {
                            return [...prev, p as PolicyOption];
                          }
                          return prev.filter((x) => x !== p);
                        });
                      }}
                      className="h-3 w-3 rounded border-slate-600 bg-slate-900"
                    />
                    <span>{p}</span>
                  </label>
                );
              }
            )}
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          className="mt-2 w-full rounded-md bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-slate-50 py-2 text-xs font-semibold tracking-wide shadow-md shadow-sky-900/40 transition-colors"
        >
          {loading ? "Running..." : "Run Simulation"}
        </button>
      </div>
    </aside>
  );
};

export default BackendParameters;
