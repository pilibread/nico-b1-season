# Nico's B1 Season

A single-page study dashboard for one student preparing for the Cambridge **B1 Preliminary (PET)** exam. Styled as a football "player card": the four exam skills are rated out of 99, and the card levels up (bronze → silver → gold) as scores improve.

Everything is one self-contained file: **`nico-b1-season.html`**. No build step, no install, no internet needed except the Google Fonts link. Open it in a browser to use it, or in any text editor to change it.

## How to run it

- **To use:** double-click the file, or open it in a browser.
- **To edit:** open it in a code editor, change the file, refresh the browser.
- The student's data (scores, words, habits, homework) is saved by the browser itself (`localStorage`) under the key `nico_b1_v2`. Without cloud sync it stays on that one computer/browser. The **Practice** tab has a "Copy my data / Paste to restore" backup for moving to another device.
- With cloud sync turned on (see below) the same data is also kept in Firebase, so every device shows the same thing and the teacher can follow along live.

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

## Cloud sync (Firebase) and the teacher view

The app can keep its data in one Firestore document, `students/nico`, in a Firebase project that belongs to the owner. It is off until a config block is pasted in.

**Turning it on**

1. In the [Firebase console](https://console.firebase.google.com) create a project (Google Analytics can be off), then **Build → Firestore Database → Create database** in production mode.
2. In Firestore's **Rules** tab, replace the rules with the block below and publish. It allows the page to read and write that one document and nothing else, and only with the app's own field names.
3. **Project settings → Your apps → Web (`</>`)**, register the app, and copy the `firebaseConfig` block.
4. In `nico-b1-season.html`, replace `const FIREBASE_CONFIG=null;` with `const FIREBASE_CONFIG={ …the block… };`. The client config is not a secret; it is fine to commit.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/nico {
      allow read: if true;
      allow write: if request.resource.data.keys().hasOnly(
        ['examDate','results','habits','habitDefs','homework','vocab','reflections','resources','settings']);
    }
  }
}
```

**How it behaves**

- The pill in the header says what is happening: *Saved on this device* (sync off), *Connecting…*, *Saving…*, *Synced*, *Offline — will sync*, or *Not syncing* (hover it for the reason).
- Every change is saved in the browser first, then sent to the cloud a moment later. Changes from another device arrive live and redraw the page.
- Whenever the browser copy and the cloud copy differ, **the cloud copy wins**. If the cloud is empty, the browser's data is sent up (this is how existing data migrates on first run).
- Moving data from the Claude-artifact version: use *Copy my data* there and *Paste to restore* in the hosted version. Restore now applies without reloading, so the paste reaches the cloud.
- The page must be hosted outside the Claude artifact (GitHub Pages, Netlify): that sandbox blocks the connection to Firebase. The same file still works inside the artifact; it just stays local and the pill says *Not syncing*.
- No login. Anyone who has the page's address can read and change the data, which is why it holds only a first name and study data. Firestore's free plan is more than enough for one student.

**Teacher view**: open the same page with `?teacher` on the end of the address (for example `…/nico-b1-season.html?teacher`). It shows Nico's live data with a gold bar across the top. Every edit control is hidden except the Homework tab, so the teacher can set and tick homework from her own device. This is a convenience, not a lock: the address without `?teacher` is the full app.

## Publishing / updating the live version

The live page is served by GitHub Pages from this repository (`pilibread/nico-b1-season`, branch `main`):

- Student link: **https://pilibread.github.io/nico-b1-season/**
- Teacher view: **https://pilibread.github.io/nico-b1-season/?teacher**

`index.html` only forwards to `nico-b1-season.html`, keeping `?teacher`. To publish a change, commit it and push to `main`; GitHub rebuilds the site in about a minute:

```bash
git add -A && git commit -m "what changed" && git push
```

The older Claude-artifact link still works from the same file, but without cloud sync (that sandbox blocks the Firebase connection, so the pill there says *Not syncing*). File downloads are also blocked there, which is why backup uses copy-to-clipboard instead of a download button.

## Notes

- Target marks are a working guide, not Cambridge's official raw-to-scale conversion (that scaled score isn't published). Roughly 60% of a paper's marks ≈ pass zone; about 75%+ ≈ a strong pass.
- The typeface is **Lexend**, chosen because it's designed to reduce reading effort — relevant for this student.
