import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  Eye, 
  Sparkles,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { uploadPolicyPdf, loadSamplePolicy } from '../services/api';

export default function PolicyUploadView({ onPolicyLoaded, onNavigateToOverview }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Please select a valid PDF file document.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMsg('');
    try {
      const res = await uploadPolicyPdf(selectedFile);
      setUploadResult(res);
      onPolicyLoaded(res.extracted_summary);
    } catch (err) {
      setErrorMsg(err.message || 'Error processing policy PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = async (sampleKey) => {
    setIsUploading(true);
    setErrorMsg('');
    try {
      const res = await loadSamplePolicy(sampleKey);
      setUploadResult(res);
      onPolicyLoaded(res.extracted_summary);
    } catch (err) {
      setErrorMsg(err.message || 'Error loading sample policy');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <UploadCloud className="h-6 w-6 text-brand-400" />
          <span>Upload Insurance Policy</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload any health insurance policy PDF. InsuraTrace performs page-by-page text extraction, selective OCR fallback, clause segmentation, and structured parameter identification.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="p-8 rounded-2xl bg-slate-900/90 border-2 border-dashed border-slate-700 hover:border-brand-500/50 transition-all text-center">
        
        <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4">
          <FileText className="h-8 w-8" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {selectedFile ? selectedFile.name : 'Select or drop insurance policy PDF'}
        </h3>
        <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
          Supports multi-page contracts, schedules, endorsements, and scanned policies with automated OCR fallback.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer transition flex items-center space-x-2">
            <UploadCloud className="h-4 w-4" />
            <span>Choose PDF Document</span>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="hidden" 
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
              selectedFile && !isUploading
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Pages & OCR...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze Policy PDF</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Sample Policy Loaders */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <span className="text-[11px] font-mono uppercase text-slate-500 block mb-3">
            Quick Load Authentic Test Policies (ReportLab Generated)
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleLoadSample('demo')}
              disabled={isUploading}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 hover:border-brand-500/50 transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Load Synthetic Demo Policy (Rajesh Sharma • 5 Pages)</span>
            </button>
            <button
              onClick={() => handleLoadSample('conflicting')}
              disabled={isUploading}
              className="px-3.5 py-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 text-xs border border-amber-600/40 transition flex items-center space-x-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Load Conflicting Clauses Policy (Test 6 Conflict Demo)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Upload & Processing Results Checklist (Section 8) */}
      {uploadResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Policy Document Ready for Intelligence Analysis</span>
            </div>
            <button
              onClick={onNavigateToOverview}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center space-x-1.5"
            >
              <span>View Policy Overview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Section 8 Required Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Policy uploaded</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{uploadResult.pages_detected} Pages detected</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Text extracted</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Indexed for Q&A</span>
            </div>
          </div>

          {/* Extracted Policy Snapshot */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Policy Document:</span>
              <span className="text-white font-mono font-medium">{uploadResult.filename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sum Insured:</span>
              <span className="text-emerald-400 font-mono font-bold">
                ₹{uploadResult.extracted_summary?.sum_insured?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">OCR Fallback Status:</span>
              <span className="text-slate-300">
                {uploadResult.ocr_fallback_applied ? 'Applied selectively' : 'Native PyMuPDF digital text extracted'}
              </span>
            </div>
            {uploadResult.extracted_summary?.has_conflicts && (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center space-x-2 mt-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-400" />
                <span>
                  <strong>Conflict Detected:</strong> Conflicting room limits identified between earlier clauses and endorsements.
                </span>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
