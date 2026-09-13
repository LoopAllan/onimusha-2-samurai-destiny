# Onimusha 2 · 旅途手帖

A source-backed, Traditional Chinese static guide slice for **Onimusha 2: Samurai's Destiny**. Specification: [issue #1](https://github.com/LoopAllan/onimusha-2-samurai-destiny/issues/1). This is one operational slice, **not** a complete early-game walkthrough.

## Run and verify

Node **22 or newer**. Runtime: native browser ES modules, JSON and CSS; no framework, CDN, tracking, or remote media downloads. Playwright is a locked development-only dependency.

```sh
npm ci
npm test
npm run validate
npm run build
npx playwright install --with-deps chromium
npm run test:browser
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080/`. `file://` does not support this JSON-loading workflow. All distributed links/assets are relative, and browser tests serve the build at `/guide/` to exercise repository-subpath hosting. `dist/` is generated, not committed.

## Delivered scope

- Eight independently addressable category pages with normal relative links, one shared navigation/header/version shell, active-page semantics, responsive layout, and keyboard/touch navigation.
- Six-step chalk → Heike → emblem → melon → delivery → necklace route, with **separate version-specific action records** and inspected community-source provenance.
- Stage/recipient filters and multilingual alias search; ordered steps; direct item upstream/downstream links; current actions and pre-advance warnings.
- One-way local stage progress with confirmation of risky advances, exchange consumption, per-version persistence, and reset limited to `onimusha2-guide:v1:<version>`. This notebook does not modify or synchronize the game's save. Users record actions only after completing them in game; it is not a simulator of NPC whereabouts.
- Necessary guidance stays visible. Story-tagged records are excluded from search/render unless opted in; this release contains no story-result records. Broad source excerpts are never indexed or shipped.
- Original relationship SVG with equivalent text. Official CAPCOM character video link is promotional introduction, **not a verified walkthrough**. No copied map, screenshot, transcript, or remote image is redistributed.

### Evidence semantics

`status: verified` means **the source text was inspected**, not official certification, cross-source numerical certainty, or a playtest. All community route records remain `confidence: community-source` and explicitly say they were not playtested. Names in Chinese are editorial translations; missing EN/JA names remain null and visibly pending. Exact per-version sources are shown on actions and entity details. No item English names were inferred from a translation.

`start` is inclusive and `expire` exclusive over editorial event checkpoints, not official chapter numbers. `windowKind` is mandatory: `hard` is an evidenced cutoff, while `verification` ends the **researched operating window**, returning unknown rather than claiming the game action expires. Null bounds remain an explicit unknown, disable completion and render safely; a null recipient means no recipient filter entry. This distinction matters for intermediate trades and the PS4 necklace collection after the later dialogue. Recommended completion deadlines do not become universal gifting deadlines. Advances across multiple checkpoints warn about every crossed pending deadline, not only the next checkpoint.

The PS2 town guide supports the necklace deadline before speaking to ジュジュドーマ. The Remaster source supports collection after 聖の玉 but not that later cutoff: PS4 does **not** inherit it. Both versions independently support melon delivery before 聖の玉. The route intentionally limits trade availability to its evidenced early operation, not all possible gifting situations. No affinity or companion-presence threshold is inferred where the route sources omit it; null means no encoded requirement, **not proof none exists**.

### Architecture and rule boundary

- `data/guide.json`: normalized entities, sources, stages and actions.
- `src/validate.js`: input shape, source URLs, referential integrity, source coverage, graph cycles, quantities and rule-field validation.
- `src/engine.js`: pure eligibility and immutable transactions.
- `src/query.js`: scoped search, stable order, derived reverse relations and warnings.
- `src/progress.js`: injected storage adapter and scoped persistence.
- `src/shell.js`: shared version preference and responsive navigation behavior on every page.
- `src/app.js`: companions-only safe DOM rendering and interaction orchestration; no `innerHTML`.
- `scripts/site.mjs`: shared page/navigation configuration and HTML generator.
- `scripts/`: validation, allowlisted eight-document static build and real browser smoke test.

Engine tests additionally cover AND/OR event conditions, inventory, companion/affinity gates, explicit conflict IDs, uncertain rewards (possible rewards are never auto-owned), returned/rejected gifts, elapsed **game minutes**, item grant timestamps and consecutive history interrupted by unrelated actions/map changes. These synthetic fixtures remain **tests only**. The shipped slice does not expose controls or claim content support for every generic engine capability.

**Pending:** actual transformation thresholds and combo datasets, first-ever gift bonuses, arbitrary repeated gifts, affinity-delta accounting, random-reward observation UI, full inventory editing and progress import, NPC presence simulation, full walkthrough/maps/bosses/collectibles/trophies, and independent gameplay verification. Age tracking currently assumes one acquisition cohort per item ID; do not use it for multiple independently aged copies. No end-to-end transformation simulator is claimed.

## Sources and editorial decisions

- [CAPCOM EN](https://www.capcom-games.com/onimusha/2/en-uk/) / [JA](https://www.capcom-games.com/onimusha/2/ja-jp/): official names, version notes, linked promotional video. These pages describe both the original and remaster; they do not establish all shared mechanics.
- [AppMedia melon route](https://appmedia.jp/onimusha2/78917888) and [orange necklace](https://appmedia.jp/onimusha2/78919586): Remaster route, acquisition and delivery windows. These are two pages from **one publisher**, not independent cross-verification.
- [XGameMania town, notes 10 and 17](https://xgamemania.com/onimusha/2/map/2.html): PS2 chain, delivery and collection windows.

Inspected 2026-09-13. AppMedia's necklace page spells one step `エンブレス`, while its next step and melon article consistently use `エンブレム`; the registry follows the consistent name and does not invent a second item. The PS2 town page has a truncated phrase for the sick father; our original summary does not reproduce the typo. Source excerpts used for research are not included in the site or protected search. Agreement across editions is not same-edition corroboration.

## CI and release boundary

PR/main CI runs tests, data validation, build and browser checks, then uploads a **non-deployment** downloadable build artifact. Actions use major version tags as requested.

No deployment has been performed. `pages.yml` is manual-only (`workflow_dispatch`) and refuses non-main refs. It rebuilds/tests before deployment and scopes Pages/OIDC permissions to the deployment job. After an approved merge **and separate release approval**, a repository owner must enable Pages with GitHub Actions and explicitly run this workflow on `main`. Configure approval protection for the `github-pages` environment as appropriate. No PR, branch push, or merge automatically publishes a site.

Local execution is not remote CI success or a live Pages URL. Implementation is delivered on a feature branch through an independently reviewed pull request. Issue #1 remains the authoritative specification and progress record; merge and public deployment require separate approval.
