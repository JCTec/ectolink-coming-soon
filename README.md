# ectolink-coming-soon

Temporary holding page for **ectolink.org**, served while the research behind the
site goes through journal peer review.

One self-contained `index.html` (every style inline, no external requests beyond
the icon files) deployed to GitHub Pages at
<https://jctec.github.io/ectolink-coming-soon/>. Cloudflare 302-redirects
ectolink.org here.

**Nothing has been deleted.** The complete site still lives in the `ectolink-web`
repository, which was made private — on the free plan that alone stops its
GitHub Pages deployment. The icons here (`favicon.ico`, `apple-touch-icon.png`,
`site.webmanifest`, `icons/`) are copies of that repo's generated icon set, so
the holding page and the real site share one identity.

## What was done — 9 August 2026

1. Built this page from `ectolink-web/DESIGN.md` (§2 tokens, §3 typography) and
   its shipped `index.html` / `css/style.css`.
2. Published this repo and enabled GitHub Pages on `main` / `/`.
3. Made `JCTec/ectolink-web` private, stopping <https://ectolink.org> at origin.
4. Cloudflare: redirect rule `ectolink.org` → this page, **302** (temporary — it
   tells search engines the original URLs are coming back), then Purge Everything.
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

- [ ] **2. Redeploy it**
      Re-run the deploy workflow in `ectolink-web` (Actions → latest workflow →
      *Re-run all jobs*), then confirm GitHub Pages is live and the custom domain
      `ectolink.org` is still set with HTTPS enforced:
      `gh api repos/JCTec/ectolink-web/pages`
      The repo's `CNAME` file still contains `ectolink.org`, so the domain should
      re-attach on its own — but check it, and check the DNS records still point
      at GitHub Pages.

- [ ] **3. Delete the Cloudflare redirect rule**
      Cloudflare dashboard → *Rules* → *Redirect Rules* → delete the
      `ectolink.org` → `jctec.github.io/ectolink-coming-soon` rule.
      Then *Caching* → *Purge Everything*, or visitors keep getting the
      redirect from the edge cache.

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
