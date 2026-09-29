import re
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class RetrievalService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
        self.pages: List[Dict[str, Any]] = []
        self.chunks: List[Dict[str, Any]] = []
        self.tfidf_matrix = None

    def index_policy(self, pages: List[Dict[str, Any]]):
        """
        Indexes policy pages and paragraph chunks with TF-IDF.
        """
        self.pages = pages
        self.chunks = []

        for p in pages:
            p_num = p["page_number"]
            full_text = p["text"]
            
            # Split into meaningful paragraph chunks
            paragraphs = [para.strip() for para in re.split(r'\n\s*\n', full_text) if len(para.strip()) > 20]
            if not paragraphs:
                paragraphs = [full_text]

            for chunk_idx, para in enumerate(paragraphs):
                # Detect section header in this paragraph
                section_title = f"Page {p_num}"
                for s in p.get("sections", []):
                    if s.lower() in para.lower():
                        section_title = f"Page {p_num} • {s}"
                        break
                
                self.chunks.append({
                    "chunk_id": f"p{p_num}_c{chunk_idx}",
                    "page": p_num,
                    "section": section_title,
                    "text": para,
                })

        if self.chunks:
            corpus = [c["text"] for c in self.chunks]
            self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
            print(f"[RetrievalService] Indexed {len(self.chunks)} chunks across {len(self.pages)} pages.")

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves top evidence chunks using TF-IDF + Cosine Similarity + Domain Keyword Boosting.
        """
        if not self.chunks or self.tfidf_matrix is None:
            return []

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # Domain keyword boosting
        query_words = set(re.findall(r'\w+', query.lower()))
        boosted_scores = np.copy(similarities)

        domain_keywords = {
            'cataract': ['cataract', 'eye', 'lens', 'phaco'],
            'room': ['room rent', 'room category', 'per day', 'icu', 'deluxe', 'suite'],
            'copay': ['co-pay', 'copayment', 'co-payment', '10%', 'share'],
            'deductible': ['deductible', '10,000', 'aggregate', 'annual'],
            'waiting': ['waiting period', '24 months', '36 months', '30 days', 'pre-existing', 'ped'],
            'cosmetic': ['cosmetic', 'aesthetic', 'plastic surgery', 'appearance', 'exclusion'],
            'exclusion': ['exclusion', 'not liable', 'excluded', 'unproven', 'dental', 'obesity'],
            'limit': ['sub-limit', 'sum insured', 'maximum limit', 'sublimit', '5,00,000', '40,000'],
            'claim': ['intimation', '48 hours', 'emergency', 'discharge', 'bills', 'claim']
        }

        for idx, chunk in enumerate(self.chunks):
            chunk_lower = chunk["text"].lower()
            bonus = 0.0

            # Direct word hits
            for w in query_words:
                if len(w) > 3 and w in chunk_lower:
                    bonus += 0.15

            # Semantic domain keyword boost
            for category, related_terms in domain_keywords.items():
                if any(k in query.lower() for k in [category] + related_terms[:2]):
                    for term in related_terms:
                        if term in chunk_lower:
                            bonus += 0.25
                            break

            boosted_scores[idx] += bonus

        # Rank indices
        top_indices = np.argsort(boosted_scores)[::-1][:top_k]
        results = []

        for rank_pos, idx in enumerate(top_indices):
            score = float(boosted_scores[idx])
            raw_sim = float(similarities[idx])
            chunk = self.chunks[idx]

            # Only return if there is meaningful relevance
            if score > 0.05 or raw_sim > 0.05:
                # Extract most relevant sentences for crisp evidence
                text = chunk["text"]
                sentences = re.split(r'(?<=[.!?])\s+', text)
                matching_sentences = []
                for s in sentences:
                    s_clean = s.strip()
                    if any(w in s_clean.lower() for w in query_words if len(w) > 3):
                        matching_sentences.append(s_clean)
                
                highlighted_text = " ".join(matching_sentences) if matching_sentences else text

                results.append({
                    "page": chunk["page"],
                    "section": chunk["section"],
                    "supporting_text": highlighted_text,
                    "full_chunk": text,
                    "relevance_score": round(score, 3),
                    "confidence": "HIGH" if score >= 0.35 else ("MEDIUM" if score >= 0.15 else "LOW")
                })

        return results

retrieval_service = RetrievalService()
