<script lang="ts">
  import { agreementLabels, interestLabels, answerValues } from '../data/questions';
  import type { Answer, Question } from '../types';
  let {
    question,
    index,
    count,
    answered,
    answer,
    select,
    next,
    back,
    exit,
    restart,
    paused,
    togglePause
  }: {
    question: Question;
    index: number;
    count: number;
    answered: number;
    answer: Answer | undefined;
    select: (v: Answer) => void;
    next: () => void;
    back: () => void;
    exit: () => void;
    restart: () => void;
    paused: boolean;
    togglePause: () => void;
  } = $props();
  let heading = $state<HTMLHeadingElement>();
  let lastId = '';
  $effect(() => {
    if (question.id !== lastId) {
      lastId = question.id;
      heading?.focus({ preventScroll: true });
    }
  });
  const labels = $derived(question.answerType === 'interest' ? interestLabels : agreementLabels);
  function keydown(event: KeyboardEvent) {
    if (
      paused ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      (event.target instanceof Element && event.target.closest('dialog'))
    )
      return;
    if (/^[1-5]$/.test(event.key)) {
      event.preventDefault();
      select(answerValues[Number(event.key) - 1]);
    }
    if (event.key === 'Enter' && event.target === heading && answer !== undefined) {
      event.preventDefault();
      next();
    }
  }
</script>

<svelte:window onkeydown={keydown} />
<section class="survey-shell">
  <div class="survey-top">
    <button class="text-button muted" onclick={exit}>← Save & exit</button><span class="eyebrow"
      >A LITTLE MORE OF THE PICTURE</span
    ><button class="text-button muted" onclick={togglePause}
      >{paused ? 'Resume' : 'Pause'} <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span></button
    >
  </div>
  <div class="progress-meta">
    <span
      >Question <strong>{String(index + 1).padStart(2, '0')}</strong>
      <span class="muted">/ {count}</span></span
    ><span>{Math.round((answered / count) * 100)}% complete</span>
  </div>
  <div
    class="survey-progress"
    role="progressbar"
    aria-label="Survey completion"
    aria-valuenow={answered}
    aria-valuemin="0"
    aria-valuemax={count}
  >
    <span style:width={`${(answered / count) * 100}%`}></span>
  </div>
  {#if paused}
    <div class="question-card paused-card">
      <span class="question-flower" aria-hidden="true">☼</span>
      <h1>A little breathing room.</h1>
      <p>Your progress is saved. Response timing is paused until you return.</p>
      <button class="button primary" onclick={togglePause}>I’m ready to continue →</button>
    </div>
  {:else}
    <div class="question-card" data-question={question.id}>
      <div class="question-kicker">
        <span class="question-flower" aria-hidden="true">✳</span><span
          >{question.answerType === 'interest'
            ? 'HOW WOULD YOU FEEL ABOUT THIS ACTIVITY?'
            : 'HOW MUCH DOES THIS SOUND LIKE YOU?'}</span
        >
      </div>
      <h1 bind:this={heading} tabindex="-1" class="question-title">{question.text}</h1>
      <p class="question-guidance">
        {question.answerType === 'interest'
          ? 'Think about your interest, whether or not you have tried it.'
          : 'Think about your usual self, rather than an exceptional day.'}
      </p>
      <fieldset class="answer-options">
        <legend class="sr-only">Choose your response</legend>
        {#each answerValues as value, i}
          <label class:selected={answer === value} class="answer-option">
            <input
              type="radio"
              name="response"
              {value}
              checked={answer === value}
              onchange={() => select(value)}
            />
            <span
              class="answer-dot"
              class:negative={i < 2}
              class:positive={i > 2}
              style:--dot-size={`${i === 0 || i === 4 ? 29 : i === 1 || i === 3 ? 23 : 17}px`}
              ><span>{answer === value ? '✓' : ''}</span></span
            >
            <span class="answer-label">{labels[i]}</span><kbd aria-hidden="true">{i + 1}</kbd>
          </label>
        {/each}
      </fieldset>
      <div class="question-navigation">
        <button class="text-button" onclick={back} disabled={index === 0}>← Back</button><span
          class="keyboard-hint">Choose with <kbd>1</kbd>–<kbd>5</kbd></span
        ><button class="button primary next-button" onclick={next} disabled={answer === undefined}
          >{index === count - 1 ? 'See my perspectives' : 'Next question'}
          <span aria-hidden="true">→</span></button
        >
      </div>
    </div>
  {/if}
  <div class="survey-footnote">
    <span>There isn’t a right answer. There’s just your answer.</span><button
      class="text-button muted"
      onclick={restart}>Restart survey</button
    >
  </div>
</section>
