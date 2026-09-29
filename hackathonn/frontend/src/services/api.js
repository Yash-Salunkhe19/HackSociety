const API_BASE = '/api';

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to load dashboard data');
  return res.json();
}

export async function fetchPolicySummary() {
  const res = await fetch(`${API_BASE}/policy/summary`);
  if (!res.ok) throw new Error('Failed to load policy summary');
  return res.json();
}

export async function uploadPolicyPdf(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/policy/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to upload policy');
  }
  return res.json();
}

export async function loadSamplePolicy(sampleKey = 'demo') {
  const res = await fetch(`${API_BASE}/policy/load-sample?sample_key=${sampleKey}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to load sample policy');
  }
  return res.json();
}

export async function askPolicyQuestion(question, policyId = 'demo') {
  const res = await fetch(`${API_BASE}/policy/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, policy_id: policyId }),
  });
  if (!res.ok) throw new Error('Failed to query policy');
  return res.json();
}

export async function fetchPatients(search = '') {
  const url = search ? `${API_BASE}/patients?search=${encodeURIComponent(search)}` : `${API_BASE}/patients`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function fetchPatientDetail(patientId) {
  const res = await fetch(`${API_BASE}/patients/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch patient ${patientId}`);
  return res.json();
}

export async function fetchTreatments() {
  const res = await fetch(`${API_BASE}/treatments`);
  if (!res.ok) throw new Error('Failed to fetch treatments');
  return res.json();
}

export async function fetchDoctors() {
  const res = await fetch(`${API_BASE}/doctors`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

export async function analyzeTreatmentCost(treatmentName, hospitalBranch = null) {
  const res = await fetch(`${API_BASE}/treatment/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ treatment_name: treatmentName, hospital_branch: hospitalBranch }),
  });
  if (!res.ok) throw new Error('Failed to analyze treatment cost');
  return res.json();
}

export async function calculateCoverage(calcData) {
  const res = await fetch(`${API_BASE}/coverage/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(calcData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to calculate coverage');
  }
  return res.json();
}

export async function runWhatIfSimulation(simData) {
  const res = await fetch(`${API_BASE}/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(simData),
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
}
