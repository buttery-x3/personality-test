<script lang="ts">
  import { questions, SURVEY_VERSION } from '../data/questions';
  import { validateCoverage } from '../engine/coverage';
  import { frameworks } from '../data/frameworks';
  import AboutResults from './AboutResults.svelte';
  let { back }: { back: () => void } = $props();
  const coverage = validateCoverage(questions);
</script>

<section class="method-page">
  <button class="text-button" onclick={back}>← Back to your exploration</button>
  <div class="method-hero">
    <span class="eyebrow">THE THINKING BEHIND MANYFOLD</span>
    <h1>One answer.<br /><em>Several threads.</em></h1>
    <p>
      A question about fixing something might tell us about practical interests, curiosity, and a
      preference for analysis. We follow those connections, with a different weight for each one.
    </p>
  </div>
  <div class="method-steps">
    <article>
      <span>01</span>
      <h3>A shared question bank</h3>
      <p>
        {questions.length} original questions mix behaviour, motivation, interests, and everyday choices.
        They are deliberately interleaved, so you experience one survey.
      </p>
    </article>
    <article>
      <span>02</span>
      <h3>Weighted evidence</h3>
      <p>
        Each response ranges from −1 to +1 and contributes to several dimensions. Some mappings are
        asymmetric: liking an activity may tell us more than disliking it.
      </p>
    </article>
    <article>
      <span>03</span>
      <h3>A fairer scale</h3>
      <p>
        Every dimension is normalised by its possible positive and negative evidence. More mappings
        do not automatically make a category score higher.
      </p>
    </article>
  </div>
  <section class="plain-panel method-example">
    <span class="eyebrow">A CONNECTION IN PRACTICE</span>
    <h2>“Figuring out why an unfamiliar device has stopped working.”</h2>
    <p>
      Strongly liking this activity adds <b>+1.00 Investigative</b>, <b>+0.70 Realistic</b>,
      <b>+0.35 Openness</b>, and smaller contributions to analytical preferences, knowledge-seeking,
      accuracy, and curiosity. Strong dislike is weaker negative evidence for the two interests:
      −0.45 and −0.30.
    </p>
    <p class="detail-note">
      The weights are explicit design judgments, not correlations estimated from a research dataset.
      The full matrix is available below and in each result’s calculation view.
    </p>
  </section>
  <AboutResults />
  <section class="method-details">
    <h2>The details, if you’re curious.</h2>
    <details>
      <summary>Normalisation, missing answers, and ties <span>+</span></summary>
      <div>
        <p>
          Each dimension sums its weighted answer contributions. Positive capacity is the sum of the
          largest positive endpoint for every presented question; negative capacity is the magnitude
          of the sum of the smallest negative endpoint. Neutral is included as a possible zero
          endpoint.
        </p>
        <code>score = 50 + 50 × raw / (raw ≥ 0 ? positiveCapacity : negativeCapacity)</code>
        <p>
          A zero total or unavailable capacity gives 50. Scores are bounded to 0–100. A neutral or
          unanswered item contributes zero, while its potential capacity remains in the denominator.
          Completion requires every question to have an answer; “unsure” is a valid response. These
          scores are not percentiles, percentages of personality, or confidence estimates.
        </p>
        <p>
          Jungian axes compare the separately normalised poles: left balance = (100 + left score −
          right score) / 2. Exact ties use X instead of an arbitrary letter. Enneagram wings use
          only adjacent types and require a distinct score above 50. DISC adds a secondary style
          when it is above 50 and within 12 points of the leader. RIASEC returns the top three
          normalised interests. Exact ranking ties use framework display order and are explicitly
          noted in results.
        </p>
        <p>
          Normalisation corrects score capacity, not measurement reliability. Cross-framework reuse
          is an assumption to investigate, not evidence that the models agree independently.
        </p>
      </div>
    </details>
    <details>
      <summary>What response timing does (and doesn’t) tell us <span>+</span></summary>
      <div>
        <p>
          The app records question activation, first selection, submission, answer revisions, and
          each return visit. Only visible, unpaused time counts. Explicit pauses and hidden-tab
          intervals are excluded; a visit interrupted by a reload or crash is flagged and its first
          response excluded from summary statistics.
        </p>
        <p>
          Timing summaries use the first selection, not later revisions. Each latency is compared
          with your own median. The mean, population variance, standard deviation, fastest and
          slowest responses are available in the result and export. Several concrete items provide
          an exploratory baseline. No timing value affects any framework score, and no personality
          meaning is inferred from speed.
        </p>
      </div>
    </details>
    <details>
      <summary>Your data, saved locally <span>+</span></summary>
      <div>
        <p>
          Unfinished progress and completed results are stored in this browser’s localStorage. There
          are no accounts, analytics, external fonts, API calls, or cloud storage. Browser data
          clearing or private-browsing limits can remove that history. A JSON export preserves
          answers, timestamps, timings, all scoring contributions, the survey version, and a
          snapshot of the questions and weights.
        </p>
        <p>
          Starting again replaces unfinished progress but keeps completed results. “Clear local
          data” in the footer removes Manyfold’s saved data after confirmation. Future survey
          versions will not silently reinterpret older completed results.
        </p>
      </div>
    </details>
    <details class="coverage-details">
      <summary>Developer view: question coverage and full bank <span>+</span></summary>
      <div>
        <p>
          <b>{SURVEY_VERSION}</b> · {coverage.questions} questions · {coverage.mappings} mappings · {frameworks.length}
          frameworks · {coverage.rows.length} dimensions
        </p>
        <p class="validation-status">
          {coverage.errors.length} definition errors · {coverage.warnings.length} coverage warnings
        </p>
        <p class="detail-note">
          Warnings flag fewer than 6 mapped questions, total capacity below 4, a single-dimension
          question, zero mappings, or a greater than 2.5× difference in peer capacities. This is a
          structural audit, not psychometric validation.
        </p>
        {#each [...coverage.errors, ...coverage.warnings] as warning}<p>{warning}</p>{/each}
        <div class="table-scroll">
          <table>
            <thead
              ><tr
                ><th>Dimension</th><th>Questions</th><th>Positive capacity</th><th
                  >Negative capacity</th
                ><th>Total capacity</th></tr
              ></thead
            ><tbody
              >{#each coverage.rows as row}<tr
                  ><td>{row.dimension} · {row.label}</td><td>{row.questions}</td><td
                    >{row.positive.toFixed(2)}</td
                  ><td>{row.negative.toFixed(2)}</td><td>{row.total.toFixed(2)}</td></tr
                >{/each}</tbody
            >
          </table>
        </div>
        <div class="question-bank">
          {#each questions as q}<details>
              <summary><span><b>{q.id}</b> {q.text}</span></summary>
              <p>{q.rationale}</p>
              <div class="mapping-chips">
                {#each q.mappings as m}<span
                    ><b>{m.dimension}</b>
                    {m.agreeWeight} / {m.disagreeWeight ?? -m.agreeWeight}</span
                  >{/each}
              </div>
              <p class="detail-note">
                Topics: {q.tags.join(', ')} · {q.text.length} characters{q.baseline
                  ? ' · concrete baseline item'
                  : ''}
              </p>
            </details>{/each}
        </div>
      </div>
    </details>
  </section>
</section>
