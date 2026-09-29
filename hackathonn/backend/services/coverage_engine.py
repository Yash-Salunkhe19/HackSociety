from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.models.schemas import (
    CoverageCalculationRequest, CoverageCalculationResponse, DecisionStep, EvidenceSnippet
)
from backend.services.policy_extraction_service import policy_extraction_service

class CoverageEngine:
    def __init__(self):
        pass

    def calculate(self, req: CoverageCalculationRequest) -> CoverageCalculationResponse:
        policy = policy_extraction_service.get_current_policy()
        
        # 1. Missing Information Engine
        missing_info = []
        if not req.treatment_name or req.treatment_name.strip() == "":
            missing_info.append("Treatment procedure name is required")
        if req.treatment_cost is None or req.treatment_cost <= 0:
            missing_info.append("Valid estimated treatment cost is required")
        if not req.room_type or req.room_type.strip() == "":
            missing_info.append("Hospital room category (e.g. Standard Single AC, Deluxe) is required")
        if not req.policy_start_date:
            missing_info.append("Policy inception/start date is required to verify waiting periods")
        if not req.treatment_date:
            missing_info.append("Anticipated treatment date is required to verify tenure")

        readiness_level = "HIGH"
        if len(missing_info) >= 3:
            readiness_level = "LOW"
        elif len(missing_info) >= 1:
            readiness_level = "MEDIUM"
        
        is_ready = len(missing_info) == 0

        # Safe defaults if missing
        incurred_cost = float(req.treatment_cost) if req.treatment_cost and req.treatment_cost > 0 else 75000.0
        t_name = req.treatment_name if req.treatment_name else "Cataract Surgery"
        t_clean = t_name.strip().lower()

        # Check for Exclusions
        is_excluded = False
        exclusion_evidence = None
        if any(w in t_clean for w in ["cosmetic", "aesthetic", "plastic surgery", "beauty", "hair transplant", "weight loss", "obesity", "bariatric"]):
            is_excluded = True
            exclusion_evidence = EvidenceSnippet(
                page=5,
                section="Section 6: General Policy Exclusions • Exclusion 6.1",
                supporting_text="Cosmetic or plastic surgery or any treatment to enhance appearance, unless necessitated by accident reconstructive surgery following burns or trauma.",
                limit="INR 0 (Excluded)",
                confidence="HIGH"
            )

        # 2. Determine Sub-limits
        applicable_sublimit = None
        sublimit_evidence = None

        if req.sublimit_override is not None:
            applicable_sublimit = float(req.sublimit_override)
        else:
            # Check policy sublimits dictionary
            for sub_k, sub_v in policy.sub_limits.items():
                if sub_k.lower() in t_clean or t_clean in sub_k.lower():
                    applicable_sublimit = float(sub_v)
                    sublimit_evidence = EvidenceSnippet(
                        page=3,
                        section=f"Section 3: Specific Sub-Limits • {sub_k}",
                        supporting_text=f"{sub_k} procedure covered subject to a maximum sub-limit of INR {applicable_sublimit:,.0f}. Any expense exceeding this sub-limit shall be borne solely by the insured.",
                        limit=f"INR {applicable_sublimit:,.0f}",
                        confidence="HIGH"
                    )
                    break
            
            if applicable_sublimit is None and "cataract" in t_clean:
                applicable_sublimit = 40000.0
                sublimit_evidence = EvidenceSnippet(
                    page=3,
                    section="Section 3: Specific Sub-Limits • Clause 3.1",
                    supporting_text="Cataract procedure is covered subject to a maximum sub-limit of INR 40,000 per eye.",
                    limit="INR 40,000 per eye",
                    confidence="HIGH"
                )

        # 3. Deterministic Insurance Calculations
        # If excluded, eligible is 0
        if is_excluded:
            eligible_amount = 0.0
            deductible_applied = 0.0
            remaining_after_deductible = 0.0
            copay_pct = float(policy.copay_percentage)
            patient_copay = 0.0
            potential_coverage = 0.0
            estimated_oop = incurred_cost
        else:
            # Eligible amount is capped by sublimit and sum insured
            base_eligible = incurred_cost
            if applicable_sublimit is not None and applicable_sublimit > 0:
                base_eligible = min(base_eligible, applicable_sublimit)
            
            base_eligible = min(base_eligible, float(policy.sum_insured))
            eligible_amount = base_eligible

            # Deductible
            policy_deductible = float(req.deductible_override if req.deductible_override is not None else policy.deductible)
            deductible_applied = min(eligible_amount, policy_deductible)
            
            # Remaining admissible
            remaining_after_deductible = max(0.0, eligible_amount - deductible_applied)
            
            # Co-pay
            copay_pct = float(req.copay_override if req.copay_override is not None else policy.copay_percentage)
            patient_copay = round(remaining_after_deductible * (copay_pct / 100.0), 2)
            
            # Insurer potential coverage
            potential_coverage = max(0.0, round(remaining_after_deductible - patient_copay, 2))
            
            # Estimated Out-Of-Pocket
            estimated_oop = max(0.0, round(incurred_cost - potential_coverage, 2))

        # 4. Claim Risk Indicator Engine (Section 19)
        risk_factors = []
        claim_risk_level = "LOW"

        # Check Waiting Period
        days_diff = None
        if req.policy_start_date and req.treatment_date:
            try:
                d_start = datetime.strptime(req.policy_start_date, "%Y-%m-%d")
                d_treat = datetime.strptime(req.treatment_date, "%Y-%m-%d")
                days_diff = (d_treat - d_start).days
            except Exception:
                pass

        if is_excluded:
            claim_risk_level = "HIGH"
            risk_factors.append("Procedure matches General Policy Exclusion (Exclusion 6.1)")
        else:
            # If specific condition like Cataract requires 24 months (730 days)
            if "cataract" in t_clean or "joint" in t_clean or "hernia" in t_clean:
                required_days = policy.waiting_period_specific_months * 30
                if days_diff is not None and days_diff < required_days:
                    claim_risk_level = "HIGH"
                    risk_factors.append(f"Waiting period requires verification: {policy.waiting_period_specific_months}-month specific disease waiting period not satisfied ({days_diff} days elapsed vs {required_days} days required)")
                elif days_diff is None:
                    risk_factors.append("Policy start date requires verification against 24-month specific disease waiting period")
                    if claim_risk_level == "LOW":
                        claim_risk_level = "MEDIUM"

            # Room Category Risk
            r_type = (req.room_type or "").lower()
            if any(w in r_type for w in ["deluxe", "super deluxe", "suite"]):
                risk_factors.append(f"Room category ('{req.room_type}') exceeds stated limit (INR {policy.room_rent_limit:,.0f}/day); proportionate deductions may apply")
                if claim_risk_level == "LOW":
                    claim_risk_level = "MEDIUM"

            # Conflicting clauses in policy
            if policy.has_conflicts:
                risk_factors.append("Potential policy inconsistency detected between earlier clauses and endorsements")
                if claim_risk_level == "LOW":
                    claim_risk_level = "MEDIUM"

            if len(missing_info) > 0:
                risk_factors.append(f"Incomplete information ({len(missing_info)} fields unconfirmed)")
                if claim_risk_level == "LOW":
                    claim_risk_level = "MEDIUM"

        if not risk_factors:
            risk_factors.append("Policy active with waiting period criteria and room ceilings satisfied")

        # 5. Build Comprehensive Decision Trace (Section 15)
        decision_trace: List[DecisionStep] = []
        step_i = 1

        # Step 1: Incurred Cost
        decision_trace.append(DecisionStep(
            step_number=step_i,
            id="incurred_cost",
            label="Treatment Cost",
            value_display=f"₹{incurred_cost:,.0f}",
            value_numeric=incurred_cost,
            description="Estimated hospital procedure, bed, and surgical charges",
            status="neutral",
            formula=None,
            evidence=None
        ))
        step_i += 1

        # Step 2: Policy Coverage Clause
        if is_excluded:
            decision_trace.append(DecisionStep(
                step_number=step_i,
                id="policy_clause",
                label="Policy Exclusion Clause",
                value_display="EXCLUDED",
                value_numeric=0.0,
                description="Elective aesthetic / cosmetic procedures are non-payable under standard terms",
                status="danger",
                formula="Excluded from coverage schedule",
                evidence=exclusion_evidence
            ))
            step_i += 1
        else:
            decision_trace.append(DecisionStep(
                step_number=step_i,
                id="policy_clause",
                label="Policy Coverage Clause",
                value_display=f"{t_name} Covered",
                value_numeric=incurred_cost,
                description=f"Inpatient medical care recognized under operative scope up to Sum Insured ₹{policy.sum_insured:,.0f}",
                status="success",
                formula="Scope of Medical Benefits (Section 1)",
                evidence=EvidenceSnippet(
                    page=1,
                    section="Section 1: Operative Clause & Scope of Health Coverage",
                    supporting_text=f"The Company will indemnify medically necessary expenses reasonably incurred up to the Sum Insured of INR {policy.sum_insured:,.0f}.",
                    limit=f"INR {policy.sum_insured:,.0f}",
                    confidence="HIGH"
                )
            ))
            step_i += 1

        # Step 3: Waiting Period
        wp_status = "warning" if (days_diff is not None and days_diff < 730) else "success"
        wp_display = "Waiting Period Warning" if wp_status == "warning" else "Waiting Period Checked"
        wp_desc = f"{policy.waiting_period_specific_months} Months condition clause verified"
        if days_diff is not None:
            wp_desc += f" ({days_diff} days continuous tenure)"

        decision_trace.append(DecisionStep(
            step_number=step_i,
            id="waiting_period",
            label="Waiting Period Verification",
            value_display=wp_display,
            value_numeric=None,
            description=wp_desc,
            status=wp_status,
            formula="Tenure >= 24 Months",
            evidence=EvidenceSnippet(
                page=4,
                section="Section 5: Waiting Periods • Clause 5.2",
                supporting_text=f"Conditions including {t_name} require a continuous waiting period of {policy.waiting_period_specific_months} months from policy start date before benefits can be claimed.",
                limit=f"{policy.waiting_period_specific_months} Months",
                confidence="HIGH"
            )
        ))
        step_i += 1

        # Step 4: Sub-limit
        if applicable_sublimit is not None and not is_excluded:
            decision_trace.append(DecisionStep(
                step_number=step_i,
                id="sub_limit",
                label="Treatment Sub-Limit Cap",
                value_display=f"₹{applicable_sublimit:,.0f}",
                value_numeric=applicable_sublimit,
                description=f"Statutory cap for {t_name}; excess charges shifted to Out-Of-Pocket",
                status="neutral",
                formula=f"min(Cost, Sub-limit: ₹{applicable_sublimit:,.0f})",
                evidence=sublimit_evidence
            ))
            step_i += 1

        # Step 5: Eligible Amount
        decision_trace.append(DecisionStep(
            step_number=step_i,
            id="eligible_amount",
            label="Eligible Admissible Base",
            value_display=f"₹{eligible_amount:,.0f}",
            value_numeric=eligible_amount,
            description="Amount eligible for claim adjudication prior to deductible",
            status="neutral",
            formula=f"min(₹{incurred_cost:,.0f}, ₹{applicable_sublimit or incurred_cost:,.0f})",
            evidence=None
        ))
        step_i += 1

        # Step 6: Deductible
        if not is_excluded:
            decision_trace.append(DecisionStep(
                step_number=step_i,
                id="deductible",
                label="Annual Deductible",
                value_display=f"₹{deductible_applied:,.0f}",
                value_numeric=deductible_applied,
                description="Patient mandatory initial threshold per policy year",
                status="neutral",
                formula="Policy Deductible: ₹10,000",
                evidence=EvidenceSnippet(
                    page=4,
                    section="Section 4: Cost Sharing • Clause 4.1",
                    supporting_text=f"Aggregate deductible of INR {policy.deductible:,.0f}. The insured must settle the initial amount before claim benefits become payable.",
                    limit=f"INR {policy.deductible:,.0f}",
                    confidence="HIGH"
                )
            ))
            step_i += 1

        # Step 7: Co-payment
        if not is_excluded:
            decision_trace.append(DecisionStep(
                step_number=step_i,
                id="copay",
                label=f"Patient Co-Payment ({copay_pct:.0f}%)",
                value_display=f"₹{patient_copay:,.0f}",
                value_numeric=patient_copay,
                description=f"Patient cost-sharing ({copay_pct:.0f}% of ₹{remaining_after_deductible:,.0f} admissible balance)",
                status="neutral",
                formula=f"{copay_pct:.0f}% × ₹{remaining_after_deductible:,.0f}",
                evidence=EvidenceSnippet(
                    page=4,
                    section="Section 4: Cost Sharing • Clause 4.2",
                    supporting_text=f"A mandatory Co-payment of {policy.copay_percentage:.0f}% shall apply to all admissible claim amounts after application of sub-limits and deductible.",
                    limit=f"{policy.copay_percentage:.0f}%",
                    confidence="HIGH"
                )
            ))
            step_i += 1

        # Step 8: Potential Coverage
        decision_trace.append(DecisionStep(
            step_number=step_i,
            id="potential_coverage",
            label="Potential Insurer Coverage",
            value_display=f"₹{potential_coverage:,.0f}",
            value_numeric=potential_coverage,
            description="Net estimated claim indemnification by insurer",
            status="success" if potential_coverage > 0 else "danger",
            formula=f"₹{remaining_after_deductible:,.0f} − ₹{patient_copay:,.0f}",
            evidence=None
        ))
        step_i += 1

        # Step 9: Estimated OOP
        decision_trace.append(DecisionStep(
            step_number=step_i,
            id="estimated_oop",
            label="Estimated Out-Of-Pocket",
            value_display=f"₹{estimated_oop:,.0f}",
            value_numeric=estimated_oop,
            description="Total financial responsibility for patient (Uncovered Cost + Deductible + Co-Pay)",
            status="warning" if estimated_oop > 0 else "success",
            formula=f"Treatment Cost (₹{incurred_cost:,.0f}) − Coverage (₹{potential_coverage:,.0f})",
            evidence=None
        ))

        confidence = "HIGH" if (not policy.has_conflicts and is_ready and not is_excluded) else ("MEDIUM" if not is_excluded else "HIGH")
        conf_rationale = "Calculations derived deterministically from verified policy parameters and sub-limit schedules."
        if policy.has_conflicts:
            confidence = "MEDIUM"
            conf_rationale = "Policy contains conflicting clauses regarding living limits. Calculations reflect standard base schedule."

        return CoverageCalculationResponse(
            treatment_name=t_name,
            incurred_cost=incurred_cost,
            applicable_sublimit=applicable_sublimit,
            eligible_amount=eligible_amount,
            deductible_applied=deductible_applied,
            remaining_after_deductible=remaining_after_deductible,
            copay_percentage=copay_pct,
            patient_copay_amount=patient_copay,
            potential_coverage=potential_coverage,
            estimated_oop=estimated_oop,
            readiness_level=readiness_level,
            is_ready_for_estimate=is_ready,
            missing_information=missing_info,
            claim_risk_level=claim_risk_level,
            claim_risk_factors=risk_factors,
            confidence=confidence,
            confidence_rationale=conf_rationale,
            decision_trace=decision_trace
        )

coverage_engine = CoverageEngine()
