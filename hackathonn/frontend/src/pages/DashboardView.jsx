import React, { useState } from 'react';
import { 
  DollarSign, 
  ShieldCheck, 
  Activity, 
  Receipt, 
  Calendar, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  GitCommit,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DecisionTraceTimeline from '../components/DecisionTraceTimeline';

export default function DashboardView({ 
  dashboardData, 
  patients = [],
  selectedPatient,
  onSelectPatient,
  onNavigateToAnalyzer, 
  onNavigateToTrace, 
  onNavigateToWhatIf 
}) {
  const [patientSearch, setPatientSearch] = useState('');

  if (!dashboardData) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        Loading intelligence metrics...
      </div>
    );
  }

  const { policy, demo_scenario, metrics } = dashboardData;
  const recentAppts = metrics?.recent_appointments || [];

  // Filter patients for quick selector
  const filteredPatients = patients.filter(p => 
    !patientSearch || 
    p.full_name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patient_id?.toLowerCase().includes(patientSearch.toLowerCase())
  ).slice(0, 5);

  const exposureChartData = [
    { name: 'Cost', amount: demo_scenario?.incurred_cost || 75000, fill: '#0f172a' },
    { name: 'Coverage', amount: demo_scenario?.potential_coverage || 27000, fill: '#16a34a' },
    { name: 'OOP', amount: demo_scenario?.estimated_oop || 48000, fill: '#d97706' },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Patient Financial Overview Header & Selector */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Healthcare Intelligence Suite
          </span>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            Patient Financial Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Patient: <strong className="text-slate-800">{selectedPatient?.full_name || policy?.policy_holder || 'Rajesh Sharma'}</strong> ({selectedPatient?.patient_id || 'P-DEMO'}) • Plan: <span className="text-slate-700">{policy?.insurer || 'HealthSecure Insurance Ltd.'}</span>
          </p>
        </div>

        {/* Patient Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-500 whitespace-nowrap">Switch Patient:</label>
          <select
            value={selectedPatient?.patient_id || 'P-DEMO'}
            onChange={(e) => {
              const p = patients.find(x => x.patient_id === e.target.value);
              if (p) onSelectPatient(p);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            {patients.slice(0, 15).map(p => (
              <option key={p.patient_id} value={p.patient_id}>
                {p.full_name} ({p.patient_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Primary Financial Metrics (Section 8) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Sum Insured */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">
            Sum Insured
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ₹{policy?.sum_insured?.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Annual Policy Aggregate
          </span>
        </div>

        {/* Metric 2: Treatment Cost */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">
            Treatment Cost
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ₹{demo_scenario?.incurred_cost?.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1 truncate">
            {demo_scenario?.treatment_name || 'Cataract Surgery'} (Est.)
          </span>
        </div>

        {/* Metric 3: Potential Coverage */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Potential Coverage
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              Eligible
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            ₹{demo_scenario?.potential_coverage?.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Capped by ₹40k sub-limit less co-pay
          </span>
        </div>

        {/* Metric 4: Estimated OOP */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Estimated OOP
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-200">
              Patient Share
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800">
            ₹{demo_scenario?.estimated_oop?.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Excess charges + Deductible + Co-Pay
          </span>
        </div>

      </div>

      {/* Main Two-Column Row: Coverage Analysis vs Financial Exposure Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coverage Analysis Schedule (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Coverage Calculation Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic rule calculation applied to active scenario
              </p>
            </div>
            <button
              onClick={() => onNavigateToAnalyzer('Cataract Surgery')}
              className="text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center"
            >
              <span>Modify Incurred Cost</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {/* Clean Enterprise Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/75">
                  <th className="py-2 px-3 font-semibold">Rule Item</th>
                  <th className="py-2 px-3 font-semibold">Clause Term</th>
                  <th className="py-2 px-3 text-right font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr>
                  <td className="py-2 px-3 text-slate-800 font-medium">Incurred Procedure Cost</td>
                  <td className="py-2 px-3 text-slate-500">Hospital day-care fee</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    ₹{demo_scenario?.incurred_cost?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-800">Statutory Sub-Limit</td>
                  <td className="py-2 px-3 text-slate-500">Cataract clause limit (Pg 3)</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                    ₹{demo_scenario?.applicable_sublimit?.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 text-slate-900 font-semibold">Eligible Admissible Base</td>
                  <td className="py-2 px-3 text-slate-500">min(Cost, Sub-limit)</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    ₹{demo_scenario?.eligible_amount?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-800">Annual Deductible</td>
                  <td className="py-2 px-3 text-slate-500">Initial policy threshold</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    − ₹{demo_scenario?.deductible_applied?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-800">Patient Co-Payment (10%)</td>
                  <td className="py-2 px-3 text-slate-500">10% on remaining ₹30,000</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    − ₹{demo_scenario?.patient_copay_amount?.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-emerald-50/70 border-t border-emerald-200">
                  <td className="py-2.5 px-3 text-emerald-900 font-bold">Potential Insurer Coverage</td>
                  <td className="py-2.5 px-3 text-emerald-700">Net estimated claim indemnification</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 text-sm">
                    ₹{demo_scenario?.potential_coverage?.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-amber-50/70 border-t border-amber-200">
                  <td className="py-2.5 px-3 text-amber-900 font-bold">Estimated Out-of-Pocket</td>
                  <td className="py-2.5 px-3 text-amber-700">Total patient liability</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900 text-sm">
                    ₹{demo_scenario?.estimated_oop?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            * Illustrative policy-rule calculation. Actual claim adjudication depends on clinical documentation and insurer medical review.
          </div>
        </div>

        {/* Financial Exposure Breakdown Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Financial Exposure Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Incurred cost vs coverage vs out-of-pocket
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exposureChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis tickFormatter={(v) => `₹${v/1000}k`} stroke="#64748b" fontSize={11} />
                <Tooltip 
                  formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '4px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[3, 3, 0, 0]} barSize={36}>
                  {exposureChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Claim Risk Indicator: <strong className="text-slate-800">{demo_scenario?.claim_risk_level || 'LOW'}</strong>
            </span>
            <button
              onClick={onNavigateToWhatIf}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>Test What-If Sensitivity</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Recent Treatments (from appointments.csv / treatments.csv) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Treatment Activity
            </h3>
            <p className="text-xs text-slate-500">
              Direct verification from appointments.csv and treatments.csv
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {recentAppts.length} recent records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/75">
                <th className="py-2 px-3 font-semibold">Appt ID</th>
                <th className="py-2 px-3 font-semibold">Patient</th>
                <th className="py-2 px-3 font-semibold">Doctor / Provider</th>
                <th className="py-2 px-3 font-semibold">Date</th>
                <th className="py-2 px-3 font-semibold">Reason</th>
                <th className="py-2 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {recentAppts.map((appt) => (
                <tr key={appt.appointment_id} className="hover:bg-slate-50/60">
                  <td className="py-2 px-3 font-mono font-medium text-slate-800">{appt.appointment_id}</td>
                  <td className="py-2 px-3 text-slate-900 font-medium">{appt.patient_name}</td>
                  <td className="py-2 px-3 text-slate-600">{appt.doctor_name}</td>
                  <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{appt.appointment_date}</td>
                  <td className="py-2 px-3 text-slate-700">{appt.reason_for_visit}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      appt.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : appt.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lower Row: Billing History & Decision Trace Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Billing History (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Billing Summary (billing.csv)
              </h3>
              <p className="text-xs text-slate-500">
                Payment settlement and claims status
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                {metrics?.billing_status_distribution?.Paid || 0} Paid
              </span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                {metrics?.billing_status_distribution?.Pending || 0} Pending
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-md border border-slate-200 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Bills</span>
              <span className="text-sm font-bold font-mono text-slate-900">{metrics?.total_treatments || 200}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Invoiced</span>
              <span className="text-sm font-bold font-mono text-slate-900">₹{metrics?.total_billing_amount?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Top Payment Method</span>
              <span className="text-sm font-bold text-slate-900">Insurance / Card</span>
            </div>
          </div>
        </div>

        {/* Decision Trace Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Decision Trace Audit Preview
              </h3>
              <button
                onClick={onNavigateToTrace}
                className="text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center"
              >
                <span>Full Audit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Step-by-step verifiable policy lineage:
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">1. Treatment Incurred Cost</span>
                <span className="font-mono font-bold text-slate-900">₹75,000</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">2. Cataract Sub-Limit (Pg 3)</span>
                <span className="font-mono font-bold text-slate-900">₹40,000</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">3. Waiting Period (24 Mo)</span>
                <span className="text-emerald-700 font-semibold">Verified</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">4. Deductible Applied</span>
                <span className="font-mono font-bold text-slate-900">₹10,000</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-900 font-semibold">5. Potential Coverage</span>
                <span className="font-mono font-bold text-emerald-800">₹27,000</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-200">
                <span className="text-amber-900 font-semibold">6. Estimated OOP</span>
                <span className="font-mono font-bold text-amber-900">₹48,000</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Clicking any node in the full audit reveals quoted contract clauses.
          </div>
        </div>

      </div>

    </div>
  );
}
