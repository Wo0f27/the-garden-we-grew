# Third-party source and asset register — Prototype 08

Prototype 01 was original code. Prototype 02 selectively adapts yZhanWeather's petal/firefly CSS motion from src/conf.js at commit 9f3eb3d41910740319813c4f87011880ea1c5978 (MIT; Copyright (c) 2023 馒头饭). Retained exact upstream notice at vendor/yZhanWeather/LICENSE. Changes: scene-local clipping, reduced particle count, relative placement and timing, intersection/visibility pause, reduced-motion suppression. No original yZhanWeather JS runtime, third-party images or fonts are bundled. System fonts and native SVG/Canvas remain.

Prototype 03 incorporates BLOOM°'s procedural petal contour and closed Catmull-Rom smoothing helpers from index.html, commit f052a78915c30ec3a1b22eab90fb508795bcadf0. Copyright (c) 2026 Alessio Sabatino, MIT, exact license at vendor/BLOOM/LICENSE. The original helpers are retained within garden-model.js; the project supplies bounded sampling, deterministic seed, species-specific arrangements, original flower palette and stage interpolation. No upstream application, assets, fonts, or runtime imported.

Prototype 04 uses original SVG greenhouse scenery, flower tray, tiered fan arrangement, paper/ribbon designs and CSS wrapping sequence. R08/R09/R21 remain conceptual references (selection, fan placement, wrapping); no source or assets copied. Native CSS suffices for this simple finite sequence; Anime.js remains a candidate for complex timeline/dragging. No new upstream library or asset added.

Prototype 05 selectively ports Garten drawGrass, drawFern and drawBush geometry from src/plants/renderers.ts at 1bc6720bf249c94957c3c3afd1f787b163dd601d to scene-local SVG paths in garden-landscape.js (MIT, copyright (c) 2024; vendor/Garten/LICENSE). Modified seeded randomness, palette, frond structure, density, bounds, and growth input. Organic Flow src/components/SVGFilters.tsx at 4f053d63fc26fe3faee5734b1987beb01b9330ed contributes the turbulence/displacement/blur watercolor approach (MIT, copyright (c) 2026 pxnz3r; vendor/OrganicFlow/LICENSE). Adapted as two small static scene-only SVG wash filters in index.html; reduced displacement and blur, no React/Canvas app. yZhanWeather butterfly two-wing technique also adapted; existing exact license retained. No full upstream engine/runtime or external art.

Prototype 06 uses original bench/envelope/letter illustrations and native CSS transitions with a guarded finite state controller. No additional upstream code or assets. Anime.js remains a candidate for advanced dragging; a separate runtime is unnecessary for this finite envelope sequence. Existing four source adaptations and notices retained.

Prototype 07 compares Anime.js 4.5.0 draggable module and Interact.js drag/snap/inertia capabilities with the required single-pointer, stem-anchored SVG edit. Native Pointer Events, SVG screen-matrix conversion, bounded polar geometry and local history are selected for this implementation. No source copied or additional runtime required. R14/R15 remain reserves if native device tests reveal gaps; all existing integrations retained.

Prototype 08 uses original CSS and controller refinements. Playwright is a test-only tool, not a runtime site dependency; no new artwork or font is imported.

| Candidate | Role in later evaluation |
|---|---|
| Garten (adewale/garten) | ADAPTED: grass/fern/bush geometry, converted to SVG. [Pinned source](https://github.com/adewale/garten/blob/1bc6720bf249c94957c3c3afd1f787b163dd601d/src/plants/renderers.ts). Full engine remains reserve pending performance comparison. |
| BLOOM° (buildwithsabba/bloom) | ADAPTED: petalPath and smoothClosed; project-local render composition and growth controller. [Pinned source](https://github.com/buildwithsabba/bloom/blob/f052a78915c30ec3a1b22eab90fb508795bcadf0/index.html). |
| Organic Flow (pxnz3r/flowerr-project) | ADAPTED: small scene-local pigment filters. [Pinned source](https://github.com/pxnz3r/flowerr-project/blob/4f053d63fc26fe3faee5734b1987beb01b9330ed/src/components/SVGFilters.tsx). Full canvas brushes remain reserve. |
| Procedural-Flower (Platane/Procedural-Flower) | Controlled-growth alternative |
| Anime.js (juliangarnier/anime) | Scene and gate animation; drag only if needed |
| yZhanWeather (mantoufan/yZhanWeather) | ADAPTED: scoped petal/firefly motion in styles/scenery.css. Butterfly effect now adapted in Prototype 05; source at [pinned revision](https://github.com/mantoufan/yZhanWeather/blob/9f3eb3d41910740319813c4f87011880ea1c5978/src/conf.js). |
| DigiBouquet, DevsBouquet, Bouquet Builder | Conceptual workflow references only; no code/art copied; license and asset provenance checks remain open |
| html-to-image (bubkoo/html-to-image) | Conditional DOM-capture fallback if direct SVG export proves inadequate |
| Interact.js, Sparkle, tsParticles, Howler.js, StPageFlip and other recorded candidates | Retain as alternatives; disposition documented in private continuity notebook |

The complete 22-repository and 6-asset register remains in the owner's separate project notebook. Before adopting any upstream material, record its exact pinned source, license text, asset provenance, attribution, changes and tests. Do not import unverified artwork.

### 08.3 compatibility correction
The previously adapted Organic Flow SVG turbulence/displacement filter is disabled/removed from active rendering after reported physical Android corruption; original translucent pigment shapes remain. Attribution and exact license retained. No new upstream source. yZhanWeather ambient animation remains active on desktop, with static fallback on mobile. All other integrations retained.
