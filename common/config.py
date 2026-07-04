# ── common/config.py ─────────────────────────────────────────────────
# Single point of model configuration for every example in this repo.
#
# The book's code blocks construct the model inline:
#     model=Gemini(id="gemini-3.1-flash-lite")
# The chapter scripts in this repository do exactly the same, so they
# match the printed listings line for line. This module exists for
# readers who want to swap providers WITHOUT editing every script:
# import get_model() and replace the inline construction.
#
# Environment variables (see .env.example at the repo root):
#   MODEL_PROVIDER   "google" (default) | "anthropic" | "openai"
#   MODEL_ID         defaults per provider, e.g. "gemini-3.1-flash-lite"
#   GOOGLE_API_KEY   required for the default Google Gemini provider

import os

from dotenv import load_dotenv

# Load the .env file at the repository root, if present.
load_dotenv()

DEFAULT_MODEL_IDS = {
    "google": "gemini-3.1-flash-lite",     # the book's default model
    "anthropic": "claude-sonnet-4-5",      # placeholder used pre-copy-edit
    "openai": "gpt-4o-mini",
}


def get_model():
    """Return an Agno model object per MODEL_PROVIDER / MODEL_ID env vars.

    Defaults to Google Gemini with id 'gemini-3.1-flash-lite', matching
    every code listing in the book.
    """
    provider = os.getenv("MODEL_PROVIDER", "google").lower()
    model_id = os.getenv("MODEL_ID", DEFAULT_MODEL_IDS.get(provider))

    if provider == "google":
        from agno.models.google import Gemini
        return Gemini(id=model_id)
    if provider == "anthropic":
        from agno.models.anthropic import Claude
        return Claude(id=model_id)
    if provider == "openai":
        from agno.models.openai import OpenAIChat
        return OpenAIChat(id=model_id)
    raise ValueError(f"Unknown MODEL_PROVIDER: {provider!r}")
