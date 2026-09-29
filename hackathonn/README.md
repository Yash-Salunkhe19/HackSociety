# INSURATRACE
### Evidence-Backed Insurance Coverage & Treatment Cost Intelligence

> **Tagline:** Trace the Policy. Understand the Coverage. Estimate the Cost.  
> **Problem Statement:** FIN-01: Policy-to-Patient Insurance Coverage & Treatment Cost Intelligence

---

## 1. Executive Summary & Objective

**InsuraTrace** is an AI-powered healthcare-fintech decision-support platform designed to eliminate financial ambiguity for patients facing medical hospitalizations. In traditional health insurance workflows, patients discover deductibles, co-pays, sub-limits, and exclusions only after claim denial or post-discharge billing surprises. 

InsuraTrace bridges this gap through a deterministic, evidence-backed pipeline:

```
INSURANCE POLICY PDF
        ↓
EXTRACTED CLAUSES & LIMITS
        ↓
PATIENT (Real Cohort)
        ↓
TREATMENT SCENARIO
        ↓
REPRESENTATIVE TREATMENT COST (Data-Derived)
        ↓
POLICY CONDITIONS (Sub-limits, Waiting Periods, Room Caps)
        ↓
POTENTIAL COVERAGE (Deterministic Formula)
        ↓
ESTIMATED OUT-OF-POCKET (OOP)
        ↓
AUDITED DECISION TRACE & SOURCE EVIDENCE
```

---

## 2. Core Architectural Principles

1. **Deterministic Rule Engine:** AI interprets policy language and extracts clauses, but **RULES CALCULATE** and **EVIDENCE VERIFIES**. Insurance math (deductibles, co-payments, sub-limits) is never left to generative hallucinations.
2. **Strict Verifiable Attribution:** Every coverage statement cites the source document, exact page number, section title, and supporting clause snippet.
3. **Data Integrity & Relational Access:** Real patient, treatment, appointment, doctor, and billing records are accessed via a dedicated pandas data layer. If a relational key is missing, InsuraTrace displays `"Insufficient linked data"` rather than fabricating relationships.
4. **Transparent Risk & Readiness Detection:** Identifies unconfirmed clinical parameters (e.g., room category, policy start date) and flags transparent rule-based risk factors (e.g., waiting period tenure, room rent caps).

---

## 3. Key Features & Modules

- **Dashboard:** Executive intelligence view summarizing policy status, patient demographics, incurred hospital cost, potential coverage, estimated out-of-pocket, real activity logs from appointments, billing metrics, and doctor specializations.
- **Policy Upload & Document Processing:** Page-by-page PDF extraction using **PyMuPDF** with selective **OCR fallback** for scanned pages.
- **Policy Overview & Conflict Detector:** Structured parameters (Sum Insured, Room Limit, Deductible, Co-pay, Waiting Periods, Sub-limits). Automatically detects internal contradictions (e.g., different room limits on different pages) without making arbitrary assumptions.
- **Ask InsuraTrace (Policy Q&A):** Natural query answering backed by **TF-IDF + Cosine Similarity** page-level retrieval. Shows status (`POTENTIALLY_COVERED`, `EXCLUDED`, `SUBJECT_TO_CONDITIONS`), exact supporting text, page number, confidence, and underwriting assumptions.
- **Patients Registry:** Relational explorer mapping `patients.csv` with `appointments.csv`, `treatments.csv`, `billing.csv`, and `doctors.csv`.
- **Treatment Analyzer & Cost Engine:** Estimates procedure charges using historical dataset medians (outlier-resistant) and min/max ranges, with transparent source attribution and manual override capabilities.
- **Coverage Engine:** Deterministic calculation breaking down:
  $$\text{Eligible Amount} = \min(\text{Incurred Cost}, \text{Sub-limit}, \text{Sum Insured})$$
  $$\text{Admissible Balance} = \max(0, \text{Eligible Amount} - \text{Deductible})$$
  $$\text{Patient Co-Pay} = \text{Admissible Balance} \times \text{Co-Pay \%}$$
  $$\text{Potential Coverage} = \text{Admissible Balance} - \text{Patient Co-Pay}$$
  $$\text{Estimated OOP} = \text{Incurred Cost} - \text{Potential Coverage}$$
- **Interactive Decision Trace:** Visual vertical timeline where every single calculation node can be clicked to inspect the underlying policy clause and mathematical formula.
- **What-If Simulator:** Interactive sliders and dropdowns to adjust treatment cost (e.g., ₹75,000 → ₹1,00,000), room category, hospital type, or co-pay, with live before-vs-after delta comparisons and charts.

---

## 4. Verification Test Cases

InsuraTrace is verified with 6 automated test cases (`backend/test_suite.py`):

| Test Case | Scenario | Expected Outcome | Engine Verification |
| :--- | :--- | :--- | :--- |
| **TEST 1** | Cataract Surgery | Potentially Covered | Page 3 Clause 3.1, Sub-limit ₹40,000, 10% Co-pay, High Confidence |
| **TEST 2** | Cosmetic Procedure | Excluded / Non-Payable | Page 5 Exclusion 6.1 cited, High Confidence |
| **TEST 3** | Waiting Period Not Satisfied | High Claim Risk Warning | Tenure calculated (e.g. 7 months elapsed vs 24 months required) |
| **TEST 4** | Missing Room Category | Insufficient Information Alert | Readiness marked Medium/Low, missing field highlighted |
| **TEST 5** | Cost Change ₹75k → ₹100k | Recalculates Coverage & OOP | Cost Delta +₹25k; Coverage stays ₹27k (sub-limit capped); OOP Delta +₹25k |
| **TEST 6** | Conflicting Room Limits | Policy Inconsistency Alert | Identifies Page 2 (₹5,000) vs Page 4 (₹7,500) without guessing |

---

## 5. Technology Stack

- **Frontend:**
  - React 19 (Vite)
  - Tailwind CSS
  - Lucide React (Icons)
  - Recharts (Financial Exposure & What-If Visualizations)
- **Backend:**
  - Python 3.11+
  - FastAPI & Uvicorn
  - Pydantic v2
- **Data & Document Processing:**
  - pandas & NumPy
  - PyMuPDF (`pymupdf`)
  - scikit-learn (TF-IDF & Cosine Similarity)
  - ReportLab (Synthetic Policy Generation)
  - Tesseract OCR (`pytesseract` fallback)

---

## 6. Dataset Schema & Relationships

The application ingests 5 relational CSV files in `data/`:

1. **`patients.csv`** (50 records):
   `patient_id`, `first_name`, `last_name`, `gender`, `date_of_birth`, `contact_number`, `address`, `registration_date`, `insurance_provider`, `insurance_number`, `email`
2. **`appointments.csv`** (200 records):
   `appointment_id`, `patient_id` (FK), `doctor_id` (FK), `appointment_date`, `appointment_time`, `reason_for_visit`, `status`
3. **`treatments.csv`** (200 records):
   `treatment_id`, `appointment_id` (FK), `treatment_type`, `description`, `cost`, `treatment_date`
4. **`billing.csv`** (200 records):
   `bill_id`, `patient_id` (FK), `treatment_id` (FK), `bill_date`, `amount`, `payment_method`, `payment_status`
5. **`doctors.csv`** (10 records):
   `doctor_id`, `first_name`, `last_name`, `specialization`, `phone_number`, `years_experience`, `hospital_branch`, `email`

---

## 7. How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start the Backend Server

```bash
# In the workspace root
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs available at: `http://127.0.0.1:8000/docs`

### 2. Start the Frontend Server

```bash
cd frontend
npm install
npm run dev
```
Application accessible at: `http://localhost:5173/`

### 3. Run Automated Tests

```bash
# In the workspace root
python backend/test_suite.py
```

---

## 8. API Documentation Summary

- `POST /api/policy/upload`: Upload policy PDF for page parsing and indexing.
- `POST /api/policy/load-sample?sample_key={demo|conflicting}`: Instant load of test policies.
- `GET /api/policy/summary`: Returns structured extracted parameters of active policy.
- `POST /api/policy/ask`: Evidence-backed Q&A answering with source citations.
- `GET /api/patients`: Searchable patient list.
- `GET /api/patients/{id}`: Full clinical and billing history for a given patient.
- `POST /api/treatment/analyze`: Data-derived cost analytics (median, range, data points).
- `POST /api/coverage/calculate`: Deterministic calculation returning coverage and decision trace.
- `POST /api/what-if`: Scenario simulation with Before vs After deltas.
- `GET /api/dashboard`: Aggregated dashboard metrics.

---

## 9. Limitations & Disclaimer

> [!IMPORTANT]
> **Data Transparency Notice:**  
> The treatment and billing records used in this prototype may be synthetic or representative and are intended solely for functional demonstration purposes.

> [!WARNING]
> **Decision-Support Disclaimer:**  
> InsuraTrace provides informational estimates and evidence-backed decision support. It does not provide certified financial advice, medical diagnosis, or guarantees of claim approval or reimbursement. Final claim adjudication is governed by the insurer's official third-party administrators (TPA) and active policy terms at the time of claim submission.
