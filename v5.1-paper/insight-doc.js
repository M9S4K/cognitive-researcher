// Insight doc — the screen the "View insight doc" button hands off to.
//
// The document is an analysis of the script the assistant actually ran, so the
// sections are the questions from `QUESTION_SETS` in research-toolbar.js, one
// section per question, and each insight answers the question it sits under.
// Variant 2 is the default experience; variant 1 is kept in step so `?variant=1`
// does not land on an analysis of an interview that never happened.
//
// Everything here is simulated, like the rest of the prototype: no recording is
// ever played, no transcript is ever fetched.
(function () {
  const DURATION = 1849; // 30:49, the session length shown on the complete card.
  const DEFAULT_VARIANT = '2';

  const ANALYSES = {
    // ---------------------------------------------------------------- variant 2
    // Tell me about yourself → What are you studying? (+2 probes)
    // → Do you have any work experience? (rewritten) → Where are you from?
    2: {
      summary: 'Sarah is a UX designer six years into agency work, doing a one-year MSc in Human-Computer Interaction alongside three days a week at a London studio. She frames the degree as a hedge rather than a change of direction — a credential for a move in-house she has not made yet.',
      sections: [
        { index: 1, name: 'Introduction', question: 'Tell me about yourself' },
        { index: 2, name: 'Studies', question: 'What are you studying?' },
        { index: 3, name: 'Work experience', question: 'You mentioned you’re an UX designer, how many years of work experience do you have?', note: 'reworded by Rae mid-session' },
        { index: 4, name: 'Where she’s from', question: 'Where are you from?' },
      ],
      insights: [
        {
          section: 1, stamp: '0:42', range: '0:42 – 1:07', heading: 'Designer first, student second',
          text: 'Introduces herself as a designer first and a student second — the course is something she fits around work, not the other way round.',
          turns: [
            { who: 'You', time: '0:31', text: 'Whenever you’re ready — tell me about yourself.' },
            { who: 'Sarah', time: '0:42', cited: true, text: 'I’m a product designer, mostly. I’m doing a masters at the moment but honestly that’s the smaller half of my week — work comes first and the course fits around it.' },
            { who: 'You', time: '1:09', text: 'Say more about how the week actually splits.' },
          ],
        },
        {
          section: 1, stamp: '1:15', range: '1:15 – 1:41', heading: 'Three days studio, two days campus',
          text: 'Splits the week without being asked: three days at the agency, two at university.',
          turns: [
            { who: 'You', time: '1:09', text: 'Say more about how the week actually splits.' },
            { who: 'Sarah', time: '1:15', cited: true, text: 'Three days in the studio, two at uni. Tuesdays and Thursdays are campus days, everything else is client work.' },
            { who: 'You', time: '1:44', text: 'And does that hold, or does it slip?' },
          ],
        },
        {
          section: 1, stamp: '2:03', range: '2:03 – 2:26', heading: 'The label she uses',
          text: 'Volunteers that she is a UX designer here — the detail Rae picked up and used to reword the work-experience question later.',
          turns: [
            { who: 'You', time: '1:56', text: 'How do you describe what you do to people outside the field?' },
            { who: 'Sarah', time: '2:03', cited: true, text: 'I just say UX designer. It’s not quite right any more but it’s the label people recognise.' },
            { who: 'You', time: '2:28', text: 'What would be more right?' },
          ],
        },
        {
          section: 2, stamp: '4:28', range: '4:28 – 4:54', heading: 'Proving, not learning',
          text: 'Reads the MSc as formalising practice she already has rather than as learning something new.',
          turns: [
            { who: 'You', time: '4:14', text: 'What are you studying?' },
            { who: 'Sarah', time: '4:28', cited: true, text: 'HCI, the MSc. I’m not really learning to design — I’ve been doing that for years. I’m learning to prove I can.' },
            { who: 'You', time: '4:56', text: 'That’s a distinction worth sitting on.' },
          ],
        },
        {
          section: 2, stamp: '5:50', range: '5:50 – 6:16', heading: 'Chosen for the walk',
          text: 'Campus is in Southwark, and proximity to the studio was a deciding factor in applying at all.',
          probe: '2.1',
          turns: [
            { who: 'You', time: '5:41', text: 'Oh, whereabouts in London?' },
            { who: 'Sarah', time: '5:50', cited: true, text: 'Southwark. Which sounds like a small thing, but it’s twenty minutes from the studio on foot — I would not have applied if it were an hour each way.' },
            { who: 'You', time: '6:18', text: 'So logistics decided it as much as the course did.' },
          ],
        },
        {
          section: 2, stamp: '7:12', range: '7:12 – 7:37', heading: 'Full-time on paper only',
          text: 'One-year course, full-time on paper; she and her cohort all treat it as part-time around jobs.',
          probe: '2.2',
          turns: [
            { who: 'You', time: '7:02', text: 'And how long is your course?' },
            { who: 'Sarah', time: '7:12', cited: true, text: 'A year. Full-time, technically. Nobody on my course is doing it full-time though — everyone’s working.' },
            { who: 'You', time: '7:39', text: 'Does the department know that?' },
          ],
        },
        {
          section: 3, stamp: '10:34', range: '10:34 – 11:00', heading: 'Six years, all agency',
          text: 'Six years in, all agency-side — she names the absence of in-house experience as the gap herself.',
          turns: [
            { who: 'You', time: '10:21', text: 'You mentioned you’re a UX designer — how many years of work experience do you have?' },
            { who: 'Sarah', time: '10:34', cited: true, text: 'Six, near enough. All agency though. I’ve never sat inside a product team, which I think is the gap on my CV.' },
            { who: 'You', time: '11:02', text: 'Why does that gap matter to you?' },
          ],
        },
        {
          section: 3, stamp: '12:47', range: '12:47 – 13:13', heading: 'Freelancing taught her more',
          text: 'Counts a two-year freelance stretch as her real training, not the agency years that followed it.',
          turns: [
            { who: 'You', time: '12:33', text: 'Where do you think you actually learned the most?' },
            { who: 'Sarah', time: '12:47', cited: true, text: 'The two years I freelanced. No art director, no process, just me and the client. I learned more in that than in the four years since.' },
            { who: 'You', time: '13:15', text: 'What made it teach you more?' },
          ],
        },
        {
          section: 3, stamp: '15:20', range: '15:20 – 15:47', heading: 'The degree as a hedge',
          text: 'Sees the masters as credentialling for an in-house move she expects to be gatekept on.',
          turns: [
            { who: 'You', time: '15:06', text: 'How does the masters fit into that?' },
            { who: 'Sarah', time: '15:20', cited: true, text: 'It’s a hedge. In-house roles ask for things agencies never did. I’d rather have the letters and not need them than need them and not have them.' },
            { who: 'You', time: '15:49', text: 'Has anyone actually asked you for them?' },
          ],
        },
        {
          section: 4, stamp: '19:06', range: '19:06 – 19:32', heading: 'Came for the job, stayed',
          text: 'Grew up in Kuala Lumpur and moved to London for her first agency job; staying was never a decision she made once.',
          turns: [
            { who: 'You', time: '18:54', text: 'And where are you from originally?' },
            { who: 'Sarah', time: '19:06', cited: true, text: 'Kuala Lumpur. I came over for the first agency job and just never went back — six years later, here I am.' },
            { who: 'You', time: '19:34', text: 'Was staying a decision, or a default?' },
          ],
        },
        {
          section: 4, stamp: '21:38', range: '21:38 – 22:05', heading: 'Staying is conditional',
          text: 'Ties staying in London to the in-house move landing before the visa runs down.',
          turns: [
            { who: 'You', time: '21:25', text: 'Do you see yourself staying?' },
            { who: 'Sarah', time: '21:38', cited: true, text: 'Depends entirely on the visa and whether I get in-house. If neither works out I’d rather go home than keep doing agency work here.' },
            { who: 'You', time: '22:07', text: 'That’s a clear line.' },
          ],
        },
        {
          section: 4, stamp: '24:15', range: '24:15 – 24:45', heading: 'What counts back home',
          text: 'Family expectation of a formal qualification is part of why the masters happened at all.',
          turns: [
            { who: 'You', time: '24:02', text: 'Was the masters something your family pushed for?' },
            { who: 'Sarah', time: '24:15', cited: true, text: 'Partly. Back home a degree is the thing that counts, not a portfolio. My parents never really understood what I did until I said the word “masters”.' },
            { who: 'You', time: '24:47', text: 'So it’s doing two jobs at once.' },
          ],
        },
      ],
    },

    // ---------------------------------------------------------------- variant 1
    // A typical day (+2 probes) → Current project → Tools → Challenges
    1: {
      summary: 'Sarah is a second-year masters student researching unpaid community moderation in an online social-deduction game — a community she runs herself. Her day runs lab hours straight into moderation with no boundary between them, and the project grew directly out of work the game’s own tooling was not doing.',
      sections: [
        { index: 1, name: 'A typical day', question: 'As a masters student, what does your day typically look like?' },
        { index: 2, name: 'Current project', question: 'What kind of project are you currently working on?' },
        { index: 3, name: 'Tools', question: 'What tools or software are you using for your project?' },
        { index: 4, name: 'Challenges', question: 'What challenges have you faced during this project?' },
      ],
      insights: [
        {
          section: 1, stamp: '1:04', range: '1:04 – 1:29', heading: 'The evening block',
          text: 'The day ends in a fixed block between finishing lab work and sleeping — four to five evenings a week, every week.',
          turns: [
            { who: 'You', time: '0:51', text: 'As a masters student, what does your day typically look like?' },
            { who: 'Sarah', time: '1:04', cited: true, text: 'Lab until about nine, then it’s the same block every night — four, five evenings a week. That’s when everything else happens.' },
            { who: 'You', time: '1:31', text: 'And is that a decision, or just what’s left over?' },
          ],
        },
        {
          section: 1, stamp: '2:20', range: '2:20 – 2:45', heading: 'The commute is the queue',
          text: 'Takes the bus rather than cycling specifically because it is the only stretch of the day she can clear the moderation queue.',
          probe: '1.1',
          turns: [
            { who: 'You', time: '2:08', text: 'How do you usually commute?' },
            { who: 'Sarah', time: '2:20', cited: true, text: 'Bus, always. I could cycle and it’d be quicker, but the bus is the only forty minutes where I can actually sit and clear the reports.' },
            { who: 'You', time: '2:47', text: 'So the slower option is the useful one.' },
          ],
        },
        {
          section: 1, stamp: '4:12', range: '4:12 – 4:36', heading: 'Taught hours are the small part',
          text: 'Sixty credits of taught modules this term, with lab hours on top and effectively unbounded.',
          probe: '1.2',
          turns: [
            { who: 'You', time: '4:01', text: 'How many credit hours do you have per term?' },
            { who: 'Sarah', time: '4:12', cited: true, text: 'Sixty credits taught, so maybe nine contact hours. The lab isn’t counted at all, and the lab is most of it.' },
            { who: 'You', time: '4:38', text: 'Who decides how many lab hours you do?' },
          ],
        },
        {
          section: 2, stamp: '9:40', range: '9:40 – 10:06', heading: 'Studying the thing she does',
          text: 'The project is a study of unpaid community moderation in an online social-deduction game — one she moderates herself.',
          turns: [
            { who: 'You', time: '9:22', text: 'What kind of project are you currently working on?' },
            { who: 'Sarah', time: '9:40', cited: true, text: 'Unpaid moderation in online games. Which is also just… my evenings. I run a 400-member server for one, so I’m studying the thing I already do.' },
            { who: 'You', time: '10:08', text: 'Did the project come out of the moderating, or the other way round?' },
          ],
        },
        {
          section: 2, stamp: '11:05', range: '11:05 – 11:30', heading: 'One continuous shift',
          text: 'Treats lab hours and moderation as a single continuous shift rather than two separate commitments.',
          turns: [
            { who: 'You', time: '10:51', text: 'Where does the moderation sit against the coursework?' },
            { who: 'Sarah', time: '11:05', cited: true, text: 'It doesn’t sit against it, it’s the same day. I finish the lab, I open the queue. One long shift with a commute in the middle.' },
            { who: 'You', time: '11:32', text: 'Does anyone else on the server work like that?' },
          ],
        },
        {
          section: 2, stamp: '14:28', range: '14:28 – 14:57', heading: 'The topic came from the gap',
          text: 'Chose the topic because automated reporting missed coordinated behaviour she was already catching by hand.',
          turns: [
            { who: 'You', time: '14:10', text: 'What made this the project rather than something else?' },
            { who: 'Sarah', time: '14:28', cited: true, text: 'The flags never catch two people working together. I was already reading whole lobbies back to find it, so the research question was just… why am I doing this manually?' },
            { who: 'You', time: '14:59', text: 'How long does reading one back take?' },
          ],
        },
        {
          section: 3, stamp: '17:52', range: '17:52 – 18:15', heading: 'A spreadsheet as the system',
          text: 'Keeps a personal spreadsheet of repeat offenders because the game holds no memory between lobbies.',
          turns: [
            { who: 'You', time: '17:36', text: 'What tools or software are you using for your project?' },
            { who: 'Sarah', time: '17:52', cited: true, text: 'A spreadsheet, mostly. Every lobby starts clean in the game, so I keep my own sheet — name, date, what they did. That’s the only memory there is.' },
            { who: 'You', time: '18:17', text: 'Who else can see that sheet?' },
          ],
        },
        {
          section: 3, stamp: '20:14', range: '20:14 – 20:39', heading: 'Screenshots as evidence',
          text: 'Screenshots are the only durable evidence; chat logs expire before an appeal is resolved.',
          turns: [
            { who: 'You', time: '19:58', text: 'When someone appeals, what do you have to go on?' },
            { who: 'Sarah', time: '20:14', cited: true, text: 'Screenshots. The logs roll off after a week and appeals take longer than that, so if I didn’t screenshot it, it didn’t happen.' },
            { who: 'You', time: '20:41', text: 'That sounds like a lot of manual capture.' },
          ],
        },
        {
          section: 3, stamp: '22:36', range: '22:36 – 22:58', heading: 'Everything is unofficial',
          text: 'Every tool she relies on was built by other players; none of it is officially supported.',
          turns: [
            { who: 'You', time: '22:20', text: 'Are any of these official tools?' },
            { who: 'Sarah', time: '22:36', cited: true, text: 'None of them. Every single thing I use was written by someone in the community. If they stop maintaining it, I just lose it.' },
            { who: 'You', time: '23:00', text: 'Has that happened?' },
          ],
        },
        {
          section: 4, stamp: '25:03', range: '25:03 – 25:31', heading: 'Deciding without context',
          text: 'The hardest calls are ambiguous ones — she has no way to see intent, only the transcript.',
          turns: [
            { who: 'You', time: '24:47', text: 'What challenges have you faced during this project?' },
            { who: 'Sarah', time: '25:03', cited: true, text: 'The ones where I can’t tell if it’s a joke between friends or actual harassment. The text looks identical. I’m guessing at intent.' },
            { who: 'You', time: '25:33', text: 'What do you do when you can’t tell?' },
          ],
        },
        {
          section: 4, stamp: '27:41', range: '27:41 – 28:04', heading: 'It follows her out',
          text: 'Difficult cases follow her past the session; she describes re-reading decisions the next day.',
          turns: [
            { who: 'You', time: '27:25', text: 'Does it stay with you after you close the laptop?' },
            { who: 'Sarah', time: '27:41', cited: true, text: 'Sometimes I’ll be in a lecture the next day still thinking about whether I got one right. I’ll go back and read it again.' },
            { who: 'You', time: '28:06', text: 'Is there anyone you can check that with?' },
          ],
        },
        {
          section: 4, stamp: '29:18', range: '29:18 – 29:44', heading: 'No handover',
          text: 'There is no handover when she stops — the queue simply waits until she comes back.',
          turns: [
            { who: 'You', time: '29:02', text: 'What happens when you take a week off?' },
            { who: 'Sarah', time: '29:18', cited: true, text: 'Nothing happens. That’s the problem. It piles up and it’s all still there when I get back. There’s nobody to hand it to.' },
            { who: 'You', time: '29:46', text: 'Thank you — that’s a good place to stop.' },
          ],
        },
      ],
    },
  };

  const params = new URLSearchParams(window.location.search);
  const requested = params.get('variant');
  const variant = ANALYSES[requested] ? requested : DEFAULT_VARIANT;
  const analysis = ANALYSES[variant];
  const SECTIONS = analysis.sections;
  const INSIGHTS = analysis.insights;

  // Open on the second insight — far enough in to show the doc mid-use rather
  // than at the very top, which is how the design frames it.
  const DEFAULT_INDEX = 1;

  const els = {
    track: document.getElementById('player-track'),
    sections: document.getElementById('sections'),
    summary: document.querySelector('.summary'),
    transcriptBody: document.getElementById('transcript-body'),
    transcriptPlay: document.getElementById('transcript-play'),
    transcriptPlayLabel: document.getElementById('transcript-play-label'),
    playerElapsed: document.getElementById('player-elapsed'),
    playerFill: document.getElementById('player-fill'),
    playerKnob: document.getElementById('player-knob'),
    eyebrowCount: document.querySelector('.eyebrow span:last-child'),
  };

  let selected = DEFAULT_INDEX;
  const citedTurnIndex = {};

  function toSeconds(stamp) {
    const [m, s] = stamp.split(':').map(Number);
    return m * 60 + s;
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function ratioFor(seconds) {
    return Math.max(0, Math.min(1, seconds / DURATION));
  }

  // A section starts where its first insight does, so the scrubber's ticks are
  // derived from the analysis rather than hand-placed.
  function sectionStart(section) {
    const first = INSIGHTS.find((insight) => insight.section === section.index);
    return first ? toSeconds(first.stamp) : 0;
  }

  function buildPlayer() {
    SECTIONS.forEach((section) => {
      const ratio = ratioFor(sectionStart(section));

      const tick = document.createElement('span');
      tick.className = 'player-tick';
      tick.style.left = `${ratio * 100}%`;
      els.track.appendChild(tick);

      const label = document.createElement('span');
      label.className = 'player-label';
      label.dataset.section = section.index;
      label.dataset.ratio = ratio;
      label.textContent = section.name;
      els.track.appendChild(label);
    });
    layoutLabels();
    window.addEventListener('resize', layoutLabels);
  }

  // Ticks sit at their true position on the scrubber; labels start there but are
  // nudged along so two sections close together in time never overprint.
  const LABEL_GAP = 16;
  function layoutLabels() {
    const track = els.track.clientWidth;
    const labels = Array.from(els.track.querySelectorAll('.player-label'));
    if (!track || !labels.length) return;

    let minLeft = 0;
    const placed = labels.map((label) => {
      const width = label.offsetWidth;
      const left = Math.max(minLeft, Number(label.dataset.ratio) * track);
      minLeft = left + width + LABEL_GAP;
      return { label, width, left };
    });

    // Second pass from the right, so a crowded run cannot push the last label
    // off the end of the track.
    let maxRight = track;
    for (let i = placed.length - 1; i >= 0; i--) {
      const item = placed[i];
      item.left = Math.max(0, Math.min(item.left, maxRight - item.width));
      item.label.style.left = `${item.left}px`;
      maxRight = item.left - LABEL_GAP;
    }
  }

  function buildSections() {
    SECTIONS.forEach((section) => {
      const wrap = document.createElement('section');
      wrap.className = 'section';
      wrap.dataset.section = section.index;

      // The question is shown verbatim so the doc reads as an answer to the
      // script the assistant ran, not as a free-standing summary.
      const note = section.note ? ` <span class="section-note">· ${section.note}</span>` : '';
      wrap.innerHTML = `
        <div class="section-head">
          <h2 class="section-name">${section.name}</h2>
          <span class="section-rule"></span>
        </div>
        <p class="section-question">“${section.question}”${note}</p>`;

      INSIGHTS.forEach((insight, index) => {
        if (insight.section !== section.index) return;
        wrap.appendChild(buildInsight(insight, index));
      });

      els.sections.appendChild(wrap);
    });
  }

  function buildInsight(insight, index) {
    const row = document.createElement('div');
    row.className = 'insight';
    row.dataset.index = index;
    row.innerHTML = `
      <span class="stamp-lane"><span class="stamp">${insight.stamp}</span></span>
      <div class="insight-card">
        <span class="insight-bar"></span>
        <div class="insight-body">
          <button class="insight-hit" type="button" aria-pressed="false">
            <span class="insight-text">${insight.text}</span>
          </button>
        </div>
      </div>`;

    // Insights drawn from a probe say so — the probe numbers come straight from
    // the "Consider probing" card the assistant showed during the call.
    const source = insight.probe
      ? `Evidence ${insight.range} · probe ${insight.probe}`
      : `Evidence ${insight.range}`;

    const actions = document.createElement('div');
    actions.className = 'insight-actions';
    actions.innerHTML = `
      <span class="evidence-mark">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5.6 8.4 8.4 5.6M6.1 3.4 7.4 2.1a2.8 2.8 0 0 1 4 4L10.1 7.4M7.9 10.6 6.6 11.9a2.8 2.8 0 0 1-4-4L3.9 6.6" fill="none" stroke="#1a1a1a" stroke-width="1.4" stroke-linecap="round"/></svg>
        ${source}
      </span>`;
    actions.appendChild(makeAction('Copy quote', 'Copied', () => {
      const cited = insight.turns.find((turn) => turn.cited);
      if (cited && navigator.clipboard) navigator.clipboard.writeText(cited.text).catch(() => {});
    }));
    actions.appendChild(makeAction('Add to theme', 'Added'));
    row.querySelector('.insight-body').appendChild(actions);

    row.querySelector('.insight-hit').addEventListener('click', () => select(index));
    return row;
  }

  // Actions are simulated: the label confirms and reverts, nothing is stored.
  function makeAction(label, confirmLabel, onRun) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      if (onRun) onRun();
      button.textContent = confirmLabel;
      window.setTimeout(() => { button.textContent = label; }, 1400);
    });
    return button;
  }

  // The panel is the interview transcript, so it is built once as a continuous
  // run of turns. Selecting an insight highlights its cited line and scrolls to
  // it, rather than swapping the panel's contents out.
  function buildTranscript() {
    const seen = new Set();
    INSIGHTS.forEach((insight, index) => {
      insight.turns.forEach((turn) => {
        const key = `${turn.who}-${turn.time}`;
        if (seen.has(key)) {
          // Consecutive insights can share a turn; keep the first copy and let
          // the later insight point at it.
          if (turn.cited) citedTurnIndex[index] = key;
          return;
        }
        seen.add(key);
        if (turn.cited) citedTurnIndex[index] = key;

        const el = document.createElement('div');
        el.className = 'turn';
        el.dataset.key = key;
        el.innerHTML = `
          <div>
            <div class="turn-meta">
              <span class="turn-who">${turn.who}</span>
              <span class="turn-time">${turn.time}</span>
            </div>
            <div class="turn-text">${turn.text}</div>
          </div>`;
        els.transcriptBody.appendChild(el);
      });
    });
  }

  function highlightTurn(insight, index, immediate) {
    els.transcriptPlayLabel.textContent = `Play from ${insight.stamp}`;
    const key = citedTurnIndex[index];
    let target = null;
    els.transcriptBody.querySelectorAll('.turn').forEach((el) => {
      const isCited = el.dataset.key === key;
      el.classList.toggle('cited', isCited);
      if (isCited) target = el;
    });
    if (!target) return;
    const body = els.transcriptBody;
    const top = target.offsetTop - body.offsetTop - 26;
    body.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
  }

  function movePlayhead(seconds) {
    const ratio = ratioFor(seconds);
    els.playerFill.style.width = `${ratio * 100}%`;
    els.playerKnob.style.left = `${ratio * 100}%`;
    els.playerElapsed.textContent = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  }

  function select(index, options) {
    const insight = INSIGHTS[index];
    if (!insight) return;
    selected = index;

    els.sections.querySelectorAll('.insight').forEach((row) => {
      const isSelected = Number(row.dataset.index) === index;
      row.classList.toggle('selected', isSelected);
      row.querySelector('.insight-hit').setAttribute('aria-pressed', String(isSelected));
    });

    els.track.querySelectorAll('.player-label').forEach((label) => {
      label.classList.toggle('current', Number(label.dataset.section) === insight.section);
    });

    movePlayhead(toSeconds(insight.stamp));
    highlightTurn(insight, index, Boolean(options && options.immediate));
  }

  function goBackToSession() {
    // In v5.1 the analysis runs as an application window inside the session screen,
    // so leaving it means asking that window to close — navigating would load the
    // whole desktop inside this frame.
    if (window.parent !== window) {
      window.parent.postMessage({ rae: 'close-doc' }, '*');
      return;
    }
    // Standalone fallback. v5.1 is the Windows branch only, so `rae-os` is
    // deliberately not consulted. Only a pinned variant is carried: appending the
    // default would also switch on the dev variant chip on the way back.
    const query = variant === DEFAULT_VARIANT ? '?skip=call' : `?skip=call&variant=${variant}`;
    window.location.href = 'windows.html' + query;
  }

  els.summary.textContent = analysis.summary;
  buildPlayer();
  buildSections();
  buildTranscript();
  if (els.eyebrowCount) els.eyebrowCount.textContent = `Sarah Chen · ${INSIGHTS.length} insights`;
  select(DEFAULT_INDEX, { immediate: true });

  els.transcriptPlay.addEventListener('click', () => {
    movePlayhead(toSeconds(INSIGHTS[selected].stamp));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      goBackToSession();
    }
  });
})();
