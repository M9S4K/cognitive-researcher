# Running a session with someone else

Two people, two computers, one screen. You both open the same link, and whatever
one of you does, the other sees — clicking, typing, scrolling, moving the bar.

The participant does not install anything, sign in, or know anything is going on.
It looks like an ordinary web page to them.

```
https://<your site>/v5.2-paper/windows.html?room=p27
```

`p27` is the room code. Anything will do — a participant number, a date. Two
people with the same code are in the same session; a different code is a
different session. **Change it for every participant**, or two sessions running
at once will drive each other.

Without `?room=` the prototype behaves exactly as it always has.

---

## What is shared, and what is not

Shared: clicks, typing, scrolling, the position of the mini bar, the arrow keys
and Enter and Escape.

Not shared: your mouse pointer. You will not see their cursor moving, only the
result when they click.

Two things worth knowing before a real session:

**Take turns.** If you both click different things in the same second, your two
screens can end up in different places. In practice you hang back and let them
drive, and step in only when you mean to.

**Reloading restarts both of you.** A reloaded page has forgotten everything, so
rather than let the two of you look at different screens, the other one goes back
to the start as well. There is no way back to where you were. Neither of you has
much reason to press reload mid-session, but now you know not to.

Two smaller things:

- The walkthrough runs every time in a shared session, for both of you. It has to:
  if it appeared for one of you and not the other, every click after that would
  land somewhere different. Dismiss it once and it goes for both.
- The mini bar is placed in pixels, so on two differently sized screens it will
  not sit in exactly the same spot. Nothing else is affected.

---

## Setting it up

Two things to do once. Twenty minutes, no money, no server to run.

### 1. A place for the messages to pass through

Two browsers cannot talk to each other directly, so they pass messages through a
free Google service that does nothing but hold a little data and tell anyone
listening the moment it changes.

1. Go to <https://console.firebase.google.com> and sign in.
2. **Add project**. Name it anything. Turn Google Analytics **off** — nothing here
   needs it.
3. In the left menu: **Build → Realtime Database → Create Database**.
4. Pick a location near you, then choose **Start in test mode**. This makes the
   room readable and writable by anyone who has the address. That is fine for
   this: the only thing that ever goes through it is which button was clicked in a
   prototype full of made-up data. Do not point it at anything real.
5. Copy the database address at the top. It looks like
   `https://something-default-rtdb.europe-west1.firebasedatabase.app`.
6. Paste it into `live-config.js`, between the quotes.

Test mode expires after 30 days and the room stops working. If a session suddenly
does not sync, that is the first thing to check — Realtime Database → Rules, and
push the date out.

### 2. A web address to send people

The code is already on GitHub, so GitHub will host it as a website for free.

1. Push whatever you have to `main`.
2. On the repository page: **Settings → Pages**.
3. Under **Source** pick **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save, wait a minute or two, and the address appears on that same page.

The catch is that a free GitHub site has to come from a public repository, so
anyone who finds it can read the code. For a prototype with invented data that is
fine.

---

## Trying it before you set any of that up

Leave `live-config.js` blank and open the same room link in two tabs of your own
browser. They will sync with each other. This only works between tabs on one
machine — it is for checking the thing works, not for a real session.

---

## If something goes wrong

**Nothing syncs at all.** Check `live-config.js` has the address in it, and that
both of you have the same room code — a typo makes two separate sessions that
look identical and never meet.

**It synced and then stopped.** Most likely the 30-day test mode ran out. See
above.

**One screen is behind the other.** Reload either one. Both go back to the start
together, and you carry on from there.

**A click did something on their screen and not yours.** You both clicked at once.
Reload to get back in step.
