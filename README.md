# Anthro Drills

Multiple-choice study drills for **ANTH 102: Introduction to Human Evolution**. They're built from the course's Top Hat questions, Brightspace activities and lecture slides.

| Drill | Folder | Subject tabs |
|---|---|---|
| Exam 1 | `exam1/` | Science · Natural selection · Scientists · Cells & DNA · Protein synthesis · Genetics · Forces of evolution (192 questions) |
| Exam 2 | `exam2/` | Speciation · Phylogeny · Primate traits · Taxonomy · Picture ID · Sociality · Chimps & bonobos (161 questions) |

Each drill also has a **Mixed** tab and a **Progress** tab. Tabs group questions by subject; a small label on each question shows its source (Top Hat, Activity 5, a worksheet, practice).

Everything is plain static HTML, CSS and JavaScript, with no build step and no server code.

## How progress is saved

Each student's progress is saved **in their own browser, on the device they study on** (`localStorage`). Nothing is sent to a server, there are no accounts, and classmates never see each other's data.

- Every answer is recorded per question: how many times it was tried and how many times it was right.
- The **Progress** tab in each drill shows overall accuracy, accuracy by topic (weakest first), strongest and weakest areas, and the most-missed questions. Each row has a **Practice** button that starts a focused round.
- Exam 1 and Exam 2 keep separate histories (`ant1-progress-v2` and `ant2-progress-v1`).
- History doesn't move between devices or browsers, and it's erased if the student clears their browser data. Safari can also clear it after about 7 days without a visit.

## Project layout

```
index.html            landing page
assets/drill.css      shared styles
assets/drill.js       shared app: rounds, scoring, saved progress, Progress tab
exam1/questions.js    Exam 1 questions and topics
exam2/questions.js    Exam 2 questions and topics
exam*/index.html      page shell for each drill
exam*/img/            question figures
```

## Run it locally

Opening `index.html` directly works, but a local server is closer to the real site:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Add questions to Exam 2

All Exam 2 questions live in `exam2/questions.js`. Each question is one line:

```js
["Tag shown above the question", "Question text?", "Correct answer", ["Wrong 1", "Wrong 2", "Wrong 3"], "Optional explanation", "optionalFigureKey"],
```

- **Append new questions to the end of a source list** (`TH`, `A5`, `CH`, `WS`, `PR`); the source becomes the question's origin label. Progress is stored by position, so inserting in the middle would shift people's saved history onto the wrong questions.
- To attach a picture, put the file in `exam2/img/`, add an entry to `FIG` at the top of the file, and use its key as the sixth item.
- The question's **subject tab** (also used on the Progress tab) comes from its tag, through the `TOPIC2` lists near the bottom of the file. A tag that isn't listed falls back to the tab's name, so add new tags to the right topic.
- To add a whole new tab, add an entry to `DECKS`, a new array, and include it in `DATA`.

## Publish it on Vercel

1. Push this folder to a GitHub repository (see the first two steps below).
2. On <https://vercel.com/new>, import the repository.
3. Set **Framework Preset** to **Other**, leave **Build Command** empty, and leave **Output Directory** as the project root.
4. Deploy. Vercel gives you a link like `https://anthro-drills.vercel.app` to share. Every later push redeploys automatically.

You can also deploy straight from this folder, without GitHub:

```bash
npx vercel --prod
```

## Publish it on GitHub Pages

1. Create an empty repository on GitHub, for example `anthro-drills`.
2. Push this folder:

   ```bash
   git remote add origin https://github.com/<your-username>/anthro-drills.git
   ```

   ```bash
   git push -u origin main
   ```

3. On GitHub, go to **Settings → Pages**. Under **Build and deployment**, pick **Deploy from a branch**, then select `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://<your-username>.github.io/anthro-drills/`. Share that link.

Netlify and Cloudflare Pages also work: point either one at the repository with no build command and the publish directory set to `/`.

## A note on content

The question figures are cropped from course slides and screenshots. They're shared here as a study aid for classmates and aren't official course material.
