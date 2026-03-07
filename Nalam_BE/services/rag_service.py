"""
RAG Service — pgvector PDF search for grounded responses.
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai
from db.connection import get_db

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


async def search_rag(query: str, top_k: int = 3) -> str:
    """
    Search PDF embeddings in pgvector for relevant medical context.
    Returns concatenated context string from top-k matches.
    """
    try:
        # Generate query embedding
        embedding_result = genai.embed_content(
            model="models/embedding-001",
            content=query,
        )
        query_embedding = embedding_result["embedding"]

        db = get_db()
        results = db.rpc(
            "match_embeddings",
            {
                "query_embedding": query_embedding,
                "match_count": top_k,
            },
        ).execute()

        if not results.data:
            return ""

        context = "\n\n".join(
            [f"[{r['source']}]: {r['chunk_text']}" for r in results.data]
        )
        return context
    except Exception as e:
        print(f"[RAG] Error searching embeddings: {e}")
        return ""
