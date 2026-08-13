# Agentic AI for Actuaries — Companion Code

Runnable code for every listing in Parts III–V of *Agentic AI for
Actuaries: From AI Foundations to Autonomous Actuarial Systems* by
Satya Sai Mudigonda and Dr Rohan Yashraj Gupta (FIA, FIAI), published by
the Sri Sathya Sai Institute of Actuaries ([sssia.org](https://sssia.org)).

Parts I and II of the book deliberately contain no code — the reader's
first code block appears in Chapter 9, and that is where this repository
begins. Chapter 18 contains no code by design.

All datasets in `data/` are **synthetic**. Meridian Re is a fictional
composite reinsurer; no real company data, and no real mortality table,
appears anywhere in this repository. The IALM-style table is a
Gompertz-shaped synthetic with the same structure as IALM 2012-14 ULP,
sufficient for the examples to run — do not use it for real work.

## Run in Colab (no install)

Every chapter has a companion notebook in `notebooks/` that runs in
Google Colab with zero local setup — it clones this repository and
executes the chapter's scripts, so the code you run is exactly the
code here. Click the **Open in Colab** badge at the top of any chapter
README, add your Google AI Studio key as a Colab secret named
`GOOGLE_API_KEY` (🔑 sidebar), and run the cells top to bottom.

## Setup

You need [uv](https://docs.astral.sh/uv/getting-started/installation/)
and a Google AI Studio API key (free tier is sufficient for every
example; `gemini-3.1-flash-lite` is the cheapest model in the Gemini 3
series). uv installs a suitable Python (3.11+) automatically if none
is present.

```bash
# 1. Install uv (skip if you have it)
curl -LsSf https://astral.sh/uv/install.sh | sh   # Windows: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 2. Clone and enter the repository
git clone https://github.com/rohanyashraj/agentic-ai-for-actuaries-code.git
cd agentic-ai-for-actuaries-code

# 3. Install dependencies (creates .venv from pyproject.toml/uv.lock)
uv sync

# 4. Set your API key
cp .env.example .env              # then edit .env and paste your key
# Get a key at https://aistudio.google.com/apikey

# 5. Confirm the install
uv run python -c "import agno; print(agno.__version__)"

# 6. Run your first agent (Chapter 9)
cd ch09_agentic_foundations
uv run --env-file ../.env python 01_column_agent.py
```

`uv run` uses the project's `.venv` automatically — no manual
activation needed. The `--env-file` flag exports the keys in `.env`
to the script (the chapter scripts match the printed listings, which
read `GOOGLE_API_KEY` from the environment rather than loading `.env`
themselves). If you prefer, `export GOOGLE_API_KEY=your-key`
(Windows: `set GOOGLE_API_KEY=your-key`) and drop the flag, or set
`UV_ENV_FILE=.env` once per shell.

The book itself (Chapter 9, §9.5) sets the environment up with
`python -m venv` and `pip install -r requirements.txt`; that still
works — `requirements.txt` is kept in sync with `pyproject.toml` for
readers following the printed steps.

The synthetic datasets ship pre-generated in `data/`. To regenerate
them (deterministic, fixed seed — regeneration is byte-identical):

```bash
uv run python data/generate_data.py
```

## Model configuration

Every script constructs the model exactly as the book prints it:

```python
model = Gemini(id="gemini-3.1-flash-lite")
```

To run the examples against a different provider without editing each
script, use the factory in `common/config.py` — set `MODEL_PROVIDER`
and `MODEL_ID` in your `.env` and replace the inline construction with
`get_model()`. Anthropic Claude and OpenAI backends are wired in;
install the matching SDK with `uv sync --extra anthropic` or
`uv sync --extra openai`.

## Chapter map

| Folder | Book chapter | What runs |
|---|---|---|
| `ch09_agentic_foundations` | Ch 9 — Agentic AI foundations | First Agno agent; data quality agent case study |
| `ch10_tool_use` | Ch 10 — Tool design | Mortality lookup, PV tool with error handling, term life premium agent |
| `ch11_multi_agent_workflows` | Ch 11 — Multi-agent coordination | Three-step reserving review workflow (data quality → reserving → commentary) |
| `ch12_memory` | Ch 12 — Memory | SQLite-backed persistent memory; ChromaDB vector knowledge over experience study reports |
| `ch13_underwriting_agent` | Ch 13 — Underwriting | COPE extraction from a submission PDF, pricing reconciliation, three-agent workflow |
| `ch14_reserving_reflexion` | Ch 14 — Reserving | Cape Cod tool, reflexion workflow with reconciliation memory, movement commentary |
| `ch15_pension_pipeline` | Ch 15 — Pensions | UK DB funding valuation with sensitivity panel, member-data quality gate, annual statement drafting |
| `ch16_regulatory_capital` | Ch 16 — Regulatory & capital | Regulatory monitoring (offline synthetic feed), capital impact assessment, ORSA drafting |
| `ch17_governance_monitoring` | Ch 17 — Governance | Monitoring dashboard tool with threshold diagnostics |

Each chapter folder has its own README describing which script maps to
which printed listing, and precisely where the repo code deviates from
the printed code (and why).

## How the repo relates to the printed listings

- **Listings are verbatim where possible.** Comments, variable names,
  and structure match the book. Where the book says a helper comes from
  "the firm's library", the repo supplies a synthetic implementation in
  that chapter's `support.py` so the listing runs end to end.
- **Paths are adjusted** to point at the shared `data/` directory.
- **Runs are wrapped in `if __name__ == "__main__":`** where a listing
  ends with an agent run, so listings can also be imported as modules.
- **Agent output is rendered, not raw.** Every agent is constructed
  with `markdown=True`, and agent/workflow runs use `print_response()`
  (with `markdown=True` on workflow calls) instead of the
  `.run()` + `print(result.content)` some listings print — same loop,
  same result, better terminal rendering. Direct tool tests still
  print their structured dicts unchanged.
- **Agent narration will vary between runs.** Tool results are
  deterministic; the model's prose around them is not. The book says
  the same in Chapter 9.

## Errata noted while building this repository

These will be reconciled with the manuscript at copy-edit:

1. **Ch 11 model id** — the printed listing has a leading space:
   `Gemini(id=" gemini-3.1-flash-lite")`. Corrected here.
2. **Ch 12 / Ch 14 memory API** — the printed listings use
   `from agno.memory import Memory` and `Agent(memory=Memory(db=...))`.
   Later Agno 2.x releases removed that class; the current equivalent is
   `Agent(db=SqliteDb(...), enable_user_memories=True)`, which this repo
   uses (clearly commented in the affected scripts). This is exactly the
   re-test the book's version-pinning TECHNICAL NOTE anticipates.
3. **Ch 16 version pins** — the printed listing header pins
   `agno==1.0.6`, which conflicts with Chapter 14's TECHNICAL NOTE
   (`agno>=2.0,<3.0`). The repo follows the Chapter 14 pin.

## Cost note

Every example runs comfortably on the Gemini free tier. At paid rates,
`gemini-3.1-flash-lite` is priced at USD 0.25 per million input tokens
and USD 1.50 per million output tokens; a full pass through every
example in this repository costs a few cents.

## Licence

MIT — see `LICENSE`. The book text itself is © the authors and is not
covered by this licence.
