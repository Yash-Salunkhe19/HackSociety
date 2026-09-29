import re
from typing import List, Dict, Any, Tuple
from backend.models.schemas import ExtractedPolicy, ConflictDetail

class PolicyExtractionService:
    def __init__(self):
        self.current_policy: ExtractedPolicy = self._create_demo_policy()
        self.raw_pages: List[Dict[str, Any]] = []

    def _create_demo_policy(self) -> ExtractedPolicy:
        """
        Creates the canonical demo policy specified in Section 24:
        Patient: Rajesh Sharma
        Sum Insured: ₹5,00,000
        Cataract Sub-limit: ₹40,000
        Deductible: ₹10,000
        Co-pay: 10%
        Room Rent Limit: ₹5,000/day
        Specific Treatment Waiting Period: 24 months
        """
        return ExtractedPolicy(
            policy_id="demo",
            policy_name="HealthSecure Elite Health Insurance Policy (Synthetic Demo)",
            policy_holder="Rajesh Sharma",
            insurer="HealthSecure National Insurance Ltd.",
            policy_number="POL-IND-2023-88492",
            sum_insured=500000.0,
            room_rent_limit=5000.0,
            room_rent_type="Standard Single AC Room (proportionate deduction above limit)",
            copay_percentage=10.0,
            deductible=10000.0,
            waiting_period_initial_days=30,
            waiting_period_specific_months=24,
            waiting_period_ped_months=36,
            sub_limits={
                "Cataract Surgery": 40000.0,
                "Joint Replacement": 175000.0,
                "Hernia Repair": 50000.0,
                "Hysterectomy": 65000.0
            },
            exclusions=[
                "Cosmetic and aesthetic treatments (unless trauma/accident reconstruction)",
                "Obesity and weight control / bariatric surgery",
                "Unproven and experimental treatments lacking statutory medical clearance",
                "Routine dental examinations and non-surgical dentistry",
                "Deliberate self-inflicted harm or alcohol-related hospitalizations"
            ],
            claim_conditions=[
                "48 hours prior written intimation for planned hospitalizations",
                "24 hours notification for emergency admissions",
                "Original itemized bills and discharge summary required within 15 days"
            ],
            has_conflicts=False,
            conflicts=[],
            total_pages=5,
            ocr_fallback_used=False,
            is_demo=True
        )

    def extract_from_pages(self, pages: List[Dict[str, Any]], filename: str, ocr_used: bool = False) -> ExtractedPolicy:
        """
        Extracts structured policy fields from parsed pages text.
        Also scans for potential internal policy conflicts.
        """
        self.raw_pages = pages
        combined_text = "\n".join([p["text"] for p in pages])

        policy_holder = "Not Specified"
        insurer = "National Health Carrier"
        policy_num = "POL-AUTO-DETECTED"
        sum_insured = 500000.0
        room_limit = 5000.0
        copay_pct = 10.0
        deductible = 10000.0
        wp_initial = 30
        wp_specific = 24
        wp_ped = 36

        # Match Policy Holder
        m_holder = re.search(r'Policy Holder(?:\s+Name)?:\s*([A-Za-z\s]+?)(?:\s+Policy|\n|$)', combined_text, re.IGNORECASE)
        if m_holder:
            policy_holder = m_holder.group(1).strip()

        # Match Policy Number
        m_pol = re.search(r'Policy\s+(?:Number|No\.?):\s*([A-Z0-9\-]+)', combined_text, re.IGNORECASE)
        if m_pol:
            policy_num = m_pol.group(1).strip()

        # Match Insurer
        m_ins = re.search(r'Insurance\s+(?:Provider|Company):\s*([A-Za-z\s\.\,]+?)(?:\s+Insured|\n|$)', combined_text, re.IGNORECASE)
        if m_ins:
            insurer = m_ins.group(1).strip()
        elif "HealthSecure" in combined_text:
            insurer = "HealthSecure National Insurance Ltd."
        elif "Apex Health" in combined_text:
            insurer = "Apex Health Care"

        # Match Sum Insured
        m_si = re.search(r'Sum\s+Insured.*?INR\s*([\d\,]+)', combined_text, re.IGNORECASE)
        if m_si:
            try:
                sum_insured = float(m_si.group(1).replace(',', ''))
            except ValueError:
                pass

        # Match Deductible
        m_ded = re.search(r'deductible.*?INR\s*([\d\,]+)', combined_text, re.IGNORECASE)
        if m_ded:
            try:
                deductible = float(m_ded.group(1).replace(',', ''))
            except ValueError:
                pass

        # Match Co-pay
        m_copay = re.search(r'Co-payment\s+of\s*(\d+)%', combined_text, re.IGNORECASE)
        if m_copay:
            try:
                copay_pct = float(m_copay.group(1))
            except ValueError:
                pass

        # Match Waiting periods
        m_wps = re.search(r'(\d+)\s*months.*?(?:waiting period|specific)', combined_text, re.IGNORECASE)
        if m_wps:
            try:
                wp_specific = int(m_wps.group(1))
            except ValueError:
                pass

        # Detect Sub-limits
        sub_limits = {}
        if re.search(r'cataract.*?INR\s*([\d\,]+)', combined_text, re.IGNORECASE):
            m_cat = re.search(r'cataract.*?INR\s*([\d\,]+)', combined_text, re.IGNORECASE)
            try:
                sub_limits["Cataract Surgery"] = float(m_cat.group(1).replace(',', ''))
            except ValueError:
                sub_limits["Cataract Surgery"] = 40000.0
        else:
            sub_limits["Cataract Surgery"] = 40000.0

        if re.search(r'joint replacement.*?INR\s*([\d\,]+)', combined_text, re.IGNORECASE):
            m_jr = re.search(r'joint replacement.*?INR\s*([\d\,]+)', combined_text, re.IGNORECASE)
            try:
                sub_limits["Joint Replacement"] = float(m_jr.group(1).replace(',', ''))
            except ValueError:
                pass

        if re.search(r'hernia.*?INR\s*([\d\,]+)', combined_text, re.IGNORECASE):
            m_her = re.search(r'hernia.*?INR\s*([\d\,]+)', combined_text, re.IGNORECASE)
            try:
                sub_limits["Hernia Repair"] = float(m_her.group(1).replace(',', ''))
            except ValueError:
                pass

        # --- CONFLICT DETECTION (Section 20) ---
        conflicts = []
        has_conflicts = False

        # Scan for room rent statements across individual pages
        room_limit_mentions = []
        for p in pages:
            p_text = p["text"]
            p_num = p["page_number"]
            # Look for room rent figures on this page
            matches = re.findall(r'room\s+rent.*?INR\s*([\d\,]+)', p_text, re.IGNORECASE)
            for m in matches:
                val = float(m.replace(',', ''))
                room_limit_mentions.append({"page": p_num, "value": val, "raw": f"INR {val:,.0f} per day"})

        if len(room_limit_mentions) >= 2:
            val_first = room_limit_mentions[0]["value"]
            for other in room_limit_mentions[1:]:
                if abs(other["value"] - val_first) > 1.0:
                    has_conflicts = True
                    conflicts.append(ConflictDetail(
                        field="Room Rent Limit",
                        value_a=f"INR {val_first:,.0f} / day",
                        page_a=room_limit_mentions[0]["page"],
                        value_b=f"INR {other['value']:,.0f} / day",
                        page_b=other["page"],
                        description="Potential policy inconsistency detected between earlier clause and endorsement section. InsuraTrace displays both citations without arbitrary adjudication."
                    ))
                    break

        if room_limit_mentions:
            room_limit = room_limit_mentions[0]["value"]

        # Parse Exclusions
        exclusions = []
        if "Cosmetic" in combined_text or "aesthetic" in combined_text:
            exclusions.append("Cosmetic and aesthetic procedures (Page 5, Exclusion 6.1)")
        if "Obesity" in combined_text:
            exclusions.append("Obesity and bariatric treatment (Page 5, Exclusion 6.2)")
        if "Unproven" in combined_text or "Experimental" in combined_text:
            exclusions.append("Unproven or experimental medical procedures (Page 5, Exclusion 6.3)")
        if "Dental" in combined_text:
            exclusions.append("Dental treatments unless necessitated by accidental trauma (Page 5, Exclusion 6.4)")
        if not exclusions:
            exclusions = ["Cosmetic treatments", "Experimental therapies", "Non-emergency dental surgery"]

        claim_conditions = [
            "48 hours prior notification for planned hospitalizations",
            "24 hours notification for emergency admissions",
            "Submission of original bills and discharge summary within 15 days"
        ]

        extracted = ExtractedPolicy(
            policy_id="uploaded_" + str(abs(hash(filename)))[:8],
            policy_name=f"Policy Document: {filename}",
            policy_holder=policy_holder,
            insurer=insurer,
            policy_number=policy_num,
            sum_insured=sum_insured,
            room_rent_limit=room_limit,
            room_rent_type="Standard Single AC Room",
            copay_percentage=copay_pct,
            deductible=deductible,
            waiting_period_initial_days=wp_initial,
            waiting_period_specific_months=wp_specific,
            waiting_period_ped_months=wp_ped,
            sub_limits=sub_limits,
            exclusions=exclusions,
            claim_conditions=claim_conditions,
            has_conflicts=has_conflicts,
            conflicts=conflicts,
            total_pages=len(pages),
            ocr_fallback_used=ocr_used,
            is_demo=False
        )

        self.current_policy = extracted
        return extracted

    def get_current_policy(self) -> ExtractedPolicy:
        return self.current_policy

policy_extraction_service = PolicyExtractionService()
