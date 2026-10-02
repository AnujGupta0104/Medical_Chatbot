import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from pinecone import Pinecone

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# -----------------------------
# Load Embedding Model
# -----------------------------

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Embedding model loaded successfully")

# -----------------------------
# Connect to Pinecone
# -----------------------------

pc = Pinecone(
    api_key=os.environ["PINECONE_API_KEY"]
)

index = pc.Index("medical-chatbot")

print("Connected to Pinecone successfully")

# -----------------------------
# Connect to Groq
# -----------------------------

llm = ChatGroq(
    model=os.environ["GROQ_MODEL"],
    temperature=0,
    api_key=os.environ["GROQ_API_KEY"]
)

print("Groq model loaded successfully")


# -----------------------------
# Ask Medical Question
# -----------------------------

@app.route("/ask", methods=["POST"])
def ask_question():

    data = request.get_json()

    question = data.get("question", "").strip()

    if not question:
        return jsonify({
            "answer": "Please enter a medical question."
        })

    # Convert question into vector
    query_vector = embeddings.embed_query(question)

    # Search Pinecone
    results = index.query(
        vector=query_vector,
        top_k=5,
        include_metadata=True
    )

    # Get relevant information
    context = "\n\n".join(
        match["metadata"]["text"]
        for match in results["matches"]
    )

    # Create prompt
    prompt = f"""
You are a medical knowledge assistant.

Answer the user's question using ONLY the information
provided in the context below.

If the answer is not present in the context, say:

"I could not find this information in the medical knowledge base."

Give a clear and easy-to-understand answer.

Do not invent medical facts.

Context:
{context}

User question:
{question}

Answer:
"""

    # Ask Groq
    response = llm.invoke(prompt)

    return jsonify({
        "answer": response.content
    })


# -----------------------------
# Run Server
# -----------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))