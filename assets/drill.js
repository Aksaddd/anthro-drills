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

  // ===== Daily habit
  const AUTO_MS = 1800;
  const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const today = () => S.days[dayKey()] | 0;
  function dayStreak() {
    const d = new Date(); let n = 0;
    if (!S.days[dayKey(d)]) d.setDate(d.getDate() - 1);          // today not started yet: count up to yesterday
    while (S.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1) }
    return n;
  }

  // ===== State
  const L = B.storageKey;
  let S = fresh(), missed = new Set(), answered = false, view = "deck", rev = null, curOpts = null, autoTimer = null, menuOpen = false;
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
      n.rounds[d] = { order, i: Math.min(r.i | 0, order.length), right: r.right | 0, done: r.done | 0, streak: r.streak | 0, best: r.best | 0, m0: r.m0 | 0, log };
    }
    return true;
  }
  function load() { try { return JSON.parse(localStorage.getItem(L) || "null") } catch (e) { return null } }
  function save() { S.updatedAt = Date.now(); S.missed = [...missed]; try { localStorage.setItem(L, JSON.stringify(S)) } catch (e) { } }

  // ===== Rounds
  const R = () => S.rounds[S.deck];
  const masteredIn = ids => ids.filter(id => lvl(id) === "mastered").length;
  function newRound(d) {
    let ids = pool(d).slice(); if (S.onlyMissed) ids = ids.filter(id => missed.has(id));
    S.rounds[d] = { order: S.shuffle ? byNeed(ids) : ids, i: 0, right: 0, done: 0, streak: 0, best: 0, m0: masteredIn(pool(d)), log: [] };
  }
  function restart() { newRound(S.deck); answered = false; rev = null; view = "deck"; paint(); save() }
  function openDeck(d) { view = "deck"; S.deck = d; answered = false; rev = null; if (!S.rounds[d]) newRound(d); paint(); save() }
  function startFocus(label, ids) {
    S.focus = { label, ids }; S.deck = "FOCUS"; S.onlyMissed = false; rev = null;
    S.rounds.FOCUS = { order: byNeed(ids), i: 0, right: 0, done: 0, streak: 0, best: 0, m0: masteredIn(ids), log: [] };
    answered = false; view = "deck"; paint(); save(); window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
  }
  function prevIndex() {
    const r = R(); if (!r || !r.log) return -1;
    const k = rev !== null ? rev - 1 : answered ? r.i - 2 : r.i - 1;
    return k >= 0 && r.log[k] ? k : -1;
  }
  function goPrev() { const k = prevIndex(); if (k < 0) return; stopAuto(); rev = k; answered = false; paint() }
  function goNextFromReview() { const r = R(); rev = rev + 1 <= r.i - 1 && r.log[rev + 1] ? rev + 1 : null; paint() }

  // ===== Summaries
  function sumUp(ids) {
    let a = 0, c = 0, seen = 0, w = 0; const n = { new: 0, learning: 0, shaky: 0, due: 0, mastered: 0 };
    for (const id of ids) { const s = S.stats[id]; if (s && s[0]) { a += s[0]; c += s[1]; seen++ } const l = lvl(id); n[l]++; w += WEIGHT[l] }
    return { a, c, seen, n, mastered: n.mastered, total: ids.length, acc: pct(c, a), mastery: Math.round(w / Math.max(1, ids.length) * 100) };
  }
  const subjects = () => Object.keys(DECKS).filter(k => k !== "ALL").map(k => ({ key: k, name: DECKS[k].full, short: DECKS[k].name, ids: IDS[k], ...sumUp(IDS[k]) }));
  // The subject that most needs work: lowest mastery, then most "learning" questions, then course order.
  const weakest = (except) => subjects().filter(t => t.key !== except).sort((x, y) => x.mastery - y.mastery || y.n.learning - x.n.learning)[0];
  const segs = n => ["mastered", "due", "shaky", "learning"].map(l => n[l] ? `<i class="lv-c-${l}" style="width:${n[l] / Math.max(1, n.mastered + n.due + n.shaky + n.learning + n.new) * 100}%"></i>` : "").join("");

  // ===== Feedback: toasts
  function toast(msg, tone = "") {
    const t = document.createElement("div"); t.className = "toast " + tone; t.innerHTML = `<i></i>${esc(msg)}`;
    $("toasts").appendChild(t); setTimeout(() => t.remove(), 2700);
  }

  // ===== Chrome: habit ring, tabs, subject map, toolbar
  function ringSVG(size, stroke, frac, cls = "") {
    const r = (size - stroke) / 2, C = 2 * Math.PI * r;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/><circle class="fill ${cls}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.min(1, frac))}"/></svg>`;
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
    make("PROG", "Progress", () => { stopAuto(); view = "progress"; rev = null; paint() }, "tab-prog");
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
  function paintMap(curId) {
    const ids = pool(S.deck), n = sumUp(ids).n;
    $("map").innerHTML = ids.map(id => `<i class="lv-c-${lvl(id)}${id === curId ? " cur" : ""}" data-id="${id}"></i>`).join("");
    $("map").setAttribute("aria-label", `Subject map: ${n.mastered} mastered, ${n.due} due, ${n.shaky} getting there, ${n.learning} learning, ${n.new} new`);
  }
  function paintChrome(curId) {
    paintHabit(); paintTabs();
    const inDeck = view === "deck";
    for (const id of ["toolbar", "barRow", "map"]) $(id).hidden = !inDeck;
    if (!inDeck) { $("deckSub").textContent = "Your strengths and weak spots, from every answer you've given on this device."; return }
    const d = S.deck, r = R(), ids = pool(d);
    $("deckSub").textContent = d === "FOCUS" ? `Focus round: ${S.focus.label}. ${plural(ids.length, "question")}, weakest first. Pick a subject tab to leave.` : DECKS[d].sub;
    paintMap(curId);
    const pos = Math.min(r.i + (answered || r.i >= r.order.length ? 0 : 1), r.order.length);
    $("roundInfo").innerHTML = r.order.length ? `<span>Question <b>${pos}</b> of ${r.order.length}</span><span><b>${r.right}</b> right</span><span>Streak <b>${r.streak}</b></span>` : "";
    $("prog").style.width = r.order.length ? (r.i / r.order.length * 100) + "%" : "0";
    $("shuffleBtn").setAttribute("aria-checked", S.shuffle);
    $("missedBtn").setAttribute("aria-checked", S.onlyMissed);
    $("autoBtn").setAttribute("aria-checked", S.auto);
  }

  // ===== Question card
  function figure(id) {
    const im = imgOf(id); if (!im) return "";
    return `<figure class="fig"><button type="button" class="zoom" data-src="${im[0]}" data-alt="${esc(im[1])}" aria-label="Enlarge image: ${esc(im[1])}"><img src="${im[0]}" alt="${esc(im[1])}"></button><figcaption>Tap to zoom</figcaption></figure>`;
  }
  function wireZoom() { $("card").querySelectorAll(".zoom").forEach(b => b.onclick = () => openLightbox(b.dataset.src, b.dataset.alt)) }
  function metaRow(id, right) {
    return `<div class="meta"><span class="meta-l"><span class="origin">Source: ${esc(srcOf(id))}</span><span>${esc(Q[id].tag)}</span></span>${right}</div>`;
  }
  const streakDots = id => { const k = need(id), s = Math.min((S.log[id] || {}).s || 0, k); return `<span class="streakline" title="Streak ${s} of ${k}">${Array.from({ length: k }, (_, j) => `<i class="${j < s ? "on" : ""}"></i>`).join("")}</span>` };

  function paint() {
    stopAuto();
    if (view === "progress") return paintProgress();
    if (S.deck === "FOCUS" && !S.focus) S.deck = FIRST;
    if (!S.rounds[S.deck]) newRound(S.deck);
    const r = R(); if (!r.log) r.log = [];
    if (rev !== null) return paintReview(rev);
    const c = $("card");
    if (!r.order.length) {
      paintChrome(); c.className = "card";
      c.innerHTML = `<h2 class="ph">Nothing here</h2><p class="sub">${S.onlyMissed ? "You haven't missed any questions in this subject. Turn off “Only questions I've missed” in Options to see everything." : "No questions here yet."}</p>`;
      return;
    }
    if (r.i >= r.order.length) return paintResult();
    answered = false;
    const id = r.order[r.i], x = Q[id], s = S.stats[id];
    paintChrome(id);
    const opts = shuffle([{ t: x.ok, c: true }, ...x.wrong.map(t => ({ t, c: false }))]); curOpts = opts;
    c.className = "card enter";
    c.innerHTML = `${metaRow(id, x.val ? `<span class="val">$${x.val}</span>` : `<span>${r.i + 1} / ${r.order.length}</span>`)}
      <p class="q">${txt(x.q)}</p>${figure(id)}
      <div class="opts">${opts.map((o, k) => `<button class="opt" id="o${k}" data-c="${o.c}"><span class="bub">${"ABCDE"[k]}</span><span>${txt(o.t)}</span></button>`).join("")}</div>
      ${s && s[0] ? `<p class="record"><span class="lv lv-${lvl(id)}">${LEVEL_TEXT[lvl(id)]}</span>${streakDots(id)}<span>${s[1]} of ${s[0]} right so far</span></p>` : ""}
      <div id="fb">${prevIndex() >= 0 ? `<div class="nav"><button class="btn ghost" id="prevBtn"><span>← Previous</span></button></div>` : ""}</div>`;
    c.querySelectorAll(".opt").forEach((b, k) => b.onclick = () => pick(b, id, k));
    if ($("prevBtn")) $("prevBtn").onclick = goPrev;
    wireZoom();
  }

  function pick(b, id, pickedIdx) {
    if (answered) return; answered = true;
    const x = Q[id], r = R(), good = b.dataset.c === "true", now = Date.now();
    r.log[r.i] = { o: curOpts.map(o => o.t), p: pickedIdx, c: curOpts.findIndex(o => o.c) };
    $("card").querySelectorAll(".opt").forEach(o => { o.disabled = true; if (o.dataset.c === "true") o.classList.add("right") });
    b.classList.add("picked", good ? "pop" : "shake"); if (!good) b.classList.add("wrong");
    const before = lvl(id);
    r.done++; if (good) { r.right++; r.streak++; r.best = Math.max(r.best | 0, r.streak); missed.delete(id) } else { r.streak = 0; missed.add(id) }
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
    r.i++; save();
    paintChrome(id);
    const sq = $("map").querySelector(`[data-id="${id}"]`); if (sq) sq.classList.add("just");
    $("fb").innerHTML = `<div class="explain ${good ? "good" : "bad"}"><strong>${good ? "Correct." : "Answer: " + txt(x.ok)}</strong>${txt(x.ex || "")}</div>
      <p class="lvnote"><span class="lv lv-${after}">${LEVEL_TEXT[after]}</span>${streakDots(id)}<span>${note}</span></p>
      <div class="nav">${prevIndex() >= 0 ? '<button class="btn ghost" id="prevBtn"><span>← Previous</span></button>' : "<span></span>"}<button class="btn" id="next"><span>${r.i >= r.order.length ? "See results" : "Next"}</span></button></div>`;
    $("next").onclick = paint; $("next").focus({ preventScroll: true });
    if ($("prevBtn")) $("prevBtn").onclick = goPrev;
    // celebrate the moments that matter
    if (after === "mastered" && before !== "mastered") toast(`Mastered. ${masteredIn(pool(S.deck))} of ${pool(S.deck).length} in ${S.deck === "FOCUS" ? "this focus round" : DECKS[S.deck].name}`);
    else if (good && [5, 10, 15, 20, 30, 40, 50].includes(r.streak)) toast(`${r.streak} in a row`, "gold");
    if (good && S.auto) startAuto();
  }

  // Auto-advance after a right answer; any touch, click or key (other than going forward) pauses it.
  function startAuto() {
    const nb = $("next"); if (!nb) return;
    nb.style.setProperty("--auto", AUTO_MS + "ms"); nb.classList.add("auto");
    autoTimer = setTimeout(() => { autoTimer = null; if ($("next")) paint() }, AUTO_MS);
  }
  function stopAuto() { if (autoTimer) { clearTimeout(autoTimer); autoTimer = null } const nb = $("next"); if (nb) nb.classList.remove("auto") }
  const pauseAuto = e => { if (!autoTimer) return; if (e.target && e.target.closest && e.target.closest("#next")) return; stopAuto() };
  document.addEventListener("pointerdown", pauseAuto, true);
  document.addEventListener("wheel", pauseAuto, { passive: true });
  document.addEventListener("touchmove", pauseAuto, { passive: true });

  // An earlier question in this round, read-only.
  function paintReview(k) {
    const c = $("card"), r = R(), e = r.log[k], id = r.order[k], x = Q[id];
    paintChrome(id);
    const fwd = k + 1 <= r.i - 1 && r.log[k + 1];
    const label = fwd ? "Next →" : r.i >= r.order.length ? "Back to results →" : `Back to question ${r.i + 1} →`;
    c.className = "card review enter";
    c.innerHTML = `${metaRow(id, `<span class="revtag">Reviewing ${k + 1} / ${r.order.length}</span>`)}
      <p class="q">${txt(x.q)}</p>${figure(id)}
      <div class="opts">${e.o.map((t, j) => `<button class="opt${j === e.c ? " right" : ""}${j === e.p ? " picked" : ""}${j === e.p && j !== e.c ? " wrong" : ""}" disabled><span class="bub">${"ABCDE"[j]}</span><span>${txt(t)}</span></button>`).join("")}</div>
      <div class="explain ${e.p === e.c ? "good" : "bad"}"><strong>${e.p === e.c ? "You got this one right." : "You picked " + "ABCDE"[e.p] + ". Answer: " + txt(x.ok)}</strong>${txt(x.ex || "")}</div>
      <p class="hint">Review only. Answers can't be changed, so your mastery stays honest.</p>
      <div class="nav">${prevIndex() >= 0 ? '<button class="btn ghost" id="prevBtn"><span>← Previous</span></button>' : "<span></span>"}<button class="btn" id="fwdBtn"><span>${label}</span></button></div>`;
    if ($("prevBtn")) $("prevBtn").onclick = goPrev;
    $("fwdBtn").onclick = goNextFromReview; $("fwdBtn").focus({ preventScroll: true });
    wireZoom();
  }

  // End of round: score ring, what changed, what to do next.
  function paintResult() {
    paintChrome();
    const c = $("card"), r = R(), d = S.deck, ids = pool(d), p = pct(r.right, r.done);
    const m = ids.filter(id => missed.has(id)).length, gained = Math.max(0, masteredIn(ids) - (r.m0 | 0));
    const next = weakest(d === "FOCUS" ? null : d);
    const C = 2 * Math.PI * 55;   // matches ringSVG(120, 10): radius (120 - 10) / 2
    c.className = "card result enter";
    c.innerHTML = `<div class="bigring">${ringSVG(120, 10, 0)}<b>${p}%</b></div>
      <h2>${r.right} of ${r.done} right</h2>
      <div class="gains">
        <span class="gain${gained ? " up" : ""}">${gained ? `+${plural(gained, "question")} mastered` : r.right ? "Streaks building: they lock in as mastered after an hour" : "No new mastered questions yet"}</span>
        ${r.best ? `<span class="gain">Best streak ${r.best}</span>` : ""}
        ${m ? `<span class="gain">${m} to review</span>` : ""}
      </div>
      ${next ? `<div class="suggest"><span><small>Weakest subject right now</small><b>${esc(next.name)}</b> <small>${next.mastery}% mastery · ${next.mastered}/${next.total} mastered</small></span><button class="btn" id="goNext"><span>Practice</span></button></div>` : ""}
      <div class="nav">${prevIndex() >= 0 ? '<button class="btn ghost" id="prevBtn"><span>← Previous</span></button>' : ""}${m && !S.onlyMissed ? '<button class="btn ghost" id="drill"><span>Drill the missed</span></button>' : ""}<button class="btn ghost" id="again"><span>Go again</span></button></div>`;
    requestAnimationFrame(() => { const f = c.querySelector(".bigring .fill"); if (f) f.style.strokeDashoffset = C * (1 - p / 100) });
    $("again").onclick = restart;
    if ($("drill")) $("drill").onclick = () => { S.onlyMissed = true; restart() };
    if ($("prevBtn")) $("prevBtn").onclick = goPrev;
    if ($("goNext")) $("goNext").onclick = () => { if (S.rounds[next.key] && S.rounds[next.key].i >= S.rounds[next.key].order.length) delete S.rounds[next.key]; openDeck(next.key) };
    $("prog").style.width = "100%";
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
    // the last 7 days
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

  // ===== Keyboard
  document.addEventListener("keydown", e => {
    if (!$("lightbox").hidden) { if (e.key === "Escape") closeLightbox(); return }
    if (e.key === "Escape" && menuOpen) { setMenu(false); $("optBtn").focus(); return }
    if (view !== "deck" || menuOpen) return;
    if (e.key === "ArrowLeft") { if (prevIndex() >= 0) { e.preventDefault(); goPrev() } return }
    if (rev !== null) { if ((e.key === "ArrowRight" || e.key === "Enter") && $("fwdBtn")) { e.preventDefault(); $("fwdBtn").click() } return }
    if (answered && (e.key === "Enter" || e.key === "ArrowRight") && $("next")) { e.preventDefault(); $("next").click(); return }
    if (autoTimer) stopAuto();
    if (!answered && /^[1-5]$/.test(e.key)) { const o = $("o" + (e.key - 1)); if (o) o.click() }
  });

  // ===== Start
  buildTabs();
  apply(load());
  function route() {
    if (location.hash === "#progress") { view = "progress"; rev = null }
    else if (location.hash === "#continue") {   // from the landing page: jump into the subject that most needs work
      const w = weakest(); if (w) { const r = S.rounds[w.key]; if (r && r.i >= r.order.length) delete S.rounds[w.key]; view = "deck"; S.deck = w.key; rev = null }
    }
  }
  route();
  window.addEventListener("hashchange", () => { route(); paint() });
  paint();
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist() } catch (e) { }
})();
