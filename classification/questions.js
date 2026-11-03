// ANTH 102 · Classification drill: every question comes from the Primate Classification worksheet.
// Same format as exam2/questions.js. The generated part runs in a fixed order; add new questions only at the end.

const DECKS = { CH: { name: "Classification", sub: "Primate Classification worksheet.", src: "Primate Classification worksheet" } };

// ===== Primate Classification worksheet: the original 36 questions =====
const LEVELS = {
  PRI: "Order: Primates (all primates)",
  STR: "Suborder: Strepsirrhines", HAP: "Suborder: Haplorrhines",
  LEM: "Infraorder: Lemuriformes", LOR: "Infraorder: Lorisiformes", TAR: "Infraorder: Tarsiiformes",
  PLA: "Infraorder: Platyrrhines (NWM)", CAT: "Infraorder: Catarrhines",
  CER: "Superfamily: Cercopithecoidea (OWM)", HOM: "Superfamily: Hominoidea (apes)"
};
const SIBS = { STR:["HAP"], HAP:["STR"], LEM:["LOR","TAR"], LOR:["LEM","TAR"], TAR:["LOR","PLA"], PLA:["CAT","TAR"], CAT:["PLA","HAP"], CER:["HOM","CAT"], HOM:["CER","CAT"], PRI:["HAP","STR"] };
const TRAITS = [
["Prehensile hands and feet","PRI"],["Opposable thumbs","PRI"],["Nails and dermatoglyphs","PRI"],["Binocular & stereoscopic vision","PRI"],
["“Wet-nose” primates","STR"],["Post-orbital bar","STR"],["Dental comb","STR"],["Tapetum lucidum","STR"],["2.1.3.3 dentition","STR"],
["“Dry-nose” primates","HAP"],["Post-orbital closure","HAP"],["Reduced olfaction compared to strepsirrhines","HAP"],
["Found only on Madagascar","LEM"],
["Formerly classified as prosimian","TAR"],["Huge eyes, each as large as the brain","TAR"],
["“Broad, sidewards facing nostrils”","PLA"],["Found in Central & South America","PLA"],["Prehensile tail in some species","PLA"],["2.1.3.3 dentition (with exceptions)","PLA"],
["“Downward facing nostrils”","CAT"],["2.1.2.3 dentition","CAT"],
["Bilophodont molars","CER"],["Ischial callosities","CER"],
["Y-5 (simple) molars","HOM"],["No tail","HOM"],["Modified clavicle/scapula for brachiating","HOM"],["Longest ontogeny of all primates","HOM"]
];
let _seed = 102; const _rnd = () => { _seed = (_seed * 1664525 + 1013904223) >>> 0; return _seed / 4294967296; };
const CH = TRAITS.map(([trait, lv]) => {
  const pool = Object.keys(LEVELS).filter(k => k !== lv && !(SIBS[lv] || []).includes(k));
  const wrong = [...(SIBS[lv] || [])];
  while (wrong.length < 3) { const k = pool.splice(Math.floor(_rnd() * pool.length), 1)[0]; wrong.push(k); }
  return ["Where on the chart?", `On the Primate Classification chart, “${trait}” goes under`, LEVELS[lv], wrong.slice(0, 3).map(k => LEVELS[k]), ""];
});
CH.push(
["Used twice","“Grooming claw” is used twice on the chart: under strepsirrhines and under",LEVELS.TAR,[LEVELS.LOR,LEVELS.PLA,LEVELS.CER],"Tarsiers keep this strepsirrhine-like trait even though they're haplorrhines."],
["Used twice","“Small, nocturnal & arboreal” is used twice on the chart: under Tarsiiformes and under",LEVELS.LOR,[LEVELS.LEM,LEVELS.PLA,LEVELS.HOM],"Lemurs get “found only on Madagascar” instead; many lemurs are bigger and active by day."],
["Ranks","Platyrrhines vs. catarrhines is a comparison at which rank?","Infraorder",["Suborder","Superfamily","Order"],"Study guide: suborder = haplorrhines vs strepsirrhines; infraorder = platyrrhines vs catarrhines; superfamily = cercopithecoids vs hominoids."],
["Ranks","Cercopithecoids vs. hominoids is a comparison at which rank?","Superfamily",["Infraorder","Suborder","Order"],""],
["Ranks","Haplorrhines vs. strepsirrhines is a comparison at which rank?","Suborder",["Infraorder","Superfamily","Order"],""],
["Ranks","Which list is in the correct order, from largest group to smallest?","Order → Suborder → Infraorder → Superfamily",["Order → Infraorder → Suborder → Superfamily","Suborder → Order → Superfamily → Infraorder","Superfamily → Infraorder → Suborder → Order"],""],
["Tarsiers","Tarsiers sit in which suborder in the current system?","Haplorrhines",["Strepsirrhines","Prosimians","Anthropoids"],"Old system: prosimians. Current system: haplorrhines (dry nose, partial postorbital closure, no tapetum lucidum)."],
["Catarrhines","The infraorder Catarrhini contains which two superfamilies?","Cercopithecoidea and Hominoidea",["Lemuriformes and Lorisiformes","Platyrrhini and Tarsiiformes","Strepsirrhini and Haplorrhini"],""],
["Dentition","A jaw with three premolars per side points to which groups?","Platyrrhines or strepsirrhines (2.1.3.3)",["Catarrhines (2.1.2.3)","Hominoids only","Cercopithecoids only"],"Count premolars first: 3 = NWM or strepsirrhine, 2 = catarrhine."]
);

// ===== Classification section: many more questions generated from the worksheet's answer key.
// IMPORTANT: the order of everything below is fixed. Saved progress is stored by position, so only
// ever add new questions at the very end of this block.
const TX = {
  PRI: { name: "Primates", rank: "Order", parent: null },
  STR: { name: "Strepsirrhines", rank: "Suborder", parent: "PRI" },
  HAP: { name: "Haplorrhines", rank: "Suborder", parent: "PRI" },
  LEM: { name: "Lemuriformes", rank: "Infraorder", parent: "STR" },
  LOR: { name: "Lorisiformes", rank: "Infraorder", parent: "STR" },
  TAR: { name: "Tarsiiformes", rank: "Infraorder", parent: "HAP" },
  PLA: { name: "Platyrrhines (NWM)", rank: "Infraorder", parent: "HAP" },
  CAT: { name: "Catarrhines", rank: "Infraorder", parent: "HAP" },
  CER: { name: "Cercopithecoidea (OWM)", rank: "Superfamily", parent: "CAT" },
  HOM: { name: "Hominoidea (apes)", rank: "Superfamily", parent: "CAT" }
};
const TXK = Object.keys(TX);
const LISTED = TRAITS.map(([t, k]) => [t, [k]]);
LISTED.push(["Grooming claw", ["STR", "TAR"]], ["Small, nocturnal & arboreal", ["LOR", "TAR"]]);
const ancestors = k => { const a = []; while (TX[k].parent) { k = TX[k].parent; a.push(k) } return a };
const descendants = k => TXK.filter(x => ancestors(x).includes(k));
const lineage = k => [k, ...ancestors(k), ...descendants(k)];
const listedUnder = k => LISTED.filter(([, ks]) => ks.includes(k)).map(([t]) => t);
// traits that are clearly NOT part of group k's line (so a "wrong" option is never secretly right)
const outside = k => { const o = LISTED.filter(([, ks]) => !ks.some(x => lineage(k).includes(x))).map(([t]) => t);
  return o.length >= 3 ? o : LISTED.filter(([, ks]) => !ks.includes(k)).map(([t]) => t) };   // Primates: every trait is inside its line, so use traits listed under other groups
const pickN = (arr, n, avoid = []) => { const pool = arr.filter(x => !avoid.includes(x)); const out = []; while (out.length < n && pool.length) out.push(pool.splice(Math.floor(_rnd() * pool.length), 1)[0]); return out };
const CW = [];
// 1) Which trait is listed under X? (one per trait-and-group pairing: 31)
for (const k of TXK) for (const t of listedUnder(k))
  CW.push(["Listed under " + TX[k].name, `On the classification chart, which trait is listed under ${TX[k].name}?`, t, pickN(outside(k), 3), `${TX[k].name} (${TX[k].rank.toLowerCase()}): ${listedUnder(k).join("; ")}.`]);
// 2) Which is NOT listed under X? (3 versions for each group with 3+ traits)
for (const k of TXK) { const mine = listedUnder(k); if (mine.length < 3) continue;
  for (let v = 0; v < 3; v++) { const odd = pickN(outside(k), 1)[0];
    CW.push([`Not ${TX[k].name}`, `Which of these is NOT listed under ${TX[k].name} on the chart?`, odd, pickN(mine, 3), `“${odd}” belongs elsewhere. ${TX[k].name} has: ${mine.join("; ")}.`]) } }
// 3) What level is X?
const RANKS4 = ["Order", "Suborder", "Infraorder", "Superfamily"];
for (const k of TXK) CW.push(["Chart levels", `On the chart, ${TX[k].name} is at which level?`, TX[k].rank, RANKS4.filter(r => r !== TX[k].rank), "Order → Suborder → Infraorder → Superfamily."]);
// 4) What does X sit directly under?
for (const k of TXK) { if (!TX[k].parent) continue;
  CW.push(["Chart structure", `${TX[k].name} sits directly under which group on the chart?`, TX[TX[k].parent].name, pickN(TXK.filter(x => x !== k && x !== TX[k].parent), 3).map(x => TX[x].name), `${TX[k].name} → ${[TX[k].parent, ...ancestors(TX[k].parent)].map(x => TX[x].name).join(" → ")}.`]) }
// 5) Which group sits under X?
for (const k of ["STR", "HAP", "CAT"]) for (const c of TXK.filter(x => TX[x].parent === k))
  CW.push(["Chart structure", `Which group sits directly under ${TX[k].name} on the chart?`, TX[c].name, pickN(TXK.filter(x => !descendants(k).includes(x) && x !== k), 3).map(x => TX[x].name), `Under ${TX[k].name}: ${TXK.filter(x => TX[x].parent === k).map(x => TX[x].name).join(", ")}.`]);
// 6) Which trait–group pair matches the chart? (20)
const pairText = (t, k) => `${t} → ${TX[k].name}`;
for (let v = 0; v < 20; v++) {
  const [t, ks] = LISTED[Math.floor(_rnd() * LISTED.length)], k = ks[0];
  const wrong = []; let guard = 0;
  while (wrong.length < 3 && guard++ < 200) { const [t2, ks2] = LISTED[Math.floor(_rnd() * LISTED.length)]; const bad = pickN(TXK.filter(x => !ks2.some(y => lineage(y).includes(x))), 1)[0]; const txt = bad && pairText(t2, bad); if (txt && !wrong.includes(txt) && t2 !== t) wrong.push(txt) }
  CW.push(["Matching pairs", "Which trait–group pair matches the classification chart?", pairText(t, k), wrong, `On the chart, “${t}” is listed under ${ks.map(x => TX[x].name).join(" and ")}.`]);
}
// 7) Comparisons and connections (written by hand from the worksheet)
CW.push(
["Compare", "Strepsirrhines are “wet-nose” primates. On the chart, haplorrhines are", "“Dry-nose” primates", ["“Wet-nose” primates too", "Primates without noses", "“Downward facing nostrils” primates"], "Strepsirrhines rely more on smell (a moist rhinarium); haplorrhines have reduced olfaction."],
["Compare", "Strepsirrhines have a post-orbital bar. On the chart, haplorrhines have", "Post-orbital closure", ["A post-orbital bar too", "No eye sockets", "A dental comb"], "Bar = a ring of bone around the eye; closure = a bony wall behind it."],
["Compare", "Which two groups on the chart are listed with 2.1.3.3 dentition?", "Strepsirrhines and Platyrrhines", ["Catarrhines and Hominoidea", "Haplorrhines and Catarrhines", "Cercopithecoidea and Hominoidea"], "Catarrhines are 2.1.2.3: one fewer premolar."],
["Compare", "Platyrrhines have “broad, sidewards facing nostrils.” Catarrhines have", "“Downward facing nostrils”", ["Broad, sidewards facing nostrils too", "A wet rhinarium", "No external nose"], "Platy = flat or broad; cata = downward; rrhine = nose."],
["Compare", "Cercopithecoids have bilophodont molars. Hominoids have", "Y-5 (simple) molars", ["Bilophodont molars too", "A dental comb", "2.1.3.3 molars"], ""],
["Compare", "Which dental formula separates catarrhines from platyrrhines on the chart?", "Catarrhines 2.1.2.3, platyrrhines 2.1.3.3", ["Catarrhines 2.1.3.3, platyrrhines 2.1.2.3", "Both 2.1.2.3", "Both 2.1.3.3"], "Count the premolars: 2 for catarrhines, 3 for platyrrhines."],
["Connections", "“Grooming claw” appears twice on the chart: under Strepsirrhines and under", "Tarsiiformes", ["Lorisiformes", "Platyrrhines (NWM)", "Hominoidea (apes)"], "Tarsiers keep this strepsirrhine-like trait though they're haplorrhines."],
["Connections", "“Small, nocturnal & arboreal” appears twice on the chart: under Tarsiiformes and under", "Lorisiformes", ["Lemuriformes", "Catarrhines", "Cercopithecoidea (OWM)"], ""],
["Connections", "Which infraorder on the chart is “formerly classified as prosimian” but sits under Haplorrhines?", "Tarsiiformes", ["Lemuriformes", "Lorisiformes", "Platyrrhines (NWM)"], "The old prosimian group = strepsirrhines + tarsiers."],
["Connections", "Strepsirrhines have a tapetum lucidum for night vision. Which nocturnal haplorrhine group is listed with huge eyes instead?", "Tarsiiformes", ["Lorisiformes", "Lemuriformes", "Catarrhines"], "Tarsiers lack a tapetum lucidum, so their eyes are enormous."],
["Connections", "“Reduced olfaction compared to strepsirrhines” is listed under", "Haplorrhines", ["Strepsirrhines", "Lemuriformes", "Lorisiformes"], ""],
["Connections", "Which superfamily is listed with “modified clavicle/scapula for brachiating” and “no tail”?", "Hominoidea (apes)", ["Cercopithecoidea (OWM)", "Platyrrhines (NWM)", "Tarsiiformes"], ""],
["Connections", "“Prehensile tail in some species” is listed under which group?", "Platyrrhines (NWM)", ["Cercopithecoidea (OWM)", "Hominoidea (apes)", "Lemuriformes"], "Only some New World monkeys; Old World monkeys never have one, and apes have no tail."],
["Connections", "Which trait on the chart describes growth and development rather than anatomy?", "Longest ontogeny of all primates", ["Y-5 (simple) molars", "Ischial callosities", "Post-orbital closure"], "Ontogeny = development from conception to adulthood."]
);
// 8) Traits pass down the chart
CW.push(
["Reading the chart", "Traits listed under Order Primates (like nails and dermatoglyphs) apply to", "Every group on the chart", ["Only strepsirrhines", "Only apes", "Only the order row, not the groups below"], "A trait listed for a group applies to every group beneath it."],
["Reading the chart", "“Dry-nose” is listed under Haplorrhines, not Hominoidea. Do apes have a dry nose?", "Yes: apes are haplorrhines, so haplorrhine traits apply to them", ["No: it isn't listed under Hominoidea", "Only gibbons do", "The chart doesn't say"], "Hominoidea → Catarrhines → Haplorrhines."],
["Reading the chart", "Old World monkeys (Cercopithecoidea) have “downward facing nostrils” because they are", "Catarrhines", ["Platyrrhines", "Strepsirrhines", "Tarsiiformes"], ""],
["Reading the chart", "Which trait applies to lemurs because of their suborder?", "Dental comb", ["Post-orbital closure", "Y-5 (simple) molars", "Ischial callosities"], "Lemuriformes → Strepsirrhines: wet nose, post-orbital bar, dental comb, tapetum lucidum, grooming claw, 2.1.3.3."]
);
CH.push(...CW);


const DATA = { CH };

// Subject tabs for this drill, by kind of question
const SUBJECTS = [
  { name: "Where traits go", short: "Where traits go", sub: "Which group each trait on the worksheet is listed under, which ones aren't, and trait–group pairs.", link: { href: "chart.html", label: "Drag-and-drop chart →" } },
  { name: "Chart structure", short: "Chart structure", sub: "The chart's levels (order, suborder, infraorder, superfamily) and which group sits under which." },
  { name: "Compare & connect", short: "Compare & connect", sub: "Contrasting groups side by side, traits that appear twice, and how traits pass down the chart." }
];
const TAG_SUBJECT = t => /^Listed under|^Not |^Matching pairs|^Where on the chart|^Used twice|^Dentition/.test(t) ? "Where traits go"
  : /^Chart levels|^Chart structure|^Ranks|^Tarsiers|^Catarrhines/.test(t) ? "Chart structure" : "Compare & connect";

const Q = {}, IDS = { CH: [] };
CH.forEach((r, n) => { const id = "CH" + n;
  Q[id] = { d: "CH", tag: r[0], q: r[1], ok: r[2], wrong: r[3], ex: r[4] || "", img: null, topic: TAG_SUBJECT(r[0]) };
  IDS.CH.push(id) });
window.BANK = { title: "Classification Chart Drill", storageKey: "anthro-class-v1", decks: DECKS, ids: IDS, q: Q, textOnly: true, topics: SUBJECTS };
