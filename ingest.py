import os
from dotenv import load_dotenv

load_dotenv()

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from pinecone import Pinecone


# -------------------------------
# 1. Find all PDFs in Resources
# -------------------------------

resources_folder = "Resources"

pdf_files = [
    os.path.join(resources_folder, file)
    for file in os.listdir(resources_folder)
    if file.lower().endswith(".pdf")
]

print("PDFs found:")

for pdf in pdf_files:
    print("-", pdf)


# -------------------------------
# 2. Load all PDFs
# -------------------------------

documents = []

for pdf in pdf_files:

    print(f"\nReading: {pdf}")

    loader = PyPDFLoader(pdf)

    docs = loader.load()

    documents.extend(docs)

    print(f"Loaded {len(docs)} pages from {pdf}")


print(f"\nTotal pages: {len(documents)}")


# -------------------------------
# 3. Split documents into chunks
# -------------------------------

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = text_splitter.split_documents(documents)

print(f"Total chunks: {len(chunks)}")


# -------------------------------
# 4. Load embedding model
# -------------------------------

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Embedding model loaded successfully")


# -------------------------------
# 5. Connect to Pinecone
# -------------------------------

pc = Pinecone(
    api_key=os.environ["PINECONE_API_KEY"]
)

index = pc.Index("medical-chatbot")

print("Connected to Pinecone successfully")


# -------------------------------
# 6. Create embeddings and upload
# -------------------------------

print("\nCreating embeddings and uploading chunks...")


for i in range(0, len(chunks), 100):

    batch = chunks[i:i + 100]

    texts = [
        doc.page_content
        for doc in batch
    ]

    vectors = embeddings.embed_documents(texts)

    records = []

    for j, vector in enumerate(vectors):

        document = batch[j]

        source = os.path.basename(
            document.metadata.get("source", "unknown.pdf")
        )

        page = document.metadata.get("page", 0)

        records.append({
            "id": f"{source}-page-{page}-chunk-{i+j}",
            "values": vector,
            "metadata": {
                "text": texts[j],
                "source": source,
                "page": page
            }
        })

    index.upsert(vectors=records)

    print(
        f"Uploaded {min(i + 100, len(chunks))}/{len(chunks)} chunks"
    )


print("\nAll chunks uploaded successfully!")