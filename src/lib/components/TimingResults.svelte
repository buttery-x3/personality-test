<script lang="ts">
  import type { CompletedResult, TimingObservation } from '../types';
  import { summarizeTiming } from '../session/timing';
  let { result }: { result: CompletedResult } = $props();
  const s = $derived(result.timingSummary);
  const baseline = $derived(
    summarizeTiming(
      Object.fromEntries(
        Object.entries(result.timing).filter(
          ([id]) => result.questions.find((q) => q.id === id)?.baseline
        )
      )
    )
  );
  const seconds = (ms: number | null) => (ms === null ? '—' : `${(ms / 1000).toFixed(1)}s`);
  const question = (id: string) => result.questions.find((q) => q.id === id);
  const multiplier = (o: TimingObservation) =>
    o.relativeToMedian === null
      ? 'No usable baseline'
      : `${o.relativeToMedian.toFixed(2)}× your median`;
</script>

<section class="timing-section">
  <div class="panel-heading">
    <span class="pill">EXPERIMENTAL NOTES</span>
    <h2>A little about your pace.</h2>
    <p>
      These are observations of this session. Reading speed, interruptions, device, and familiarity
      all affect response time. Timing never changes your personality scores.
    </p>
  </div>
  <div class="timing-stats">
    {#each [['Median first response', seconds(s.medianMs)], ['Mean first response', seconds(s.meanMs)], ['Standard deviation', seconds(s.standardDeviationMs)], ['Usable first responses', `${s.count} / ${result.questionIds.length}`]] as stat}
      <div class="stat-card"><span>{stat[0]}</span><strong>{stat[1]}</strong></div>
    {/each}
  </div>
  <p class="detail-note">
    Times run from the question becoming active to your first selection, with hidden-tab and paused
    intervals removed. {s.excludedCount
      ? `${s.excludedCount} interrupted or unavailable first responses were excluded.`
      : 'All recorded first responses were usable.'} Variation is descriptive, not a measure of consistency
    in your personality.
  </p>
  <div class="timing-lists">
    {#each [{ title: 'Your quickest responses', items: s.fastest }, { title: 'Where you took more time', items: s.slowest }] as group}
      <section class="plain-panel">
        <h3>{group.title}</h3>
        {#each group.items as observation}<div class="timing-item">
            <div>
              <span class="eyebrow"
                >{observation.questionId.toUpperCase()} · {seconds(
                  observation.firstResponseMs
                )}</span
              >
              <p>{question(observation.questionId)?.text}</p>
              <span class="detail-note">{multiplier(observation)}</span>
            </div>
          </div>{:else}<p>No usable first-response timing was recorded.</p>{/each}
      </section>
    {/each}
  </div>
  <section class="plain-panel timing-observations">
    <h3>Compared with your own baseline</h3>
    <p>
      {s.unusuallyFast.length} responses took less than half your median time; {s.unusuallySlow
        .length} took more than twice your median. These cutoffs are simple descriptive flags, not statistical
      or psychological findings.
    </p>
    <p>
      The concrete-item subset had a median of <strong>{seconds(baseline.medianMs)}</strong> across {baseline.count}
      usable responses. Question difficulty and length can differ, so these figures are starting points
      for future analysis.
    </p>
    <details>
      <summary>See every response time <span aria-hidden="true">+</span></summary>
      <div class="table-scroll">
        <table>
          <thead
            ><tr
              ><th>Question</th><th>First response</th><th>Relative to median</th><th
                >Active time</th
              ><th>Changes / visits</th></tr
            ></thead
          ><tbody
            >{#each result.questions as q}{@const observation = s.observations.find(
                (o) => o.questionId === q.id
              )}{@const timing = result.timing[q.id]}<tr
                ><td><b>{q.id}</b> {q.text}</td><td
                  >{seconds(observation?.firstResponseMs ?? null)}</td
                ><td
                  >{observation?.relativeToMedian === null || !observation
                    ? '—'
                    : `${observation.relativeToMedian.toFixed(2)}×`}</td
                ><td>{seconds(timing?.totalActiveMs ?? null)}</td><td
                  >{timing?.changeCount ?? 0} / {timing?.visits.length ?? 0}</td
                ></tr
              >{/each}</tbody
          >
        </table>
      </div>
    </details>
  </section>
</section>
