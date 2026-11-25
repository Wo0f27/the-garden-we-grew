# The Garden We Grew

Prototype 08 — responsive polish and quality assurance. The visual direction is provisional, not a finished gift.

## Open the prototype

Static site; no install, no build, no server-side service. To publish, enable **Settings → Pages → Deploy from a branch → main / (root)** if Pages is not already enabled. Then open the GitHub Pages URL shown in Settings. For local review, open index.html in a modern browser or serve the repository using a local HTTP server.

## What works in this prototype

- Six seed varieties; plant, water four times, reveal a placeholder message at bloom.
- A single deterministic SVG flower renderer using adapted BLOOM° petal contours, distinct flower forms and animated intermediate growth stages, reused across pots, garden scenery and bouquets.
- Add bloomed flowers from the nursery or florist tray, reorder or remove them; select greenery, three paper colors, three paper designs, three ribbon colors and three ribbon styles. Wrap or unwrap the bouquet; adding, removing or reordering returns it to the unwrapped editing state. Existing saved bouquets migrate to wrapped by default. Export saves the current preview.
- Local state persistence; start-over confirmation.
- Native SVG download and attempted PNG conversion with SVG fallback.
- Responsive layout, native touch/click/keyboard controls and reduced-motion CSS.
- No analytics, external fonts, remote artwork, backend or paid API.

## Personalize

Edit only [garden-text.js](garden-text.js) for ordinary writing. Keep object keys and punctuation, and change quoted values. It is fetched with a fresh URL on startup to avoid stale text. Do not add sensitive information to the public repository.

## Automated browser QA

Run `node tests/model.test.cjs` for model tests. To exercise actual browser rendering locally, install Python Playwright (`pip install playwright==1.65.2`, `python -m playwright install chromium`), then run `python tests/browser_qa.py` from the repository root. It serves the local checkout, uses isolated browser contexts, exercises the garden and downloads, and writes screenshots to a temporary output folder. No test dependency ships to the visitor.

## Review checklist

Test the complete plant-to-bouquet flow, reload persistence, each flower appearance, touch targets and keyboard controls, PNG and SVG downloads (particularly iOS Safari), narrow viewport layout, reduced motion, and fresh personal text changes. Code-level tests do not establish real-browser compatibility.

The gate opens to reveal a continuous scrollable journey: progress-responsive garden path, nursery, greenhouse illustration, bouquet builder and bench beneath a tree. The tree blooms as the six flowers are grown, and the final placeholder letter unlocks only when all six reach bloom. Petals and fireflies are limited to their scenes, paused offscreen and when the tab is hidden, and removed for reduced motion. The nursery now interpolates stem, leaf, bud and bloom geometry on watering, with a bounded per-pot animation and an instant reduced-motion route. Prototype 04 adds an original greenhouse interior, selection tray, tiered bouquet composition and animated paper folds/ribbon reveal. Prototype 05 adds deterministic grass, fern and flowering shrub borders, climbing vines, a richer progressive tree canopy, local watercolor wash and three drifting butterflies. All foliage scales with garden progress where appropriate, without a second continuous rendering loop. Prototype 06 adds a full-bloom progress meter, a sealed illustrated envelope appearing on the bench, a tappable envelope opening sequence, a separate botanical stationery letter and fold/revisit controls. It remains locked until all six flowers bloom; resetting cancels an in-flight reveal and relocks it. Prototype 07 enables direct flower-head dragging in a dedicated positioning mode (bounded angle and stem-height scaling), selectable keyboard/tap nudges, reset-one and automatic layout. Wrapped bouquets must be unwrapped before positioning. Custom positions persist locally and are exported without editor markers. A 30-entry visit-local undo/redo history covers bouquet edits only, not growing plants; full garden reset clears it. Device QA, optional audio and journal remain pending or unapproved. See the project continuity record for research and source decisions.

Prototype 02 adapts MIT-licensed yZhanWeather motion techniques. Prototype 03 adapts BLOOM° petalPath and smoothClosed from its MIT-licensed procedural botany code; the project retains the license and uses local palettes, fixed stage state, and bounded sampling. No full upstream runtime or external artwork is distributed. See THIRD_PARTY_LICENSES.md for the retained source selection and prototype boundaries.

## Gate walkthrough (8.5, based on restored 8.2)
The entrance doors open first (820ms), then the camera moves toward the path through the arch (1100ms), holds briefly and reveals the garden. Only the entrance SVG viewBox changes, at a bounded frame-update rate; the previous full-journey animation is replaced by an immediate handoff. The wide view is restored after crossing. Repeated taps are ignored during the sequence; reduced motion, hidden tabs and unavailable animation frames take the immediate route. No saved-state, flower, bouquet, letter or personal-copy changes. Physical-device graphics issues previously reported on 8.2 remain unresolved; this is a requested entrance effect, not a compatibility fix.

## Continuous arrival (8.6)
The gate walkthrough now hands off to a matching 3.6× close-up of the path before the garden is revealed. A 100ms pause and 1250ms eased pullback reveal the full 600×320 illustration. The entire sequence takes about 3.4 seconds, and only the two SVG viewBoxes change (no whole-page zoom). Repeated taps remain guarded until the pullback ends. Reduced motion and hidden-tab interruption settle directly to the normal full garden view. Physical-device rendering remains unverified.

## Nursery guide (8.8)
Peach appears below the six nursery pots with an original, locally rendered waving-cat SVG, speech bubble and optional greenhouse link. The link scrolls to the existing greenhouse exterior, not directly to the bouquet builder. No new growth requirements, saved state, third-party requests or changes to the gate, flowers, bouquet or letter. Browser regression includes guide presence, placement and navigation. Physical-device visual confirmation remains pending.

## Original Peach sticker (8.9)
Replaces the 8.8 illustrated stand-in with the two-second Peach Goma Paw Paw sticker shared on Tenor by the account peach_and_goma ([source](https://tenor.com/view/peach-goma-paw-paw-gif-7282002952383683980)). The actual GIF is referenced at its published CDN URL rather than copied into the repository: binary retrieval was unavailable in the editing environment, and no independent artwork redistribution license was established. This is the sole intentional third-party image request, uses no-referrer, and is suppressed for reduced motion. A failed image load hides the sticker without blocking the speech bubble or greenhouse navigation. Browser QA isolates the exact URL using a mock image; real CDN animation, transparency and physical-device appearance require visual confirmation. No other features are changed.

## Individual scene transitions (8.10)
The gate walkthrough still opens and pulls back into the path, but the intro is then hidden and only one of the five garden areas is visible. Explicit navigation replaces anchor scrolling between the path, nursery, greenhouse exterior, greenhouse workbench and bench. Each transition fades the old scene out (240 ms) and the next one in (420 ms), with an instant reduced-motion/hidden-tab path and duplicate-click guard. Back links support revisiting the nursery and bouquet without changing saved growth, bouquet, or letter unlock logic; the closing message is shown only with the final garden. Reload starts at the gate while retaining saved progress. Browser assertions cover scene isolation, scrolling, navigation and the existing functional journey. Physical-device visual verification remains pending.

## Fixed viewport scene shell (8.11)
The 8.10 document was still vertically scrollable even when only one chapter was revealed. 8.11 locks the root document to the dynamic viewport and contains dense nursery, workbench and final-letter content inside their own independent scroll areas. The path and greenhouse exterior fit their illustrations and navigation in the viewport without normal scrolling; an extreme short/zoomed-height accessibility fallback allows only local scrolling. Each chapter starts at its own top, and the closing text is nested inside the final chapter. No other garden rules or scene transitions changed. Browser regression asserts zero document scroll, visible scenic controls and no normal scenic overflow; physical-device verification remains open.
