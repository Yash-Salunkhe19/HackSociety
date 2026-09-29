from typing import Dict, Any, List
from backend.models.schemas import (
    WhatIfSimulationRequest, WhatIfSimulationResponse, CoverageCalculationRequest
)
from backend.services.coverage_engine import coverage_engine

class WhatIfService:
    def __init__(self):
        pass

    def simulate(self, req: WhatIfSimulationRequest) -> WhatIfSimulationResponse:
        # Run baseline calculation
        baseline_res = coverage_engine.calculate(req.baseline)

        # Clone baseline request for scenario modifications
        scenario_req_data = req.baseline.model_dump()

        if req.modified_cost is not None:
            scenario_req_data["treatment_cost"] = req.modified_cost
        if req.modified_room_type is not None:
            scenario_req_data["room_type"] = req.modified_room_type
        if req.modified_hospital_type is not None:
            scenario_req_data["hospital_type"] = req.modified_hospital_type
        if req.modified_treatment is not None:
            scenario_req_data["treatment_name"] = req.modified_treatment
        if req.modified_copay is not None:
            scenario_req_data["copay_override"] = req.modified_copay
        if req.modified_deductible is not None:
            scenario_req_data["deductible_override"] = req.modified_deductible

        scenario_req = CoverageCalculationRequest(**scenario_req_data)
        scenario_res = coverage_engine.calculate(scenario_req)

        cost_delta = round(scenario_res.incurred_cost - baseline_res.incurred_cost, 2)
        coverage_delta = round(scenario_res.potential_coverage - baseline_res.potential_coverage, 2)
        oop_delta = round(scenario_res.estimated_oop - baseline_res.estimated_oop, 2)

        risk_delta = "No change"
        if baseline_res.claim_risk_level != scenario_res.claim_risk_level:
            risk_delta = f"Shifted from {baseline_res.claim_risk_level} to {scenario_res.claim_risk_level}"

        chart_data = [
            {
                "metric": "Treatment Cost",
                "Baseline": baseline_res.incurred_cost,
                "Scenario": scenario_res.incurred_cost,
            },
            {
                "metric": "Potential Coverage",
                "Baseline": baseline_res.potential_coverage,
                "Scenario": scenario_res.potential_coverage,
            },
            {
                "metric": "Estimated OOP",
                "Baseline": baseline_res.estimated_oop,
                "Scenario": scenario_res.estimated_oop,
            }
        ]

        return WhatIfSimulationResponse(
            baseline_result=baseline_res,
            scenario_result=scenario_res,
            cost_delta=cost_delta,
            coverage_delta=coverage_delta,
            oop_delta=oop_delta,
            risk_delta=risk_delta,
            chart_comparison=chart_data
        )

what_if_service = WhatIfService()
