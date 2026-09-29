import React from 'react';
import { 
  GitCommit, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import DecisionTraceTimeline from '../components/DecisionTraceTimeline';

export default function DecisionTraceView({ coverageResult, onNavigateToAnalyzer, onNavigateToWhatIf }) {
  const steps = coverageResult?.decision_trace || [];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Coverage Decision Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Deterministic lineage: <strong>Treatment → Clause → Condition → Limit → Calculation → Result</strong>
          </p>
        </div>

        <button
          onClick={onNavigateToWhatIf}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center space-x-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>What-If Modeling</span>
        </button>
      </div>

      {/* Audit Guide Callout */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>
          Click on any node in the audit trail to inspect quoted policy contract clauses, page citations, and rule formulas.
        </span>
      </div>

      {/* Timeline Audit Container */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <DecisionTraceTimeline steps={steps} />
      </div>

    </div>
  );
}
