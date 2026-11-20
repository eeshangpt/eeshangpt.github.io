# Personal website

Personal site of Eeshan Gupta, an AI Engineer. It is a static site in plain HTML, CSS and a little JavaScript, with no build step.

## Pages

- `/` is the landing page for people who might hire me: who it is for, the questions I help answer, the two offers, results from past projects, how I check my own claims, about, and how to start.
- `/work/` is "Work with me": both offers in full and how an engagement runs.
- `/case-studies/graphrag/` tells the GraphRAG experiment as a case study, with the method and limits lower down.
- `/writing/` lists the articles. `/writing/graphrag-vs-tuned-hybrid/` and `/writing/small-judge-fresh-data/` are the articles, each with a Markdown copy next to it.
- `/about/` is a 301 redirect (in `_redirects`) to the home page, which scrolls to About (`/#about`); old links to `/about/#experience`, `#projects` and `#skills` land on `/#background`.

The header links to the home page, Work with me, What I do, Results, Case study and About, and wraps to two rows on phones. Colours follow the system light or dark setting.

## Project structure

```text
.
├── index.html            # Home
├── work/index.html       # Work with me
├── case-studies/graphrag/index.html  # Case study
├── _headers, _redirects # Cloudflare Pages response headers (CSP) and the /about/ redirect
├── writing/              # Writing index and articles
├── styles.css            # Theme tokens, shared rules and article styles (page markup carries inline styles)
├── script.js             # Stories button, case-study set toggle, opening the stories on #stories/#results
├── fonts/                # Self-hosted Newsreader and IBM Plex (latin woff2, SIL OFL licences beside them); the earlier Inter, Space Grotesk and JetBrains Mono files are no longer linked
├── scripts/
│   ├── check-slots.sh    # Fails while unfilled slots remain
│   └── make-md.py        # Regenerates the article's Markdown copy
├── feed.xml              # RSS feed
├── sitemap.xml
├── robots.txt
├── llms.txt
└── CNAME                 # Custom domain for GitHub Pages
```

`script.js` loads in the head of each page and adds a `js` class before the page paints, so the phone stories collapse and the case-study toggle only apply when JavaScript runs. Without JavaScript every card and both question sets are shown. There are no inline scripts, so the Content-Security-Policy in `_headers` needs no script hashes.

## Run it locally

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Pages use root-relative links, so serve from the repository root.

## Unfilled slots

Draft text that still needs writing is a highlighted box that starts with a bracketed YOUR DETAIL label, and client wording that needs a check starts with a bracketed CHECK label. Before publishing, run this from the repository root:

```sh
sh scripts/check-slots.sh
```

It prints every line that still holds a slot and exits 1, or prints `OK` and exits 0 when none are left.

## Updating the article copy

After the article text changes, regenerate the Markdown copy:

```sh
python3 scripts/make-md.py
```

## Adding pages

List a new page in `sitemap.xml` and `llms.txt`, and add a new article to `feed.xml`.
