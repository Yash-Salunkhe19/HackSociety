import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { uploadPolicyPdf, loadSamplePolicy } from '../services/api';

export default function PolicyOverviewView({ 
  policy, 
  onPolicyLoaded, 
  onNavigateToQnA, 
  onNavigateToAnalyzer 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!policy) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        No policy document active. Please upload or load a sample policy.
      </div>
    );
  }

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const res = await uploadPolicyPdf(file);
        onPolicyLoaded(res.extracted_summary);
        setSuccessMsg(`Policy '${file.name}' extracted successfully (${res.pages_detected} pages).`);
      } catch (err) {
        setErrorMsg(err.message || 'Error processing policy PDF');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleLoadSample = async (sampleKey) => {
    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await loadSamplePolicy(sampleKey);
      onPolicyLoaded(res.extracted_summary);
      setSuccessMsg(`Sample policy '${res.filename}' loaded successfully.`);
    } catch (err) {
      setErrorMsg(err.message || 'Error loading sample policy');
    } finally {
      setIsUploading(false);
    }
  };

  const sublimits = policy.sub_limits || {};
  const exclusions = policy.exclusions || [];
  const claimConditions = policy.claim_conditions || [];

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Header Row */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">{policy.policy_name}</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Insurer: <strong className="text-slate-700">{policy.insurer}</strong> • Policy No: <span className="font-mono">{policy.policy_number}</span> • Insured: <strong className="text-slate-700">{policy.policy_holder}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateToQnA}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
          >
            Ask Policy Question
          </button>
          <button
            onClick={() => onNavigateToAnalyzer('Cataract Surgery')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center space-x-1"
          >
            <span>Analyze Treatment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Two-Column Layout (Section 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Policy Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Key Schedule Limits Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Statutory Underwriting Schedule
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Verified Digital Schedule</span>
            </div>

            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr>
                  <td className="py-2.5 px-4 text-slate-500 font-medium">Base Sum Insured</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-right">
                    ₹{policy.sum_insured?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-500 font-medium">Daily Room Rent Ceiling</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-right">
                    ₹{policy.room_rent_limit?.toLocaleString()}/day
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-500 font-medium">Annual Compulsory Deductible</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-right">
                    ₹{policy.deductible?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-500 font-medium">Mandatory Co-Payment</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-right">
                    {policy.copay_percentage}% on eligible balance
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-500 font-medium">Specific Illness Waiting Period</td>
                  <td className="py-2.5 px-4 text-slate-800 text-right font-medium">
                    {policy.waiting_period_specific_months} Months (Cataract, Hernia, Joint)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-500 font-medium">Pre-Existing Condition Waiting</td>
                  <td className="py-2.5 px-4 text-slate-800 text-right font-medium">
                    {policy.waiting_period_ped_months} Months continuous renewals
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-500 font-medium">Initial Moratorium</td>
                  <td className="py-2.5 px-4 text-slate-800 text-right font-medium">
                    {policy.waiting_period_initial_days} Days (Excludes Accidents)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Specific Sub-Limits */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/75">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Procedure Monetary Sub-Limits (Section 3)
              </h3>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                  <th className="py-2 px-4 font-semibold">Procedure / Treatment</th>
                  <th className="py-2 px-4 font-semibold text-right">Maximum Payout Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {Object.entries(sublimits).map(([tName, lVal]) => (
                  <tr key={tName} className="hover:bg-slate-50">
                    <td className="py-2 px-4 font-medium text-slate-800">{tName}</td>
                    <td className="py-2 px-4 font-mono font-bold text-slate-900 text-right">
                      ₹{Number(lVal).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Exclusions & Claim Requirements */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              General Exclusions & Claim Protocols
            </h3>

            <div className="space-y-1.5 text-xs">
              {exclusions.map((ex, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-slate-700">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{ex}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Claim Notification Protocols</span>
              {claimConditions.map((cond, i) => (
                <p key={i} className="text-slate-600">• {cond}</p>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Evidence, Document Ingestion & Conflict Alert (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Policy Inconsistency Detector (Section 20) */}
          {policy.has_conflicts && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-800 text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>Potential Policy Inconsistency Detected</span>
              </div>
              <p className="text-xs text-amber-800 leading-normal">
                Contradictory room rent clauses identified in the document schedule. Both citations are preserved without arbitrary resolution:
              </p>
              <div className="space-y-2 mt-2">
                {policy.conflicts.map((c, i) => (
                  <div key={i} className="p-2.5 rounded bg-white border border-amber-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Earlier Clause:</span>
                      <strong className="text-slate-900 font-mono">{c.value_a} (Page {c.page_a})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Endorsement Clause:</span>
                      <strong className="text-slate-900 font-mono">{c.value_b} (Page {c.page_b})</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Ingestion & Sample Loaders */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center space-x-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>Document Processing Controls</span>
            </h3>

            <div className="p-4 rounded border-2 border-dashed border-slate-200 hover:border-slate-400 text-center transition-colors">
              <p className="text-xs text-slate-600 mb-2 font-medium">
                Upload Custom Health Insurance PDF
              </p>
              <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium cursor-pointer hover:bg-slate-800">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Choose Document</span>
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {isUploading && (
              <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting pages and verifying clauses...</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Sample Switcher */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Test Document Presets</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoadSample('demo')}
                  disabled={isUploading}
                  className="flex-1 py-1.5 px-2 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition-colors text-center"
                >
                  Standard Demo (5 Pages)
                </button>
                <button
                  onClick={() => handleLoadSample('conflicting')}
                  disabled={isUploading}
                  className="flex-1 py-1.5 px-2 text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 transition-colors text-center"
                >
                  Conflicting Policy (Test 6)
                </button>
              </div>
            </div>
          </div>

          {/* Page-by-page index metadata */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Document Audit Lineage
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Document Name:</span>
                <span className="font-mono text-slate-800 truncate max-w-[180px]">{policy.policy_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Pages Parsed:</span>
                <span className="font-mono text-slate-800">{policy.total_pages} Pages</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">OCR Extraction Status:</span>
                <span className="text-slate-800">{policy.ocr_fallback_used ? 'Selective OCR Applied' : 'Digital PyMuPDF Text'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
