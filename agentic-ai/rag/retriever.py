"""
GridFlowX Production RAG Retriever
==================================
Performs keyword-relevance, tag-weighted matching, and semantic query matching
across authoritative GridFlowX technical documentation.
"""

import re
from typing import List, Dict, Any, Optional
from rag.knowledge_store import KNOWLEDGE_DOCUMENTS


class ProductionKnowledgeRetriever:
    """Retrieves relevant documentation passages for operator and public queries."""

    @staticmethod
    def retrieve(query: str, top_k: int = 3, category_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        q_clean = query.lower()
        # Tokenize query into words and clean punctuation
        q_words = [w for w in re.findall(r"\b\w+\b", q_clean) if len(w) > 1]
        if not q_words:
            return []

        scored_docs = []

        for doc in KNOWLEDGE_DOCUMENTS:
            if category_filter and doc.get("category") != category_filter:
                continue

            score = 0
            doc_title = doc.get("title", "").lower()
            doc_content = doc.get("content", "").lower()
            doc_tags = [t.lower() for t in doc.get("tags", [])]

            # 1. Exact Tag Matches (High Weight)
            for word in q_words:
                if word in doc_tags:
                    score += 5
                if word in doc_title:
                    score += 3
                if word in doc_content:
                    score += 1

            # 2. Key Developer / Creator phrase boosts
            if any(k in q_clean for k in ["developer", "built", "created", "designed", "who", "author", "maker", "studio", "mk studios", "mekesh", "kongu", "kec"]):
                if doc.get("id") == "DOC-PROJECT-IDENTITY":
                    score += 15

            # 3. Architecture & Tech Stack boosts
            if any(k in q_clean for k in ["architecture", "hardware", "esp32", "fastapi", "stack", "frontend", "backend", "freertos"]):
                if doc.get("id") == "DOC-SYSTEM-ARCHITECTURE":
                    score += 10

            # 4. AI Models & Agents boosts
            if any(k in q_clean for k in ["ai agent", "ai model", "lstm", "arima", "xgboost", "isolation forest", "ppo", "agents", "models", "retrain"]):
                if doc.get("id") == "DOC-AI-AGENTS-FLEET":
                    score += 10

            # 5. Battery boosts
            if any(k in q_clean for k in ["battery", "lifepo4", "bess", "soc", "soh", "degradation", "temperature", "esr"]):
                if doc.get("id") == "DOC-BESS-LIFEPO4":
                    score += 8

            # 6. Load management & relay boosts
            if any(k in q_clean for k in ["tier 1", "tier 2", "tier 3", "shed", "shedding", "priorit", "relay", "contactor"]):
                if doc.get("id") == "DOC-RELAY-ROUTING":
                    score += 8

            # 7. Source arbitration boosts
            if any(k in q_clean for k in ["arbitration", "self-consumption", "peak shaving", "islanded", "grid-tied", "source"]):
                if doc.get("id") == "DOC-SOURCE-ARBITRATION":
                    score += 8

            # 8. IEEE 1547 boosts
            if any(k in q_clean for k in ["ieee", "1547", "interconnection", "grid standard", "anti-islanding", "frequency bound"]):
                if doc.get("id") == "DOC-IEEE-1547":
                    score += 10

            if score > 0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored_docs[:top_k]]


retriever = ProductionKnowledgeRetriever()
