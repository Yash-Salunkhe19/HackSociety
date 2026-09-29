import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';

import DashboardView from './pages/DashboardView';
import PatientsView from './pages/PatientsView';
import PolicyOverviewView from './pages/PolicyOverviewView';
import AskQnAView from './pages/AskQnAView';
import TreatmentAnalyzerView from './pages/TreatmentAnalyzerView';
import CoverageAnalysisView from './pages/CoverageAnalysisView';
import DecisionTraceView from './pages/DecisionTraceView';
import WhatIfSimulatorView from './pages/WhatIfSimulatorView';
import ReportsView from './pages/ReportsView';

import { 
  fetchDashboard, 
  fetchPolicySummary, 
  fetchPatients, 
  calculateCoverage,
  loadSamplePolicy
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [coverageResult, setCoverageResult] = useState(null);
  const [activeTreatmentScenario, setActiveTreatmentScenario] = useState({
    treatment_name: 'Cataract Surgery',
    treatment_cost: 75000,
    room_type: 'Standard Single AC',
    hospital_type: 'Private',
    city: 'Pune',
    policy_start_date: '2022-01-01',
    treatment_date: '2024-03-15'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [dash, pol, pts] = await Promise.all([
        fetchDashboard(),
        fetchPolicySummary(),
        fetchPatients()
      ]);
      setDashboardData(dash);
      setCurrentPolicy(pol);
      setPatients(pts);
      if (pts.length > 0) {
        setSelectedPatient(pts[0]);
      }
      if (dash.demo_scenario) {
        setCoverageResult(dash.demo_scenario);
      }
    } catch (err) {
      console.error('Error initializing application state:', err);
    }
  };

  const handlePolicyLoaded = (newPolicy) => {
    setCurrentPolicy(newPolicy);
    fetchDashboard().then(dash => setDashboardData(dash)).catch(console.error);
  };

  const handleSelectPatientForAnalysis = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('treatments');
  };

  const handleProceedToCoverage = async (scenarioData) => {
    setActiveTreatmentScenario(scenarioData);
    try {
      const result = await calculateCoverage({
        policy_id: currentPolicy?.policy_id || 'demo',
        patient_id: scenarioData.patient_id,
        treatment_name: scenarioData.treatment_name,
        treatment_cost: scenarioData.treatment_cost,
        city: scenarioData.city,
        hospital_type: scenarioData.hospital_type,
        room_type: scenarioData.room_type,
        policy_start_date: scenarioData.policy_start_date,
        treatment_date: scenarioData.treatment_date
      });
      setCoverageResult(result);
      setActiveTab('coverage');
    } catch (err) {
      console.error('Failed to calculate coverage:', err);
    }
  };

  const handleLoadDemo = async () => {
    try {
      const res = await loadSamplePolicy('demo');
      handlePolicyLoaded(res.extracted_summary);
    } catch (err) {
      console.error('Failed to reload demo:', err);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      
      {/* Enterprise Left Sidebar (Section 7) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentPolicy={currentPolicy}
        onOpenSettings={() => setActiveTab('reports')}
      />

      {/* Main Content Area with Sticky TopHeader */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <TopHeader 
          activeTab={activeTab} 
          onUploadClick={() => setActiveTab('policies')}
          onLoadDemoClick={handleLoadDemo}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <DashboardView 
              dashboardData={dashboardData}
              patients={patients}
              selectedPatient={selectedPatient}
              onSelectPatient={handleSelectPatientForAnalysis}
              onNavigateToAnalyzer={(treatment) => {
                setActiveTreatmentScenario(prev => ({ ...prev, treatment_name: treatment }));
                setActiveTab('treatments');
              }}
              onNavigateToTrace={() => setActiveTab('trace')}
              onNavigateToWhatIf={() => setActiveTab('whatif')}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsView onSelectPatientForAnalysis={handleSelectPatientForAnalysis} />
          )}

          {activeTab === 'policies' && (
            <PolicyOverviewView 
              policy={currentPolicy}
              onPolicyLoaded={handlePolicyLoaded}
              onNavigateToQnA={() => setActiveTab('qna')}
              onNavigateToAnalyzer={(t) => {
                setActiveTreatmentScenario(prev => ({ ...prev, treatment_name: t }));
                setActiveTab('treatments');
              }}
            />
          )}

          {activeTab === 'qna' && (
            <AskQnAView policyId={currentPolicy?.policy_id || 'demo'} />
          )}

          {activeTab === 'treatments' && (
            <TreatmentAnalyzerView 
              patients={patients}
              selectedPatient={selectedPatient}
              initialTreatment={activeTreatmentScenario.treatment_name}
              onProceedToCoverage={handleProceedToCoverage}
            />
          )}

          {activeTab === 'coverage' && (
            <CoverageAnalysisView 
              coverageResult={coverageResult}
              onNavigateToTrace={() => setActiveTab('trace')}
              onNavigateToWhatIf={() => setActiveTab('whatif')}
            />
          )}

          {activeTab === 'trace' && (
            <DecisionTraceView 
              coverageResult={coverageResult}
              onNavigateToAnalyzer={() => setActiveTab('treatments')}
              onNavigateToWhatIf={() => setActiveTab('whatif')}
            />
          )}

          {activeTab === 'whatif' && (
            <WhatIfSimulatorView baselineData={activeTreatmentScenario} />
          )}

          {activeTab === 'reports' && (
            <ReportsView metrics={dashboardData?.metrics} />
          )}
        </main>
      </div>

    </div>
  );
}
