# Project: Nico's B1 Season

Context file for continuing this project in Claude Code. Read this first.

## What this is

A single-page study dashboard for one private student, **Nico**, preparing for the
Cambridge **B1 Preliminary (PET)** exam (target: mid-2027). It is styled as a football
"player card" — the four exam skills are rated out of 99 and the card levels up
(bronze → silver → gold) as scores improve. The goal is minimal friction for the
student to track his own progress and stay motivated.

The whole app is one self-contained file: **`nico-b1-season.html`** (HTML + CSS + JS,
no build step, no dependencies except the Google Fonts link). `README.md` documents
the file structure and data model in detail — read it before editing.

## Owner preferences (apply to all work here)

- Direct, factual writing. No praise or filler.
- Interface language: English. Typeface is Lexend (chosen for readability).
- Keep it as ONE HTML file unless we deliberately decide otherwise.
- The student is a minor: store only his first name and study data. No other personal identifiers.

## Baseline data (do not lose)

- June 2026 mock (pre-seeded, not deletable): Listening 9/25, Reading 5/32, Writing 23/40.
- Reading is the weakest area and the first priority.
- Working target guide (not Cambridge's official scaled conversion): ~60% of a paper = pass zone,
  ~75%+ = strong pass. Per-paper targets live in the `SKILLS` config object in the script.

## Current features (built)

Tabbed app: Player Card, Season Plan, Match Log (results), Training (editable weekly
habits), Homework, Vocabulary (bank + flashcards + quiz), Post-Match (reflections),
Playbook (strategy checklists), Practice (curated + custom links, plus data backup).
State is saved in the browser via `localStorage` under key `nico_b1_v2`, and, once
`FIREBASE_CONFIG` is filled in, mirrored to the Firestore document `students/nico`
(live, both directions; cloud wins on conflict). `?teacher` on the URL gives the
read-only teacher view (Homework stays editable). See README, "Cloud sync".

## Roadmap / next steps (in priority order)

1. **Cloud sync with Firebase + teacher view** — BUILT (2026-09-05), waiting only for
   the owner to create the Firebase project and paste the config block into
   `FIREBASE_CONFIG` (plus the Firestore rules in the README). Original plan kept below.
   - Why: `localStorage` keeps data on one device only. The teacher needs to see the
     student's progress from her own devices.
   - Plan: wire the same HTML file to Firebase (Firestore or Realtime Database).
     Student uses it with **no login** — data syncs to the cloud under a fixed student
     ID embedded in the app. A separate read-only **teacher view** shows his live data.
   - Cost: Firebase **Spark (free)** plan is enough; no card, no billing risk.
     Owner will create the Firebase project under her Google account and paste the
     config block; the client config keys are safe to commit in a client-side app.
   - On first run, migrate any existing `localStorage` data into the cloud so nothing is lost.
   - Constraint: this version must be hosted OUTSIDE the Claude artifact. The artifact
     sandbox blocks external data connections (Firebase calls). Host on GitHub Pages or
     Netlify instead.

2. **Hosting on GitHub Pages** (or Netlify) — needed for step 1, and gives a stable URL.

3. **Phone "app" polish (PWA)** — once self-hosted (so we control the page `<head>`):
   add a web app manifest, `apple-touch-icon`, `theme-color`, and
   `apple-mobile-web-app-capable` so "Add to Home Screen" gives a custom icon, opens
   full-screen, and (optional) works offline via a service worker.
   Note: on the current Claude-hosted link, "Add to Home Screen" already works but
   without a custom icon / full-screen — those need self-hosting.

4. **Mobile refinements** — the layout is already responsive; the habit grid scrolls
   horizontally on narrow screens, which is acceptable but could be made friendlier.

## Working notes

- The file now carries its own `<meta charset>` and viewport tags; the Claude artifact
  wrapper used to supply them, a plain host does not.
- To preview locally, serve the folder (`.claude/launch.json` runs Python's http.server
  on port 8765) and open `nico-b1-season.html`; a `file://` open works too but the
  in-app browser can't inspect it.
- `.gitignore` is not needed: there is no build output.

## Data model (summary — see README for detail)

All state is one object `S`, loaded from `localStorage` on start, re-saved via `save()`
after every change. Keys: `examDate`, `results[]`, `habits{}`, `habitDefs[]`,
`homework[]`, `vocab[]`, `reflections[]`, `resources[]`, `settings{}`.
Each tab has a `render…()` function. Pattern for any change: mutate `S` → `save()` →
call the relevant `render…()`. When adding Firebase, keep this shape and sync `S`.

## Live version

Currently also published as a Claude artifact (private link the owner can share).
The artifact is the browser/no-setup version; the Firebase version will be the
self-hosted one. Keep both working from the same source where practical.
