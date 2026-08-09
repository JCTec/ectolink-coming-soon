# Agent prompt — publish the ectolink coming-soon page and pause the main site

Copy everything below the line into a fresh Claude (Code / Cowork) session started in
`Dev/Mary Paz/ectolink-coming-soon`. Prerequisites: `gh` authenticated, and access to
the sibling folder `../ectolink-web` (the full site, source of design and icons).

---

You are pausing **ectolink.org** while its underlying research goes through journal
peer review, replacing it with a branded coming-soon page. The author asked for the
takedown; treat it as the priority. Nothing is deleted anywhere — the full site keeps
living in its repo, which simply goes private until publication.

## Context

- This repo (`ectolink-coming-soon`) holds ONE standalone page, deployed to GitHub
  Pages, that Cloudflare will redirect ectolink.org to.
- The full site is in `../ectolink-web`. Its `DESIGN.md` is the visual law and its
  latest `index.html` + `css/style.css` show the design as actually shipped — use
  BOTH as reference so the holding page is unmistakably the same product.
- The main repo goes PRIVATE (on the free plan that alone stops its GitHub Pages).

## 1. Build the single HTML page

One self-contained `index.html`, no external requests except the favicon files —
every style inline in a `<style>` block. Reference, do not invent:

- Design tokens from `../ectolink-web/DESIGN.md` §2 (bg #14141F, text #E8E8F0,
  muted #8A8A9E, accent #8B84E8) and its typography rules (§3): system sans stack,
  the `ecto`+`link` two-tone wordmark, muted prose.
- Copy the ICONS from the full site: `../ectolink-web/favicon.ico`,
  `apple-touch-icon.png`, `site.webmanifest`, and the `icons/` folder (favicon
  PNGs/SVG + `og-image.png`). Wire the same `<link rel>` tags the full site's
  index.html uses — open it and mirror that head block, including the Open Graph
  tags pointed at the copied og-image so shared links still look branded.
- Content: the wordmark, the one-line product question ("Which ectomycorrhizal
  fungi are likely on a tree's roots?"), and a two-sentence pause notice: the site
  returns when the research behind it is published. Optionally the dedication line
  to María de la Paz Mañé Duarte from the full site's dedication section — copy the
  wording, never rewrite it.
- `<meta name="robots" content="noindex">` — the placeholder must not compete with
  the real site's future ranking. Keep `.nojekyll`.
- Layout: centered, calm, generous space. No countdown, no email form, no links to
  the thesis or data (the pause exists to unpublish the findings until the journal
  is done).
- Comment the file generously — this project documents more than it codes.

## 2. Publish this repo

```
git add -A && git commit -m "feat: branded coming-soon page with ectolink icons"
gh repo create ectolink-coming-soon --public --source=. --remote=origin --push
gh api repos/<OWNER>/ectolink-coming-soon/pages -X POST -f 'source[branch]=main' -f 'source[path]=/'
```

Resolve `<OWNER>` with `gh api user -q .login`. If the repo or Pages already exist,
these calls error harmlessly — verify with `gh api repos/<OWNER>/ectolink-coming-soon/pages`
and move on. Confirm the page loads at `https://<OWNER>.github.io/ectolink-coming-soon/`.

## 3. Pause the main site

```
gh repo edit <OWNER>/ectolink-web --visibility private --accept-visibility-change-consequences
```

Then confirm the old Pages URL has stopped serving (curl it; give it a minute).

## 4. Point the domain — walk the user through Cloudflare

You cannot click the Cloudflare dashboard; give the user these exact steps and wait:

- Rules → Redirect Rules → Create: match hostname `ectolink.org` (and `www` if
  present), Dynamic redirect to `https://<OWNER>.github.io/ectolink-coming-soon/`,
  status **302** (temporary — tells search engines the original URLs will return).
- Caching → Purge Everything (cached copies of the full site must stop serving).
- Optional: Search Console → Removals → temporary removal for prefix `ectolink.org`.

## 5. Verify and record

- `curl -sIL https://ectolink.org` → a 302 to the coming-soon page, which returns
  200 with the branded HTML.
- Update this repo's README with the RELAUNCH CHECKLIST, dated: make ectolink-web
  public, re-run its deploy workflow, delete the redirect rule, cancel the Search
  Console removal, archive this repo. The next person to touch this project will be
  celebrating a publication — leave them a clean runway.
