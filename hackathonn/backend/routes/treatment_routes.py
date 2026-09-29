from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.services.data_service import data_service
from backend.services.coverage_engine import coverage_engine
from backend.services.what_if_service import what_if_service
from backend.services.policy_extraction_service import policy_extraction_service
from backend.models.schemas import (
    CoverageCalculationRequest, CoverageCalculationResponse,
    WhatIfSimulationRequest, WhatIfSimulationResponse, TreatmentCostBreakdown
)

router = APIRouter(prefix="/api", tags=["Treatment & Coverage"])

class AnalyzeTreatmentBody(BaseModel):
    treatment_name: str
    hospital_branch: Optional[str] = None

@router.post("/treatment/analyze", response_model=TreatmentCostBreakdown)
def analyze_treatment(body: AnalyzeTreatmentBody):
    return data_service.get_treatment_cost_analytics(
        treatment_name=body.treatment_name,
        hospital_branch=body.hospital_branch
    )

@router.post("/coverage/calculate", response_model=CoverageCalculationResponse)
def calculate_coverage(req: CoverageCalculationRequest):
    return coverage_engine.calculate(req)

@router.get("/coverage/trace", response_model=CoverageCalculationResponse)
def get_demo_decision_trace():
    """
    Returns the canonical demo decision trace (Rajesh Sharma, Cataract Surgery, ₹75,000).
    """
    demo_req = CoverageCalculationRequest(
        policy_id="demo",
        patient_id="P001",
        treatment_name="Cataract Surgery",
        treatment_cost=75000.0,
        city="Pune",
        hospital_type="Private",
        room_type="Standard Single AC",
        policy_start_date="2022-01-01",
        treatment_date="2024-03-15"
    )
    return coverage_engine.calculate(demo_req)

@router.post("/what-if", response_model=WhatIfSimulationResponse)
def run_what_if_simulation(req: WhatIfSimulationRequest):
    return what_if_service.simulate(req)

@router.get("/dashboard")
def get_dashboard_data():
    summary_metrics = data_service.get_dashboard_summary()
    current_policy = policy_extraction_service.get_current_policy()
    
    # Calculate canonical demo coverage for quick dashboard preview
    demo_calc = coverage_engine.calculate(CoverageCalculationRequest(
        policy_id=current_policy.policy_id,
        patient_id="P001",
        treatment_name="Cataract Surgery",
        treatment_cost=75000.0,
        city="Pune",
        hospital_type="Private",
        room_type="Standard Single AC",
        policy_start_date="2022-01-01",
        treatment_date="2024-03-15"
    ))
    
    return {
        "metrics": summary_metrics,
        "policy": current_policy,
        "demo_scenario": demo_calc,
        "disclaimer": "InsuraTrace provides informational estimates and decision support. It does not guarantee claim approval, reimbursement, or insurer decisions."
    }
