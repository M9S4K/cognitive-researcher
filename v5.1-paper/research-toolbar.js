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
                { number: '1.1', text: 'How do you usually commute?' },
                { number: '1.2', text: 'How many credit hours do you have per term?' },
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
                { number: '2.1', text: 'oh whereabouts in London?' },
                { number: '2.2', text: 'and how long is your course?' },
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
  const PRESENCE_MODES = ['focus', 'compact', 'dock'];
  const PRESENCE_KEY = 'rae-presence';
  const SIZE_KEY = 'rae-size';
  const SIZE_LIMITS = { minW: 340, maxW: 620, minH: 300, maxH: 620 };

  const QUESTION_MIN_SCALE = 0.833;
  const QUESTION_SCALE_FALLOFF = 90;
  const QUESTION_SNAP_DURATION = 450;

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

  function init(toolbarEl) {
    const questionsEl = toolbarEl.querySelector('.questions');
    const snackbar = toolbarEl.querySelector('#snackbar');
    const snackbarLabel = toolbarEl.querySelector('#snackbar-label');
    const manualNotes = toolbarEl.querySelector('.manual-notes');
    const progressEl = toolbarEl.querySelector('.question-progress');
    const legendButton = toolbarEl.querySelector('#legend-btn');
    const legend = toolbarEl.querySelector('#legend');
    const insightCounter = toolbarEl.querySelector('.insight-counter');
    const insightCountEl = toolbarEl.querySelector('#insight-count');
    const insightPlus = toolbarEl.querySelector('.insight-plus');
    const finishButton = toolbarEl.querySelector('.finish-session');
    const completeInsights = toolbarEl.querySelector('#complete-insights');
    const completeQuestions = toolbarEl.querySelector('#complete-questions');
    const completeDuration = toolbarEl.querySelector('#complete-duration');
    const compactCompleteInsights = toolbarEl.querySelector('#compact-complete-insights');
    const compactCompleteQuestions = toolbarEl.querySelector('#compact-complete-questions');
    const compactCompleteDuration = toolbarEl.querySelector('#compact-complete-duration');
    const compactComplete = toolbarEl.querySelector('#compact-complete');
    const toolbarTime = toolbarEl.querySelector('.toolbar-time');
    const presenceButtons = [...toolbarEl.querySelectorAll('.presence-btn')];
    const compactBar = toolbarEl.querySelector('.compact-bar');
    const compactCopy = toolbarEl.querySelector('#compact-copy');
    const compactMeta = toolbarEl.querySelector('#compact-meta');
    const compactLabel = toolbarEl.querySelector('#compact-label');
    const compactFinish = toolbarEl.querySelector('#compact-finish');
    const compactInsights = toolbarEl.querySelector('#compact-insights');
    const compactExpand = toolbarEl.querySelector('#compact-expand');
    const resizeGrip = toolbarEl.querySelector('#resize-grip');

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

    const handle = { dragState: { suppressClick: false } };
    let presence = 'focus';
    // Where the card was floating before it docked, so leaving the dock puts it back.
    let floatPosition = null;

    let questionEls = [];
    let questionsLine;
    let contentObserver;
    let insightTimer;
    let answeredTimer;
    let labelSwapTimer;
    let labelFadeTimer;
    let insightCount = 0;
    let scaleRafId;
    let scrollActiveTimer;
    let snapAnimationId;

    const ANSWERED_PILL_HOLD = 200;
    const ANSWERED_LABEL_HOLD = 1100;
    // The counter no longer waits for a pill to retract, so it can arrive promptly.
    const INSIGHT_REVEAL_DELAY = 420;
    const SNACK_HOLD = 2600;

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
    function showSnack(text) {
      if (!snackbar) return;
      window.clearTimeout(snackTimer);
      snackbarLabel.textContent = text;
      snackbar.classList.add('visible');
      snackTimer = window.setTimeout(() => snackbar.classList.remove('visible'), SNACK_HOLD);
    }

    function hideSnack() {
      window.clearTimeout(snackTimer);
      if (snackbar) snackbar.classList.remove('visible');
    }

    // ------------------------------------------------------- status vocabulary
    // Four states, each with its own mark: answered (struck through, per P24),
    // skipped (struck through plus the moment it was actually answered), reworded
    // (tagged "paraphrased"), and to-ask.
    function markAnswered(question) {
      if (!question) return;
      question.classList.remove('skipped');
      question.classList.add('answered');
      updateCompactBar();
      updateProgress();
    }

    function markSkipped(question) {
      if (!question) return;
      question.classList.add('skipped');
      updateCompactBar();
      updateProgress();
    }

    function restoreQuestion(question) {
      if (!question) return;
      question.classList.remove('skipped', 'answered');
      updateCompactBar();
      updateProgress();
    }

    function unlockInsight(amount) {
      insightCount += amount || 1;
      insightCountEl.textContent = insightCount;
      updateCompactBar();
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
      updateCompactBar();
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

    // Each click on the white body advances the story one beat.
    function advanceScript() {
      if (scriptBusy) return;
      const beat = scriptBeats[scriptStep];
      if (!beat) return;
      scriptStep += 1;
      beat();
    }

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
      if (compactCompleteQuestions) compactCompleteQuestions.textContent = questions;
      if (compactCompleteDuration) compactCompleteDuration.textContent = duration;
      if (finishButton) finishButton.classList.remove('visible');
      toolbarEl.classList.remove('has-finish');
      window.clearTimeout(insightTimer);
      hideSnack();
      closeLegend();
      toolbarEl.classList.add('session-complete');
      applyPresence(presence);
    }

    function tickProbe(index) {
      const next = questionEls[SCRIPT_NEXT_INDEX];
      const probeCard = next && next.nextElementSibling;
      if (!probeCard || !probeCard.classList.contains('probe-card')) return;
      const row = probeCard.querySelectorAll('.probe-row')[index];
      if (!row || row.classList.contains('checked')) return;
      row.classList.add('checked');
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
      target.classList.add('proposing');
      scriptBusy = false;
    }

    function acceptRewrite(question) {
      if (!question || question.classList.contains('rewritten')) return;
      question.classList.remove('proposing');
      question.classList.add('rewriting');
      window.setTimeout(() => {
        question.classList.add('rewritten');
        updateCompactBar();
      }, SCRIPT_REWRITE_REVEAL);
      showSnack('Reworded — the original is kept above');
    }

    function keepOriginal(question) {
      if (!question) return;
      question.classList.remove('proposing');
      showSnack('Original kept');
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
        next.classList.add('expanded');
        probeCard.classList.add('revealed');
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
          showSnack(`Q${number} was answered earlier — skipped`);
          unlockInsight(SCRIPT_INSIGHTS);

          // Rae then offers a reworded Q3. Moving the highlight to Q2 waits for
          // the next click.
          window.setTimeout(proposeRewrite, SCRIPT_PROPOSAL_DELAY);
        }, SCRIPT_PILL_DELAY);
      }, SCRIPT_STRIKE_HOLD);
    }

    // One click on the white body per beat.
    const scriptBeats = [
      playScriptedSequence,                         // Q1 answered, Q4 skipped, +2, Q3 rewording offered
      () => focusQuestion(SCRIPT_NEXT_INDEX),       // Q2 snaps into the top slot
      answerNextQuestion,                           // Q2 ticked (+1), probes open
      () => tickProbe(0),                           // 2.1 ticked (+1)
      () => tickProbe(1),                           // 2.2 ticked (+1)
      () => focusQuestion(SCRIPT_REWRITE_INDEX),    // Q3 snaps into the top slot
      answerFinalQuestion,                          // Q3 ticked (+1), Finish Session appears
    ];

    if (finishButton) {
      finishButton.addEventListener('click', (event) => {
        event.stopPropagation();
        showSessionComplete();
      });
    }

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
      updateCompactBar();
    }

    // --------------------------------------------------------------- presence
    // The strip has to say the same three things the card does: still recording,
    // where we are, how many insights so far.
    function updateCompactBar() {
      if (!compactLabel) return;
      const active = questionsEl.querySelector('.question.active') || questionEls[0];
      if (active) {
        const number = active.querySelector('.question-number').textContent;
        const rewritten = active.classList.contains('rewritten')
          ? active.querySelector('.question-rewrite')
          : null;
        // The rewritten line carries the "paraphrased" tag as a child element; the
        // strip wants the wording on its own.
        const line = rewritten || active.querySelector('.question-text');
        const tag = line.querySelector('.question-tag');
        compactLabel.textContent = tag ? line.textContent.replace(tag.textContent, '').trim() : line.textContent;
        compactLabel.title = compactLabel.textContent;
        if (compactMeta) {
          const sections = activeScript().sections;
          compactMeta.textContent = `Q${number} · Section ${ACTIVE_SECTION_INDEX + 1} of ${sections.length}`
            + ` · ${answeredCount()} of ${questionEls.length}`;
        }
      }
      if (compactInsights) compactInsights.textContent = insightCount;
    }

    function applyPresence(mode) {
      PRESENCE_MODES.forEach((name) => toolbarEl.classList.toggle(`presence-${name}`, name === mode));
      document.body.dataset.raePresence = mode;
      presenceButtons.forEach((button) => {
        const on = button.dataset.presence === mode;
        button.classList.toggle('is-on', on);
        button.setAttribute('aria-pressed', String(on));
      });
      const complete = toolbarEl.classList.contains('session-complete');
      if (compactBar) compactBar.setAttribute('aria-hidden', String(mode !== 'compact' || complete));
      if (compactComplete) compactComplete.setAttribute('aria-hidden', String(mode !== 'compact' || !complete));

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

      updateCompactBar();
      requestAnimationFrame(updateQuestionScales);
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

    function applySize(width, height) {
      toolbarEl.style.setProperty('--rae-w', `${Math.round(width)}px`);
      toolbarEl.style.setProperty('--rae-h', `${Math.round(height)}px`);
    }

    if (resizeGrip) {
      resizeGrip.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const rect = toolbarEl.getBoundingClientRect();
        // The card eases its width and height when a mode changes; under the pointer
        // that reads as lag, so the transition is off for the duration of the drag.
        toolbarEl.classList.add('resizing');
        resizeGrip.setPointerCapture(event.pointerId);
        let size = { w: Math.round(rect.width), h: Math.round(rect.height) };

        const move = (moveEvent) => {
          size = {
            w: Math.round(clamp(rect.width + (moveEvent.clientX - event.clientX), SIZE_LIMITS.minW, SIZE_LIMITS.maxW)),
            h: Math.round(clamp(rect.height + (moveEvent.clientY - event.clientY), SIZE_LIMITS.minH, SIZE_LIMITS.maxH)),
          };
          applySize(size.w, size.h);
          updateQuestionScales();
        };
        const stop = () => {
          // Store what was asked for, not what the box happens to measure — mid
          // transition those are different numbers.
          toolbarEl.classList.remove('resizing');
          writeStored(SIZE_KEY, JSON.stringify(size));
          resizeGrip.removeEventListener('pointermove', move);
          resizeGrip.removeEventListener('pointerup', stop);
          resizeGrip.removeEventListener('pointercancel', stop);
        };
        resizeGrip.addEventListener('pointermove', move);
        resizeGrip.addEventListener('pointerup', stop);
        resizeGrip.addEventListener('pointercancel', stop);
      });
    }

    presenceButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        setPresence(button.dataset.presence);
      });
    });

    if (compactExpand) {
      compactExpand.addEventListener('click', (event) => {
        event.stopPropagation();
        setPresence('focus');
      });
    }

    // Minimised is still a working assistant: the strip advances the session the same
    // way the question list does, and can end it.
    if (compactCopy) {
      compactCopy.addEventListener('click', (event) => {
        event.stopPropagation();
        if (handle.dragState.suppressClick) { handle.dragState.suppressClick = false; return; }
        if (currentVariant !== SCRIPTED_VARIANT) { setPresence('focus'); return; }
        advanceScript();
      });
    }

    if (compactFinish) {
      compactFinish.addEventListener('click', (event) => {
        event.stopPropagation();
        showSessionComplete();
      });
    }

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

    function updateQuestionScales() {
      const containerTop = questionsEl.getBoundingClientRect().top + listOffset();
      questionEls.forEach((question) => {
        const distance = Math.abs(question.getBoundingClientRect().top - containerTop);
        const t = Math.min(1, distance / QUESTION_SCALE_FALLOFF);
        const scale = 1 - t * (1 - QUESTION_MIN_SCALE);
        question.style.transform = `scale(${scale})`;
      });
      updateQuestionsLine();
    }

    // The connector runs from the first question number to the last. Both ends move as
    // questions scale on scroll and as cards expand, so it is remeasured rather than
    // pinned to the container's (fixed) height.
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

    // Probe cards and rewrites animate their height open, which moves the last number.
    function observeContentSize() {
      if (typeof ResizeObserver === 'undefined') return;
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
          showSnack('Q4 back on the list');
        });
      });

      questionsEl.querySelectorAll('.note-toggle').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          const note = button.closest('.rae-note');
          const showing = note.classList.toggle('showing-quote');
          button.textContent = showing ? 'Hide' : 'Her words';
          updateQuestionsLine();
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
      updateQuestionsLine();
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
      showSnack('Note added');
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
      updateQuestionsLine();
    }

    if (manualNotes) {
      manualNotes.addEventListener('click', (event) => {
        event.stopPropagation();
        openComposer();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'n' && event.key !== 'N') return;
      if (!toolbarEl.classList.contains('visible')) return;
      if (toolbarEl.classList.contains('session-complete')) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      event.preventDefault();
      // Minimised, the question list is display:none, so opening the composer before
      // the mode has finished switching gives the input nothing to take focus in.
      if (presence !== 'focus' && presence !== 'dock') {
        setPresence('focus');
        window.setTimeout(openComposer, 220);
        return;
      }
      openComposer();
    });

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

      questionsEl.querySelectorAll('.probe-row').forEach((row) => {
        row.addEventListener('click', (event) => {
          event.stopPropagation();
          if (handle.dragState.suppressClick) { handle.dragState.suppressClick = false; return; }
          row.classList.toggle('checked');
          if (!row.classList.contains('checked')) return;

          const probeCard = row.closest('.probe-card');
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

      // The section the researcher is in, pinned above the questions it governs.
      const head = document.createElement('div');
      head.className = 'section-head';
      head.innerHTML = `<span class="section-where">Section ${ACTIVE_SECTION_INDEX + 1} of ${sections.length}</span>`
        + `<span class="section-name">${section.name}</span>`
        + `<span class="section-counter">0 of ${set.length}</span>`;
      questionsEl.appendChild(head);
      sectionHeadEl = head;
      sectionCounterEl = head.querySelector('.section-counter');

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
        const note = q.note
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
          probeCard.setAttribute('aria-label', 'Consider probing');
          const probeRows = q.probes
            .map((p) => `<div class="probe-row"><span class="probe-number">${p.number}</span><p class="probe-question">${p.text}</p></div>`)
            .join('');
          probeCard.innerHTML = `<p class="probe-title">Consider probing</p>${probeRows}`;
          questionsEl.appendChild(probeCard);
        }
      });

      // The rest of the script, named and counted but not unpacked. P24 praised the
      // sectioning; the confusion was only ever about how much there is.
      if (sections.length > 1) {
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

      questionsLine = document.createElement('span');
      questionsLine.className = 'questions-line';
      questionsLine.setAttribute('aria-hidden', 'true');
      questionsEl.prepend(questionsLine);

      questionEls = [...questionsEl.querySelectorAll('.question')];
      questionEls[0].classList.add('active');
      bindStatusControls();
      bindQuestionInteractions(variant);
      observeContentSize();
      renderProgressSegments(sections.length);
      updateProgress();
      updateQuestionScales();
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
      if (!scaleRafId) {
        scaleRafId = requestAnimationFrame(() => {
          updateQuestionScales();
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

    document.addEventListener('keydown', (event) => {
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
      toolbarEl.classList.remove('session-complete', 'has-finish');
      if (finishButton) finishButton.classList.remove('visible');
      renderQuestions(currentVariant);
      questionsEl.scrollTop = 0;
      updateQuestionScales();
      resetInsights();
      setPresence(readStored(PRESENCE_KEY) || 'focus', { immediate: true, remember: false });
    }

    function setVariant(variant) {
      if (!QUESTION_SETS[variant] || variant === currentVariant) return;
      currentVariant = variant;
      scriptStep = 0;
      scriptBusy = false;
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

    const storedSize = readStored(SIZE_KEY);
    if (storedSize) {
      try {
        const size = JSON.parse(storedSize);
        if (size && size.w && size.h) applySize(size.w, size.h);
      } catch (error) { /* ignore a corrupt entry */ }
    }
    setPresence(readStored(PRESENCE_KEY) || 'focus', { immediate: true, remember: false });

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
    handle.getPresence = () => presence;
    return handle;
  }

  return { init, SCRIPTS };
})();
