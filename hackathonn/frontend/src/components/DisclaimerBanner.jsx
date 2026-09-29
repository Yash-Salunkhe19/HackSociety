import React from 'react';
import { Info } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <Info className="h-3.5 w-3.5 text-brand-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-300">Decision-Support Notice:</strong> InsuraTrace provides informational estimates and evidence-backed decision support. It does not guarantee claim approval, reimbursement, or insurer underwriting determinations.
          </span>
        </div>
        <span className="hidden md:inline-block text-slate-500 font-mono text-[10px]">
          FIN-01 Compliant Engine
        </span>
      </div>
    </div>
  );
}
