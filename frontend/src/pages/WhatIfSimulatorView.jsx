import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { runWhatIfSimulation } from '../services/api';

export default function WhatIfSimulatorView({ baselineData }) {
  const baseline = baselineData || {
    treatment_name: 'Cataract Surgery',
    treatment_cost: 75000,
    room_type: 'Standard Single AC',
    hospital_type: 'Private',
    city: 'Pune',
    policy_start_date: '2022-01-01',
    treatment_date: '2024-03-15'
  };

  const [simCost, setSimCost] = useState(100000);
  const [simRoomType, setSimRoomType] = useState('Standard Single AC');
  const [simHospitalType, setSimHospitalType] = useState('Private');
  const [simCopay, setSimCopay] = useState(10);
  const [simDeductible, setSimDeductible] = useState(10000);

  const [simResult, setSimResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    runSim();
  }, [simCost, simRoomType, simHospitalType, simCopay, simDeductible]);

  const runSim = async () => {
    setIsLoading(true);
    try {
      const res = await runWhatIfSimulation({
        baseline: {
          treatment_name: baseline.treatment_name || 'Cataract Surgery',
          treatment_cost: baseline.treatment_cost || 75000,
          room_type: baseline.room_type || 'Standard Single AC',
          hospital_type: baseline.hospital_type || 'Private',
          city: baseline.city || 'Pune',
          policy_start_date: baseline.policy_start_date || '2022-01-01',
          treatment_date: baseline.treatment_date || '2024-03-15'
        },
        modified_cost: parseFloat(simCost),
        modified_room_type: simRoomType,
        modified_hospital_type: simHospitalType,
        modified_copay: parseFloat(simCopay),
        modified_deductible: parseFloat(simDeductible)
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToBaseline = () => {
    setSimCost(baseline.treatment_cost || 75000);
    setSimRoomType(baseline.room_type || 'Standard Single AC');
    setSimHospitalType(baseline.hospital_type || 'Private');
    setSimCopay(10);
    setSimDeductible(10000);
  };

  const bRes = simResult?.baseline_result;
  const sRes = simResult?.scenario_result;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Financial Scenario Sensitivity Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Adjust variables to observe financial exposure shifts between baseline and simulated conditions.
          </p>
        </div>

        <button
          onClick={resetToBaseline}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Main Grid: Controls & Comparison Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Financial Controls (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono border-b border-slate-100 pb-2">
            Scenario Variables
          </h3>

          {/* Treatment Cost */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-600">Simulated Cost:</span>
              <span className="font-mono font-bold text-slate-900">₹{Number(simCost).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="25000"
              max="200000"
              step="5000"
              value={simCost}
              onChange={(e) => setSimCost(e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹25,000</span>
              <span>₹1,00,000 (Test 5)</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          {/* Room Category */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-600 font-medium block">Room Category</label>
            <select
              value={simRoomType}
              onChange={(e) => setSimRoomType(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="Standard Single AC">Standard Single AC (₹5,000 Limit)</option>
              <option value="Deluxe Room">Deluxe Room (Proportionate deduction)</option>
              <option value="Semi-Private Room">Semi-Private Room</option>
              <option value="General Ward">General Ward</option>
            </select>
          </div>

          {/* Co-Pay Override */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-600">Patient Co-Pay %:</span>
              <span className="font-mono font-bold text-slate-900">{simCopay}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={simCopay}
              onChange={(e) => setSimCopay(e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-900"
            />
          </div>

          {/* Deductible Override */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-600">Annual Deductible:</span>
              <span className="font-mono font-bold text-slate-900">₹{Number(simDeductible).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="25000"
              step="2500"
              value={simDeductible}
              onChange={(e) => setSimDeductible(e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-900"
            />
          </div>
        </div>

        {/* RIGHT: Financial Comparison Table & Chart (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Side-by-Side Comparison Table (Section 14) */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Scenario Sensitivity Audit
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Risk Transition: {simResult?.risk_delta}
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                  <th className="py-2 px-4 font-semibold">Financial Metric</th>
                  <th className="py-2 px-4 font-semibold text-right">Baseline</th>
                  <th className="py-2 px-4 font-semibold text-right">Simulated</th>
                  <th className="py-2 px-4 font-semibold text-right">Delta Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-800">Treatment Cost</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-700 text-right">
                    ₹{bRes?.incurred_cost?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-right">
                    ₹{sRes?.incurred_cost?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-right text-slate-700">
                    {simResult?.cost_delta > 0 ? `+₹${simResult.cost_delta.toLocaleString()}` : '₹0'}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-4 text-slate-700">Potential Coverage</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700 text-right">
                    ₹{bRes?.potential_coverage?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-800 text-right">
                    ₹{sRes?.potential_coverage?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-right text-slate-500">
                    ₹{simResult?.coverage_delta?.toLocaleString()} (Capped)
                  </td>
                </tr>

                <tr className="bg-amber-50/70 border-t border-amber-200">
                  <td className="py-3 px-4 font-bold text-amber-900">Estimated Out-of-Pocket</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-800 text-right">
                    ₹{bRes?.estimated_oop?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-950 text-right text-sm">
                    ₹{sRes?.estimated_oop?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-amber-900">
                    {simResult?.oop_delta > 0 ? `+₹${simResult.oop_delta.toLocaleString()}` : '₹0'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Simple Restrained Bar Chart */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Exposure Comparison Visualization
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simResult?.chart_comparison || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={11} />
                  <YAxis tickFormatter={(v) => `₹${v/1000}k`} stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '4px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar dataKey="Baseline" fill="#94a3b8" radius={[2, 2, 0, 0]} barSize={28} />
                  <Bar dataKey="Scenario" fill="#0f172a" radius={[2, 2, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
