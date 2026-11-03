// Shared drill engine for every exam.
// Reads window.BANK from the exam's questions.js:
//   { title, storageKey, decks, ids: {deck:[id]}, q: {id:{d,tag,q,ok,wrong,ex,img,val,topic}}, img?, textOnly? }
// All progress is stored in this browser's localStorage under BANK.storageKey. Nothing leaves the device.
(() => {
  const B = window.BANK, DECKS = B.decks, IDS = B.ids, Q = B.q;
  const FIRST = Object.keys(DECKS)[0];
  const ALL = Object.keys(DECKS).flatMap(d => IDS[d]);
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const txt = s => B.textOnly ? esc(s) : String(s);          // Exam 1 questions contain small bits of markup
  const plain = s => String(s).replace(/<[^>]*>/g, "");
  const imgOf = id => Q[id].img || (B.img && B.img[id]) || null;
  const topicOf = id => Q[id].topic || DECKS[Q[id].d].name;
  const shuffle = a => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.random() * (k + 1) | 0; [a[k], a[j]] = [a[j], a[k]] } return a };
  const fmt$ = n => (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString();
  const pct = (c, a) => a ? Math.round(c / a * 100) : 0;

  // ===== State
  const L = B.storageKey;
  let S = fresh(), missed = new Set(), answered = false, view = "deck";
  function fresh() { return { v: 2, updatedAt: 0, deck: FIRST, shuffle: true, onlyMissed: false, missed: [], hist: {}, stats: {}, rounds: {}, focus: null } }
  function pool(d) { return d === "FOCUS" ? (S.focus ? S.focus.ids : []) : IDS[d] }

  function apply(s) {
    if (!s || s.v !== 2) return false;
    const n = fresh();
    n.updatedAt = s.updatedAt || 0; n.shuffle = s.shuffle !== false; n.onlyMissed = !!s.onlyMissed;
    n.missed = (s.missed || []).filter(id => Q[id]);
    for (const k in (s.hist || {})) if (Q[k]) n.hist[k] = s.hist[k] ? 1 : 0;
    for (const k in (s.stats || {})) if (Q[k] && Array.isArray(s.stats[k])) n.stats[k] = [s.stats[k][0] | 0, s.stats[k][1] | 0];
    for (const k in n.hist) if (!n.stats[k]) n.stats[k] = [1, n.hist[k]];   // older saves only kept the last answer
    if (s.focus && Array.isArray(s.focus.ids)) { const ids = s.focus.ids.filter(id => Q[id]); if (ids.length) n.focus = { label: String(s.focus.label || "Focus"), ids } }
    n.deck = DECKS[s.deck] || (s.deck === "FOCUS" && n.focus) ? s.deck : FIRST;
    S = n; missed = new Set(n.missed);
    for (const d of [...Object.keys(DECKS), "FOCUS"]) {
      const r = (s.rounds || {})[d]; if (!r || !Array.isArray(r.order)) continue;
      const ok = new Set(pool(d)); const order = r.order.filter(id => ok.has(id));
      n.rounds[d] = { order, i: Math.min(r.i | 0, order.length), right: r.right | 0, done: r.done | 0, streak: r.streak | 0, money: r.money | 0 };
    }
    return true;
  }
  function load() { try { return JSON.parse(localStorage.getItem(L) || "null") } catch (e) { return null } }
  function save() { S.updatedAt = Date.now(); S.missed = [...missed]; try { localStorage.setItem(L, JSON.stringify(S)) } catch (e) { } }

  // ===== Rounds
  const R = () => S.rounds[S.deck];
  function newRound(d) {
    let ids = pool(d).slice(); if (S.onlyMissed) ids = ids.filter(id => missed.has(id));
    S.rounds[d] = { order: S.shuffle ? shuffle(ids) : ids, i: 0, right: 0, done: 0, streak: 0, money: 0 };
  }
  function restart() { newRound(S.deck); answered = false; view = "deck"; paint(); save() }
  function startFocus(label, ids) {
    S.focus = { label, ids }; S.deck = "FOCUS"; S.onlyMissed = false;
    S.rounds.FOCUS = { order: shuffle(ids), i: 0, right: 0, done: 0, streak: 0, money: 0 };
    answered = false; view = "deck"; paint(); save(); window.scrollTo({ top: 0 });
  }

  // ===== Numbers for the Progress tab
  function sumUp(ids) {
    let a = 0, c = 0, seen = 0, mastered = 0;
    for (const id of ids) { const s = S.stats[id]; if (s && s[0]) { a += s[0]; c += s[1]; seen++ } if (S.hist[id] === 1) mastered++ }
    return { a, c, seen, mastered, total: ids.length, acc: pct(c, a) };
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
      view = "deck"; S.deck = d; answered = false; if (!S.rounds[d]) newRound(d); paint(); save();
    });
    make("PROG", "Progress", () => { view = "progress"; paint() });
    document.documentElement.style.setProperty("--n", Object.keys(DECKS).length + 1);
  }
  const mastered = d => pool(d).filter(id => S.hist[id] === 1).length;
  function stats() {
    for (const d in DECKS) { $("tab" + d).setAttribute("aria-selected", view === "deck" && d === S.deck); $("tc" + d).textContent = mastered(d) + "/" + IDS[d].length }
    const all = sumUp(ALL);
    $("tabPROG").setAttribute("aria-selected", view === "progress"); $("tcPROG").textContent = all.a ? all.acc + "% right" : "not started";
    const inDeck = view === "deck";
    for (const id of ["statsRow", "controls", "barRow"]) $(id).hidden = !inDeck;
    if (!inDeck) { $("deckSub").textContent = "Your strengths and weak spots, from every answer you've given on this device."; return }
    const d = S.deck, r = R(), ids = pool(d);
    $("deckSub").textContent = d === "FOCUS" ? `Focus round: ${S.focus.label} (${ids.length} question${ids.length > 1 ? "s" : ""}). Pick a tab to go back to a full set.` : DECKS[d].sub;
    $("sMaster").textContent = mastered(d) + "/" + ids.length;
    if (d !== "FOCUS" && DECKS[d].money) { $("sScore").textContent = fmt$(r.money); $("sScoreLbl").textContent = "winnings" }
    else { $("sScore").textContent = r.right + "/" + r.done; $("sScoreLbl").textContent = "this round" }
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
    if (!r.order.length) {
      c.className = "card done";
      c.innerHTML = `<h2>Nothing to review</h2><p class="sub">${S.onlyMissed ? "No missed questions in this set. Turn off “Only my missed” to see everything." : "No questions here yet."}</p>`; return
    }
    if (r.i >= r.order.length) {
      const p = pct(r.right, r.done), m = ids.filter(id => missed.has(id)).length;
      c.className = "card done";
      c.innerHTML = `<h2>${d !== "FOCUS" && DECKS[d].money ? fmt$(r.money) + " · " : ""}${r.right} / ${r.done} · ${p}%</h2>
      <p class="sub">${m ? m + " question" + (m > 1 ? "s" : "") + " here saved for review." : "Nothing left to review here."}</p>
      <div class="nav" style="justify-content:center"><button class="btn" id="again">Go again</button>${m && !S.onlyMissed ? '<button class="btn ghost" id="drill">Drill missed</button>' : ""}<button class="btn ghost" id="seeProg">See progress</button></div>`;
      $("again").onclick = restart;
      if ($("drill")) $("drill").onclick = () => { S.onlyMissed = true; restart() };
      $("seeProg").onclick = () => { view = "progress"; paint() };
      $("prog").style.width = "100%"; return;
    }
    answered = false;
    const id = r.order[r.i], x = Q[id], im = imgOf(id), s = S.stats[id];
    const opts = shuffle([{ t: x.ok, c: true }, ...x.wrong.map(t => ({ t, c: false }))]);
    const right = x.val ? `<span class="val">$${x.val}</span>` : `<span>${r.i + 1} of ${r.order.length}</span>`;
    c.className = "card";
    c.innerHTML = `<div class="meta"><span>${esc(x.tag)}${d === "FOCUS" ? " · " + esc(DECKS[x.d].name) : ""}</span>${right}</div>
    <p class="q">${txt(x.q)}</p>${im ? `<figure class="fig"><img src="${im[0]}" alt="${esc(im[1])}"></figure>` : ""}
    <div class="opts">${opts.map((o, k) => `<button class="opt" id="o${k}" data-c="${o.c}"><span class="bub">${"ABCDE"[k]}</span><span>${txt(o.t)}</span></button>`).join("")}</div>
    ${s && s[0] ? `<p class="hint">Your record on this one: ${s[1]} of ${s[0]} right.</p>` : ""}
    <div id="fb"></div>`;
    c.querySelectorAll(".opt").forEach(b => b.onclick = () => pick(b, id));
  }

  function pick(b, id) {
    if (answered) return; answered = true;
    const x = Q[id], r = R(), good = b.dataset.c === "true";
    $("card").querySelectorAll(".opt").forEach(o => { o.disabled = true; if (o.dataset.c === "true") o.classList.add("right") });
    b.classList.add("picked"); if (!good) b.classList.add("wrong");
    r.done++; if (good) { r.right++; r.streak++; missed.delete(id) } else { r.streak = 0; missed.add(id) }
    if (x.val) r.money += good ? x.val : -x.val;
    S.hist[id] = good ? 1 : 0;
    const s = S.stats[id] || [0, 0]; S.stats[id] = [s[0] + 1, s[1] + (good ? 1 : 0)];
    r.i++; save(); stats();
    const money = x.val ? ` ${good ? "+" : "−"}$${x.val}.` : "";
    $("fb").innerHTML = `<div class="explain"><strong>${good ? "Correct." + money : "Answer: " + txt(x.ok) + money}</strong>${txt(x.ex || "")}</div>
    <div class="nav" style="margin-top:14px"><span class="hint">${good ? "" : "Saved to your review list."}</span><button class="btn" id="next">Next</button></div>`;
    $("next").onclick = paint; $("next").focus();
  }

  function paintProgress() {
    stats();
    const c = $("card"), all = sumUp(ALL), ts = topics();
    const started = ts.filter(t => t.a).sort((x, y) => x.acc - y.acc || y.a - x.a);
    const fresh = ts.filter(t => !t.a);
    const worst = ALL.map(id => ({ id, s: S.stats[id] })).filter(o => o.s && o.s[0] > o.s[1])
      .sort((x, y) => (y.s[0] - y.s[1]) - (x.s[0] - x.s[1]) || x.s[1] / x.s[0] - y.s[1] / y.s[0]).slice(0, 8);
    c.className = "card prog";
    if (!all.a) {
      c.innerHTML = `<h2 class="ph">No answers yet</h2><p class="sub">Answer a few questions in any tab and this page will show your accuracy by topic, your strongest and weakest areas, and the questions you miss most. Everything stays on this device.</p>
      <div class="nav"><button class="btn" id="goStart">Start with ${esc(DECKS[FIRST].name)}</button></div>`;
      $("goStart").onclick = () => { view = "deck"; S.deck = FIRST; paint() }; return;
    }
    const strong = started.filter(t => t.a >= 3 && t.acc >= 80).slice(-2).reverse();
    const weak = started.filter(t => t.acc < 70).slice(0, 2);
    const row = t => `<li class="trow">
        <div class="tname"><b>${esc(t.name)}</b><span>${t.a ? `${t.acc}% right · ${t.seen} of ${t.total} seen` : `Not started · ${t.total} questions`}</span></div>
        <div class="tbar"><i class="${t.a ? level(t.acc) : ""}" style="width:${t.a ? t.acc : 0}%"></i></div>
        <button class="chip" data-topic="${esc(t.name)}">Practice</button></li>`;
    c.innerHTML = `
      <div class="pgrid">
        <div><b>${all.acc}%</b>accuracy</div>
        <div><b>${all.seen}/${all.total}</b>seen</div>
        <div><b>${all.mastered}</b>mastered</div>
        <div><b>${all.a}</b>answers</div>
      </div>
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
      // put the ones you've missed or never seen first, then the rest
      const ids = shuffle(t.ids).sort((a, z) => score(a) - score(z));
      startFocus(t.name, ids);
    });
    if ($("drillWorst")) $("drillWorst").onclick = () => startFocus("Most-missed questions", worst.map(o => o.id));
  }
  const score = id => { const s = S.stats[id]; return !s ? 0.5 : s[1] / s[0] };

  // ===== Controls
  document.addEventListener("keydown", e => {
    if (view !== "deck") return;
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
  paint();
  // Ask the browser to keep this site's storage instead of clearing it under storage pressure.
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist() } catch (e) { }
})();
