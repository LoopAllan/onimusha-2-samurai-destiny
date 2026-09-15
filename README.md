# Onimusha 2 · 旅途手帖

A source-backed, Traditional Chinese static guide for **Onimusha 2: Samurai's Destiny**. Specification: [issue #1](https://github.com/LoopAllan/onimusha-2-samurai-destiny/issues/1). The walkthrough covers the Yagyu Village opening, first-visit Imasho town exploration and the mountain-path round trip through the mine entrance chest, not the mine interior, complete first visit or game.

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
- Five-step opening walkthrough from Yagyu Village through the Buraitou departure to Imasho, with claim-level citations, an explicit leave-area checkpoint, and PS2/2025 Remaster projections.
- Four Imasho town checkpoints: street gift, bar backyard/upstairs, market/stables, smithy map/Cloth/lift/Bow. These are optional pickups in editorial order, not a mandatory event graph or permanent deadlines. Ten town entities preserve separately sourced PS2 names and Remaster English labels; Chinese is editorial and Remaster Japanese remains pending. The existing chalk chain belongs to a later visit.
- Four mountain continuation checkpoints: fixed path pickups, permit guard, return to the bar/introduction/100-gold permit, return past the guard to the mine entrance chest. Four new entities have version-scoped source-listed English names, editorial Chinese and pending Japanese; no new in-game-name verification is claimed. The boundary is before entering the mine. Initial gifts, companion selection, beetle timing, farming totals, shop completion, mine interior and boss are excluded. Readers planning companion/gift outcomes are warned to pause and consult version-specific coverage before proceeding. See [the continuation evidence audit](docs/imasho-mountain-evidence.md).
- Nineteen opening-area names with per-version Traditional Chinese, English, and Japanese evidence states. Editorial translations and missing target-version names render as such instead of inheriting another version.
- Six-step chalk → Heike → emblem → melon → delivery → necklace route, with **separate version-specific action records** and inspected community-source provenance.
- Stage/recipient filters and multilingual alias search; ordered steps; direct item upstream/downstream links; current actions and pre-advance warnings.
- One-way local stage progress with confirmation of risky advances, exchange consumption, per-version persistence, and reset limited to `onimusha2-guide:v1:<version>`. This notebook does not modify or synchronize the game's save. Users record actions only after completing them in game; it is not a simulator of NPC whereabouts.
- Necessary guidance stays visible. Story-tagged records are excluded from search/render unless opted in; this release contains no story-result records. Broad source excerpts are never indexed or shipped.
- Original relationship SVG with equivalent text. The five illustrated entity details use only registered, local **original SVG pictograms**; each carries a byte/hash/provenance record and is loaded as an image, never injected markup. The Imasho figure is explicitly a non-spatial interaction schematic, not a map. Official CAPCOM character video link is promotional introduction, **not a verified walkthrough**. No copied map, screenshot, transcript, or remote image is redistributed.

### Evidence semantics

Legacy `status: verified` records mean **the source text was inspected**, not official certification, cross-source numerical certainty, or a playtest. New walkthrough steps use the narrower `source-checked` status. Name records distinguish `in-game-verified`, `source-listed`, `editorial`, and `pending` independently for each language/version. Traditional Chinese opening names remain editorial until target-version UI evidence is captured; Remaster Japanese names remain pending rather than inheriting PS2 terminology.

`start` is inclusive and `expire` exclusive over editorial event checkpoints, not official chapter numbers. `windowKind` is mandatory: `hard` is an evidenced cutoff, while `verification` ends the **researched operating window**, returning unknown rather than claiming the game action expires. Null bounds remain an explicit unknown, disable completion and render safely; a null recipient means no recipient filter entry. This distinction matters for intermediate trades and the PS4 necklace collection after the later dialogue. Recommended completion deadlines do not become universal gifting deadlines. Advances across multiple checkpoints warn about every crossed pending deadline, not only the next checkpoint.

The PS2 town guide supports the necklace deadline before speaking to ジュジュドーマ. The Remaster source supports collection after 聖の玉 but not that later cutoff: PS4 does **not** inherit it. Both versions independently support melon delivery before 聖の玉. The route intentionally limits trade availability to its evidenced early operation, not all possible gifting situations. No affinity or companion-presence threshold is inferred where the route sources omit it; null means no encoded requirement, **not proof none exists**.

### Architecture and rule boundary

- `data/guide.json`: normalized entities, sources, stages, actions and walkthrough steps.
- `src/validate.js`: input shape, source URLs, referential integrity, source coverage, graph cycles, quantities and rule-field validation.
- `src/engine.js`: pure eligibility and immutable transactions.
- `src/query.js`: scoped search, stable order, derived reverse relations and warnings.
- `src/progress.js`: injected storage adapter and scoped persistence.
- `src/shell.js`: shared version preference and responsive navigation behavior on every page.
- `src/app.js`: companions-only safe DOM rendering and interaction orchestration; no `innerHTML`.
- `src/walkthrough-model.js`: pure version projection for ordered steps, localized names and source records.
- `src/walkthrough-app.js`: walkthrough-only safe DOM rendering; no `innerHTML`.
- `scripts/site.mjs`: shared page/navigation configuration and HTML generator.
- `scripts/`: validation, allowlisted eight-document static build and real browser smoke test.

Engine tests additionally cover AND/OR event conditions, inventory, companion/affinity gates, explicit conflict IDs, uncertain rewards (possible rewards are never auto-owned), returned/rejected gifts, elapsed **game minutes**, item grant timestamps and consecutive history interrupted by unrelated actions/map changes. These synthetic fixtures remain **tests only**. The shipped slice does not expose controls or claim content support for every generic engine capability.

**Pending:** actual transformation thresholds and combo datasets, first-ever gift bonuses, arbitrary repeated gifts, affinity-delta accounting, random-reward observation UI, full inventory editing and progress import, NPC presence simulation, full walkthrough/maps/bosses/collectibles/trophies, and independent gameplay verification. Age tracking currently assumes one acquisition cohort per item ID; do not use it for multiple independently aged copies. No end-to-end transformation simulator is claimed.

## Sources and editorial decisions

- [CAPCOM EN](https://www.capcom-games.com/onimusha/2/en-uk/) / [JA](https://www.capcom-games.com/onimusha/2/ja-jp/): official names, version notes, linked promotional video. These pages describe both the original and remaster; they do not establish all shared mechanics.
- [AppMedia melon route](https://appmedia.jp/onimusha2/78917888) and [orange necklace](https://appmedia.jp/onimusha2/78919586): Remaster route, acquisition and delivery windows. These are two pages from **one publisher**, not independent cross-verification.
- [XGameMania town, notes 10 and 17](https://xgamemania.com/onimusha/2/map/2.html): PS2 chain, delivery and collection windows.
- [SoloPlayGuide Yagyu Village](https://soloplayguide.com/games/onimusha-2-samurai-s-destiny-remaster/guide/01-yagyu-village-1st-visit): Remaster opening route and English in-game acquisition screenshots.
- [SoloPlayGuide Imasho first visit (2026-01-09 Wayback)](https://web.archive.org/web/20260109071255id_/https://www.soloplayguide.com/games/onimusha-2-samurai-s-destiny-remaster/guide/02-imasho-town-1st-visit): Remaster town and mountain/permit/entrance prose. Earlier work inspected English acquisition screenshots 027 and 029–036; continuation names are text-listed only. Not a PS4-specific hardware playtest; no platform-specific controls are inferred. See [the town evidence audit](docs/imasho-first-visit-evidence.md) and [continuation audit](docs/imasho-mountain-evidence.md).
- [GameChronicles Yagyu Village / Imasho Town](https://gamechronicles.com/guides/onimusha2/oni2guide.htm): PS2 opening and town routes. Its conflicting opening-map label is not used as opening-map name evidence.
- [XGameMania Yagyu Village](https://xgamemania.com/onimusha/2/map/1.html), [key items](https://xgamemania.com/onimusha/2/item3.html), [items](https://xgamemania.com/onimusha/2/item.html), and [documents](https://xgamemania.com/onimusha/2/item4.html): PS2 Japanese names and opening-area locations.
- [GameFAQs Gift Item FAQ, archived 2025-04-29](https://web.archive.org/web/20250429020303/https://gamefaqs.gamespot.com/ps2/520511-onimusha-2-samurais-destiny/faqs/17422): PS2 English/Japanese item terminology; cited as an archive replay because the live page was blocked.

Inspected 2026-09-13. AppMedia's necklace page spells one step `エンブレス`, while its next step and melon article consistently use `エンブレム`; the registry follows the consistent name and does not invent a second item. The PS2 town page has a truncated phrase for the sick father; our original summary does not reproduce the typo. Source excerpts used for research are not included in the site or protected search. Agreement across editions is not same-edition corroboration.

## CI and release boundary

PR/main CI runs tests, data validation, build and browser checks, then uploads a **non-deployment** downloadable build artifact. Actions use major version tags as requested.

The public site is <https://loopallan.github.io/onimusha-2-samurai-destiny/>. A push to `main` automatically deploys through `pages.yml`; pull requests do not deploy. The workflow rebuilds and tests before upload, and scopes Pages/OIDC permissions to the deployment job.

Local execution is not remote CI or deployment success. Implementation is delivered on a feature branch through an independently reviewed pull request; after merge, the exact `main` Pages run and public URLs must be verified. Issue #1 remains the authoritative specification and progress record.
