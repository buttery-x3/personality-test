# Manyfold

One original, interconnected personality survey with six perspectives. Built with SvelteKit 2, Svelte 5, TypeScript, and Vite. Runs entirely locally, with a static production build and no runtime APIs, accounts, analytics, remote fonts, or cloud services.

## Run locally

Use Node.js **22.12+** (Node 24 is also supported) and npm.

```powershell
cd D:\dev\personality-test
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. Keep the terminal running; press Ctrl+C to stop. If that port is occupied, Vite prints the alternative URL. Use the same browser, hostname, and port to retain access to your saved history; localStorage is specific to that origin.

For a production build:

```powershell
npm run build
npm run preview
```

Open **http://127.0.0.1:4173**. `build/` contains the static site and can also be served by a local static HTTP server. Do not open the HTML directly with `file://`. The preview and development ports have separate local histories.

## Production deployment

The live site is **https://buttery.wtf/personality/**, listed on the buttery project page as **manyfold personality test**. The repository is [buttery-x3/personality-test](https://github.com/buttery-x3/personality-test).

After committing and pushing updates to `main`, run this from your local PowerShell terminal:

```powershell
ssh hetzner-server "sudo -iu flamehorn bash /home/flamehorn/personality-test/deploy.sh"
```

Or, when logged into the server as `flamehorn`:

```bash
cd /home/flamehorn/personality-test
./deploy.sh
# Equivalent: npm run deploy:production
```

The script pulls `main`, installs locked dependencies, runs checks/tests, builds for `/personality`, publishes the static files, reloads the `personality-test` PM2 process, verifies its HTTP response, and saves PM2's process list for reboots. It stages the build before publishing and keeps older hashed assets available for visitors with an open page. It refuses concurrent deployments, the wrong Unix user, a non-`main` branch, or tracked local edits.

See [deployment details](docs/DEPLOYMENT.md) for the Caddy route, hub registration, runtime settings, and troubleshooting.

## What is implemented

- 72 original, naturally mixed questions with **533 unequal weighted mappings** across **36 dimensions**.
- Big Five (including positive-direction Emotional Stability), Jungian / 16-type, all nine Enneagram themes with conditional adjacent wing, DISC blends, Holland / RIASEC top-three code, and recreational Hogwarts affinities.
- One question at a time, both agreement and interest response labels, progress, keyboard shortcuts 1–5, Back, revisions, pause, save/exit, resume, and restart confirmation. No live scores during the survey.
- Completed local result history, meaningful interpretations, all dimension scores, and transparent tie handling.
- Per-dimension inspection of raw and normalized scores, capacities, answers, endpoint weights, individual contributions, and mapping rationales.
- Per-visit timing, first selections, submissions, revisions, and returns; hidden-tab and explicit-pause time are excluded. Reload/crash interruptions are flagged.
- Descriptive timing statistics and concrete-item baselines, completely separate from personality scoring.
- Versioned JSON exports including the entire question/weight snapshot, answers, scoring output, raw timings, summary statistics, and completion timestamp. No identifiers are collected.
- Responsive layouts, native accessible radio controls, visible keyboard focus, reduced-motion support, and a print stylesheet.
- Local data removal with confirmation; corrupt/incompatible session recovery and storage-error feedback.

## Checks

```powershell
npm run check
npm test
npm run validate:coverage
npm run build
```

The automated tests cover positive/reverse/asymmetric mappings, neutral responses, normalization, unequal coverage, missing answers, revised answers, Jungian balances, Enneagram wings/ties, DISC blends, RIASEC codes, house ranking, coverage validation, timing pauses/revisits/interruption, result snapshots, and persistence failures.

The developer view under **The method → Developer view** shows the same coverage report plus every question, its rationale, topic tags, and mappings. The CLI exits nonzero for invalid definitions and prints warnings for weak or unbalanced coverage.

## Scoring model

Responses are `-1`, `-0.5`, `0`, `0.5`, `1`. A numeric mapping is symmetric. A tuple in the question bank means `[agreement endpoint, disagreement endpoint]`, so `[0.55, -0.15]` produces +0.55 on strong agreement and −0.15 on strong disagreement. Negative responses use their absolute magnitude multiplied by the negative-response endpoint; that endpoint can itself be positive for reverse mappings.

For every dimension, sum the evidence into `raw`. Across **all presented questions**, sum `max(0, agreeEndpoint, disagreeEndpoint)` into positive capacity and `-min(0, agreeEndpoint, disagreeEndpoint)` into negative capacity.

```text
score = 50 + 50 × raw / (raw >= 0 ? positiveCapacity : negativeCapacity)
```

Zero evidence or unavailable capacity gives 50. Values are bounded to 0–100. This piecewise scaling preserves a neutral midpoint even with asymmetric evidence, and removes the automatic advantage of more mappings. Missing answers add zero evidence but retain their capacity in the denominator. Completion requires an answer to every question; neutral/unsure is legitimate. Normalization does **not** equalize measurement reliability or make these population percentiles.

Jungian poles are normalized separately. An axis uses `(100 + leftScore - rightScore) / 2` for the left balance and the complementary right balance. Exact ties use `X`; balances within 5 points of the midpoint are marked tentative. Enneagram selects the strongest normalized theme; a wing must be adjacent, uniquely stronger than the other neighbour, and above 50, with a clear primary. DISC includes a second style when it is above 50 and no more than 12 points behind the leader. RIASEC selects three normalized interests. Exact category ties are deterministic by framework order and disclosed in the UI.

## Timing and local storage

The injected-clock `TimingRecorder` records wall-clock timestamps and accumulated visible time per visit. Pre-selection attention across return visits is summed without counting time spent elsewhere. The first selection remains the baseline even after an answer is revised. Hidden/paused intervals are retained separately. An interrupted open visit is invalidated on recovery, never filled in using offline elapsed time. Explicit page exit closes the visit normally.

The timing section uses the user's own first-response median, mean, population variance, standard deviation, extremes, and ratios. Responses below half or above twice the median are simply descriptive flags. Device sleep, clock changes, interruptions while still visible, question length, reading speed, and distractions can affect observations; there is no psychological interpretation or timing adjustment to scores.

Data lives under `manyfold.local.v1`. The repository interface isolates storage so it can later be replaced. A storage event from another tab returns a stale view to Home to avoid continuing from outdated answers. Quota or blocked-storage errors leave in-memory results usable and offer JSON export. Browser data clearing can erase local history; exports are the durable copy.

`SURVEY_VERSION` identifies questions and weights; `SCORING_VERSION` identifies normalization/ranking rules. Change the corresponding version when changing definitions or logic. Completed results retain original questions, weights, outputs, and versions; they are displayed as saved, never rescored silently. In-progress sessions with a mismatched bank are rejected with a notice.

## Project map

```text
src/lib/data/          Original questions, mappings, framework definitions
src/lib/engine/        Pure scoring, normalization, coverage audit, scoring tests
src/lib/session/       Timing, sessions, persistence, session tests
src/lib/components/    Survey, result cards, timing view, inspector, method
src/lib/interpretation.ts  Plain-English result interpretations
src/lib/types.ts       Shared types and saved/exported schema
src/routes/+page.svelte    App navigation and orchestration
src/app.css           Responsive visual design
scripts/validate-coverage.ts
```

## Interpretation limits

This is a finished experimental MVP, not a validated psychometric instrument. Questions and mappings are original, judgment-based hypotheses. The frameworks differ substantially in scientific support and purpose; shared mappings create dependence between results. Big Five is a trait lens, RIASEC is an interest lens, several others are popular personality systems, and Hogwarts is recreational. Nothing here is an official MBTI, DISC, Enneagram, or Wizarding World assessment. The application explains these distinctions accessibly in its method and results views.
