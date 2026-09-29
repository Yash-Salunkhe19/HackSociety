import React from 'react';
import { 
  Layers, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  GitCommit, 
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import DecisionTraceTimeline from '../components/DecisionTraceTimeline';

export default function CoverageAnalysisView({ 
  coverageResult, 
  onNavigateToTrace, 
  onNavigateToWhatIf 
}) {
  if (!coverageResult) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-lg border border-slate-200 text-xs">
        No coverage scenario calculated. Select a patient and treatment from the Treatment Analyzer to begin.
      </div>
    );
  }

  const {
    treatment_name,
    incurred_cost,
    applicable_sublimit,
    eligible_amount,
    deductible_applied,
    remaining_after_deductible,
    copay_percentage,
    patient_copay_amount,
    potential_coverage,
    estimated_oop,
    readiness_level,
    is_ready_for_estimate,
    missing_information,
    claim_risk_level,
    claim_risk_factors,
    confidence,
    confidence_rationale,
    decision_trace,
    disclaimer
  } = coverageResult;

  const getRiskBadge = (level) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            HIGH CLAIM RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            MEDIUM CLAIM RISK
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            LOW CLAIM RISK
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Scenario Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Coverage & Patient Financial Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Procedure: <strong className="text-slate-800">{treatment_name}</strong> • Total Estimated Incurred: <span className="font-mono font-bold text-slate-900">₹{incurred_cost?.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateToWhatIf}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center space-x-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>What-If Analysis</span>
          </button>
          <button
            onClick={onNavigateToTrace}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center space-x-1 shadow-sm"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Audit Decision Trace</span>
          </button>
        </div>
      </div>

      {/* Missing Information Alert (Section 16) */}
      {!is_ready_for_estimate && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs flex items-center space-x-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>INSUFFICIENT INFORMATION DETECTED</span>
            </span>
            <span className="text-[11px] font-mono font-semibold text-amber-800">
              Readiness: {readiness_level}
            </span>
          </div>
          <p className="text-xs text-amber-800">
            A reliable insurance estimate requires verifying the following clinical parameters:
          </p>
          <ul className="list-disc list-inside text-xs text-amber-900 space-y-0.5">
            {missing_information.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4 Primary Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Incurred Cost</span>
          <div className="text-xl font-bold font-mono text-slate-900">
            ₹{incurred_cost?.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Hospital billed estimate</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Potential Coverage</span>
          <div className="text-xl font-bold font-mono text-emerald-800">
            ₹{potential_coverage?.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Indemnity payable by insurer</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-amber-600">
          <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Estimated Out-of-Pocket</span>
          <div className="text-xl font-bold font-mono text-amber-900">
            ₹{estimated_oop?.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Patient total financial share</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Claim Risk Indicator</span>
            <div>{getRiskBadge(claim_risk_level)}</div>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Confidence: <strong className="text-slate-700">{confidence}</strong>
          </span>
        </div>
      </div>

      {/* Deterministic Insurance Calculation Schedule (Section 14) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Deterministic Insurance Calculation Schedule
            </h3>
            <span className="text-[11px] text-slate-500">
              Illustrative policy-rule calculation • Actual adjudication governed by medical review
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-4 font-semibold">Calculation Item</th>
                <th className="py-2.5 px-4 font-semibold">Policy Clause Rule</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              <tr>
                <td className="py-2.5 px-4 text-slate-800 font-medium">Estimated Incurred Treatment Cost</td>
                <td className="py-2.5 px-4 text-slate-500">Total hospital bill for procedure & living fees</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                  ₹{incurred_cost?.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-slate-800">Applicable Procedure Sub-Limit</td>
                <td className="py-2.5 px-4 text-slate-500">
                  {applicable_sublimit ? `Policy Section 3 cap for ${treatment_name}` : 'Sum Insured ceiling'}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                  {applicable_sublimit ? `₹${applicable_sublimit.toLocaleString()}` : 'No specific sub-limit'}
                </td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Eligible Admissible Base Amount</td>
                <td className="py-2.5 px-4 text-slate-500">min(Incurred Cost, Sub-Limit)</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                  ₹{eligible_amount?.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-slate-800">Annual Compulsory Deductible</td>
                <td className="py-2.5 px-4 text-slate-500">Patient annual policy deductible (Clause 4.1)</td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                  − ₹{deductible_applied?.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Remaining Admissible Subject to Co-Pay</td>
                <td className="py-2.5 px-4 text-slate-500">Eligible Base − Deductible</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                  ₹{remaining_after_deductible?.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-slate-800">Patient Co-Payment ({copay_percentage}%)</td>
                <td className="py-2.5 px-4 text-slate-500">10% co-share on remaining balance (Clause 4.2)</td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                  − ₹{patient_copay_amount?.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-emerald-50/70 border-t border-emerald-200">
                <td className="py-3 px-4 text-emerald-900 font-bold text-sm">Potential Insurer Coverage</td>
                <td className="py-3 px-4 text-emerald-700">Net estimated insurer indemnification</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 text-base">
                  ₹{potential_coverage?.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-amber-50/70 border-t border-amber-200">
                <td className="py-3 px-4 text-amber-900 font-bold text-sm">Estimated Patient Out-of-Pocket (OOP)</td>
                <td className="py-3 px-4 text-amber-700">Excess over sub-limit + Deductible + Co-Pay</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-amber-900 text-base">
                  ₹{estimated_oop?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Risk Factors Panel (Section 19) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Potential Claim Risk Factors</span>
        </h4>
        <div className="space-y-1.5 text-xs text-slate-700">
          {claim_risk_factors.map((rf, idx) => (
            <div key={idx} className="flex items-start space-x-2 p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-bold">•</span>
              <span>{rf}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decision-Support Disclaimer Notice */}
      <div className="text-[11px] text-slate-400 italic">
        {disclaimer}
      </div>

    </div>
  );
}
