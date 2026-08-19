# AI Research Assistant - Demo

## What this is
A clickable prototype simulating an AI-assisted user research tool for solo researchers.
Three screens: Setup, Session (Interview or Usability Test), Insight Doc.

## Stack
Plain HTML, CSS, Vanilla JS. One file per screen. No frameworks, no build step.

## Focus Mode UI philosophy
Minimal, calm, one thing at a time. Cards appear progressively. No clutter.

## What to build first
Screen 1: Setup screen only. Upload script (fake parse is fine), enter participant name,
select session type, click Start. Static/simulated data is acceptable throughout.

## Do NOT build yet
- Real AI integration
- Backend or database
- Auth
- Screen 2 or 3 (wait for instruction)

## Where the work is now (read this first)
The default experience is **v5-paper, variant 2**. `index.html` redirects straight into it.

- `v5-paper/INTERACTION-PATTERNS.md` — the behavioural spec for the default experience:
  every screen, trigger, state class, timing and easing. **Read it before changing v5.**
- `v5-paper/os-choice.html` → `windows.html` / `mac.html`, with `research-toolbar.js`
  shared by both. Keep the two OS screens behaviour-identical.
- Earlier iterations live in `archive/` and are listed on a hidden picker at
  `index.html?archive`. Don't delete them; don't wire new work to them either.
- Useful URLs while building: `?skip=call` drops straight into the call,
  `?variant=1` loads the archived free-form question set, `?dev=1` shows the variant chip.
