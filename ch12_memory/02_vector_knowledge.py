# Long-term memory (semantic): a vector store of prior study reports
# Book reference: Chapter 12, §12.3 "Long-Term Memory"
# Repo notes:
#   - The ./xs_reports/fy2024/ archive ships in the repo's data directory;
#     the path below points there.
#   - ChromaDb requires the `chromadb` package (a project dependency).
#   - ChromaDb defaults to an OpenAI embedder; the GeminiEmbedder is
#     passed explicitly so the whole example runs on the one
#     GOOGLE_API_KEY the repo already needs.
#   - add_content is synchronous here; indexing runs once at build.
import os

from agno.agent import Agent
from agno.knowledge.embedder.google import GeminiEmbedder
from agno.knowledge.knowledge import Knowledge
from agno.models.google import Gemini
from agno.vectordb.chroma import ChromaDb

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

prior_study_archive = Knowledge(
    name="meridian_term_life_xs_archive",
    vector_db=ChromaDb(
        collection="term_life_india_xs",
        path="./xs_index",
        embedder=GeminiEmbedder(),      # embeddings via GOOGLE_API_KEY
    ),
)

# Index the FY2024 cycle reports once at build; query at runtime
prior_study_archive.add_content(path=os.path.join(DATA_DIR, "xs_reports", "fy2024"))

life_valuation_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    knowledge=prior_study_archive,
    tool_call_limit=10,
    markdown=True,
)

if __name__ == "__main__":
    life_valuation_agent.print_response(
        "What did the FY2024 experience studies say about smoker mortality "
        "on term life India, and what did they recommend?"
    )
