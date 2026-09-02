// ---------------------------------------------------------------- live session
// Two people, two computers, one screen. Both open the same link with the same
// room code on the end — windows.html?room=p27 — and whatever one of them does,
// the other sees.
//
// It does not send pictures of the screen. Both browsers run the prototype on
// their own, and this file keeps them in step by passing along the four things a
// person can actually do here:
//
//   a click        which thing was clicked
//   typing         what a note or the search box now says
//   scrolling      how far down the script has been scrolled
//   dragging       where the little bar was put
//
// and one more thing that is not an interaction: if either page is reloaded,
// both go back to the start together, so nobody is ever looking at a screen the
// other one cannot see.
//
// Without ?room= on the address this file does nothing at all, and the prototype
// behaves exactly as it always has.

(function () {
  const room = new URLSearchParams(window.location.search).get('room');
  if (!room) return;

  // ------------------------------------------------------- the same starting line
  // The prototype remembers things between visits — which surface you were last in,
  // which of Ria's habits you switched off, whether you have already seen the walk-
  // through. That memory lives on each machine separately, so two people who have
  // used it different amounts would start the session in different states and every
  // click after that would land somewhere slightly different. In a shared session
  // the remembering is switched off: both sides start from the defaults.
  const REMEMBERED = ['rae-presence', 'rae-suggestions', 'rae-options', 'rae-tour'];
  try {
    // Both kinds of browser storage share one set of methods, so the replacements
    // have to be handed back the store they were called on. Binding them to the
    // long-term store instead — an easy slip — quietly sends everything meant for
    // this tab's own short-term store into the wrong drawer.
    const store = window.localStorage;
    const realGet = Storage.prototype.getItem;
    const realSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (this === store && REMEMBERED.includes(key)) return null;
      return realGet.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (this === store && REMEMBERED.includes(key)) return;
      return realSet.call(this, key, value);
    };
  } catch (error) { /* private browsing has no storage to shim */ }

  // ------------------------------------------------------------------ the postman
  // Two ways to carry a message. Across the internet it goes through a Firebase
  // Realtime Database, which is a free Google service that does nothing but hold a
  // little data and tell anyone listening the moment it changes — no server of our
  // own to run. With no database address configured it falls back to a channel that
  // only reaches other tabs of the same browser on the same machine, which is enough
  // to try the thing out but no use for a real participant.
  const ME = Math.random().toString(36).slice(2, 10);
  const DB = (window.LIVE_DATABASE_URL || '').replace(/\/+$/, '');

  function connect(onMessage) {
    if (DB) {
      const path = `${DB}/rooms/${encodeURIComponent(room)}/events`;
      let ready = false;
      const stream = new EventSource(`${path}.json`);

      // The first thing the stream hands over is everything already in the room —
      // the messages sent before we arrived. Those have been acted on by whoever
      // was here and must not be acted on again, so the first delivery is thrown
      // away and only what arrives after it counts.
      stream.addEventListener('put', (event) => {
        const payload = JSON.parse(event.data || '{}');
        if (!ready) { ready = true; return; }
        if (payload.path === '/') return;
        if (payload.data) onMessage(payload.data);
      });
      stream.addEventListener('patch', (event) => {
        const payload = JSON.parse(event.data || '{}');
        if (!ready) return;
        Object.keys(payload.data || {}).forEach((key) => onMessage(payload.data[key]));
      });

      return (message) => {
        fetch(`${path}.json`, {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        }).catch(() => { /* a dropped message is better than a broken session */ });
      };
    }

    if (!('BroadcastChannel' in window)) return () => {};
    const channel = new BroadcastChannel(`live-${room}`);
    channel.onmessage = (event) => onMessage(event.data);
    return (message) => channel.postMessage(message);
  }

  // --------------------------------------------------------------- naming a thing
  // A message says which element was clicked, and the other page has to find the
  // same one. An id is the plain way to say it. Failing that, the element is
  // described by where it sits — third child of the second child of that id —
  // which holds because both pages are running the same prototype in the same
  // state, so their pages are built the same way.
  function addressOf(el) {
    if (!el || el.nodeType !== 1) return null;
    if (el.id) return `#${CSS.escape(el.id)}`;
    const steps = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body) {
      if (node.id) { steps.unshift(`#${CSS.escape(node.id)}`); break; }
      const parent = node.parentNode;
      if (!parent) break;
      steps.unshift(`${node.tagName.toLowerCase()}:nth-child(${[].indexOf.call(parent.children, node) + 1})`);
      node = parent;
    }
    if (!steps.length) return null;
    return (steps[0].startsWith('#') ? '' : 'body>') + steps.join('>');
  }

  const find = (address) => { try { return document.querySelector(address); } catch (error) { return null; } };

  // ------------------------------------------------------------------ the wiring
  function start() {
    const toolbar = document.getElementById('research-toolbar');
    let quietScrollUntil = 0;
    let quietDragUntil = 0;

    const send = connect(receive);
    const post = (message) => { message.from = ME; send(message); };

    const throttle = (fn, wait) => {
      let last = 0;
      let timer = null;
      return (...args) => {
        const now = Date.now();
        const gap = now - last;
        window.clearTimeout(timer);
        if (gap >= wait) { last = now; fn(...args); }
        else timer = window.setTimeout(() => { last = Date.now(); fn(...args); }, wait - gap);
      };
    };

    // ------------------------------------------------------------------- sending
    // Only things a person really did are passed on. Every event carries a flag
    // saying whether a human caused it or the code did, and the code's own clicks
    // are ignored — otherwise a click that makes the prototype click something
    // else would arrive twice at the other end and go twice as far.
    document.addEventListener('click', (event) => {
      if (!event.isTrusted) return;
      const address = addressOf(event.target);
      if (address) post({ t: 'click', a: address, x: event.clientX, y: event.clientY });
    }, true);

    document.addEventListener('input', (event) => {
      if (!event.isTrusted) return;
      const address = addressOf(event.target);
      if (address) post({ t: 'type', a: address, v: event.target.value });
    }, true);

    // Only the keys that move the session on. The letters someone types are already
    // covered by the line above, and sending them twice would double them up.
    const SHARED_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'];
    document.addEventListener('keydown', (event) => {
      if (!event.isTrusted || !SHARED_KEYS.includes(event.key)) return;
      post({
        t: 'key',
        k: event.key,
        a: addressOf(document.activeElement),
        // Ctrl and Enter together mean something the two do not mean apart, so the
        // held keys travel with the pressed one.
        m: [event.ctrlKey, event.metaKey, event.shiftKey, event.altKey],
      });
    }, true);

    document.addEventListener('scroll', throttle((event) => {
      if (Date.now() < quietScrollUntil) return;
      const address = addressOf(event.target);
      if (address) post({ t: 'scroll', a: address, y: event.target.scrollTop });
    }, 70), true);

    // Dragging the bar has no event of its own to listen for — it just moves. So
    // watch the bar itself, and say where it has got to whenever it changes.
    if (toolbar) {
      const moved = throttle(() => {
        if (Date.now() < quietDragUntil) return;
        post({ t: 'move', x: toolbar.style.left, y: toolbar.style.top });
      }, 70);
      new MutationObserver(moved).observe(toolbar, { attributes: true, attributeFilter: ['style'] });
    }

    // ----------------------------------------------------------------- receiving
    function receive(message) {
      if (!message || message.from === ME) return;

      if (message.t === 'reload') {
        // Marked before reloading so that the fresh page knows it was told to, and
        // does not turn round and tell the other side to reload in its turn.
        try { window.sessionStorage.setItem('live-told-to-reload', '1'); } catch (error) { /* no storage */ }
        window.location.reload();
        return;
      }

      if (message.t === 'click') {
        const el = find(message.a);
        if (el) el.dispatchEvent(new MouseEvent('click', {
          bubbles: true, cancelable: true, view: window, clientX: message.x, clientY: message.y,
        }));
        return;
      }

      if (message.t === 'type') {
        const el = find(message.a);
        if (el && el.value !== message.v) {
          el.value = message.v;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return;
      }

      if (message.t === 'key') {
        const el = find(message.a) || document.body;
        const held = message.m || [];
        el.dispatchEvent(new KeyboardEvent('keydown', {
          key: message.k, bubbles: true, cancelable: true,
          ctrlKey: !!held[0], metaKey: !!held[1], shiftKey: !!held[2], altKey: !!held[3],
        }));
        return;
      }

      if (message.t === 'scroll') {
        const el = find(message.a);
        if (el) {
          // Moving it here fires a scroll of our own, which would bounce straight
          // back and set off the same move at the other end. The short quiet spell
          // is what stops the two pages pushing each other up and down the page.
          quietScrollUntil = Date.now() + 200;
          el.scrollTop = message.y;
        }
        return;
      }

      if (message.t === 'move' && toolbar) {
        quietDragUntil = Date.now() + 200;
        toolbar.style.left = message.x;
        toolbar.style.top = message.y;
      }
    }

    // ------------------------------------------------------------- the reload rule
    // Reloading is the one thing that cannot be mirrored, because a reloaded page
    // has forgotten everything. So instead of trying to catch up, the other side is
    // sent back to the start too, and the pair carry on from there together.
    let told = false;
    let seenBefore = false;
    try {
      const store = window.sessionStorage;
      told = store.getItem('live-told-to-reload') === '1';
      seenBefore = store.getItem('live-seen-before') === '1';
      store.removeItem('live-told-to-reload');
      store.setItem('live-seen-before', '1');
    } catch (error) { /* no storage: reloads simply will not be shared */ }

    if (seenBefore && !told) post({ t: 'reload' });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
