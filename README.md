# Nico's B1 Season

A study dashboard for one student preparing for the Cambridge **B1 Preliminary (PET)** exam. Styled as a football "player card": the exam skills are rated out of 99, and the card levels up (bronze → silver → gold) as scores improve.

The app is one self-contained file: **`nico-b1-season.html`**. No build step, no install. Beside it sit a few small files that only matter when it is hosted: `index.html` (forwards to the app), `manifest.webmanifest` and the `icon-*.png` files (the home-screen "app"), and `sw.js` (keeps it opening with no signal).

- Student link: **https://pilibread.github.io/nico-b1-season/**
- Teacher view: **https://pilibread.github.io/nico-b1-season/?teacher**

## The tabs

- **Player Card**: the card with Nico's photo, the overall rating (OVR) and one rating per paper, plus the target bars for Listening, Reading and Writing.
- **Match Log**: log one paper at a time (Listening /25, Reading /32, Writing /40, Speaking /20) with an optional test name and a note on how it went. The June 2026 mock is pre-seeded as three rows and can't be deleted.
- **Training**: a list of activities to tick when done today, each with a category; tap a name to rename it, its category to change it, ✕ to remove it (asks first). Below it, a five-week calendar that colours in by how many activities were ticked, a day streak, and a one-line reflection for today. Tap a coloured square to see that day's activities and reflection; a gold dot marks days with a reflection.
- **Vocabulary**: a word bank (word, meaning, example), each marked New / Review / Known, with flashcards and a typing quiz. Words can be added one at a time, from a CSV file, or by pasting cells from a spreadsheet. Each word can carry a part of speech (`pos`, picked from `POS` on the card or when adding) and, for verbs, its other forms written in brackets the way the teacher does it: `know (knew, known)`. `wordForms()` splits that into the head word and its forms, and for anything marked `verb` `formsOf()` adds the third person singular on its own (`thirdPerson()`: means, studies, goes, has; no -s for modals). So the card shows "know" with "knows · knew · known" under it, the quiz accepts any of those forms as correct, and `blankWord()` hides all of them — which is what stops "That means…" from giving the answer away. Entries with brackets are marked `verb` automatically, and the type shows beside the word everywhere it appears.

Starting a deck or a quiz puts it on the screen alone: `enterFocus()` adds `body.focus`, `#trainArea` becomes a fixed full-screen overlay above the header and tabs, and the only other thing on screen is a small ← Back button (`#focusBack`). Back or Escape leaves it and redraws the word list.

Flashcards start either from the word (meaning and example on the back) or from the definition and example together, with the word on the back — remembered in `settings.flashFrom`. Wherever a meaning or example is the question, the word and its forms are blanked by `blankWord()`, which matches whole words only, so "as" doesn't blank the middle of "Almas" and "enjoy" leaves "enjoyable" alone.
- **Practice**: curated practice links by skill, links added in the app, and "Copy my data / Paste to restore".

## How to run it

- **To use:** open the live link. The file also opens straight from disk in a browser, without cloud sync.
- **To edit:** change `nico-b1-season.html` in a code editor and refresh. To preview it as it runs online, serve the folder (`python3 -m http.server 8765`, or the `nico` entry in `.claude/launch.json`) and open `http://127.0.0.1:8765/nico-b1-season.html`. A local preview is connected to Nico's real data, so anything saved there is saved for real.

## File structure

`nico-b1-season.html` has three parts, in order:

1. **`<style>`**: all the design. Colours, spacing and card tiers are CSS variables in `:root {}`. The phone layout is the `/* phones */` block at the end, so it overrides everything above it.
2. **HTML**: the header, the tab bar (`nav.tabs`), one `<section class="panel">` per tab (its `data-panel` matches a tab's `data-tab`), and the day pop-up (`#dayPop`).
3. **`<script>`**: the configuration, the data model, cloud sync, and one render function per part of the page.

## What to edit most often

Near the top of the `<script>`:

- **`SKILLS`**: Listening, Reading and Writing, with their June-mock baseline and the pass / flying-colours targets. The target bars follow these.
- **`PAPERS`**: every paper that can be logged and its maximum mark. Ratings are worked out from these maximums.
- **`TAGS`**: the categories an activity can have.
- **`DEFAULT_SUG`**: the starting Training activities. Only used on a first run with no data.
- **`CURATED`** and **`GROUPS`**: the Practice links and their groups.
- **`DEFAULT_EXAM`**: the fallback exam date (editable in the header on wider screens).
- **`PLAYER_PHOTO`**: the card photo, embedded as a data URI. Set to `""` for a card without one.
- **`FIREBASE_CONFIG`** and **`STUDENT_ID`**: which Firebase project and document the data syncs to.

`DEFAULT_PLAYBOOK` and `DEFAULT_HABITS`, and the CSS sections for habits, homework, reflections and playbook, are left over from removed tabs and are not used.

## How the data works

All state lives in one object, `S`. It is loaded on start, passed through `normalize()` (which fills in defaults and converts older data), and re-saved after every change with `save()`. After changing data the pattern is: mutate `S`, call `save()`, call the relevant `render…()`.

- `examDate`: the target date
- `results[]`: one entry per logged paper: `{id, paper, score, date, name, refl, mock?}`. Older all-in-one rows are split into one row per paper when loaded; an old Speaking score out of 100 is scaled to 20.
- `habits{}`: what was ticked, keyed by date (`"2026-09-13"`) then activity id
- `suggestions[]`: the Training activities, `{id, text, tag}`
- `dayNotes{}`: the reflection text, keyed by date
- `vocab[]`: words, each with `status` = new / review / known
- `resources[]`: links added in the Practice tab
- `settings{}`: currently unused

Data from before the September 2026 redesign also keeps `habitDefs`, `homework`, `reflections` and `playbook`. Nothing reads them, but they stay in the saved data and must stay in the Firestore rules.

Dates are the student's local date (`todayISO()`), not UTC, so an evening tick in Uruguay lands on the right day. Date strings like `"2026-09-13"` become UTC-midnight `Date` objects, so calendar arithmetic uses the `getUTC…` methods throughout.

## Ratings (player card)

A paper's rating = its most recent score (by date) ÷ that paper's maximum × 99. Until a paper is logged, Listening, Reading and Writing use the June mock; Speaking shows "–". The overall (OVR) is the average of the papers that have a rating. Card tier is set in `tier()`: 75+ elite, 65+ gold, 50+ silver, below that bronze.

## Cloud sync (Firebase) and the teacher view

The data is kept in one Firestore document, `students/nico`, in the owner's Firebase project `nico-s-english-training-plan` (free Spark plan).

**Firestore rules.** In the Firebase console, Firestore Database → Rules. The page may read and write that one document, and only with these field names:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/nico {
      allow read: if true;
      allow write: if request.resource.data.keys().hasOnly(
        ['examDate','results','habits','habitDefs','homework','vocab','reflections','resources','settings','playbook','suggestions','dayNotes']);
    }
  }
}
```

**Adding a new top-level key to `S` means adding it to this list first**, then publishing the app. Otherwise the cloud refuses every save and the page shows *Not syncing* until the rules are updated. Nothing is lost meanwhile: saves stay on the device and catch up.

**How it behaves**

- The sync pill in the header shows *Saved on this device* (sync off), *Connecting…*, *Saving…*, *Synced*, *Offline — will sync*, or *Not syncing* (hover for the reason). On phones it is just a coloured dot.
- Every change is saved in the browser first (`localStorage` key `nico_b1_v2`), then sent to the cloud a moment later. Changes from another device arrive live and redraw the page.
- When the browser copy and the cloud copy differ, **the cloud copy wins**. If the cloud is empty, the browser's data is sent up.
- The Claude-artifact version can't reach Firebase (its sandbox blocks the connection). To move data from it: *Copy my data* there, *Paste to restore* here.
- No login. Anyone with the address can read and change the data, which is why it holds only a first name, a photo and study data.

**Teacher view.** Open the page with `?teacher` on the end. It shows Nico's live data with a gold bar across the top. Everything is read-only — every form, tick box, ✕ and category dropdown is hidden or disabled — except the Vocabulary tab's two ways of adding words (one at a time, or from a spreadsheet), so the teacher can stock the word bank from her own device. Words can only be added there, not removed or re-marked. The calendar pop-up still opens, which is where the teacher reads reflections. The browser then remembers the teacher view (`localStorage` key `nico_teacher`), so a home-screen shortcut keeps it; `?student` goes back to the normal view. This is a convenience, not a lock.

## On a phone

Add the live link to the home screen: on iPhone, Safari's share button → **Add to Home Screen**; on Android, Chrome's menu → **Add to Home screen** (or **Install app**). It gets the gold **B1** icon, opens full-screen, and opens with no signal, syncing when the connection returns.

- `manifest.webmanifest` and the `<meta>` tags at the top of the HTML describe the "app" (name, icon, colours).
- `sw.js` is a service worker. It fetches from the network first and asks the server whether a file changed (`cache: "no-cache"`), so a new version shows on the next online open. GitHub Pages would otherwise let browsers reuse an old copy for 10 minutes. The saved copy is only used offline. Firebase and fonts are never intercepted. If its file list changes, bump `CACHE`.
- Under 640px wide: the header is one row (the exam date input is hidden), tabs use short names (Card, Log, Training, Words, Practice), forms are one field per row, Match Log results are stacked blocks, an activity's category sits under its name, and text boxes are 16px so tapping one doesn't zoom the page.

## Publishing a change

The site is served by GitHub Pages from `main` in `pilibread/nico-b1-season`. Commit and push; GitHub rebuilds in about a minute:

```bash
git add -A && git commit -m "what changed" && git push
```

## Notes

- Target marks are a working guide, not Cambridge's official raw-to-scale conversion (that scaled score isn't published). Roughly 60% of a paper's marks ≈ pass zone; about 75%+ ≈ a strong pass.
- The typeface is **Lexend**, chosen because it's designed to reduce reading effort. Headings use Saira Condensed.
