# v5.1-paper — Interaction Patterns

**v5.1 is the Windows branch only.** There is no `os-choice.html` and no `mac.html`; the entry
point is `windows.html` and the root `index.html` redirects straight to it. `v5-paper` is frozen
beside it as the build the P21–P25 sessions were run on. Everything below describes v5.1; a
**§13** at the end records what changed and which session finding drove it.

Reference spec for the **default experience** of this prototype. Written for whoever (human
or agent) works on it next: it describes every interaction, its trigger, its timing, and the
class/state it flips, so behaviour can be extended without reverse-engineering the source.

- **Default entry:** root `index.html` → `v5-paper/os-choice.html`
- **Default script:** variant **2** (the scripted story), defined as `SCRIPTS` in `research-toolbar.js`
- **Everything else** (v1–v4, and variant 1) is archived, still runnable, see [Archived routes](#archived-routes)

---

## 1. Files and responsibilities

| File | Responsibility |
|---|---|
| `os-choice.html` | OS picker. Writes `rae-os` to `localStorage`, routes to `windows.html` / `mac.html`. |
| `windows.html` | The whole flow on Windows chrome: desktop → notification → script modal → toast → Teams window → session. |
| `mac.html` | Identical flow on macOS chrome. Only OS chrome and modifier keys differ (see §9). |
| `research-toolbar.js` | The research assistant itself: question sets, all question/probe/insight behaviour, variant logic. Shared verbatim by both OS screens. |
| `insight-doc.html` | The insight analysis. In v5.1 it runs inside an application window on `windows.html` rather than being navigated to. Layout and styling only. |
| `insight-doc.js` | The doc's data and behaviour: one analysis per question set, per-insight evidence, selection, playhead. |
| `assets/` | Local copies of the mock images (Finder icon, sync icons, Word thumbnail, PDF preview). |

**Rule:** anything about *the assistant* belongs in `research-toolbar.js`; anything about *the OS
or the browser window* belongs in the two HTML screens. The two OS screens must stay
behaviour-identical — a change to one needs the same change in the other.

---

## 2. Flow overview

```
os-choice.html
   └─ click Windows / MacOS         → windows.html | mac.html
        desktop (folders + taskbar/dock)
        └─ meeting notification
             ├─ Dismiss             → notification slides out, dead end
             └─ Prepare session     → notification out, 220ms later script modal in
                  └─ type anything  → "Recent" becomes "Results", one mock result, preview opens
                       └─ Load this Script → modal closes, "Script selected" toast in
                            └─ Join meeting → browser window scales up from the taskbar icon
                                 └─ +500ms   → research assistant fades in
                                      └─ scripted beats (§6) → Finish Session → Session Complete
                                           ├─ View insight doc → Insight Analysis app opens on top
                                           │       ├─ Esc / close / minimise → back to the call
                                           │       └─ taskbar icon → reopens it, any time after
                                           └─ Leave → everything resets
```

Every step is a simulation. There is no backend, no parsing, no AI. Fake data is correct.

---

## 3. Desktop layer (per-OS screen)

### Meeting notification
- Visible on load. `#notification`, hidden by adding `.hidden`.
- Windows: bottom-right, exits with `translateX(100% + 40px)`. macOS: top-right, exits with
  `translateY(-100% - 40px)`. 220ms transform / 180ms opacity.
- **Prepare session** → hides notification, then opens the modal after `220ms` (waits out the
  slide) and focuses the search input.
- **Dismiss** → hides notification only. Deliberately a dead end; the shortcut still reopens it.

### Script search modal
- `#modal-backdrop` + `.script-modal`, shown via `.visible`. Backdrop fades 180ms, card rises
  `translateY(12px) scale(.985)` → rest over 220ms.
- **Search is a fake filter with one outcome.** Any non-empty query hides all four "Recent"
  documents, reveals the single `#et-result` ("ET - interview script") pre-selected, flips the
  list label `Recent` → `Results`, and activates the preview pane. Clearing the input restores
  the recent list. Do not add real matching logic — the whole point is one deterministic result.
- Preview pane shows a fake PDF page, `Page 1 of 8` pagination, a bottom fade, and
  **Load this Script**.
- `Escape` closes the modal. `Enter` (with a non-empty query) is the same as Load this Script.

### Script-selected toast
- `#script-selected`, top-centre, `.visible`. Copy: "Script selected / Meeting starts in 10 mins".
- **Join meeting** → hides the toast, marks the browser taskbar icon `.active`, opens the window.

### Browser window
- `#browser-window` opens with `.open`: `transform-origin` is the taskbar/dock browser icon, so it
  grows from `scale(.028, .04)` to `scale(1)` over `560ms cubic-bezier(.22, 1, .36, 1)`.
- Contents are static chrome: tab bar, address bar (a real-looking Teams launch URL), Teams
  toolbar with `00:34` call time, participant strips, avatar `SC` on the stage, **Leave**.
- **Leave** → closes the window, deactivates the taskbar icon, hides the assistant, and calls
  `toolbar.reset()`. Reset must return the assistant to its opening state — question set
  re-rendered, script step 0, insights 0, complete surface off.

---

## 4. Research assistant — anatomy

`#research-toolbar` (a floating card inside the browser window) with two stacked surfaces:

| Part | Element | Notes |
|---|---|---|
| Header | `.toolbar-header` | `--rae-head`, 116px. Kicker "RESEARCH ASSISTANT", shimmering title "Rae is taking notes", the recording chip, the presence switch, "Take notes manually" (still decorative), 4-segment progress bar. Also the drag surface. |
| Recording chip | `.rec-chip` | Pulsing dot + `REC` + `.toolbar-time`. Present in every presence mode. `.toolbar-time` still holds the bare clock, because the complete card reads its text for the duration metric. |
| Presence switch | `.presence-switch` | Three `.presence-btn`s — focus / compact / dock. |
| Compact strip | `.compact-bar` | The whole assistant folded to 448×74. Only rendered in compact mode. |
| Resize grip | `.resize-grip` | Bottom-right corner, focus mode only, appears on card hover. |
| Question list | `.questions` | Scrollable, scrollbars hidden. Rendered from the active question set. |
| Snackbar | `.snackbar` | Timed message at the bottom edge. Replaces the old insight pill (see §13, batch 2). |
| Legend | `.legend` | Popover key for the four question states, opened by `.legend-btn` beside the kicker. |
| Insight counter | `.insight-counter` | Sparkle + running count, bottom-right. |
| `+1` float | `.insight-plus` | One-shot rise-and-fade when an already-visible counter increments. |
| Finish button | `.finish-session` | Hidden until the last question is answered. |
| Complete surface | `.complete-surface` | Swaps in over everything on finish. |

### Question list mechanics
- **Focus scaling:** every `.question` is scaled by its distance from the top of the list —
  `1` at the top falling to `0.833` over `90px` (`QUESTION_MIN_SCALE`, `QUESTION_SCALE_FALLOFF`).
  Recomputed on scroll inside a `requestAnimationFrame`.
- **Active question:** exactly one `.question.active`. Inactive questions dim (number
  `#efefed`/`#aaaaa9`, text `#7e7e7d`).
- **Snap-to-top:** focusing a question animates `scrollTop` over `450ms` with a hand-rolled
  cubic-bézier `(0.74, 0.02, 0.33, 1)` — implemented in JS (`cubicBezierEasing`) because it
  drives scroll position, not a CSS property. Reuse that helper rather than adding a library.
- **Connector line:** `.questions-line` is measured in JS to span the first question number to
  the last, and remeasured on scroll and on any content resize (`ResizeObserver`), because probe
  cards and rewrites change the content height.
- **Answered:** `.answered` → number turns dark with a `✓` that pops
  (`340ms cubic-bezier(0.34, 1.56, 0.64, 1)`), whole row drops to `opacity: .7`.
- **Probe card:** `.probe-card` titled "Probes", animates open via `max-height` when `.revealed`;
  its parent question gets `.expanded` to tighten the gap. Its contents are keyword chips — see
  §13, batch 5.
- **Rewrite:** a question can carry a `rewrite` string. `.rewriting` strikes the original through;
  `.rewritten` then reveals the reworded line beneath it. Reads as Rae restating the question in
  light of what the participant already said.

### Insight choreography
Two moves — keep them distinct, they mean different things:

1. **`showSnack(text)`** — a timed message at the card's bottom edge, held `2600ms`, then gone.
   Messages never queue or morph; a second call replaces the first.
2. **`unlockInsight(n)` / `bumpInsight()`** — the counter appears after `420ms`.
   `unlockInsight` is the first reveal; `bumpInsight` is a straight increment on a counter
   already on screen and plays the `+1` float.

The message and the count are now independent: the snackbar says what happened, the counter says
how much was learned, and neither waits for the other.

### Session complete
- **Finish Session** appears `450ms` after the final question is answered, rising with a slight
  overshoot.
- Clicking it fills the metrics from live state (insight count, `n/n` questions, the header's
  call time), hides the pill, and adds `.session-complete`: the card grows `363px → 417px`, the
  working surface fades out, the complete surface fades in with a check mark, three metrics, and
  **View insight doc**.
- **The summary takes the shape the assistant is already in.** Nothing is forced open: docked it
  fills the column, minimised it stays a strip (`.compact-complete` — the same three numbers and a
  **View doc** button), and floating it grows the card as before. Only
  `.presence-focus.session-complete` changes the height. `showSessionComplete()` fills both sets of
  metrics and re-runs `applyPresence()` so the mode's aria state follows.
- **View insight doc** opens the Insight Analysis application. `Ctrl/⌘ + ↵` does the same while the
  complete card is up — the branch sits ahead of the older chord handlers so finishing the session
  and opening the doc do not both fire.

### Dragging
- Pointer-down on `.toolbar-header` (ignoring buttons) drags the card, clamped inside the browser
  window bounds. Uses `setPointerCapture`.
- Movement over `4px` sets `toolbar.dragState.suppressClick = true`, so releasing a drag does not
  also fire the click that would advance the script. Any new click handler on the card must honour
  this flag.

---

## 5. Scripts

Defined at the top of `research-toolbar.js` as `SCRIPTS`, keyed by variant. A script is five
sections and eighteen questions; **only one section is ever rendered** (`ACTIVE_SECTION_INDEX`,
currently `0`).

```js
{ title: 'ET — interview script',
  sections: [
    { name: 'Introduction',
      questions: [
        { text: 'Question text',
          stamp: '1:41',                             // when it was answered
          rewrite: 'Optional reworded version',      // enables the rewording proposal
          probes: [ { number: '2.1', text: '…' } ] } // enables the "Consider probing" card
      ] },
    …
  ] }
```

Questions are numbered **within their section**, which is why the probe numbers (`2.1`, `2.2`) and
the `SCRIPT_*_INDEX` constants still line up.

Variant **2 is the default**. Section 1 — *Introduction* — carries the scripted story: Tell me
about yourself → What are you studying? (+2 probes) → Do you have any work experience? (reworded)
→ Where are you from?

---

## 6. Variant 2 — the scripted sequence (default behaviour)

Variant 2 does **not** respond to per-question clicking. It plays a fixed story: **one click
anywhere on the white question area advances one beat.** Arrow keys and scroll-to-activate are
disabled; the list gets `.script-mode`.

| # | Beat | What happens |
|---|---|---|
| 1 | `playScriptedSequence` | Q1 is marked answered immediately. After `500ms` Q4 is marked **skipped** — *without* ever becoming the active question — and carries "Skipped · answered at 1:22". `150ms` later the snackbar reads "Q4 was answered earlier — skipped" and **+2** unlocks. After `1400ms` Rae *offers* a reworded Q3 (`.proposing`); it is not applied until accepted. |
| 2 | `focusQuestion(1)` | Q2 snaps into the top slot. |
| 3 | `answerNextQuestion` | Q2 ticks (**+1**), then `300ms` later its probe card opens. |
| 4 | `tickProbe(0)` | Probe 2.1 ticks (**+1**). |
| 5 | `tickProbe(1)` | Probe 2.2 ticks (**+1**). |
| 6 | `focusQuestion(2)` | Q3 (the rewritten one) snaps into the top slot. |
| 7 | `answerFinalQuestion` | Any open rewording proposal is withdrawn, Q3 is marked answered (**+1**), then `450ms` later **Finish Session** appears. |

Total insights at the end: **6**. A `scriptBusy` flag swallows clicks while a beat is still
animating, so the story cannot be raced ahead of itself.

**The point of the sequence:** it demonstrates that Rae is *listening*, not just ticking a list —
it skips a question the participant already answered, rewrites another to fit what it heard, and
surfaces probes at the moment they are useful. Any change to the beats should preserve those three
demonstrations.

To add a beat: add the function to the `scriptBeats` array in order. To change the story
structure, the `SCRIPT_*_INDEX` constants map beats onto positions in the question set — update
both together.

---

## 7. Variant 1 — free-form behaviour (archived, `?variant=1`)

Kept for reference. Here the researcher drives:
- Click a non-active question → it becomes active and snaps to the top.
- Click the *active* question (if it has probes) → it ticks, and `600ms` later the probe card opens.
- Click a probe row → toggles its tick; on tick it runs the full "Qn answered" → "New insight
  unlocked" pill choreography.
- `ArrowDown` / `ArrowUp` move the active question (ignored while typing in an input).
- Settling a scroll for `120ms` makes the nearest question active and snaps it to the top.

---

## 8. Keyboard shortcuts

Modifier is `Ctrl` on `windows.html`, `⌘` on `mac.html`.

| Keys | Context | Action |
|---|---|---|
| `Ctrl/⌘ + ↵` | Notification visible, modal closed | Prepare session |
| `Ctrl/⌘ + ↵` | "Script selected" toast visible | Join meeting |
| `Ctrl/⌘ + ↵` | Finish Session visible | Finish session |
| `Ctrl/⌘ + ↵` | Session Complete card visible | Open the insight doc |
| `Esc` | Insight doc | Back into the call on the OS branch in `rae-os`, keeping any pinned variant |
| `↵` | Modal open with a non-empty query | Load this Script |
| `Esc` | Modal open | Close modal |
| `↑` / `↓` | Assistant visible, variant 1 only | Move the active question |

Shortcut hints are rendered as `<kbd>` chips inside the buttons, so the label and the handler must
be kept in sync.

---

## 9. URL parameters

| Parameter | Effect |
|---|---|
| *(none)* | Default experience: variant 2, no dev affordances. |
| `?variant=1` / `?variant=2` | Pin a question set. Pinning also reveals the variant switcher chip (top-left). On `insight-doc.html` it selects which analysis is shown. |
| `?dev=1` | Reveal the variant switcher without pinning a variant. |
| `?skip=call` | Skip straight into the open Teams window with the assistant visible. Fastest way to work on the assistant. |

Parameters combine: `windows.html?skip=call&variant=1` drops into the call in free-form mode.

---

## 10. Motion and styling conventions

- **Fonts:** Inter on the desktop screens, Mona Sans on `os-choice.html`. (Known inconsistency,
  inherited; unify only deliberately.)
- **Palette:** near-black `#161414` for primary buttons, `#282828` desktop, `#fcfcfa` card,
  greys `#d9d9d9`/`#e1e1e1`/`#efefed` for tracks, ticks and dim states. No accent colour anywhere —
  the design is intentionally monochrome.
- **Easing vocabulary:** `cubic-bezier(0.32, 0.72, 0, 1)` for surfaces sliding in and out,
  `cubic-bezier(0.34, 1.56, 0.64, 1)` for ticks and the finish button (overshoot = confirmation),
  `cubic-bezier(.22, 1, .36, 1)` for the window opening, plain `ease` for fades.
- **Layering:** the pill is `z-index: 0` *behind* the card on purpose. Anything that must read as
  emerging from the card belongs behind it.
- **Reduced motion:** `prefers-reduced-motion` already flattens the pill transitions, the tick
  pops and the title shimmer. New animation must add itself to those blocks.
- **Accessibility carried so far:** `role="status"` / `aria-live` on the pill and the toast,
  `aria-label`s on the drag handle and landmarks, `aria-hidden` on decorative chrome,
  `:focus-visible` outlines on buttons. Keep it at least at this level.

---

## 11. Constraints (from `CLAUDE.md`)

Plain HTML, CSS, vanilla JS. One file per screen, no frameworks, no build step, no backend, no
auth, no real AI. Simulated data throughout. Focus Mode: minimal, calm, one thing at a time,
things appear progressively.

---

## Archived routes

Nothing was deleted. The earlier iterations live under `archive/` and are listed on a hidden
index:

- `index.html?archive` — the version picker (v1 → v5, plus the variant-1 entry points)
- `archive/v1-current/setup.html`, `archive/v2-lofi/launcher.html`,
  `archive/v3-wireframe/desktop.html`, `archive/v4-figma/os-choice.html`
- `v5-paper/windows.html?variant=1` — v5 with the free-form question set

---

## 12. Insight doc (`insight-doc.html` + `insight-doc.js`)

The screen behind **View insight doc**. Built from the Paper artboard *Insight Analysis — V2 Focus
Sheet*. It is a document first: the transcript is not a permanent column, it is evidence you open.

### Layout
Built from the Paper artboard `172-0`. One 1440 composition centred in anything wider; the
transcript panel is pinned to the same grid (`left: max(979px, calc(50% + 259px))`) so it holds its
place beside the document instead of drifting to the window edge.

- **Title** — "User Interview with Sarah Chen", matching the meeting notification copy.
- **Player card** — white card at the head of the document, not a floating control. The section
  labels sit on the scrubber, so the recording doubles as the document's table of contents. Ticks
  are placed at each section's true start; labels start there but are nudged along by
  `layoutLabels()` so two sections close together in time never overprint.
- **Document** — Summary heading, then the eyebrow, then the prose; then one block per question.
- **Transcript panel** — grey header, cream body, footer with **Play from `<stamp>`**. Its top and
  bottom edges are masked so turns fade out rather than colliding with the chrome.

### Insight rows
- Two lanes on every row — a 62px stamp lane and the body — so timestamps hold one column whether
  or not a row is selected.
- Selecting a row: the stamp becomes a filled pill, the body becomes a white card with a black
  spine, the actions strip appears, the playhead moves (300ms,
  `cubic-bezier(0.32, 0.72, 0, 1)`), the scrubber's active section label goes bold, and the
  transcript scrolls to the cited line and highlights it.
- The transcript is **one continuous run of turns**, built once from every insight's evidence with
  shared turns deduplicated — it is the interview transcript, not a per-insight excerpt. Selecting
  an insight moves the highlight through it rather than swapping its contents.
- The row is a `<button>` (`.insight-hit`); the actions below it are separate buttons, so the
  markup stays valid and both are reachable by keyboard.
- **Copy quote** writes the cited line to the clipboard; **Add to theme** is a pure simulation.
  Both confirm by swapping their own label for 1400ms.

### Content — one analysis per question set
The doc analyses **the script that was actually run**, so its four sections are the four questions
in `QUESTION_SETS` (`research-toolbar.js`), one section per question, and every insight under a
section answers that question.

`ANALYSES` in `insight-doc.js` is keyed by variant. Each holds a `summary`, four `sections`
(`{ index, name, question, note? }`) and twelve `insights`. The variant comes from `?variant=`,
defaulting to **2**, so `?variant=1` does not land on an analysis of an interview that never
happened.

| | Variant 2 (default) | Variant 1 |
|---|---|---|
| Participant | UX designer, 6 years agency, MSc HCI in London | Second-year masters student researching game moderation |
| 01 | Introduction | A typical day |
| 02 | Studies | Current project |
| 03 | Work experience | Tools |
| 04 | Where she's from | Challenges |

- The **verbatim question** is printed under each section head (`.section-question`), which is what
  ties the doc back to the script.
- Variant 2's Q3 carries a `note` — *reworded by Rae mid-session* — matching the rewrite the
  assistant performs during the call. An insight in section 01 is the moment she says "UX designer",
  the detail that triggers that rewrite.
- Insights drawn from a probe carry the probe's number in the evidence line
  (`Evidence 5:50 – 6:16 · probe 2.1`), using the same numbering as the "Consider probing" card.
- Each insight holds its stamp, range, sheet heading, text and the three turns around the moment
  with the cited one flagged. The header's insight count is derived from the array, so adding an
  entry keeps the count honest. `DURATION` is 1849s (30:49), the session length on the complete card.

The doc does **not** read live session state — the assistant's counts live only in the OS screen.
It renders a fixed analysis of the same interview, which is consistent with the rest of the
prototype being simulated.


---

## 13. v5.1 changes

Each batch below answers findings from the P21–P25 sessions. The scripted sequence in §6 is
invariant across all of them: Q4 skipped, Q3 reworded, two probes, six insights, Finish Session.

### Batch 1 — Presence and recording assurance
*P21, P23, P25 · HMW06*

**Recording chip.** `.rec-chip` in the header: a dot pulsing on a 2.4s `box-shadow` ring, `REC`,
and the call time. Deliberately monochrome — the palette in §10 has no accent colour, so the pulse
carries the "live", not a hue. It is the one element that survives compact mode, which is the
point: P21 wanted proof the assistant is still listening when it is out of the way.

**Three presence modes.** `.presence-focus` / `.presence-compact` / `.presence-dock` on
`#research-toolbar`, driven by `setPresence(mode, { immediate, remember })` in
`research-toolbar.js` and mirrored onto `document.body[data-rae-presence]` so the OS screen can
react without the assistant knowing anything about the browser window.

| Mode | Shape | Notes |
|---|---|---|
| `focus` | Floating card, `var(--rae-w, 429px)` × `var(--rae-h, 363px)` | The v5 behaviour, still the default. |
| `compact` | 448 × 74 strip | Header, question list, counter, finish button and the snackbar are all `display: none`. See *Compact is a working mode* below. |
| `dock` | Right edge, `top: 189px` to `bottom: 0`, 392px wide | `body[data-rae-presence="dock"] .call-stage { margin-right: 392px }` makes the stage give up the width instead of being covered. |

- Switching **crossfades** (`.presence-switching`, 130ms out, swap, back in). The three modes are
  different shapes; tweening the geometry reads as a glitch.
- Docking clears the inline `left`/`top` the drag wrote and parks them in `floatPosition`, so
  leaving the dock returns the card to where it was floating.
- Dragging is disabled while docked. `makeDraggable()` in `windows.html` is bound to both the
  header and the compact strip.
- The mode persists to `localStorage` under `rae-presence`. **`showSessionComplete()` forces
  `focus` with `remember: false`** — the summary needs the whole card, but it must not overwrite
  the presence the researcher chose.

**Resizing.** `.resize-grip`, focus mode only, sets `--rae-w` / `--rae-h` between 340–620 wide and
300–620 tall and persists them to `rae-size`. The card carries `transition: none` via `.resizing`
for the duration of the drag, and the persisted value is the *requested* size rather than the
measured rect — mid-transition those differ. `.questions` is `calc(100% - var(--rae-head))` and
`.session-complete` is `calc(var(--rae-h) + 54px)`, so every size follows from the two variables.
The complete surface centres itself rather than assuming the 417px it was drawn at.

### Batch 2 — Status vocabulary and script authority
*P22, P23, P24, P25 · HMW03, HMW08*

**Four states, four marks.** The single check mark is retired; `markAnswered()`, `markSkipped()`
and `restoreQuestion()` in `research-toolbar.js` are the only places state is set.

| State | Mark | Why |
|---|---|---|
| Answered | Question struck through, number dims, timestamp fades in | P24 prefers strike-through to a check mark |
| Skipped | Struck through **plus** `Skipped · answered at 1:22` and an **Undo** | A skip is not an ask; the row says which moment it stands on |
| Reworded | `paraphrased` tag on the reworded line | P22 wanted the change legible as a change |
| To ask | Plain | — |

`.legend-btn` beside the kicker opens `.legend`, a four-row key. Each of these marks was queried
by a different participant, so the key is one click away rather than assumed. It closes on outside
click, on `Escape`, and when the session completes.

**Timestamps.** Every entry in `QUESTION_SETS` carries a `stamp`. `.question-stamp` reserves a
42px lane whether or not there is a stamp in it, so a question does not reflow when it gets one —
only the stamp fades. `.question-text` is `flex: 1 1 0%`: the row is `flex-wrap`, and an `auto`
basis makes a long question wrap the stamp onto its own line instead of shrinking.

**Rewrite is a proposal, not an edit.** `proposeRewrite()` only adds `.proposing`, which opens
`.rewrite-proposal` under the question — an eyebrow, the reworded text, **Use this** and **Keep
original**. `acceptRewrite()` is what applies `.rewriting` + `.rewritten`; `keepOriginal()` just
collapses it. A proposal still open when the question is asked is withdrawn by
`withdrawProposal()`. This is P23's condition for letting the assistant touch the script at all:
the original is never edited underneath the interviewer, so the right to skip and reorder stays
with her.

**Every control inside `.questions` must `stopPropagation`** — Undo, Use this and Keep original all
sit on the surface that advances the scripted story. `bindStatusControls()` re-binds them on each
render, alongside `bindQuestionInteractions()`.

**Probes do not use the question marks.** Deliberate: "I used this suggestion" is a different act
from "this question is dealt with". Batch 5 gives them their own — a chip that fills dark.

### Batch 3 — A script with a real shape
*P22, P24, P25 · HMW05*

Four questions on their own read as a warm-up or a partial script to three of the five. The fix is
not to show more, it is to show **how much there is**.

**`QUESTION_SETS` → `SCRIPTS`** (see §5). Section 1 holds the four questions the scripted story
runs on, verbatim and in order, so §6 is untouched.

**Section head.** `.section-head` is the first child of `.questions` and is `position: sticky` at
`top: 0`, so the questions scroll under it and the answer to "where am I?" never leaves the screen:
`SECTION 1 OF 5 · Introduction · 2 of 4`. Because it is sticky, **the list no longer has a top
padding** — `listOffset()` returns the head's height, and both `updateQuestionScales()` and
`scrollQuestionToTop()` measure the top slot from it. Anything that changes the head's height must
go through `listOffset()`, not a hard-coded padding.

**Upcoming sections.** `.upcoming` lists every later section by name and question count under
*"Later in this script · 18 questions in all"*. It is a scope indicator, not navigation — nothing
in it is clickable. When the current section completes, the next row takes `.is-next`.

**The progress bar is real.** `.question-progress` is rebuilt by `renderProgressSegments()` with
one segment per section. `updateProgress()` fills past sections solid, the current one by
`answered / total` as a hard-stop gradient (the same idiom the old static bar used), and future
ones empty. It runs from `markAnswered()` / `markSkipped()` / `restoreQuestion()`, so nothing can
change a question's state without the bar following.

**Section completion.** The counter flips to `4 of 4 · done` and darkens, the segment fills, the
next row lights up, and a snackbar reads *"Section 1 complete · Current work is next"* — P25's
"section 1 of 5 complete", not scroll position. Guarded by `sectionAnnounced` so it fires once.

**Known limits, deliberate:**
- The demo does not advance into section 2. The scripted story ends at **Finish Session**, and
  section 2 exists to make the scope legible, not to be run.
- The complete card still reports `4/4` questions — the ones this session actually put on screen.
  The section head carries the 1-of-5 scope; the metric does not repeat it.
- `.has-finish` on the toolbar lifts the snackbar clear of the Finish Session button, which shares
  the bottom edge.

### Compact is a working mode, not a badge (follow-up to batch 1)

The first cut of the strip showed a truncated question and did nothing but expand. Minimised has
to stay usable, so the strip carries the same three jobs the card does:

- **Where you are** — `.compact-meta` reads `Q3 · Section 1 of 5 · 4 of 4`, and
  `.compact-question` clamps to **two lines** (`-webkit-line-clamp: 2`) with the full wording on
  a `title`. 448px is set so the longest line in the script — the reworded Q3 — still reads in
  those two lines rather than being cut after five words.
- **Advancing** — clicking `.compact-copy` runs `advanceScript()`, the same beat the question list
  advances. It honours `dragState.suppressClick`, so releasing a drag does not also advance.
- **Ending** — `.compact-finish` appears with `.has-finish` and calls `showSessionComplete()`,
  which forces focus mode for the summary.

**The click/drag split mirrors the full card:** `.compact-bar` is the grab surface, `.compact-copy`
inside it is the pointer surface. Any new control on the strip must be a `<button>` (the drag
handler ignores buttons) and must `stopPropagation` (the copy advances the story).

### The insight analysis is an application
*P21 · HMW09 · "once the tooltip disappears there is no way back in"*

The analysis is software that opens **on top of everything**, not a page the call navigates away
to. `#app-window` in `windows.html` is a titled window — icon, name, the session it belongs to,
minimise / maximise / close — that scales up from its taskbar icon on the same curve the browser
window uses (`520ms cubic-bezier(.22, 1, .36, 1)`, `transform-origin` on the icon).

- `insight-doc.html` loads **unchanged inside an iframe**. Nothing about the document's content or
  layout is v5.1's business.
- **The document is a fixed 1440 composition**, so `fitAppFrame()` scales the iframe to the window
  width (`transform: scale()`, `transform-origin: top left`) and gives it the matching unscaled
  height, rather than letting it scroll sideways. It re-runs on window resize, on maximise, and
  once more `560ms` after opening, because the body is mid-animation until then.
- **`goBackToSession()` in `insight-doc.js` posts `{ rae: 'close-doc' }` to its parent** when
  embedded, instead of navigating — navigating would load the whole desktop inside the frame. The
  standalone path is kept as a fallback. `windows.html` only accepts the message from its own
  frame's `contentWindow`.
- **The taskbar icon is the way back in.** `#doc-task` is inert until the session completes, then
  becomes `.available` and toggles the window open and closed for the rest of the session. Closing
  and minimising both just hide it; the document is never thrown away. This is P21's finding
  answered — the document outlives the card that announced it.
- `insight-doc.html` loads its script as `insight-doc.js?v=5.1`. The leave behaviour changed, and
  a copy cached from the standalone page would still try to navigate.

**Still out of scope:** the document's own content. It analyses the four Section 1 questions as
though they were the whole interview, which is visibly out of step with the five-section script
from batch 3.

### Batch 4 — Notes: Rae's, and yours
*P21, P22, P24, P25 · HMW07*

The header said "Rae is taking notes" over a panel that showed only questions. P22 could not tell
the notes from the script because there were none.

**Rae's notes.** Every question in `SCRIPTS` carries a `note` (one or two lines of what she said)
and a `quote` (the verbatim line). `.rae-note` opens under a question when it is answered or
skipped — indented to the text column, behind its own grey rule, at 13.5px grey against the
script's 18px black. That contrast *is* the fix: script and notes are now two visibly different
things in the same panel.

**Her words, one tap away.** `.note-toggle` reveals `.note-quote`, the verbatim line. This is the
check P25 currently makes by replaying the recording, moved into the panel (HMW01).

**Your lane.** `.manual-notes` — relabelled **Add your own note**, with an `N` chip — and the `N`
key both call `openComposer()`, which appends a one-line `.you-composer` to the active question.
`Enter` saves, `Escape` cancels. A saved `.you-note` carries a dark **You** tag, the question's
timestamp, and a dark rule, so it can never be mistaken for Rae's.

- **Nothing is on screen until it is asked for.** P24 rejects note-taking during interviews as an
  attention split; the lane costs her nothing. P25: *"a mixture, so I also have all autonomy."*
- The composer sits inside `.questions`, the surface that advances the story, so it stops both its
  clicks and its keys. Any future control in the list must do the same.
- `N` from compact **switches to focus first and defers the composer by 220ms** — the question
  list is `display: none` while minimised, so an input opened before the switch completes has
  nothing to take focus in.
- Notes change the content height, which moves the connector line; the existing `ResizeObserver`
  path handles it, and `updateQuestionsLine()` is called directly when the composer or a quote
  opens.

### Batch 5 — Probes that don't compete with listening
*P23, P24, P25 · HMW02*

All three valued the intelligence and objected to its timing and volume: full sentences arriving
while the participant is still talking.

**Keywords, not sentences.** Every probe carries a `keyword` alongside its `text`. The card renders
`.probe-chip` buttons — `whereabouts`, `course length` — and the full wording lives in a
`.probe-full` that opens when its chip is tapped, one at a time. What arrives mid-answer is a word;
the sentence is there for whoever wants to read it (P25 asked for keyword-only to avoid overload).

**Used chips fill dark** with a tick inside them. Probes deliberately do not borrow the question
states from batch 2 — using a suggestion is not the same act as dealing with a question.

**Optional, at two scales.**
- `.probe-dismiss` (the `×`) drops one card: `.dismissed` collapses it and takes its space with it.
- `#suggest-toggle` in the header is global, persisted to `rae-suggestions`, and puts
  `.suggestions-off` on the toolbar so no card ever reveals.

**The count survives the setting.** `tickProbe()` still calls `bumpInsight()` when the card is
hidden — the insight comes from what the participant said, not from the card being on screen. A
full run with suggestions off still reaches **6 insights** and Finish Session, which is what keeps
the setting a preference rather than a different demo.

**Quiet arrival.** The `translateY(-6px)` entrance is gone; the card fades and grows only. The
title drops from 15px "Consider probing" to a 10px letterspaced `PROBES` eyebrow, matching every
other label in the panel.

**Variant 1** (`?variant=1`, free-form) binds its click handler to the chips instead of the retired
`.probe-row`.
