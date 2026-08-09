# ectolink-coming-soon

Holding page for the **ectolink.org** domain, served while the research behind
the site goes through journal peer review.

One self-contained `index.html` (every style inline, no external requests beyond
the icon files), deployed to GitHub Pages with **`ectolink.org` bound to it as a
custom domain**. Visitors stay on ectolink.org and get a 200 — no redirect, no
github.io address in the URL bar. `404.html` is a copy of the same page, so old
deep links like `/tree/quercus-garryana.html` land somewhere branded instead of
on GitHub's stock 404.

The icons (`favicon.ico`, `apple-touch-icon.png`, `site.webmanifest`, `icons/`)
are copies of the full site's generated icon set, so the holding page and the
real site share one identity.

## What is where

| | URL | State |
|---|---|---|
| Holding page | <https://ectolink.org> | **What the domain serves.** 200, indexable, canonical to itself. |
| ↳ github.io | <https://jctec.github.io/ectolink-coming-soon/> | 301 → ectolink.org. GitHub does this automatically once a `CNAME` file exists, so there is no second copy to compete with the domain. |
| Full site | — | **Unpublished.** Its GitHub Pages site was deleted on 9 August 2026; no URL serves it. |

`www.ectolink.org` 301s to the apex — GitHub Pages does that itself, and the
issued certificate covers both names.

**The full site is unpublished.** Its Pages deployment was deleted, so nothing
serves it — not the domain, not a github.io address. `gh api
repos/JCTec/ectolink-web/pages` returns 404. This is the airtight version of the
pause: while the research is under review, the predictions are not on the web.

**Not a single file was deleted.** The complete site — every page, every
prediction, the full git history — is exactly as it was in the `ectolink-web`
repo. Publishing it again is one API call plus a workflow run (checklist below).

To look at it while it is paused, run it locally; there is no URL that shows it
only to you:

```sh
cd ../ectolink-web && python3 -m http.server 8000   # then open localhost:8000
```

**One thing this does NOT hide:** `ectolink-web` is still a *public repository*,
so its source — including `data/predictions.min.json` — is readable on
github.com and can be found by search. If the intent is that the findings are not
publicly available at all, the repo also needs to go private:

```sh
gh repo edit JCTec/ectolink-web --visibility private --accept-visibility-change-consequences
```

### Why there is no `noindex`, and why that is deliberate

The holding page carried `<meta name="robots" content="noindex">` for the first
few hours of the pause, while it was reached by a Cloudflare 302 and therefore
lived at a *second* address. That was right at the time: a placeholder at its own
URL should not build search presence competing with the domain it stands in for.

Once the page became ectolink.org, the reasoning inverted — a `noindex` would
apply to the domain itself and Google would drop ectolink.org outright, so the
site would return after publication with its search presence rebuilt from zero.
It was removed and replaced with `<link rel="canonical" href="https://ectolink.org/">`.
**Do not re-add it** while the domain is bound to this page.

`404.html` deliberately has no canonical (it is not the homepage) and its
responses really are 404s. Those deep pages are not being served right now —
that is the point of the pause — so search engines dropping them is the desired
outcome. The homepage alone stays indexed, holding the domain's presence until
the full site returns and its sitemap brings the rest back.

Note that repo visibility is *not* the lever for unpublishing: making
`ectolink-web` private was tried first on 9 August 2026 and its Pages site kept
serving regardless. Deleting the Pages deployment is what actually stops it.

Expect a lag of up to ten minutes after the delete. GitHub Pages is fronted by
Fastly with `cache-control: max-age=600`, so already-cached HTML keeps returning
200 until the TTL expires — observed on 9 August, the root page served from cache
for a further ~4 minutes after the API had begun 404-ing everything uncached.

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
3. Detached `ectolink.org` from `ectolink-web` (the two changes above).
4. Bound `ectolink.org` to **this** repo's Pages site — `CNAME` file plus the
   Pages custom-domain setting. **This is the step that moves the domain.**
5. Dropped the `noindex`, added the canonical, added `404.html`.
6. **Deleted `ectolink-web`'s Pages deployment** (`gh api
   repos/JCTec/ectolink-web/pages -X DELETE`), unpublishing the full site
   entirely. For a few hours before this it was public at
   `jctec.github.io/ectolink-web`; that address now 404s.
7. Optional: Google Search Console temporary removal for the `ectolink.org`
   prefix.

### The Cloudflare detour, and why nothing is left of it

For the first few hours the domain was moved with a **Cloudflare redirect rule**
instead — a 302 from `ectolink.org` to `jctec.github.io/ectolink-coming-soon`. It
worked, but it put an unbranded github.io address in the URL bar of a page whose
entire job is to look like the product, so it was replaced with the custom-domain
binding above.

**That rule has been deleted and the cache purged.** The
`http_request_dynamic_redirect` phase on zone `134c96478ead8fb99f57d07c53296dcf`
is now empty. Nothing needs cleaning up at relaunch, and the zone's one other
rule — a cache rule from 8 August — was never touched. To confirm the phase is
still empty:

```sh
Z=134c96478ead8fb99f57d07c53296dcf
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$Z/rulesets/phases/http_request_dynamic_redirect/entrypoint"
```

**One Cloudflare change does survive, and should stay.** `www.ectolink.org`
(CNAME → `jctec.github.io`) was grey-cloud/unproxied, so traffic to it bypassed
Cloudflare entirely. It is now **proxied** (orange cloud), matching the apex
records. Leave it that way — GitHub Pages runs fine behind the proxy, which is
how the site was served before the pause.

Token notes for whoever comes next: it is **account-owned**, so it is managed
under Manage Account → API Tokens, not My Profile. It needs **Zone → Dynamic
Redirect → Edit** for redirect rules, **Zone → Cache Purge → Purge**, **Zone →
DNS → Edit** for the proxy flip, and **Zone → Zone Settings → Edit** for SSL
mode. The Page Rules API rejects account-owned tokens outright (`1011`), and
`/user/tokens/verify` fails for them too — neither is a sign of a bad token.

### About search engines

The domain serves an indexable page canonical to itself. There is no competing
copy: once a `CNAME` file exists, GitHub 301s `jctec.github.io/ectolink-coming-soon`
to the custom domain, so that address never serves the page at all.

The full site is not crawlable, because it is not served. While it briefly was,
at `jctec.github.io/ectolink-web`, it had **no** meaningful protection: its
`robots.txt` was ineffective at that address (crawlers only honour `robots.txt`
at a host root — `jctec.github.io/robots.txt` does not exist), and its canonical
tags pointed at `ectolink.org`, which by then served different content, making
them a hint Google routinely ignores. Worth remembering if that URL is ever
brought back during a future pause: **serving the full site at a project-pages
path offers no protection from search at all.**

`.nojekyll` keeps GitHub Pages from running this repo's files through Jekyll.

---

## RELAUNCH CHECKLIST

**Run this the day the paper is published.** Order matters in one place: GitHub
will not let two Pages sites claim `ectolink.org` at once, so this repo has to
let go of the domain before `ectolink-web` can take it. Steps 1 and 2 are the
handover and should run back to back — the domain is down in between.

- [ ] **1. Release the domain from this repo**
      ```sh
      cd ectolink-coming-soon
      git rm CNAME && git commit -m "chore: release ectolink.org back to the full site"
      git push origin main
      gh api repos/JCTec/ectolink-coming-soon/pages -X PUT --input - <<< '{"cname":null}'
      ```

- [ ] **2. Re-enable Pages on `ectolink-web` and give it the domain**
      The Pages deployment was **deleted** during the pause, so this is not just
      a redeploy — the site has to be published again from scratch.
      ```sh
      cd ../ectolink-web
      echo "ectolink.org" > CNAME
      git add CNAME && git commit -m "chore: reattach ectolink.org after publication"
      git push origin main

      # Republish. The repo deploys from a workflow, so build_type must say so —
      # omit this and Pages reverts to serving the branch root directly.
      gh api repos/JCTec/ectolink-web/pages -X POST -f build_type=workflow
      gh api repos/JCTec/ectolink-web/pages -X PUT --input - <<< '{"cname":"ectolink.org"}'
      ```
      If the repo was also made private during the pause, make it public first —
      `gh repo edit JCTec/ectolink-web --visibility public --accept-visibility-change-consequences`.
      Then re-run the deploy workflow (`gh workflow run` or Actions → *Re-run all
      jobs*) and watch it with `gh run watch`.

- [ ] **3. Confirm the domain re-attached and HTTPS is healthy**
      `gh api repos/JCTec/ectolink-web/pages` should show `"cname": "ectolink.org"`
      and `"https_certificate": {"state": "approved"}`. When the domain moved
      *to* the holding page on 9 August the certificate came back approved
      immediately — GitHub had already validated both names and kept the
      certificate (`ectolink.org`, `www.ectolink.org`, expiring 2026-11-06), so
      there was no HTTPS gap at all. It may not be so quick this time: the Pages
      site was deleted, so the certificate may have to be issued afresh. Allow up
      to 24 hours, and keep Cloudflare's SSL mode on **Full (strict)** — it is
      what the zone uses. If the domain throws **526** in the meantime, that is
      the certificate not being ready; it clears on its own. Confirm the origin
      directly rather than guessing:
      `curl -sI https://ectolink.org/ --resolve ectolink.org:443:185.199.108.153`
      Turn *Enforce HTTPS* back on in Settings → Pages if it is not already.

- [ ] **4. Purge Cloudflare's cache**
      Otherwise the edge keeps handing out the holding page.
      ```sh
      Z=134c96478ead8fb99f57d07c53296dcf
      curl -s -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" --data '{"purge_everything":true}' \
        "https://api.cloudflare.com/client/v4/zones/$Z/purge_cache"
      ```
      There is no redirect rule to delete — see the Cloudflare note above.

- [ ] **5. Verify**
      `curl -sIL https://ectolink.org` — expect a **200** from the full site with
      no redirect hop. Then load it in a browser, search a tree, and confirm
      predictions render. Check a deep link too:
      `https://ectolink.org/tree/quercus-garryana.html` should be a real page
      again, not the branded 404.

- [ ] **6. Cancel the Search Console removal**
      Google Search Console → *Removals* → cancel the temporary removal for the
      `ectolink.org` prefix. Removals expire after ~6 months on their own, but
      cancelling brings the pages back within a day or so instead of waiting.
      Then submit `https://ectolink.org/sitemap.xml` for a fresh crawl — the tree
      pages returned 404 throughout the pause and will need re-discovering.

- [ ] **7. Update the thesis link if the paper supersedes it**
      The dedication section in `ectolink-web/index.html` links to the UBC Open
      Collections thesis record. If the published article is the better citation,
      point it there — but keep the dedication wording itself unchanged.

- [ ] **8. Archive this repo**
      `gh repo archive JCTec/ectolink-coming-soon`
      Archiving, not deleting: it is the record of how the pause was done, and it
      is the thing to un-archive if the site ever needs to be paused again.
