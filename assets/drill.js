// Shared drill engine for every exam.
// Reads window.BANK from the exam's questions.js:
//   { title, storageKey, decks, ids: {deck:[id]}, q: {id:{d,tag,q,ok,wrong,ex,img,val,topic,dup}}, img?, textOnly?, topics? }
// Everything is stored in this browser's localStorage under BANK.storageKey. Nothing leaves the device.
(() => {
  const B = window.BANK, SRC = B.decks, Q = B.q;
  const ALL = Object.keys(SRC).flatMap(d => B.ids[d]).filter(id => !Q[id].dup);
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const txt = s => B.textOnly ? esc(s) : String(s);          // Exam 1 questions contain small bits of markup
  const plain = s => String(s).replace(/<[^>]*>/g, "");
  const imgOf = id => Q[id].img || (B.img && B.img[id]) || null;
  const topicOf = id => Q[id].topic || SRC[Q[id].d].name;
  const srcOf = id => SRC[Q[id].d].src || SRC[Q[id].d].name;
  const shuffle = a => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.random() * (k + 1) | 0; [a[k], a[j]] = [a[j], a[k]] } return a };
  const pct = (c, a) => a ? Math.round(c / a * 100) : 0;
  const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
  const reduceMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Subjects: tabs group questions by subject, not by where they came from. "Mixed" holds everything.
  const slug = s => "t-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const DECKS = {}, IDS = {};
  const tlist = (B.topics || []).slice();
  for (const id of ALL) { const t = topicOf(id); if (!tlist.some(x => x.name === t)) tlist.push({ name: t }) }
  for (const t of tlist) {
    const ids = ALL.filter(id => topicOf(id) === t.name); if (!ids.length) continue;
    DECKS[slug(t.name)] = { name: t.short || t.name, full: t.name, sub: t.sub || t.name }; IDS[slug(t.name)] = ids;
  }
  DECKS.ALL = { name: "Mixed", full: "Mixed", sub: "Every question from every subject, weakest first. Good for a final run-through before the exam." }; IDS.ALL = ALL;
  const FIRST = Object.keys(DECKS)[0];

  // ===== Mastery model
  // MASTERED means: right 3 times in a row (4 for two-choice questions, so a lucky streak stays under ~6%),
  // with that streak stretching across at least an hour. A miss resets the streak. A mastered question
  // not seen for 5 days becomes "due for review".
  const SPACING = 60 * 60 * 1000, FADE = 5 * 24 * 60 * 60 * 1000;
  const need = id => Q[id].wrong.length + 1 <= 2 ? 4 : 3;
  const ORDER = ["learning", "due", "shaky", "new", "mastered"];   // review order: weakest first
  const LEVEL_TEXT = { new: "New", learning: "Learning", shaky: "Getting there", due: "Due for review", mastered: "Mastered" };
  const WEIGHT = { new: 0, learning: 0, shaky: .5, due: .75, mastered: 1 };
  function lvl(id) {
    const st = S.stats[id], g = S.log[id];
    if (!st || !st[0]) return "new";
    if (!g || !g.s) return "learning";
    if (g.s >= need(id) && g.last - g.t0 >= SPACING) return Date.now() - g.last > FADE ? "due" : "mastered";
    return "shaky";
  }
  const byNeed = ids => { const g = {}; for (const id of shuffle(ids)) (g[lvl(id)] = g[lvl(id)] || []).push(id); return ORDER.flatMap(l => g[l] || []) };

  // ===== Daily activity (no quota: just a count and a day streak)
  const AUTO_MS = 1800;
  const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const today = () => S.days[dayKey()] | 0;
  function dayStreak() {
    const d = new Date(); let n = 0;
    if (!S.days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (S.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1) }
    return n;
  }

  // ===== State
  // A round is an ordered list of questions plus a current position. Students can move to any position;
  // each position is either unanswered (live question) or answered (read-only review).
  const L = B.storageKey;
  let S = fresh(), missed = new Set(), answered = false, view = "deck", curOpts = null, autoTimer = null, menuOpen = false;
  function fresh() { return { v: 2, updatedAt: 0, deck: FIRST, shuffle: true, onlyMissed: false, auto: true, missed: [], hist: {}, stats: {}, log: {}, days: {}, rounds: {}, focus: null } }
  const pool = d => d === "FOCUS" ? (S.focus ? S.focus.ids : []) : IDS[d];
  function apply(s) {
    if (!s || s.v !== 2) return false;
    const n = fresh();
    n.updatedAt = s.updatedAt || 0; n.shuffle = s.shuffle !== false; n.onlyMissed = !!s.onlyMissed; n.auto = s.auto !== false;
    n.missed = (s.missed || []).filter(id => Q[id]);
    for (const k in (s.hist || {})) if (Q[k]) n.hist[k] = s.hist[k] ? 1 : 0;
    for (const k in (s.stats || {})) if (Q[k] && Array.isArray(s.stats[k])) n.stats[k] = [s.stats[k][0] | 0, s.stats[k][1] | 0];
    for (const k in n.hist) if (!n.stats[k]) n.stats[k] = [1, n.hist[k]];
    for (const k in (s.log || {})) { const g = s.log[k]; if (Q[k] && g) n.log[k] = { s: g.s | 0, t0: +g.t0 || 0, last: +g.last || 0 } }
    for (const k in n.hist) if (!n.log[k]) n.log[k] = { s: n.hist[k], t0: 0, last: 0 };
    for (const k in (s.days || {})) if (/^\d{4}-\d\d-\d\d$/.test(k)) n.days[k] = s.days[k] | 0;
    if (s.focus && Array.isArray(s.focus.ids)) { const ids = s.focus.ids.filter(id => Q[id] && !Q[id].dup); if (ids.length) n.focus = { label: String(s.focus.label || "Focus"), ids } }
    n.deck = DECKS[s.deck] || (s.deck === "FOCUS" && n.focus) ? s.deck : FIRST;
    S = n; missed = new Set(n.missed);
    for (const d of [...Object.keys(DECKS), "FOCUS"]) {
      const r = (s.rounds || {})[d]; if (!r || !Array.isArray(r.order)) continue;
      const ok = new Set(pool(d)); const order = r.order.filter(id => ok.has(id));
      const log = order.length === r.order.length && Array.isArray(r.log) ? r.log.slice(0, order.length) : [];
      const pos = Number.isInteger(r.pos) ? r.pos : (r.i | 0);   // older saves tracked only how far you'd got
      n.rounds[d] = { order, pos: Math.max(0, Math.min(pos, order.length)), streak: r.streak | 0, best: r.best | 0, m0: r.m0 | 0, log };
    }
    return true;
  }
  function load() { try { return JSON.parse(localStorage.getItem(L) || "null") } catch (e) { return null } }
  function save() { S.updatedAt = Date.now(); S.missed = [...missed]; try { localStorage.setItem(L, JSON.stringify(S)) } catch (e) { } }

  // ===== Rounds and navigation
  const R = () => S.rounds[S.deck];
  const masteredIn = ids => ids.filter(id => lvl(id) === "mastered").length;
  const doneIn = r => r.log.filter(Boolean).length;
  const rightIn = r => r.log.filter(e => e && e.p === e.c).length;
  function nextUnanswered(r, from) {
    const n = r.order.length;
    for (let k = from + 1; k < n; k++) if (!r.log[k]) return k;
    for (let k = 0; k <= Math.min(from, n - 1); k++) if (!r.log[k]) return k;
    return -1;
  }
  function newRound(d) {
    let ids = pool(d).slice(); if (S.onlyMissed) ids = ids.filter(id => missed.has(id));
    S.rounds[d] = { order: S.shuffle ? byNeed(ids) : ids, pos: 0, streak: 0, best: 0, m0: masteredIn(pool(d)), log: [] };
  }
  function restart() { newRound(S.deck); answered = false; view = "deck"; paint(); save() }
  function openDeck(d) { view = "deck"; S.deck = d; answered = false; if (!S.rounds[d]) newRound(d); paint(); save() }
  function startFocus(label, ids) {
    S.focus = { label, ids }; S.deck = "FOCUS"; S.onlyMissed = false;
    S.rounds.FOCUS = { order: byNeed(ids), pos: 0, streak: 0, best: 0, m0: masteredIn(ids), log: [] };
    answered = false; view = "deck"; paint(); save(); window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
  }
  // Move to any position in the round (n = results screen).
  function goTo(k) {
    const r = R(); if (!r) return;
    stopAuto(); answered = false;
    r.pos = Math.max(0, Math.min(k, r.order.length)); save(); paint();
  }
  const goPrev = () => { const r = R(); if (r && r.pos > 0) goTo(r.pos - 1) };
  const goNext = () => { const r = R(); if (r && r.pos < r.order.length) goTo(r.pos + 1) };
  // After answering: the next question you haven't answered yet, or the results when none are left.
  const goNextQuestion = () => { const r = R(); const k = nextUnanswered(r, r.pos); goTo(k < 0 ? r.order.length : k) };

  // ===== Summaries
  function sumUp(ids) {
    let a = 0, c = 0, seen = 0, w = 0; const n = { new: 0, learning: 0, shaky: 0, due: 0, mastered: 0 };
    for (const id of ids) { const s = S.stats[id]; if (s && s[0]) { a += s[0]; c += s[1]; seen++ } const l = lvl(id); n[l]++; w += WEIGHT[l] }
    return { a, c, seen, n, mastered: n.mastered, total: ids.length, acc: pct(c, a), mastery: Math.round(w / Math.max(1, ids.length) * 100) };
  }
  const subjects = () => Object.keys(DECKS).filter(k => k !== "ALL").map(k => ({ key: k, name: DECKS[k].full, short: DECKS[k].name, ids: IDS[k], ...sumUp(IDS[k]) }));
  const weakest = (except) => subjects().filter(t => t.key !== except).sort((x, y) => x.mastery - y.mastery || y.n.learning - x.n.learning)[0];
  const segs = n => ["mastered", "due", "shaky", "learning"].map(l => n[l] ? `<i class="lv-c-${l}" style="width:${n[l] / Math.max(1, n.mastered + n.due + n.shaky + n.learning + n.new) * 100}%"></i>` : "").join("");

  // ===== Toasts
  function toast(msg, tone = "") {
    const t = document.createElement("div"); t.className = "toast " + tone; t.innerHTML = `<i></i>${esc(msg)}`;
    $("toasts").appendChild(t); setTimeout(() => t.remove(), 2700);
  }

  // ===== Chrome: header, tabs, question squares, toolbar
  function ringSVG(size, stroke, frac) {
    const r = (size - stroke) / 2, C = 2 * Math.PI * r;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/><circle class="fill" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.min(1, frac))}"/></svg>`;
  }
  function paintHabit() {
    const t = today(), st = dayStreak();
    $("habit").innerHTML = `<div class="habit-text"><strong>${t} answered today</strong><span>${st ? plural(st, "day") + " in a row" : "Study today to start a streak"}</span></div>`;
  }
  function buildTabs() {
    const box = $("tabs"); box.innerHTML = "";
    const make = (key, label, onclick, extra = "") => {
      const b = document.createElement("button"); b.className = "tab " + extra; b.setAttribute("role", "tab"); b.id = "tab" + key;
      b.innerHTML = `<b>${esc(label)}</b><span class="mini" id="tm${key}"></span><span class="tcount" id="tc${key}"></span>`; b.onclick = onclick; box.appendChild(b);
    };
    for (const d in DECKS) make(d, DECKS[d].name, () => { if (S.deck === d && view === "deck") return; stopAuto(); openDeck(d) });
    make("PROG", "Progress", () => { stopAuto(); view = "progress"; paint() }, "tab-prog");
  }
  function paintTabs() {
    for (const d in DECKS) {
      const s = sumUp(IDS[d]);
      $("tab" + d).setAttribute("aria-selected", view === "deck" && d === S.deck);
      $("tm" + d).innerHTML = segs(s.n);
      $("tc" + d).textContent = `${s.mastered}/${s.total} mastered`;
    }
    const all = sumUp(ALL);
    $("tabPROG").setAttribute("aria-selected", view === "progress");
    $("tmPROG").innerHTML = segs(all.n);
    $("tcPROG").textContent = all.a ? `${all.mastery}% mastery` : "not started";
  }
  // One square per question in this round, in order. Color = mastery level, dot = answered this round,
  // outline = the question on screen. Every square is a button that jumps to that question.
  function paintMap() {
    const r = R();
    $("map").innerHTML = r.order.map((id, k) => {
      const l = lvl(id), done = !!r.log[k];
      return `<button type="button" class="sq lv-c-${l}${done ? " done" : ""}${k === r.pos ? " cur" : ""}" data-k="${k}" aria-label="Question ${k + 1}: ${LEVEL_TEXT[l]}${done ? ", answered" : ""}"${k === r.pos ? ' aria-current="step"' : ""}></button>`;
    }).join("");
  }
  function paintChrome() {
    paintHabit(); paintTabs();
    const inDeck = view === "deck";
    for (const id of ["toolbar", "barRow", "map"]) $(id).hidden = !inDeck;
    if (!inDeck) { $("deckSub").textContent = "Your strengths and weak spots, from every answer you've given on this device."; return }
    const d = S.deck, r = R(), n = r.order.length, done = doneIn(r);
    $("deckSub").textContent = d === "FOCUS" ? `Focus round: ${S.focus.label}. ${plural(pool(d).length, "question")}, weakest first. Pick a subject tab to leave.` : DECKS[d].sub;
    paintMap();
    $("roundInfo").innerHTML = n ? `<span>${r.pos < n ? `Question <b>${r.pos + 1}</b> of ${n}` : "<b>Results</b>"}</span><span><b>${done}</b> answered</span><span><b>${rightIn(r)}</b> right</span><span>Streak <b>${r.streak}</b></span>` : "";
    $("prog").style.width = n ? (done / n * 100) + "%" : "0";
    $("shuffleBtn").setAttribute("aria-checked", S.shuffle);
    $("missedBtn").setAttribute("aria-checked", S.onlyMissed);
    $("autoBtn").setAttribute("aria-checked", S.auto);
  }
  $("map").addEventListener("click", e => { const b = e.target.closest(".sq"); if (b) goTo(+b.dataset.k) });

  // ===== Card pieces
  function figure(id) {
    const im = imgOf(id); if (!im) return "";
    return `<figure class="fig"><button type="button" class="zoom" data-src="${im[0]}" data-alt="${esc(im[1])}" aria-label="Enlarge image: ${esc(im[1])}"><img src="${im[0]}" alt="${esc(im[1])}"></button><figcaption>Tap to zoom</figcaption></figure>`;
  }
  function wireZoom() { $("card").querySelectorAll(".zoom").forEach(b => b.onclick = () => openLightbox(b.dataset.src, b.dataset.alt)) }
  function metaRow(id, right) {
    return `<div class="meta"><span class="meta-l"><span class="origin">Source: ${esc(srcOf(id))}</span><span>${esc(Q[id].tag)}</span></span>${right}</div>`;
  }
  const streakDots = id => { const k = need(id), s = Math.min((S.log[id] || {}).s || 0, k); return `<span class="streakline" title="Streak ${s} of ${k}">${Array.from({ length: k }, (_, j) => `<i class="${j < s ? "on" : ""}"></i>`).join("")}</span>` };
  // Bottom navigation: Previous on the left, the forward action on the right.
  function navBar(fwdLabel, fwdId, ghostFwd) {
    const r = R();
    return `<div class="nav"><button class="btn ghost" id="prevBtn"${r.pos > 0 ? "" : " disabled"}><span>← Previous</span></button><button class="btn${ghostFwd ? " ghost" : ""}" id="${fwdId}"><span>${fwdLabel}</span></button></div>`;
  }
  const lastLabel = r => doneIn(r) === r.order.length ? "See results →" : "Finish →";

  // ===== Main paint
  function paint() {
    stopAuto();
    if (view === "progress") return paintProgress();
    if (S.deck === "FOCUS" && !S.focus) S.deck = FIRST;
    if (!S.rounds[S.deck]) newRound(S.deck);
    const r = R(); if (!r.log) r.log = []; if (!Number.isInteger(r.pos)) r.pos = 0;
    const c = $("card");
    if (!r.order.length) {
      paintChrome(); c.className = "card";
      c.innerHTML = `<h2 class="ph">Nothing here</h2><p class="sub">${S.onlyMissed ? "You haven't missed any questions in this subject. Turn off “Only questions I've missed” in Options to see everything." : "No questions here yet."}</p>`;
      return;
    }
    if (r.pos >= r.order.length) return paintResult();
    if (r.log[r.pos]) return paintReview(r.pos);
    answered = false;
    const k = r.pos, id = r.order[k], x = Q[id], s = S.stats[id];
    paintChrome();
    const opts = shuffle([{ t: x.ok, c: true }, ...x.wrong.map(t => ({ t, c: false }))]); curOpts = opts;
    const isLast = k === r.order.length - 1;
    c.className = "card enter";
    c.innerHTML = `${metaRow(id, x.val ? `<span class="val">$${x.val}</span>` : `<span>${k + 1} / ${r.order.length}</span>`)}
      <p class="q">${txt(x.q)}</p>${figure(id)}
      <div class="opts">${opts.map((o, j) => `<button class="opt" id="o${j}" data-c="${o.c}"><span class="bub">${"ABCDE"[j]}</span><span>${txt(o.t)}</span></button>`).join("")}</div>
      ${s && s[0] ? `<p class="record"><span class="lv lv-${lvl(id)}">${LEVEL_TEXT[lvl(id)]}</span>${streakDots(id)}<span>${s[1]} of ${s[0]} right so far</span></p>` : ""}
      <div id="fb">${navBar(isLast ? lastLabel(r) : "Skip →", "skipBtn", true)}</div>`;
    c.querySelectorAll(".opt").forEach((b, j) => b.onclick = () => pick(b, id, j));
    $("prevBtn").onclick = goPrev; $("skipBtn").onclick = goNext;
    wireZoom();
  }

  function pick(b, id, pickedIdx) {
    if (answered) return; answered = true;
    const x = Q[id], r = R(), good = b.dataset.c === "true", now = Date.now();
    r.log[r.pos] = { o: curOpts.map(o => o.t), p: pickedIdx, c: curOpts.findIndex(o => o.c) };
    $("card").querySelectorAll(".opt").forEach(o => { o.disabled = true; if (o.dataset.c === "true") o.classList.add("right") });
    b.classList.add("picked", good ? "pop" : "shake"); if (!good) b.classList.add("wrong");
    const before = lvl(id);
    if (good) { r.streak++; r.best = Math.max(r.best | 0, r.streak); missed.delete(id) } else { r.streak = 0; missed.add(id) }
    S.hist[id] = good ? 1 : 0;
    const s = S.stats[id] || [0, 0]; S.stats[id] = [s[0] + 1, s[1] + (good ? 1 : 0)];
    const g = S.log[id] || { s: 0, t0: 0, last: 0 };
    if (good) { if (!g.s) g.t0 = now; g.s++ } else { g.s = 0; g.t0 = 0 }
    g.last = now; S.log[id] = g;
    const dk = dayKey(); S.days[dk] = (S.days[dk] | 0) + 1;
    const after = lvl(id), k = need(id);
    let note;
    if (!good) note = before === "mastered" || before === "due" ? "Streak reset. This one leaves mastered until you rebuild it." : "Streak reset. It comes back early in your next round.";
    else if (after === "mastered") note = before === "mastered" ? "Still mastered." : `Mastered: right ${g.s} times in a row, spread over time.`;
    else if (g.s >= k) note = "Streak complete. Get it right again an hour or more from now to lock it in.";
    else note = `${k - g.s} more right in a row to master it.`;
    save(); paintChrome();
    const sq = $("map").querySelector(`[data-k="${r.pos}"]`); if (sq) sq.classList.add("just");
    const more = nextUnanswered(r, r.pos) >= 0;
    $("fb").innerHTML = `<div class="explain ${good ? "good" : "bad"}"><strong>${good ? "Correct." : "Answer: " + txt(x.ok)}</strong>${txt(x.ex || "")}</div>
      <p class="lvnote"><span class="lv lv-${after}">${LEVEL_TEXT[after]}</span>${streakDots(id)}<span>${note}</span></p>
      ${navBar(more ? "Next question →" : "See results →", "next")}`;
    $("next").onclick = goNextQuestion; $("next").focus({ preventScroll: true });
    $("prevBtn").onclick = goPrev;
    if (after === "mastered" && before !== "mastered") toast(`Mastered. ${masteredIn(pool(S.deck))} of ${pool(S.deck).length} in ${S.deck === "FOCUS" ? "this focus round" : DECKS[S.deck].name}`);
    else if (good && [5, 10, 15, 20, 30, 40, 50].includes(r.streak)) toast(`${r.streak} in a row`, "gold");
    if (good && S.auto) startAuto();
  }

  // Auto-advance after a right answer; any touch, click or key (other than going forward) pauses it.
  function startAuto() {
    const nb = $("next"); if (!nb) return;
    nb.style.setProperty("--auto", AUTO_MS + "ms"); nb.classList.add("auto");
    autoTimer = setTimeout(() => { autoTimer = null; if ($("next")) goNextQuestion() }, AUTO_MS);
  }
  function stopAuto() { if (autoTimer) { clearTimeout(autoTimer); autoTimer = null } const nb = $("next"); if (nb) nb.classList.remove("auto") }
  const pauseAuto = e => { if (!autoTimer) return; if (e.target && e.target.closest && e.target.closest("#next")) return; stopAuto() };
  document.addEventListener("pointerdown", pauseAuto, true);
  document.addEventListener("wheel", pauseAuto, { passive: true });
  document.addEventListener("touchmove", pauseAuto, { passive: true });

  // An answered question: read-only, with what you picked, the answer and the explanation.
  function paintReview(k) {
    const c = $("card"), r = R(), e = r.log[k], id = r.order[k], x = Q[id];
    answered = false; paintChrome();
    const isLast = k === r.order.length - 1;
    c.className = "card review enter";
    c.innerHTML = `${metaRow(id, `<span class="revtag">Answered · ${k + 1} / ${r.order.length}</span>`)}
      <p class="q">${txt(x.q)}</p>${figure(id)}
      <div class="opts">${e.o.map((t, j) => `<button class="opt${j === e.c ? " right" : ""}${j === e.p ? " picked" : ""}${j === e.p && j !== e.c ? " wrong" : ""}" disabled><span class="bub">${"ABCDE"[j]}</span><span>${txt(t)}</span></button>`).join("")}</div>
      <div class="explain ${e.p === e.c ? "good" : "bad"}"><strong>${e.p === e.c ? "You got this one right." : "You picked " + "ABCDE"[e.p] + ". Answer: " + txt(x.ok)}</strong>${txt(x.ex || "")}</div>
      <p class="hint">Already answered in this round, so it can't be changed. That keeps your mastery honest.</p>
      ${navBar(isLast ? lastLabel(r) : "Next →", "fwdBtn")}`;
    $("prevBtn").onclick = goPrev; $("fwdBtn").onclick = goNext; $("fwdBtn").focus({ preventScroll: true });
    wireZoom();
  }

  // Results: score ring, what changed, skipped questions, what to do next.
  function paintResult() {
    answered = false; paintChrome();
    const c = $("card"), r = R(), d = S.deck, ids = pool(d), done = doneIn(r), right = rightIn(r), p = pct(right, done);
    const skipped = r.order.length - done, firstSkipped = nextUnanswered(r, -1);
    const m = ids.filter(id => missed.has(id)).length, gained = Math.max(0, masteredIn(ids) - (r.m0 | 0));
    const next = weakest(d === "FOCUS" ? null : d);
    const C = 2 * Math.PI * 55;   // ringSVG(120, 10): radius (120 - 10) / 2
    c.className = "card result enter";
    c.innerHTML = `<div class="bigring">${ringSVG(120, 10, 0)}<b>${p}%</b></div>
      <h2>${right} of ${done} right</h2>
      <div class="gains">
        <span class="gain${gained ? " up" : ""}">${gained ? `+${plural(gained, "question")} mastered` : right ? "Streaks building: they lock in as mastered after an hour" : "No new mastered questions yet"}</span>
        ${r.best ? `<span class="gain">Best streak ${r.best}</span>` : ""}
        ${m ? `<span class="gain">${m} to review</span>` : ""}
      </div>
      ${skipped ? `<div class="suggest"><span><small>Not answered yet</small><b>${plural(skipped, "skipped question")}</b></span><button class="btn" id="goSkipped"><span>Answer them</span></button></div>` : ""}
      ${next ? `<div class="suggest"><span><small>Weakest subject right now</small><b>${esc(next.name)}</b> <small>${next.mastery}% mastery · ${next.mastered}/${next.total} mastered</small></span><button class="btn${skipped ? " ghost" : ""}" id="goNext"><span>Practice</span></button></div>` : ""}
      <div class="nav"><button class="btn ghost" id="prevBtn"><span>← Previous</span></button>${m && !S.onlyMissed ? '<button class="btn ghost" id="drill"><span>Drill the missed</span></button>' : ""}<button class="btn ghost" id="again"><span>Go again</span></button></div>`;
    requestAnimationFrame(() => { const f = c.querySelector(".bigring .fill"); if (f) f.style.strokeDashoffset = C * (1 - p / 100) });
    $("again").onclick = restart; $("prevBtn").onclick = goPrev;
    if ($("goSkipped")) $("goSkipped").onclick = () => goTo(firstSkipped);
    if ($("drill")) $("drill").onclick = () => { S.onlyMissed = true; restart() };
    if ($("goNext")) $("goNext").onclick = () => { const nr = S.rounds[next.key]; if (nr && doneIn({ log: nr.log || [] }) >= nr.order.length) delete S.rounds[next.key]; openDeck(next.key) };
  }

  // ===== Progress view
  function paintProgress() {
    paintChrome();
    const c = $("card"), all = sumUp(ALL), ts = subjects();
    c.className = "card prog enter";
    if (!all.a) {
      c.innerHTML = `<h2 class="ph">No answers yet</h2><p class="sub">Answer a few questions and this page shows your mastery by subject, your strongest and weakest areas, your week, and the questions you miss most. Everything stays on this device.</p>
        <div class="nav"><button class="btn" id="goStart"><span>Start with ${esc(DECKS[FIRST].name)}</span></button></div>`;
      $("goStart").onclick = () => openDeck(FIRST); return;
    }
    const started = ts.filter(t => t.a).sort((x, y) => x.mastery - y.mastery || x.acc - y.acc), fresh = ts.filter(t => !t.a);
    const strong = started.filter(t => t.mastery >= 50).slice(-2).reverse();
    const weak = started.filter(t => t.acc < 70).sort((x, y) => x.acc - y.acc).slice(0, 2);
    const worst = ALL.map(id => ({ id, s: S.stats[id] })).filter(o => o.s && o.s[0] > o.s[1])
      .sort((x, y) => (y.s[0] - y.s[1]) - (x.s[0] - x.s[1]) || x.s[1] / x.s[0] - y.s[1] / y.s[0]).slice(0, 8);
    const days = []; for (let k = 6; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); days.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2), n: S.days[dayKey(d)] | 0, today: k === 0 }) }
    const top = Math.max(10, ...days.map(d => d.n));
    const row = t => `<li class="trow">
        <div class="tname"><b>${esc(t.name)}</b><span>${t.a ? `${t.mastered}/${t.total} mastered · ${t.acc}% right` : `Not started · ${plural(t.total, "question")}`}</span></div>
        <div class="stack" role="img" aria-label="${t.n.mastered} mastered, ${t.n.due} due, ${t.n.shaky} getting there, ${t.n.learning} learning, ${t.n.new} new">${segs(t.n)}</div>
        <button class="chip" data-topic="${t.key}">Practice</button></li>`;
    c.innerHTML = `
      <div class="pgrid">
        <div><b>${all.mastered}/${all.total}</b>mastered</div>
        <div><b>${all.mastery}%</b>mastery</div>
        <div><b>${all.acc}%</b>accuracy</div>
        <div><b>${dayStreak()}</b>day streak</div>
      </div>
      <div class="legend">${["mastered", "due", "shaky", "learning", "new"].map(l => `<span><i class="lv-c-${l}"></i>${LEVEL_TEXT[l]} ${all.n[l]}</span>`).join("")}</div>
      ${strong.length || weak.length ? `<div class="callouts">
        ${weak.length ? `<p class="callout bad"><strong>Needs work</strong>${weak.map(t => esc(t.name) + " (" + t.acc + "% right)").join(" · ")}</p>` : ""}
        ${strong.length ? `<p class="callout good"><strong>Strongest</strong>${strong.map(t => esc(t.name) + " (" + t.mastery + "% mastery)").join(" · ")}</p>` : ""}
      </div>` : ""}
      <h3 class="ph3">By subject <span>weakest first</span></h3>
      <ul class="topics">${started.map(row).join("")}${fresh.map(row).join("")}</ul>
      <h3 class="ph3">This week <span>questions answered per day</span></h3>
      <div class="week" role="img" aria-label="${days.map(d => d.label + " " + d.n).join(", ")}">
        ${days.map(d => `<div class="day${d.today ? " today" : ""}"><em>${d.n || ""}</em><i style="height:${d.n / top * 82}px"></i><span>${d.label}</span></div>`).join("")}
      </div>
      ${worst.length ? `<h3 class="ph3">Most-missed questions</h3>
      <ol class="worst">${worst.map(o => `<li><span>${esc(plain(Q[o.id].q))}</span><em>${o.s[0] - o.s[1]} wrong of ${o.s[0]} · Source: ${esc(srcOf(o.id))}</em></li>`).join("")}</ol>
      <div class="nav"><button class="btn" id="drillWorst"><span>Drill these ${worst.length}</span></button></div>` : ""}
      <details class="how2"><summary>How mastery is measured</summary>
        <p>One right answer can be a lucky guess, so a question only counts as <b>mastered</b> when you've shown you know it reliably:</p>
        <ul>
          <li><b>Right 3 times in a row</b> with no miss in between (4 in a row for two-choice questions). Guessing your way to that streak is under a 4–6% chance.</li>
          <li><b>Spread over time:</b> the streak has to stretch across at least an hour, so it reflects memory, not the screen you just saw.</li>
          <li><b>Kept fresh:</b> a mastered question you haven't seen in 5 days becomes <i>due for review</i>.</li>
        </ul>
        <p>A miss resets the streak. Rounds show your weakest questions first. Your <b>mastery</b> gives full credit for mastered, ¾ for due and ½ for getting there.</p>
      </details>
      <p class="hint">Saved in this browser on this device only. Clearing your browser data erases it.</p>`;
    c.querySelectorAll("[data-topic]").forEach(b => b.onclick = () => { const t = ts.find(x => x.key === b.dataset.topic); startFocus(t.name, t.ids) });
    if ($("drillWorst")) $("drillWorst").onclick = () => startFocus("Most-missed questions", worst.map(o => o.id));
  }

  // ===== Lightbox
  function openLightbox(src, alt) { stopAuto(); $("lbImg").src = src; $("lbImg").alt = alt; $("lightbox").hidden = false; $("lbClose").focus() }
  function closeLightbox() { $("lightbox").hidden = true }
  $("lightbox").onclick = closeLightbox;


  // ===== Reading settings: font and text size, saved on this device and shared by every drill.
  // Research (Wallace et al., 2022) found no single font is fastest for everyone, so readers choose.
  const READ_KEY = "anthro-reading";
  const FONTS = {
    plex: { label: "IBM Plex Sans", note: "The default", stack: '"IBM Plex Sans",system-ui,-apple-system,sans-serif' },
    atkinson: { label: "Atkinson Hyperlegible", note: "Every letter easy to tell apart", stack: '"Atkinson Hyperlegible Next","Atkinson Hyperlegible",system-ui,sans-serif', href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;600;700&display=swap" },
    literata: { label: "Literata", note: "A serif made for screen reading", stack: 'Literata,Georgia,"Times New Roman",serif', href: "https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;600;700&display=swap" },
    system: { label: "Your device's font", note: "Familiar, nothing to download", stack: 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif' }
  };
  const SIZES = [{ k: .9, label: "A−", name: "Small" }, { k: 1, label: "A", name: "Default" }, { k: 1.12, label: "A+", name: "Large" }, { k: 1.25, label: "A++", name: "Extra large" }];
  let reading = { font: "plex", size: 1 };
  try { const r = JSON.parse(localStorage.getItem(READ_KEY) || "null"); if (r && FONTS[r.font]) reading.font = r.font; if (r && SIZES[r.size]) reading.size = r.size } catch (e) { }
  function applyReading() {
    const f = FONTS[reading.font];
    if (f.href && !document.querySelector(`link[data-font="${reading.font}"]`)) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = f.href; l.dataset.font = reading.font; document.head.appendChild(l);
    }
    document.documentElement.style.setProperty("--read", f.stack);
    document.documentElement.style.setProperty("--rs", SIZES[reading.size].k);
    document.querySelectorAll("[data-fontpick]").forEach(b => b.setAttribute("aria-checked", b.dataset.fontpick === reading.font));
    document.querySelectorAll("[data-sizepick]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.sizepick === reading.size));
    try { localStorage.setItem(READ_KEY, JSON.stringify(reading)) } catch (e) { }
  }
  function buildReadingMenu() {
    const g = document.createElement("div"); g.className = "mgroup";
    g.innerHTML = `<span class="mlabel" id="fontLbl">Reading font</span>
      ${Object.entries(FONTS).map(([k, f]) => `<button class="mi" role="menuitemradio" data-fontpick="${k}"><span class="dot"></span><span class="fname"><span style="font-family:${f.stack.replace(/"/g, "&quot;")}">${f.label}</span><small>${f.note}</small></span></button>`).join("")}
      <span class="mlabel" id="sizeLbl">Text size</span>
      <div class="seg" role="group" aria-labelledby="sizeLbl">${SIZES.map((z, i) => `<button type="button" data-sizepick="${i}" aria-label="${z.name} text" style="font-size:${13 * z.k}px">${z.label}</button>`).join("")}</div>`;
    $("menu").insertBefore(g, $("restartBtn"));
    g.querySelectorAll("[data-fontpick]").forEach(b => b.onclick = e => { e.stopPropagation(); reading.font = b.dataset.fontpick; applyReading() });
    g.querySelectorAll("[data-sizepick]").forEach(b => b.onclick = e => { e.stopPropagation(); reading.size = +b.dataset.sizepick; applyReading() });
  }

  // ===== Options menu
  function setMenu(open) { menuOpen = open; $("menu").hidden = !open; $("optBtn").setAttribute("aria-expanded", open) }
  $("optBtn").onclick = e => { e.stopPropagation(); setMenu(!menuOpen) };
  document.addEventListener("click", e => { if (menuOpen && !e.target.closest(".menuwrap")) setMenu(false) });
  $("shuffleBtn").onclick = () => { S.shuffle = !S.shuffle; setMenu(false); restart() };
  $("missedBtn").onclick = () => { S.onlyMissed = !S.onlyMissed; setMenu(false); restart() };
  $("autoBtn").onclick = () => { S.auto = !S.auto; save(); $("autoBtn").setAttribute("aria-checked", S.auto); if (!S.auto) stopAuto() };
  $("restartBtn").onclick = () => { setMenu(false); restart() };
  let armed = null;
  $("resetBtn").onclick = () => {
    const b = $("resetBtn");
    if (!armed) { b.textContent = "Tap again to erase everything"; armed = setTimeout(() => { armed = null; b.textContent = "Clear all progress" }, 3000); return }
    clearTimeout(armed); armed = null; b.textContent = "Clear all progress"; setMenu(false);
    S = fresh(); missed = new Set(); restart();
  };

  // ===== Keyboard: 1–5 answer · ← previous · → next · Enter = the main button
  document.addEventListener("keydown", e => {
    if (!$("lightbox").hidden) { if (e.key === "Escape") closeLightbox(); return }
    if (e.key === "Escape" && menuOpen) { setMenu(false); $("optBtn").focus(); return }
    if (view !== "deck" || menuOpen) return;
    const r = R(); if (!r) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); return }
    if (e.key === "ArrowRight") { e.preventDefault(); if (answered) goNextQuestion(); else goNext(); return }
    if (e.key === "Enter") { const b = $("next") || $("fwdBtn"); if (b) { e.preventDefault(); b.click() } return }
    if (autoTimer) stopAuto();
    if (!answered && !r.log[r.pos] && /^[1-5]$/.test(e.key)) { const o = $("o" + (e.key - 1)); if (o) o.click() }
  });

  // ===== Start
  buildReadingMenu(); applyReading();
  buildTabs();
  apply(load());
  function route() {
    if (location.hash === "#progress") view = "progress";
    else if (location.hash === "#continue") {   // from the landing page: open the subject that most needs work
      const w = weakest(); if (w) { const r = S.rounds[w.key]; if (r && doneIn({ log: r.log || [] }) >= r.order.length) delete S.rounds[w.key]; view = "deck"; S.deck = w.key }
    }
  }
  route();
  window.addEventListener("hashchange", () => { route(); paint() });
  paint();
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist() } catch (e) { }
})();
