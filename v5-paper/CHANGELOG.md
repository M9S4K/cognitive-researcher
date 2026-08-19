# v5-paper — Changelog (5th iteration)

Built with the Paper design tool, picking up from `v4-figma`. This iteration covers the
**Windows OS branch** of the flow (`os-choice.html` → `windows.html`). No macOS-branch
screen exists yet in this iteration.

## Files
| File | Status | Replaces (v4-figma) |
|---|---|---|
| `os-choice.html` | Modified | `os-choice.html` |
| `windows.html` | New | `setup.html` + `session.html` (merged into one screen) |

No `assets/` folder — image references (`macos-finder-icon.png`, `sync-drive.png`,
`sync-onedrive.png`, `doc-thumbnail-word.png`, `doc-preview.png`) point back to
`../v4-figma/assets/` rather than being copied locally.

---

## `os-choice.html`

- **Font swap**: Inter → Mona Sans (falls back to Inter).
- **Layout**: fixed flex-centered column → `.choice-screen` with explicit clamped
  padding, `min-width: 760px` + `overflow-x: auto` (no longer wraps on narrow viewports,
  scrolls instead).
- **Heading**: copy changed from "Please choose the OS you're comfortable with" to
  "Please choose the OS<br>you're most comfortable with" (explicit line break, tighter
  letter-spacing `-0.035em`).
- **Options row**: `justify-content: center` with wrap → fixed-width `space-between` row
  (806.59px), no wrap; added a vertical `.divider` between the two options.
- **Windows icon**: renamed `.icon-windows` → `.windows-mark`, precise px grid sizing
  (185.95×185.59, non-uniform gaps) instead of clamp()-based sizing.
- **Mac icon**: renamed `.icon-mac` → `.mac-mark`; added `filter: saturate(0%)`
  (desaturated); path now `../v4-figma/assets/macos-finder-icon.png`.
- **Removed**: the persistent bottom-left `#hint` ("Choose an OS to continue") label.
- **Behavior change (major)**: clicking **Windows** now navigates to `windows.html`
  (previously `setup.html?os=windows`). Clicking **MacOS** no longer navigates — it just
  reveals an inline `.selection-note` ("MacOS selected") and goes nowhere, since there's
  no macOS-branch screen in this iteration yet.
- Buttons switched from `onclick`-style `choose()` calls to `data-os` attributes read by
  a single delegated click listener; added `aria-label`s and a `role="status"` live
  region for the selection note.
- Markup formatting normalized (indented, lowercase `<!doctype html>`, quoted `charset`).

---

## `windows.html` (new)

Simulated Windows desktop that combines what were two separate v4 screens (script
setup + interview session) into one continuous scene with an in-page fake browser
window, rather than separate page navigations.

**Flow implemented:**
1. **Desktop** — six blank desktop folder icons, Windows taskbar (start, search, task
   icons) fixed at the bottom.
2. **Meeting notification** ("Upcoming Meeting in 15 mins — User Interview with Sarah
   Chen") slides in with **Prepare session** / **Dismiss** actions (`Ctrl+Enter` shortcut
   for Prepare).
3. **Script search modal** — search input filters a "Recent" documents list down to a
   single mock result ("ET - interview script"); selecting it shows a PDF-style preview
   pane with pagination and a **Load this Script** action.
4. **Script-selected toast** — floating confirmation ("Script selected — Meeting starts
   in 10 mins") with a **Join meeting** button (`Ctrl+Enter` shortcut).
5. **Fake MS Teams browser window** — scales in from the taskbar icon
   (`transform-origin` animation), full meeting UI chrome (tabs, address bar, Teams
   toolbar, participant strip, sidebar, avatar call stage, **Leave** button).
6. **Draggable research assistant toolbar** ("Rae is taking notes") — appears 500ms
   after joining; shows a numbered question list with a progress bar and a shimmering
   animated title. Clicking the toolbar (not a button) toggles **probing** mode, which
   reveals sub-probe suggestions under the first question and marks the first question
   and first probe as complete (✓). The toolbar can be freely dragged within the browser
   window via pointer events.
7. **Leave call** resets the browser window, taskbar icon, and research toolbar back to
   closed/hidden state.

**Not yet carried over from v4's `session.html`:**
- No insight toast / live insight counter (`insightToast`, `insightBadgeCount` in v4).
- No call-end summary card with stats (duration, question count, insight count —
  `completeCard`, `statDuration`, `statQuestions`, `statInsights` in v4).
- No "View Doc" hand-off into an Insight Doc screen.

**Stack notes:** still plain HTML/CSS/vanilla JS, single file, no build step — consistent
with `CLAUDE.md`. Font is Inter (unlike `os-choice.html`'s Mona Sans switch — the two
screens are currently on different type systems).

---

## Update — v5 is now the default experience

- **Root entry point**: `index.html` now redirects straight to `v5-paper/os-choice.html`.
  The old version picker still exists but is hidden behind `index.html?archive`.
- **Default question set**: **variant 2** (the scripted story). Variant 1 is still there,
  reachable with `?variant=1`. The variant switcher chip no longer renders by default —
  it appears only with an explicit `?variant=` or `?dev=1`.
- **Archived**: `v1-current`, `v2-lofi`, `v3-wireframe` and `v4-figma` moved into
  `archive/`. Nothing deleted; all still runnable.
- **Assets**: the five mock images are now copied into `v5-paper/assets/` and referenced
  locally, so v5 no longer reaches into `../v4-figma/assets/` and does not depend on the
  archived folders.
- **`mac.html` now exists** — the macOS branch of the flow, behaviour-identical to
  `windows.html` (differs only in desktop chrome and the `⌘`/`Ctrl` modifier). The note
  above about "no macOS-branch screen in this iteration" is superseded.
- **Also superseded**: the insight pill/counter, the `Finish Session` button and the
  "Session Complete" summary card (insights / questions / duration + `View insight doc`)
  are all implemented now. `View insight doc` is still inert — there is no Insight Doc
  screen in this iteration.
- **New**: `INTERACTION-PATTERNS.md` — the full behavioural spec for this iteration
  (every trigger, state class, timing and easing). Read that before changing behaviour.

---

## `insight-doc.html` + `insight-doc.js` (new)

Closes the gap this changelog previously listed as missing: *"No 'View Doc' hand-off into an
Insight Doc screen."*

- Built from the Paper artboard **Insight Analysis — V2 Focus Sheet**: marker rail, single reading
  column, floating player pill, and an evidence sheet that is scoped to the selected moment rather
  than being a permanent transcript column.
- 12 insights across 4 sections (Background, Work & Studies, Tools, Challenges), each with its own
  evidence excerpt. Selecting an insight swaps the sheet, moves the playhead and re-marks the rail.
- `Esc` returns to the call on whichever OS branch is stored in `rae-os`.

## `windows.html` / `mac.html`

- **View insight doc** is no longer inert: it gets `id="view-doc"` and navigates to
  `insight-doc.html`.
- `Ctrl/⌘ + ↵` opens the doc while the Session Complete card is up. The new branch is placed ahead
  of the existing chord handlers so the same keypress cannot also re-trigger Prepare session or
  Join meeting.

### Content reworked around the script (follow-up)

The doc originally carried invented content unrelated to the questions the assistant asks. It now
analyses the script that was actually run:

- `ANALYSES` is keyed by variant. Sections **are** the four questions from `QUESTION_SETS`, one per
  question, with the question printed verbatim under each section head.
- Variant 2 (default): a UX designer six years into agency work doing an MSc in London —
  Introduction / Studies / Work experience / Where she's from. Q3 is labelled *reworded by Rae
  mid-session*, and an insight in section 01 is the moment she says "UX designer", which is what
  triggers that rewrite during the call.
- Variant 1 kept in step: A typical day / Current project / Tools / Challenges.
- Probe-derived insights cite the probe number (`· probe 2.1`) from the "Consider probing" card.
- `windows.html` / `mac.html` carry a pinned `?variant=1` into the doc, and `Esc` carries it back.
  The default is deliberately left off the URL so returning does not switch on the dev variant chip.

### Rebuilt against the current artboard (correction)

The first pass was built from an earlier revision of the V2 screen, not from `172-0`. Rebuilt from
the current design:

- **Marker rail removed.** The section rail is gone; the scrubber's labels carry that job instead.
- **Player moved to the head of the document** as a white card, with the section labels and ticks on
  the scrubber. Ticks sit at each section's true start; labels are nudged apart when two sections
  are close together in time, so they never overprint (variant 2's first two sections are 3½ minutes
  apart and did collide).
- **Page title** "User Interview with Sarah Chen", and **Summary** promoted to its own heading with
  the eyebrow beneath it.
- **Selected insight** is now a white card with a black spine and the timestamp as a pill in the
  lane beside it, rather than a bold row.
- **The panel is the interview transcript**, not a scoped evidence sheet: one continuous run of
  turns built from every insight's evidence with shared turns deduplicated. Selecting an insight
  scrolls to its cited line and highlights it. Its edges are masked so partly-scrolled turns fade
  rather than hitting the chrome.
- Type scale raised throughout to match the artboard.

Content is unchanged — still one analysis per question set, keyed by variant.
