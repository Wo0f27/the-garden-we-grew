# Version 9 — Garden expansion

Status: research first; implementation and production merge not approved.
Baseline: Version 8.20, 6245f712d34ed96200ab8f7ad47643395b710a79. Production branch: main. Development branch: v9-expansion.

## Owner-approved scope
Develop the expansion independently; research new rendering techniques and freely licensed assets before integrating them with the existing procedural botanical system. Retain the original gift, its six flower messages and anniversary letter, and preserve saved progress and bouquets.

## Research gate
For each candidate, record canonical source, pinned revision, license and required attribution, species/parts supported, editable geometry or palette capability, visual match, expected mobile rendering cost, integration method, and limitations. Distinguish reference-only sources from redistributable assets. Do not import new dependencies or assets before owner review. Prefer self-contained vector geometry, no paid APIs, and no new runtime remote dependencies.

## Proposed sequence (subject to review)
1. Audit existing BLOOM-derived renderer and source licenses; scout alternate procedural flower engines and botanical SVG assets.
2. Evaluate color variants, independent per-stem color, and seed-to-bloom geometry for additional species. Present a shortlist, not a final selection.
3. Design a backward-compatible catalog and save migration. Keep the original six as a fixed anniversary set independent of the expanded catalog. Separate optional extended nursery progress from the original letter gate. Preserve existing stem IDs and placements.
4. Prototype an approved subset of flower colors/species, then assess mobile rendering and PNG/SVG export; expand foliage and floristry only after review.
5. Validate with legacy save fixtures, fresh saves, original text, all-six unlock, repeated stems, mobile preview/export, and physical phone review. No production merge until explicitly approved.

## Isolation
Do not modify main, publish experimental builds to the existing production URL, or overwrite production browser storage during preview testing. Any later preview should use a separate origin or an explicitly separate storage key; migration must copy rather than destructively modify original state. Owner approval required before merging or changing the live deployment source. Existing main remains untouched by this planning commit.
