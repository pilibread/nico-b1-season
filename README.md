# Nico's B1 Season

A single-page study dashboard for one student preparing for the Cambridge **B1 Preliminary (PET)** exam. Styled as a football "player card": the four exam skills are rated out of 99, and the card levels up (bronze → silver → gold) as scores improve.

Everything is one self-contained file: **`nico-b1-season.html`**. No build step, no install, no internet needed except the Google Fonts link. Open it in a browser to use it, or in any text editor to change it.

## How to run it

- **To use:** double-click the file, or open it in a browser.
- **To edit:** open it in a code editor, change the file, refresh the browser.
- The student's data (scores, words, habits, homework) is saved by the browser itself (`localStorage`) under the key `nico_b1_v2`. It stays on that one computer/browser. The **Practice** tab has a "Copy my data / Paste to restore" backup for moving to another device.

## File structure

The file has three parts, in order:

1. **`<style>` (top)** — all the design. Colours, spacing and the card tiers are CSS variables in the `:root {}` block. Change a colour once there and it updates everywhere. The theme is a committed dark look.
2. **HTML (middle)** — the header, the tab bar (`nav.tabs`), and one `<section class="panel">` per tab. Each panel has a `data-panel` name that matches a tab's `data-tab`.
3. **`<script>` (bottom)** — the logic: the data model, and one render function per tab.

## What to edit most often

Near the top of the `<script>` are plain config objects — these are the safe things to change:

- **`SKILLS`** — the exam papers, their max marks, the June-mock baseline, and the pass / flying-colours targets. Change a target here and the goal bars and player-card ratings follow.
- **`DEFAULT_HABITS`** — the starting weekly habits (the student can also edit habits live in the Training tab).
- **`CURATED`** — the practice links shown in the Practice tab (`skill` decides which group each one falls under).
- **`GROUPS`** — the practice-tab categories and their colours.
- **`DEFAULT_EXAM`** — fallback exam date (the date is also editable in the header).

## How the data works

All state lives in one object, `S`, loaded from `localStorage` on start and re-saved after every change via `save()`. Its shape:

- `examDate` — the target date
- `results[]` — every logged practice test (the June mock is pre-seeded and can't be deleted)
- `habits{}` — ticks, keyed by date then habit id
- `habitDefs[]` — the editable list of habits
- `homework[]` — tasks with due dates
- `vocab[]` — words, each with `status` = new / review / known
- `reflections[]` — the "what went wrong" entries
- `resources[]` — links the user added
- `settings{}` — e.g. bigger-text toggle

Each tab has a matching `render…()` function that redraws it from `S`. After changing data, the pattern is: mutate `S`, call `save()`, call the relevant `render…()`.

## Ratings (player card)

A skill's rating = its latest logged score ÷ max × 99. The overall (OVR) is the average of the skills that have a score. Card tier is set by OVR in `tier()`: 75+ elite, 65+ gold, 50+ silver, below that bronze. Speaking shows "–" until a Speaking score is logged.

## Publishing / updating the live version

The shared link is a Claude artifact. To push a new version to the same link, ask Claude to republish this file. The one difference on the live (published) page: file downloads are blocked in that sandbox, which is why backup uses copy-to-clipboard instead of a download button.

## Notes

- Target marks are a working guide, not Cambridge's official raw-to-scale conversion (that scaled score isn't published). Roughly 60% of a paper's marks ≈ pass zone; about 75%+ ≈ a strong pass.
- The typeface is **Lexend**, chosen because it's designed to reduce reading effort — relevant for this student.
