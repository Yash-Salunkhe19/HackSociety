import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  FileText, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { askPolicyQuestion } from '../services/api';
import EvidenceCard from '../components/EvidenceCard';

export default function AskQnAView({ policyId = 'demo', initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery || 'Is cataract surgery covered?');
  const [isLoading, setIsLoading] = useState(false);
  const [qaResponse, setQaResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleQuestions = [
    "Is cataract surgery covered?",
    "Are cosmetic procedures covered?",
    "What is the room rent limit?",
    "What are the waiting periods?",
    "What is the deductible and co-pay?"
  ];

  const handleAsk = async (questionText) => {
    const q = questionText || query;
    if (!q.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await askPolicyQuestion(q, policyId);
      setQaResponse(res);
    } catch (err) {
      setErrorMsg(err.message || 'Error querying policy evidence');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'POTENTIALLY_COVERED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            POTENTIALLY COVERED
          </span>
        );
      case 'EXCLUDED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            EXCLUDED / NON-PAYABLE
          </span>
        );
      case 'SUBJECT_TO_CONDITIONS':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            SUBJECT TO CONDITIONS
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            VERIFIED INFORMATION
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Question Input Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Policy Question & Clause Evidence
          </h2>
          <p className="text-xs text-slate-500">
            Query the active policy document. InsuraTrace retrieves page-level clauses and quotes exact contract text without speculative assumptions.
          </p>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleAsk(query); }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter policy clause inquiry (e.g. Is cataract surgery covered?)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors disabled:opacity-50 flex items-center space-x-1.5 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Query Document</span>
            )}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold mr-1">Suggested Inquiries:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleAsk(q);
              }}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded bg-rose-50 text-rose-800 border border-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Answer & Evidence Section (Section 11) */}
      {qaResponse && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Answer & Interpretation (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
                Adjudication Status
              </span>
              <div>{getStatusBadge(qaResponse.status)}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Answer</span>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {qaResponse.answer}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {qaResponse.policy_limit && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Applicable Limit</span>
                  <span className="font-mono font-bold text-slate-800">{qaResponse.policy_limit}</span>
                </div>
              )}
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Audit Confidence</span>
                <span className="font-semibold text-slate-800">{qaResponse.confidence} CONFIDENCE</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Interpretation Note</span>
                <p className="text-slate-600 leading-normal">{qaResponse.interpretation}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Underwriting Assumptions</span>
                <p className="text-slate-600 leading-normal">{qaResponse.assumptions}</p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 italic">
              {qaResponse.disclaimer}
            </div>
          </div>

          {/* RIGHT: Source Evidence Panel (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Retrieved Source Evidence</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {qaResponse.evidence?.length || 0} Clauses
              </span>
            </div>

            <EvidenceCard evidence={qaResponse.evidence} />
          </div>

        </div>
      )}

    </div>
  );
}
