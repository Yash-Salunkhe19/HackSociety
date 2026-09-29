import os
import re
from typing import List, Dict, Any, Tuple
import pymupdf  # PyMuPDF

try:
    import pytesseract
    from PIL import Image
    import io
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

class PDFService:
    def __init__(self):
        pass

    def extract_policy_document(self, file_path: str) -> Tuple[List[Dict[str, Any]], bool]:
        """
        Extracts policy page by page.
        Returns (pages_list, ocr_used_globally).
        Each page contains:
          page_number (1-indexed)
          text (clean text)
          sections (detected headers/sections)
          char_count (int)
          ocr_applied (bool)
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Policy file not found: {file_path}")

        doc = pymupdf.open(file_path)
        pages_data = []
        any_ocr_used = False

        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_num = page_idx + 1
            raw_text = page.get_text("text").strip()
            ocr_applied = False

            # Check if text is sufficient
            if len(raw_text) < 40 and OCR_AVAILABLE:
                try:
                    # Render page to pixmap image and run tesseract OCR
                    pix = page.get_pixmap(dpi=150)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    ocr_text = pytesseract.image_to_string(img).strip()
                    if len(ocr_text) > len(raw_text):
                        raw_text = ocr_text
                        ocr_applied = True
                        any_ocr_used = True
                except Exception as e:
                    print(f"[PDFService] OCR fallback failed for page {page_num}: {e}")

            # Detect sections or clauses
            sections = self._detect_sections(raw_text)

            pages_data.append({
                "page_number": page_num,
                "text": raw_text,
                "sections": sections,
                "char_count": len(raw_text),
                "ocr_applied": ocr_applied
            })

        doc.close()
        return pages_data, any_ocr_used

    def _detect_sections(self, text: str) -> List[str]:
        sections = []
        lines = text.split("\n")
        for line in lines:
            line_str = line.strip()
            # Match patterns like "Section 1:", "Clause 2.1", "Exclusion 6.1"
            if re.match(r'^(Section\s+\d+|Clause\s+[\d\.]+|Exclusion\s+[\d\.]+|Schedule|Table)', line_str, re.IGNORECASE):
                sections.append(line_str)
            elif any(kw in line_str.lower() for kw in ['room rent', 'sub-limit', 'waiting period', 'co-payment', 'deductible', 'exclusions']) and len(line_str) < 60:
                if line_str not in sections:
                    sections.append(line_str)
        return sections

pdf_service = PDFService()
