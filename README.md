# ectolink-coming-soon

Holding page for the **ectolink.org** domain, served while the research behind
the site goes through journal peer review.

One self-contained `index.html` (every style inline, no external requests beyond
the icon files) deployed to GitHub Pages at
<https://jctec.github.io/ectolink-coming-soon/>. Cloudflare 302-redirects
ectolink.org here.

The icons (`favicon.ico`, `apple-touch-icon.png`, `site.webmanifest`, `icons/`)
are copies of the full site's generated icon set, so the holding page and the
real site share one identity.

## What is where

| | URL | State |
|---|---|---|
| Holding page | <https://jctec.github.io/ectolink-coming-soon/> | Public. `noindex`. What ectolink.org shows. |
| Full site | <https://jctec.github.io/ectolink-web/> | **Public and fully working.** Search, predictions, all 69 tree pages. |
| Domain | <https://ectolink.org> | 302 → holding page, via a Cloudflare redirect rule. |

**This is a domain change, not an unpublishing.** The complete site — including
every prediction — stays publicly reachable to anyone with the github.io link.
Only the branded domain moved. That was a deliberate choice: it keeps relaunch
down to deleting one Cloudflare rule, and it means the author can still show the
work to collaborators and reviewers with a live link.

If the pause ever needs to be airtight — an embargo tightens, a journal asks —
the way to do that is `gh api repos/JCTec/ectolink-web/pages -X DELETE`. That
unpublishes the site for real without touching a single file; the repo and its
full history stay exactly as they are. Note that repo visibility is *not* the
lever: making `ectolink-web` private was tried on 9 August 2026 and its Pages
site kept serving regardless.

## Two things that were changed in `ectolink-web`

Both must be undone at relaunch; both are in the checklist below.

1. **`CNAME` was deleted** (commit `effbc78`). That file contained the single
   line `ectolink.org` and is what bound the domain to that Pages site. With it
   gone, the site answers at `jctec.github.io/ectolink-web` instead of 301-ing
   every visitor to the domain — which is what makes the arrangement above
   possible.
2. **The custom domain was detached from the Pages config** via the API
   (`cname: null`), so the setting matches the missing file.

Nothing else in that repo was touched. Its `index.html` still carries
`<link rel="canonical" href="https://ectolink.org/">`, which is correct and
deliberately left alone — see the note on search below.

## What was done — 9 August 2026

1. Built this page from `ectolink-web/DESIGN.md` (§2 tokens, §3 typography) and
   its shipped `index.html` / `css/style.css`.
2. Published this repo and enabled GitHub Pages on `main` / `/`.
3. Detached `ectolink.org` from `ectolink-web` (the two changes above), leaving
   that site public at its github.io address.
4. Cloudflare: redirect rule `ectolink.org` → this page, **302** (temporary — it
   tells search engines the original URLs are coming back), then Purge
   Everything. **This is the step that actually moves the domain.**
5. Optional: Google Search Console temporary removal for the `ectolink.org`
   prefix.

### About search engines

The holding page carries `<meta name="robots" content="noindex">`, so it never
accumulates search presence of its own and never competes with ectolink.org's
ranking once that returns.

The full site at `jctec.github.io/ectolink-web` is crawlable, but every page on
it declares its canonical URL as `https://ectolink.org/…`. Search engines
therefore treat the github.io copy as a duplicate of the domain rather than as a
page in its own right, and are unlikely to index it separately. That is the
desired outcome twice over: the ranking stays attached to ectolink.org, and the
paused content does not start surfacing in results under a new address. Leave
those canonical tags alone.

`.nojekyll` keeps GitHub Pages from running this repo's files through Jekyll.

---

## RELAUNCH CHECKLIST

**Run this the day the paper is published.** Work top to bottom. Whoever picks
this up is celebrating a publication — none of it should take more than an hour,
and most of that is waiting on a certificate.

- [ ] **1. Restore the `CNAME` file in `ectolink-web`**
      ```sh
      cd ectolink-web
      echo "ectolink.org" > CNAME
      git add CNAME && git commit -m "chore: reattach ectolink.org after publication"
      git push origin main
      ```
      The push triggers the deploy workflow, which republishes the site with the
      domain attached. Watch it with `gh run watch`.

- [ ] **2. Confirm the domain re-attached and wait for HTTPS**
      `gh api repos/JCTec/ectolink-web/pages` should show
      `"cname": "ectolink.org"` and, once the certificate is issued,
      `"https_certificate": {"state": "approved"}`. GitHub re-provisions the
      certificate automatically — usually well under an hour, occasionally up to
      24. Turn *Enforce HTTPS* back on in Settings → Pages if it is not already.
      Also confirm the DNS records still point at GitHub Pages.

- [ ] **3. Delete the Cloudflare redirect rule — this is the actual relaunch**
      Cloudflare dashboard → *Rules* → *Redirect Rules* → delete the
      `ectolink.org` → `jctec.github.io/ectolink-coming-soon` rule.
      Then *Caching* → *Purge Everything*, or visitors keep getting the redirect
      from the edge cache. The site is live again the moment this lands.

- [ ] **4. Verify**
      `curl -sIL https://ectolink.org` — expect a **200** from the full site with
      no redirect hop. Then load it in a browser, search a tree, and confirm
      predictions render.

- [ ] **5. Cancel the Search Console removal**
      Google Search Console → *Removals* → cancel the temporary removal for the
      `ectolink.org` prefix. Removals expire after ~6 months on their own, but
      cancelling brings the pages back within a day or so instead of waiting.
      Then submit `https://ectolink.org/sitemap.xml` for a fresh crawl.

- [ ] **6. Update the thesis link if the paper supersedes it**
      The dedication section in `ectolink-web/index.html` links to the UBC Open
      Collections thesis record. If the published article is the better citation,
      point it there — but keep the dedication wording itself unchanged.

- [ ] **7. Archive this repo**
      `gh repo archive JCTec/ectolink-coming-soon`
      Archiving, not deleting: it is the record of how the pause was done, and it
      is the thing to un-archive if the site ever needs to be paused again.
