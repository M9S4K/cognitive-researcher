// Motion dials — DialKit, for tuning the mini bar's transitions by hand.
//
// Loaded only for ?dials=1. Every control writes a CSS custom property on :root, which is
// where windows.html reads all of its durations, delays and travel from — so nothing here
// knows anything about the animations themselves, and adding a token to the stylesheet is
// all it takes to make one tunable.
//
// Vue, motion and DialKit come from esm.sh as ES modules, so there is still no build step
// and the shipped page loads none of it. Four things this setup depends on, each of which
// fails quietly rather than loudly:
//
//   1. Direct CDN URLs, not an importmap — esm.sh resolves DialKit's own vue/motion
//      imports to the same URLs, so there is one Vue instance and reactivity works.
//   2. `productionEnabled` — esm.sh serves production builds, and DialKit renders null in
//      production by default. Without it the panel mounts, resolves values, writes every
//      property correctly, and shows nothing at all.
//   3. Numeric dials are tuples, [value, min, max, step] — an object resolves to undefined.
//   4. useDialKit returns a ComputedRef, so the values are behind `.value`.
(async () => {
  const VUE = 'https://esm.sh/vue@3';
  const DIALKIT = 'https://esm.sh/dialkit@1.4.3/vue';
  const STYLES = 'https://esm.sh/dialkit@1.4.3/styles.css';

  const root = document.documentElement;
  const card = document.getElementById('research-toolbar');

  // A dial only changes the *next* transition, so changing one has to run one — otherwise
  // you drag a slider and the card just sits there. The card decides what "replay" means;
  // the panel only asks.
  const replay = () => card && card.dispatchEvent(new CustomEvent('rae:replay'));
  const step = (key) => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

  // Dragging updates continuously; replaying every frame would be unwatchable. This fires
  // once the value has settled, which is the moment you actually want to see.
  let settleTimer;
  const replayWhenSettled = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(replay, 260);
  };

  // The stylesheet is the source of truth for the starting values — the panel never
  // invents a default of its own.
  const read = (prop) => getComputedStyle(root).getPropertyValue(prop).trim();
  const num = (prop) => {
    const match = /(-?[\d.]+)/.exec(read(prop));
    return match ? parseFloat(match[1]) : 0;
  };
  // A time token can be authored in seconds and written back in milliseconds, so reading
  // one has to respect the unit rather than just grabbing the number.
  const msNum = (prop) => {
    const raw = read(prop);
    const match = /(-?[\d.]+)\s*(m?s)/.exec(raw);
    if (!match) return num(prop);
    return parseFloat(match[1]) * (match[2] === 's' ? 1000 : 1);
  };
  const bezier = (prop) => {
    const parts = (read(prop).match(/-?[\d.]+/g) || []).slice(0, 4).map(Number);
    return parts.length === 4 ? parts : [0.23, 1, 0.32, 1];
  };

  let vue;
  let dialkit;
  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLES;
    document.head.appendChild(link);
    [vue, dialkit] = await Promise.all([import(VUE), import(DIALKIT)]);
  } catch (error) {
    // The dials need the network; the prototype itself doesn't. Say so, rather than
    // leaving a ?dials=1 URL that looks like it simply did nothing.
    console.warn('[dials] DialKit could not be loaded — the panel needs network access.', error);
    return;
  }

  const { createApp, defineComponent, h, watchEffect } = vue;
  const { DialRoot, useDialKit } = dialkit;

  // An easing control carries a duration and a curve together, which is exactly how the
  // stylesheet pairs them: --t-roll with --ease-roll, --t-height with --ease-drawer.
  const easing = (durationProp, easeProp) => ({
    type: 'easing',
    duration: num(durationProp),
    ease: bezier(easeProp),
  });

  const CONFIG = {
    speed: [num('--rae-speed') || 1, 0.25, 4, 0.05],
    // The section name, both counters and the body all change with the same move, so one
    // control drives the lot; the rest of the card keeps its own timings.
    roll: {
      value: easing('--t-roll', '--ease-roll'),
      handoffLag: [num('--t-roll-lag'), 0, 300, 10],
      travel: [num('--m-roll'), 0, 24, 1],
    },
    timing: {
      cardHeight: easing('--t-height', '--ease-drawer'),
      footerFade: [num('--t-foot-fade'), 0, 900, 10],
      footerSlide: [num('--t-foot-move'), 0, 900, 10],
      statusDot: [num('--t-dot'), 0, 900, 10],
      summary: [num('--t-complete'), 0, 900, 10],
    },
    travel: {
      footerSlide: [num('--m-rise-foot'), 0, 40, 1],
      summaryRise: [num('--m-rise-complete'), 0, 24, 1],
    },
    // The recording pulse is an ambient loop rather than a transition, so it keeps its
    // own timing and sits outside the speed multiplier.
    pulse: {
      cycle: [msNum('--t-pulse'), 600, 4000, 100],
      spread: [num('--m-pulse'), 0, 40, 1],
      strength: [num('--a-pulse'), 0, 1, 0.02],
    },
    replayNow: { type: 'action', label: 'Replay' },
    stepBack: { type: 'action', label: 'Back' },
    copyCss: { type: 'action', label: 'Copy CSS' },
  };

  // Durations are written back in the same calc() shape the stylesheet authored them in.
  // Writing a flat `600ms` would work once and then quietly break the speed dial, because
  // the multiplier it was reading is no longer in the expression.
  const ms = (prop, value) => root.style.setProperty(prop, `calc(${Math.round(value)}ms * var(--rae-speed))`);
  const px = (prop, value) => root.style.setProperty(prop, `${Math.round(value)}px`);
  // A transition can be switched to a spring in the UI, which has no bezier to give.
  const curve = (prop, transition) => {
    if (transition && transition.ease) root.style.setProperty(prop, `cubic-bezier(${transition.ease.join(', ')})`);
  };

  let latest = null;

  function applyValues(v) {
    latest = v;
    root.style.setProperty('--rae-speed', String(v.speed));
    ms('--t-roll', v.roll.value.duration);
    curve('--ease-roll', v.roll.value);
    ms('--t-roll-lag', v.roll.handoffLag);
    px('--m-roll', v.roll.travel);
    ms('--t-height', v.timing.cardHeight.duration);
    curve('--ease-drawer', v.timing.cardHeight);
    ms('--t-foot-fade', v.timing.footerFade);
    ms('--t-foot-move', v.timing.footerSlide);
    ms('--t-dot', v.timing.statusDot);
    ms('--t-complete', v.timing.summary);
    px('--m-rise-foot', v.travel.footerSlide);
    px('--m-rise-complete', v.travel.summaryRise);
    root.style.setProperty('--t-pulse', `${Math.round(v.pulse.cycle)}ms`);
    px('--m-pulse', v.pulse.spread);
    root.style.setProperty('--a-pulse', String(v.pulse.strength));
  }

  async function copyCss() {
    if (!latest) return;
    const v = latest;
    const speed = v.speed || 1;
    // Bake the multiplier into each duration and hand --rae-speed back at 1, so the pasted
    // block renders identically without carrying the tuning session's scale with it.
    const d = (prop, value) => `  ${prop}: calc(${Math.round(value * speed)}ms * var(--rae-speed));`;
    const css = [
      ':root {',
      '  --rae-speed: 1;',
      `  --ease-roll: cubic-bezier(${v.roll.value.ease.join(', ')});`,
      `  --ease-drawer: cubic-bezier(${v.timing.cardHeight.ease.join(', ')});`,
      d('--t-roll', v.roll.value.duration),
      d('--t-roll-lag', v.roll.handoffLag),
      `  --m-roll: ${Math.round(v.roll.travel)}px;`,
      d('--t-height', v.timing.cardHeight.duration),
      d('--t-foot-fade', v.timing.footerFade),
      d('--t-foot-move', v.timing.footerSlide),
      d('--t-dot', v.timing.statusDot),
      d('--t-complete', v.timing.summary),
      `  --m-rise-foot: ${Math.round(v.travel.footerSlide)}px;`,
      `  --m-rise-complete: ${Math.round(v.travel.summaryRise)}px;`,
      `  --t-pulse: ${Math.round(v.pulse.cycle)}ms;`,
      `  --m-pulse: ${Math.round(v.pulse.spread)}px;`,
      `  --a-pulse: ${v.pulse.strength};`,
      '}',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(css);
      console.log('[dials] copied to clipboard:\n' + css);
    } catch {
      console.log('[dials] clipboard blocked, here it is:\n' + css);
    }
  }

  const Panel = defineComponent({
    setup() {
      const values = useDialKit('Mini bar motion', CONFIG, {
        persist: { key: 'rae-dials', storage: 'localStorage', presets: true },
        onAction: (action) => {
          if (action === 'replayNow') replay();
          else if (action === 'stepBack') step('ArrowUp');
          else if (action === 'copyCss') copyCss();
        },
      });

      let first = true;
      watchEffect(() => {
        applyValues(values.value);
        // Applying the stylesheet's own values on mount isn't a change worth replaying.
        if (first) { first = false; return; }
        replayWhenSettled();
      });

      return () => h(DialRoot, { productionEnabled: true, defaultOpen: true, position: 'bottom-right' });
    },
  });

  const mount = document.createElement('div');
  document.body.appendChild(mount);
  createApp(Panel).mount(mount);
})();
