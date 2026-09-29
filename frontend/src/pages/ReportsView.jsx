import React from 'react';
import { Database, CheckCircle2, Shield, FileText, Info } from 'lucide-react';

export default function ReportsView({ metrics }) {
  const datasets = [
    { name: 'patients.csv', records: 50, keys: 'patient_id', status: 'Verified', desc: 'Primary patient cohort & insurance identifiers' },
    { name: 'treatments.csv', records: 200, keys: 'treatment_id, appointment_id (FK)', status: 'Verified', desc: 'Clinical procedures, dates, and historical costs' },
    { name: 'appointments.csv', records: 200, keys: 'appointment_id, patient_id (FK), doctor_id (FK)', status: 'Verified', desc: 'Visit schedule, reasons, and status' },
    { name: 'billing.csv', records: 200, keys: 'bill_id, patient_id (FK), treatment_id (FK)', status: 'Verified', desc: 'Invoices, payment methods, and settlement status' },
    { name: 'doctors.csv', records: 10, keys: 'doctor_id', status: 'Verified', desc: 'Medical specialists and hospital branches' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">
          Dataset Integrity & Audit Reports
        </h2>
        <p className="text-xs text-slate-500">
          Relational verification between clinical datasets, payment ledgers, and insurance rules.
        </p>
      </div>

      {/* Dataset Verification Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Relational Schema Verification (pandas Data Layer)</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            All 5 Datasets Ingested
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold">Dataset</th>
              <th className="py-2.5 px-4 font-semibold">Records</th>
              <th className="py-2.5 px-4 font-semibold">Relational Keys</th>
              <th className="py-2.5 px-4 font-semibold">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {datasets.map((d) => (
              <tr key={d.name} className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">{d.name}</td>
                <td className="py-2.5 px-4 font-mono text-slate-700">{d.records} records</td>
                <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px]">{d.keys}</td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 w-max">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{d.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compliance & Methodology */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 uppercase font-mono tracking-wider">
          FIN-01 Compliance Architecture
        </h3>
        <p className="text-slate-600 leading-relaxed">
          InsuraTrace strictly separates document extraction, clause retrieval, deterministic insurance rules, and historical dataset analytics. No financial calculation is produced via generative extrapolation. All cost outputs are backed by historical median calculations or declared representative benchmarks.
        </p>
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-500">
          <strong>Transparency Notice:</strong> The treatment and billing records used in this prototype are representative and intended solely for functional demonstration and decision-support modeling.
        </div>
      </div>

    </div>
  );
}
