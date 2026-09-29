<script lang="ts">
  import { dimensionById, frameworks } from '../data/frameworks';
  import type { CompletedResult, DimensionId } from '../types';
  let { result }: { result: CompletedResult } = $props();
  let selected = $state<DimensionId>('big5.O');
  const score = $derived(result.scoring.dimensions[selected]);
  const fixed = (v: number) => v.toFixed(3).replace(/\.?0+$/, '');
  const signed = (v: number) => (v > 0 ? '+' + fixed(v) : fixed(v));
</script>

<section class="inspector">
  <div class="panel-heading">
    <span class="pill">OPEN BY DESIGN</span>
    <h2>Follow the evidence.</h2>
    <p>
      Every answer becomes a small piece of evidence. Pick a dimension to see the exact
      contributions, endpoints, and reasoning behind its score.
    </p>
  </div>
  <div class="inspector-controls">
    <label for="dimension-picker">Explore a dimension</label><select
      id="dimension-picker"
      bind:value={selected}
      >{#each frameworks as framework}<optgroup label={framework.name}
          >{#each framework.dimensions as d}<option value={d.id}
              >{d.label}{framework.id === 'enneagram' ? ` (${d.short})` : ''}</option
            >{/each}</optgroup
        >{/each}</select
    >
  </div>
  <div class="timing-stats inspector-stats">
    {#each [['Survey score', score.normalized.toFixed(2)], ['Raw evidence', signed(score.raw)], ['Positive capacity', fixed(score.positiveCapacity)], ['Negative capacity', fixed(score.negativeCapacity)]] as stat}<div
        class="stat-card"
      >
        <span>{stat[0]}</span><strong>{stat[1]}</strong>
      </div>{/each}
  </div>
  <div class="calculation-note">
    <strong>{dimensionById[selected].label}</strong>
    <p>{dimensionById[selected].description}</p>
    <code
      >50 + 50 × ({fixed(score.raw)} ÷ {fixed(
        score.raw >= 0 ? score.positiveCapacity : score.negativeCapacity
      )}) = {score.normalized.toFixed(2)}</code
    >
    <p>
      The denominator is the positive capacity when the raw total is positive, and the magnitude of
      negative capacity when it is negative. Zero evidence stays at 50. These are survey scores, not
      population percentiles.
    </p>
  </div>
  <div class="table-heading">
    <h3>Question contributions</h3>
    <span>{score.answeredQuestions} / {score.mappedQuestions} mapped questions answered</span>
  </div>
  <div class="table-scroll">
    <table class="contribution-table">
      <thead
        ><tr
          ><th>Question & mapping rationale</th><th>Your answer</th><th>Agree endpoint</th><th
            >Disagree endpoint</th
          ><th>Evidence</th></tr
        ></thead
      ><tbody>
        {#each score.contributions as c}{@const q = result.questions.find(
            (q) => q.id === c.questionId
          )}
          <tr
            ><td
              ><span class="eyebrow">{c.questionId.toUpperCase()}</span>
              <p>{q?.text}</p>
              <details>
                <summary>Why these mappings?</summary>
                <p>{q?.rationale}</p>
                <div class="mapping-chips">
                  {#each q?.mappings ?? [] as m}<span
                      ><b>{m.dimension}</b>
                      {signed(m.agreeWeight)} / {signed(m.disagreeWeight ?? -m.agreeWeight)}</span
                    >{/each}
                </div>
              </details></td
            ><td>{c.answer === null ? 'Unanswered' : signed(c.answer)}</td><td
              >{signed(c.agreeWeight)}</td
            ><td>{signed(c.disagreeWeight)}</td><td><strong>{signed(c.contribution)}</strong></td
            ></tr
          >
        {/each}
      </tbody>
    </table>
  </div>
  <p class="detail-note">
    For a positive response, evidence = answer × agree endpoint. For a negative response, evidence =
    |answer| × disagree endpoint. A neutral or missing answer contributes zero. Capacities use all
    questions in this result’s saved bank. Response timing is never part of this calculation.
  </p>
</section>
