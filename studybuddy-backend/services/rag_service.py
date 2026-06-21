"""RAG service - PDF processing and retrieval"""
from functools import lru_cache
from pathlib import Path

import fitz
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_community.vectorstores import FAISS

VECTORSTORE_DIR = Path("vectorstore")
FASTEMBED_CACHE_DIR = Path(".cache") / "fastembed"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
)


@lru_cache(maxsize=1)
def get_embeddings() -> FastEmbedEmbeddings:
    """Create embedding model once with a stable local cache directory."""
    FASTEMBED_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return FastEmbedEmbeddings(
        model_name=EMBEDDING_MODEL,
        cache_dir=str(FASTEMBED_CACHE_DIR),
    )


def extract_pdf_text(file_path: str) -> str:
    """Extract plain text from a PDF file."""
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def process_pdf(file_path: str, student_id: str) -> str:
    """Extract text from PDF, chunk, save FAISS index, return first 300 chars as summary."""
    text = extract_pdf_text(file_path)

    if not text.strip():
        return ""

    summary = text.strip()[:300]

    chunks = text_splitter.create_documents([text])
    if not chunks:
        return summary

    student_dir = VECTORSTORE_DIR / student_id
    student_dir.mkdir(parents=True, exist_ok=True)
    index_path = student_dir / "index.faiss"

    if index_path.exists():
        vectorstore = FAISS.load_local(
            str(student_dir), get_embeddings(), allow_dangerous_deserialization=True
        )
        vectorstore.add_documents(chunks)
    else:
        vectorstore = FAISS.from_documents(chunks, get_embeddings())

    vectorstore.save_local(str(student_dir))
    return summary


def rebuild_student_index(student_id: str, file_paths: list[str]) -> None:
    """Rebuild a student's FAISS index from remaining PDF files."""
    student_dir = VECTORSTORE_DIR / student_id
    student_dir.mkdir(parents=True, exist_ok=True)

    documents = []
    for raw_path in file_paths:
        file_path = Path(raw_path)
        if not file_path.exists():
            continue

        text = extract_pdf_text(str(file_path))
        if not text:
            continue

        documents.extend(text_splitter.create_documents([text]))

    index_file = student_dir / "index.faiss"
    pickle_file = student_dir / "index.pkl"

    if not documents:
        if index_file.exists():
            index_file.unlink()
        if pickle_file.exists():
            pickle_file.unlink()
        return

    vectorstore = FAISS.from_documents(documents, get_embeddings())
    vectorstore.save_local(str(student_dir))


def query_rag(question: str, student_id: str) -> str:
    """Load FAISS index, similarity search, return top 3 chunks joined. If no index, return empty string."""
    student_dir = VECTORSTORE_DIR / student_id
    index_path = student_dir / "index.faiss"

    if not index_path.exists():
        return ""

    vectorstore = FAISS.load_local(
        str(student_dir),
        get_embeddings(),
        allow_dangerous_deserialization=True,
    )
    docs = vectorstore.similarity_search(question, k=3)
    return "\n\n".join(d.page_content for d in docs)
