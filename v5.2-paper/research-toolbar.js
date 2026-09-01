window.ResearchToolbar = (function () {
  // The loaded script, as a script: five sections and eighteen questions. Three
  // participants read the old flat list of four as a warm-up or a partial script,
  // so the shape has to be visible even though only one section is on screen.
  //
  // Section 1 holds the four questions the scripted story in the spec runs on,
  // verbatim and in order — SCRIPT_*_INDEX below still points into it.
  const SCRIPTS = {
    1: {
      title: 'DT — UT script',
      briefing: {
        title: 'Before you start',
        text: 'Thanks for making the time today. This is about half an hour on how you actually work — there are no right answers, and you can skip anything or stop whenever you like. We are a small team building research tooling, and nothing you say goes further than us. I would like to record it so I can listen properly instead of writing everything down — is that alright?',
      },
      sections: [
        {
          name: 'A typical day',
          questions: [
            {
              text: 'As a masters student, what does your day typically look like?',
              stamp: '4:36',
              note: 'The real work happens in the evening block; taught hours are the small part of the week.',
              quote: 'The timetable says twelve hours. The actual work is every evening after that.',
              probes: [
                { number: '1.1', keyword: 'commute', text: 'How do you usually commute?' },
                { number: '1.2', keyword: 'credit hours', text: 'How many credit hours do you have per term?' },
              ],
            },
            {
              text: 'What kind of project are you currently working on?', stamp: '9:12',
              note: 'Game moderation study — scoped by her supervisor, narrowed twice since.',
              quote: 'It started much broader. We cut it down twice because I could not recruit.',
            },
            {
              text: 'What tools or software are you using for your project?', stamp: '18:15',
              note: 'A spreadsheet is the system of record; screenshots stand in as evidence.',
              quote: 'Honestly it is a spreadsheet. Everything else is screenshots pasted into it.',
            },
            {
              text: 'What challenges have you faced during this project?', stamp: '27:41',
              note: 'Deciding without context, and no handover when someone else picks it up.',
              quote: 'You are making the call with half the picture, and nobody writes down why.',
            },
          ],
        },
        {
          name: 'The project',
          questions: [
            { text: 'How did the project get scoped?' },
            { text: 'Who else is involved in it?' },
            { text: 'What does a good week on it look like?' },
          ],
        },
        {
          name: 'Tools',
          questions: [
            { text: 'Which tool do you reach for first?' },
            { text: 'What have you tried and abandoned?' },
            { text: 'Where does the work leave one tool and enter another?' },
            { text: 'What do you keep outside any tool at all?' },
          ],
        },
        {
          name: 'Friction',
          questions: [
            { text: 'When did you last lose work?' },
            { text: 'What takes longer than it should?' },
            { text: 'What do you redo every time?' },
          ],
        },
        {
          name: 'Wrap-up',
          questions: [
            { text: 'If one thing changed, what would it be?' },
            { text: 'Is there anything I should have asked?' },
            { text: 'Who else should I be speaking to?' },
          ],
        },
      ],
    },
    2: {
      title: 'ET — interview script',
      briefing: {
        title: 'Before you start',
        text: 'Thanks for joining, Sarah. This is about half an hour on your work and the course — there are no right answers, and you can skip anything or stop whenever you like. We are a small team building research tooling, and nothing you say goes further than us. I would like to record it so I can listen properly instead of writing everything down — is that alright?',
      },
      sections: [
        {
          name: 'Introduction',
          questions: [
            {
              text: 'Tell me about yourself', stamp: '1:41',
              note: 'Designer first, student second. Three days at the studio, two on campus — the MSc fits around agency work, not the other way round.',
              quote: 'I’m a product designer, mostly. I’m doing a masters at the moment but honestly that’s the smaller half of my week — work comes first and the course fits around it.',
            },
            {
              text: 'What are you studying?',
              stamp: '7:37',
              note: 'MSc in HCI. Reads it as formalising practice she already has rather than learning something new.',
              quote: 'HCI, the MSc. I’m not really learning to design — I’ve been doing that for years. I’m learning to prove I can.',
              probes: [
                { number: '2.1', keyword: 'whereabouts', text: 'oh whereabouts in London?' },
                { number: '2.2', keyword: 'course length', text: 'and how long is your course?' },
              ],
            },
            {
              text: 'Do you have any work experience?',
              stamp: '15:47',
              note: 'Six years, all agency-side. Names the missing in-house experience as the gap herself.',
              quote: 'Six, near enough. All agency though. I’ve never sat inside a product team, which I think is the gap on my CV.',
              rewrite: 'You mentioned you’re an UX designer, how many years of work experience do you have?',
            },
            // Answered on the way through Q1, which is why the assistant skips it.
            {
              text: 'Where are you from?', stamp: '1:22',
              note: 'Came up while she was introducing herself — moved to London for the job and stayed.',
              quote: 'I’m not from London originally. I came down for the job and then just… stayed, really.',
            },
          ],
        },
        {
          name: 'Current work',
          questions: [
            { text: 'Walk me through what you are working on right now.' },
            { text: 'Who do you hand that work to?' },
            { text: 'What does the studio expect of you in a week?' },
            { text: 'How does the course fit around it?' },
          ],
        },
        {
          name: 'Tools & workflow',
          questions: [
            { text: 'What are you designing in day to day?' },
            { text: 'Where does research live once it is done?' },
            { text: 'What do you keep outside any tool?' },
          ],
        },
        {
          name: 'Challenges',
          questions: [
            { text: 'What is the hardest part of the week?' },
            { text: 'When did you last redo work you had already done?' },
            { text: 'What slows a project down most often?' },
            { text: 'What have you stopped trying to fix?' },
          ],
        },
        {
          name: 'Wrap-up',
          questions: [
            { text: 'If one thing changed tomorrow, what would it be?' },
            { text: 'Is there anything I should have asked?' },
            { text: 'Anyone else I should speak to?' },
          ],
        },
      ],
    },
  };

  // The variant that ships as the default experience.
  const DEFAULT_VARIANT = '2';

  // Presence: how much of the screen the assistant is allowed to take. The
  // sessions split three ways on this, so it is a setting rather than a default.
  // Every change v5.1 made to the assistant can be switched off, so it can be judged
  // on its own rather than as part of the pile. `true` here is v5.1's behaviour;
  // `scaling` and `line` are the two things v5.1 removed, so they default to false and
  // turning them on restores v5. See `review.html`.
  const FLAG_DEFAULTS = {
    briefing: true,      // the preamble above the first question
    recording: true,     // the idle state and the Start recording gate
    advance: true,       // the footer's Next button
    presence: true,      // the mini bar / sidebar switch
    sections: true,      // five-section framing, sticky head, real progress
    notes: true,         // Rae's notes, "her words", and your own lane
    probes: true,        // keyword chips rather than full sentences
    status: true,        // strike-through, skip chip, paraphrased tag, stamps
    proposal: true,      // rewording offered rather than applied
    snackactions: true,  // undo buttons inside the snackbar
    scaling: false,      // v5's focus scaling of the top question
    line: false,         // v5's connector line down the question numbers
  };

  function readFlags() {
    const params = new URLSearchParams(window.location.search);
    const flags = Object.assign({}, FLAG_DEFAULTS);
    Object.keys(FLAG_DEFAULTS).forEach((name) => {
      const value = params.get(name);
      if (value === 'on' || value === '1') flags[name] = true;
      if (value === 'off' || value === '0') flags[name] = false;
    });
    return flags;
  }

  // Two modes: the mini bar you run the session from, and the sidebar you open when
  // you want the whole script. The floating card it used to default to is gone, and
  // with it the resizing — the bar hugs its content, the sidebar is a fixed column.
  const PRESENCE_MODES = ['compact', 'dock'];
  const PRESENCE_KEY = 'rae-presence';
  const SUGGESTIONS_KEY = 'rae-suggestions';
  const OPTIONS_KEY = 'rae-options';

  // What Rae does in each surface. The two are not the same instrument: the mini bar is
  // 324px of one question at a time, so it offers follow-ups and a line of your own and
  // keeps her write-ups out of the way; the sidebar is the whole script laid out, so her
  // notes belong in it and a note of your own is an interruption. Hence two sets of
  // defaults rather than one — and a switch to run one set in both.
  const OPTIONS = ['probes', 'ai', 'jumps', 'manual'];
  const OPTION_DEFAULTS = {
    compact: { probes: true, ai: false, jumps: true, manual: true },
    dock: { probes: true, ai: true, jumps: true, manual: false },
  };

  const QUESTION_SNAP_DURATION = 450;
  // v5's focus scaling, kept only so `?scaling=on` can put it back for comparison.
  const QUESTION_MIN_SCALE = 0.833;
  const QUESTION_SCALE_FALLOFF = 90;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function readStored(key) {
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  }

  function writeStored(key, value) {
    try { window.localStorage.setItem(key, value); } catch (error) { /* private mode */ }
  }

  function cubicBezierEasing(x1, y1, x2, y2) {
    const A = (a1, a2) => 1 - 3 * a2 + 3 * a1;
    const B = (a1, a2) => 3 * a2 - 6 * a1;
    const C = (a1) => 3 * a1;
    const calc = (t, a1, a2) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
    const slope = (t, a1, a2) => 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
    return (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        t -= (calc(t, x1, x2) - x) / s;
      }
      return calc(t, y1, y2);
    };
  }
  const questionSnapEasing = cubicBezierEasing(0.74, 0.02, 0.33, 1);

  function injectStyles() {
    if (document.getElementById('research-toolbar-styles')) return;
    const style = document.createElement('style');
    style.id = 'research-toolbar-styles';
    style.textContent = `
      .variant-toggle {
        position: fixed;
        z-index: 20;
        top: 16px;
        left: 16px;
        border: 0;
        border-radius: 20px;
        padding: 6px 12px;
        background: rgb(0 0 0 / 45%);
        color: rgb(255 255 255 / 80%);
        font: 600 12px/1 Inter, system-ui, sans-serif;
        cursor: pointer;
        backdrop-filter: blur(6px);
        transition: background-color 150ms ease, color 150ms ease;
      }
      .variant-toggle:hover { background: rgb(0 0 0 / 65%); color: #fff; }
      .questions.script-mode, .questions.script-mode .question { cursor: pointer; }
    `;
    document.head.appendChild(style);
  }

  // `options.flags` overrides the URL flags per instance, and `options.keys: false`
  // skips the document-level shortcuts — both so several toolbars can run on one page
  // side by side without fighting each other (see `review.html`).
  function init(toolbarEl, options) {
    const settings = options || {};
    const questionsEl = toolbarEl.querySelector('.questions');
    const snackbar = toolbarEl.querySelector('#snackbar');
    const snackbarLabel = toolbarEl.querySelector('#snackbar-label');
    const snackAction = toolbarEl.querySelector('#snack-action');
    const manualNotes = toolbarEl.querySelector('.manual-notes');
    const suggestToggle = toolbarEl.querySelector('#suggest-toggle');
    const progressEl = toolbarEl.querySelector('.question-progress');
    const legendButton = toolbarEl.querySelector('#legend-btn');
    const legend = toolbarEl.querySelector('#legend');
    const insightCounter = toolbarEl.querySelector('.insight-counter');
    const insightCountEl = toolbarEl.querySelector('#insight-count');
    const insightPlus = toolbarEl.querySelector('.insight-plus');
    const finishButton = toolbarEl.querySelector('.finish-session');
    // The sidebar's footer and the mini bar's each carry their own Start Recording.
    const startButtons = [...toolbarEl.querySelectorAll('#start-rec, #compact-start-rec')];
    const nextButton = toolbarEl.querySelector('#next-beat');
    const nextLabel = toolbarEl.querySelector('#next-beat-label');
    const toolbarTitle = toolbarEl.querySelector('.toolbar-title');
    const completeInsights = toolbarEl.querySelector('#complete-insights');
    const completeQuestions = toolbarEl.querySelector('#complete-questions');
    const completeDuration = toolbarEl.querySelector('#complete-duration');
    const compactCompleteInsights = toolbarEl.querySelector('#compact-complete-insights');
    const compactCompleteQuestions = toolbarEl.querySelector('#compact-complete-questions');
    const compactCompleteTotal = toolbarEl.querySelector('#compact-complete-total');
    const compactCompleteDuration = toolbarEl.querySelector('#compact-complete-duration');
    const compactComplete = toolbarEl.querySelector('#compact-complete');
    const toolbarTime = toolbarEl.querySelector('.toolbar-time');
    const presenceButtons = [...toolbarEl.querySelectorAll('.presence-btn')];
    const compactBar = toolbarEl.querySelector('.compact-bar');
    // Ending the recording and finishing the session are the same act, so the pill in
    // the body and any Finish button share one handler.
    const compactFinishButtons = [...toolbarEl.querySelectorAll('#compact-finish, #compact-endrec')];
    const compactExpands = [...toolbarEl.querySelectorAll('.compact-expand')];

    // Both menus are the same list, stamped from one template rather than written twice.
    // Before anything reaches into them: the pause and stop handlers query by class.
    const menuTemplate = document.getElementById('rae-menu-template');
    if (menuTemplate) {
      toolbarEl.querySelectorAll('.dock-menu').forEach((menu) => {
        if (menu.children.length) return;
        menu.appendChild(menuTemplate.content.cloneNode(true));
      });
    }

    injectStyles();

    const availableVariants = Object.keys(SCRIPTS);
    const params = new URLSearchParams(window.location.search);
    const requestedVariant = params.get('variant');
    // Variant 2 (the scripted story) is the default experience. Variant 1 is kept around
    // for reference and is only reachable by asking for it explicitly (`?variant=1`).
    let currentVariant = availableVariants.includes(requestedVariant) ? requestedVariant : DEFAULT_VARIANT;
    // The variant switcher is a dev affordance, not part of the demo — it only appears
    // when a variant is pinned in the URL or `?dev=1` is set.
    const showVariantToggle = availableVariants.includes(requestedVariant) || params.get('dev') === '1';

    const FLAGS = Object.assign(readFlags(), settings.flags || {});
    const bindKeys = settings.keys !== false;
    // Everything gated purely by CSS reads off the card itself.
    Object.keys(FLAGS).forEach((name) => toolbarEl.classList.toggle(`flag-${name}`, FLAGS[name]));

    const handle = { dragState: { suppressClick: false } };
    let presence = 'compact';
    // P24 wants the probes dismissible so they cannot break her question order.
    let suggestionsOn = readStored(SUGGESTIONS_KEY) !== 'off';
    // Where the card was floating before it docked, so leaving the dock puts it back.
    let floatPosition = null;

    let questionEls = [];
    let questionsLine = null;
    let contentObserver = null;
    let scaleRafId = null;
    let insightTimer;
    let answeredTimer;
    let labelSwapTimer;
    let labelFadeTimer;
    let insightCount = 0;
    let scrollActiveTimer;
    let snapAnimationId;
    // The assistant arrives before the recording does — P's briefing happens first.
    let recording = false;
    let briefingEl = null;

    const ANSWERED_PILL_HOLD = 200;
    const ANSWERED_LABEL_HOLD = 1100;
    // The counter no longer waits for a pill to retract, so it can arrive promptly.
    const INSIGHT_REVEAL_DELAY = 420;
    const SNACK_HOLD = 2600;
    // A message you can act on has to outlast one you only read.
    const SNACK_ACTION_HOLD = 4600;

    // Variant 2 plays a fixed story instead of per-question clicking: the researcher asks
    // Q1, and the participant answers Q4 along the way so it can be skipped.
    const SCRIPTED_VARIANT = '2';
    const SCRIPT_OPENER_INDEX = 0;
    const SCRIPT_NEXT_INDEX = 1;
    const SCRIPT_JUMPED_INDEX = 3;
    const SCRIPT_STRIKE_HOLD = 500;
    const SCRIPT_PILL_DELAY = 150;
    const SCRIPT_LABEL_HOLD = 2000;
    const SCRIPT_PROBE_DELAY = 300;
    const SCRIPT_REWRITE_INDEX = 2;
    const SCRIPT_REWRITE_STRIKE = 400;
    const SCRIPT_REWRITE_REVEAL = 400;
    const SCRIPT_PROPOSAL_DELAY = 1400;
    const SCRIPT_FINISH_DELAY = 450;
    const SCRIPT_INSIGHTS = 2;

    // Only one section is ever on screen; the rest are listed so the scope is visible.
    const ACTIVE_SECTION_INDEX = 0;
    let sectionHeadEl = null;
    let sectionCounterEl = null;
    let sectionAnnounced = false;

    let scriptStep = 0;
    let scriptBusy = false;
    let counterRevealed = false;
    let snackTimer;

    // P23 asked for "timed snackbars" instead of the pill that slid out from under
    // the card and morphed its own width. One line, one hold, gone.
    //
    // Anything the assistant does on its own — skipping, rewording, hiding a card —
    // reports here, so the way to undo it belongs here too rather than only on the
    // row it happened to.
    function showSnack(text, action, options) {
      if (!snackbar) return;
      const settings = options || {};
      // Almost every snackbar reports something that happened to the question list —
      // a question skipped, a wording accepted, an undo offered. Where that list isn't
      // on screen — minimised, and docked, where the script itself is shown instead —
      // the report would be about nothing the researcher can see. Only a message
      // addressed to the surface itself asks to appear there. Asking the list whether
      // it is visible rather than naming the modes means it comes back with the list.
      if (!settings.anywhere && !(questionsEl && questionsEl.offsetParent)) return;
      if (!FLAGS.snackactions) action = null;
      window.clearTimeout(snackTimer);
      // A message about which keys to press has to show the keys, so a caller can hand
      // over markup instead of a string. Nothing else does.
      if (settings.html) snackbarLabel.innerHTML = settings.html;
      else snackbarLabel.textContent = text;

      if (snackAction) {
        snackAction.hidden = !action;
        if (action) {
          snackAction.textContent = action.label;
          snackAction.onclick = (event) => {
            event.stopPropagation();
            action.run();
            hideSnack();
          };
        } else {
          // Clear the wording too, or the hidden button keeps announcing the last
          // action it offered to anything reading the live region.
          snackAction.textContent = '';
          snackAction.onclick = null;
        }
      }

      snackbar.classList.add('visible');
      snackTimer = window.setTimeout(() => snackbar.classList.remove('visible'),
        settings.hold || (action ? SNACK_ACTION_HOLD : SNACK_HOLD));
    }

    function hideSnack() {
      window.clearTimeout(snackTimer);
      if (snackbar) snackbar.classList.remove('visible');
      if (snackAction) { snackAction.hidden = true; snackAction.onclick = null; }
    }

    // ------------------------------------------------------- status vocabulary
    // Four states, each with its own mark: answered (struck through, per P24),
    // skipped (struck through plus the moment it was actually answered), reworded
    // (tagged "paraphrased"), and to-ask.
    function markAnswered(question) {
      if (!question) return;
      question.classList.remove('skipped');
      question.classList.add('answered');
      updateProgress();
    }

    function markSkipped(question) {
      if (!question) return;
      question.classList.add('skipped');
      updateProgress();
    }

    function restoreQuestion(question) {
      if (!question) return;
      question.classList.remove('skipped', 'answered');
      updateProgress();
    }

    function unlockInsight(amount) {
      insightCount += amount || 1;
      insightCountEl.textContent = insightCount;
      // The "+1" float is for topping up a counter already on screen, not the first reveal.
      const bumpsExisting = counterRevealed;
      window.clearTimeout(insightTimer);
      insightTimer = window.setTimeout(() => {
        insightCounter.classList.add('visible');
        counterRevealed = true;
        if (bumpsExisting) {
          insightPlus.classList.remove('floating');
          void insightPlus.offsetWidth;
          insightPlus.classList.add('floating');
        }
      }, INSIGHT_REVEAL_DELAY);
    }

    // Straight increment on an already-visible counter — no pill, just the "+1" float.
    function bumpInsight() {
      insightCount += 1;
      insightCountEl.textContent = insightCount;
      insightCounter.classList.add('visible');
      counterRevealed = true;
      insightPlus.classList.remove('floating');
      void insightPlus.offsetWidth;
      insightPlus.classList.add('floating');
    }

    function answerQuestion(question, label) {
      window.clearTimeout(answeredTimer);
      showSnack(label);

      answeredTimer = window.setTimeout(() => markAnswered(question), ANSWERED_PILL_HOLD);
      labelSwapTimer = window.setTimeout(() => unlockInsight(1), ANSWERED_LABEL_HOLD);
    }

    // Each press of Next — or click on the white body — advances the story one beat.
    function advanceScript() {
      if (!recording || scriptBusy) return;
      const beat = scriptBeats[scriptStep];
      if (!beat) return;
      scriptStep += 1;
      beat.run();
      updateNextLabel();
    }

    // ------------------------------------------------------------- the clock
    // Every `.toolbar-time` reads the same clock, so the header, the mini bar and the
    // session summary can never disagree about how long the session ran. It starts when
    // the recording starts — before that there is nothing to have taken time.
    const timeEls = [...toolbarEl.querySelectorAll('.toolbar-time')];
    let clockFrom = 0;
    let clockTick;

    function paintClock() {
      const seconds = Math.max(0, Math.round((Date.now() - clockFrom) / 1000));
      const text = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      timeEls.forEach((el) => { el.textContent = text; });
    }

    function startClock() {
      window.clearInterval(clockTick);
      clockFrom = Date.now();
      paintClock();
      // Tick a little faster than the second it displays, so the number never sticks
      // for two seconds because the interval drifted past a boundary.
      clockTick = window.setInterval(paintClock, 250);
    }

    function stopClock() {
      window.clearInterval(clockTick);
      clockTick = undefined;
    }

    // Pausing holds the number rather than stopping the session: the clock's origin is
    // pushed forward by however long it was held, so it resumes on the second it left off.
    let pausedAt = 0;

    function pauseClock() {
      if (!clockTick) return;
      window.clearInterval(clockTick);
      clockTick = undefined;
      pausedAt = Date.now();
    }

    function resumeClock() {
      if (clockTick || !pausedAt) return;
      clockFrom += Date.now() - pausedAt;
      pausedAt = 0;
      paintClock();
      clockTick = window.setInterval(paintClock, 250);
    }

    // Paused is a state of the recording, not a third mode: everything else about the
    // session stays exactly where it was, and only the clock and the green light say so.
    let paused = false;
    // The sidebar and the mini bar each carry the same menu, so there are two of each item.
    const pauseButtons = [...toolbarEl.querySelectorAll('.pause-rec')];

    function setPaused(on) {
      paused = !!on;
      toolbarEl.classList.toggle('is-paused', paused);
      if (paused) pauseClock(); else resumeClock();
      // Into the label, not the button: the button also carries its icon, and writing
      // textContent over the whole thing takes the icon with it.
      pauseButtons.forEach((b) => {
        const label = b.querySelector('.menu-label') || b;
        label.textContent = paused ? 'Resume recording' : 'Pause recording';
      });
      const status = toolbarEl.querySelector('.rec-status');
      if (status && status.firstChild) status.firstChild.textContent = paused ? 'Paused' : 'Taking notes';
    }

    // ------------------------------------------------------------- recording
    // Nothing is being recorded until the researcher says so — the briefing and the
    // participant's consent come first, which is the order the conversation happens in.
    function setRecording(on) {
      recording = on;
      toolbarEl.classList.toggle('is-recording', on);
      toolbarEl.classList.toggle('is-idle', !on);
      if (on) startClock(); else { stopClock(); pausedAt = 0; clockFrom = Date.now(); paintClock(); }
      // A session that ends or restarts is never left paused.
      setPaused(false);
      if (toolbarTitle) toolbarTitle.textContent = on ? 'Rae is taking notes' : 'Rae is ready to listen';
      if (briefingEl && on) briefingEl.classList.remove('open');
      updateNextLabel();
      // The mini bar draws answers and probes only while recording, and it is rendered
      // by the page, not from here — so say what changed and let it redraw.
      toolbarEl.dispatchEvent(new CustomEvent('rae:recording', { detail: { recording: on } }));
    }

    function startRecording() {
      if (recording) return;
      setRecording(true);
      showSnack('Recording — Rae is listening');
      // Rae goes to work the moment the recording does: Q1 logged, Q4 recognised as
      // already answered, a rewording offered for Q3.
      playScriptedSequence();
      updateNextLabel();
    }

    startButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        startRecording();
      });
    });

    if (nextButton) {
      nextButton.addEventListener('click', (event) => {
        event.stopPropagation();
        advanceScript();
      });
    }

    if (bindKeys) document.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight') return;
      if (!toolbarEl.classList.contains('visible')) return;
      if (currentVariant !== SCRIPTED_VARIANT) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      event.preventDefault();
      if (!recording) startRecording();
      else advanceScript();
    });

    // A question takes the highlight by snapping up into the top slot.
    function focusQuestion(index) {
      const target = questionEls[index];
      if (!target) return;
      setActiveQuestion(target);
      scrollQuestionToTop(target);
    }

    // Last question answered — the session can now be wrapped up.
    function answerFinalQuestion() {
      const target = questionEls[SCRIPT_REWRITE_INDEX];
      if (!target || target.classList.contains('answered')) return;
      withdrawProposal(target);
      markAnswered(target);
      bumpInsight();
      if (!finishButton) return;

      scriptBusy = true;
      window.setTimeout(() => {
        finishButton.classList.add('visible');
        toolbarEl.classList.add('has-finish');
        scriptBusy = false;
      }, SCRIPT_FINISH_DELAY);
    }

    function showSessionComplete() {
      // The summary belongs to whichever shape the assistant is already in — docked
      // it fills the column, minimised it stays a strip. Nothing is forced open.
      const questions = `${questionEls.length}/${questionEls.length}`;
      const duration = toolbarTime ? toolbarTime.textContent.trim() : '';
      if (completeInsights) completeInsights.textContent = insightCount;
      if (completeQuestions) completeQuestions.textContent = questions;
      if (completeDuration) completeDuration.textContent = duration;
      if (compactCompleteInsights) compactCompleteInsights.textContent = insightCount;
      // "4/4" is one number with its total spoken after it, so the total is quieter.
      if (compactCompleteQuestions) {
        compactCompleteQuestions.textContent = questionEls.length;
        if (compactCompleteTotal) compactCompleteTotal.textContent = `/${questionEls.length}`;
      }
      if (compactCompleteDuration) compactCompleteDuration.textContent = duration;
      if (finishButton) finishButton.classList.remove('visible');
      toolbarEl.classList.remove('has-finish');
      // The summary quotes the duration, so the clock stops on the number it quoted.
      stopClock();
      window.clearTimeout(insightTimer);
      hideSnack();
      closeLegend();
      toolbarEl.classList.add('session-complete');
      applyPresence(presence);
      toolbarEl.dispatchEvent(new CustomEvent('rae:shape'));
    }

    function tickProbe(index) {
      const next = questionEls[SCRIPT_NEXT_INDEX];
      const probeCard = next && next.nextElementSibling;
      if (!probeCard || !probeCard.classList.contains('probe-card')) return;
      const chip = probeCard.querySelector(`.probe-chip[data-probe="${index}"], .probe-row[data-probe="${index}"]`);
      if (!chip || chip.classList.contains('used')) return;
      chip.classList.add('used');
      // The insight comes from what the participant said, not from the card being on
      // screen — so it still counts when the suggestions are hidden.
      bumpInsight();
    }

    // Rae restates Q3 in light of what the participant already said — but as a
    // proposal, not an edit. P23's objection was that a mid-conversation rewrite
    // loses the interviewer: the original stays intact until she accepts it, so the
    // right to skip and reorder stays with her.
    function proposeRewrite() {
      const target = questionEls[SCRIPT_REWRITE_INDEX];
      if (!target || !target.querySelector('.rewrite-proposal')) {
        scriptBusy = false;
        return;
      }
      // With the proposal switched off this is v5's behaviour: Rae simply rewrites
      // the question and the researcher finds out afterwards.
      if (!FLAGS.proposal) {
        acceptRewrite(target);
        scriptBusy = false;
        return;
      }
      target.classList.add('proposing');
      scriptBusy = false;
    }

    function acceptRewrite(question) {
      if (!question || question.classList.contains('rewritten')) return;
      question.classList.remove('proposing');
      question.classList.add('rewriting');
      window.setTimeout(() => {
        question.classList.add('rewritten');
      }, SCRIPT_REWRITE_REVEAL);
      showSnack('Reworded — the original is kept above', {
        label: 'Undo',
        run: () => revertRewrite(question),
      });
    }

    function keepOriginal(question) {
      if (!question) return;
      question.classList.remove('proposing');
      showSnack('Original kept', {
        label: 'Use Rae’s',
        run: () => acceptRewrite(question),
      });
    }

    // Accepting a rewording is as reversible as declining one.
    function revertRewrite(question) {
      if (!question) return;
      question.classList.remove('rewriting', 'rewritten');
      if (question.querySelector('.rewrite-proposal') && !question.classList.contains('answered')) {
        question.classList.add('proposing');
      }
      showSnack('Back to the original wording');
    }

    // A proposal nobody answered is withdrawn once the question has been asked.
    function withdrawProposal(question) {
      if (question) question.classList.remove('proposing');
    }

    function answerNextQuestion() {
      const next = questionEls[SCRIPT_NEXT_INDEX];
      const probeCard = next && next.nextElementSibling;
      if (!probeCard || !probeCard.classList.contains('probe-card')) return;

      // Q2 is ticked first, then its probes open underneath.
      scriptBusy = true;
      markAnswered(next);
      bumpInsight();
      window.setTimeout(() => {
        if (suggestionsOn) {
          next.classList.add('expanded');
          probeCard.classList.add('revealed');
        }
        scriptBusy = false;
      }, SCRIPT_PROBE_DELAY);
    }

    function playScriptedSequence() {
      scriptBusy = true;

      const opener = questionEls[SCRIPT_OPENER_INDEX];
      const jumped = questionEls[SCRIPT_JUMPED_INDEX];
      markAnswered(opener);
      if (!jumped) { scriptBusy = false; return; }

      // Q4 is marked skipped first — without ever becoming the active/highlighted
      // question — and only then does the snackbar explain why. The row itself now
      // carries the reason ("answered at 1:22"), so the message can be brief.
      window.setTimeout(() => {
        markSkipped(jumped);

        window.setTimeout(() => {
          const number = jumped.querySelector('.question-number').textContent;
          showSnack(`Q${number} was answered earlier — skipped`, {
            label: 'Put it back',
            run: () => { restoreQuestion(jumped); showSnack(`Q${number} is back on the list`); },
          });
          unlockInsight(SCRIPT_INSIGHTS);

          // Rae then offers a reworded Q3. Moving the highlight to Q2 waits for
          // the next click.
          window.setTimeout(proposeRewrite, SCRIPT_PROPOSAL_DELAY);
        }, SCRIPT_PILL_DELAY);
      }, SCRIPT_STRIKE_HOLD);
    }

    // One beat per press of Next (or per click on the white body). Each beat names
    // itself, so the control says what it is about to do rather than just "next" —
    // there was no visible way to move the session on at all before.
    const scriptBeats = [
      // Without the recording gate the opening sequence has nothing to hang off, so it
      // goes back to being the first beat — v5's behaviour.
      ...(FLAGS.recording ? [] : [{ label: 'Begin', run: playScriptedSequence }]),
      { label: 'Next question', run: () => focusQuestion(SCRIPT_NEXT_INDEX) },   // Q2 takes the top slot
      { label: 'Log the answer', run: answerNextQuestion },                      // Q2 ticked (+1), probes open
      { label: 'Mark probe 2.1', run: () => tickProbe(0) },                      // 2.1 ticked (+1)
      { label: 'Mark probe 2.2', run: () => tickProbe(1) },                      // 2.2 ticked (+1)
      { label: 'Next question', run: () => focusQuestion(SCRIPT_REWRITE_INDEX) },// Q3 takes the top slot
      { label: 'Log the answer', run: answerFinalQuestion },                     // Q3 ticked (+1), Finish appears
    ];

    function updateNextLabel() {
      if (!nextButton) return;
      const beat = scriptBeats[scriptStep];
      nextButton.hidden = !beat || !recording || !FLAGS.advance;
      if (beat && nextLabel) nextLabel.textContent = beat.label;
    }

    // The footer's Finish Session and the sidebar menu's Stop recording are the same
    // door; the sidebar just doesn't have a footer to put it in.
    toolbarEl.querySelectorAll('.finish-session, .end-rec').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        closeDockMenu();
        showSessionComplete();
      });
    });

    // ---------------------------------------------------- the session menu
    // The frames take Start and End recording off both headers and give each two round
    // buttons instead. The second one is where the two ways to interrupt a recording
    // live now — and they are dead until there is a recording to interrupt.
    // A button names its menu rather than containing it: the mini bar's card clips, and
    // on a one-line part it is shorter than the menu is tall, so that menu lives outside
    // the surface and is anchored to the header's own geometry.
    const dockMenus = [...toolbarEl.querySelectorAll('.dock-more-btn')]
      .map((button) => ({ button, menu: toolbarEl.querySelector(`#${button.dataset.menu}`) }))
      .filter((pair) => pair.menu);

    function closeDockMenu() {
      dockMenus.forEach(({ button, menu }) => {
        if (menu.hidden) return;
        menu.hidden = true;
        button.setAttribute('aria-expanded', 'false');
      });
    }

    function openDockMenu({ button, menu }) {
      closeDockMenu();
      // Pausing and stopping are only ever offered against a running session. The
      // settings are not about the recording, so they stay live either way.
      menu.querySelectorAll('.menu-act').forEach((item) => { item.disabled = !recording; });
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
    }

    dockMenus.forEach((pair) => {
      pair.button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (pair.menu.hidden) openDockMenu(pair); else closeDockMenu();
      });
    });

    // A switch stays put when you flip it: the menu is a panel of settings, and closing
    // it after each one would make setting three of them three trips.
    toolbarEl.querySelectorAll('.menu-toggle').forEach((item) => item.addEventListener('click', (event) => {
      event.stopPropagation();
      setOption(item.dataset.opt, item.getAttribute('aria-checked') !== 'true');
    }));

    pauseButtons.forEach((button) => button.addEventListener('click', (event) => {
      event.stopPropagation();
      setPaused(!paused);
      closeDockMenu();
    }));

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.dock-more-btn, .dock-menu')) closeDockMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeDockMenu();
    });

    function resetInsights() {
      window.clearTimeout(insightTimer);
      window.clearTimeout(answeredTimer);
      window.clearTimeout(labelSwapTimer);
      window.clearTimeout(labelFadeTimer);
      hideSnack();
      insightCounter.classList.remove('visible');
      insightPlus.classList.remove('floating');
      counterRevealed = false;
      insightCount = 0;
      insightCountEl.textContent = insightCount;
    }

    // ------------------------------------------------------- section + progress
    function activeScript() {
      return SCRIPTS[currentVariant] || SCRIPTS[availableVariants[0]];
    }

    function answeredCount() {
      return questionEls.filter((q) => q.classList.contains('answered') || q.classList.contains('skipped')).length;
    }

    // One segment per section, and the current one fills question by question —
    // P25 asked for "section 1 of 5 complete", not scroll position.
    function updateProgress() {
      if (!progressEl) return;
      if (!FLAGS.sections) {
        // v5's bar was decorative: four segments, the first half-filled, never moving.
        [...progressEl.children].forEach((segment, index) => {
          segment.style.background = index === 0
            ? 'linear-gradient(90deg, #8e8e8e 49%, #d9d9d9 49%)'
            : '#d9d9d9';
        });
        return;
      }
      const done = answeredCount();
      const total = questionEls.length || 1;
      [...progressEl.children].forEach((segment, index) => {
        const fill = index < ACTIVE_SECTION_INDEX ? 100
          : index === ACTIVE_SECTION_INDEX ? Math.round((done / total) * 100)
          : 0;
        segment.style.background = fill === 0
          ? '#d9d9d9'
          : `linear-gradient(90deg, #8e8e8e ${fill}%, #d9d9d9 ${fill}%)`;
      });

      if (sectionCounterEl) {
        sectionCounterEl.textContent = done >= total ? `${total} of ${total} · done` : `${done} of ${total}`;
        sectionCounterEl.classList.toggle('is-done', done >= total);
      }

      if (done >= total && !sectionAnnounced) {
        sectionAnnounced = true;
        const sections = activeScript().sections;
        const next = sections[ACTIVE_SECTION_INDEX + 1];
        if (next) {
          showSnack(`Section ${ACTIVE_SECTION_INDEX + 1} complete · ${next.name} is next`);
          const nextRow = questionsEl.querySelector(`.upcoming-row[data-section="${ACTIVE_SECTION_INDEX + 1}"]`);
          if (nextRow) nextRow.classList.add('is-next');
        }
      }
    }

    function setActiveQuestion(target) {
      const current = questionsEl.querySelector('.question.active');
      if (current === target) return;
      if (current) current.classList.remove('active');
      target.classList.add('active');
    }

    // --------------------------------------------------------------- presence
    function setPanelHidden(panel, hidden) {
      if (!panel) return;
      // inert first: it moves focus out, so aria-hidden is never applied over a focused
      // descendant — which is the state the browser warns about.
      panel.inert = hidden;
      panel.setAttribute('aria-hidden', String(hidden));
    }

    function applyPresence(mode) {
      PRESENCE_MODES.forEach((name) => toolbarEl.classList.toggle(`presence-${name}`, name === mode));
      if (bindKeys) document.body.dataset.raePresence = mode;
      presenceButtons.forEach((button) => {
        const on = button.dataset.presence === mode;
        button.classList.toggle('is-on', on);
        button.setAttribute('aria-pressed', String(on));
      });
      const complete = toolbarEl.classList.contains('session-complete');
      // `inert` rather than aria-hidden alone: the panel being hidden can still hold
      // focus — the expand button lives in both — and aria-hiding a focused element is
      // a defect the browser will tell you about.
      setPanelHidden(compactBar, mode !== 'compact' || complete);
      setPanelHidden(compactComplete, mode !== 'compact' || !complete);

      // Docking is a layout, not a position: park whatever the drag left behind
      // and let the stylesheet place the card, then hand the coordinates back.
      if (mode === 'dock') {
        if (toolbarEl.style.left) floatPosition = { left: toolbarEl.style.left, top: toolbarEl.style.top };
        toolbarEl.style.left = '';
        toolbarEl.style.top = '';
      } else if (floatPosition) {
        toolbarEl.style.left = floatPosition.left;
        toolbarEl.style.top = floatPosition.top;
      }

      // Each presence brings its own settings with it, unless they are linked.
      applyOptions();
      toolbarEl.dispatchEvent(new CustomEvent('rae:shape'));
    }

    // ------------------------------------------------------------- options
    // One set per presence plus one flag. `linked` is not a fifth setting: it says the
    // two sets are the same set, so a change made in either surface is made in both and
    // switching modes no longer changes what Rae does.
    // `options` is already the instance's own argument, so the state wears a name of
    // its own rather than shadowing it.
    let optionState = readOptions();

    function readOptions() {
      const fresh = {
        compact: { ...OPTION_DEFAULTS.compact },
        dock: { ...OPTION_DEFAULTS.dock },
        linked: false,
      };
      // A usability test starts from the defaults, not from whatever the last participant
      // left behind: `?defaults=1` ignores what is stored without clearing it.
      if (/[?&]defaults=1\b/.test(window.location.search)) return fresh;
      try {
        const stored = JSON.parse(readStored(OPTIONS_KEY) || 'null');
        if (!stored) return fresh;
        PRESENCE_MODES.forEach((mode) => OPTIONS.forEach((name) => {
          const value = stored[mode] && stored[mode][name];
          if (typeof value === 'boolean') fresh[mode][name] = value;
        }));
        fresh.linked = stored.linked === true;
      } catch (error) { /* a half-written or older shape falls back to the defaults */ }
      return fresh;
    }

    // The classes are the whole interface to the rest of the page: the stylesheet hides
    // what is switched off, and the two surfaces ask the toolbar rather than keeping
    // their own copy of the answer.
    function applyOptions() {
      const set = optionState[presence] || OPTION_DEFAULTS.compact;
      OPTIONS.forEach((name) => toolbarEl.classList.toggle(`opt-${name}`, set[name] === true));
      toolbarEl.querySelectorAll('.menu-toggle').forEach((item) => {
        const name = item.dataset.opt;
        const on = name === 'linked' ? optionState.linked : set[name] === true;
        item.setAttribute('aria-checked', String(on));
      });
      writeStored(OPTIONS_KEY, JSON.stringify(optionState));
      toolbarEl.dispatchEvent(new CustomEvent('rae:options'));
    }

    function setOption(name, on) {
      if (name === 'linked') {
        optionState.linked = on;
        // Turning it on adopts what is on screen for both — the set you are looking at is
        // the one you meant, not the one you last had somewhere else.
        if (on) PRESENCE_MODES.forEach((mode) => { optionState[mode] = { ...optionState[presence] }; });
        applyOptions();
        return;
      }
      const modes = optionState.linked ? PRESENCE_MODES : [presence];
      modes.forEach((mode) => { optionState[mode][name] = on; });
      applyOptions();
    }

    // A machine that ran an earlier build still has 'focus' stored, and setPresence
    // refuses a mode it doesn't know — which would leave the card with no presence
    // class at all rather than falling back.
    function storedPresence() {
      const stored = readStored(PRESENCE_KEY);
      return PRESENCE_MODES.includes(stored) ? stored : 'compact';
    }

    function setPresence(mode, options) {
      if (!PRESENCE_MODES.includes(mode)) return;
      const settings = options || {};
      const changed = mode !== presence;
      presence = mode;
      if (settings.remember !== false) writeStored(PRESENCE_KEY, mode);
      if (!changed || settings.immediate) { applyPresence(mode); return; }

      toolbarEl.classList.add('presence-switching');
      window.setTimeout(() => {
        applyPresence(mode);
        window.setTimeout(() => toolbarEl.classList.remove('presence-switching'), 20);
      }, 140);
    }

    if (!FLAGS.presence) presenceButtons.forEach((button) => { button.hidden = true; });
    presenceButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        setPresence(button.dataset.presence);
      });
    });

    compactExpands.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        setPresence('dock');
      });
    });

    compactFinishButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        showSessionComplete();
      });
    });

    // The section head is sticky at the top of the list, so the "top slot" a focused
    // question snaps into sits below it rather than at the container's padding edge.
    function listOffset() {
      if (sectionHeadEl) return sectionHeadEl.offsetHeight;
      return parseFloat(getComputedStyle(questionsEl).paddingTop) || 0;
    }

    function scrollQuestionToTop(question) {
      const targetScrollTop = Math.max(0, question.offsetTop - listOffset());
      const startScrollTop = questionsEl.scrollTop;
      const change = targetScrollTop - startScrollTop;
      const startTime = performance.now();

      cancelAnimationFrame(snapAnimationId);
      function step(now) {
        const t = Math.min(1, (now - startTime) / QUESTION_SNAP_DURATION);
        questionsEl.scrollTop = startScrollTop + change * questionSnapEasing(t);
        if (t < 1) snapAnimationId = requestAnimationFrame(step);
      }
      snapAnimationId = requestAnimationFrame(step);
    }

    // Both of these are v5 behaviours that v5.1 removed. They stay reachable behind
    // `?scaling=on` / `?line=on` so the removal can be judged rather than assumed.
    function updateQuestionScales() {
      if (!FLAGS.scaling) return;
      const containerTop = questionsEl.getBoundingClientRect().top + listOffset();
      questionEls.forEach((question) => {
        const distance = Math.abs(question.getBoundingClientRect().top - containerTop);
        const t = Math.min(1, distance / QUESTION_SCALE_FALLOFF);
        question.style.transform = `scale(${1 - t * (1 - QUESTION_MIN_SCALE)})`;
      });
    }

    function updateQuestionsLine() {
      if (!questionsLine || !questionEls.length) return;
      const first = questionEls[0].querySelector('.question-number');
      const last = questionEls[questionEls.length - 1].querySelector('.question-number');
      if (!first || !last) return;
      const originY = questionsEl.getBoundingClientRect().top - questionsEl.scrollTop;
      const top = first.getBoundingClientRect().top - originY;
      const bottom = last.getBoundingClientRect().bottom - originY;
      questionsLine.style.top = `${top}px`;
      questionsLine.style.height = `${Math.max(0, bottom - top)}px`;
    }

    // Probe cards, rewrites and notes all animate their height, which moves the ends.
    function observeContentSize() {
      if (!FLAGS.line || typeof ResizeObserver === 'undefined') return;
      if (contentObserver) contentObserver.disconnect();
      contentObserver = new ResizeObserver(() => updateQuestionsLine());
      [...questionsEl.children].forEach((child) => contentObserver.observe(child));
    }

    // Undo, Use this and Keep original all live inside the question list, which is
    // also the surface that advances the scripted story — so every one of them has
    // to stop its click there.
    function bindStatusControls() {
      questionsEl.querySelectorAll('.status-undo').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          const question = button.closest('.question');
          restoreQuestion(question);
          const number = question.querySelector('.question-number').textContent;
          showSnack(`Q${number} is back on the list`, {
            label: 'Skip it again',
            run: () => markSkipped(question),
          });
        });
      });

      questionsEl.querySelectorAll('.probe-chip').forEach((chip) => {
        chip.addEventListener('click', (event) => {
          event.stopPropagation();
          if (handle.dragState.suppressClick) { handle.dragState.suppressClick = false; return; }
          const card = chip.closest('.probe-card');
          const full = card.querySelector(`.probe-full[data-probe="${chip.dataset.probe}"]`);
          const opening = full && !full.classList.contains('open');
          card.querySelectorAll('.probe-full').forEach((p) => p.classList.remove('open'));
          if (opening) full.classList.add('open');
        });
      });

      questionsEl.querySelectorAll('.probe-dismiss').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          const card = button.closest('.probe-card');
          card.classList.add('dismissed');
          showSnack('Suggestions hidden for this question', {
            label: 'Undo',
            run: () => card.classList.remove('dismissed'),
          });
        });
      });

      questionsEl.querySelectorAll('.note-toggle').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          const note = button.closest('.rae-note');
          const showing = note.classList.toggle('showing-quote');
          button.textContent = showing ? 'Hide' : 'Her words';
        });
      });

      questionsEl.querySelectorAll('.proposal-use').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          acceptRewrite(button.closest('.question'));
        });
      });

      questionsEl.querySelectorAll('.proposal-keep').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          keepOriginal(button.closest('.question'));
        });
      });
    }

    // -------------------------------------------------------------- your own notes
    // Two researchers wanted somewhere to put their own shorthand; one rejects note
    // taking during interviews outright. So the lane exists and costs nothing until
    // it is asked for — no field on screen, no prompt.
    function closeComposer() {
      const open = questionsEl.querySelector('.you-composer');
      if (open) open.remove();
    }

    function saveOwnNote(question, text) {
      if (!question || !text) { closeComposer(); return; }
      const stampEl = question.querySelector('.question-stamp');
      const stamp = stampEl ? stampEl.textContent : '';
      const note = document.createElement('div');
      note.className = 'you-note';
      note.innerHTML = `<span class="you-tag">You</span><p class="you-text">${text}</p>`
        + (stamp ? `<span class="you-stamp">${stamp}</span>` : '');
      question.appendChild(note);
      closeComposer();
      showSnack('Note added', {
        label: 'Undo',
        run: () => note.remove(),
      });
    }

    function openComposer() {
      const question = questionsEl.querySelector('.question.active') || questionEls[0];
      if (!question) return;
      closeComposer();

      const composer = document.createElement('div');
      composer.className = 'you-composer';
      composer.innerHTML = '<span class="you-tag">You</span>'
        + '<input class="you-input" type="text" aria-label="Your note" placeholder="Your note — Enter to save, Esc to cancel">';
      question.appendChild(composer);

      // The list is the surface that advances the story, so the composer has to hold
      // on to both its clicks and its keys.
      composer.addEventListener('click', (event) => event.stopPropagation());
      const input = composer.querySelector('.you-input');
      input.addEventListener('keydown', (event) => {
        event.stopPropagation();
        if (event.key === 'Enter') saveOwnNote(question, input.value.trim());
        if (event.key === 'Escape') closeComposer();
      });
      input.focus();
      scrollQuestionToTop(question);
    }

    if (manualNotes) {
      manualNotes.addEventListener('click', (event) => {
        event.stopPropagation();
        openComposer();
      });
    }

    if (bindKeys) document.addEventListener('keydown', (event) => {
      if (event.key !== 'n' && event.key !== 'N') return;
      if (!toolbarEl.classList.contains('visible')) return;
      if (toolbarEl.classList.contains('session-complete')) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      event.preventDefault();
      // Minimised, the question list is display:none, so opening the composer before
      // the mode has finished switching gives the input nothing to take focus in.
      if (presence !== 'dock') {
        setPresence('dock');
        window.setTimeout(openComposer, 220);
        return;
      }
      openComposer();
    });

    // --------------------------------------------------------------- suggestions
    function applySuggestions() {
      toolbarEl.classList.toggle('suggestions-off', !suggestionsOn);
      if (suggestToggle) {
        suggestToggle.classList.toggle('is-off', !suggestionsOn);
        suggestToggle.setAttribute('aria-pressed', String(suggestionsOn));
      }
    }

    if (suggestToggle) {
      suggestToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        suggestionsOn = !suggestionsOn;
        writeStored(SUGGESTIONS_KEY, suggestionsOn ? 'on' : 'off');
        applySuggestions();
        showSnack(suggestionsOn ? 'Probe suggestions on' : 'Probe suggestions off', {
          label: 'Undo',
          run: () => {
            suggestionsOn = !suggestionsOn;
            writeStored(SUGGESTIONS_KEY, suggestionsOn ? 'on' : 'off');
            applySuggestions();
          },
        });
      });
    }

    // ------------------------------------------------------------------ legend
    // Four marks, four meanings. Every one of them was queried by a different
    // participant, so the key is one click away rather than assumed.
    function closeLegend() {
      if (!legend || !legendButton) return;
      legend.hidden = true;
      legendButton.setAttribute('aria-expanded', 'false');
    }

    if (legendButton && legend) {
      legendButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = legend.hidden;
        legend.hidden = !open;
        legendButton.setAttribute('aria-expanded', String(open));
      });
      legend.addEventListener('click', (event) => event.stopPropagation());
      document.addEventListener('click', closeLegend);
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeLegend();
      });
    }

    function bindQuestionInteractions(variant) {
      if (variant === SCRIPTED_VARIANT) {
        questionsEl.classList.add('script-mode');
        return;
      }
      questionsEl.classList.remove('script-mode');

      questionEls.forEach((question) => {
        const probeCard = question.nextElementSibling && question.nextElementSibling.classList.contains('probe-card')
          ? question.nextElementSibling
          : null;
        if (probeCard) question.classList.add('probeable');

        question.addEventListener('click', (event) => {
          event.stopPropagation();
          if (handle.dragState.suppressClick) { handle.dragState.suppressClick = false; return; }

          if (!question.classList.contains('active')) {
            setActiveQuestion(question);
            scrollQuestionToTop(question);
            return;
          }

          if (probeCard && !question.classList.contains('checked')) {
            question.classList.add('checked');
            window.setTimeout(() => {
              question.classList.add('expanded');
              probeCard.classList.add('revealed');
            }, 600);
          }
        });
      });

      questionsEl.querySelectorAll('.probe-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          if (chip.classList.contains('used')) return;
          chip.classList.add('used');

          const probeCard = chip.closest('.probe-card');
          const parentQuestion = probeCard && probeCard.previousElementSibling && probeCard.previousElementSibling.classList.contains('question')
            ? probeCard.previousElementSibling
            : null;
          const questionNumber = parentQuestion
            ? parentQuestion.querySelector('.question-number').textContent
            : '';
          answerQuestion(parentQuestion, `Q${questionNumber} answered`);
        });
      });
    }

    function renderQuestions(variant) {
      const script = SCRIPTS[variant] || SCRIPTS[availableVariants[0]];
      const sections = script.sections;
      const section = sections[ACTIVE_SECTION_INDEX];
      const set = section.questions;
      const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
      questionsEl.innerHTML = '';
      sectionAnnounced = false;
      briefingEl = null;

      // What you say before the first question. It opens the session, and it is where
      // the consent to record actually happens.
      if (script.briefing && FLAGS.briefing) {
        const briefing = document.createElement('section');
        briefing.className = 'briefing open';
        briefing.innerHTML = `<button class="briefing-head" type="button">`
          + `<span class="briefing-title">${script.briefing.title}</span>`
          + `<span class="briefing-toggle" aria-hidden="true"></span></button>`
          + `<p class="briefing-text">${script.briefing.text}</p>`;
        briefing.querySelector('.briefing-head').addEventListener('click', (event) => {
          event.stopPropagation();
          briefing.classList.toggle('open');
        });
        questionsEl.appendChild(briefing);
        briefingEl = briefing;
      }

      // The section the researcher is in, pinned above the questions it governs.
      const head = FLAGS.sections ? document.createElement('div') : null;
      if (head) head.className = 'section-head';
      if (head) {
        head.innerHTML = `<span class="section-where">Section ${ACTIVE_SECTION_INDEX + 1} of ${sections.length}</span>`
          + `<span class="section-name">${section.name}</span>`
          + `<span class="section-counter">0 of ${set.length}</span>`;
        questionsEl.appendChild(head);
        sectionHeadEl = head;
        sectionCounterEl = head.querySelector('.section-counter');
      } else {
        sectionHeadEl = null;
        sectionCounterEl = null;
      }

      set.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        // The stamp lane is always reserved, so a question does not reflow when it
        // gets its timestamp — only the timestamp fades in.
        const stamp = `<span class="question-stamp" aria-hidden="true">${q.stamp || ''}</span>`;
        // The reworded line carries the "paraphrased" label P22 asked for, so the
        // change is legible as a change rather than a silent substitution.
        const rewrite = q.rewrite
          ? `<p class="question-text question-rewrite"><span class="question-tag">paraphrased</span>${q.rewrite}</p>`
          : '';
        const proposal = q.rewrite
          ? `<div class="rewrite-proposal">
               <p class="proposal-eyebrow">Rae suggests rewording this</p>
               <p class="proposal-text">${q.rewrite}</p>
               <div class="proposal-actions">
                 <button class="proposal-use" type="button">Use this</button>
                 <button class="proposal-keep" type="button">Keep original</button>
               </div>
             </div>`
          : '';
        // The panel says "Rae is taking notes"; this is the note. It is set apart from
        // the script — smaller, grey, behind its own rule — because P22 could not tell
        // the two apart when the panel showed only questions.
        const note = (q.note && FLAGS.notes)
          ? `<div class="rae-note">
               <div class="note-body">
                 <p class="note-text">${q.note}</p>
                 ${q.quote ? `<p class="note-quote">“${q.quote}”</p>` : ''}
               </div>
               ${q.quote ? '<button class="note-toggle" type="button">Her words</button>' : ''}
             </div>`
          : '';
        const skipNote = `<div class="skip-note"><span class="status-chip">Skipped · answered at ${q.stamp || '—'}</span><button class="status-undo" type="button">Undo</button></div>`;
        questionDiv.innerHTML = `<span class="question-number">${index + 1}</span><p class="question-text">${q.text}</p>${stamp}${skipNote}${rewrite}${proposal}${note}`;
        questionsEl.appendChild(questionDiv);

        if (q.probes && q.probes.length) {
          const probeCard = document.createElement('section');
          probeCard.className = 'probe-card';
          probeCard.setAttribute('aria-label', 'Suggested probes');
          // A keyword is what arrives while the participant is still talking; the
          // sentence is there for whoever wants to read it.
          // v5 showed each probe as a full sentence in its own row. P25 asked for
          // keywords instead; `?probes=off` puts the sentences back.
          if (!FLAGS.probes) {
            const rows = q.probes
              .map((p, i) => `<div class="probe-row" data-probe="${i}"><span class="probe-row-number">${p.number}</span><p class="probe-question">${p.text}</p></div>`)
              .join('');
            probeCard.innerHTML = `<p class="probe-title probe-title-legacy">Consider probing</p>${rows}`;
            questionsEl.appendChild(probeCard);
            return;
          }
          const chips = q.probes
            .map((p, i) => `<button class="probe-chip" type="button" data-probe="${i}">`
              + `<svg class="chip-tick" viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 6.2 4.6 9.3 10.5 2.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
              + `${p.keyword || p.number}</button>`)
            .join('');
          const fulls = q.probes
            .map((p, i) => `<p class="probe-full" data-probe="${i}"><span class="probe-number">${p.number}</span>${p.text}</p>`)
            .join('');
          probeCard.innerHTML = '<div class="probe-head"><p class="probe-title">Probes</p>'
            + '<button class="probe-dismiss" type="button" aria-label="Dismiss these suggestions">'
            + '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
            + '</button></div>'
            + `<div class="probe-chips">${chips}</div><div class="probe-detail">${fulls}</div>`;
          questionsEl.appendChild(probeCard);
        }
      });

      // The rest of the script, named and counted but not unpacked. P24 praised the
      // sectioning; the confusion was only ever about how much there is.
      if (sections.length > 1 && FLAGS.sections) {
        const upcoming = document.createElement('section');
        upcoming.className = 'upcoming';
        const rows = sections.slice(ACTIVE_SECTION_INDEX + 1)
          .map((s, offset) => {
            const number = ACTIVE_SECTION_INDEX + offset + 2;
            const count = s.questions.length;
            return `<div class="upcoming-row" data-section="${number - 1}">`
              + `<span class="upcoming-number">${number}</span>`
              + `<span class="upcoming-name">${s.name}</span>`
              + `<span class="upcoming-count">${count} question${count === 1 ? '' : 's'}</span>`
              + `</div>`;
          })
          .join('');
        upcoming.innerHTML = `<p class="upcoming-title">Later in this script · ${totalQuestions} questions in all</p>${rows}`;
        questionsEl.appendChild(upcoming);
      }

      const spacer = document.createElement('div');
      spacer.className = 'questions-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      questionsEl.appendChild(spacer);

      if (FLAGS.line) {
        questionsLine = document.createElement('span');
        questionsLine.className = 'questions-line';
        questionsLine.setAttribute('aria-hidden', 'true');
        questionsEl.prepend(questionsLine);
      } else {
        questionsLine = null;
      }

      questionEls = [...questionsEl.querySelectorAll('.question')];
      questionEls[0].classList.add('active');
      bindStatusControls();
      bindQuestionInteractions(variant);
      renderProgressSegments(FLAGS.sections ? sections.length : 4);
      updateProgress();
      observeContentSize();
      updateQuestionScales();
      updateQuestionsLine();
    }

    // The bar has one segment per section, so it is rebuilt with the script.
    function renderProgressSegments(count) {
      if (!progressEl) return;
      progressEl.innerHTML = '';
      for (let i = 0; i < count; i += 1) progressEl.appendChild(document.createElement('span'));
    }

    questionsEl.addEventListener('click', () => {
      if (currentVariant !== SCRIPTED_VARIANT) return;
      if (handle.dragState.suppressClick) { handle.dragState.suppressClick = false; return; }
      advanceScript();
    });

    questionsEl.addEventListener('scroll', () => {
      if ((FLAGS.scaling || FLAGS.line) && !scaleRafId) {
        scaleRafId = requestAnimationFrame(() => {
          updateQuestionScales();
          updateQuestionsLine();
          scaleRafId = null;
        });
      }
      if (currentVariant === SCRIPTED_VARIANT) return;
      window.clearTimeout(scrollActiveTimer);
      scrollActiveTimer = window.setTimeout(() => {
        const containerTop = questionsEl.getBoundingClientRect().top + listOffset();
        let closest = questionEls[0];
        let closestDistance = Infinity;
        questionEls.forEach((question) => {
          const distance = Math.abs(question.getBoundingClientRect().top - containerTop);
          if (distance < closestDistance) { closestDistance = distance; closest = question; }
        });
        setActiveQuestion(closest);
        scrollQuestionToTop(closest);
      }, 120);
    });

    if (bindKeys) document.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      if (!toolbarEl.classList.contains('visible')) return;
      if (currentVariant === SCRIPTED_VARIANT) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      event.preventDefault();
      const activeIndex = questionEls.findIndex((q) => q.classList.contains('active'));
      const nextIndex = event.key === 'ArrowDown'
        ? Math.min(questionEls.length - 1, activeIndex + 1)
        : Math.max(0, activeIndex - 1);
      const next = questionEls[nextIndex];
      if (next && !next.classList.contains('active')) {
        setActiveQuestion(next);
        scrollQuestionToTop(next);
      }
    });

    function reset() {
      scriptStep = 0;
      scriptBusy = false;
      setRecording(!FLAGS.recording);
      toolbarEl.classList.remove('session-complete', 'has-finish');
      if (finishButton) finishButton.classList.remove('visible');
      renderQuestions(currentVariant);
      questionsEl.scrollTop = 0;
      resetInsights();
      setPresence(storedPresence(), { immediate: true, remember: false });
    }

    function setVariant(variant) {
      if (!SCRIPTS[variant] || variant === currentVariant) return;
      currentVariant = variant;
      scriptStep = 0;
      scriptBusy = false;
      setRecording(!FLAGS.recording);
      toolbarEl.classList.remove('session-complete', 'has-finish');
      if (finishButton) finishButton.classList.remove('visible');
      renderQuestions(currentVariant);
      resetInsights();
      questionsEl.scrollTop = 0;

      const url = new URL(window.location.href);
      url.searchParams.set('variant', currentVariant);
      window.history.replaceState(null, '', url);
      if (toggleButton) toggleButton.textContent = `Variant: v${currentVariant}`;
    }

    renderQuestions(currentVariant);

    setPresence(storedPresence(), { immediate: true, remember: false });
    applySuggestions();
    setRecording(!FLAGS.recording);

    let toggleButton = null;
    if (showVariantToggle) {
      toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'variant-toggle';
      toggleButton.textContent = `Variant: v${currentVariant}`;
      toggleButton.addEventListener('click', () => {
        const idx = availableVariants.indexOf(currentVariant);
        setVariant(availableVariants[(idx + 1) % availableVariants.length]);
      });
      document.body.appendChild(toggleButton);
    }

    handle.reset = reset;
    handle.setVariant = setVariant;
    handle.setPresence = setPresence;
    handle.showSnack = showSnack;
    handle.getPresence = () => presence;
    return handle;
  }

  return { init, SCRIPTS, FLAG_DEFAULTS };
})();
