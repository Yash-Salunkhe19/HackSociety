import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  FileText, 
  HelpCircle, 
  Users, 
  Calculator, 
  Layers, 
  GitCommit, 
  SlidersHorizontal,
  UploadCloud,
  AlertTriangle
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentPolicy }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'upload', label: 'Upload Policy', icon: UploadCloud },
    { id: 'policy', label: 'Policy Overview', icon: FileText },
    { id: 'qna', label: 'Ask InsuraTrace', icon: HelpCircle },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'analyzer', label: 'Treatment Analyzer', icon: Calculator },
    { id: 'coverage', label: 'Coverage', icon: Layers },
    { id: 'trace', label: 'Decision Trace', icon: GitCommit },
    { id: 'whatif', label: 'What-If Simulator', icon: SlidersHorizontal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 p-0.5 shadow-lg shadow-brand-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  INSURA<span className="text-brand-400">TRACE</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  FIN-01 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Trace the Policy. Understand the Coverage. Estimate the Cost.
              </p>
            </div>
          </div>

          {/* Active Policy Status Chip */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Active Policy:</span>
            <span className="font-medium text-slate-200 truncate max-w-[200px]">
              {currentPolicy?.policy_holder ? `${currentPolicy.policy_holder} (${currentPolicy.insurer})` : 'Loading Policy...'}
            </span>
            {currentPolicy?.has_conflicts && (
              <span className="flex items-center text-amber-400 text-[11px] font-medium ml-1">
                <AlertTriangle className="h-3 w-3 mr-0.5" /> Conflict Detected
              </span>
            )}
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
