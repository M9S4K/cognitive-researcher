# UX Research Assistant — Project Planning

## Problem Statement

Solo UX researchers are cognitively overloaded during research sessions. Standard practice requires two researchers — one to engage the participant, one to take notes — but most companies can only allocate one. That one person must simultaneously manage: a research script, probing follow-ups, note-taking, insight spotting, behavioral cue tracking, prototype interactions, and time tracking.

This project explores how AI can cognitively assist researchers during Semi-Structured Interviews and Usability Tests in a non-intrusive way, while keeping the researcher in agency and control.

---

## Goals

- Short-term: Clickable prototype/demo to explore and communicate the concept
- Mid-term: Show to peers, lecturers, and potentially real researchers for feedback
- Long-term: Working MVP with real AI (transcription, insight extraction, script parsing)

---

## Key Design Principles

- **Focus Mode UI**: One thing at a time. Cards appear progressively. No clutter.
- **Researcher agency**: AI assists, never takes over. Researcher controls pacing.
- **Non-intrusive**: AI cues are ambient, not disruptive.
- **Stage manager mental model**: Like a theatre stage manager — script, cues, notes, timing — all from one quiet desk while the session happens in front of them.

---

## Features Overview

### Researcher uploads their own script
Researchers come with their own research plan/script (PDF or DOCX). The app parses it and surfaces questions progressively — one at a time — so the researcher isn't manually scrolling.

---

## Screens

### Screen 1 — Setup (`setup.html`)
- Upload research script (PDF/DOCX) → show "Script loaded ✓"
- Enter participant name
- Select session type: Semi-Structured Interview or Usability Test
- "Start Session" → routes to interview.html or usability.html

### Screen 2a — Interview Mode (`interview.html`)
- One question card at a time, researcher manually advances
- Side panel: AI note-taking with ambient animated cue ("AI is taking notes...")
- Contextual prompt cards: context-aware follow-up suggestions based on current question
- Insight badge: "🔍 New insight detected" appears at key moments
- Minimal layout — no window juggling, no manual scrolling

### Screen 2b — Usability Test Mode (`usability.html`)
- Task timer with pause/resume
- "User is thinking aloud" toggle → pauses timer automatically
- Simulated facial/audio cue indicators: hesitation, confusion, frustration
- Probe log: tracks if/when researcher intervened during a task
- Live note stream on side panel

### Screen 3 — Insight Doc (`insights.html`)
- Auto-generated session summary: key insights, patterns, cleaned transcript
- Click an insight → highlights corresponding moment on a simulated audio/video timeline
- Export button (placeholder for now)

---

## Tech Stack

### Demo Phase (now)
- Plain HTML + CSS + Vanilla JS
- One file per screen
- No framework, no build step, no backend
- Simulated/hardcoded data throughout — realistic fake questions, insights, cues

### MVP Phase (later)
- Next.js
- Whisper API — real-time transcription
- Claude API — insight extraction, script parsing, contextual prompt generation
- Webcam/audio input for real behavioral cue detection

---

## Build Order

1. `setup.html` — Upload, participant name, session type, Start button
2. `interview.html` — Focus mode interview assistant
3. `usability.html` — Usability test observer
4. `insights.html` — Post-session insight document

**Rule: One screen per Claude Code session. Always read CLAUDE.md and PLANNING.md first.**

---

## Claude Code Working Rules

- Start every session with: "Read CLAUDE.md and PLANNING.md before doing anything."
- Build one screen per session
- Use simulated/hardcoded data — make it feel realistic
- At end of each session, ask Claude Code: "Summarise what was built — components, JS behaviour, classes, colour palette." Save output as `PROGRESS.md`
- Paste `PROGRESS.md` into the next session for continuity

---

## CLAUDE.md (copy this to CLAUDE.md in project root)

```
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
```

---

## First Claude Code Prompt (Screen 1)

```
Read CLAUDE.md first.

Build Screen 1: Setup Screen as a single HTML file called setup.html.

Requirements:
- Upload a research script (PDF or DOCX) — no real parsing needed, just accept the file and show the filename with a "Script loaded ✓" confirmation
- Text input for participant name
- Dropdown to select session type: Semi-Structured Interview or Usability Test
- "Start Session" button — links to interview.html or usability.html depending on selection (pages don't exist yet, that's fine)
- Design feel: calm, minimal, focused. Think clinical but warm. Muted tones, good whitespace.
- Hardcode nothing. Keep JS minimal.

Do not build anything beyond this screen.
```
