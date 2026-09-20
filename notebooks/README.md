# notebooks/ — Colab companions

One notebook per code chapter (`ch09.ipynb` … `ch17.ipynb`), each
designed to run in Google Colab with zero local setup. A notebook
clones this repository and executes that chapter's scripts directly,
so the code you run in Colab is exactly the code in the chapter
folders — nothing is copied or adapted.

To use one: open it via the **Open in Colab** badge at the top of the
matching chapter README (or upload it to Colab), add your Google AI
Studio key as a Colab secret named `GOOGLE_API_KEY` (🔑 sidebar), and
run the cells top to bottom.

Each notebook installs `common/notebook_display.py` right after
changing into the chapter folder. It routes `print_response` through
Colab's Markdown output, so agent answers render with headings,
tables and LaTeX (currency amounts stay as text) instead of raw
terminal markup. The scripts themselves are still run unmodified.

The website's "Open in Colab" links point at these notebooks too —
they are the unlimited-runs path when the site's shared run budget is
spent.
