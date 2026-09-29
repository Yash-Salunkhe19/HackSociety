import os
import sys

# Ensure backend is in path
sys.path.insert(0, os.path.abspath("."))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from backend.services.pdf_service import pdf_service
from backend.services.retrieval_service import retrieval_service
from backend.services.policy_extraction_service import policy_extraction_service
from backend.services.qa_service import qa_service
from backend.services.coverage_engine import coverage_engine
from backend.services.what_if_service import what_if_service
from backend.services.data_service import data_service
from backend.models.schemas import PolicyQARequest, CoverageCalculationRequest, WhatIfSimulationRequest

def run_tests():
    print("==================================================")
    print("RUNNING INSURATRACE AUTOMATED VERIFICATION SUITE")
    print("==================================================")

    # 1. Setup Demo Policy
    demo_path = os.path.join("policies", "demo_health_policy.pdf")
    pages, ocr = pdf_service.extract_policy_document(demo_path)
    retrieval_service.index_policy(pages)
    pol = policy_extraction_service.extract_from_pages(pages, "demo_health_policy.pdf", ocr_used=ocr)
    print(f"Policy Loaded: {pol.policy_name}, Sum Insured: ₹{pol.sum_insured:,.0f}, Cataract Sublimit: ₹{pol.sub_limits.get('Cataract Surgery', 0):,.0f}")

    # TEST 1: Cataract Surgery Coverage + Evidence
    print("\n--- TEST 1: Cataract Surgery ---")
    qa_res = qa_service.answer_question(PolicyQARequest(question="Is cataract surgery covered?"))
    print("Status:", qa_res.status)
    print("Answer:", qa_res.answer)
    print("Evidence Count:", len(qa_res.evidence))
    if qa_res.evidence:
        print(f"Top Evidence: Page {qa_res.evidence[0].page} | {qa_res.evidence[0].section}")
        print("Supporting Text:", qa_res.evidence[0].supporting_text)
    assert qa_res.status == "POTENTIALLY_COVERED"
    assert len(qa_res.evidence) > 0
    print(">> TEST 1 PASSED!")

    # TEST 2: Cosmetic Procedure Excluded + Evidence
    print("\n--- TEST 2: Cosmetic Procedure ---")
    qa_cosm = qa_service.answer_question(PolicyQARequest(question="Are cosmetic and aesthetic procedures covered?"))
    print("Status:", qa_cosm.status)
    print("Answer:", qa_cosm.answer)
    if qa_cosm.evidence:
        print(f"Exclusion Evidence: Page {qa_cosm.evidence[0].page} | {qa_cosm.evidence[0].section}")
    assert qa_cosm.status == "EXCLUDED"
    print(">> TEST 2 PASSED!")

    # TEST 3: Waiting Period Not Satisfied
    print("\n--- TEST 3: Waiting Period Not Satisfied ---")
    req_wp = CoverageCalculationRequest(
        treatment_name="Cataract Surgery",
        treatment_cost=75000.0,
        room_type="Standard Single AC",
        policy_start_date="2023-08-01",  # only ~7 months before treatment
        treatment_date="2024-03-15"
    )
    res_wp = coverage_engine.calculate(req_wp)
    print("Claim Risk Level:", res_wp.claim_risk_level)
    print("Risk Factors:", res_wp.claim_risk_factors)
    assert res_wp.claim_risk_level == "HIGH"
    assert any("waiting period" in rf.lower() for rf in res_wp.claim_risk_factors)
    print(">> TEST 3 PASSED!")

    # TEST 4: Missing Room Category
    print("\n--- TEST 4: Missing Room Category ---")
    req_missing = CoverageCalculationRequest(
        treatment_name="Cataract Surgery",
        treatment_cost=75000.0,
        room_type="", # MISSING!
        policy_start_date="2022-01-01",
        treatment_date="2024-03-15"
    )
    res_missing = coverage_engine.calculate(req_missing)
    print("Is Ready:", res_missing.is_ready_for_estimate)
    print("Readiness Level:", res_missing.readiness_level)
    print("Missing Info:", res_missing.missing_information)
    assert not res_missing.is_ready_for_estimate
    assert any("room category" in mi.lower() for mi in res_missing.missing_information)
    print(">> TEST 4 PASSED!")

    # TEST 5: Change Cost ₹75,000 -> ₹1,00,000 (What-If)
    print("\n--- TEST 5: What-If Cost Change (₹75k -> ₹100k) ---")
    base_req = CoverageCalculationRequest(
        treatment_name="Cataract Surgery",
        treatment_cost=75000.0,
        room_type="Standard Single AC",
        policy_start_date="2022-01-01",
        treatment_date="2024-03-15"
    )
    what_if_res = what_if_service.simulate(WhatIfSimulationRequest(
        baseline=base_req,
        modified_cost=100000.0
    ))
    print(f"Baseline: Cost=₹{what_if_res.baseline_result.incurred_cost:,.0f}, Coverage=₹{what_if_res.baseline_result.potential_coverage:,.0f}, OOP=₹{what_if_res.baseline_result.estimated_oop:,.0f}")
    print(f"Scenario: Cost=₹{what_if_res.scenario_result.incurred_cost:,.0f}, Coverage=₹{what_if_res.scenario_result.potential_coverage:,.0f}, OOP=₹{what_if_res.scenario_result.estimated_oop:,.0f}")
    print(f"Deltas: Cost Delta = ₹{what_if_res.cost_delta:,.0f}, OOP Delta = ₹{what_if_res.oop_delta:,.0f}")
    assert what_if_res.cost_delta == 25000.0
    # Because Cataract is sub-limited to ₹40k, coverage stays ₹27k, so entire additional ₹25k becomes OOP!
    assert what_if_res.oop_delta == 25000.0
    print(">> TEST 5 PASSED!")

    # TEST 6: Conflicting Room Limits Detection
    print("\n--- TEST 6: Conflicting Room Limits ---")
    conflict_path = os.path.join("policies", "conflicting_clauses_policy.pdf")
    pages_c, ocr_c = pdf_service.extract_policy_document(conflict_path)
    pol_c = policy_extraction_service.extract_from_pages(pages_c, "conflicting_clauses_policy.pdf", ocr_used=ocr_c)
    print("Has Conflicts:", pol_c.has_conflicts)
    print("Conflict Details:", len(pol_c.conflicts))
    for c in pol_c.conflicts:
        print(f"Conflict in {c.field}: {c.value_a} (Page {c.page_a}) vs {c.value_b} (Page {c.page_b})")
    assert pol_c.has_conflicts
    assert len(pol_c.conflicts) > 0
    print(">> TEST 6 PASSED!")

    print("\n==================================================")
    print("ALL 6 TESTS COMPLETED AND VERIFIED SUCCESSFULLY!")
    print("==================================================")

if __name__ == '__main__':
    run_tests()
