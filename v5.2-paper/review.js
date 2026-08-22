// Review harness — three live copies of the research assistant, each with its own
// flags, plus a place to record what should be kept.
//
// The card's markup and styles are lifted out of `windows.html` at load rather than
// duplicated here, so this page can never drift from the real thing.
(function () {
  const SOURCE = 'windows.html';
  const STORE = 'rae-review-notes';

  // Order matters: this is the order the changes are argued about below.
  const CHANGES = [
    { flag: 'recording', name: 'Start recording, and an idle state before it',
      detail: 'The assistant arrives with a hollow dot and “Not recording”, and does nothing until Start is pressed. The opening sequence fires from Start rather than from a click. Switching this off records from the first click, as v5 did.',
      who: 'new in review' },
    { flag: 'briefing', name: 'A briefing above the first question',
      detail: 'Thanks, scope, no right answers, the right to skip or stop, who sees it, and the request to record. Folds away once recording starts.',
      who: 'new in review' },
    { flag: 'advance', name: 'A Next button that names the beat',
      detail: 'The footer carries one action at a time — Start recording, then Next (labelled “Next question”, “Log the answer”, “Mark probe 2.1”), then Finish Session. Off, clicking the list is the only way on, which is what v5 did and nothing said so.',
      who: 'new in review' },
    { flag: 'sections', name: 'Five sections, a sticky head, and a real progress bar',
      detail: 'The script becomes 5 sections / 18 questions. One section shows at a time under “Section 1 of 5 · Introduction · 2 of 4”, the rest are listed by name and count, and the bar fills as questions are dealt with. Off, it is a flat list of four and a decorative bar.',
      who: 'P22 · P24 · P25' },
    { flag: 'notes', name: 'Rae’s notes, her words, and your own lane',
      detail: 'A note appears under each answered question, with the verbatim quote one tap away, and “Add your own note” / N drops your own line tagged You. Off, the panel is questions only — which is what made P22 say it looked like the script.',
      who: 'P21 · P22 · P24 · P25' },
    { flag: 'status', name: 'Strike-through, skip chips and the paraphrased tag',
      detail: 'Answered strikes through with a timestamp; skipped says “Skipped · answered at 1:22” with an Undo; a reworded line is tagged. Off, everything gets the same single check mark.',
      who: 'P22 · P23 · P24 · P25' },
    { flag: 'proposal', name: 'Rewording offered, not applied',
      detail: 'Rae proposes a reworded question with Use this / Keep original, and the original stays intact until you accept. Off, Rae simply rewrites it and you find out afterwards.',
      who: 'P23 · P22' },
    { flag: 'probes', name: 'Probes as keywords instead of sentences',
      detail: 'Probes arrive as chips — “whereabouts”, “course length” — and expand to the full wording on tap. Dismissible per card, and switchable off entirely. Off, they are full sentences in rows, as v5 showed them.',
      who: 'P23 · P24 · P25' },
    { flag: 'snackactions', name: 'Undo inside the snackbar',
      detail: 'Anything the assistant does on its own reports in the snackbar and carries the way to reverse it — Put it back, Undo, Use Rae’s. Off, the message is read-only and the undo lives only on the row.',
      who: 'new in review' },
    { flag: 'scaling', name: 'The top question set larger (v5)',
      detail: 'v5 scaled each question by its distance from the top, so the active one was biggest. Removed in v5.1 — turn it on to see it back.',
      who: 'removed on request' },
    { flag: 'line', name: 'The connector line down the numbers (v5)',
      detail: 'v5 ran a vertical rule from the first question number to the last. Removed in v5.1 — turn it on to see it back.',
      who: 'removed on request' },
  ];

  const COLUMNS = [
    { name: 'v5 — before', flags: allFlags(false) },
    { name: 'v5.1 — now', flags: allFlags(true) },
    { name: 'Yours to play with', flags: allFlags(true) },
  ];

  function allFlags(on) {
    const flags = {};
    CHANGES.forEach((change) => {
      // `scaling` and `line` are v5 behaviours, so "before" means on and "now" off.
      const isRemoval = change.flag === 'scaling' || change.flag === 'line';
      flags[change.flag] = isRemoval ? !on : on;
    });
    // Presence is a layout that only makes sense against the meeting window, so it is
    // held off here and judged in the real screen instead.
    flags.presence = false;
    return flags;
  }

  const els = {
    columns: document.getElementById('columns'),
    changes: document.getElementById('changes'),
    saved: document.getElementById('saved'),
  };

  let notes = readNotes();

  function readNotes() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (error) { return {}; }
  }

  function writeNotes() {
    try { localStorage.setItem(STORE, JSON.stringify(notes)); } catch (error) { /* private mode */ }
    els.saved.textContent = `Saved in this browser · ${new Date().toLocaleTimeString()}`;
  }

  // ------------------------------------------------------------------ columns
  let template = null;

  function buildColumn(config) {
    const column = document.createElement('div');
    column.className = 'column';

    const head = document.createElement('div');
    head.className = 'col-head';
    head.innerHTML = `<span class="col-name">${config.name}</span>`
      + '<button class="col-replay" type="button">Replay</button>';
    column.appendChild(head);

    const flagWrap = document.createElement('div');
    flagWrap.className = 'flags';
    column.appendChild(flagWrap);

    const stage = document.createElement('div');
    stage.className = 'stage';
    column.appendChild(stage);

    let handle = null;

    function mount() {
      stage.innerHTML = '';
      const card = template.cloneNode(true);
      card.removeAttribute('id');
      card.classList.add('visible');
      stage.appendChild(card);
      handle = ResearchToolbar.init(card, { flags: Object.assign({}, config.flags), keys: false });
    }

    CHANGES.forEach((change) => {
      const label = document.createElement('label');
      label.className = 'flag' + (config.flags[change.flag] ? ' on' : '');
      label.innerHTML = `<input type="checkbox"${config.flags[change.flag] ? ' checked' : ''}><span>${change.flag}</span>`;
      label.querySelector('input').addEventListener('change', (event) => {
        config.flags[change.flag] = event.target.checked;
        label.classList.toggle('on', event.target.checked);
        mount();
      });
      flagWrap.appendChild(label);
    });

    head.querySelector('.col-replay').addEventListener('click', () => mount());

    mount();
    return column;
  }

  // ---------------------------------------------------------------- decisions
  function buildChanges() {
    CHANGES.forEach((change) => {
      const saved = notes[change.flag] || { verdict: '', comment: '' };
      const row = document.createElement('article');
      row.className = 'change';
      row.innerHTML = `
        <div>
          <h3>${change.name}</h3>
          <p>${change.detail}</p>
          <span class="who">${change.who}</span>
        </div>
        <div>
          <div class="verdicts">
            <button class="verdict" type="button" data-value="keep">Keep</button>
            <button class="verdict" type="button" data-value="remove">Cut</button>
            <button class="verdict" type="button" data-value="change">Rework</button>
          </div>
          <textarea class="comment" placeholder="What works, what doesn't, what you'd change"></textarea>
        </div>`;

      const verdicts = [...row.querySelectorAll('.verdict')];
      const comment = row.querySelector('.comment');

      function paint() {
        verdicts.forEach((button) => button.classList.toggle('on', button.dataset.value === saved.verdict));
      }
      verdicts.forEach((button) => {
        button.addEventListener('click', () => {
          saved.verdict = saved.verdict === button.dataset.value ? '' : button.dataset.value;
          notes[change.flag] = saved;
          paint();
          writeNotes();
        });
      });
      comment.value = saved.comment;
      comment.addEventListener('input', () => {
        saved.comment = comment.value;
        notes[change.flag] = saved;
        writeNotes();
      });

      paint();
      els.changes.appendChild(row);
    });
  }

  // ------------------------------------------------------------------ export
  const VERDICT_WORD = { keep: 'Keep', remove: 'Cut', change: 'Rework', '': 'Undecided' };

  function toMarkdown() {
    const lines = ['# v5.1 — what to keep', '', `Reviewed ${new Date().toISOString().slice(0, 10)}.`, ''];
    CHANGES.forEach((change) => {
      const saved = notes[change.flag] || {};
      lines.push(`## ${change.name}`);
      lines.push('');
      lines.push(`- **Flag:** \`${change.flag}\``);
      lines.push(`- **Raised by:** ${change.who}`);
      lines.push(`- **Verdict:** ${VERDICT_WORD[saved.verdict || '']}`);
      lines.push('');
      lines.push(saved.comment ? saved.comment.trim() : '_No comment._');
      lines.push('');
    });
    return lines.join('\n');
  }

  document.getElementById('copy-md').addEventListener('click', () => {
    const button = document.getElementById('copy-md');
    navigator.clipboard.writeText(toMarkdown()).then(() => {
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = 'Copy notes'; }, 1400);
    }).catch(() => { button.textContent = 'Copy failed'; });
  });

  document.getElementById('download-md').addEventListener('click', () => {
    const blob = new Blob([toMarkdown()], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'REVIEW.md';
    link.click();
    URL.revokeObjectURL(link.href);
  });

  // ------------------------------------------------------------------- boot
  fetch(SOURCE)
    .then((response) => response.text())
    .then((html) => {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      // The card's own stylesheet comes across whole; nothing is restated here. It
      // also carries `body`, `html` and bare `button` rules for the desktop screen,
      // so this page's own sheet is moved after it to win on equal specificity.
      const own = document.getElementById('review-style');
      parsed.querySelectorAll('style').forEach((style) => document.head.appendChild(style));
      if (own) document.head.appendChild(own);
      template = parsed.getElementById('research-toolbar');
      if (!template) throw new Error('no toolbar in ' + SOURCE);
      COLUMNS.forEach((config) => els.columns.appendChild(buildColumn(config)));
      buildChanges();
      els.saved.textContent = 'Nothing saved yet.';
    })
    .catch((error) => {
      els.columns.innerHTML = `<p class="lede">Could not load the assistant from ${SOURCE}: ${error.message}</p>`;
    });
})();
