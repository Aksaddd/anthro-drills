// Shared drill engine for every exam.
// Reads window.BANK from the exam's questions.js:
//   { title, storageKey, decks, ids: {deck:[id]}, q: {id:{d,tag,q,ok,wrong,ex,img,val,topic}}, img?, textOnly? }
// All progress is stored in this browser's localStorage under BANK.storageKey. Nothing leaves the device.
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

  // Tabs are subjects (topics), not sources. "Mixed" holds everything.
  const slug = s => "t-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const DECKS = {}, IDS = {};
  const tlist = (B.topics || []).slice();
  for (const id of ALL) { const t = topicOf(id); if (!tlist.some(x => x.name === t)) tlist.push({ name: t }) }
  for (const t of tlist) {
    const ids = ALL.filter(id => topicOf(id) === t.name); if (!ids.length) continue;
    const k = slug(t.name); DECKS[k] = { name: t.short || t.name, sub: t.sub || t.name }; IDS[k] = ids;
  }
  DECKS.ALL = { name: "Mixed", sub: "Every question from every subject, shuffled together. Good for a final run-through before the exam." }; IDS.ALL = ALL;
  const FIRST = Object.keys(DECKS)[0];
  const shuffle = a => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.random() * (k + 1) | 0; [a[k], a[j]] = [a[j], a[k]] } return a };
  const pct = (c, a) => a ? Math.round(c / a * 100) : 0;

  // ===== State
  const L = B.storageKey;
  let S = fresh(), missed = new Set(), answered = false, view = "deck";
  let rev = null, curOpts = null;   // rev = index of an earlier question being reviewed (read-only)
  function fresh() { return { v: 2, updatedAt: 0, deck: FIRST, shuffle: true, onlyMissed: false, missed: [], hist: {}, stats: {}, log: {}, rounds: {}, focus: null } }
  function pool(d) { return d === "FOCUS" ? (S.focus ? S.focus.ids : []) : IDS[d] }

  // ===== Mastery model
  // A question counts as MASTERED only when the student has shown they know it reliably:
  //   1. Streak: right several times in a row, with no miss in between. The streak needed depends on how easy it
  //      is to guess. With 3+ choices you need 3 in a row (a lucky guess streak is under 4% likely); with 2 choices
  //      you need 4 (about 6%). Any miss resets the streak to zero.
  //   2. Spacing: the streak has to stretch across at least an hour, so it's knowledge, not short-term memory of the
  //      screen you just saw. Three right answers in one sitting leaves the question "almost" until it's confirmed later.
  //   3. Fading: a mastered question not seen for 5 days becomes "due for review" until answered right again.
  const SPACING = 60 * 60 * 1000, FADE = 5 * 24 * 60 * 60 * 1000;
  const need = id => Q[id].wrong.length + 1 <= 2 ? 4 : 3;
  const LEVELS = ["learning", "due", "shaky", "new", "mastered"];   // also the review order: weakest first
  const LEVEL_TEXT = { new: "New", learning: "Learning", shaky: "Getting there", due: "Due for review", mastered: "Mastered" };
  function lvl(id) {
    const st = S.stats[id], g = S.log[id];
    if (!st || !st[0]) return "new";
    if (!g || !g.s) return "learning";
    if (g.s >= need(id) && g.last - g.t0 >= SPACING) return Date.now() - g.last > FADE ? "due" : "mastered";
    return "shaky";
  }
  const WEIGHT = { new: 0, learning: 0, shaky: .5, due: .75, mastered: 1 };   // for a topic's mastery score
  // Weakest questions first, shuffled within each group, so practice goes where it's needed.
  const byNeed = ids => { const g = {}; for (const id of shuffle(ids)) (g[lvl(id)] = g[lvl(id)] || []).push(id); return LEVELS.flatMap(l => g[l] || []) };

  function apply(s) {
    if (!s || s.v !== 2) return false;
    const n = fresh();
    n.updatedAt = s.updatedAt || 0; n.shuffle = s.shuffle !== false; n.onlyMissed = !!s.onlyMissed;
    n.missed = (s.missed || []).filter(id => Q[id]);
    for (const k in (s.hist || {})) if (Q[k]) n.hist[k] = s.hist[k] ? 1 : 0;
    for (const k in (s.stats || {})) if (Q[k] && Array.isArray(s.stats[k])) n.stats[k] = [s.stats[k][0] | 0, s.stats[k][1] | 0];
    for (const k in n.hist) if (!n.stats[k]) n.stats[k] = [1, n.hist[k]];   // older saves only kept the last answer
    for (const k in (s.log || {})) { const g = s.log[k]; if (Q[k] && g) n.log[k] = { s: g.s | 0, t0: +g.t0 || 0, last: +g.last || 0 } }
    for (const k in n.hist) if (!n.log[k]) n.log[k] = { s: n.hist[k], t0: 0, last: 0 };   // before the mastery model: one right answer = streak 1
    if (s.focus && Array.isArray(s.focus.ids)) { const ids = s.focus.ids.filter(id => Q[id]); if (ids.length) n.focus = { label: String(s.focus.label || "Focus"), ids } }
    n.deck = DECKS[s.deck] || (s.deck === "FOCUS" && n.focus) ? s.deck : FIRST;
    S = n; missed = new Set(n.missed);
    for (const d of [...Object.keys(DECKS), "FOCUS"]) {
      const r = (s.rounds || {})[d]; if (!r || !Array.isArray(r.order)) continue;
      const ok = new Set(pool(d)); const order = r.order.filter(id => ok.has(id));
      const log = order.length === r.order.length && Array.isArray(r.log) ? r.log.slice(0, order.length) : [];
      n.rounds[d] = { order, i: Math.min(r.i | 0, order.length), right: r.right | 0, done: r.done | 0, streak: r.streak | 0, money: r.money | 0, log };
    }
    return true;
  }
  function load() { try { return JSON.parse(localStorage.getItem(L) || "null") } catch (e) { return null } }
  function save() { S.updatedAt = Date.now(); S.missed = [...missed]; try { localStorage.setItem(L, JSON.stringify(S)) } catch (e) { } }

  // ===== Rounds
  const R = () => S.rounds[S.deck];
  function newRound(d) {
    let ids = pool(d).slice(); if (S.onlyMissed) ids = ids.filter(id => missed.has(id));
    S.rounds[d] = { order: S.shuffle ? byNeed(ids) : ids, i: 0, right: 0, done: 0, streak: 0, money: 0 };
  }
  function restart() { newRound(S.deck); answered = false; rev = null; view = "deck"; paint(); save() }
  // Which earlier question "Previous" should open, or -1 if there isn't one.
  function prevIndex() {
    const r = R(); if (!r || !r.log) return -1;
    const k = rev !== null ? rev - 1 : answered ? r.i - 2 : r.i - 1;
    return k >= 0 && r.log[k] ? k : -1;
  }
  function goPrev() { const k = prevIndex(); if (k < 0) return; rev = k; answered = false; paint() }
  function goNextFromReview() { const r = R(); rev = rev + 1 <= r.i - 1 && r.log[rev + 1] ? rev + 1 : null; paint() }
  function startFocus(label, ids) {
    S.focus = { label, ids }; S.deck = "FOCUS"; S.onlyMissed = false; rev = null;
    S.rounds.FOCUS = { order: byNeed(ids), i: 0, right: 0, done: 0, streak: 0, money: 0 };
    answered = false; view = "deck"; paint(); save(); window.scrollTo({ top: 0 });
  }

  // ===== Numbers for the Progress tab
  function sumUp(ids) {
    let a = 0, c = 0, seen = 0, w = 0;
    const n = { new: 0, learning: 0, shaky: 0, due: 0, mastered: 0 };
    for (const id of ids) { const s = S.stats[id]; if (s && s[0]) { a += s[0]; c += s[1]; seen++ } const l = lvl(id); n[l]++; w += WEIGHT[l] }
    return { a, c, seen, mastered: n.mastered, n, total: ids.length, acc: pct(c, a), mastery: Math.round(w / Math.max(1, ids.length) * 100) };
  }
  function topics() {
    const m = new Map();
    for (const id of ALL) { const t = topicOf(id); if (!m.has(t)) m.set(t, []); m.get(t).push(id) }
    return [...m].map(([name, ids]) => ({ name, ids, ...sumUp(ids) }));
  }
  const level = acc => acc >= 80 ? "good" : acc >= 60 ? "ok" : "bad";

  // ===== Rendering
  function buildTabs() {
    const box = $("tabs"); box.innerHTML = "";
    const make = (key, label, onclick) => {
      const b = document.createElement("button"); b.className = "tab"; b.setAttribute("role", "tab"); b.id = "tab" + key;
      b.innerHTML = `<b>${label}</b><span id="tc${key}"></span>`; b.onclick = onclick; box.appendChild(b);
    };
    for (const d in DECKS) make(d, DECKS[d].name, () => {
      if (S.deck === d && view === "deck") return;
      view = "deck"; S.deck = d; answered = false; rev = null; if (!S.rounds[d]) newRound(d); paint(); save();
    });
    make("PROG", "Progress", () => { view = "progress"; rev = null; paint() });
  }
  const mastered = d => pool(d).filter(id => lvl(id) === "mastered").length;
  function stats() {
    for (const d in DECKS) { $("tab" + d).setAttribute("aria-selected", view === "deck" && d === S.deck); $("tc" + d).textContent = mastered(d) + "/" + IDS[d].length }
    const all = sumUp(ALL);
    $("tabPROG").setAttribute("aria-selected", view === "progress"); $("tcPROG").textContent = all.a ? all.mastery + "% mastery" : "not started";
    const inDeck = view === "deck";
    for (const id of ["statsRow", "controls", "barRow"]) $(id).hidden = !inDeck;
    if (!inDeck) { $("deckSub").textContent = "Your strengths and weak spots, from every answer you've given on this device."; return }
    const d = S.deck, r = R(), ids = pool(d);
    $("deckSub").textContent = d === "FOCUS" ? `Focus round: ${S.focus.label} (${ids.length} question${ids.length > 1 ? "s" : ""}). Pick a tab to go back to a full set.` : DECKS[d].sub;
    $("sMaster").textContent = mastered(d) + "/" + ids.length;
    $("sScore").textContent = r.right + "/" + r.done; $("sScoreLbl").textContent = "this round";
    $("sStreak").textContent = r.streak;
    $("sMiss").textContent = ids.filter(id => missed.has(id)).length;
    $("shuffleBtn").setAttribute("aria-pressed", S.shuffle); $("shuffleBtn").textContent = S.shuffle ? "Shuffled" : "In order";
    $("missedBtn").setAttribute("aria-pressed", S.onlyMissed);
    $("prog").style.width = r.order.length ? (r.i / r.order.length * 100) + "%" : "0";
  }

  function paint() {
    if (view === "progress") return paintProgress();
    if (S.deck === "FOCUS" && !S.focus) S.deck = FIRST;
    if (!S.rounds[S.deck]) newRound(S.deck);
    stats(); const c = $("card"), r = R(), d = S.deck, ids = pool(d);
    if (!r.log) r.log = [];
    if (rev !== null) return paintReview(rev);
    if (!r.order.length) {
      c.className = "card done";
      c.innerHTML = `<h2>Nothing to review</h2><p class="sub">${S.onlyMissed ? "No missed questions in this set. Turn off “Only my missed” to see everything." : "No questions here yet."}</p>`; return
    }
    if (r.i >= r.order.length) {
      const p = pct(r.right, r.done), m = ids.filter(id => missed.has(id)).length;
      c.className = "card done";
      c.innerHTML = `<h2>${r.right} / ${r.done} · ${p}%</h2>
      <p class="sub">${m ? m + " question" + (m > 1 ? "s" : "") + " here saved for review." : "Nothing left to review here."}</p>
      <div class="nav" style="justify-content:center">${prevIndex() >= 0 ? '<button class="btn ghost" id="prevBtn">← Previous</button>' : ""}<button class="btn" id="again">Go again</button>${m && !S.onlyMissed ? '<button class="btn ghost" id="drill">Drill missed</button>' : ""}<button class="btn ghost" id="seeProg">See progress</button></div>`;
      $("again").onclick = restart;
      if ($("drill")) $("drill").onclick = () => { S.onlyMissed = true; restart() };
      $("seeProg").onclick = () => { view = "progress"; paint() };
      if ($("prevBtn")) $("prevBtn").onclick = goPrev;
      $("prog").style.width = "100%"; return;
    }
    answered = false;
    const id = r.order[r.i], x = Q[id], im = imgOf(id), s = S.stats[id];
    const opts = shuffle([{ t: x.ok, c: true }, ...x.wrong.map(t => ({ t, c: false }))]);
    curOpts = opts;
    const right = x.val ? `<span class="val">$${x.val}</span>` : `<span>${r.i + 1} of ${r.order.length}</span>`;
    c.className = "card";
    c.innerHTML = `<div class="meta"><span class="meta-l"><span class="origin" title="Where this question comes from">${esc(srcOf(id))}</span><span class="tagt">${esc(x.tag)}</span></span>${right}</div>
    <p class="q">${txt(x.q)}</p>${im ? `<figure class="fig"><img src="${im[0]}" alt="${esc(im[1])}"></figure>` : ""}
    <div class="opts">${opts.map((o, k) => `<button class="opt" id="o${k}" data-c="${o.c}"><span class="bub">${"ABCDE"[k]}</span><span>${txt(o.t)}</span></button>`).join("")}</div>
    ${s && s[0] ? `<p class="hint"><span class="lv lv-${lvl(id)}">${LEVEL_TEXT[lvl(id)]}</span> Your record: ${s[1]} of ${s[0]} right${S.log[id] && S.log[id].s ? ` · streak ${S.log[id].s}` : ""}.</p>` : ""}
    <div id="fb">${prevIndex() >= 0 ? `<div class="nav"><button class="btn ghost" id="prevBtn">← Previous</button></div>` : ""}</div>`;
    c.querySelectorAll(".opt").forEach((b, k) => b.onclick = () => pick(b, id, k));
    if ($("prevBtn")) $("prevBtn").onclick = goPrev;
  }

  // An earlier question in this round, read-only: what you picked, the answer, the explanation.
  function paintReview(k) {
    const c = $("card"), r = R(), e = r.log[k], id = r.order[k], x = Q[id], im = imgOf(id);
    const after = k + 1 <= r.i - 1 && r.log[k + 1];
    const nextLabel = after ? "Next →" : r.i >= r.order.length ? "Back to results →" : `Back to question ${r.i + 1} →`;
    c.className = "card review";
    c.innerHTML = `<div class="meta"><span class="meta-l"><span class="origin">${esc(srcOf(id))}</span><span class="tagt">${esc(x.tag)}</span></span><span class="revtag">Reviewing ${k + 1} of ${r.order.length}</span></div>
    <p class="q">${txt(x.q)}</p>${im ? `<figure class="fig"><img src="${im[0]}" alt="${esc(im[1])}"></figure>` : ""}
    <div class="opts">${e.o.map((t, j) => `<button class="opt${j === e.c ? " right" : ""}${j === e.p ? " picked" : ""}${j === e.p && j !== e.c ? " wrong" : ""}" disabled><span class="bub">${"ABCDE"[j]}</span><span>${txt(t)}</span></button>`).join("")}</div>
    <div class="explain"><strong>${e.p === e.c ? "You got this one right." : "You picked " + "ABCDE"[e.p] + ". Answer: " + txt(x.ok)}</strong>${txt(x.ex || "")}</div>
    <p class="hint">Review only. Answers can't be changed, so your mastery stays honest.</p>
    <div class="nav">${prevIndex() >= 0 ? '<button class="btn ghost" id="prevBtn">← Previous</button>' : "<span></span>"}<button class="btn" id="fwdBtn">${nextLabel}</button></div>`;
    if ($("prevBtn")) $("prevBtn").onclick = goPrev;
    $("fwdBtn").onclick = goNextFromReview; $("fwdBtn").focus();
  }

  function pick(b, id, pickedIdx) {
    if (answered) return; answered = true;
    if (!R().log) R().log = [];
    R().log[R().i] = { o: curOpts.map(o => o.t), p: pickedIdx, c: curOpts.findIndex(o => o.c) };
    const x = Q[id], r = R(), good = b.dataset.c === "true";
    $("card").querySelectorAll(".opt").forEach(o => { o.disabled = true; if (o.dataset.c === "true") o.classList.add("right") });
    b.classList.add("picked"); if (!good) b.classList.add("wrong");
    r.done++; if (good) { r.right++; r.streak++; missed.delete(id) } else { r.streak = 0; missed.add(id) }
    S.hist[id] = good ? 1 : 0;
    const before = lvl(id), now = Date.now();
    const s = S.stats[id] || [0, 0]; S.stats[id] = [s[0] + 1, s[1] + (good ? 1 : 0)];
    const g = S.log[id] || { s: 0, t0: 0, last: 0 };
    if (good) { if (!g.s) g.t0 = now; g.s++ } else { g.s = 0; g.t0 = 0 }
    g.last = now; S.log[id] = g;
    const after = lvl(id), k = need(id);
    let note;
    if (!good) note = before === "mastered" || before === "due" ? "Streak reset. This one drops out of mastered until you rebuild it." : "Streak reset. It moves to the front of your next round.";
    else if (after === "mastered") note = before === "mastered" ? "Still mastered." : `Mastered: right ${g.s} times in a row, spread over time.`;
    else if (g.s >= k) note = `Right ${g.s} in a row. Get it right again in a later session (an hour or more from now) to lock it in as mastered.`;
    else note = `Streak ${g.s} of ${k}. Keep it going to master this one.`;
    r.i++; save(); stats();
    $("fb").innerHTML = `<div class="explain"><strong>${good ? "Correct." : "Answer: " + txt(x.ok)}</strong>${txt(x.ex || "")}</div>
    <p class="lvnote"><span class="lv lv-${after}">${LEVEL_TEXT[after]}</span>${note}</p>
    <div class="nav" style="margin-top:6px">${prevIndex() >= 0 ? '<button class="btn ghost" id="prevBtn">← Previous</button>' : `<span class="hint">${good ? "" : "Saved to your review list."}</span>`}<button class="btn" id="next">Next</button></div>`;
    $("next").onclick = paint; $("next").focus();
    if ($("prevBtn")) $("prevBtn").onclick = goPrev;
  }

  function paintProgress() {
    stats();
    const c = $("card"), all = sumUp(ALL), ts = topics();
    const started = ts.filter(t => t.a).sort((x, y) => x.mastery - y.mastery || x.acc - y.acc);
    const fresh = ts.filter(t => !t.a);
    const worst = ALL.map(id => ({ id, s: S.stats[id] })).filter(o => o.s && o.s[0] > o.s[1])
      .sort((x, y) => (y.s[0] - y.s[1]) - (x.s[0] - x.s[1]) || x.s[1] / x.s[0] - y.s[1] / y.s[0]).slice(0, 8);
    c.className = "card prog";
    if (!all.a) {
      c.innerHTML = `<h2 class="ph">No answers yet</h2><p class="sub">Answer a few questions in any tab and this page will show your accuracy by topic, your strongest and weakest areas, and the questions you miss most. Everything stays on this device.</p>
      <div class="nav"><button class="btn" id="goStart">Start with ${esc(DECKS[FIRST].name)}</button></div>`;
      $("goStart").onclick = () => { view = "deck"; S.deck = FIRST; paint() }; return;
    }
    const strong = started.filter(t => t.mastery >= 50).slice(-2).reverse();
    const weak = started.filter(t => t.acc < 70).sort((x, y) => x.acc - y.acc).slice(0, 2);
    const seg = t => ["mastered", "due", "shaky", "learning"].map(l => t.n[l] ? `<i class="sg-${l}" style="width:${t.n[l] / t.total * 100}%" title="${LEVEL_TEXT[l]}: ${t.n[l]}"></i>` : "").join("");
    const row = t => `<li class="trow">
        <div class="tname"><b>${esc(t.name)}</b><span>${t.a ? `${t.mastered}/${t.total} mastered · ${t.acc}% right` : `Not started · ${t.total} questions`}</span></div>
        <div class="tbar stack" role="img" aria-label="${t.n.mastered} mastered, ${t.n.due} due, ${t.n.shaky} getting there, ${t.n.learning} learning, ${t.n.new} new">${seg(t)}</div>
        <button class="chip" data-topic="${esc(t.name)}">Practice</button></li>`;
    c.innerHTML = `
      <div class="pgrid">
        <div><b>${all.mastered}/${all.total}</b>mastered</div>
        <div><b>${all.mastery}%</b>mastery score</div>
        <div><b>${all.acc}%</b>accuracy</div>
        <div><b>${all.n.due}</b>due for review</div>
      </div>
      <div class="legend">${["mastered", "due", "shaky", "learning", "new"].map(l => `<span><i class="sg-${l}"></i>${LEVEL_TEXT[l]} ${all.n[l]}</span>`).join("")}</div>
      <details class="how2"><summary>How mastery is measured</summary>
        <p>One right answer can be a lucky guess, so a question only counts as <b>mastered</b> when you've shown you know it reliably:</p>
        <ul>
          <li><b>Right 3 times in a row</b> with no miss in between (4 in a row for two-choice questions). Guessing your way to that streak is under a 4–6% chance.</li>
          <li><b>Spread over time:</b> the streak has to stretch across at least an hour, so it reflects memory, not the screen you just saw.</li>
          <li><b>Kept fresh:</b> a mastered question you haven't seen in 5 days becomes <i>due for review</i>.</li>
        </ul>
        <p>A miss resets the streak. Rounds show your weakest questions first: learning, then due, then getting there, then new, then mastered. Your <b>mastery score</b> gives full credit for mastered, ¾ for due and ½ for getting there.</p>
      </details>
      ${strong.length || weak.length ? `<div class="callouts">
        ${weak.length ? `<p class="callout bad"><strong>Needs work</strong>${weak.map(t => esc(t.name) + " (" + t.acc + "%)").join(" · ")}</p>` : ""}
        ${strong.length ? `<p class="callout good"><strong>Strongest</strong>${strong.map(t => esc(t.name) + " (" + t.acc + "%)").join(" · ")}</p>` : ""}
      </div>` : ""}
      <h3 class="ph3">By topic <span>weakest first</span></h3>
      <ul class="topics">${started.map(row).join("")}${fresh.map(row).join("")}</ul>
      ${worst.length ? `<h3 class="ph3">Most-missed questions</h3>
      <ol class="worst">${worst.map(o => `<li><span>${esc(plain(Q[o.id].q))}</span><em>${o.s[0] - o.s[1]} wrong of ${o.s[0]}</em></li>`).join("")}</ol>
      <div class="nav"><button class="btn" id="drillWorst">Drill these ${worst.length}</button></div>` : ""}
      <p class="hint">Saved in this browser on this device only. Clearing your browser data erases it.</p>`;
    c.querySelectorAll("[data-topic]").forEach(b => b.onclick = () => {
      const t = ts.find(x => x.name === b.dataset.topic);
      startFocus(t.name, t.ids);   // startFocus orders weakest first
    });
    if ($("drillWorst")) $("drillWorst").onclick = () => startFocus("Most-missed questions", worst.map(o => o.id));
  }

  // ===== Controls
  document.addEventListener("keydown", e => {
    if (view !== "deck") return;
    if (e.key === "ArrowLeft") { if (prevIndex() >= 0) { e.preventDefault(); goPrev() } return }
    if (rev !== null) { if ((e.key === "ArrowRight" || e.key === "Enter") && $("fwdBtn")) { e.preventDefault(); $("fwdBtn").click() } return }
    if (e.key === "ArrowRight" && answered && $("next")) { e.preventDefault(); $("next").click(); return }
    if (!answered && /^[1-5]$/.test(e.key)) { const o = $("o" + (e.key - 1)); if (o) o.click() }
    else if (answered && e.key === "Enter" && $("next")) { e.preventDefault(); $("next").click() }
  });
  $("shuffleBtn").onclick = () => { S.shuffle = !S.shuffle; restart() };
  $("missedBtn").onclick = () => { S.onlyMissed = !S.onlyMissed; restart() };
  $("restartBtn").onclick = restart;
  let armed = null;
  $("resetBtn").onclick = e => {
    const b = e.currentTarget;
    if (!armed) { b.textContent = "Tap again to erase all progress"; b.classList.add("warn"); armed = setTimeout(() => { armed = null; b.textContent = "Clear history"; b.classList.remove("warn") }, 3000); return }
    clearTimeout(armed); armed = null; b.textContent = "Clear history"; b.classList.remove("warn");
    S = fresh(); missed = new Set(); restart();
  };

  buildTabs();
  apply(load());
  if (location.hash === "#progress") view = "progress";
  window.addEventListener("hashchange", () => { if (location.hash === "#progress") { view = "progress"; paint() } });
  paint();
  // Ask the browser to keep this site's storage instead of clearing it under storage pressure.
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist() } catch (e) { }
})();
