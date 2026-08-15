# Agentic AI for Actuaries — Companion Code

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![Agno 2.x](https://img.shields.io/badge/agno-2.x-orange.svg)](https://docs.agno.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](notebooks/README.md)

Runnable code for every listing in Parts III–V of *Agentic AI for
Actuaries: From AI Foundations to Autonomous Actuarial Systems* by
Satya Sai Mudigonda and Dr Rohan Yashraj Gupta (FIA, FIAI), published by
the Sri Sathya Sai Institute of Actuaries ([sssia.org](https://sssia.org)).

The examples build actuarial agents with the [Agno](https://docs.agno.com)
framework on Google Gemini: tool-using premium calculators, multi-agent
reserving workflows, memory-backed underwriting assistants, pension
valuation pipelines, and governance monitors.

Parts I and II of the book deliberately contain no code — the reader's
first code block appears in Chapter 9, and that is where this repository
begins. Chapter 18 contains no code by design.

> **All datasets in `data/` are synthetic.** Meridian Re is a fictional
> composite reinsurer; no real company data, and no real mortality
> table, appears anywhere in this repository. The IALM-style table is a
> Gompertz-shaped synthetic with the same structure as IALM 2012-14 ULP,
> sufficient for the examples to run — do not use it for real work.

## Table of contents

- [Three ways to run the code](#three-ways-to-run-the-code)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Detailed setup](#detailed-setup)
  - [Option A — uv (recommended)](#option-a--uv-recommended)
  - [Option B — venv + pip (as printed in the book)](#option-b--venv--pip-as-printed-in-the-book)
  - [Verify the installation](#verify-the-installation)
  - [Regenerating the datasets](#regenerating-the-datasets)
- [Configuration](#configuration)
- [Running the examples](#running-the-examples)
- [Repository structure](#repository-structure)
- [Website and backend development](#website-and-backend-development)
- [Troubleshooting](#troubleshooting)
- [How the repo relates to the printed listings](#how-the-repo-relates-to-the-printed-listings)
- [Errata noted while building this repository](#errata-noted-while-building-this-repository)
- [Cost note](#cost-note)
- [Contributing](#contributing)
- [Licence](#licence)

## Three ways to run the code

| | Where | Install needed | Best for |
|---|---|---|---|
| **Website** | The book's site, built from [`web/`](web/README.md) | None | Trying tool scripts in the browser (Python in WebAssembly) and watching agent runs streamed live |
| **Colab** | One notebook per chapter in [`notebooks/`](notebooks/README.md) | None — just a Google account and an API key | Running every chapter top-to-bottom with zero local setup |
| **Local** | This repository | uv (or venv + pip) and an API key | Following along with the book, editing and extending the examples |

On the website, the browser copies are generated from the chapter
scripts at build time by `scripts/build_demos.py`, so they can never
drift from the code here. In Colab, each notebook clones this
repository and executes the chapter's scripts, so the code you run is
exactly the code here — click the **Open in Colab** badge at the top of
any chapter README, add your key as a Colab secret named
`GOOGLE_API_KEY` (🔑 sidebar), and run the cells top to bottom.

The rest of this README covers the local setup.

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| [uv](https://docs.astral.sh/uv/getting-started/installation/) | any recent | Installs a suitable Python automatically if none is present. (Alternatively: Python + pip, see [Option B](#option-b--venv--pip-as-printed-in-the-book).) |
| Python | 3.11+ | Only needed if you skip uv |
| Google AI Studio API key | — | Free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey); the free tier is sufficient for every example |
| Node.js | 20+ | **Only** for developing the website in `web/` — not needed for the book's code |

The default model is `gemini-3.1-flash-lite`, the cheapest model in the
Gemini 3 series. Anthropic Claude and OpenAI are supported as
alternative providers (see [Configuration](#configuration)).

## Quick start

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

# 5. Run your first agent (Chapter 9)
cd ch09_agentic_foundations
uv run --env-file ../.env python 01_column_agent.py
```

## Detailed setup

### Option A — uv (recommended)

The repository is managed with [uv](https://docs.astral.sh/uv/):
`pyproject.toml` declares the dependencies and `uv.lock` pins the
exact tested versions, so `uv sync` reproduces the same environment
on every machine.

1. **Install uv.**

   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

   On Windows (PowerShell):

   ```bash
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. **Clone the repository and install dependencies.**

   ```bash
   git clone https://github.com/rohanyashraj/agentic-ai-for-actuaries-code.git
   cd agentic-ai-for-actuaries-code
   uv sync
   ```

   This creates `.venv/` with every pinned dependency. uv downloads a
   suitable Python (3.11+) automatically if none is installed.

3. **Configure your API key.**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and paste the key from
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey):

   ```
   GOOGLE_API_KEY=your-key-here
   ```

4. **Run scripts with `uv run`.** It uses the project's `.venv`
   automatically — no manual activation needed:

   ```bash
   cd ch09_agentic_foundations
   uv run --env-file ../.env python 01_column_agent.py
   ```

   The `--env-file` flag exports the keys in `.env` to the script (the
   chapter scripts match the printed listings, which read
   `GOOGLE_API_KEY` from the environment rather than loading `.env`
   themselves). If you prefer, export the key once per shell and drop
   the flag:

   ```bash
   export GOOGLE_API_KEY=your-key   # Windows: set GOOGLE_API_KEY=your-key
   ```

   or set `UV_ENV_FILE=.env` once per shell.

### Option B — venv + pip (as printed in the book)

The book itself (Chapter 9, §9.5) sets the environment up with the
standard-library tooling; that still works — `requirements.txt` is kept
in sync with `pyproject.toml` for readers following the printed steps.

```bash
git clone https://github.com/rohanyashraj/agentic-ai-for-actuaries-code.git
cd agentic-ai-for-actuaries-code

python -m venv .venv
source .venv/bin/activate         # Windows: .venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env              # then edit .env and paste your key
export GOOGLE_API_KEY=your-key    # Windows: set GOOGLE_API_KEY=your-key

cd ch09_agentic_foundations
python 01_column_agent.py
```

### Verify the installation

```bash
uv run python -c "import agno; print('agno OK')"
uv run python -c "import pandas, pypdf, chromadb, sqlalchemy; print('deps OK')"
```

(With Option B, activate the venv and drop the `uv run` prefix.)

### Regenerating the datasets

The synthetic datasets ship pre-generated in `data/`. To regenerate
them (deterministic, fixed seed — regeneration is byte-identical):

```bash
uv run python data/generate_data.py
```

## Configuration

All configuration is via environment variables, loaded from `.env` at
the repository root (see `.env.example`):

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `GOOGLE_API_KEY` | Yes (default provider) | — | Google AI Studio key used by every example |
| `MODEL_PROVIDER` | No | `google` | `google`, `anthropic`, or `openai` — used by `common/config.py` |
| `MODEL_ID` | No | `gemini-3.1-flash-lite` | Model id for the chosen provider |
| `ANTHROPIC_API_KEY` | Only if `MODEL_PROVIDER=anthropic` | — | Anthropic key |
| `OPENAI_API_KEY` | Only if `MODEL_PROVIDER=openai` | — | OpenAI key |

Every script constructs the model exactly as the book prints it:

```python
model = Gemini(id="gemini-3.1-flash-lite")
```

To run the examples against a different provider without editing each
script, use the factory in `common/config.py` — set `MODEL_PROVIDER`
and `MODEL_ID` in your `.env` and replace the inline construction with
`get_model()`. Anthropic Claude and OpenAI backends are wired in;
install the matching SDK with:

```bash
uv sync --extra anthropic   # or: --extra openai
```

The website/backend have additional deployment variables (rate limits,
Upstash Redis); those are documented in [`web/README.md`](web/README.md).

## Running the examples

Run any chapter script from its folder:

```bash
cd ch10_tool_use
uv run --env-file ../.env python 03_term_life_premium_agent.py
```

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

## Repository structure

The repository has four kinds of content. If you are here for the
book's code, the chapter folders are all you need; everything else
supports the website and tooling.

| Path | What it is |
|---|---|
| `ch09_…` to `ch17_…` | **The book's code**, one folder per chapter, matching the printed listings. Each has its own README. |
| `common/`, `data/` | Shared model-config helper and the synthetic datasets the chapters use. |
| `notebooks/` | Colab notebook per chapter — run everything with zero install ([README](notebooks/README.md)). |
| `web/` | The book's website: Next.js app with in-browser and live agent runs ([README](web/README.md)). |
| `server/` | FastAPI backend the website uses to run agent scripts live ([README](server/README.md)). |
| `scripts/` | Build tooling, including the codegen that keeps website demos in sync with chapter code ([README](scripts/README.md)). |

## Website and backend development

Only needed if you are working on the book's site — the chapter code
never touches it.

```bash
cd web
npm install
npm run dev:all     # frontend (Next.js) + backend (FastAPI) together
```

Open http://localhost:3000. The backend needs `GOOGLE_API_KEY` in the
repo-root `.env` for live agent runs; the in-browser demos work without
it. Deployment (Vercel) and the backend's security model are documented
in [`web/README.md`](web/README.md) and [`server/README.md`](server/README.md).

## Troubleshooting

- **`GOOGLE_API_KEY` not set / authentication errors** — the chapter
  scripts read the key from the environment. Run with
  `uv run --env-file ../.env python <script>.py`, or export the key in
  your shell. Confirm the key works at
  [aistudio.google.com](https://aistudio.google.com).
- **`429` / rate-limit responses** — the free tier throttles per
  minute. Wait a minute and re-run; every example fits comfortably
  within free-tier daily quotas.
- **`ModuleNotFoundError: agno` (Option B)** — the venv isn't active.
  `source .venv/bin/activate` (Windows: `.venv\Scripts\activate`) and
  re-run, or switch to `uv run`.
- **Agent narration differs between runs** — expected. Tool results are
  deterministic; the model's prose around them is not. The book says
  the same in Chapter 9.
- **State files accumulate** (e.g. `*.db` from ch12/ch14) — safe to
  delete; scripts recreate them on the next run.

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
  deterministic; the model's prose around them is not.

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

## Contributing

Issues and pull requests are welcome — especially corrections that keep
the repository faithful to the printed listings. Please note in your PR
which chapter/listing a change affects. For anything that would make
the code deviate from the book, open an issue first so it can be
recorded alongside the errata above.

## Licence

MIT — see [`LICENSE`](LICENSE). The book text itself is © the authors
and is not covered by this licence.
