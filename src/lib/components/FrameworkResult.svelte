<script lang="ts">
  import type { Framework, ScoringOutput } from '../types';
  import { dimensionById } from '../data/frameworks';
  import { interpretation } from '../interpretation';
  import ScoreBar from './ScoreBar.svelte';
  let { framework, scores, index }: { framework: Framework; scores: ScoringOutput; index: number } =
    $props();
  const f = $derived(framework);
  const allTied = $derived(
    f.dimensions.every(
      (d) =>
        Math.abs(
          scores.dimensions[d.id].normalized - scores.dimensions[f.dimensions[0].id].normalized
        ) < 1e-8
    )
  );
</script>

<article class="result-card" style:--accent={f.color} id={`result-${f.id}`}>
  <div class="result-card-header">
    <span class="framework-number"
      >0{index + 1} / {f.id === 'houses' ? 'RECREATIONAL' : f.eyebrow.toUpperCase()}</span
    ><span class="mini-symbol" aria-hidden="true">{['≋', '⊞', '◎', '◫', '⬡', '✧'][index]}</span>
  </div>
  <h2>{f.name}</h2>
  {#if f.id === 'jung'}
    <div class="result-feature type-letters">
      {#each scores.jung.type.split('') as letter}<span>{letter}</span>{/each}
    </div>
    <div class="bipolar-bars">
      {#each scores.jung.axes as axis}
        <div class="bipolar-row">
          <div class="bipolar-labels">
            <span class:lean={axis.leftPercent > 50}
              >{dimensionById[axis.left].label} <b>{Math.round(axis.leftPercent)}%</b></span
            ><span class:lean={axis.rightPercent > 50}
              ><b>{Math.round(axis.rightPercent)}%</b> {dimensionById[axis.right].label}</span
            >
          </div>
          <div class="bipolar-track">
            <span
              class="bipolar-dot"
              style:left={`${Math.max(2, Math.min(98, axis.rightPercent))}%`}
            ></span><span class="midpoint"></span>
          </div>
        </div>
      {/each}
    </div>
  {:else if f.id === 'enneagram'}
    <div class="result-feature">
      <span class="feature-code"
        >{scores.enneagram.tied ? 'A close blend' : scores.enneagram.code}</span
      ><span class="feature-caption"
        >{scores.enneagram.tied
          ? 'Shared leading themes'
          : dimensionById[scores.enneagram.ranking[0]].label}</span
      >
    </div>
    <div
      class="enneagram-chart"
      role="img"
      aria-label={f.dimensions
        .map((d) => `Type ${d.short}: ${Math.round(scores.dimensions[d.id].normalized)}`)
        .join(', ')}
    >
      {#each f.dimensions as d}<div
          class="enneagram-column"
          class:top={scores.enneagram.ranking[0] === d.id && !scores.enneagram.tied}
        >
          <span class="enneagram-value">{Math.round(scores.dimensions[d.id].normalized)}</span>
          <div class="enneagram-track">
            <span style:height={`${scores.dimensions[d.id].normalized}%`}></span>
          </div>
          <span class="enneagram-number">{d.short}</span>
        </div>{/each}
    </div>
    <div class="enneagram-key">
      {#each f.dimensions as d}<span><b>{d.short}</b> {d.label.replace('The ', '')}</span>{/each}
    </div>
  {:else}
    {#if f.id === 'disc'}<div class="result-feature">
        <span class="feature-code">{allTied ? 'A balance' : scores.disc.code}</span><span
          class="feature-caption"
          >{scores.disc.tied
            ? 'Shared leading styles'
            : dimensionById[scores.disc.ranking[0]].label +
              (scores.disc.code.includes('/')
                ? ' + ' + dimensionById[scores.disc.ranking[1]].label
                : '')}</span
        >
      </div>{/if}
    {#if f.id === 'riasec'}<div class="result-feature">
        <span class="feature-code letter-spacing">{scores.riasec.code}</span><span
          class="feature-caption">Your activity-interest code</span
        >
      </div>{/if}
    {#if f.id === 'houses'}<div class="result-feature">
        <span class="feature-code house-title"
          >{scores.houses.tied
            ? 'A shared affinity'
            : dimensionById[scores.houses.primary].label}</span
        ><span class="feature-caption"
          >{scores.houses.tied
            ? 'More than one common room'
            : 'Your strongest house affinity'}</span
        >
      </div>{/if}
    <div class="framework-bars" class:big-five={f.id === 'big5'}>
      {#each f.dimensions as d}<ScoreBar
          label={d.label}
          value={scores.dimensions[d.id].normalized}
          color={f.color}
          small={f.id === 'riasec'}
        />{/each}
    </div>
  {/if}
  <p class="result-interpretation">{interpretation(f.id, scores)}</p>
  <details class="framework-about">
    <summary>About this perspective <span aria-hidden="true">+</span></summary>
    <p>{f.description}</p>
    {#if f.id === 'jung'}<p>
        Percentages express the balance of evidence between two poles, not probability or population
        standing. X marks an exact tie. This is not the official MBTI assessment.
      </p>{:else if f.id === 'houses'}<p>
        Original questions and an original affinity model. Not affiliated with Wizarding World, and
        not its sorting quiz.
      </p>{/if}
  </details>
</article>
