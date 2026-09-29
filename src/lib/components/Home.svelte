<script lang="ts">
  import Constellation from './Constellation.svelte';
  import { frameworks } from '../data/frameworks';
  let {
    progress,
    hasResult,
    start,
    resume,
    showResult,
    showMethod
  }: {
    progress: number | null;
    hasResult: boolean;
    start: () => void;
    resume: () => void;
    showResult: () => void;
    showMethod: () => void;
  } = $props();
</script>

<section class="hero">
  <div class="hero-copy">
    <div class="eyebrow"><span class="little-star">✳</span> A SMALL EXPLORATION OF YOU</div>
    <h1>One person.<br /><em>Many perspectives.</em></h1>
    <p class="hero-description">
      You’re more than a single type. Discover how six different personality frameworks see the
      patterns in your everyday choices.
    </p>
    <div class="hero-actions">
      <button class="button primary large" onclick={progress !== null ? resume : start}
        >{progress !== null ? 'Continue your exploration' : 'Find your many sides'}<span
          aria-hidden="true">↗</span
        ></button
      >
      <span class="time-note">72 questions · about 15 minutes</span>
    </div>
    <p class="privacy-note">
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"
        ><path
          d="M4 7V5a4 4 0 0 1 8 0v2M3 7h10v8H3z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.3"
        /></svg
      > Just you and your browser. Your answers stay here.
    </p>
  </div>
  <Constellation />
</section>

{#if progress !== null || hasResult}
  <section class="saved-strip" aria-label="Your saved exploration">
    <div>
      <span class="saved-dot"></span><strong
        >{progress !== null ? 'Pick up where you left off.' : 'A familiar constellation.'}</strong
      ><span
        >{progress !== null
          ? `${progress} of 72 answers saved on this device.`
          : 'Your most recent result is saved on this device.'}</span
      >
    </div>
    <div class="saved-actions">
      {#if hasResult}<button class="text-button" onclick={showResult}
          >View latest result <span aria-hidden="true">↗</span></button
        >{/if}{#if progress !== null}<button class="text-button muted" onclick={start}
          >Start again</button
        >{/if}
    </div>
  </section>
{/if}

<section class="perspectives-section" aria-labelledby="perspectives-heading">
  <div class="section-heading">
    <div>
      <span class="eyebrow">SIX WAYS OF LOOKING</span>
      <h2 id="perspectives-heading">A fuller picture, from the same answers.</h2>
    </div>
    <button class="text-button" onclick={showMethod}
      >Explore the method <span aria-hidden="true">↗</span></button
    >
  </div>
  <div class="framework-grid">
    {#each frameworks as framework, i}
      <div class="framework-preview" style:--accent={framework.color}>
        <div class="framework-preview-top">
          <span class="framework-number">0{i + 1}</span><span class="mini-symbol" aria-hidden="true"
            >{['≋', '⊞', '◎', '◫', '⬡', '✧'][i]}</span
          >
        </div>
        <h3>{framework.name}</h3>
        <p>{framework.eyebrow}</p>
        <span class="framework-category"
          >{['TRAITS', 'PREFERENCES', 'MOTIVATIONS', 'WORKING STYLE', 'INTERESTS', 'JUST FOR FUN'][
            i
          ]}</span
        >
      </div>
    {/each}
  </div>
</section>

<section class="small-manifesto">
  <span class="manifesto-mark" aria-hidden="true">✳</span>
  <div>
    <h2>Patterns to be curious about.<br /> <em>Room to be yourself.</em></h2>
    <p>
      One thoughtfully connected survey, not six tests stitched together. Each answer can inform
      several perspectives. Take what resonates, and stay curious about what doesn’t.
    </p>
  </div>
  <button class="button secondary" onclick={showMethod}
    >A look behind the questions <span aria-hidden="true">↗</span></button
  >
</section>
