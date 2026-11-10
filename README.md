# Personal website

Personal site of Eeshan Gupta, an AI Engineer. It is a static site in plain HTML, CSS and a little JavaScript, with no build step.

## Pages

- `/` is an introduction: a hero with a point-of-view line, the latest writing, project stories, open questions, how to get in touch, and an "Outside the day job" section.
- `/about/` holds the resume content: an impact strip, the experience timeline, selected projects and the toolkit.
- `/writing/` lists the articles. `/writing/graphrag-vs-tuned-hybrid/` is the first one, with a Markdown copy next to it.

The header links to About, Collaborate (the "Outside the day job" section on the home page) and Writing. Below 720px the links move into a native `<details>` menu. A theme toggle switches between light and dark and remembers the choice.

## Project structure

```text
.
├── index.html            # Home
├── about/index.html      # About
├── writing/              # Writing index and articles
├── styles.css            # Theme tokens, layout and components
├── script.js             # Scroll reveals and closing the phone menu after a jump
├── fonts/                # Local web fonts (Inter, Space Grotesk, JetBrains Mono)
├── scripts/
│   ├── check-slots.sh    # Fails while unfilled slots remain
│   └── make-md.py        # Regenerates the article's Markdown copy
├── feed.xml              # RSS feed
├── sitemap.xml
├── robots.txt
├── llms.txt
└── CNAME                 # Custom domain for GitHub Pages
```

The theme choice is saved by a small inline script in the head of each page, which also sets the theme before the page paints.

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
