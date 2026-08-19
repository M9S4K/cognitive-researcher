# v5-paper — Interaction Patterns

Reference spec for the **default experience** of this prototype. Written for whoever (human
or agent) works on it next: it describes every interaction, its trigger, its timing, and the
class/state it flips, so behaviour can be extended without reverse-engineering the source.

- **Default entry:** root `index.html` → `v5-paper/os-choice.html`
- **Default question set:** variant **2** (the scripted story), defined in `research-toolbar.js`
- **Everything else** (v1–v4, and variant 1) is archived, still runnable, see [Archived routes](#archived-routes)

---

## 1. Files and responsibilities

| File | Responsibility |
|---|---|
| `os-choice.html` | OS picker. Writes `rae-os` to `localStorage`, routes to `windows.html` / `mac.html`. |
| `windows.html` | The whole flow on Windows chrome: desktop → notification → script modal → toast → Teams window → session. |
| `mac.html` | Identical flow on macOS chrome. Only OS chrome and modifier keys differ (see §9). |
| `research-toolbar.js` | The research assistant itself: question sets, all question/probe/insight behaviour, variant logic. Shared verbatim by both OS screens. |
| `insight-doc.html` | The insight doc the session hands off to. Layout and styling only. |
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
                                           ├─ View insight doc → insight-doc.html
                                           │       └─ Esc → back into the call (`?skip=call`)
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
| Header | `.toolbar-header` | Kicker "RESEARCH ASSISTANT", shimmering title "Rae is taking notes", call time, "Take notes manually" (decorative), 4-segment progress bar. Also the drag surface. |
| Question list | `.questions` | Scrollable, scrollbars hidden. Rendered from the active question set. |
| Insight pill | `.insight-toast` | Sits *behind* the card and slides out from under its bottom edge. |
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
- **Probe card:** `.probe-card` titled "Consider probing", animates open via `max-height` when
  `.revealed`; its parent question gets `.expanded` to tighten the gap. Each `.probe-row` ticks
  independently with the same `✓` pop.
- **Rewrite:** a question can carry a `rewrite` string. `.rewriting` strikes the original through;
  `.rewritten` then reveals the reworded line beneath it. Reads as Rae restating the question in
  light of what the participant already said.

### Insight choreography
Three distinct moves — keep them distinct, they mean different things:

1. **`showPill(label)`** — the pill slides out from under the card with a message
   ("Q4 answered, will skip"). Runs `420ms cubic-bezier(0.32, 0.72, 0, 1)`.
2. **`swapPillLabel(text)`** — crossfades the wording (150ms) *and* eases the pill's width
   between the two labels, so the change reads as a change rather than a silent substitution.
3. **`unlockInsight(n)` / `bumpInsight()`** — after `1500ms` the pill retracts and the counter
   appears. `unlockInsight` is the first reveal; `bumpInsight` is a straight increment on a
   counter already on screen and plays the `+1` float instead of a pill.

### Session complete
- **Finish Session** appears `450ms` after the final question is answered, rising with a slight
  overshoot.
- Clicking it fills the metrics from live state (insight count, `n/n` questions, the header's
  call time), hides the pill, and adds `.session-complete`: the card grows `363px → 417px`, the
  working surface fades out, the complete surface fades in with a check mark, three metrics, and
  **View insight doc**.
- **View insight doc** navigates to `insight-doc.html`. `Ctrl/⌘ + ↵` does the same while the
  complete card is up — the branch sits ahead of the older chord handlers so finishing the session
  and opening the doc do not both fire.

### Dragging
- Pointer-down on `.toolbar-header` (ignoring buttons) drags the card, clamped inside the browser
  window bounds. Uses `setPointerCapture`.
- Movement over `4px` sets `toolbar.dragState.suppressClick = true`, so releasing a drag does not
  also fire the click that would advance the script. Any new click handler on the card must honour
  this flag.

---

## 5. Question sets

Defined at the top of `research-toolbar.js` as `QUESTION_SETS`. Each entry:

```js
{ text: 'Question text',
  rewrite: 'Optional reworded version',      // enables the strike-through + reveal
  probes: [ { number: '2.1', text: '…' } ] } // enables the "Consider probing" card
```

Variant **2 is the default**. Its story: Tell me about yourself → What are you studying?
(+2 probes) → Do you have any work experience? (rewritten) → Where are you from?

---

## 6. Variant 2 — the scripted sequence (default behaviour)

Variant 2 does **not** respond to per-question clicking. It plays a fixed story: **one click
anywhere on the white question area advances one beat.** Arrow keys and scroll-to-activate are
disabled; the list gets `.script-mode`.

| # | Beat | What happens |
|---|---|---|
| 1 | `playScriptedSequence` | Q1 ticks immediately. After `500ms` Q4 ticks too — *without* ever becoming the active question. `150ms` later the pill slides out: "Q4 answered, will skip". After `2000ms` it swaps to "New insight unlocked" and unlocks **+2**. Once the counter settles (`1500ms`), Q3 is rewritten (strike `400ms`, reveal `400ms`). |
| 2 | `focusQuestion(1)` | Q2 snaps into the top slot. |
| 3 | `answerNextQuestion` | Q2 ticks (**+1**), then `300ms` later its probe card opens. |
| 4 | `tickProbe(0)` | Probe 2.1 ticks (**+1**). |
| 5 | `tickProbe(1)` | Probe 2.2 ticks (**+1**). |
| 6 | `focusQuestion(2)` | Q3 (the rewritten one) snaps into the top slot. |
| 7 | `answerFinalQuestion` | Q3 ticks (**+1**), then `450ms` later **Finish Session** appears. |

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
