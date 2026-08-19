# Version 2 — Build Summary

## Files
`desktop.html` + `call.html` — simulated Mac desktop flow → live video call with ambient AI overlay.

---

## Screen: `desktop.html` — Mac Desktop Simulation

### Layout
Full-viewport, overflow hidden. Three fixed layers: wallpaper (z:0), content (z:1), menu bar + dock (z:100), notification (z:200), upload overlay (z:150).

### Wallpaper
`radial-gradient` + `linear-gradient` layered: deep navy `#1a1e2e` base with blue/green ambient glows.

### Menu Bar
Fixed top, 28px, `rgba(0,0,0,0.55)` + `backdrop-filter: blur(20px)`. Apple logo (&#63743;), Finder menu items left; battery/wifi icons + live clock right. Clock updates every 10s via JS.

### Dock
Fixed bottom, centred, `rgba(255,255,255,0.12)` + `backdrop-filter: blur(24px)`, `border-radius: 18px`. 4 app icons (Browser, Calendar, Brain, Finder) + separator. Hover: `translateY(-6px) scale(1.12)`.

### Notification (`.notification`)
- Position: `top: 44px, right: -360px` (off-screen). Slides in via `right: 12px`, 0.45s `cubic-bezier(0.34,1.2,0.64,1)` (slight overshoot).
- White card, `border-radius: 14px`, `box-shadow: 0 8px 32px rgba(0,0,0,0.35)`.
- App icon (red calendar gradient), app name, title, body, two action buttons.
- "Dismiss" → slides notification back off-screen.
- "Prepare Session" → fades notification out, opens upload overlay.
- Auto-fires after 1.5s on load.

### Upload Overlay (`.upload-overlay`)
- Fixed top, full width, `height: 0` → `height: 200px` on `.open`, `transition: height 0.45s cubic-bezier(0.4,0,0.2,1)`.
- Background `#0f0f0f`.
- Inner content fades in with 0.2s delay after overlay opens.
- Upload zone: dashed white border, `rgba(255,255,255,0.04)` bg. `.has-file` state: sage border, sage tint bg.
- On file select: icon → "✓", text → "Script ready · filename", hint hidden, `.btn-join` fades in.
- `.btn-join` slides in from right (translateX 6px → 0) once file loaded.
- "Join Meeting →" navigates to `call.html`.

### JS
- Clock: `setInterval` every 10s, 12h format with AM/PM.
- Notification: `setTimeout` 1.5s → add `.visible` class.
- Dismiss: remove `.visible`, slide right off-screen.
- Prepare: fade notification out, add `.open` to overlay.
- File input: hidden `<input type="file">`, triggered on upload zone click.

---

## Screen: `call.html` — Live Video Call + AI Overlay

### Layout
4 fixed layers: AI strip top (52px), video call area (top:52px → bottom:64px), self-view tile (fixed bottom-right), controls bar (bottom 64px).

### AI Strip (`.ai-strip`)
- Fixed top, 52px, `background: #0d0d0d`, subtle bottom border.
- Left: `Q{n}/6` label (sage) + divider + question text (white, ellipsis overflow).
- Right: breathing dot + "AI noting…" text + live timer + advance arrow button.
- Question text fades out (`.fading` class, opacity 0) → updates → fades back in on advance.

### Video Call Shell
- `.call-area`: fills between strip and controls, `background: #202124`.
- `.main-tile`: `min(68vw, 860px)` wide, 16:9 aspect, dark grey, `border-radius: 14px`. Contains layered gradient bg, "SC" avatar circle, "Sarah Chen — Participant" badge (bottom-left).
- `.self-tile`: 160px wide, 16:9, fixed bottom-right above controls. "You" avatar + label.

### Controls (`.controls`)
- Fixed bottom, 64px, `background: #1a1c1f`. 4 icon buttons: mute, camera, share screen, end call (red, 48px circle). End call triggers `endSession()`.

### Probe Card (`.probe-card`)
- Fixed `top: 60px, right: 16px`, 300px wide.
- White, `border-left: 3px solid #7c9885`, `border-radius: 10px`, `box-shadow: 0 4px 20px rgba(0,0,0,0.3)`.
- Enters with `badgeIn`-style animation (opacity 0→1, translateY -6px→0).
- "💡 Consider probing" label + probe question text + `[×]` dismiss button.
- Auto-appears 7s after question renders. Auto-dismisses after 8s.
- On dismiss (manual or auto): if question has an insight, shows insight toast 600ms later.

### Insight Toast (`.insight-toast`)
- Same position as probe card (they appear at different times in normal flow).
- Amber: `#fffbee` bg, `#f0dc98` border. `border-radius: 10px`.
- "🔍" icon + "INSIGHT CAPTURED · NICE ONE" label + insight text.
- Same slide-in animation. Auto-dismisses after 5s.
- `insightCount` incremented each time one fires.

### End Overlay (`.end-overlay`)
- Fixed inset-0, `rgba(0,0,0,0.82)` + `backdrop-filter: blur(12px)`.
- White card centred: checkmark icon circle, "Session complete" title, subtitle.
- Stats row: Insights / Questions covered / Duration (all populated from live state).
- "View Insight Doc →" links to `insights.html`.

### JS Behaviour

| Behaviour | Trigger | Effect |
|---|---|---|
| Timer | `setInterval` 1s | Increments `secs`, updates strip timer |
| Render question | `render(i)` | Fades q text, updates label, clears pending timers, schedules probe + insight |
| Probe show | `setTimeout` 7s after render | Shows probe card |
| Probe auto-dismiss | `setTimeout` 8s after probe shows | Hides probe; shows insight if exists |
| Probe manual dismiss | Click `[×]` | Hides probe; shows insight if exists (600ms) |
| Insight show | After probe dismiss (or 16s) | Increments count, shows toast 5s |
| Advance | Click `›` button | idx++, render(idx) |
| End session | Click red end btn | Populates stats, shows end overlay |

### Hardcoded data (`DATA`, 6 entries)
Each: `q` (question), `probe` (follow-up suggestion), `insight` (string or null).
Insights on Q2, Q3, Q4, Q6.

---

## Colour additions (V2 only)
| Role | Value |
|---|---|
| Desktop wallpaper base | `#1a1e2e` |
| Menu bar bg | `rgba(0,0,0,0.55)` |
| Dock bg | `rgba(255,255,255,0.12)` |
| Upload overlay bg | `#0f0f0f` |
| Upload zone border | `rgba(255,255,255,0.2)` |
| AI strip bg | `#0d0d0d` |
| Video call bg | `#202124` |
| Participant tile bg | `#2c2e33` |
| Controls bar bg | `#1a1c1f` |
| End call button | `#ea4335` |

---

## Full demo flow
1. `desktop.html` loads → Mac desktop with hint text
2. 1.5s → notification slides in from top-right
3. "Prepare Session" → notification fades, black overlay slides down
4. Upload zone → file selected → "Script ready ✓" + "Join Meeting →" appears
5. "Join Meeting →" → `call.html`
6. Q1 in AI strip, breathing "AI noting…" dot, timer running
7. 7s → probe card appears top-right
8. Probe dismissed → insight toast appears (if question has one)
9. `›` to advance through 6 questions
10. Red end button → blurred overlay with session stats → "View Insight Doc →" → `insights.html`

---

# Setup Screen — Build Summary

## File
`setup.html` — single self-contained file, no framework, no build step.

---

## Layout
- Centered single-column layout, max-width 540px, vertically centered on the page.
- Page wrapper: `.container`
- Page title `<h1>` + `.subtitle` paragraph sit above the cards.

---

## Components

### 1. Research Script Upload Card (`.card` #1)
- Visible element: `.upload-area` — a dashed-border drop zone the user clicks.
- Hidden `<input type="file" accept=".pdf,.docx">` triggered on click.
- On file select: upload icon + prompt text are hidden; `.file-info` (`.visible`) renders a green checkmark + filename.
- State flag: `scriptLoaded` (boolean).

### 2. Participant Name Card (`.card` #2)
- `<input type="text" id="participantName">` with placeholder "Enter participant identifier".
- Fires `validateForm()` on every keystroke (`input` event).

### 3. Session Type Card (`.card` #3)
- `<select id="sessionType">` with three options:
  - `""` → "Select a session type" (default/disabled value)
  - `"interview"` → "Semi-Structured Interview"
  - `"usability"` → "Usability Test"
- Fires `validateForm()` on change.

### 4. Start Session Button (`.btn-start`)
- Full-width button, `disabled` by default.
- Enabled only when all three fields are satisfied (`validateForm()`).
- On click: routes to `interview.html` or `usability.html` based on selected session type.
- Error fallback: `.error-message` rendered below button if session type is somehow invalid.

---

## JS Behaviour

| Behaviour | Trigger | Effect |
|---|---|---|
| Open file picker | Click `.upload-area` | Calls `fileInput.click()` |
| File selected | `change` on `#fileInput` | Sets `scriptLoaded = true`, shows filename, toggles `.has-file` on upload area, calls `validateForm()` |
| Live validation | `input` on name field, `change` on select | `validateForm()` enables/disables Start button |
| Form submit | Click `#startBtn` | Navigates to `interview.html` or `usability.html` |
| Error display | Invalid state on submit | Shows `.error-message.visible` below button |

---

## CSS Classes

| Class | Purpose |
|---|---|
| `.container` | 540px centered column wrapper |
| `.card` | White rounded card, animated on load |
| `.subtitle` | Muted page descriptor under h1 |
| `.upload-area` | Dashed-border file drop zone |
| `.upload-area.has-file` | State: file loaded — green border, tinted bg |
| `.upload-icon` | 📄 emoji icon inside upload zone |
| `.upload-text` | "Click to upload PDF or DOCX" prompt |
| `.file-info` | Hidden by default; shown with `.visible` after file selected |
| `.file-info.visible` | Flex row: checkmark + filename |
| `.file-name` | Filename text inside `.file-info` |
| `.success-check` | Green checkmark character |
| `.btn-start` | Primary CTA button |
| `.btn-start:disabled` | Greyed-out state when form incomplete |
| `.error-message` | Hidden error banner below button |
| `.error-message.visible` | Shown error state |

---

## Animations
- All `.card` elements animate in with `fadeInUp` (opacity 0→1, translateY 10px→0, 0.4s ease).
- Staggered delays: card 2 → 0.1s, card 3 → 0.2s, card 4 → 0.3s.
- Button hover: `translateY(-1px)` + soft green box-shadow.

---

## Colour Palette

| Role | Hex |
|---|---|
| Page background | `#f7f6f4` (warm off-white) |
| Card background | `#ffffff` |
| Upload zone background | `#fafafa` |
| Upload zone hover bg | `#f5f5f5` |
| Upload zone (has file) bg | `#f0f4f1` (soft sage tint) |
| Primary text | `#1a1a1a` / `#2a2a2a` |
| Label text | `#4a4a4a` |
| Muted/secondary text | `#6b6b6b` |
| Border default | `#e0e0e0` / `#d4d4d4` |
| Focus border | `#8a9d91` (muted sage) |
| Upload border (has file) | `#7c9885` (sage green) |
| Success checkmark | `#7c9885` |
| CTA button | `#6b7f73` (sage green) |
| CTA hover | `#5a6d62` (darker sage) |
| CTA disabled | `#c4c4c4` |
| Error background | `#fff4f4` |
| Error border | `#ffd4d4` |
| Error text | `#a04040` |

---

## Navigation targets (not yet built)
- `insights.html` — destination from interview end screen

---

# Interview Screen — Build Summary

## File
`interview.html` — single self-contained file, no framework, no build step.

---

## Layout
Two-column grid: `grid-template-columns: 1fr 340px`.
- Left `.main`: question area, max-width 620px, padding `3rem 3rem 3rem 3.5rem`.
- Right `.panel`: sticky AI panel, full viewport height minus topbar, scrollable.
- `.topbar`: sticky top bar, height ~53px.

---

## Components

### Topbar
- `.session-tag` — "INTERVIEW" pill (sage green, uppercase, `#f0f4f1` bg).
- `.sep` — 1px vertical divider.
- `.participant-label` — "Participant P-01" (hardcoded placeholder).
- `.timer` — live MM:SS counter (top-right), tabular-nums.

### Progress Row
- `.progress-track` / `.progress-fill` — thin 3px bar, sage fill, transitions on advance.
- `.progress-label` — "X of 8" counter.

### Question Card (`.question-card`)
- `.q-number` — "QUESTION N" label (sage, uppercase, small).
- `.q-text` — question body, 1.35rem, font-weight 400.
- Re-triggers `fadeUp` animation on every advance (style reset + reflow trick).

### Follow-up Chips (`.chip`)
- Rendered fresh per question from `DATA[i].followups` array.
- Hover: sage border + light sage background.
- No action on click (display only in demo).

### Action Buttons
- `.btn-next` — sage green CTA; label changes to "Finish Session" on last question.
- `.btn-end` — ghost button, ends session early.

### End Screen (`.end-screen`)
- Hidden by default; `.visible` shows it via `display: flex`.
- Shows checkmark circle, "Session complete" title, subtitle, and "View Insight Doc →" button linking to `insights.html`.

### AI Panel — Insight Badge (`.insight-badge`)
- Hidden by default; `.visible` triggers `badgeIn` animation (fade + slide down).
- Yellow-toned (`#fffbee` bg, `#f0dc98` border).
- Shows "NEW INSIGHT" label + insight message text.
- Appears ~2.6s after question renders; dismissed/hidden on next question advance.

### AI Panel — Notes Stream
- `.ai-dot` — pulsing sage dot (breathing `@keyframes breathe`).
- `.note` items appended to `.notes-stream` one per question, ~1.4s after render.
- Each note animates in with `noteIn` (fade + translateY).
- Notes accumulate across the session (not cleared).

---

## JS Behaviour

| Behaviour | Trigger | Effect |
|---|---|---|
| Render question | `render(i)` call | Updates card text, follow-ups, progress, note (delayed), insight badge (delayed) |
| Card re-animation | Each `render()` | Resets animation via style=none + reflow, then re-applies `fadeUp` |
| Timer | `setInterval` 1s | Increments `secs`, formats MM:SS into `.timer` |
| Advance question | Click `.btn-next` | Increments `idx`, calls `render(idx)` |
| Finish session | Click `.btn-next` on Q8 | Calls `endSession()` |
| End early | Click `.btn-end` | Calls `endSession()` |
| End session | `endSession()` | Hides `#questionView`, shows `#endScreen.visible` |
| Note append | `addNote(text)` after 1.4s | Creates `.note` div, appends to stream, scrolls panel |
| Insight badge | After 2.6s if `DATA[i].insight` set | Sets badge text, adds `.visible` |

### Hardcoded data (`DATA` array, 8 entries)
Each entry has: `q` (question string), `followups` (array of 2–3 strings), `note` (AI note string), `insight` (string or null).
Insights fire on questions 3, 5, 7.

---

## CSS Classes

| Class | Purpose |
|---|---|
| `.topbar` | Sticky top bar, white, border-bottom |
| `.session-tag` | "INTERVIEW" pill label |
| `.sep` | Vertical divider in topbar |
| `.participant-label` | Participant name in topbar |
| `.timer` | Live session timer (top-right) |
| `.layout` | Two-column CSS grid |
| `.main` | Left question column |
| `.progress-row` | Progress bar + label row |
| `.progress-track` | Grey track behind fill bar |
| `.progress-fill` | Sage green animated fill |
| `.progress-label` | "X of 8" text |
| `.question-card` | White card with question text, animated |
| `.q-number` | "QUESTION N" eyebrow label |
| `.q-text` | Question body text |
| `.followups-heading` | "SUGGESTED FOLLOW-UPS" label |
| `.followups` | Column flex container for chips |
| `.chip` | Follow-up suggestion button |
| `.actions` | Flex row for Next + End buttons |
| `.btn-next` | Primary sage CTA |
| `.btn-end` | Ghost secondary button |
| `.end-screen` | Hidden end state; `.visible` shows it |
| `.end-check` | Circular checkmark badge |
| `.end-title` / `.end-sub` | End screen copy |
| `.btn-insights` | "View Insight Doc →" CTA |
| `.panel` | Sticky right AI panel |
| `.panel-title` | Section heading in panel |
| `.insight-badge` | Yellow insight alert; `.visible` shows it |
| `.insight-icon` | 🔍 icon in badge |
| `.insight-label` | "NEW INSIGHT" label in badge |
| `.insight-msg` | Insight message text |
| `.ai-status` | Row with pulsing dot + status text |
| `.ai-dot` | Pulsing sage green dot |
| `.ai-status-text` | "AI is taking notes…" label |
| `.notes-stream` | Column container for note items |
| `.note` | Individual note item, animated in |

---

## Animations

| Name | Used on | Effect |
|---|---|---|
| `fadeUp` | `.question-card` | opacity 0→1, translateY 10px→0, 0.35s ease |
| `noteIn` | `.note` | opacity 0→1, translateY 5px→0, 0.3s ease |
| `badgeIn` | `.insight-badge.visible` | opacity 0→1, translateY -4px→0, 0.4s ease |
| `breathe` | `.ai-dot` | scale + opacity pulse, 2.2s infinite |

---

## Colour Palette
Inherits all colours from setup.html. Additional colours:

| Role | Hex |
|---|---|
| Session tag background | `#f0f4f1` (soft sage tint) |
| Session tag text | `#7c9885` |
| Insight badge background | `#fffbee` (warm cream) |
| Insight badge border | `#f0dc98` (muted gold) |
| Insight label text | `#b08a20` (dark gold) |
| Insight message text | `#6b5010` (deep amber) |
| Note left border | `#d4d4d4` |
| Note background | `#fafafa` |

---

## Navigation targets (not yet built)
- `insights.html` — from interview end screen "View Insight Doc →"

---

# Usability Test Screen — Build Summary

## File
`usability.html` — single self-contained file, no framework, no build step.

---

## Layout
Identical two-column grid to `interview.html`: `grid-template-columns: 1fr 340px`.
- Left `.main`: task area, max-width 620px.
- Right `.panel`: sticky AI panel, full viewport height minus topbar, scrollable.
- `.topbar`: same sticky bar pattern, height ~53px.

---

## Components

### Topbar
- `.session-tag` — "USABILITY TEST" pill (sage green, same style as interview).
- `.participant-label` — "Participant P-01".
- `.session-timer` — global session elapsed timer (top-right, always running).

### Progress Row
- Same `.progress-track` / `.progress-fill` / `.progress-label` pattern as interview.
- Label reads "Task N of 5".

### Task Card (`.task-card`)
- `.task-eyebrow` — "TASK N" label.
- `.task-text` — task instruction, 1.35rem.
- Re-triggers `fadeUp` animation on each advance.

### Task Timer Row
- `.task-timer-display` — large 2rem tabular-nums timer, resets to 00:00 on each new task.
- `.task-timer-display.paused` — greyed out (`#b0b0b0`) when paused.
- `.btn-pause` — "Pause" / "Resume" toggle; adds `.active` class when paused (sage border/bg).

### Thinking Aloud Toggle (`.thinking-row`)
- Full-width clickable row with `.thinking-dot` (grey → pulsing sage when active).
- `.thinking-hint` shows "tap to activate" → "timer paused" when on.
- When active: adds `.active` class — sage border, tinted background, dot pulses.
- **Pauses the task timer** while active (independent of the Pause button).

### Probe Log
- `.probe-heading` — "LOG PROBE" label.
- `.probe-actions` — 4 pill buttons (`.btn-probe`), each with `data-reason`:
  - "Redirected to task", "Asked to think aloud", "Clarified task wording", "Answered question"
- `.probe-log` — appends `.probe-entry` rows on each click: timestamp (`fmt(taskSecs)`) + reason text.
- Probe log clears on task advance.

### Action Buttons
- `.btn-complete` — "Mark Complete ✓" / "Finish Session" on last task.
- `.btn-abandon` — "Abandon Task" (ghost button). Both routes advance to next task or end.

### End Screen
- Same `.end-screen` / `.visible` pattern as interview. Links to `insights.html`.

### Panel — Behavioral Cues (`.cues-list`)
- Default state: `.cues-empty` — "No signals yet" (italic, light grey).
- Cues fire via `setTimeout` keyed to each task's `cues` array (`sec` field).
- Each `.cue` has a type class: `.hesitation`, `.confusion`, `.frustration`.
- Cues accumulate across a task; cleared on task advance (`innerHTML` reset).
- `cueTimeouts` array holds all pending timeouts; cleared on advance/end.

### Panel — AI Notes
- Same `.ai-dot` / `.ai-status-text` / `.notes-stream` / `.note` pattern as interview.
- Label: "AI is observing…" (instead of "taking notes").
- One note appended per task, 1.6s after render.

---

## JS Behaviour

| Behaviour | Trigger | Effect |
|---|---|---|
| Session timer | `setInterval` 1s, always | Increments `sessionSecs` → topbar display |
| Task timer | `setInterval` 1s | Increments `taskSecs` unless `taskPaused` OR `thinkingOn` |
| Pause/resume | Click `.btn-pause` | Toggles `taskPaused`; button text + `.active` + timer colour |
| Thinking aloud | Click `.thinking-row` | Toggles `thinkingOn`; dot pulses, hint text, timer pauses |
| Log probe | Click `.btn-probe` | Appends `.probe-entry` with current task time + reason |
| Cue scheduling | `renderTask(i)` | Clears old `cueTimeouts`, sets new `setTimeout` per `TASKS[i].cues` |
| Cue fire | `setTimeout` callback | Calls `addCue(c)`, removes `.cues-empty`, appends `.cue` |
| Mark complete / abandon | Click either button | Clears cue timeouts, advances `taskIdx`, calls `renderTask` |
| Finish session | Last task complete/abandon | `endSession()` — hides task view, shows end screen |
| Note append | 1.6s after `renderTask` | Creates `.note`, appends to stream |

### Hardcoded data (`TASKS` array, 5 entries)
Each entry: `title` (task string), `cues` (array of `{sec, type, icon, label, desc}`), `note` (AI note string).

Cue schedule across tasks:
- Task 1: hesitation @ 9s, confusion @ 22s
- Task 2: hesitation @ 8s
- Task 3: hesitation @ 7s, confusion @ 19s, frustration @ 32s
- Task 4: hesitation @ 11s, confusion @ 25s
- Task 5: hesitation @ 8s

---

## CSS Classes

| Class | Purpose |
|---|---|
| `.session-timer` | Global elapsed timer in topbar |
| `.task-card` | White card with task instruction |
| `.task-eyebrow` | "TASK N" label |
| `.task-text` | Task instruction body |
| `.timer-row` | Flex row: task timer + pause button |
| `.task-timer-display` | Large task elapsed timer |
| `.task-timer-display.paused` | Greyed out when paused |
| `.btn-pause` | Pause/Resume button; `.active` = paused state |
| `.thinking-row` | Clickable thinking-aloud toggle row |
| `.thinking-row.active` | Active state — sage border, tinted bg |
| `.thinking-dot` | Small circle indicator; pulses when active |
| `.thinking-label` | "User is thinking aloud" label |
| `.thinking-hint` | "tap to activate" / "timer paused" hint |
| `.probe-heading` | "LOG PROBE" section label |
| `.probe-actions` | Flex wrap row of probe pill buttons |
| `.btn-probe` | Individual probe pill button |
| `.probe-log` | Column container for probe entries |
| `.probe-entry` | Row: timestamp + reason text |
| `.probe-time` | Timestamp in probe entry |
| `.btn-complete` | Primary CTA (mark complete / finish) |
| `.btn-abandon` | Ghost secondary (abandon task) |
| `.cues-list` | Column container for cue badges |
| `.cues-empty` | "No signals yet" placeholder |
| `.cue` | Cue badge base class |
| `.cue.hesitation` | Amber/cream — `#fffbee` bg, `#f0dc98` border |
| `.cue.confusion` | Warm orange — `#fff4e8` bg, `#f0b878` border |
| `.cue.frustration` | Soft red — `#fff0f0` bg, `#f0a8a8` border |
| `.cue-icon` | Emoji icon in cue (⚡ / 🔄 / ⚠️) |
| `.cue-label` | Uppercase type label inside cue |
| `.cue-desc` | Description text inside cue |

---

## Animations

| Name | Used on | Effect |
|---|---|---|
| `fadeUp` | `.task-card`, `.end-screen` | opacity 0→1, translateY 10px→0, 0.35s ease |
| `breathe` | `.thinking-dot` (active), `.ai-dot` | scale + opacity pulse, 1.8s / 2.2s infinite |
| `cueIn` | `.cue` | opacity 0→1, translateX 6px→0, 0.4s ease |
| `noteIn2` | `.note` | opacity 0→1, 0.3s ease |

---

## Colour Palette
Inherits all colours from setup.html and interview.html. Additional colours:

| Role | Hex |
|---|---|
| Hesitation cue background | `#fffbee` (warm cream) |
| Hesitation cue border | `#f0dc98` (muted gold) |
| Hesitation cue text | `#6b5010` |
| Confusion cue background | `#fff4e8` (warm peach) |
| Confusion cue border | `#f0b878` (muted amber) |
| Confusion cue text | `#6b3808` |
| Frustration cue background | `#fff0f0` (soft blush) |
| Frustration cue border | `#f0a8a8` (muted coral) |
| Frustration cue text | `#7a2020` |
| Timer paused colour | `#b0b0b0` |

---

## Navigation targets
- `insights.html` — from both interview and usability end screens ✓ built

---

# Insight Doc Screen — Build Summary

## File
`insights.html` — single self-contained file, no framework, no build step.

---

## Layout
- **Sticky header block** (`.header-block`): topbar + timeline strip, sticks to top.
- **Two-column grid** below: `grid-template-columns: 280px 1fr`.
  - Left `.sidebar`: sticky, full viewport height minus header, scrollable.
  - Right `.main-content`: scrollable document content, max-width 680px.

---

## Components

### Sticky Header Block
**Topbar:**
- `.doc-tag` — "INSIGHT DOC" pill (sage).
- `.session-info` — meta row: Participant · Session type · Duration · Date, separated by `.info-dot`.
- `.btn-export` — "Export →" button; simulates export with "Exporting…" → "Exported ✓" → reset.

**Timeline strip (`.timeline-strip`):**
- `.timeline-labels` — 5 time labels (0:00 → 42:18).
- `.timeline-track` — 4px grey bar; contains dots and playhead.
- `.timeline-dot` — one per insight, positioned via `left: X%`. Clickable; triggers `activate(id)`.
- `.timeline-playhead` — vertical green bar that slides to active insight's `%` position. Hidden until first activation.

### Sidebar
**KEY INSIGHTS section:**
- 5 `.insight-card` elements built from `INSIGHTS` array.
- Each shows `.insight-ts` (timestamp) + `.insight-text`.
- `.insight-card.active` — sage border + tinted background.
- Clicking calls `activate(id)`.

**PATTERNS section:**
- 3 hardcoded `.pattern-item` rows with `◆` icon prefix.

### Main Content
**Stats row (`.stats-row`):**
- 4 `.stat` cells: Key insights (5), Questions covered (8/8), Patterns detected (3), Session duration (42:18).
- Animated in with staggered `fadeUp`.

**AI Summary (`.summary-block`):**
- Label + 3-sentence paragraph summarising the session.

**Transcript Highlights:**
- 5 `.transcript-block` elements built from `TRANSCRIPT` array.
- Each has: `.tx-meta` (timestamp badge + topic label), `.tx-quote` (with `<em>` highlights in sage), `.tx-insight-tag` (🔍 + linked insight text).
- `.transcript-block.active` — sage left border + tinted background.
- Blocks stagger-reveal on load (100ms + 80ms × index).
- Clicking calls `activate(id)`.

---

## JS Behaviour

| Behaviour | Trigger | Effect |
|---|---|---|
| Build timeline dots | On load | Creates `.timeline-dot` per insight at `left: pct%` |
| Build insight cards | On load | Renders sidebar cards from `INSIGHTS` array |
| Build transcript blocks | On load | Renders blocks from `TRANSCRIPT`, staggered `.revealed` class |
| Activate insight | Click card / dot / transcript block | Sets active classes, moves playhead, scrolls transcript into view |
| Deactivate (toggle) | Click already-active item | Removes all active states, hides playhead |
| Playhead move | `activate(id)` | Sets `playhead.style.left = pct%`, adds `.visible` |
| Export simulation | Click `.btn-export` | "Exporting…" (1.2s) → "Exported ✓" (2.5s) → reset |
| Sidebar height sync | On load + resize | Reads `headerBlock.offsetHeight`, sets sidebar `top` + `height` dynamically |

### Hardcoded data
**`INSIGHTS` array (5 entries):** `id`, `ts`, `pct` (% of total duration), `text`, `txLabel`.
**`TRANSCRIPT` array (5 entries):** `insightId`, `ts`, `speaker`, `quote` (with `<em>` tags).
**Total session duration:** 2538s (42:18).

Insight timestamps and positions:
| Insight | Timestamp | Timeline % |
|---|---|---|
| Post-session write-up | 09:14 | 21.8% |
| Cognitive overload | 12:33 | 29.7% |
| Note-taking vs listening | 18:42 | 44.2% |
| Intuitive insight selection | 31:07 | 73.6% |
| Quiet co-pilot | 38:55 | 92.0% |

---

## CSS Classes

| Class | Purpose |
|---|---|
| `.header-block` | Sticky wrapper: topbar + timeline |
| `.topbar` | Top meta bar with export button |
| `.doc-tag` | "INSIGHT DOC" pill |
| `.session-info` | Meta row: participant, type, duration, date |
| `.info-item` | Individual meta value |
| `.info-dot` | 3px separator dot between meta items |
| `.btn-export` | Export CTA; `.done` = confirmed state |
| `.timeline-strip` | Timeline container with labels + track |
| `.timeline-labels` | Row of time labels above track |
| `.timeline-track` | 4px grey bar; positions dots and playhead |
| `.timeline-dot` | Per-insight dot on track; `.active` = enlarged green |
| `.timeline-playhead` | Sliding vertical marker; `.visible` = shown |
| `.sidebar` | Left sticky column |
| `.sidebar-section` | Section wrapper in sidebar |
| `.sidebar-heading` | Section label (uppercase, muted) |
| `.insight-card` | Clickable insight card; `.active` = sage border + tint |
| `.insight-ts` | Timestamp inside insight card |
| `.insight-text` | Insight body text |
| `.pattern-item` | Pattern row with icon |
| `.pattern-icon` | ◆ icon in pattern row |
| `.main-content` | Right scrollable column |
| `.stats-row` | 4-cell stat bar |
| `.stat` | Individual stat cell |
| `.stat-value` | Large stat number |
| `.stat-label` | Small label below stat |
| `.summary-block` | AI summary card |
| `.summary-label` | "AI SUMMARY" heading |
| `.summary-text` | Summary paragraph |
| `.section-heading` | "TRANSCRIPT HIGHLIGHTS" label |
| `.transcript-block` | Clickable transcript excerpt; `.active` = sage left border + tint; `.revealed` = visible |
| `.tx-meta` | Row: timestamp badge + topic label |
| `.tx-ts` | Timestamp badge in transcript block |
| `.tx-label` | Topic label in transcript block |
| `.tx-quote` | Quote text; `<em>` = sage green highlight |
| `.tx-insight-tag` | 🔍 + insight text tag at bottom of block |

---

## Animations

| Name | Used on | Effect |
|---|---|---|
| `fadeUp` | `.summary-block`, `.stats-row` | opacity 0→1, translateY 8px→0, 0.4s ease, staggered |
| Staggered reveal | `.transcript-block` | `.revealed` class added with `100ms + 80ms × i` delay |
| Playhead slide | `.timeline-playhead` | `left` transitions via `cubic-bezier(0.4,0,0.2,1)` 0.45s |
| Dot activate | `.timeline-dot.active` | width/height + box-shadow, 0.2s ease |

---

## Colour Palette
Inherits all colours from previous screens. No new colours introduced.

---

## Build complete
All 4 screens built:
- `setup.html` ✓
- `interview.html` ✓
- `usability.html` ✓
- `insights.html` ✓
