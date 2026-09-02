# Cognitive Researcher

A clickable prototype of **Ria**, an AI research assistant that sits beside a solo
researcher during a remote user interview — reading the script alongside them, taking the
notes, ticking off what has been answered, and offering the follow-up worth asking.

The problem it explores: standard practice wants two researchers, one to engage the
participant and one to take notes, but most teams can only afford one. That person has to
run the script, probe, note, spot insights, watch behaviour and keep time at once. This
asks how far an assistant can carry that load without taking the interview away from them.
Longer version in [PLANNING.md](PLANNING.md).

## Running it

Plain HTML, CSS and vanilla JS. No build step, no server, no dependencies — open
`index.html` and it goes straight to the current version.

To see the others, open `index.html?archive` for the picker.

## Versions

Seven iterations, all still runnable, each tagged and released.
**[VERSIONS.md](VERSIONS.md) is the index** — what each one is, what changed from the one
before, and the file that opens it.

| Tag | Name | Opens at |
|---|---|---|
| [`v5.2`](../../releases/tag/v5.2) | The mini bar build — *current* | `v5.2-paper/windows.html` |
| [`v5.1`](../../releases/tag/v5.1) | The P21–P25 build | `v5.1-paper/windows.html` |
| [`v5`](../../releases/tag/v5) | OS-aware desktop flow, scripted session | `v5-paper/os-choice.html` |
| [`v4`](../../releases/tag/v4) | OS-aware desktop flow | `archive/v4-figma/os-choice.html` |
| [`v3`](../../releases/tag/v3) | Full build (wireframe) | `archive/v3-wireframe/desktop.html` |
| [`v2`](../../releases/tag/v2) | Floating interface (wireframe) | `archive/v2-lofi/launcher.html` |
| [`v1`](../../releases/tag/v1) | Full build | `archive/v1-current/setup.html` |

## Where the writing is

- [VERSIONS.md](VERSIONS.md) — the version index, and how each differs from the last.
- [v5.2-paper/V5.2-CHANGES.md](v5.2-paper/V5.2-CHANGES.md) — twenty-eight entries on the
  current build: what changed, which design frame it came from, and what cost time.
- [v5.2-paper/INTERACTION-PATTERNS.md](v5.2-paper/INTERACTION-PATTERNS.md) — the
  behavioural spec: every screen, trigger, state class, timing and easing. Read this
  before changing v5.2.
- [REVIEW.md](REVIEW.md) — the five research sessions' findings, one entry per change,
  each with a verdict.

## Status

A prototype, not a product. The data is scripted and the AI is simulated — there is no
transcription, no model, no backend and no auth. It exists to be clicked through and
argued with.
