# Project: Nico's B1 Season

Context file for continuing this project in Claude Code. Read this first, then `README.md`,
which documents the tabs, configuration, data model, sync, rules and phone behaviour in detail.

## What this is

A study dashboard for one private student, **Nico**, preparing for the Cambridge
**B1 Preliminary (PET)** exam (target: mid-2027). Styled as a football "player card": each
paper is rated out of 99 and the card levels up (bronze → silver → gold) as scores improve.
The goal is minimal friction for the student to track his own progress and stay motivated.
The owner is his teacher and has no programming experience: explain in plain terms.

Live at https://pilibread.github.io/nico-b1-season/ (teacher view: add `?teacher`).
Repo `pilibread/nico-b1-season`, GitHub Pages from `main`. Publishing = commit + `git push`.

## Owner preferences (apply to all work here)

- Direct, factual writing. No praise or filler.
- Interface language: English. Typeface is Lexend (chosen for readability).
- Keep the app ONE HTML file, `nico-b1-season.html`. The deliberate exceptions (decided
  2026-09-05) are the hosting files beside it: `index.html`, `manifest.webmanifest`,
  `icon-*.png`, `sw.js`.
- The student is a minor: store only his first name and study data. The owner chose, knowingly,
  to add his photo to the public card (2026-09-05). No other personal identifiers.

## Baseline data (do not lose)

- June 2026 mock, pre-seeded as three non-deletable Match Log rows: Listening 9/25,
  Reading 5/32, Writing 23/40.
- Reading is the weakest area and the first priority.
- Working target guide (not Cambridge's official scaled conversion): ~60% of a paper = pass
  zone, ~75%+ = strong pass. Targets live in `SKILLS`; maximum marks in `PAPERS`
  (Listening 25, Reading 32, Writing 40, Speaking 20).

## Current state (2026-09-13)

Five tabs: Player Card, Match Log (one paper per entry, with a note), Training (tickable
activities with editable categories, five-week calendar with day pop-ups, streak, daily
reflection), Vocabulary (word bank, flashcards, quiz), Practice (links, data backup).
Firebase sync, teacher view (read-only except adding vocabulary), PWA and phone layout
are all built and live.
No open roadmap items.

## Things that bite

- **Firestore rules list every top-level key of `S`.** Adding a key without adding it to the
  rules (console → Firestore → Rules; block in README) makes every save fail. Ask the owner to
  publish the new rules BEFORE pushing the code. Legacy keys (`habitDefs`, `homework`,
  `reflections`, `playbook`) stay in the data and must stay in the rules.
- **Dates:** `todayISO()` is the local date (owner and student are in Uruguay, UTC−3).
  `new Date("YYYY-MM-DD")` is UTC midnight, so calendar maths must use `getUTC…`/`setUTC…`.
- **`normalize()` runs on cloud data too** (cloud wins on conflict). Data-shape changes need a
  migration there, idempotent and with stable ids, since several devices may run it.
- **Testing against real data:** a local preview syncs with Nico's live document. Don't save
  test data; if a save is needed to verify something, make a change and revert it.
- **Phone CSS is the `/* phones */` block at the END of `<style>`** so it overrides the rest.
  Check at 375px and 320px wide; boxes stay 16px there to avoid iOS zoom on focus.
- `DEFAULT_PLAYBOOK`, `DEFAULT_HABITS` and the habits/homework/reflections/playbook CSS are
  unused leftovers from removed tabs. The Practice tab's backup text still mentions homework.
- `git push` from this session has sometimes been blocked by the permission classifier; the
  remote is HTTPS through the `gh` credential helper. If blocked, give the owner the command.

## Working notes

- Preview: `.claude/launch.json` entry `nico` runs `python3 -m http.server 8765`; open
  `http://127.0.0.1:8765/nico-b1-season.html`. The in-app browser can't inspect `file://`.
- After a push, the Pages build takes ~40s; check
  `gh api repos/pilibread/nico-b1-season/pages/builds/latest`.
- The Claude-artifact copy of the page still exists (private link) and runs the same file
  without sync.
