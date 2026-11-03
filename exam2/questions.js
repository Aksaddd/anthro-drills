// ANTH 102 · Exam 2 question bank
// ---------------------------------------------------------------
// Each question is one array:
//   [tag, question, correctAnswer, [wrongAnswers...], explanation, figureKey]
// - explanation and figureKey are optional ("" or leave off).
// - figureKey must match a key in FIG below (images live in exam2/img/).
// - To add questions, APPEND them to the end of a deck's list.
//   Progress is stored by position, so inserting in the middle would
//   shift everyone's saved history onto the wrong questions.
// ---------------------------------------------------------------

const FIG = {
  a5q1: ["img/a5-q1-molars.jpg", "Molars seen from above and from the side"],
  a5q2: ["img/a5-q2-skull.jpg", "Skull with an arrow pointing at the eye socket"],
  a5q3: ["img/a5-q3-foot.jpg", "Primate foot with an arrow pointing at the second toe"],
  a5q4: ["img/a5-q4-jaw.jpg", "Lower jaw with an arrow pointing at the front teeth"],
  a5q5: ["img/a5-q5-molars.jpg", "Molars seen from above"],
  a5q6: ["img/a5-q6-skull.jpg", "Skull from the front and the side, with a very deep lower jaw"],
  a5q7: ["img/a5-q7-movement.jpg", "Primate swinging arm over arm beneath a branch"],
  a5q8: ["img/a5-q8-tail.jpg", "Primate hanging from a branch"],
  a5q9: ["img/a5-q9-skull.jpg", "Skull with an arrow pointing at the eye socket"],
  a5q10: ["img/a5-q10-rump.jpg", "Two primates seen from behind"],
  jaw: ["img/th-dental-jaw.jpg", "Primate lower jaw seen from above"],
  strep: ["img/th-strep-skull.jpg", "Two skulls labeled A and B"],
  abc: ["img/skulls-abc.jpg", "Three skulls labeled a, b and c with arrows behind the eye"],
  tarsier: ["img/tarsier-skull.jpg", "Small skull with enormous eye sockets, plus foot bones"],
  jaws3: ["img/three-jaws.jpg", "Three lower jaws side by side: left, middle, right"],
  molars: ["img/molars-compare.jpg", "Two rows of molars: top and bottom"],
  dimorph: ["img/dimorphism-graph.jpg", "Bar graphs of male-to-female canine length and body weight by mating system"],
  modes: ["img/speciation-modes.jpg", "Three rows showing Species A changing over time"]
};

const DECKS = {
  TH: { name: "Top Hat", sub: "Lecture participation questions from Top Hat, Lectures 11–18." },
  A5: { name: "Activity 5", sub: "Primate Biology & Taxonomy: identify the taxon from the picture. Answer at the closest level the feature allows." },
  CH: { name: "Chart", sub: "The Primate Classification worksheet: which level of the chart does each trait belong to?" },
  LT: { name: "Activity 4", sub: "Brightspace Activity 4: the Life in Trees film." },
  WS: { name: "Why Sex", sub: "Chimpanzees vs. bonobos, from the “Why Sex” film worksheet. Exam questions are drawn from it." },
  PR: { name: "Practice", sub: "Every topic on the Exam 2 study guide, including picture questions." }
};

// ===== Top Hat =====
const TH = [
["Speciation: crayfish","A mutation gave a slough crayfish offspring three copies of each chromosome. She reproduces by cloning and is instantly isolated from the parent species, living in the same place. This is","Sympatric speciation",["Allopatric speciation","Peripatric speciation","Anagenesis"],"No geographic barrier: a genetic change created the reproductive barrier in the same area."],
["Speciation: squirrels","A large squirrel population is divided by a river. Over time the two sides can no longer interbreed. This is","Allopatric speciation",["Sympatric speciation","Peripatric speciation","Stasis"],"A geographic barrier split a LARGE population (like the Grand Canyon antelope squirrels). A small group at the edge would be peripatric."],
["Human influence","______ factors, i.e. human influence, are a major contributor to the endangerment and extinction of other species.","Anthropogenic",["Evolutionary","Ontogenetic","Natural"],"Anthropo = human, -genic = caused by. The dodo is the course's example."],
["Protoprimate","The protoprimate emerged approximately ______ years ago.","66 million",["6 million","225 million","650 million"],"Right at the start of the Cenozoic, after the dinosaurs died out. 225 mya is when the first mammals appeared."],
["Distribution","Living primates are naturally found in all of the following regions EXCEPT","Australia",["Africa","Central and South America","South and Southeast Asia"],"No wild primates in Australia, Antarctica, or most of Europe and North America."],
["Arboreal heritage","Primates have an arboreal heritage, meaning the first primates had numerous adaptations suited to","Life in the trees",["Running on open ground","Swimming","Living in burrows"],""],
["Teeth","Having different kinds of teeth (incisors, canines, premolars, molars) that serve different functions is called","Heterodonty",["Homodonty","Bilophodonty","A dental comb"],"Homodont animals, like the boa constrictor on the slide, have teeth that are all the same."],
["Dental formula","What is the dental formula of this jaw? (Count one side, front to back.)","2-1-3-3",["2-1-2-3","3-0-3-3","2-1-2-4"],"2 incisors, 1 big canine, then 6 cheek teeth = 3 premolars + 3 molars. Three premolars means New World monkey.","jaw"],
["Primate ontogeny","Why does a long ontogeny (slow development) matter for primates?","It gives individuals time to learn social roles and social behavior",["It lets males grow larger canines","It gives time to learn to dance","It gives time to learn to fight"],"A long childhood = time for brain growth and social learning."],
["Suborders","The two suborders of primates in the current system are","Strepsirrhines and haplorrhines",["Catarrhines and platyrrhines","Cercopithecoids and hominoids","Flying lemurs and tarsiers"],"Catarrhines/platyrrhines are infraorders; cercopithecoids/hominoids are superfamilies. Flying lemurs (colugos) aren't primates."],
["Strepsirrhine traits","What is the name for the moist, fleshy pad at the tip of the nose of strepsirrhines?","Rhinarium",["Tapetum lucidum","Post-orbital bar","Olfactory pad"],"The rhinarium = “wet nose” = greater reliance on smell."],
["Strep characteristics","Which of the following is NOT a general characteristic of strepsirrhines?","Well-developed visual acuity",["2.1.3.3 dental formula","Dental comb","Grooming claw"],"Sharp, detailed vision is a haplorrhine trait. In NOT questions the wrong answer is usually a trait from the other suborder."],
["Strep skull","Which skull belongs to a strepsirrhine?","Skull A",["Skull B"],"A has a postorbital BAR: a thin ring with an open gap behind the eye. B is an ape: postorbital closure, flat face, big canines.","strep"],
["Lemurs","Lemurs are native to","Madagascar",["Southeast Asia","Mauritius","Polynesia"],"Southeast Asia is lorises; Mauritius is the dodo's island."],
["Prosimian","The old “prosimian” category included strepsirrhines plus this additional group:","Tarsiers",["Platyrrhines","Haplorrhines","Hominoids"],"Tarsiers look prosimian but share derived traits with anthropoids, so today they're haplorrhines."],
["Haplorrhines","Which is NOT a typical characteristic of haplorrhines?","Predominantly nocturnal",["Larger body size","Larger brain relative to body size","Extended gestation and maturation period"],"Most haplorrhines are diurnal. Exceptions: tarsiers and owl monkeys."],
["NWM","Which feature is found among some platyrrhines (New World monkeys)?","Prehensile tails",["Post-orbital bar","Tapetum lucidum","2.1.2.3 dentition"],"Bar and tapetum are strepsirrhine; 2.1.2.3 is catarrhine (NWM are 2.1.3.3)."],
["Colobines","This derived feature of colobines lets them digest cellulose-laden plant foods:","Semi-chambered stomach",["Cheek pouches","No appendix","Sharp canine teeth"],"Cheek pouches belong to the OTHER subfamily, the cercopithecines."],
["Infanticide","Infanticide as a primate reproductive strategy is based on the idea that the death of a nursing infant","Accelerates the mother's return to sexual receptivity (she resumes ovulation)",["Angers females so they defend their territory","Makes females more likely to cooperate with aggressive males","Provides food when resources are low"],"Top Hat was “select all that apply”, but only this one is correct. The new male can father his own offspring sooner."],
["Hominoids","In contrast to bilophodont molars, hominoids have this molar pattern:","Y-5 molars",["Dental comb","Brachiated teeth","Ischial callosities"],""],
["Hominoid locomotion","Moving through the treetops by alternately supporting the body under each forelimb is called","Brachiation",["Prehensile tail use","Bilophodonty"],"Gibbons are the champion brachiators."],
["Longest ontogeny","According to this class, which primate taxon has the longest ontogeny?","Hominoids",["Platyrrhines","Lorises & galagos","Lemurs"],"Apes have the longest development (and largest brain relative to body size)."],
["Chimps and bonobos","According to “Why Sex”, one way common chimpanzee females respond to the danger of infanticide is to","Mate with all males in the troop to confuse paternity",["Deny sex to all males in the troop","Deny sex only to males who commit infanticide","Aggressively fight back against males"],"If any male could be the father, no male gains by killing the infant."],
["Field studies","The study of behaviors as they evolved through natural selection within particular environments is","Behavioral ecology",["Brachiation studies","Sympatric studies","Fission-fusion"],""],
["Predation","A large primate group may defend against predators through all of the following EXCEPT","Deletion",["Detection","Dilution","Deterrence"],"The three real D's: detection, deterrence, dilution."],
["Dispersal","A primate that does not leave its birth (natal) group is","Philopatric",["Sympatric","The dominant male","A conspecific"],"Philopatry = staying in your natal group as an adult."],
["Social & mating system","Pair-bonded primates have little competition for mates. For this reason they generally show","Low sexual dimorphism",["High sexual dimorphism","A care-free attitude"],""]
];

// ===== Activity 5 (Brightspace) =====
const A5 = [
["Question 1","Based on the dentition (two views of the same teeth), what taxon does this individual belong to?","Cercopithecoid",["Strepsirrhine","Platyrrhine","Hominoid"],"Bilophodont molars: 4 tall cusps in two pairs, each pair joined by a ridge (the drawn lines).","a5q1"],
["Question 2","Based on the feature indicated by the arrow, what taxon does this skull belong to?","Strepsirrhine",["Haplorrhine"],"Postorbital BAR: a thin ring of bone with the socket open behind it. Haplorrhines have a closed bony back wall.","a5q2"],
["Question 3","Based on the feature indicated by the arrow, identify the taxon this individual most likely belongs to:","Strepsirrhine",["Catarrhine","Cercopithecoid","Hominoid"],"Grooming claw on the second toe; every other digit has a nail.","a5q3"],
["Question 4","Based on the feature the arrow points to, identify the taxon this individual most likely belongs to:","Strepsirrhine",["Platyrrhine","Catarrhine","Haplorrhine"],"Dental comb (toothcomb): long, thin lower incisors and canines tilted forward like a comb.","a5q4"],
["Question 5","Based on features of the dentition, what taxon does this individual belong to?","Hominoid",["Strepsirrhine","Cercopithecoid","Platyrrhine"],"Y-5 molars: 5 low, rounded cusps with Y-shaped grooves, not paired into ridges.","a5q5"],
["Question 6","Using both views, identify this individual to the closest taxonomic level possible (skull → suborder, then the jaw narrows it down).","Platyrrhine",["Catarrhine","Strepsirrhine","Hominoid"],"Postorbital closure = haplorrhine. The hugely deep jaw houses an enlarged hyoid: a howler monkey, a New World monkey.","a5q6"],
["Question 7","Based on the movement shown, identify the primate to the closest taxonomic level possible:","Hominoid",["Strepsirrhine","Cercopithecoid","Platyrrhine"],"Brachiation (arm over arm beneath the branch) needs long arms, mobile shoulders and no tail. Only apes do it.","a5q7"],
["Question 8","Looking at the image, what taxon does this primate belong to?","Platyrrhine",["Strepsirrhine","Tarsier","Catarrhine"],"Hanging by a prehensile tail with a bare gripping pad: a spider monkey. Only some New World monkeys have this.","a5q8"],
["Question 9","Identify the skull to the closest taxon possible based on the feature the arrow indicates:","Haplorrhine",["Strepsirrhine"],"Postorbital closure: each eye socket is a closed bony cup. Compare Question 2's open bar.","a5q9"],
["Question 10","Using the image, identify the taxon these primates belong to:","Cercopithecoid",["Platyrrhine","Strepsirrhine","Tarsiers"],"Ischial callosities (sitting pads) on the rump of crested macaques, Old World monkeys. The red swelling around them is a sexual swelling.","a5q10"]
];

// ===== Primate Classification chart (worksheet) =====
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

// ===== Why Sex film worksheet =====
const WS = [
["Worksheet Q1","How does Richard Wrangham describe chimpanzee social structure?","Male-dominated: males stay in their natal group, form coalitions, and use aggression to control females",["Female-dominated through strong female alliances","Solitary, with males and females meeting only to mate","Pair-bonded, with one male and one female raising offspring"],"Chimp communities are also fission-fusion: they split into shifting foraging parties."],
["Worksheet Q2","What is infanticide?","The killing of infants, here by males who are not the father",["Females abandoning infants during food shortages","Infants being adopted by other females","Mothers weaning infants early"],"Killing a nursing infant brings the mother back into ovulation sooner."],
["Worksheet Q2","How have chimpanzee females responded to the danger of infanticide?","By mating with many males, so paternity is uncertain",["By denying sex to all males","By forming female coalitions that dominate males","By leaving the community with their infants"],"No male gains by killing an infant that could be his own."],
["Worksheet Q3","How are testes size and sperm quality related to chimpanzee reproductive strategy?","Females mate with many males, so sperm competes inside the female; males with larger testes and more sperm father more offspring",["One male controls all mating, so testes stay small","Large testes attract females during courtship","Sperm quality only matters in pair-bonded species"],"This is sperm competition. Chimps have very large testes for their body size."],
["Worksheet Q3","Gorillas have small testes for their size. Why, compared with chimps?","One silverback controls the females, so there's little sperm competition",["Gorillas mate with many partners","Gorillas reproduce asexually","Females choose males by testes size"],"Gorilla males compete BEFORE mating (huge body dimorphism); chimp males compete after (sperm competition)."],
["Worksheet Q4","According to the film, what explains the relatively peaceful relationships between female and male bonobos?","Females form strong alliances and use sex socially to ease tension, so male aggression doesn't pay",["Males are much larger and keep order","Bonobos live alone and rarely meet","Males guard a single female each"],"Female bonobos band together; sex is used to resolve conflict and build bonds."],
["Worksheet Q4","In bonobo society, which sex is dominant?","Females, through alliances with each other",["Males, through coalitions of related males","Neither; bonobos have no hierarchy","Whichever sex is larger in that group"],""],
["Worksheet Q5","Why are chimps and bonobos so different in social and reproductive behavior?","Ecology: bonobos have plentiful, evenly spread food and no gorilla competitors, so females can forage together and form alliances",["Bonobos and chimps are not closely related","Chimps live in captivity more often","Bonobos are nocturnal and chimps are diurnal"],"Chimp food is patchy and shared with gorillas, so females forage alone or in small groups and can't build strong alliances."],
["Worksheet Q5","Which geographic barrier separates bonobos from common chimpanzees?","The Congo River",["The Nile River","Lake Victoria","The Sahara Desert"],"Bonobos live only south of the Congo River. A real example of allopatric speciation."],
["Pan","The two species of genus Pan are","Pan troglodytes (common chimpanzee) and Pan paniscus (bonobo)",["Pan troglodytes (bonobo) and Pan paniscus (common chimpanzee)","Pan gorilla and Pan pongo","Pan paniscus and Pongo pygmaeus"],"Chimps and bonobos are the only species the study guide says you need by name."]
];

// ===== Practice: every study guide topic =====
const PR = [
// Macroevolution
["Species concepts","The biological species concept defines a species as","A group of populations that can interbreed and produce fertile offspring, reproductively isolated from others",["A group of organisms that look physically alike","A group of organisms that occupy the same niche","Any population living in one geographic area"],""],
["Species concepts","Paleontologists naming fossil species must rely on physical form. That's the","Morphological species concept",["Biological species concept","Ecological species concept","Phylogenetic tree"],"You can't test whether fossils interbred, so you go by shape."],
["Species concepts","Defining species by the niche they occupy (what they eat, where they live) is the","Ecological species concept",["Morphological species concept","Biological species concept","Punctuated equilibrium"],""],
["Pace of change","Long periods of little change interrupted by short bursts of rapid change is","Punctuated equilibrium",["Gradualism","Stasis","Anagenesis"],"Gradualism = slow, steady change over long periods (Darwin's view)."],
["Pace of change","Slow, steady, continuous change accumulating over long periods is","Gradualism",["Punctuated equilibrium","Cladogenesis","Catastrophism"],""],
["Modes of speciation","In this diagram, the bottom row (Species A splitting into Species A and Species B) shows","Cladogenesis",["Anagenesis","Stasis","Adaptive radiation"],"Clado = branch. Two species now exist side by side.","modes"],
["Modes of speciation","In this diagram, the middle row (Species A gradually turning into Species B along one line, like horse evolution) shows","Anagenesis",["Cladogenesis","Stasis","Sympatric speciation"],"No branching. The crossed-out ‘march of progress’ is a warning: human evolution was branching, not anagenesis.","modes"],
["Modes of speciation","A species that stays essentially unchanged over a long period shows","Stasis",["Anagenesis","Cladogenesis","Gradualism"],""],
["Types of speciation","A small group at the edge of a species' range becomes isolated and, helped by founder effect and drift, becomes a new species. This is","Peripatric speciation",["Allopatric speciation","Sympatric speciation","Anagenesis"],""],
["Types of speciation","A subdivision of a population is called a","Deme",["Clade","Taxon","Natal group"],"Allopatric step 1: a barrier splits a population into isolated demes."],
["Types of speciation","Which is the best primate example of allopatric speciation?","Bonobos and chimpanzees separated by the Congo River",["Marbled crayfish cloning","Marmosets giving birth to twins","Lemurs diversifying on Madagascar"],""],
["Extinction","Extinction is","When no surviving members of a species remain",["When a species splits into two","When a population becomes isolated","When a species stops changing"],"The dodo of Mauritius is the course's example of anthropogenic extinction."],
// Phylogeny
["Phylogeny","Systematics combines","Taxonomy and phylogeny",["Ecology and behavior","Anatomy and genetics","Speciation and extinction"],"Phylogeny = evolutionary history."],
["Phylogeny","A trait shared because it was inherited from a common ancestor is","A homology",["An analogy","Convergent evolution","A vestigial structure"],""],
["Phylogeny","Wings in birds, bats and insects do the same job but evolved independently. They are","Analogies (convergent evolution)",["Ancestral homologies","Derived homologies","Vestigial structures"],"Similar function, separate origins."],
["Phylogeny","Five digits on each hand (pentadactyly) are shared by primates, frogs, lizards and many other vertebrates. For grouping primates this is","An ancestral (primitive) homology",["A derived homology","An analogy","Convergent evolution"],"Inherited from a distant ancestor, so it doesn't tell primate groups apart."],
["Phylogeny","Postorbital closure is shared by all haplorrhines but not strepsirrhines. It is","A derived homology",["An ancestral homology","An analogy","A vestigial structure"],"Ateles (spider monkey) = derived closure; Lemur = ancestral bar."],
["Phylogeny","Why was the old “prosimian” group dropped?","It grouped tarsiers with lemurs on ancestral look-alike traits instead of shared derived traits",["Prosimians turned out not to be primates","It contained too many species","Tarsiers went extinct"],"Good groups are defined by shared DERIVED traits."],
["Phylogeny","The aye-aye's rodent-like ever-growing incisors are best described as","Highly derived traits",["Ancestral primate traits","Traits shared by all strepsirrhines","Homologies with tarsiers"],"Its dental formula (1.0.1.3 / 1.0.0.3) is the exception to strepsirrhine 2.1.3.3."],
// Primate features
["Timing","The Cenozoic, the “age of mammals”, began about","66 million years ago",["225 million years ago","6 million years ago","4.5 billion years ago"],""],
["Timing","After the dinosaurs died out, mammals diversified into many niches (sea lions, elephants, sloths, primates). This is","Adaptive radiation",["Anagenesis","Stasis","Founder effect"],""],
["Why primates","Primates are called “generalized” because they","Kept flexible features (five digits, mixed diet, varied locomotion) instead of specializing for one niche",["Are found everywhere on Earth","All eat the same diet","Evolved after humans"],"The giraffe and seal on the slide are the specialized contrast."],
["Primate features","Fingerprint ridges on primate tactile pads are called","Dermatoglyphs",["Ischial callosities","Rhinaria","Lophs"],""],
["Primate features","Forward-facing eyes with overlapping fields that give 3D depth perception provide","Binocular, stereoscopic vision",["A tapetum lucidum","Color blindness","Olfactory dominance"],"Crucial for judging distance when leaping between branches."],
["Primate features","Among primates, color vision is found in","Diurnal species",["Nocturnal species","Strepsirrhines only","Tarsiers only"],""],
["Primate features","A flat face tucked under the braincase, as in humans, is","Orthognathic",["Prognathic","Bilophodont","Heterodont"],"Prognathic = jutting midface, like a dog's snout."],
["Primate features","Encephalization means","A large brain relative to body size",["A reduced snout","A long juvenile period","A grasping hand"],"The expansion is mainly the neocortex."],
["Primate features","Which is a primate life-history trend?","Single offspring, long gestation and extended ontogeny",["Large litters and short gestation","Very short juvenile periods","Offspring independent at birth"],""],
["Distribution","Lemurs are found only on","Madagascar",["Borneo","Sumatra","Mauritius"],""],
["Distribution","The only great ape living in Asia is the","Orangutan (Sumatra & Borneo)",["Gorilla","Bonobo","Siamang"],"Gibbons and siamangs are Asian too, but they're lesser apes."],
// Taxonomy comparisons with pictures
["Image ID","In this figure, which skull shows a postorbital BAR (open behind the eye)?","b (lemur)",["a (monkey)","c (dog)"],"a = closure (haplorrhine), b = bar (strepsirrhine), c = neither (not a primate).","abc"],
["Image ID","In this figure, skull c has neither a bar nor closure behind the eye. It is","Not a primate (a dog)",["A strepsirrhine","A haplorrhine","A tarsier"],"Trend: nothing → bar → closure.","abc"],
["Image ID","This tiny skull has eye sockets so large they nearly touch, plus very long ankle bones. It belongs to a","Tarsier",["Lemur","Howler monkey","Gibbon"],"Each eye is as large as the brain; tarsiers lack a tapetum lucidum.","tarsier"],
["Image ID","Look at the LEFT jaw. It has three premolars per side. Which group?","Platyrrhini",["Cercopithecoidea","Hominoidea","Strepsirrhini"],"The middle (bilophodont) and right (Y-5) jaws have two premolars: catarrhines.","jaws3"],
["Image ID","The TOP row of molars has tall, paired cusps joined by ridges. They belong to","Cercopithecoids (bilophodont)",["Hominoids (Y-5)","Platyrrhines","Strepsirrhines"],"Bottom row: low, rounded Y-5 molars = hominoids.","molars"],
["Image ID","The BOTTOM row of molars has five low, rounded cusps. They are","Y-5 molars (hominoids)",["Bilophodont molars (cercopithecoids)","A dental comb","Homodont teeth"],"","molars"],
// Group comparisons
["Strepsirrhines","Which set is ALL strepsirrhine?","Rhinarium, postorbital bar, tapetum lucidum, grooming claw, dental comb",["Dry nose, postorbital closure, fused frontal","Bilophodont molars, ischial callosities","Y-5 molars, no tail, brachiation"],""],
["Haplorrhines","Haplorrhines have a fused frontal bone and a fused mandibular symphysis. Strepsirrhines have","Unfused frontal and unfused symphysis",["Fused frontal, unfused symphysis","No frontal bone","A dental comb in the upper jaw"],""],
["Tarsiers","Which tarsier trait is “anthropoid-like” and puts them in the haplorrhines?","No tapetum lucidum and postorbital closure",["Grooming claw","Small, nocturnal, vertical clinging and leaping","Insect-eating diet"],"The grooming claw and nocturnal habits are the strepsirrhine-like ones."],
["Anthropoids","“Anthropoids” are","Monkeys, apes and humans (haplorrhines minus tarsiers)",["Strepsirrhines plus tarsiers","Apes only","All primates"],""],
["NWM vs OWM","Broad, sideways-facing nostrils set wide apart indicate a","Platyrrhine",["Catarrhine","Cercopithecoid","Hominoid"],"Platy = flat/broad; cata = downward."],
["NWM vs OWM","Which group never has a prehensile tail?","Cercopithecoids (Old World monkeys)",["Howler monkeys","Spider monkeys","Atelids"],"OWM have tails, but never grasping ones. Apes have no tail at all."],
["OWM","Cheek-pouch monkeys (cercopithecines) such as macaques and baboons are","Omnivorous, storing food in their cheek pouches",["Leaf specialists with chambered stomachs","Nocturnal insectivores","Strict fruit eaters with throat sacs"],""],
["OWM","Langurs, colobus and proboscis monkeys belong to the","Colobines (leaf-eating monkeys)",["Cercopithecines (cheek-pouch monkeys)","Platyrrhines","Hylobatids"],""],
["OWM","Which macaque lives outside the tropics, in snowy northern Japan?","Macaca fuscata",["Macaca mulatta","Papio anubis","Colobus guereza"],"Macaques are the most widespread primate genus after humans."],
["Apes","Which ape trait is an upper-body modification for suspensory locomotion?","Long arms and a scapula on the back with a long clavicle",["Ischial callosities","Prehensile tail","Bilophodont molars"],"Wide, shallow chest; shoulders point the arms outward and overhead."],
["Apes","Gibbons and siamangs are","Small (lesser) apes: acrobatic brachiators and frugivores with throat sacs",["Great apes that knuckle-walk","Old World monkeys","Strepsirrhines"],""],
["Apes","Gorillas are best described as","Knuckle-walking folivores with marked sexual dimorphism",["Solitary arboreal frugivores","Small acrobatic brachiators","Nocturnal insectivores"],"Orangutans are the solitary, arboreal frugivores."],
["Apes","Every vertebrate embryo, including humans, has a tail early on. In apes it shrinks to a tailbone. This is evidence of","A vestigial structure and common ancestry",["Convergent evolution","An analogy","Punctuated equilibrium"],""],
// Sociality
["Sociality","Which is a DISADVANTAGE of living in a social group?","Disease transmission",["Predator detection","Help with caring for young","Defense of food"],"Others: competition for food and mates, visibility to predators, social tension."],
["Sociality","More individuals in a group means a lower chance that YOU are the one caught. This is","Dilution",["Deterrence","Detection","Dispersal"],"Detection = more eyes; deterrence = mobbing or scaring a predator off."],
["Sociality","Care of young by group members other than the parents is","Allo-parenting (allo-mothering)",["Infanticide","Philopatry","Fission-fusion"],""],
["Group size","Primates whose food (like insects) is widely scattered tend to live in","Small groups",["Large groups","Fission-fusion megagroups","Multi-male troops"],"Abundant, evenly spread food like leaves supports larger groups."],
["Group size","Terrestrial, diurnal primates under high predation pressure tend to live in","Larger groups",["Solitary lives","Pairs","Groups of one female and two males"],"Small, arboreal or nocturnal primates rely on hiding instead."],
["Social organization","“Social organization ≠ mating system” means","Who lives together is not the same as who mates with whom",["All primates are monogamous","Group size never affects mating","Mating always happens outside the group"],"Orangutans live alone but mate polygynously."],
["Mating systems","One male mating with multiple females is","Polygyny",["Polyandry","Polygynandry","Monogamy"],"gyn = female."],
["Mating systems","One female mating with multiple males is","Polyandry",["Polygyny","Polygynandry","Pair bonding"],"andr = male."],
["Mating systems","Multiple males and multiple females mating within a group is","Polygynandry",["Polygyny","Polyandry","Monogamy"],""],
["Mating systems","Which primates live as one female with two adult males and practice cooperative breeding?","Marmosets and tamarins",["Gorillas and langurs","Gibbons and owl monkeys","Baboons and chimpanzees"],"Twins are the rule, so the whole group helps carry and feed infants."],
["Mating systems","Gorillas and langurs live in which type of group?","One male, multiple females (single-male polygyny)",["Pair bonds","Multi-male, multi-female","One female, multiple males"],""],
["Mating systems","Gibbons and owl monkeys live in pair bonds, but extra-pair copulations are common. Their sexual dimorphism is","Low",["High","Extreme in canines only","Reversed (females larger)"],""],
["Fission-fusion","A fission-fusion group is one that","Splits into smaller foraging parties and comes back together, with shifting membership",["Never changes membership","Is made of one male and many females","Lives alone except to mate"],"Chimpanzees (multi-male, multi-female) are the classic example."],
["Dimorphism","On this graph, which mating system shows the greatest canine AND body-weight dimorphism?","One-male, multi-female",["Pair-bonded","Multi-male, multi-female"],"More male-male competition → more dimorphism. Ratios near 1.0 = sexes the same size.","dimorph"],
["Dimorphism","On this graph, multi-male groups show higher CANINE dimorphism than BODY-WEIGHT dimorphism. Why?","Males still compete by fighting with their teeth, so big canines pay off even without huge bodies",["Females have larger canines","Pair bonds increase canine size","Canines are not related to competition"],"","dimorph"],
["Dimorphism","Sexual dimorphism in body and canine size is mainly the result of","Sexual selection from male-male competition",["Genetic drift","Artificial selection","Founder effect"],""],
["Infanticide","Infanticide is most expected when","A new male takes over a one-male group with nursing infants",["Food is abundant","Females are pair-bonded","Infants are weaned"],"Langurs are the classic example."],
["Dominance","Primate dominance hierarchies are best described as","Fluid and dynamic: ranks change with age, alliances and health",["Fixed for life at birth","Found only in males","Always decided by body size alone"],"They give priority access to food and mates and reduce constant fighting."],
["Dominance","A function of a dominance hierarchy is to","Reduce constant fighting by settling who gets priority access to resources",["Guarantee equal food for all","Prevent all mating","Replace grooming"],""],
["Altruism","Helping a relative at a cost to yourself can still spread your genes, because relatives share genes. This is","Kin selection",["Infanticide","Philopatry","Sexual selection"],"Altruism = behavior that benefits others at a cost to the actor."],
["Displays","A chimpanzee's charging display or a gorilla's chest-beating mainly serves to","Communicate strength and intimidate without actual fighting",["Attract prey","Groom other members","Build nests"],""],
["Grooming","Besides hygiene, primate grooming mainly functions to","Build and maintain social bonds and alliances, and reduce tension",["Mark territory with scent","Attract predators away","Establish infanticide"],""],
["Play","Play in young primates matters because it","Lets them practice physical and social skills they will need as adults",["Has no function","Only happens in captivity","Replaces learning from adults"],""],
["Learning","Why is the social environment so important for primate learning?","Long juvenile periods let young learn skills and behaviors by watching group members",["Primates are born knowing everything they need","Learning only happens alone","Only humans learn socially"],""],
["Tool use","Which pairing of primate and tool use is correct?","Capuchins: cracking nuts with stones on rock anvils",["Lemurs: termite fishing with twigs","Gibbons: digging with sticks","Gorillas: cracking nuts with stones in Madagascar"],"Chimps fish for termites (Jane Goodall's famous finding)."],
["Culture","In primates, “culture” refers to","Learned behaviors passed on socially that differ between groups of the same species",["Instincts shared by every member of a species","Behaviors found only in humans","Physical traits inherited genetically"],"E.g., Japanese macaques washing sweet potatoes; chimp tool traditions that vary by community."],
["Field researchers","Match the researcher to the primate: Jane Goodall studied","Chimpanzees",["Gorillas","Orangutans","Baboons"],"Dian Fossey = gorillas; Biruté Galdikas = orangutans; Washburn & DeVore = baboons."],
["Field researchers","Biruté Galdikas is known for studying","Orangutans",["Chimpanzees","Gorillas","Japanese macaques"],""],
["Behavior","Members of the same species are called","Conspecifics",["Sympatric species","Congeners only","Allopatric populations"],""]
];

// ===== Activity 4 (Brightspace): Life in Trees film. 7th item = the subject tab it belongs to.
const LT = [
["Activity 4 · Q1","David Attenborough (the narrator) explains that a successful life in the trees requires these characteristics:","Forward-facing (convergent) eyes and prehensile hands",["Long tails and a cat-like disposition","Colorless fur and laterally positioned eyes","A specialized diet of only leaves and long tails","Claws instead of nails and laterally facing eyes"],"Judging distance between branches needs overlapping (binocular) vision, and holding on needs grasping hands.","","Primate features & distribution"],
["Activity 4 · Q2","The locomotor behavior of the ring-tailed lemur of Madagascar (Lemur catta) is characterized by","Being both terrestrial and arboreal",["Being aquatic and arboreal","Being exclusively arboreal","Spending most of its time underground in caves","Enjoying how to “move-it, move-it”"],"Ring-tailed lemurs spend a lot of time on the ground as well as in trees, unusual for a lemur.","","Primate taxonomy"],
["Activity 4 · Q3","Ring-tailed lemur males and females have spurs on their wrists and under their tails, surrounded by glands that","Are important for scent-marking",["Secrete a sticky liquid that helps them climb trees","Are important for aggressively high-fiving","Secrete toxins to protect their infants from predators","Secrete a toxin that protects tree branches from molding"],"Strepsirrhines rely heavily on smell. Males also rub scent on their tails for “stink fights”.","","Primate taxonomy"],
["Activity 4 · Q4","The sifaka's (Propithecus verreauxi) leaping from tree limb to tree limb is made possible by","Disproportionately long hind limbs relative to forelimbs",["Their large, complex brains","Disproportionately long forelimbs relative to hind limbs","Their elongated tails","Their small body size"],"Long, powerful legs drive vertical clinging and leaping.","","Primate taxonomy"],
["Activity 4 · Q5","According to the film, indri (Indri indri) use vocalizations to","Claim territory and communicate with conspecifics",["Annoy predators and humans alike","Help their lungs develop and expand","Pay respects to family members who have passed away","Find mates, like bird courtship songs"],"Conspecifics = members of the same species.","","Primate sociality"],
["Activity 4 · Q6","The smallest of all lemurs is nocturnal and called","A mouse lemur",["A pinky lemur","A pygmy lemur","A mini-lemur","A night-watch lemur"],"","","Primate taxonomy"],
["Activity 4 · Q7","The aye-aye (Daubentonia madagascariensis) reaches grubs and egg yolk in trees by","Using its elongated, bony third finger as a probe",["Fashioning twigs into tools to probe into trees","Breaking into trees with the strength of its grasping hands","Using scent-marking to fend off competitors","Using its vision and sense of smell to locate them"],"One of the aye-aye's highly derived traits, along with ever-growing incisors.","","Primate taxonomy"],
["Activity 4 · Q8","The dominant sense of the tarsier (genus Tarsius) is","Vision",["Taste","Touch","Hearing","Smell"],"Each eye is as large as its brain; tarsiers lack a tapetum lucidum, so they rely on sheer eye size at night.","","Primate taxonomy"],
["Activity 4 · Q9","New World marmosets are diurnal and therefore should rely heavily on","Visual cues",["Aquatic resources","Dancing abilities to find mates","Vocalizations","Making tools to access resources"],"Diurnal primates rely on vision, including color vision.","","Primate features & distribution"],
["Activity 4 · Q10","Marmosets mark territories, especially highly prized gum trees, through","Urine marking",["Strength and force","Forming large armies to protect their trees","Fashioning barbed wire","Scent-gland marking from their wrists and tails"],"Scent glands on the wrists and tail describe the ring-tailed lemur, not marmosets.","","Primate sociality"],
["Activity 4 · Q11","Howler monkeys of the New World (genus Alouatta), despite their large body size, move well through the forest canopy thanks to their","Prehensile tails",["Long hind limbs relative to forelimbs, for leaping between trees","Long forelimbs relative to hind limbs, for swinging from tree to tree","Ability to make loud vocalizations","Ability to build bridges out of tree branches"],"A grasping tail works as a fifth limb. Only some New World monkeys have one.","","Primate taxonomy"],
["Activity 4 · Q12","Vervet monkeys (Chlorocebus pygerythrus) of Africa spend their time","Terrestrially",["Swimming","Living a nocturnal life","In caves","Arboreally"],"Vervets are Old World monkeys that spend much of their day on the ground, though they climb to feed and sleep.","","Primate taxonomy"],
["Activity 4 · Q13","Baboon (genus Papio) diets are made up of","All of these: fruits, leaves, roots, lizards and rodents",["Fruits only","Leaves only","Roots only","Lizards and rodents only"],"Baboons are omnivores, like other cheek-pouch monkeys (cercopithecines).","","Primate taxonomy"],
["Activity 4 · Q14","Displays baboons use to threaten conspecifics include","Eyebrow flashing",["Urine-marking","No displays; baboons always cooperate","Scent-gland marking","Loud vocalizations"],"Raising the brows flashes the pale eyelids: a threat that can head off a real fight.","","Primate sociality"],
["Activity 4 · Q15","Besides their dense fur, Japanese macaques (Macaca fuscata) deal with the cold by","Sitting in hot springs",["Making fire","Migrating to beaches in the coldest months","Hibernating in the coldest months","Fashioning clothing"],"The “snow monkeys” are the most northern non-human primate.","","Primate sociality"],
["Activity 4 · Q16","A behavior among the Koshima macaques that can be interpreted as culture (knowledge passed between generations without genetic involvement) is","Throwing unhusked rice and sand into sea water and skimming the rice off the top to eat",["Eating sweet potatoes","Living on the beaches of Koshima","Spending time in the hot springs","Picking unhusked rice from sand one grain at a time"],"An invented technique that spread through the group by learning, like their sweet-potato washing.","","Primate sociality"],
["Activity 4 · Q17","In general, apes are characterized by","Lack of a tail",["Small body size relative to other primates","Larger female body size compared to males","A weak hand and foot grip","Being nocturnal"],"","","Primate taxonomy"],
["Activity 4 · Q18","Gibbons, a kind of “lesser ape” (genus Hylobates), live an acrobatic lifestyle","Although there is evidence of many skeletal fractures",["And are so skilled that they rarely show fractures","Despite having short fingers and arms","Despite having large body sizes","And use their tails to move through the canopy"],"Brachiating at speed has a cost: many gibbon skeletons show healed fractures from falls.","","Primate taxonomy"],
["Activity 4 · Q19","Gorilla (genus Gorilla) social groups are made up of","A silverback male, females and their offspring",["Multiple males of different ranks (silverback and bachelor males), females and offspring","Multiple silverback males, females and their offspring","Just offspring; adults live apart from them","A silverback male and his offspring; females leave the group"],"One male, multiple females (single-male polygyny), with high sexual dimorphism.","","Primate sociality"],
["Activity 4 · Q20","A major social activity among gorillas is","Grooming",["Fending off documentarians whispering at video cameras","Marking territories with scent glands","Dancing","Climbing trees"],"Grooming builds and maintains social bonds.","","Primate sociality"],
["Activity 4 · Q21","Unlike gorillas, chimpanzees (genus Pan) spend a lot of time living both on the ground and in trees, flexible behavior aided by their","Grasping hands and feet",["Retention of a prehensile tail","Better visual acuity","Intelligence","Long hind limbs relative to forelimbs, for leaping through the canopy"],"Prehensile hands and feet (opposable thumbs and big toes) work on the ground and in the branches.","","Primate features & distribution"],
["Activity 4 · Q22","Unlike lemurs and other strepsirrhines, chimpanzees recognize conspecifics by","The distinct facial differences between individuals",["Touching one another's faces","Urine-markings","Smelling each other's fur","Scent-markings from body glands"],"Haplorrhines rely on vision more than smell; strepsirrhines lean on scent.","","Primate features & distribution"],
["Activity 4 · Q23","Chimpanzee infants remain dependent and under their mothers' care","For at least 5 years after birth",["Until the infant leaves the troop on its own","For only a few days, then the infant is given to another troop","For a few months after birth","For over 20 years after birth"],"Extended ontogeny: apes have the longest development of non-human primates.","","Primate features & distribution"],
["Activity 4 · Q24","______ is the social “cement” of a chimpanzee troop, an important means of bonding to form alliances and keep friendships.","Grooming",["Wrestling","Infant suckling","Infant clinging","Dancing"],"","","Primate sociality"],
["Activity 4 · Q25","Besides climbing trees, the manual dexterity of chimpanzees (and some other non-human primates) lets them","Fashion tools, such as sticks for termite fishing",["Have fist-fights over territorial space","Make phone calls in an emergency","Clasp hands with others to forge alliances","Clap their hands to signal contentment"],"Jane Goodall's famous finding: chimps make and use tools.","","Primate sociality"]
];

const DATA = { TH, A5, CH, WS, PR, LT };

// ===== Topics for the Progress tab (match the study guide's sections)
// A new question gets its topic from its tag. Tags not listed fall back to the tab's name.
const TOPIC2 = {
  "Macroevolution & speciation": ["Speciation: crayfish","Speciation: squirrels","Human influence","Species concepts","Pace of change","Modes of speciation","Types of speciation","Extinction"],
  "Phylogeny": ["Phylogeny"],
  "Primate features & distribution": ["Protoprimate","Distribution","Arboreal heritage","Teeth","Dental formula","Primate ontogeny","Timing","Why primates","Primate features"],
  "Primate taxonomy": ["Suborders","Strepsirrhine traits","Strep characteristics","Strep skull","Lemurs","Prosimian","Haplorrhines","NWM","Colobines","Hominoids","Hominoid locomotion","Longest ontogeny","Strepsirrhines","Tarsiers","Anthropoids","NWM vs OWM","OWM","Apes"],
  "Primate sociality": ["Field studies","Predation","Dispersal","Social & mating system","Infanticide","Sociality","Group size","Social organization","Mating systems","Fission-fusion","Dimorphism","Dominance","Altruism","Displays","Grooming","Play","Learning","Tool use","Culture","Field researchers","Behavior"],
  "Chimps vs. bonobos": ["Chimps and bonobos"]
};
const DECK_TOPIC = { A5: "Picture ID", CH: "Primate taxonomy", WS: "Chimps vs. bonobos" };
const TAG_TOPIC = {};
for (const t in TOPIC2) for (const tag of TOPIC2[t]) TAG_TOPIC[tag] = t;

// ===== Build the bank the app reads
const Q = {}, IDS = {};
for (const d in DECKS) {
  IDS[d] = [];
  (DATA[d] || []).forEach((r, n) => {
    const id = d + n;
    Q[id] = { d, tag: r[0], q: r[1], ok: r[2], wrong: r[3], ex: r[4] || "", img: r[5] && FIG[r[5]] ? FIG[r[5]] : null,
      topic: r[6] || (r[0] === "Image ID" ? "Picture ID" : DECK_TOPIC[d] || TAG_TOPIC[r[0]] || DECKS[d].name) };
    IDS[d].push(id);
  });
}
// Origin labels shown on each question
DECKS.TH.src = "Top Hat (lecture)"; DECKS.A5.src = "Brightspace Activity 5"; DECKS.CH.src = "Primate Classification worksheet"; DECKS.WS.src = "“Why Sex” film worksheet"; DECKS.LT.src = "Brightspace Activity 4 (Life in Trees film)"; DECKS.PR.src = "Practice, from the study guide";
// Subject tabs, in study-guide order
const SUBJECTS2 = [
  { name: "Macroevolution & speciation", short: "Speciation", sub: "Species concepts, gradualism vs. punctuated equilibrium, modes and types of speciation, extinction." },
  { name: "Phylogeny", short: "Phylogeny", sub: "Systematics, ancestral vs. derived homology, analogy and convergent evolution." },
  { name: "Primate features & distribution", short: "Primate traits", sub: "Mammalian radiation, what defines a primate, teeth, vision, brains, life history, where primates live." },
  { name: "Primate taxonomy", short: "Taxonomy", sub: "Suborder, infraorder and superfamily traits, and the Primate Classification chart." },
  { name: "Picture ID", short: "Picture ID", sub: "Identify the taxon from skulls, teeth, hands, tails and behavior. Answer at the closest level the feature allows." },
  { name: "Primate sociality", short: "Sociality", sub: "Group living, social structures, mating systems, dimorphism, dominance, grooming, tool use and culture." },
  { name: "Chimps vs. bonobos", short: "Chimps & bonobos", sub: "The “Why Sex” film: chimpanzee and bonobo societies. Exam questions are drawn from the worksheet." }
];
window.BANK = { title: "Anthro Exam 2 Drill", storageKey: "ant2-progress-v1", decks: DECKS, ids: IDS, q: Q, textOnly: true, topics: SUBJECTS2 };
