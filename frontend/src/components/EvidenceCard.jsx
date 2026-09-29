import React from 'react';
import { BookOpen, CheckCircle, FileText } from 'lucide-react';

export default function EvidenceCard({ evidence, title = "Source Policy Clause" }) {
  if (!evidence) return null;

  const items = Array.isArray(evidence) ? evidence : [evidence];
  if (items.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {items.map((ev, idx) => {
        const confBadge = ev.confidence === 'HIGH'
          ? 'bg-slate-100 text-slate-800 border-slate-300'
          : ev.confidence === 'MEDIUM'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-rose-50 text-rose-800 border-rose-200';

        return (
          <div 
            key={idx}
            className="p-3.5 rounded-md bg-white border border-slate-200 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800">
                  {ev.section || `Page ${ev.page} Clause`}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Page {ev.page}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                {ev.limit && (
                  <span className="text-[11px] font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Limit: {ev.limit}
                  </span>
                )}
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${confBadge}`}>
                  {ev.confidence} Confidence
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/80 p-2.5 rounded border-l-2 border-slate-400 border border-slate-100">
              "{ev.supporting_text || ev.full_chunk}"
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
              <span>Audited from Policy Document</span>
              <span className="text-slate-600 font-sans flex items-center">
                <CheckCircle className="w-3 h-3 text-slate-500 mr-1" /> Verified Clause
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
