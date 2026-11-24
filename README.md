# The Garden We Grew

Prototype 02 — interactive garden journey, shared flower growth and bouquet mechanics. The visual direction is provisional, not a finished gift.

## Open the prototype

Static site; no install, no build, no server-side service. To publish, enable **Settings → Pages → Deploy from a branch → main / (root)** if Pages is not already enabled. Then open the GitHub Pages URL shown in Settings. For local review, open index.html in a modern browser or serve the repository using a local HTTP server.

## What works in this prototype

- Six seed varieties; plant, water four times, reveal a placeholder message at bloom.
- A single deterministic original SVG flower renderer used in both pots and the bouquet.
- Add bloomed flowers, reorder or remove them; choose greenery, paper and ribbon.
- Local state persistence; start-over confirmation.
- Native SVG download and attempted PNG conversion with SVG fallback.
- Responsive layout, native touch/click/keyboard controls and reduced-motion CSS.
- No analytics, external fonts, remote artwork, backend or paid API.

## Personalize

Edit only [garden-text.js](garden-text.js) for ordinary writing. Keep object keys and punctuation, and change quoted values. It is fetched with a fresh URL on startup to avoid stale text. Do not add sensitive information to the public repository.

## Review checklist

Test the complete plant-to-bouquet flow, reload persistence, each flower appearance, touch targets and keyboard controls, PNG and SVG downloads (particularly iOS Safari), narrow viewport layout, reduced motion, and fresh personal text changes. Code-level tests do not establish real-browser compatibility.

The gate opens to reveal a continuous scrollable journey: progress-responsive garden path, nursery, greenhouse illustration, bouquet builder and bench beneath a tree. The tree blooms as the six flowers are grown, and the final placeholder letter unlocks only when all six reach bloom. Petals and fireflies are limited to their scenes, paused offscreen and when the tab is hidden, and removed for reduced motion. This is a first scenic pass, not finished art or cinematic growth. Free dragging, full wrapping animation, optional audio and journal remain pending or unapproved. See the project continuity record for research and source decisions.

Prototype 02 adapts the MIT-licensed yZhanWeather motion techniques in scoped CSS; no third-party artwork or full runtime bundle is distributed. See THIRD_PARTY_LICENSES.md for the retained source selection and prototype boundaries.
