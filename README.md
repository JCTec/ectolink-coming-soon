# ectolink-coming-soon

Temporary holding page for **ectolink.org**, served while the research behind the
site goes through journal peer review.

One self-contained `index.html` (every style inline, no external requests beyond
the icon files) deployed to GitHub Pages at
<https://jctec.github.io/ectolink-coming-soon/>. Cloudflare 302-redirects
ectolink.org here.

**Nothing has been deleted.** The complete site still lives in the `ectolink-web`
repository, which was made private. The icons here (`favicon.ico`,
`apple-touch-icon.png`, `site.webmanifest`, `icons/`) are copies of that repo's
generated icon set, so the holding page and the real site share one identity.

### Important: the Cloudflare rule is the only thing pausing the site

Making `ectolink-web` private did **not** unpublish its GitHub Pages site —
verified on 9 August 2026, the origin kept returning the full site with a 200
for as long as it was watched. GitHub Pages has no private-but-viewable mode
outside Enterprise Cloud, so the Pages deployment was left published on purpose
and the **Cloudflare redirect rule is what actually pauses the site**. Delete
that rule and ectolink.org is live again the moment the edge cache clears.

Two consequences worth knowing:

- The full site is still being served by GitHub at origin. It is unreachable
  through the front door (ectolink.org is intercepted at Cloudflare's edge, and
  `jctec.github.io/ectolink-web` 301s to ectolink.org and so gets intercepted
  too), but anyone bypassing Cloudflare could still reach it. This was a
  deliberate, informed trade for a one-click relaunch.
- If the pause ever needs to be airtight — a reviewer asks, or the embargo
  tightens — run `gh api repos/JCTec/ectolink-web/pages -X DELETE`. That
  unpublishes it for real and touches no files. The cost is that relaunch then
  needs Pages re-enabled and the HTTPS certificate re-issued for the custom
  domain (usually under an hour, occasionally up to 24).

To view the full site while it is paused, run it locally — there is no URL that
shows it only to you:

```sh
cd ../ectolink-web && python3 -m http.server 8000   # then open localhost:8000
```

## What was done — 9 August 2026

1. Built this page from `ectolink-web/DESIGN.md` (§2 tokens, §3 typography) and
   its shipped `index.html` / `css/style.css`.
2. Published this repo and enabled GitHub Pages on `main` / `/`.
3. Made `JCTec/ectolink-web` private. Its Pages site stayed published — see the
   note above; this step hides the source, not the site.
4. Cloudflare: redirect rule `ectolink.org` → this page, **302** (temporary — it
   tells search engines the original URLs are coming back), then Purge Everything.
   **This is the step that actually pauses the site.**
5. Optional: Google Search Console temporary removal for the `ectolink.org` prefix.

The page carries `<meta name="robots" content="noindex">` so it never competes
with the real site's future ranking. `.nojekyll` keeps GitHub Pages from running
the files through Jekyll.

---

## RELAUNCH CHECKLIST

**Run this the day the paper is published.** Work top to bottom; each step
assumes the one above it is done. Whoever picks this up is celebrating a
publication — none of it should take more than an hour.

- [ ] **1. Make the site public again**
      `gh repo edit JCTec/ectolink-web --visibility public --accept-visibility-change-consequences`

- [ ] **2. Redeploy it — probably a no-op**
      The Pages deployment was never taken down, so the site should already be
      sitting there ready. Confirm it: `gh api repos/JCTec/ectolink-web/pages`
      should show `"cname": "ectolink.org"` and `"https_enforced": true`. Only if
      something looks wrong, re-run the deploy workflow (Actions → latest
      workflow → *Re-run all jobs*). The repo's `CNAME` file still contains
      `ectolink.org`, so the domain stays attached on its own.

- [ ] **3. Delete the Cloudflare redirect rule — this is the actual relaunch**
      Cloudflare dashboard → *Rules* → *Redirect Rules* → delete the
      `ectolink.org` → `jctec.github.io/ectolink-coming-soon` rule.
      Then *Caching* → *Purge Everything*, or visitors keep getting the
      redirect from the edge cache. The full site is live again the moment this
      lands — everything else on this list is cleanup around it.

- [ ] **4. Verify the real site is back**
      `curl -sIL https://ectolink.org` — expect a **200** from the full site with
      no redirect hop, and load it in a browser to confirm predictions render.

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
