# Agentic AI for Actuaries — Launch Site (static)

The complete launch site as a single static page — deployable on Vercel, Netlify, GitHub Pages, or any static host.

## Files
- `index.html` — the whole site (styles + interactivity inline)
- `assets/` — book cover photo, author photos, favicon

## Deploy on Vercel + custom domain

1. **Push to GitHub**
   ```bash
   cd this-folder
   git init && git add -A && git commit -m "Launch site"
   # create an empty repo on github.com first, then:
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. **Import into Vercel** — vercel.com → Add New → Project → pick the repo. Framework preset: **Other**; no build command; output directory: root. Deploy.
3. **Custom domain** — Project → Settings → Domains → add `aiforactuaries.sssia.org`. Vercel shows a CNAME record (`cname.vercel-dns.com`); add it in the DNS settings for sssia.org at your DNS provider. It goes live once DNS propagates.

## Notify-me form
The form posts to Formspree. Create a free form at formspree.io, then replace
`YOUR_FORM_ID` in `index.html` with your form id. Submissions (emails) appear
in your Formspree dashboard. Alternatively point the `fetch()` at your own API.
