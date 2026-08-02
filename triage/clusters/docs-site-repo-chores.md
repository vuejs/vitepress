[← Index](../README.md)

# Docs content, website & repo chores

Priority: P3 · 4 actionable · last reviewed 2026-08-03

This area covers VitePress's documentation content, deployment guides, and the docs site's own configuration, branding, and release tooling. The deployment guide covers well over a dozen hosting platforms but still has no DigitalOcean App Platform section, a gap [#2010](https://github.com/vuejs/vitepress/pull/2010) fills with a short new subsection matching the format of its neighbours. The `publicDir` option is undocumented anywhere in the docs, which [#3885](https://github.com/vuejs/vitepress/pull/3885) addresses with a paragraph for `asset-handling.md`. Import order across the codebase is still inconsistent for lack of an ESLint config or prettier plugin; [#2384](https://github.com/vuejs/vitepress/pull/2384) reordered things by hand, but the fix worth landing is the tooling itself, with a mechanical reformat to follow. And roughly sixteen English guide pages have grammar corrections waiting in [#4575](https://github.com/vuejs/vitepress/pull/4575), which still applies cleanly and mainly needs review rather than fresh authoring. Separately, the getting-started guide's package-manager command table is worth a preventive fix: it draws roughly two duplicate "fix" PRs a year from contributors assuming `vitepress init` installs vitepress itself, and a one-line inline note ("`vitepress init` does not install vitepress — install it first; `pnpm`/`bun` then run the local binary directly") would head them off.

## Worth acting on

### [#2010](https://github.com/vuejs/vitepress/pull/2010) docs: Add deployment steps for DigitalOcean App Platform

- **Verdict:** salvage · **Value:** 3 · **Effort:** S
- **Author:** pilotmoon · **Closed:** 2023-02-28

**What it did.** Added a DigitalOcean App Platform subsection to the deployment guide.

**Why it was closed.** Closed about an hour after opening with zero comments or review; no reason recorded.

**Why it still matters.** `docs/en/guide/deploy.md` "Platform Guides" today lists the generic Netlify/Vercel/Cloudflare/Amplify/Render block plus GitHub Pages, GitLab Pages, Azure, CloudRay, Firebase, Heroku, Hostinger, Kinsta, Stormkit, Surge and Nginx — but still no DigitalOcean, despite several smaller platforms being added since 2023. The section is demonstrably open to additions.

**Recommendation.** Land a fresh `### DigitalOcean App Platform` entry under Platform Guides, matching the terse three-to-five-line format of its Kinsta/Stormkit/Hostinger neighbours. Do not replay the 2023 diff verbatim — App Platform's dashboard field names have changed; re-verify the build command / output directory settings first.

### [#3885](https://github.com/vuejs/vitepress/pull/3885) docs: add documentation for `publicDir`

- **Verdict:** salvage · **Value:** 2 · **Effort:** S
- **Author:** dmohns · **Closed:** 2024-05-22

**What it did.** Added guidance on `publicDir` behaviour and customization, citing two issues ([#3203](https://github.com/vuejs/vitepress/issues/3203), [#3884](https://github.com/vuejs/vitepress/issues/3884)) where users were confused by it.

**Why it was closed.** Author self-closed after reflection ("don't think it provides much benefit"). brc-dd's only comment was a placement correction, which the author had already applied — no maintainer rejection on record.

**Why it still matters.** `publicDir` appears nowhere in `docs/en/` today; `asset-handling.md` never names it.

**Recommendation.** One concise paragraph in `docs/en/guide/asset-handling.md`. Merge with [#4600](https://github.com/vuejs/vitepress/pull/4600), which attacked the neighbouring gap: its frontmatter-`description` half already landed via a separate bulk pass, but its clarification that `public/` must live under a custom `srcDir` did not. Both belong in the same paragraph, so a single PR closes both threads.

### [#2384](https://github.com/vuejs/vitepress/pull/2384) refactor: standardize import sort

- **Verdict:** redo · **Value:** 2 · **Effort:** S
- **Author:** zonemeen · **Closed:** 2023-05-21

**What it did.** Manually reordered import statements across ~14 files for consistency.

**Why it was closed.** brc-dd preferred an automated solution (a prettier plugin) over a one-off manual reordering, noting ESLint was too much overhead for the team at the time.

**Why it still matters.** There is still no import-sort prettier plugin and no ESLint config in the repo, so the inconsistency the PR targeted persists.

**Recommendation.** Only worth doing as tooling: add a prettier import-order plugin and land the reformat as one mechanical commit. Never revive the hand-ordered diff — three years of changes guarantee conflicts, and a manual pass reintroduces the exact drift brc-dd objected to. Purely cosmetic; lowest priority in this list.

### [#4575](https://github.com/vuejs/vitepress/pull/4575) fix: grammar

- **Verdict:** salvage · **Value:** 2 · **Effort:** M
- **Author:** streakwind · **Closed:** 2025-09-06

**What it did.** Line-by-line grammar and wording corrections, one commit per page, across ~16 English guide and reference docs.

**Why it was closed.** No maintainer verdict on record. The only post-open activity was the author's own `/publish`; closed roughly seven months later without comment, i.e. went stale.

**Why it still matters.** All touched files still exist largely intact, so most of the diff still applies.

**Recommendation.** Viable to rebase, but the cost here is review, not authoring — budget for reading copy-edits across 16 files before reopening. Two constraints worth setting upfront: (1) keep only actual grammar errors and drop tone/style preferences, since maintainers rejected exactly that kind of subjective rewording in [#5181](https://github.com/vuejs/vitepress/pull/5181) and [#4910](https://github.com/vuejs/vitepress/pull/4910); (2) decide whether the translated locales get follow-ups, or accept that they drift further from the English source.
