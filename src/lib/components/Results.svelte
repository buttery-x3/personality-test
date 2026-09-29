<script lang="ts">
  import { frameworks } from '../data/frameworks';
  import type { CompletedResult } from '../types';
  import FrameworkResult from './FrameworkResult.svelte';
  import TimingResults from './TimingResults.svelte';
  import ScoreInspector from './ScoreInspector.svelte';
  import AboutResults from './AboutResults.svelte';
  import Mark from './Mark.svelte';
  let {
    result,
    history,
    selectedIndex,
    chooseResult,
    start,
    showMethod
  }: {
    result: CompletedResult;
    history: CompletedResult[];
    selectedIndex: number;
    chooseResult: (index: number) => void;
    start: () => void;
    showMethod: () => void;
  } = $props();
  let tab = $state<'overview' | 'timing' | 'calculation'>('overview');
  let downloadUrl = $state('');
  $effect(() => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    );
    downloadUrl = url;
    return () => URL.revokeObjectURL(url);
  });
  const date = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
</script>

<section class="results-hero">
  <div>
    <div class="eyebrow"><span class="little-star">✳</span> YOUR MANYFOLD PROFILE</div>
    <h1>A constellation<br /><em>of you.</em></h1>
    <p>
      Six perspectives, drawn from the same {result.questionIds.length} answers.<br />A few familiar
      patterns. Perhaps a new way to see them.
    </p>
    <div class="results-meta">
      <span>{date(result.completedAt)}</span><span>{result.surveyVersion}</span><span
        >Saved on this device</span
      >
    </div>
  </div>
  <div class="results-seal">
    <div class="seal-orbit"><Mark size={90} /></div>
    <span>ONE PERSON. MANY POSSIBILITIES.</span>
  </div>
</section>
<div class="result-toolbar">
  <nav class="result-tabs" aria-label="Result views">
    <button
      class:active={tab === 'overview'}
      aria-pressed={tab === 'overview'}
      onclick={() => (tab = 'overview')}>The six perspectives</button
    ><button
      class:active={tab === 'timing'}
      aria-pressed={tab === 'timing'}
      onclick={() => (tab = 'timing')}>Your response timing</button
    ><button
      class:active={tab === 'calculation'}
      aria-pressed={tab === 'calculation'}
      onclick={() => (tab = 'calculation')}>How it’s calculated</button
    >
  </nav>
  <a
    class="text-button export-button"
    href={downloadUrl}
    download={`manyfold-${result.completedAt.replace(/[:.]/g, '-')}.json`}
    >Export JSON <span aria-hidden="true">↓</span></a
  >
</div>
{#if history.length > 1}<label class="history-picker"
    >Saved explorations <select
      value={selectedIndex}
      onchange={(event) => chooseResult(Number(event.currentTarget.value))}
      >{#each history as item, i}<option value={i}
          >{i === 0 ? 'Latest · ' : ''}{date(item.completedAt)} · {new Date(
            item.completedAt
          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {item.surveyVersion}</option
        >{/each}</select
    ></label
  >{/if}
{#if tab === 'overview'}
  <div class="scores-caption">
    <span>A different lens in every card.</span><span>0–100 survey scores · midpoint 50</span>
  </div>
  <div class="results-grid">
    {#each frameworks as framework, i}<FrameworkResult
        {framework}
        scores={result.scoring}
        index={i}
      />{/each}
  </div>
  <AboutResults />
{:else if tab === 'timing'}<TimingResults {result} />
{:else}<ScoreInspector {result} />{/if}
<div class="result-end">
  <div>
    <h2>There’s always more to discover.</h2>
    <p>Your results stay in this browser. Export a copy to keep the full story.</p>
  </div>
  <div class="result-end-actions">
    <button class="button secondary" onclick={showMethod}>Read the method</button><button
      class="button primary"
      onclick={start}>Start a new exploration ↗</button
    >
  </div>
</div>
