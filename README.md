# The Garden We Grew

Prototype 04 — greenhouse workbench, flower selection tray and animated bouquet wrapping. The visual direction is provisional, not a finished gift.

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

## Review checklist

Test the complete plant-to-bouquet flow, reload persistence, each flower appearance, touch targets and keyboard controls, PNG and SVG downloads (particularly iOS Safari), narrow viewport layout, reduced motion, and fresh personal text changes. Code-level tests do not establish real-browser compatibility.

The gate opens to reveal a continuous scrollable journey: progress-responsive garden path, nursery, greenhouse illustration, bouquet builder and bench beneath a tree. The tree blooms as the six flowers are grown, and the final placeholder letter unlocks only when all six reach bloom. Petals and fireflies are limited to their scenes, paused offscreen and when the tab is hidden, and removed for reduced motion. The nursery now interpolates stem, leaf, bud and bloom geometry on watering, with a bounded per-pot animation and an instant reduced-motion route. Prototype 04 adds an original greenhouse interior, selection tray, tiered bouquet composition and animated paper folds/ribbon reveal. Free dragging, final scenery/detail refinement, optional audio and journal remain pending or unapproved. See the project continuity record for research and source decisions.

Prototype 02 adapts MIT-licensed yZhanWeather motion techniques. Prototype 03 adapts BLOOM° petalPath and smoothClosed from its MIT-licensed procedural botany code; the project retains the license and uses local palettes, fixed stage state, and bounded sampling. No full upstream runtime or external artwork is distributed. See THIRD_PARTY_LICENSES.md for the retained source selection and prototype boundaries.
