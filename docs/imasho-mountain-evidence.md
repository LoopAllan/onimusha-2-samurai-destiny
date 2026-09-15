# Imasho mountain round trip: bounded evidence audit

Accessed 2026-09-15. Tracks [Issue #1](https://github.com/LoopAllan/onimusha-2-samurai-destiny/issues/1). This continues the town/smithy slice; it does not complete the first visit or first chapter.

## Acceptance boundary

Four additional walkthrough cards, ordered 100–130: mountain-path fixed pickups, guard requiring a permit, return to the bar/introduction and permit purchase, return through the guard to the mine entrance chest. Stop **outside the mine after the entrance chest**. No mine interior, boss, first-gift rewards, companion route selection, beetle appearance timing, farming totals, all-shop checklist, or egg evolution is delivered. The introduction event is included only to orient the reader returning to the bar; no relationship effects or gifting instructions are inferred.

The existing five opening cards and four town cards remain. Optional pickup order is editorial, not a game prerequisite graph. The permit requirement is directly supported for each version. New `missable`, `irreversible`, and `leavesArea` flags remain false: this boundary does not claim an irreversible departure or a permanent pickup deadline. The book card is `boundary`; it includes an optional pickup, not a requirement to enter the mine. Readers aiming at gifts/companions are explicitly warned to pause and consult version-specific coverage; omission is not advice that every gift opportunity remains available later. The existing chalk exchange is a later visit, never a requirement here.

## Sources actually read

- **Official context, not route proof:** [CAPCOM, Onimusha 2: Samurai's Destiny](https://www.capcom-games.com/onimusha/2/en-uk/). Re-read original official product page: identifies the 2002 PS2 release and a remaster retaining setting/gameplay systems. It does not establish mountain pickups, permit purchase or regional item labels. Community evidence is explicitly accepted by Issue #1; the route is not mislabeled official.
- **PS2:** [GameChronicles, Onimusha 2 Walkthrough v1.0](https://gamechronicles.com/guides/onimusha2/oni2guide.htm), Imasho Town section from shop/mountain path through the paragraph immediately before Gold Mines. Direct curl returned HTTP 406; web extraction of the same original URL returned its actual full claim-bearing text (not snippets). The original's opening-map naming error remains excluded. This source supports English PS2 prose only, not Japanese/Chinese UI evidence.
- **2025 Remaster:** [SoloPlayGuide, 02. Imasho Town - 1st Visit, dated Wayback capture 2026-01-09](https://web.archive.org/web/20260109071255id_/https://www.soloplayguide.com/games/onimusha-2-samurai-s-destiny-remaster/guide/02-imasho-town-1st-visit). Original URL: `https://www.soloplayguide.com/games/onimusha-2-samurai-s-destiny-remaster/guide/02-imasho-town-1st-visit`. Retrieved archived original HTML with `curl --compressed`; read the continuation from Bow through the entrance item. Final availability checks returned HTTP 200 for both the live original and the dated replay; the adopted continuation text was identical after stripping HTML/whitespace. The existing dated citation is retained as stable provenance, not described as the only accessible copy. This is Remaster evidence, not a PS4-hardware playtest; no buttons or platform-specific behavior are adopted.

Each version has **one community route source**, not independently cross-verified same-version proof. Cross-version agreement is not corroboration of either version. Reused catalog IDs avoid duplicate records for the same original source. Existing unrelated source records and earlier name evidence retain their prior provenance.

## Claim-level adoption matrix

Every published instruction cites the matching version source above directly beside the instruction. No new instructions use the union of both editions' citations after version selection.

| Published claim | PS2 direct support | Remaster direct support | Limit |
| --- | --- | --- | --- |
| Leave smithy/town for mountain path; deal with enemies | Shop paragraph routes north, left at blacksmith, stairs to path; following paragraph describes demon warriors | Immediately after Bow: leave shop and go toward gold mine via mountain path; farming note establishes demons in that area | Published wording omits compass directions, screen counts and farming recommendations. |
| Pick up mushroom early on path; telescope in a box along path | `Unique Mushroom` in first section; `Telescope` box around turn | `Unique Mushrooms` hidden near left tree on second screen; `Telescope` box halfway to mine | Different edition descriptions of first/second section are not merged into a screen number. The shared instruction says path's early portion, then check the chest along the path. |
| Continue up stairs; guard requires permit; return to town | Guard will not let player pass without permit, now purchasable at bar | Continue upstairs; guard asks for permit; subsequent text returns to town | No precise causal claim that shopping is required to unlock the bar event. |
| Enter bar and encounter Ekei/Magoichi introduction | Return to bar starts sequence; breaking up fight yields instructions | Enter bar, walk a few steps to cutscene introducing Ekei and Magoichi | No new character-name authority, rewards, affinity values or trading requirement; established project Chinese names remain editorial. |
| Buy permit from man at back of bar for 100 gold | Buy `Permit` for 100 Gold from man near bar, at back | Fee explicitly 100 gold; talk to man in front of back side door to buy `Mountain Permit` | No inferred occupation or appearance of seller. No whole-store purchase or farming prerequisite. |
| Return up mountain, show permit, pass guard | Give new permit to man and he lets player pass | Make way to mountain path, show guard permit | Direct action evidence, not inferred from a next-page link. No inventory-consumption assertion. |
| Open entrance chest for fourth history book | `History Book #4` box next to mine entrance before movie entering mine | Pick up entrance item `History Book Vol. 4`, then separately says enter mine | Published boundary stops at chest; does not instruct entering mine or completing mine events. |

## New localized names

| Editorial Traditional Chinese | PS2 EN (source-listed) | Remaster EN (source-listed) | JA |
| --- | --- | --- | --- |
| 珍奇蘑菇 | Unique Mushroom | Unique Mushrooms | pending in both |
| 望遠鏡 | Telescope | Telescope | pending in both |
| 山道通行證 | Permit | Mountain Permit | pending in both |
| 日本史記・卷四 | History Book #4 | History Book Vol. 4 | pending in both |

The English strings are only source transcriptions, not game-UI verification. Chinese is editorial; no language is filled from another edition. Each English name's single source ID also appears in its entity provenance. No new screenshot was inspected, redistributed or used to justify names/locations. Prior town screenshots remain only prior research evidence. No new media asset, map, image hotlink, embedded full guide or copied long translation is shipped. Public readability does not establish redistribution rights.

## Verification and handoff

- Data tracer bullet: new four-card contract failed with an empty mountain collection before implementation; then passed with per-version exact step/instruction source sets, name statuses, numerical cost and negative overstatement checks.
- Copy tracer bullet: updated boundary test failed because `山道往返四節點` was absent before the page generator and README changed; then passed. Earlier nine-card regression now explicitly examines sequence ≤90 rather than incorrectly asserting the entire guide must remain nine cards forever.
- Browser checks cover thirteen-card order, all seven new instruction citation titles per version, precise new English labels in both directions, no new `in-game-verified` name labels, catalog equality, the homepage continuation link/deep-link, and both editions at 320/360/768/1280px. Existing eight-page, exchange-chain and navigation checks remain intact.
- The new homepage-to-mountain browser probe exposed an existing asynchronous fragment-navigation defect: the URL hash was correct but JSON-created target was still below the viewport (`scrollY: 0`). A delayed-JSON repro failed before the fix. Initial rendering now scrolls only a matching target inside the walkthrough root after loading data; subsequent version changes do not forcibly re-scroll. The browser regression waits for the existing CSS smooth scroll to settle rather than asserting immediate geometry.
- Local success is not independent review, remote CI or deployment. Parent independently reviews the immutable staged tree before any commit; Issue #1 remains open and carries exact candidate identity and execution evidence. No release is claimed for this candidate.
