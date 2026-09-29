import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  User, 
  Building2, 
  Calendar, 
  Receipt, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  Loader2
} from 'lucide-react';
import { analyzeTreatmentCost } from '../services/api';

export default function TreatmentAnalyzerView({ 
  patients = [], 
  selectedPatient, 
  initialTreatment = 'Cataract Surgery',
  onProceedToCoverage 
}) {
  const [patientId, setPatientId] = useState(selectedPatient?.patient_id || 'P-DEMO');
  const [treatmentName, setTreatmentName] = useState(initialTreatment);
  const [city, setCity] = useState('Pune');
  const [hospitalType, setHospitalType] = useState('Private');
  const [hospitalBranch, setHospitalBranch] = useState('All Branches');
  const [roomType, setRoomType] = useState('Standard Single AC');
  const [costMode, setCostMode] = useState('auto'); // auto | manual
  const [manualCost, setManualCost] = useState('75000');
  const [policyStartDate, setPolicyStartDate] = useState('2022-01-01');
  const [treatmentDate, setTreatmentDate] = useState('2024-03-15');

  const [isLoading, setIsLoading] = useState(false);
  const [costAnalytics, setCostAnalytics] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const treatmentOptions = [
    "Cataract Surgery",
    "Chemotherapy",
    "MRI",
    "ECG",
    "Physiotherapy",
    "X-Ray",
    "Joint Replacement (Knee)",
    "Hernia Repair",
    "Cosmetic Rhinoplasty"
  ];

  const hospitalBranches = [
    "All Branches",
    "Westside Clinic",
    "Eastside Clinic",
    "Central Hospital"
  ];

  const roomCategories = [
    "Standard Single AC",
    "Deluxe Room",
    "Semi-Private Room",
    "General Ward",
    "Intensive Care Unit (ICU)"
  ];

  useEffect(() => {
    runAnalysis();
  }, [treatmentName, hospitalBranch]);

  const runAnalysis = async () => {
    if (!treatmentName) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const branchParam = hospitalBranch === 'All Branches' ? null : hospitalBranch;
      const data = await analyzeTreatmentCost(treatmentName, branchParam);
      setCostAnalytics(data);
      if (costMode === 'auto') {
        setManualCost(String(data.estimated_cost));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error analyzing treatment costs');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPatient = patients.find(p => p.patient_id === patientId) || selectedPatient || {
    patient_id: 'P-DEMO',
    first_name: 'Rajesh',
    last_name: 'Sharma',
    insurance_provider: 'HealthSecure National Insurance Ltd.',
    registration_date: '2022-01-01'
  };

  const effectiveCost = costMode === 'auto' 
    ? (costAnalytics?.estimated_cost || 75000) 
    : (parseFloat(manualCost) || 75000);

  // Quick illustrative estimates
  const sublimit = treatmentName.toLowerCase().includes('cataract') ? 40000 : (treatmentName.toLowerCase().includes('joint') ? 175000 : effectiveCost);
  const eligibleAmount = Math.min(effectiveCost, sublimit);
  const deductible = 10000;
  const remaining = Math.max(0, eligibleAmount - deductible);
  const patientCopay = Math.round(remaining * 0.10);
  const estCoverage = Math.max(0, remaining - patientCopay);
  const estOOP = Math.max(0, effectiveCost - estCoverage);

  const handleProceed = () => {
    onProceedToCoverage({
      patient_id: patientId,
      patient_name: `${currentPatient.first_name} ${currentPatient.last_name}`,
      treatment_name: treatmentName,
      treatment_cost: effectiveCost,
      city,
      hospital_type: hospitalType,
      room_type: roomType,
      policy_start_date: policyStartDate,
      treatment_date: treatmentDate
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Title */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Medical & Financial Treatment Assessment Form
          </h2>
          <p className="text-xs text-slate-500">
            Configure clinical variables, verify historical billing benchmarks, and compute deterministic coverage exposure.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          Form Ref: MED-FIN-01
        </span>
      </div>

      {/* Main Assessment Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Structured Assessment Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-5">
          
          {/* SECTION 1: PATIENT */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1">
              1. Patient Identification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Select Registered Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {patients.slice(0, 20).map((p) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.full_name} ({p.patient_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Insurance Carrier</label>
                <input
                  type="text"
                  disabled
                  value={currentPatient.insurance_provider}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: TREATMENT */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1">
              2. Clinical Treatment & Procedure
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Procedure Name</label>
                <select
                  value={treatmentName}
                  onChange={(e) => setTreatmentName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                >
                  {treatmentOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={treatmentDate}
                  onChange={(e) => setTreatmentDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PROVIDER & FACILITY */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1">
              3. Hospital Facility & Accommodations
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Hospital Type</label>
                <select
                  value={hospitalType}
                  onChange={(e) => setHospitalType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Private">Private Hospital</option>
                  <option value="Government">Government / Public</option>
                  <option value="Trust">Trust / Charitable</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Room Category</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                >
                  {roomCategories.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: COST INPUT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                4. Treatment Incurred Cost
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCostMode('auto');
                    if (costAnalytics) setManualCost(String(costAnalytics.estimated_cost));
                  }}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                    costMode === 'auto'
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Auto (Dataset Median)
                </button>
                <button
                  type="button"
                  onClick={() => setCostMode('manual')}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                    costMode === 'manual'
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
              <input
                type="number"
                value={manualCost}
                onChange={(e) => {
                  setManualCost(e.target.value);
                  setCostMode('manual');
                }}
                className="w-full pl-7 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* SECTION 5: POLICY INCEPTION */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1">
              5. Policy Parameters & Tenure Verification
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Policy Start Date</label>
                <input
                  type="date"
                  value={policyStartDate}
                  onChange={(e) => setPolicyStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Hospital Branch (doctors.csv filter)</label>
                <select
                  value={hospitalBranch}
                  onChange={(e) => setHospitalBranch(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900"
                >
                  {hospitalBranches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Cost Intelligence & Financial Estimate (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Historical Dataset Analytics Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Dataset Cost Analytics</span>
              </span>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />}
            </div>

            {costAnalytics && (
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Historical Range</span>
                    <span className="font-mono font-bold text-slate-800">
                      ₹{costAnalytics.representative_min?.toLocaleString()} – ₹{costAnalytics.representative_max?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Matched Records</span>
                    <span className="font-mono font-bold text-slate-800">
                      {costAnalytics.data_points_used} data points
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Source:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{costAnalytics.data_source}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Method:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{costAnalytics.calculation_method}</span>
                  </div>
                </div>

                {costAnalytics.insufficient_data && (
                  <div className="p-2.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs flex items-start space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{costAnalytics.benchmark_note}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FINANCIAL ESTIMATE (Section 12 Required) */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono border-b border-slate-100 pb-2">
              Financial Estimate Preview
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Treatment Cost:</span>
                <span className="font-mono font-bold text-slate-900">₹{effectiveCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Potential Eligible Amount:</span>
                <span className="font-mono font-bold text-slate-900">₹{eligibleAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 bg-emerald-50 px-2 rounded text-emerald-900">
                <span className="font-semibold">Potential Coverage:</span>
                <span className="font-mono font-bold text-emerald-800">₹{estCoverage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 bg-amber-50 px-2 rounded text-amber-900">
                <span className="font-semibold">Estimated OOP:</span>
                <span className="font-mono font-bold text-amber-900">₹{estOOP.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-2.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center space-x-2 mt-2"
            >
              <span>Audit Coverage & Decision Trace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
