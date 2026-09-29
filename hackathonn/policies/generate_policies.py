import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def build_demo_policy(filename="policies/demo_health_policy.pdf"):
    doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F2A4A'),
        spaceAfter=10
    )
    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=14,
        spaceAfter=8
    )
    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=6
    )
    callout_style = ParagraphStyle(
        'CalloutCustom',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#047857'),
        backColor=colors.HexColor('#ECFDF5'),
        borderColor=colors.HexColor('#10B981'),
        borderWidth=1,
        borderPadding=6,
        spaceAfter=10
    )
    
    story = []
    
    # --- PAGE 1: POLICY SCHEDULE & GENERAL DETAILS ---
    story.append(Paragraph("HEALTHSECURE ELITE HEALTH INSURANCE POLICY", title_style))
    story.append(Paragraph("<b>Policy Schedule & Underwriting Summary</b> (Synthetic Demonstration Document)", callout_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F2A4A'), spaceAfter=15))
    
    sched_data = [
        ["Policy Holder Name:", "Rajesh Sharma", "Policy Number:", "POL-IND-2023-88492"],
        ["Insurance Provider:", "HealthSecure National Insurance Ltd.", "Insured ID:", "INS-774019"],
        ["Base Sum Insured:", "INR 5,00,000 (Rupees Five Lakh Only)", "Policy Tenure:", "1 Year (Renewable)"],
        ["Policy Start Date:", "01-January-2022", "Policy Expiry Date:", "31-December-2024"],
        ["Network Hospitalization:", "Cashless & Reimbursement across India", "Domiciliary Coverage:", "Covered up to INR 25,000"]
    ]
    t_sched = Table(sched_data, colWidths=[130, 150, 110, 140])
    t_sched.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_sched)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("Section 1: Operative Clause & Scope of Health Coverage", h2_style))
    story.append(Paragraph(
        "Subject to terms, conditions, definitions, warranties and exclusions contained herein, HealthSecure agrees "
        "that if during the period of insurance, the Insured Person contracts any disease or suffers from any illness "
        "or sustains any bodily injury through accident, and such condition requires hospitalization upon the recommendation "
        "of a licensed medical practitioner in a registered hospital or day-care center, the Company will indemnify the "
        "medically necessary expenses reasonably incurred up to the Sum Insured of INR 5,00,000.", body_style
    ))
    story.append(Paragraph(
        "Inpatient care covers room charges, nursing care, intensive care unit fees, surgeon and medical practitioner fees, "
        "anesthesia, blood, oxygen, operation theatre charges, surgical appliances, and diagnostic procedures directly "
        "related to the treated condition.", body_style
    ))
    story.append(PageBreak())
    
    # --- PAGE 2: INPATIENT LIMITS & ROOM RENT ---
    story.append(Paragraph("Section 2: Room Rent, ICU and Associated Living Charges", h2_style))
    story.append(Paragraph(
        "<b>Clause 2.1 - Room Category & Daily Rent Limit:</b><br/>"
        "The daily room rent and boarding expenses eligible for coverage under this policy is limited to a maximum of "
        "<b>INR 5,000 per day</b> (Rupees Five Thousand only) for Standard Single Private AC room. If the Insured occupies "
        "a room category or room charge exceeding INR 5,000 per day (such as Deluxe, Super Deluxe, or Suite), a proportionate "
        "deduction shall apply to all associate medical expenses including doctor consultation fees, nursing fees, and "
        "operating theater overheads as per industry proportionate deduction norms.", body_style
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>Clause 2.2 - Intensive Care Unit (ICU) Limit:</b><br/>"
        "Intensive Care Unit (ICU) or Intensive Cardiac Care Unit (ICCU) charges are covered up to a limit of "
        "<b>INR 10,000 per day</b> or actual charges incurred, whichever is lower.", body_style
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>Clause 2.3 - Pre and Post-Hospitalization Expenses:</b><br/>"
        "Pre-hospitalization medical expenses incurred up to 30 days prior to admission date, and post-hospitalization medical "
        "expenses incurred up to 60 days subsequent to discharge date are covered, provided that such expenses relate directly "
        "to the illness or injury for which inpatient hospitalization took place.", body_style
    ))
    story.append(PageBreak())
    
    # --- PAGE 3: SUB-LIMITS & CATARACT SURGERY ---
    story.append(Paragraph("Section 3: Specific Sub-Limits on Treatments & Daycare Procedures", h2_style))
    story.append(Paragraph(
        "Notwithstanding the total Sum Insured of INR 5,00,000, the following specific treatments and medical procedures "
        "are subject to explicit statutory monetary sub-limits irrespective of the actual hospital bill amount:", body_style
    ))
    story.append(Spacer(1, 8))
    
    sublimits_data = [
        ["Procedure / Treatment Name", "Maximum Limit Per Incident / Eye", "Applicable Waiting Period"],
        ["Cataract Surgery (Phaco / Laser)", "INR 40,000 per eye", "24 Months continuous coverage"],
        ["Joint Replacement (Knee / Hip)", "INR 1,75,000 per joint", "24 Months continuous coverage"],
        ["Hernia Repair (Inguinal / Umbilical)", "INR 50,000", "24 Months continuous coverage"],
        ["Hysterectomy for non-malignant", "INR 65,000", "24 Months continuous coverage"],
        ["Chemotherapy & Oncology Inpatient", "Covered up to Sum Insured", "30 Days initial waiting period"],
        ["MRI / CT Scan / Advanced Imaging", "Subject to hospitalization", "Part of diagnostic inpatient limit"]
    ]
    t_sub = Table(sublimits_data, colWidths=[170, 160, 200])
    t_sub.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_sub)
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(
        "<b>Clause 3.1 - Cataract Treatment Terms:</b><br/>"
        "Cataract procedure is covered subject to a maximum sub-limit of <b>INR 40,000 per eye</b>. This limit encompasses "
        "the cost of lens, surgical fees, day-care hospital bed charges, and associated consumables. Any expense exceeding "
        "INR 40,000 shall be borne solely by the insured patient as Out-Of-Pocket expense. Coverage for cataract surgery "
        "is subject to completion of the mandatory 24-month specific illness waiting period.", body_style
    ))
    story.append(PageBreak())
    
    # --- PAGE 4: DEDUCTIBLE, CO-PAY & WAITING PERIODS ---
    story.append(Paragraph("Section 4: Cost Sharing Mechanisms (Deductible & Co-Payment)", h2_style))
    story.append(Paragraph(
        "<b>Clause 4.1 - Annual Compulsory Deductible:</b><br/>"
        "This policy is issued with an annual aggregate deductible of <b>INR 10,000</b> (Rupees Ten Thousand only). "
        "The Company shall be liable to pay or reimburse only those covered medical expenses that exceed the aggregate "
        "deductible amount of INR 10,000 per policy year. The insured person must settle the initial INR 10,000 before "
        "claim benefits become payable.", body_style
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>Clause 4.2 - Co-Payment Requirement:</b><br/>"
        "A mandatory <b>Co-payment of 10%</b> shall apply to all admissible claim amounts after application of sub-limits "
        "and deductible. The Insured Person shall bear 10% of the admissible claim amount, and the Company shall pay "
        "the remaining 90% balance up to the available sum insured.", body_style
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Section 5: Waiting Periods and Time Exclusions", h2_style))
    story.append(Paragraph(
        "<b>Clause 5.1 - Initial 30-Day Waiting Period:</b> Medical expenses incurred during the first 30 days from policy "
        "inception are excluded, except for hospitalization necessitated solely by an unexpected accident.", body_style
    ))
    story.append(Paragraph(
        "<b>Clause 5.2 - Specified Disease 24-Month Waiting Period:</b> Conditions including Cataract, Benign Prostatic "
        "Hypertrophy, Hernia, Hydrocele, Fistula, Piles, Sinusitis, Gallstones, Osteoarthritis and Joint Replacements require "
        "a continuous waiting period of <b>24 months</b> from the policy start date before benefits can be claimed.", body_style
    ))
    story.append(Paragraph(
        "<b>Clause 5.3 - Pre-Existing Diseases (PED) Waiting Period:</b> Any pre-existing disease documented or diagnosed prior "
        "to policy purchase is covered only after <b>36 months</b> of continuous, uninterrupted renewals.", body_style
    ))
    story.append(PageBreak())
    
    # --- PAGE 5: EXCLUSIONS & CLAIM PROTOCOLS ---
    story.append(Paragraph("Section 6: General Policy Exclusions", h2_style))
    story.append(Paragraph(
        "The Company shall not be liable to make any payment under this policy in respect of expenses incurred for:<br/>"
        "• <b>Exclusion 6.1: Cosmetic & Aesthetic Surgery:</b> Cosmetic or plastic surgery or any treatment to enhance appearance, "
        "unless necessitated by accident reconstructive surgery following burns or trauma.<br/>"
        "• <b>Exclusion 6.2: Obesity & Weight Control:</b> Any treatment or bariatric surgery for obesity or weight reduction.<br/>"
        "• <b>Exclusion 6.3: Unproven & Experimental Treatments:</b> Treatments, therapies, and medicines lacking empirical "
        "verification by the national medical regulatory authority.<br/>"
        "• <b>Exclusion 6.4: Dental Treatment:</b> Routine dental examinations, fillings, extraction, or prosthetics unless requiring "
        "inpatient hospitalization due to accidental fracture of the jaw.<br/>"
        "• <b>Exclusion 6.5: Self-Inflicted Injury:</b> Treatment arising from deliberate self-inflicted harm or alcohol abuse.", body_style
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Section 7: Claim Notification & Adjudication Protocol", h2_style))
    story.append(Paragraph(
        "<b>Clause 7.1 - Prior Intimation:</b> For planned hospitalizations, written intimation must be delivered to the insurer "
        "at least 48 hours prior to admission. In case of emergency hospitalization, notice must be served within 24 hours of admission.<br/>"
        "<b>Clause 7.2 - Document Submission:</b> Original itemized hospital bills, medical receipts, diagnostic investigation reports, "
        "and signed physician discharge summary must be submitted within 15 calendar days from discharge.<br/>"
        "<b>Disclaimer:</b> All claim payments remain subject to real-time verification of policy active status, sub-limits, "
        "medical necessity, and exclusions at the time of official adjudication.", body_style
    ))
    
    doc.build(story)
    print(f"Demo policy successfully created at {filename}")

def build_conflicting_policy(filename="policies/conflicting_clauses_policy.pdf"):
    doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor('#7F1D1D'))
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13, leading=16, textColor=colors.HexColor('#991B1B'))
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, leading=14, textColor=colors.HexColor('#1F2937'), spaceAfter=8)
    
    story = []
    # Page 1
    story.append(Paragraph("APEX HEALTH CARE STANDARD PLAN", title_style))
    story.append(Paragraph("<b>Policy Number:</b> APX-CONFLICT-TEST-001 | <b>Sum Insured:</b> INR 5,00,000", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#DC2626'), spaceAfter=15))
    story.append(Paragraph("Section 1: General Coverage", h2_style))
    story.append(Paragraph("This policy covers standard inpatient medical treatment expenses across registered hospitals.", body_style))
    story.append(PageBreak())
    
    # Page 2: Mentions Room Rent Limit = 5,000
    story.append(Paragraph("Section 2: Room Rent and Accommodations", h2_style))
    story.append(Paragraph(
        "<b>Clause 2.4 - Room Rent Specification:</b><br/>"
        "The room rent category covered under this plan is capped at a maximum ceiling of <b>INR 5,000 per day</b>. "
        "Any boarding fees higher than INR 5,000 per day shall trigger proportionate room deduction on all hospital bill items.", body_style
    ))
    story.append(PageBreak())
    
    # Page 3: General Sublimits
    story.append(Paragraph("Section 3: Sub-limits and Waiting Periods", h2_style))
    story.append(Paragraph(
        "Cataract procedures are restricted to a maximum payout of INR 40,000 per eye. "
        "Mandatory 24 months waiting period applies.", body_style
    ))
    story.append(PageBreak())
    
    # Page 4: CONFLICT! Mentions Room Rent Limit = 7,500
    story.append(Paragraph("Section 4: Enhanced Endorsement Schedule & Living Charges", h2_style))
    story.append(Paragraph(
        "<b>Clause 4.8 - Inpatient Accommodation Limit:</b><br/>"
        "Eligible room rent limit for all category A network hospitals shall be <b>INR 7,500 per day</b>. "
        "Insured patients may avail deluxe standard accommodations up to INR 7,500 per day without proportionate co-sharing penalties.", body_style
    ))
    
    doc.build(story)
    print(f"Conflicting policy created at {filename}")

if __name__ == '__main__':
    build_demo_policy()
    build_conflicting_policy()
