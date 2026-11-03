# Anthro Drills

Multiple-choice study drills for **ANTH 102: Introduction to Human Evolution**. They're built from the course's Top Hat questions, Brightspace activities and lecture slides.

| Drill | Folder | Tabs |
|---|---|---|
| Exam 1 | `exam1/` | Top Hat · Review · Anthro-pardy · Sequences · People (220 questions) |
| Exam 2 | `exam2/` | Top Hat · Activity 5 · Chart · Why Sex · Practice (161 questions) |

Everything is plain static HTML, CSS and JavaScript. There's no build step and no server code, and progress is saved in each visitor's own browser (`localStorage`).

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

- **Append new questions to the end of a deck** (`TH`, `A5`, `CH`, `WS`, `PR`). Progress is stored by position, so inserting in the middle would shift people's saved history onto the wrong questions.
- To attach a picture, put the file in `exam2/img/`, add an entry to `FIG` at the top of the file, and use its key as the sixth item.
- To add a whole new tab, add an entry to `DECKS`, a new array, and include it in `DATA` at the bottom.

## Publish it (GitHub Pages)

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
