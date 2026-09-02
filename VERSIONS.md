# Versions

Seven iterations of the same idea: an AI assistant that sits beside a solo researcher
during a remote interview. Every one of them still runs — they are plain HTML, so opening
the file is all it takes.

**Current: [v5.2](#v52--the-mini-bar-build).** `index.html` redirects into it. The picker at
`index.html?archive` opens any of the others.

| Tag | Name | Opens at | Detail |
|---|---|---|---|
| [`v5.2`](../../releases/tag/v5.2) | The mini bar build | `v5.2-paper/windows.html` | [V5.2-CHANGES.md](v5.2-paper/V5.2-CHANGES.md) · [INTERACTION-PATTERNS.md](v5.2-paper/INTERACTION-PATTERNS.md) |
| [`v5.1`](../../releases/tag/v5.1) | The P21–P25 build | `v5.1-paper/windows.html` | [INTERACTION-PATTERNS.md](v5.1-paper/INTERACTION-PATTERNS.md) · [REVIEW.md](REVIEW.md) |
| [`v5`](../../releases/tag/v5) | OS-aware desktop flow, scripted session | `v5-paper/os-choice.html` | [CHANGELOG.md](v5-paper/CHANGELOG.md) · [INTERACTION-PATTERNS.md](v5-paper/INTERACTION-PATTERNS.md) |
| [`v4`](../../releases/tag/v4) | OS-aware desktop flow | `archive/v4-figma/os-choice.html` | — |
| [`v3`](../../releases/tag/v3) | Full build (wireframe) | `archive/v3-wireframe/desktop.html` | — |
| [`v2`](../../releases/tag/v2) | Floating interface (wireframe) | `archive/v2-lofi/launcher.html` | [PROGRESS.md](PROGRESS.md) |
| [`v1`](../../releases/tag/v1) | Full build | `archive/v1-current/setup.html` | [PLANNING.md](PLANNING.md) |

> **A caveat about the tags.** Version control started partway through. `v1` to `v5.1` were
> all already on disk at the first commit (`8f74dbc`), so those six tags necessarily point
> at that one commit — they mark *which folder holds that version*, not a moment when it
> was the newest thing. Only `v5.2` has a history of its own, below.

---

## v5.2 — The mini bar build

Two presences instead of three. The mini bar is the default and runs a whole session on its
own — starts the recording, walks the script, shows what Ria heard and what she would
follow up with, and ends it — with the sidebar there when you want the script in full.

**Different from v5.1:** the third presence is gone; the mini bar became self-sufficient
rather than a summary of the sidebar; both surfaces were rebuilt from the design frames
rather than approximated.

This is the only version with commit-level history:

| Commit | What changed |
|---|---|
| `799dd42` | Script-document toolbar, Ria onboarding, Windows chrome |
| `de45f73` | The sidebar and the mini bar, rebuilt from the design frames |
| `dd326c6` | Settings behind the kebab, one set per mode |
| `bfeddbb` | A tutorial for each surface, and a mode to pick before you join |
| `5b88703` | Runs off a double-clicked file, not just a dev server |

Twenty-eight numbered entries in [V5.2-CHANGES.md](v5.2-paper/V5.2-CHANGES.md) cover the
reasoning, the design frames each piece came from, and the mistakes that cost time.

## v5.1 — The P21–P25 build

v5 with the findings from the five sessions acted on: three presence modes and a recording
light, a status vocabulary that says answered / skipped / reworded, a script with real
sections and progress, notes that actually appear, quieter probes, and a prep step with a
visible commit point.

**Different from v5:** it answers the sessions. Each change is flagged and switchable in
`v5.1-paper/review.html`, which runs three live copies of the card side by side so a change
can be judged rather than described; it exports [REVIEW.md](REVIEW.md), where each one gets
a verdict of Keep / Cut / Rework.

## v5 — OS-aware desktop flow, scripted session

The build the P21–P25 sessions were run on, frozen for comparison. Choose your OS →
desktop → meeting notification → script search → live Teams call with a draggable research
assistant that skips answered questions, rewrites others, surfaces probes, and counts
insights up to a session summary.

**Different from v4:** rebuilt in the Paper design tool; setup and session merged into one
continuous scene with an in-page fake browser rather than separate page navigations; the
scripted Sarah Chen story replaced the free-form question list. That earlier question set
is still reachable at `v5-paper/windows.html?variant=1`.

Windows only — the macOS branch stops at the OS picker. Full file-by-file account in
[v5-paper/CHANGELOG.md](v5-paper/CHANGELOG.md).

## v4 — OS-aware desktop flow

Choose your OS → simulated desktop/setup flow → live session, rebuilt from Figma with
script search, document previews, and sync icons.

**Different from v3:** the first version drawn from real design frames rather than styled in
the browser, and the first to branch on operating system.

## v3 — Full build (wireframe)

The desktop → call flow from v1 — Mac notification → upload script → Google Meet-style call
with a floating AI widget — restyled as a grayscale wireframe.

**Different from v2:** back to v1's full flow, but stripped of colour so the structure could
be judged on its own.

## v2 — Floating interface (wireframe)

Ctrl+K launcher to attach a script or prototype → join → a teleprompter-style overlay that
auto-scrolls through questions with probes underneath and an insight star counter.

**Different from v1:** the assistant stopped being a strip of chrome and became an overlay
floating over the call — the first move toward what the mini bar eventually became. Built
as `desktop.html` + `call.html`; described in detail in [PROGRESS.md](PROGRESS.md).

## v1 — Full build

Desktop notification → upload script → live call with an AI strip surfacing questions,
probes, and insights → insight doc.

The first clickable pass at the whole idea, and the only version that carries the insight
document through to the end. The brief it was built against is [PLANNING.md](PLANNING.md).

---

## Running any of them

No build step, no server required. Either open `index.html?archive` and pick, or open a
version's entry file directly from the table above.

Useful flags on v5 and later: `?skip=call` drops straight into the call, `?dev=1` shows the
variant chip, `?variant=1` loads the archived free-form question set. v5.2 adds `?tour=1`
(replay the tutorial), `?defaults=1` (ignore stored settings) and `?dials=1`.
