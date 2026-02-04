"use client";

import React, { useState } from "react";
import { runSimulation } from "@/lib/api";
import { Info } from "lucide-react";
import { PiFaceMask } from "react-icons/pi";
import { ShieldAlert, BusFront, School, Laptop } from "lucide-react";
import * as Tooltip from '@radix-ui/react-tooltip';


type PolicyOption =
  | "Mask Mandate"
  | "Lockdown"
  | "School Closure"
  | "Travel Ban"
  | "Remote Work";

const POLICY_ICONS: Record<string, any> = {
  "Lockdown": ShieldAlert,
  "Mask Mandate": PiFaceMask,
  "Travel Ban": BusFront,
  "School Closure": School,
  "Remote Work": Laptop,
}

const SectionHeader = ({ title }: { title: string }) => (
  <div className="text-lg font-semibold">
    {title}
  </div>
);

const ToggleRow = ({
  label,
  enabled,
  onToggle,
  icon: IconComponent,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  icon: any;
}) => (
  <div
    onClick={onToggle}
    className="flex items-center justify-between px-3 py-2 m-1 rounded-md bg-slate-800 hover:bg-slate-700 cursor-pointer transition"
  >
    <div className={`${enabled ? "text-sky-400" : "text-slate-500"} group-hover:text-sky-300 transition-colors`}>
        <IconComponent size={16} {...({ children: null } as any)} />
    </div>
    <span className="text-xs font-semibold text-white">{label}</span>
    <div
      className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
        enabled ? "bg-sky-500" : "bg-slate-600"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
          enabled ? "translate-x-4.5" : ""
        }`}
      />
    </div>
  </div>
);

const LabelWithInfo = ({ label, description }: { label: string; description: string }) => (
  <Tooltip.Provider delayDuration={200}>
    <Tooltip.Root>
      <div className="flex items-center gap-1.5">
        <label className="block text-[11px] font-semibold text-slate-300 tracking-tight">
          {label}
        </label>
        
        <Tooltip.Trigger asChild>
          <button className="cursor-help text-slate-500 hover:text-sky-400 transition-colors outline-none">
            <Info size={12} {...({ children: null } as any)} />
          </button>
        </Tooltip.Trigger>

        {/* This "Portal" is what prevents the clipping! */}
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="center"
            sideOffset={5}
            className="z-[100] w-52 rounded-md bg-slate-800 p-2.5 text-[12px] leading-relaxed text-slate-200 shadow-xl border border-slate-700 animate-in fade-in zoom-in duration-200"
          >
            {description}
            <Tooltip.Arrow className="fill-slate-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </div>
    </Tooltip.Root>
  </Tooltip.Provider>
);

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

  function togglePolicy(p: PolicyOption) {
    setSelectedPolicies((prev) =>
        prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleRun() {
    setLoading(true);
    try {
      // Artificial delay to make the loading state + dots visible
      await new Promise((resolve) => setTimeout(resolve, 10000));

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
        <SectionHeader title="Simulation Parameters" />
        <p className="text-xs text-slate-400 mt-1">
          Adjust the simulation parameters and time period.
        </p>
      </div>

      <div className="p-4 space-y-5 overflow-y-auto text-xs">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <LabelWithInfo 
              label="Horizon (days)" 
              description="Total number of days to simulate into the future." 
            />
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
            <LabelWithInfo 
                label="Base R0" 
                description="The average number of secondary infections produced by a single infected individual in a fully susceptible population." 
            />
            <input
              type="text"
              inputMode="decimal"
              value={baseR0}
              onChange={(e) => setBaseR0(parseFloat(e.target.value || "0"))}
              className="mt-0.5 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <LabelWithInfo 
              label="Incubation (days)" 
              description="Average period between exposure to the virus and onset of symptoms." 
            />
            <input
              type="text"
              inputMode="decimal"
              value={incubation}
              onChange={(e) => setIncubation(parseFloat(e.target.value || "0"))}
              className="mt-0.5 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <LabelWithInfo 
              label="Infectious (days)" 
              description="Average duration an infected individual can transmit the virus to others." 
            />
            <input
              type="text"
              inputMode="decimal"
              value={infectious}
              onChange={(e) => setInfectious(parseFloat(e.target.value || "0"))}
              className="mt-0.5 w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <LabelWithInfo 
              label="IFR" 
              description="Infection Fatality Rate: The proportion of deaths among all infected individuals (including asymptomatic cases)." 
            />
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
          <SectionHeader title="Intervention Policies" />
          <div className="mt-1 space-y-2">
            <ToggleRow
              label="City Lockdown"
              enabled={selectedPolicies.includes("Lockdown")}
              onToggle={() => togglePolicy("Lockdown")}
              icon={POLICY_ICONS["Lockdown"]}
            />
            <ToggleRow
              label="Mask Mandate"
              enabled={selectedPolicies.includes("Mask Mandate")}
              onToggle={() => togglePolicy("Mask Mandate")}
              icon={POLICY_ICONS["Mask Mandate"]}
            />
            <ToggleRow
              label="Travel Reduction"
              enabled={selectedPolicies.includes("Travel Ban")}
              onToggle={() => togglePolicy("Travel Ban")}
              icon={POLICY_ICONS["Travel Ban"]}
            />
            <ToggleRow
              label="School Closure"
              enabled={selectedPolicies.includes("School Closure")}
              onToggle={() => togglePolicy("School Closure")}
              icon={POLICY_ICONS["School Closure"]}
            />
            <ToggleRow
              label="Remote Work"
              enabled={selectedPolicies.includes("Remote Work")}
              onToggle={() => togglePolicy("Remote Work")}
              icon={POLICY_ICONS["Remote Work"]}
            />
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          className="mt-2 w-full rounded-md bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-slate-50 py-2 text-xs font-semibold tracking-wide shadow-md shadow-sky-900/40 transition-colors flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-100 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-100 animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-100 animate-bounce [animation-delay:0.3s]" />
            </div>
          ) : (
            "Run Simulation"
          )}
        </button>
      </div>
    </aside>
  );
};

export default BackendParameters;
