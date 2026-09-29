<script lang="ts">
  import { onMount } from 'svelte';
  import Home from '$lib/components/Home.svelte';
  import Survey from '$lib/components/Survey.svelte';
  import Results from '$lib/components/Results.svelte';
  import Method from '$lib/components/Method.svelte';
  import Mark from '$lib/components/Mark.svelte';
  import { questions } from '$lib/data/questions';
  import { createSession, SurveyController } from '$lib/session/session';
  import { localRepository, STORAGE_KEY } from '$lib/session/persistence';
  import type { Repository, SavedState } from '$lib/session/persistence';
  import type { Answer } from '$lib/types';

  type View = 'home' | 'survey' | 'results' | 'method';
  let view = $state<View>('home');
  let methodOrigin: View = 'home';
  let saved = $state.raw<SavedState>({ schemaVersion: 1, session: null, results: [] });
  let revision = $state(0);
  let selectedResult = $state(0);
  let ready = $state(false);
  let warning = $state<string | null>(null);
  let paused = $state(false);
  let repository: Repository;
  let controller: SurveyController | null = null;
  let modal = $state<HTMLDialogElement>();
  let confirmation = $state<'restart' | 'clear' | null>(null);
  let liveMessage = $state('');
  let main: HTMLElement;

  const session = $derived.by(() => {
    revision;
    return saved.session ? { ...saved.session } : null;
  });
  const progress = $derived(session ? Object.keys(session.answers).length : null);
  const activeQuestion = $derived(session ? questions[session.currentIndex] : questions[0]);
  const selectedAnswer = $derived.by(() => {
    revision;
    return session?.answers[activeQuestion.id];
  });
  const result = $derived(saved.results[selectedResult]);

  function refresh() {
    revision++;
  }
  function persist() {
    if (saved.session) saved.session.updatedAt = new Date().toISOString();
    const error = repository?.save(saved);
    if (error) warning = error;
    refresh();
  }
  function focusMain() {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      main?.focus({ preventScroll: true });
    });
  }
  function navigate(next: View) {
    if (view === 'survey') {
      controller?.timer.leave(false);
      persist();
    }
    view = next;
    paused = false;
    focusMain();
  }
  function begin() {
    controller?.timer.leave(false);
    const next = createSession(questions);
    saved = { ...saved, session: next };
    controller = new SurveyController(next, questions);
    controller.enter(!document.hidden);
    view = 'survey';
    paused = false;
    persist();
    focusMain();
  }
  function start() {
    if (saved.session && Object.keys(saved.session.answers).length) confirmation = 'restart';
    else begin();
  }
  function resume() {
    if (!saved.session) return;
    controller = new SurveyController(saved.session, questions);
    controller.enter(!document.hidden);
    view = 'survey';
    paused = false;
    persist();
    focusMain();
  }
  function select(answer: Answer) {
    controller?.select(answer);
    persist();
  }
  function next() {
    if (!controller || !session || selectedAnswer === undefined) return;
    if (session.currentIndex === questions.length - 1) {
      const missing = questions.findIndex((q) => session.answers[q.id] === undefined);
      if (missing !== -1) {
        controller.move(missing, true, !document.hidden);
        persist();
        return;
      }
      const completed = controller.finish();
      saved = { schemaVersion: 1, session: null, results: [completed, ...saved.results] };
      controller = null;
      selectedResult = 0;
      persist();
      navigate('results');
    } else {
      controller.move(session.currentIndex + 1, true, !document.hidden);
      persist();
    }
  }
  function back() {
    if (controller && session && session.currentIndex > 0) {
      controller.move(session.currentIndex - 1, false, !document.hidden);
      persist();
    }
  }
  function togglePause() {
    paused = !paused;
    controller?.timer.setVisible(!paused && !document.hidden);
    persist();
  }
  function showResult() {
    selectedResult = 0;
    navigate('results');
  }
  function showMethod() {
    if (view === 'method') return;
    methodOrigin = view;
    navigate('method');
  }
  function methodBack() {
    if (methodOrigin === 'survey' && saved.session) resume();
    else navigate(methodOrigin === 'results' && saved.results.length ? 'results' : 'home');
  }
  function confirm() {
    const action = confirmation;
    confirmation = null;
    if (action === 'restart') begin();
    else if (action === 'clear') {
      controller?.timer.leave(false);
      const error = repository.clear();
      if (error) {
        warning = error;
        if (view === 'survey') controller?.enter(!paused && !document.hidden);
        return;
      }
      controller = null;
      saved = { schemaVersion: 1, session: null, results: [] };
      warning = null;
      selectedResult = 0;
      view = 'home';
      liveMessage = 'Your local Manyfold data has been cleared.';
      focusMain();
    }
  }
  $effect(() => {
    if (confirmation) {
      modal?.showModal();
      if (view === 'survey') controller?.timer.setVisible(false);
    } else {
      modal?.close();
      if (view === 'survey') controller?.timer.setVisible(!paused && !document.hidden);
    }
  });

  onMount(() => {
    // Accessing localStorage itself can throw in restricted browsing modes.
    try {
      repository = localRepository(window.localStorage);
    } catch {
      repository = localRepository({
        getItem() {
          throw new Error('Unavailable');
        },
        setItem() {
          throw new Error('Unavailable');
        },
        removeItem() {
          throw new Error('Unavailable');
        }
      });
    }
    const loaded = repository.load();
    saved = loaded.state;
    warning = loaded.warning;
    ready = true;
    const visibility = () => {
      if (view === 'survey') {
        controller?.timer.setVisible(!document.hidden && !paused && !confirmation);
        persist();
      }
    };
    const pagehide = () => {
      if (view === 'survey') {
        controller?.timer.leave(false);
        persist();
      }
    };
    const pageshow = (event: PageTransitionEvent) => {
      if (event.persisted && view === 'survey') controller?.enter(!document.hidden && !paused);
    };
    // Avoid stale tabs overwriting an actively edited survey in another tab.
    const storage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      controller?.timer.leave(false);
      controller = null;
      const loaded = repository.load();
      saved = loaded.state;
      selectedResult = 0;
      view = 'home';
      paused = false;
      warning =
        loaded.warning ??
        'Your saved exploration changed in another tab. Resume here to continue from the latest saved answers.';
    };
    const interval = window.setInterval(() => {
      if (view === 'survey') {
        controller?.timer.checkpoint();
        persist();
      }
    }, 5000);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pagehide);
    window.addEventListener('pageshow', pageshow);
    window.addEventListener('storage', storage);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', pagehide);
      window.removeEventListener('pageshow', pageshow);
      window.removeEventListener('storage', storage);
      controller?.timer.leave(false);
    };
  });
</script>

<svelte:head
  ><title>Manyfold — One person. Many perspectives.</title><meta
    name="description"
    content="One thoughtful personality survey. Six different perspectives. Explore your traits, preferences, motivations, and interests, privately in your browser."
  /></svelte:head
>

<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell">
  <header class="site-header">
    <button class="brand" aria-label="Manyfold home" onclick={() => navigate('home')}
      ><Mark /><span>manyfold<span class="brand-dot">.</span></span></button
    >
    <nav aria-label="Main navigation">
      <button class:current={view === 'method'} class="text-button nav-method" onclick={showMethod}
        >The method</button
      >{#if saved.results.length}<button
          class="text-button"
          class:current={view === 'results'}
          onclick={showResult}>Your results <span aria-hidden="true">↗</span></button
        >{:else}<span class="header-note"
          ><span class="status-dot"></span> A little self-discovery</span
        >{/if}
    </nav>
  </header>
  {#if warning}<div class="notice" role="status">
      <span>{warning}</span><button aria-label="Dismiss notice" onclick={() => (warning = null)}
        >×</button
      >
    </div>{/if}
  <main id="main" bind:this={main} tabindex="-1">
    {#if !ready}<div class="loading-state">
        <Mark size={48} />
        <p>Finding your place…</p>
      </div>
    {:else if view === 'survey' && session}<Survey
        question={activeQuestion}
        index={session.currentIndex}
        count={questions.length}
        answered={progress ?? 0}
        answer={selectedAnswer}
        {select}
        {next}
        {back}
        exit={() => navigate('home')}
        restart={() => (confirmation = 'restart')}
        {paused}
        {togglePause}
      />
    {:else if view === 'results' && result}<Results
        {result}
        history={saved.results}
        selectedIndex={selectedResult}
        chooseResult={(i) => (selectedResult = i)}
        {start}
        {showMethod}
      />
    {:else if view === 'method'}<Method back={methodBack} />
    {:else}<Home
        {progress}
        hasResult={saved.results.length > 0}
        {start}
        {resume}
        {showResult}
        {showMethod}
      />{/if}
  </main>
  <footer class="site-footer">
    <div>
      <span class="footer-brand">manyfold.</span><span>Made for curiosity, not certainty.</span>
    </div>
    <div>
      <span>Private. Local. Yours.</span
      >{#if ready && (saved.session || saved.results.length)}<button
          class="text-button muted"
          onclick={() => (confirmation = 'clear')}>Clear local data</button
        >{/if}<span class="version">v1.0</span>
    </div>
  </footer>
</div>
<span class="sr-only" aria-live="polite">{liveMessage}</span>
<dialog
  bind:this={modal}
  oncancel={() => (confirmation = null)}
  onclose={() => (confirmation = null)}
>
  <div class="dialog-content">
    <span class="eyebrow">{confirmation === 'clear' ? 'YOUR LOCAL DATA' : 'A FRESH START'}</span>
    <h2>
      {confirmation === 'clear'
        ? 'Clear your saved explorations?'
        : 'Start this exploration again?'}
    </h2>
    <p>
      {confirmation === 'clear'
        ? 'This removes your unfinished survey and all completed results from this browser. Download any result you want to keep first.'
        : 'Your unfinished answers will be replaced. Completed results will stay saved on this device.'}
    </p>
    <div class="dialog-actions">
      <button class="button secondary" onclick={() => (confirmation = null)}
        >Keep my progress</button
      ><button class="button primary" onclick={confirm}
        >{confirmation === 'clear' ? 'Clear local data' : 'Start again'}</button
      >
    </div>
  </div>
</dialog>
