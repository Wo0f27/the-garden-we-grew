# V9.0 — Botanical source reconnaissance
Date: 2026-11-26. Research only. No import, runtime change, or production merge authorized.
Baseline: 6245f712d34ed96200ab8f7ad47643395b710a79. Reviewed garden-model.js, garden.js, garden-scenes.js, THIRD_PARTY_LICENSES.md, and V9-EXPANSION.md.

## Current renderer audit
- Retain seeded SVG petalPath and smoothClosed, bounded curve sampling, stage interpolation, portable standalone export, and existing four retained upstream notices.
- Six species and three-color palettes are hardcoded; bloom cache currently uses species + seed, clearing after approximately 41 entries. Color variants require a palette-aware cache key and a deliberate bounded cache policy.
- Stem-instance IDs are restricted by a six-species regex; saved plants are keyed by species, stem copies by species and suffix 2–12. Existing IDs and independent placement data must survive migration.
- Generic stem/leaf/bud geometry is shared by all six plants. Extend with species-specific leaves, branching, clustered blooms, spires and asymmetric flower heads, keeping normalized head/drag anchors.
- Fixed six-element scenery coordinate arrays, intro/workroom decorations and letter progress rely on M.species. Separate the original six from the catalog before expansion. Never let a new plant relock the letter.
- Keep existing default palettes and visual output for migrated saves. Per-stem colors must persist through undo/redo, save/reload, PNG/SVG and repeated stems. Do not infer a new plant color from an old save.
- Browser preview must not mutate production localStorage. No production changes during research.

## Source register
### V9-R01 — Existing BLOOM° (retain)
https://github.com/buildwithsabba/bloom/tree/f052a78915c30ec3a1b22eab90fb508795bcadf0
MIT, Alessio Sabatino (2026). Upstream LICENSE blob d34a733b86506493fc7f862969abc16f23b92376 matches retained vendor/BLOOM/LICENSE. Existing petalPath / smoothClosed integration remains strongest visual fit. No new material imported. Expected relative cost low to moderate with bounded SVG geometry; benchmark expanded catalog.

### V9-R02 — olavblj/bloom (reference only for now)
https://github.com/olavblj/bloom/tree/80fccdc0c7bd1fc2f87737e897aaef059167cd56
README says MIT; pinned tree has no standalone LICENSE identified. README and packages/bloom-render/src/palettes.ts inspected. Source has named and custom palettes, separate petal/alternate/center/stem/leaf/background channels; pinned palette module lists 12 names, README describes six. Seeded pure TypeScript SVG engine, geometric rather than painterly. Good architecture reference, not a replacement. No copying palettes/code pending complete license notice/authorship confirmation. Estimated low runtime cost if independently implemented within existing SVG model.

### V9-R03 — anselm/parametric-flowers (reference only)
https://github.com/anselm/parametric-flowers/tree/b18a8f17f8e2537d8c876220d4ae1f0d235838a5
README and src/species/presets.js inspected; no standalone license found in pinned tree, no permission to import established. Three.js-style procedural 3D organ presets, whorls, petal morphology, branching inflorescences, surface patterning. Useful for understanding architecture; cross-check botanical facts against independent institutional references and author original 2D geometry. Source acknowledges approximation limits. Do not copy code, parameters or artwork. Full runtime is poor fit for existing lightweight SVG/export pipeline; no measured benchmark.

### V9-R04 — tantaneity/bouquet-gen (selective adaptation candidate)
https://github.com/tantaneity/bouquet-gen/tree/75e7fb276e7d19005819883d25b522c9953991bc
MIT copyright (c) 2026 tantaneity; exact LICENSE inspected (blob d4da3dea8c91c64c25dddc1dbd9c119879102c6e). README and Assets/Scripts/BouquetPlan.cs inspected. Seeded C# geometry and role-based layout, focal blooms, medium blooms, filler, spires, foliage, palette and clearance. Reported shapes include anemone, dahlia, carnation, lavender, gypsophila, eucalyptus and fern. Candidate for future selective SVG ports after source-level review of BloomHeads.cs and LeafSprays.cs, attribution and explicit approval. No Unity/URP runtime. Expected low-to-moderate 2D adaptation cost; actual mobile cost unmeasured.

### V9-R05 — Platane/Procedural-Flower (reserve)
https://github.com/Platane/Procedural-Flower/tree/d857fbe846d5899cd5cf8ea6a47d37e6030f53c0
MIT-form license, Copyright (c) 2012 Arthur Brongniart, exact LICENSE inspected (blob 4385f290bc15833aeb2135849eb2b0e82e0328ea). README describes finite, uncontrolled and manually controlled Canvas growth, with adjustable branching and color. Reserve for branching/growth ideas; no need to introduce a second continuous canvas renderer. If used, retain full copyright and permission notice, adapt only bounded geometry after approval.

### V9-R06 — OpenClipart / FreeSVG (static vector candidates)
https://openclipart.org/detail/229326/calico-flower — Firkin upload 2015-10-08, page attributes illustration to Karl Urban, Umatilla National Forest, public-domain collection; direct SVG offered. Provenance is uploader's statement, not independent original-source authentication.
https://freesvg.org/flowers-gigli — asset 95820, 2020-08-13, OpenClipart publisher, page declares Public Domain and CC0 site terms, 0.23 MB. Exact species identification and original artist/provenance unverified. Static vectors may need separated parts, simplified paths and original growth geometry; no file downloaded or visually benchmarked. Other candidate FreeSVG iris/lily pages returned 404; excluded.
Use as optional reference/asset candidates only, not primary renderer. Verify individual file provenance and structure before adoption; record author/source even if attribution not required.

### V9-R07 — Botanical institutional references
https://www.si.edu/object/phalaenopsis-orchid-botanical-illustration%3Anmnhbotany_16306266 — search index reports CC0, direct page access returned 403. Reference lead only; verify actual media rights and object record before reuse.
https://about.biodiversitylibrary.org/help/copyright-and-reuse/ — BHL advises item-level copyright verification. Use identified public-domain plates as references, with item citation and contributing library, not blanket permission for all collection contents. No item downloaded.
Institutional plates/photos are anatomy references, not growth-ready SVG. Original redraws can retain existing art style.

## Proposed decision V9-001
A (recommended): keep BLOOM-derived native SVG as core. Independently implement a catalog/palette architecture, use the other generators as research references, and consider selective MIT-licensed bouquet geometry/layout adaptations only after exact source review. No new 3D or Canvas runtime; keep exports self-contained.
B: port an alternative generator wholesale (not recommended: rendering, growth and export regressions; visual mismatch and rights uncertainties).
C: static vector library as main flower renderer (not recommended: variable art quality, growth animation decomposition and color limitations).

## Proposed pilot after approval
1. Schema and catalog isolation, legacy save fixture, original-six unlock and migration safeguards.
2. Preserve all six default colors; pilot independently authored red, ivory and yellow rose, white/coral peony and purple/yellow tulip palettes, then expand other species.
3. New species pilot: lily (radial tepals + stamens), carnation (frilled head), lavender (clustered spike), orchid (bilateral flower). Four different morphologies before full 12-flower catalog. Botanical accuracy to be checked; no implementation yet.
4. Measure path count, SVG bytes, render/update time and export success for mixed 12-stem bouquets and expanded nursery on mobile; inspect both reduced/normal motion and legacy save behavior. Establish baseline first, no performance claims from estimates.
5. Keep owner text exactly unchanged; use neutral new flower descriptions until owner personalizes them.

No files/assets/code imported; no release. Actual visual comparison and performance tests still pending. 
