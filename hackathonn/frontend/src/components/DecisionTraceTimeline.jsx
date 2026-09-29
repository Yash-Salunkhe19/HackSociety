import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  BookOpen, 
  X,
  Calculator,
  ArrowDown
} from 'lucide-react';

export default function DecisionTraceTimeline({ steps }) {
  const [selectedStep, setSelectedStep] = useState(null);

  if (!steps || steps.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-slate-400 text-xs">
        No decision trace records generated. Select a patient and treatment scenario to audit.
      </div>
    );
  }

  const getStatusDot = (status) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'danger':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Evidence Inspector Drawer/Card when a step is clicked */}
      {selectedStep && (
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-300 shadow-sm relative space-y-2 animate-in fade-in duration-150">
          <button 
            onClick={() => setSelectedStep(null)}
            className="absolute top-3.5 right-3.5 p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
              Audit Node {selectedStep.step_number}
            </span>
            <span className="text-xs font-bold text-slate-900">
              {selectedStep.label}
            </span>
            <span className="text-xs font-mono font-bold text-blue-700">
              {selectedStep.value_display}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-normal">
            {selectedStep.description}
          </p>

          {selectedStep.formula && (
            <div className="px-2.5 py-1.5 rounded bg-white border border-slate-200 font-mono text-xs text-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">Rule Formula:</span>
              {selectedStep.formula}
            </div>
          )}

          {selectedStep.evidence ? (
            <div className="mt-2 p-3 rounded bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Policy Citation: {selectedStep.evidence.section}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Page {selectedStep.evidence.page}
                </span>
              </div>
              <p className="text-xs text-slate-700 italic font-sans leading-relaxed bg-slate-50 p-2 rounded border-l-2 border-slate-400">
                "{selectedStep.evidence.supporting_text}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Confidence: <strong className="text-slate-800">{selectedStep.evidence.confidence}</strong></span>
                <span className="text-slate-400 font-mono">Attributed to Policy Schedule</span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 font-sans italic">
              Computed mathematically from prior sub-limits and statutory policy variables.
            </div>
          )}
        </div>
      )}

      {/* Audit Trail List */}
      <div className="relative pl-6 space-y-2 border-l-2 border-slate-200 ml-3">
        {steps.map((step) => {
          const isSelected = selectedStep?.id === step.id;
          const hasEvidence = !!step.evidence;

          return (
            <div
              key={step.id}
              onClick={() => setSelectedStep(step)}
              className={`relative -ml-[31px] flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-50 border-slate-400 shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300'
              }`}
            >
              {/* Timeline marker node */}
              <div className="flex items-center space-x-3">
                <div className={`w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ring-slate-200 flex-shrink-0 ${getStatusDot(step.status)}`} />
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-900">{step.label}</span>
                    {hasEvidence && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                        Pg {step.evidence.page} Clause
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{step.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-mono font-bold text-slate-900 tracking-tight">
                  {step.value_display}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
