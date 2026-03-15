# Concept Card Curation Workflow

This workflow is designed for growing board-focused and corridor-focused concept cards from small starter decks and Rhoton textbook chapters.

## Card quality standards

Use these standards for every card before publishing:

1. **Single concept per card**
   - One testable learning objective per card.
   - Split multi-fact note cards into separate cards.

2. **Clean formal answer style**
   - Keep answers concise, but written as complete, public-facing statements.
   - Prefer: `Most likely diagnosis: Chordoma.` over shorthand-only bullet fragments.

3. **Prompted image cards**
   - Every image card should have a front prompt (example: `Identify the diagnosis shown.` or `Name the key landmark shown.`).
   - If no custom prompt is available, use a standard fallback prompt.

4. **Source traceability**
   - Add a source tag to each card (deck name, chapter, and page/figure when available).

5. **Duplicate control**
   - Detect exact and near-duplicate cards before merge.
   - Keep one canonical card and merge unique details.

## Suggested taxonomy

Use category + corridor tags so one card can be discovered multiple ways:

- `category`: anatomy, radiology, pathology, clinical, surgical, surgical-steps
- `corridors`: one or more corridor ids (`corridor-3`, `corridor-8`, etc.)
- `stage`: `board-memorize`, `core`, `advanced`

This supports your current category UI while allowing progressive growth from high-yield board content.

## Most efficient processing loop

1. **Ingest small batch (20-40 cards)**
   - Start with the board-memorize deck (high-value and manageable).

2. **Normalize**
   - Rewrite answers into formal concise style.
   - Add/standardize front prompts.
   - Map each card to category + corridor.

3. **Deduplicate**
   - Run duplicate pass against existing cards.
   - Resolve conflicts immediately to avoid debt.

4. **Publish and review**
   - Merge batch.
   - Spot-check card display and category filters.

5. **Expand from chapters**
   - For each chapter, extract concepts (not Q/A stems), then map to existing categories/corridors.
   - Add surgical-steps cards when a chapter includes reproducible procedural sequences.

## Practical cadence

- **Weekly:** 1-2 small batches from memorize deck.
- **Biweekly:** 1 chapter extraction batch.
- **Monthly:** duplicate sweep + taxonomy cleanup.

This keeps quality high and prevents massive cleanup later.

## Tag model for source decks (boards vs rhoton)

To support source tracking without changing the current category tabs, add an optional `tags` array on each card.

Example:

```json
{
  "front": "Identify the most likely diagnosis on this image.",
  "back": "Most likely diagnosis: clival chordoma.",
  "cat": "radiology",
  "tags": ["source:boards", "corridor:3", "stage:core"],
  "frontImgs": ["concept-images/concept-3.jpg"]
}
```

Recommended conventions:

- `source:boards` or `source:rhoton`
- `corridor:3`, `corridor:8`, etc.
- `stage:memorize`, `stage:core`, `stage:advanced`

Why this fits the UI:

- Keep existing category tabs as primary navigation (anatomy/pathology/radiology/clinical/surgical).
- Add a lightweight secondary filter later (chips/dropdown) for tags, starting with `source:*` only.
- Existing cards without `tags` remain valid; tagging can be rolled out incrementally.
