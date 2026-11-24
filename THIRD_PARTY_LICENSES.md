# Third-party source and asset register — Prototype 03

Prototype 01 was original code. Prototype 02 selectively adapts yZhanWeather's petal/firefly CSS motion from src/conf.js at commit 9f3eb3d41910740319813c4f87011880ea1c5978 (MIT; Copyright (c) 2023 馒头饭). Retained exact upstream notice at vendor/yZhanWeather/LICENSE. Changes: scene-local clipping, reduced particle count, relative placement and timing, intersection/visibility pause, reduced-motion suppression. No original yZhanWeather JS runtime, third-party images or fonts are bundled. System fonts and native SVG/Canvas remain.

Prototype 03 incorporates BLOOM°'s procedural petal contour and closed Catmull-Rom smoothing helpers from index.html, commit f052a78915c30ec3a1b22eab90fb508795bcadf0. Copyright (c) 2026 Alessio Sabatino, MIT, exact license at vendor/BLOOM/LICENSE. The original helpers are retained within garden-model.js; the project supplies bounded sampling, deterministic seed, species-specific arrangements, original flower palette and stage interpolation. No upstream application, assets, fonts, or runtime imported.

| Candidate | Role in later evaluation |
|---|---|
| Garten (adewale/garten) | Background garden engine; evaluate lifecycle and rendering before integration |
| BLOOM° (buildwithsabba/bloom) | ADAPTED: petalPath and smoothClosed; project-local render composition and growth controller. [Pinned source](https://github.com/buildwithsabba/bloom/blob/f052a78915c30ec3a1b22eab90fb508795bcadf0/index.html). |
| Organic Flow (pxnz3r/flowerr-project) | Watercolor rendering techniques; evaluate selective adaptation |
| Procedural-Flower (Platane/Procedural-Flower) | Controlled-growth alternative |
| Anime.js (juliangarnier/anime) | Scene and gate animation; drag only if needed |
| yZhanWeather (mantoufan/yZhanWeather) | ADAPTED: scoped petal/firefly motion in styles/scenery.css. Butterfly effect still pending; source at [pinned revision](https://github.com/mantoufan/yZhanWeather/blob/9f3eb3d41910740319813c4f87011880ea1c5978/src/conf.js). |
| DigiBouquet, DevsBouquet, Bouquet Builder | Conceptual workflow references only; no code/art copied; license and asset provenance checks remain open |
| html-to-image (bubkoo/html-to-image) | Conditional DOM-capture fallback if direct SVG export proves inadequate |
| Interact.js, Sparkle, tsParticles, Howler.js, StPageFlip and other recorded candidates | Retain as alternatives; disposition documented in private continuity notebook |

The complete 22-repository and 6-asset register remains in the owner's separate project notebook. Before adopting any upstream material, record its exact pinned source, license text, asset provenance, attribution, changes and tests. Do not import unverified artwork.
