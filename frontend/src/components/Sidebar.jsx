import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  HelpCircle,
  Stethoscope, 
  Layers, 
  GitCommit, 
  SlidersHorizontal,
  BarChart2,
  Settings,
  Shield,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentPolicy, onOpenSettings }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users, badge: '50' },
    { id: 'policies', label: 'Policies', icon: FileText },
    { id: 'qna', label: 'Policy Q&A', icon: HelpCircle },
    { id: 'treatments', label: 'Treatments', icon: Stethoscope },
    { id: 'coverage', label: 'Coverage Analysis', icon: Layers },
    { id: 'trace', label: 'Decision Trace', icon: GitCommit },
    { id: 'whatif', label: 'What-If', icon: SlidersHorizontal },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 select-none z-30 flex-shrink-0">
      
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold tracking-tight text-slate-900 font-sans">
                INSURATRACE
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              Healthcare Cost Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Core Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Policy Status Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2">
        <div className="px-2 py-1.5 bg-white border border-slate-200 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              Active Policy
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-xs font-semibold text-slate-800 truncate">
            {currentPolicy?.policy_holder || 'Rajesh Sharma'}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {currentPolicy?.insurer || 'HealthSecure Insurance'}
          </p>
          {currentPolicy?.has_conflicts && (
            <div className="mt-1.5 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center space-x-1 font-medium">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Policy Inconsistency</span>
            </div>
          )}
        </div>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings & Dataset</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

    </aside>
  );
}
