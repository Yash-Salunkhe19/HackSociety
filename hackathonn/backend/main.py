import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.policy_routes import router as policy_router
from backend.routes.data_routes import router as data_router
from backend.routes.treatment_routes import router as treatment_router
from backend.services.pdf_service import pdf_service
from backend.services.retrieval_service import retrieval_service
from backend.services.policy_extraction_service import policy_extraction_service
from policies.generate_policies import build_demo_policy, build_conflicting_policy

app = FastAPI(
    title="InsuraTrace API",
    description="Evidence-Backed Insurance Coverage & Treatment Cost Intelligence Platform",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(policy_router)
app.include_router(data_router)
app.include_router(treatment_router)

@app.on_event("startup")
def startup_event():
    """
    On startup, ensure sample policies exist and index demo policy so Q&A and coverage
    work immediately out-of-the-box.
    """
    demo_pdf_path = os.path.join("policies", "demo_health_policy.pdf")
    conflicting_pdf_path = os.path.join("policies", "conflicting_clauses_policy.pdf")
    
    if not os.path.exists(demo_pdf_path) or not os.path.exists(conflicting_pdf_path):
        os.makedirs("policies", exist_ok=True)
        build_demo_policy(demo_pdf_path)
        build_conflicting_policy(conflicting_pdf_path)
        
    try:
        pages, ocr_used = pdf_service.extract_policy_document(demo_pdf_path)
        retrieval_service.index_policy(pages)
        policy_extraction_service.extract_from_pages(pages, "demo_health_policy.pdf", ocr_used=ocr_used)
        print("[Startup] Initialized and indexed demo_health_policy.pdf successfully.")
    except Exception as e:
        print(f"[Startup] Warning during initial demo indexing: {e}")

@app.get("/")
def root():
    return {
        "app": "InsuraTrace",
        "tagline": "Trace the Policy. Understand the Coverage. Estimate the Cost.",
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
