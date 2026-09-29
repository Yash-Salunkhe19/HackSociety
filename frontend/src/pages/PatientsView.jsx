import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ArrowLeft, 
  Calendar, 
  Receipt, 
  Activity, 
  CheckCircle2, 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  ArrowRight,
  Stethoscope,
  Filter
} from 'lucide-react';
import { fetchPatients, fetchPatientDetail } from '../services/api';

export default function PatientsView({ onSelectPatientForAnalysis }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('appointments'); // appointments, treatments, billing, doctors

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async (query = '') => {
    setIsLoading(true);
    try {
      const data = await fetchPatients(query);
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPatient = async (patientId) => {
    setSelectedPatientId(patientId);
    setIsLoading(true);
    try {
      const detail = await fetchPatientDetail(patientId);
      setPatientDetail(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedPatientId(null);
    setPatientDetail(null);
  };

  // If viewing patient detail
  if (selectedPatientId && patientDetail) {
    const p = patientDetail.patient;

    return (
      <div className="space-y-5 pb-12">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Patient Registry</span>
          </button>

          <button
            onClick={() => onSelectPatientForAnalysis(p)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <span>Analyze Treatment for Patient</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Patient Profile Header Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{p.full_name}</h2>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {p.patient_id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  {p.gender === 'M' ? 'Male' : 'Female'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-slate-400" />{p.address}</span>
                <span className="flex items-center"><Phone className="w-3 h-3 mr-1 text-slate-400" />{p.contact_number}</span>
                <span className="flex items-center"><Mail className="w-3 h-3 mr-1 text-slate-400" />{p.email}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Billed Invoices</span>
              <span className="text-base font-bold font-mono text-slate-900">
                ₹{patientDetail.total_billed_amount?.toLocaleString() || '0'}
              </span>
            </div>
          </div>

          {/* Insurance Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Insurance Provider</span>
              <span className="font-semibold text-slate-800">{p.insurance_provider}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Policy Identification No.</span>
              <span className="font-mono text-slate-800">{p.insurance_number}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Member Inception Date</span>
              <span className="font-mono text-slate-800">{p.registration_date}</span>
            </div>
          </div>
        </div>

        {/* Relational Tabs */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50/75 px-4 text-xs font-medium text-slate-600 space-x-4">
            <button
              onClick={() => setDetailTab('appointments')}
              className={`py-3 border-b-2 font-semibold transition-colors flex items-center space-x-1.5 ${
                detailTab === 'appointments'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointments ({patientDetail.linked_appointments?.length || 0})</span>
            </button>
            <button
              onClick={() => setDetailTab('treatments')}
              className={`py-3 border-b-2 font-semibold transition-colors flex items-center space-x-1.5 ${
                detailTab === 'treatments'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Treatments ({patientDetail.linked_treatments?.length || 0})</span>
            </button>
            <button
              onClick={() => setDetailTab('billing')}
              className={`py-3 border-b-2 font-semibold transition-colors flex items-center space-x-1.5 ${
                detailTab === 'billing'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Billing Records ({patientDetail.linked_billing?.length || 0})</span>
            </button>
            <button
              onClick={() => setDetailTab('doctors')}
              className={`py-3 border-b-2 font-semibold transition-colors flex items-center space-x-1.5 ${
                detailTab === 'doctors'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Attending Doctors ({patientDetail.linked_doctors?.length || 0})</span>
            </button>
          </div>

          <div className="p-4">
            {detailTab === 'appointments' && (
              patientDetail.linked_appointments?.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                      <th className="py-2 px-3 font-semibold">Appt ID</th>
                      <th className="py-2 px-3 font-semibold">Doctor ID</th>
                      <th className="py-2 px-3 font-semibold">Date & Time</th>
                      <th className="py-2 px-3 font-semibold">Reason</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {patientDetail.linked_appointments.map(a => (
                      <tr key={a.appointment_id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">{a.appointment_id}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{a.doctor_id}</td>
                        <td className="py-2 px-3 text-slate-600 font-mono">{a.appointment_date} {a.appointment_time}</td>
                        <td className="py-2 px-3 text-slate-800">{a.reason_for_visit}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  Insufficient linked appointment data in CSV
                </div>
              )
            )}

            {detailTab === 'treatments' && (
              patientDetail.linked_treatments?.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                      <th className="py-2 px-3 font-semibold">Treatment ID</th>
                      <th className="py-2 px-3 font-semibold">Type</th>
                      <th className="py-2 px-3 font-semibold">Protocol / Description</th>
                      <th className="py-2 px-3 font-semibold">Treatment Date</th>
                      <th className="py-2 px-3 text-right font-semibold">Billed Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {patientDetail.linked_treatments.map(t => (
                      <tr key={t.treatment_id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">{t.treatment_id}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{t.treatment_type}</td>
                        <td className="py-2 px-3 text-slate-600">{t.description}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">{t.treatment_date}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{Number(t.cost).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  Insufficient linked treatment data in CSV
                </div>
              )
            )}

            {detailTab === 'billing' && (
              patientDetail.linked_billing?.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                      <th className="py-2 px-3 font-semibold">Bill ID</th>
                      <th className="py-2 px-3 font-semibold">Treatment ID</th>
                      <th className="py-2 px-3 font-semibold">Invoice Date</th>
                      <th className="py-2 px-3 font-semibold">Payment Method</th>
                      <th className="py-2 px-3 text-right font-semibold">Amount</th>
                      <th className="py-2 px-3 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {patientDetail.linked_billing.map(b => (
                      <tr key={b.bill_id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">{b.bill_id}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{b.treatment_id}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">{b.bill_date}</td>
                        <td className="py-2 px-3 text-slate-700">{b.payment_method}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{Number(b.amount).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            b.payment_status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {b.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  Insufficient linked billing records in CSV
                </div>
              )
            )}

            {detailTab === 'doctors' && (
              patientDetail.linked_doctors?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {patientDetail.linked_doctors.map(d => (
                    <div key={d.doctor_id} className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{d.full_name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                          {d.doctor_id}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">{d.specialization} • {d.hospital_branch}</p>
                      <p className="text-slate-400 text-[11px]">{d.email} • {d.phone_number}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  Insufficient linked doctor data in CSV
                </div>
              )
            )}
          </div>
        </div>

      </div>
    );
  }

  // Primary Registry Table View (Section 9)
  return (
    <div className="space-y-4 pb-12">
      
      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadPatients(e.target.value);
            }}
            placeholder="Search patient by name, ID, or insurance provider..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <span>{patients.length} Registered Patients</span>
          <span>•</span>
          <span>patients.csv verified</span>
        </div>
      </div>

      {/* Patient Registry Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80">
                <th className="py-2.5 px-4 font-semibold">Patient</th>
                <th className="py-2.5 px-3 font-semibold">Demographics</th>
                <th className="py-2.5 px-3 font-semibold">Insurance Provider</th>
                <th className="py-2.5 px-3 font-semibold">Policy Identification</th>
                <th className="py-2.5 px-3 font-semibold">Registered</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {patients.map((p) => (
                <tr 
                  key={p.patient_id}
                  onClick={() => handleSelectPatient(p.patient_id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                      <span>{p.first_name} {p.last_name}</span>
                      {p.patient_id === 'P-DEMO' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                          Demo
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{p.patient_id}</span>
                  </td>

                  <td className="py-3 px-3 text-slate-600">
                    <div>{p.gender === 'M' ? 'Male' : 'Female'}</div>
                    <div className="text-[11px] text-slate-400 font-mono">DOB: {p.date_of_birth}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">{p.insurance_provider}</span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                    {p.insurance_number}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {p.registration_date}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPatient(p.patient_id);
                      }}
                      className="px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                    >
                      View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
