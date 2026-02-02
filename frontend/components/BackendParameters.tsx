import React from "react";

const BackendParameters = () => {
    return (
        <aside className="w-80 border-l bg-white flex flex-col shadow-sm">
        <div className="p-4 border-b font-bold text-lg">Simulation Config</div>
        <div className="p-4 space-y-6">
          
          {/* Example Input for R0 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Basic Reproduction Number (R0)</label>
            <input type="range" className="w-full mt-2" />
          </div>

          {/* Example Input for Policy Multipliers */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Social Distancing Index</label>
            <select className="w-full mt-1 p-2 border rounded-md">
              <option>None</option>
              <option>Partial Lockdown</option>
              <option>Strict Lockdown</option>
            </select>
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition">
            Run Simulation
          </button>
        </div>
      </aside>
    );
};

export default BackendParameters;