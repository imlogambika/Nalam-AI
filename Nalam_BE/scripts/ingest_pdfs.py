"""
PDF Ingestion Script — Index medical PDFs into pgvector for RAG.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

import google.generativeai as genai
from db.connection import get_db

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

BOOKS = [
    {"file": "gale_encyclopedia.pdf", "source": "Gale Encyclopedia A-Z Health"},
    {"file": "mental_health_enc.pdf", "source": "Mental Health Encyclopedia"},
    {"file": "mental_health_records.pdf", "source": "Mental Health Records Book"},
]

PDF_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pdfs")


def chunk_text(text: str, chunk_size: int = 500) -> list:
    """Split text into chunks of approximately chunk_size words."""
    words = text.split()
    return [" ".join(words[i : i + chunk_size]) for i in range(0, len(words), chunk_size)]


def extract_pdf_text(filepath: str) -> str:
    """Extract text from a PDF file."""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def ingest_all():
    """Ingest all PDFs into pgvector embeddings table."""
    db = get_db()

    for book in BOOKS:
        filepath = os.path.join(PDF_DIR, book["file"])
        if not os.path.exists(filepath):
            print(f"⚠ File not found: {filepath} — skipping")
            continue

        print(f"📖 Processing: {book['source']}...")
        text = extract_pdf_text(filepath)
        if not text:
            print(f"  ⚠ No text extracted from {book['file']}")
            continue

        chunks = chunk_text(text)
        print(f"  📝 {len(chunks)} chunks created")

        for i, chunk in enumerate(chunks):
            try:
                embedding_result = genai.embed_content(
                    model="models/embedding-001",
                    content=chunk,
                )
                embedding = embedding_result["embedding"]

                db.table("pdf_embeddings").insert({
                    "source": book["source"],
                    "chunk_text": chunk,
                    "embedding": embedding,
                    "page_num": i,
                }).execute()

                if (i + 1) % 10 == 0:
                    print(f"  ✅ {i + 1}/{len(chunks)} chunks ingested")
            except Exception as e:
                print(f"  ❌ Error on chunk {i}: {e}")

        print(f"✅ Ingested: {book['source']} — {len(chunks)} chunks")

    print("\n🎉 All PDFs ingested successfully!")


if __name__ == "__main__":
    ingest_all()
