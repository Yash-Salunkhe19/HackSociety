from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from backend.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["Data"])

@router.get("/patients")
def get_patients(search: Optional[str] = Query(None, description="Search by name, patient_id or insurer")):
    return data_service.get_patients(search)

@router.get("/patients/{patient_id}")
def get_patient_detail(patient_id: str):
    res = data_service.get_patient(patient_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found in database.")
    return res

@router.get("/treatments")
def get_treatments():
    return {
        "unique_treatment_types": data_service.get_unique_treatment_types(),
        "all_treatments": data_service.get_treatments()
    }

@router.get("/appointments")
def get_appointments():
    return data_service.get_appointments()

@router.get("/billing")
def get_billing():
    return data_service.get_billing()

@router.get("/doctors")
def get_doctors():
    return data_service.get_doctors()
