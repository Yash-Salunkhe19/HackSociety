import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional
from backend.models.schemas import PolicyUploadResponse, ExtractedPolicy, PolicyQARequest, PolicyQAResponse
from backend.services.pdf_service import pdf_service
from backend.services.retrieval_service import retrieval_service
from backend.services.policy_extraction_service import policy_extraction_service
from backend.services.qa_service import qa_service

router = APIRouter(prefix="/api/policy", tags=["Policy"])

UPLOAD_DIR = "uploads"
POLICIES_DIR = "policies"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(POLICIES_DIR, exist_ok=True)

@router.post("/upload", response_model=PolicyUploadResponse)
async def upload_policy(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF policy documents are supported.")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        pages, ocr_used = pdf_service.extract_policy_document(file_path)
        if not pages:
            raise HTTPException(status_code=400, detail="Could not extract text from the provided PDF.")
        
        # Index with TF-IDF for evidence retrieval
        retrieval_service.index_policy(pages)
        
        # Extract structured information & check for conflicts
        extracted = policy_extraction_service.extract_from_pages(pages, file.filename, ocr_used=ocr_used)
        
        return PolicyUploadResponse(
            status="success",
            message=f"Policy successfully processed. {len(pages)} pages detected and indexed.",
            policy_id=extracted.policy_id,
            filename=file.filename,
            total_pages=len(pages),
            pages_detected=len(pages),
            text_extracted=True,
            ocr_fallback_applied=ocr_used,
            extracted_summary=extracted
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing policy PDF: {str(e)}")

@router.post("/load-sample", response_model=PolicyUploadResponse)
async def load_sample_policy(sample_key: str = Query(..., description="'demo' or 'conflicting'")):
    if sample_key == "conflicting":
        file_path = os.path.join(POLICIES_DIR, "conflicting_clauses_policy.pdf")
        filename = "conflicting_clauses_policy.pdf"
    else:
        file_path = os.path.join(POLICIES_DIR, "demo_health_policy.pdf")
        filename = "demo_health_policy.pdf"
        
    if not os.path.exists(file_path):
        from policies.generate_policies import build_demo_policy, build_conflicting_policy
        build_demo_policy()
        build_conflicting_policy()
        
    try:
        pages, ocr_used = pdf_service.extract_policy_document(file_path)
        retrieval_service.index_policy(pages)
        extracted = policy_extraction_service.extract_from_pages(pages, filename, ocr_used=ocr_used)
        
        return PolicyUploadResponse(
            status="success",
            message=f"Sample policy '{filename}' loaded and indexed successfully.",
            policy_id=extracted.policy_id,
            filename=filename,
            total_pages=len(pages),
            pages_detected=len(pages),
            text_extracted=True,
            ocr_fallback_applied=ocr_used,
            extracted_summary=extracted
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load sample policy: {str(e)}")

@router.get("/summary", response_model=ExtractedPolicy)
def get_policy_summary():
    return policy_extraction_service.get_current_policy()

@router.post("/ask", response_model=PolicyQAResponse)
def ask_policy(req: PolicyQARequest):
    return qa_service.answer_question(req)

@router.get("/evidence")
def get_evidence(q: str = Query(..., description="Inquiry to search in policy")):
    return retrieval_service.retrieve(q, top_k=5)

@router.get("/pages")
def get_pages():
    pages = policy_extraction_service.raw_pages
    return [{"page_number": p["page_number"], "char_count": p["char_count"], "sections": p["sections"], "ocr_applied": p["ocr_applied"]} for p in pages]
