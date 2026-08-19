window.ResearchToolbar = (function () {
  const QUESTION_SETS = {
    1: [
      {
        text: 'As a masters student, what does your day typically look like?',
        probes: [
          { number: '1.1', text: 'How do you usually commute?' },
          { number: '1.2', text: 'How many credit hours do you have per term?' },
        ],
      },
      { text: 'What kind of project are you currently working on?' },
      { text: 'What tools or software are you using for your project?' },
      { text: 'What challenges have you faced during this project?' },
    ],
    2: [
      { text: 'Tell me about yourself' },
      {
        text: 'What are you studying?',
        probes: [
          { number: '2.1', text: 'oh whereabouts in London?' },
          { number: '2.2', text: 'and how long is your course?' },
        ],
      },
      {
        text: 'Do you have any work experience?',
        rewrite: 'You mentioned you’re an UX designer, how many years of work experience do you have?',
      },
      { text: 'Where are you from?' },
    ],
  };

  // The variant that ships as the default experience.
  const DEFAULT_VARIANT = '2';

  const QUESTION_MIN_SCALE = 0.833;
  const QUESTION_SCALE_FALLOFF = 90;
  const QUESTION_SNAP_DURATION = 450;

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
    const insightToast = toolbarEl.querySelector('.insight-toast');
    const insightToastLabel = toolbarEl.querySelector('.insight-toast-label');
    const insightCounter = toolbarEl.querySelector('.insight-counter');
    const insightCountEl = toolbarEl.querySelector('#insight-count');
    const insightPlus = toolbarEl.querySelector('.insight-plus');
    const finishButton = toolbarEl.querySelector('.finish-session');
    const completeInsights = toolbarEl.querySelector('#complete-insights');
    const completeQuestions = toolbarEl.querySelector('#complete-questions');
    const completeDuration = toolbarEl.querySelector('#complete-duration');
    const toolbarTime = toolbarEl.querySelector('.toolbar-time');

    injectStyles();

    const availableVariants = Object.keys(QUESTION_SETS);
    const params = new URLSearchParams(window.location.search);
    const requestedVariant = params.get('variant');
    // Variant 2 (the scripted story) is the default experience. Variant 1 is kept around
    // for reference and is only reachable by asking for it explicitly (`?variant=1`).
    let currentVariant = availableVariants.includes(requestedVariant) ? requestedVariant : DEFAULT_VARIANT;
    // The variant switcher is a dev affordance, not part of the demo — it only appears
    // when a variant is pinned in the URL or `?dev=1` is set.
    const showVariantToggle = availableVariants.includes(requestedVariant) || params.get('dev') === '1';

    const handle = { dragState: { suppressClick: false } };

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
    const INSIGHT_PILL_HOLD = 1500;
    const LABEL_FADE = 150;

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
    const SCRIPT_FINISH_DELAY = 450;
    const SCRIPT_INSIGHTS = 2;

    let scriptStep = 0;
    let scriptBusy = false;
    let counterRevealed = false;

    function showPill(label) {
      window.clearTimeout(insightTimer);
      window.clearTimeout(labelSwapTimer);
      window.clearTimeout(labelFadeTimer);
      insightCounter.classList.remove('visible');
      insightToast.classList.remove('swapping');
      insightToast.style.width = '';
      insightToastLabel.textContent = label;
      insightToast.classList.add('visible');
    }

    // Crossfade the wording and ease the pill's width between the two labels, so the
    // change reads as a change rather than a silent text substitution.
    function swapPillLabel(text) {
      const startWidth = insightToast.getBoundingClientRect().width;
      insightToast.classList.add('swapping');

      window.clearTimeout(labelFadeTimer);
      labelFadeTimer = window.setTimeout(() => {
        insightToastLabel.textContent = text;
        insightToast.style.width = 'auto';
        const endWidth = insightToast.getBoundingClientRect().width;
        insightToast.style.width = `${startWidth}px`;
        void insightToast.offsetWidth;
        insightToast.style.width = `${endWidth}px`;
        insightToast.classList.remove('swapping');
      }, LABEL_FADE);
    }

    function unlockInsight(amount) {
      insightCount += amount || 1;
      insightCountEl.textContent = insightCount;
      // The "+1" float is for topping up a counter already on screen, not the first reveal.
      const bumpsExisting = counterRevealed;
      window.clearTimeout(insightTimer);
      insightTimer = window.setTimeout(() => {
        insightToast.classList.remove('visible');
        insightCounter.classList.add('visible');
        counterRevealed = true;
        if (bumpsExisting) {
          insightPlus.classList.remove('floating');
          void insightPlus.offsetWidth;
          insightPlus.classList.add('floating');
        }
      }, INSIGHT_PILL_HOLD);
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
      showPill(label);

      answeredTimer = window.setTimeout(() => {
        if (question) question.classList.add('answered');
      }, ANSWERED_PILL_HOLD);

      // Hold the "answered" wording long enough to read before handing the pill
      // over to the insight counter flow.
      labelSwapTimer = window.setTimeout(() => {
        swapPillLabel('New insight unlocked');
        unlockInsight(1);
      }, ANSWERED_LABEL_HOLD);
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
      target.classList.add('answered');
      bumpInsight();
      if (!finishButton) return;

      scriptBusy = true;
      window.setTimeout(() => {
        finishButton.classList.add('visible');
        scriptBusy = false;
      }, SCRIPT_FINISH_DELAY);
    }

    function showSessionComplete() {
      if (completeInsights) completeInsights.textContent = insightCount;
      if (completeQuestions) completeQuestions.textContent = `${questionEls.length}/${questionEls.length}`;
      if (completeDuration && toolbarTime) completeDuration.textContent = toolbarTime.textContent.trim();
      if (finishButton) finishButton.classList.remove('visible');
      window.clearTimeout(insightTimer);
      insightToast.classList.remove('visible');
      toolbarEl.classList.add('session-complete');
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

    // Rae restates Q3 in light of what the participant already said: the original is
    // struck through first, then the reworded version fades in beneath it.
    function rewriteQuestion() {
      const target = questionEls[SCRIPT_REWRITE_INDEX];
      if (!target || !target.querySelector('.question-rewrite')) {
        scriptBusy = false;
        return;
      }

      window.setTimeout(() => {
        target.classList.add('rewriting');
        window.setTimeout(() => {
          target.classList.add('rewritten');
          scriptBusy = false;
        }, SCRIPT_REWRITE_REVEAL);
      }, SCRIPT_REWRITE_STRIKE);
    }

    function answerNextQuestion() {
      const next = questionEls[SCRIPT_NEXT_INDEX];
      const probeCard = next && next.nextElementSibling;
      if (!probeCard || !probeCard.classList.contains('probe-card')) return;

      // Q2 is ticked first, then its probes open underneath.
      scriptBusy = true;
      next.classList.add('answered');
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
      if (opener) opener.classList.add('answered');
      if (!jumped) { scriptBusy = false; return; }

      // Q4 is struck through first — without ever becoming the active/highlighted
      // question — and only then does the pill slide out to explain why.
      window.setTimeout(() => {
        jumped.classList.add('answered');

        window.setTimeout(() => {
          const number = jumped.querySelector('.question-number').textContent;
          showPill(`Q${number} answered, will skip`);

          labelSwapTimer = window.setTimeout(() => {
            swapPillLabel('New insight unlocked');
            unlockInsight(SCRIPT_INSIGHTS);

            // Once the counter has settled, Rae rewrites Q3. Moving the highlight to
            // Q2 waits for the next click.
            window.setTimeout(rewriteQuestion, INSIGHT_PILL_HOLD);
          }, SCRIPT_LABEL_HOLD);
        }, SCRIPT_PILL_DELAY);
      }, SCRIPT_STRIKE_HOLD);
    }

    // One click on the white body per beat.
    const scriptBeats = [
      playScriptedSequence,                         // Q1 + Q4 answered, pill, +2, Q3 rewritten
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
      insightToast.classList.remove('visible');
      insightToast.classList.remove('swapping');
      insightToast.style.width = '';
      insightToastLabel.textContent = 'New insight unlocked';
      insightCounter.classList.remove('visible');
      insightPlus.classList.remove('floating');
      counterRevealed = false;
      insightCount = 0;
      insightCountEl.textContent = insightCount;
    }

    function setActiveQuestion(target) {
      const current = questionsEl.querySelector('.question.active');
      if (current === target) return;
      if (current) current.classList.remove('active');
      target.classList.add('active');
    }

    function scrollQuestionToTop(question) {
      const paddingTop = parseFloat(getComputedStyle(questionsEl).paddingTop) || 0;
      const targetScrollTop = Math.max(0, question.offsetTop - paddingTop);
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
      const containerTop = questionsEl.getBoundingClientRect().top + parseFloat(getComputedStyle(questionsEl).paddingTop);
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
      const set = QUESTION_SETS[variant] || QUESTION_SETS[availableVariants[0]];
      questionsEl.innerHTML = '';

      set.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        const rewrite = q.rewrite
          ? `<p class="question-text question-rewrite">${q.rewrite}</p>`
          : '';
        questionDiv.innerHTML = `<span class="question-number">${index + 1}</span><p class="question-text">${q.text}</p>${rewrite}`;
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
      bindQuestionInteractions(variant);
      observeContentSize();
      updateQuestionScales();
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
        const containerTop = questionsEl.getBoundingClientRect().top;
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
      toolbarEl.classList.remove('session-complete');
      if (finishButton) finishButton.classList.remove('visible');
      renderQuestions(currentVariant);
      questionsEl.scrollTop = 0;
      updateQuestionScales();
      resetInsights();
    }

    function setVariant(variant) {
      if (!QUESTION_SETS[variant] || variant === currentVariant) return;
      currentVariant = variant;
      scriptStep = 0;
      scriptBusy = false;
      toolbarEl.classList.remove('session-complete');
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
    return handle;
  }

  return { init, QUESTION_SETS };
})();
