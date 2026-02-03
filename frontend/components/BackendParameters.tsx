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
  const [threatProfile, setThreatProfile] = useState<"COVID-19" | "MERS" | "Custom">("Custom");
  const [loading, setLoading] = useState(false);

  function applyThreatProfile(profile: "COVID-19" | "MERS" | "Custom") {
    setThreatProfile(profile);
    if (profile === "COVID-19") {
      setBaseR0(3.32);
      setIncubation(6.4);
      setInfectious(10.0);
      setIfr(0.021);
    } else if (profile === "MERS") {
      setBaseR0(0.69);
      setIncubation(5.2);
      setInfectious(15.0);
      setIfr(0.35);
    }
    // Custom leaves whatever the user set
  }

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
        <h2 className="text-lg font-semibold tracking-tight">Simulation Parameters</h2>
        <p className="text-xs text-slate-400 mt-1">
          Adjust the simulation parameters and time period.
        </p>
      </div>

      <div className="p-4 space-y-5 overflow-y-auto text-xs">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-300">
              Horizon (days)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value || "0", 10))}
              className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300">
              Threat Profile
            </label>
            <select
              value={threatProfile}
              onChange={(e) => applyThreatProfile(e.target.value as any)}
              className="mt-1 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="Custom">Custom</option>
              <option value="COVID-19">COVID-19</option>
              <option value="MERS">MERS</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-md bg-slate-900/60 p-3 border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
              Base R0
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={baseR0}
              onChange={(e) => setBaseR0(parseFloat(e.target.value || "0"))}
              className="mt-0.5 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
              Incubation (days)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={incubation}
              onChange={(e) => setIncubation(parseFloat(e.target.value || "0"))}
              className="mt-0.5 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
              Infectious (days)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={infectious}
              onChange={(e) => setInfectious(parseFloat(e.target.value || "0"))}
              className="mt-0.5 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
              IFR
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={ifr}
              onChange={(e) => setIfr(parseFloat(e.target.value || "0"))}
              className="mt-0.5 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-slate-200 tracking-wide mb-1">
            Intervention Policies
          </label>
          <div className="mt-1 space-y-2">
            {["Mask Mandate", "Lockdown", "School Closure", "Travel Ban", "Remote Work"].map(
              (p) => {
                const checked = selectedPolicies.includes(p as PolicyOption);
                return (
                  <div
                    key={p}
                    className="flex items-center justify-between rounded-md bg-slate-900/70 border border-slate-700 px-3 py-2 text-[11px]"
                  >
                    <span className="text-slate-200">{p}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPolicies((prev) =>
                          prev.includes(p as PolicyOption)
                            ? prev.filter((x) => x !== p)
                            : [...prev, p as PolicyOption]
                        );
                      }}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                        checked ? "bg-sky-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                          checked ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
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
