from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EvidenceSnippet(BaseModel):
    page: int
    section: str
    supporting_text: str
    limit: Optional[str] = None
    confidence: str = "HIGH"  # HIGH, MEDIUM, LOW

class PolicyClause(BaseModel):
    category: str
    clause_title: str
    clause_text: str
    page: int
    limit_value: Optional[float] = None
    limit_text: Optional[str] = None

class ConflictDetail(BaseModel):
    field: str
    value_a: str
    page_a: int
    value_b: str
    page_b: int
    description: str

class ExtractedPolicy(BaseModel):
    policy_id: str
    policy_name: str
    policy_holder: str = "Rajesh Sharma"
    insurer: str = "HealthSecure National Insurance Ltd."
    policy_number: str = "POL-IND-2023-88492"
    sum_insured: float = 500000.0
    room_rent_limit: float = 5000.0
    room_rent_type: str = "Standard Single AC Room"
    copay_percentage: float = 10.0
    deductible: float = 10000.0
    waiting_period_initial_days: int = 30
    waiting_period_specific_months: int = 24
    waiting_period_ped_months: int = 36
    sub_limits: Dict[str, float] = Field(default_factory=lambda: {
        "Cataract Surgery": 40000.0,
        "Joint Replacement": 175000.0,
        "Hernia Repair": 50000.0,
        "Hysterectomy": 65000.0
    })
    exclusions: List[str] = Field(default_factory=lambda: [
        "Cosmetic and aesthetic treatments",
        "Obesity and weight control surgery",
        "Unproven and experimental treatments",
        "Routine dental procedures",
        "Deliberate self-inflicted injury or alcohol misuse"
    ])
    claim_conditions: List[str] = Field(default_factory=lambda: [
        "48 hours prior notification for planned hospitalization",
        "24 hours notification for emergency admission",
        "Submission of original bills and discharge summary within 15 days"
    ])
    has_conflicts: bool = False
    conflicts: List[ConflictDetail] = Field(default_factory=list)
    total_pages: int = 5
    ocr_fallback_used: bool = False
    is_demo: bool = True

class PolicyUploadResponse(BaseModel):
    status: str
    message: str
    policy_id: str
    filename: str
    total_pages: int
    pages_detected: int
    text_extracted: bool
    ocr_fallback_applied: bool
    extracted_summary: ExtractedPolicy

class PolicyQARequest(BaseModel):
    policy_id: Optional[str] = "demo"
    question: str

class PolicyQAResponse(BaseModel):
    question: str
    status: str  # POTENTIALLY_COVERED, EXCLUDED, SUBJECT_TO_CONDITIONS, INFORMATION_ONLY, NOT_FOUND
    answer: str
    interpretation: str
    assumptions: str
    confidence: str  # HIGH, MEDIUM, LOW
    evidence: List[EvidenceSnippet]
    policy_limit: Optional[str] = None
    disclaimer: str = "InsuraTrace provides informational estimates and decision support. It does not guarantee claim approval, reimbursement, or insurer decisions."

class TreatmentCostBreakdown(BaseModel):
    treatment_name: str
    estimated_cost: float
    representative_min: float
    representative_max: float
    median_cost: float
    average_cost: float
    data_points_used: int
    data_source: str
    calculation_method: str
    insufficient_data: bool = False
    benchmark_note: Optional[str] = None

class DecisionStep(BaseModel):
    step_number: int
    id: str
    label: str
    value_display: str
    value_numeric: Optional[float] = None
    description: str
    status: str  # success, warning, neutral, danger
    formula: Optional[str] = None
    evidence: Optional[EvidenceSnippet] = None

class CoverageCalculationRequest(BaseModel):
    policy_id: Optional[str] = "demo"
    patient_id: Optional[str] = "P001"
    treatment_name: str
    treatment_cost: float
    city: Optional[str] = "Pune"
    hospital_type: Optional[str] = "Private"
    room_type: Optional[str] = "Standard Single AC"
    policy_start_date: Optional[str] = "2022-01-01"
    treatment_date: Optional[str] = "2024-03-15"
    copay_override: Optional[float] = None
    deductible_override: Optional[float] = None
    sublimit_override: Optional[float] = None

class CoverageCalculationResponse(BaseModel):
    treatment_name: str
    incurred_cost: float
    applicable_sublimit: Optional[float] = None
    eligible_amount: float
    deductible_applied: float
    remaining_after_deductible: float
    copay_percentage: float
    patient_copay_amount: float
    potential_coverage: float
    estimated_oop: float
    readiness_level: str  # HIGH, MEDIUM, LOW
    is_ready_for_estimate: bool
    missing_information: List[str]
    claim_risk_level: str  # LOW, MEDIUM, HIGH
    claim_risk_factors: List[str]
    confidence: str  # HIGH, MEDIUM, LOW
    confidence_rationale: str
    decision_trace: List[DecisionStep]
    disclaimer: str = "Illustrative policy-rule calculation. Actual claim adjudication may depend on additional policy conditions, medical necessity review, and insurer underwriting terms."

class WhatIfSimulationRequest(BaseModel):
    baseline: CoverageCalculationRequest
    modified_cost: Optional[float] = None
    modified_room_type: Optional[str] = None
    modified_hospital_type: Optional[str] = None
    modified_treatment: Optional[str] = None
    modified_copay: Optional[float] = None
    modified_deductible: Optional[float] = None

class WhatIfSimulationResponse(BaseModel):
    baseline_result: CoverageCalculationResponse
    scenario_result: CoverageCalculationResponse
    cost_delta: float
    coverage_delta: float
    oop_delta: float
    risk_delta: str
    chart_comparison: List[Dict[str, Any]]

class PatientSummary(BaseModel):
    patient_id: str
    first_name: str
    last_name: str
    full_name: str
    gender: str
    date_of_birth: str
    contact_number: str
    address: str
    registration_date: str
    insurance_provider: str
    insurance_number: str
    email: str

class PatientDetail(BaseModel):
    patient: PatientSummary
    linked_appointments: List[Dict[str, Any]]
    linked_treatments: List[Dict[str, Any]]
    linked_billing: List[Dict[str, Any]]
    linked_doctors: List[Dict[str, Any]]
    total_billed_amount: float
    has_linked_data: bool
    note: str
