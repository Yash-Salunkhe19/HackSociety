import React from 'react';
import { ShieldCheck, Info, UploadCloud, FileText } from 'lucide-react';

export default function TopHeader({ activeTab, onUploadClick, onLoadDemoClick }) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'overview':
        return { title: 'Overview Dashboard', subtitle: 'Patient financial exposure & healthcare activity' };
      case 'patients':
        return { title: 'Patient Registry', subtitle: 'Verified patient demographic & relational medical data' };
      case 'policies':
        return { title: 'Policy Document & Coverage Terms', subtitle: 'Structured schedule extraction & conflict detection' };
      case 'qna':
        return { title: 'Policy Question & Evidence', subtitle: 'Strict document retrieval without speculative assertions' };
      case 'treatments':
        return { title: 'Treatment Cost Analyzer', subtitle: 'Dataset-derived median pricing & facility assessment' };
      case 'coverage':
        return { title: 'Coverage Analysis', subtitle: 'Deterministic rule calculation & patient out-of-pocket schedule' };
      case 'trace':
        return { title: 'Coverage Decision Trace', subtitle: 'Step-by-step verifiable policy audit trail' };
      case 'whatif':
        return { title: 'What-If Scenario Modeling', subtitle: 'Financial sensitivity and delta exposure comparison' };
      case 'reports':
        return { title: 'System Reports & Dataset Context', subtitle: 'Relational data verification and dataset metadata' };
      default:
        return { title: 'InsuraTrace Portal', subtitle: 'Healthcare insurance intelligence' };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base font-semibold text-slate-900 leading-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-500 leading-none mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Subtle informational disclaimer badge */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Decision support only • Not guaranteed adjudication</span>
        </div>

        <button
          onClick={onLoadDemoClick}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
        >
          Reset Demo
        </button>

        <button
          onClick={onUploadClick}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Policy</span>
        </button>
      </div>
    </header>
  );
}
