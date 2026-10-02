import os
from dotenv import load_dotenv

load_dotenv()

from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from pinecone import Pinecone

# Load embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Embedding model loaded successfully")

# Connect to Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

index = pc.Index("medical-chatbot")

print("Connected to Pinecone successfully")

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

print("Groq model loaded successfully")


# Ask a question
question = input("\nAsk your medical question: \n")

# Convert question into vector
query_vector = embeddings.embed_query(question)

# Search Pinecone
results = index.query(
    vector=query_vector,
    top_k=5,
    include_metadata=True
)

context = "\n\n".join(
    match["metadata"]["text"]
    for match in results["matches"]
)

prompt = f"""
You are a medical assistant.

Answer the user's question using ONLY the information provided in the context below\n.

If the answer is not present in the context, say:
"I could not find this information in the medical book.\n\n"

Context:
{context}

User question:
{question}

Answer:
"""

response = llm.invoke(prompt)

print("\nMedical Assistant:")
print(response.content)

# Display relevant information
# print("\nRelevant information:\n")

# for match in results["matches"]:
#     print(match["metadata"]["text"])
#     print("--------------------")