"""
GridFlowX RAG Context Builder
=============================
Assembles retrieved knowledge passages into structured prompt context blocks.
"""

from typing import List, Dict, Any


class ContextBuilder:
    @staticmethod
    def build_context_block(docs: List[Dict[str, Any]]) -> str:
        if not docs:
            return ""
        blocks = []
        for i, doc in enumerate(docs, 1):
            blocks.append(f"[{i}] {doc['title']} ({doc['category']}):\n{doc['content']}")
        return "\n\n".join(blocks)


context_builder = ContextBuilder()
