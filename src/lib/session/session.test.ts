import { describe, expect, it } from 'vitest';
import { createSession, SurveyController } from './session';
import { recoverInterruptedTiming, summarizeTiming, TimingRecorder } from './timing';
import { localRepository, STORAGE_KEY } from './persistence';
import { questions, SURVEY_VERSION } from '../data/questions';
import { scoreSurvey } from '../engine/scoring';
import type { QuestionTiming } from '../types';

describe('timing and navigation', () => {
  it('records first response, submission, revisions, and return visits separately', () => {
    let now = 0;
    const session = createSession(questions);
    const controller = new SurveyController(session, questions, () => now);
    controller.enter();
    now = 1000;
    controller.select(0.5);
    now = 1500;
    controller.select(0.5);
    now = 2000;
    controller.select(-0.5);
    now = 3000;
    controller.move(1, true);
    now = 4000;
    controller.move(0);
    now = 5000;
    controller.select(1);
    now = 6000;
    controller.move(1, true);
    const t = session.timing.q01;
    expect(t.firstResponseMs).toBe(1000);
    expect(t.totalActiveMs).toBe(5000);
    expect(t.firstSelectedAt).toBe('1970-01-01T00:00:01.000Z');
    expect(t.finalSubmittedAt).toBe('1970-01-01T00:00:06.000Z');
    expect(t.answerChanged).toBe(true);
    expect(t.changeCount).toBe(2);
    expect(t.returned).toBe(true);
    expect(t.visits).toHaveLength(2);
    expect(session.answers.q01).toBe(1);
    expect(summarizeTiming(session.timing).observations[0].firstResponseMs).toBe(1000);
  });
  it('excludes hidden and explicitly paused time from latency and active duration', () => {
    let now = 0;
    const records: Record<string, QuestionTiming> = {};
    const timer = new TimingRecorder(records, () => now);
    timer.enter(questions[0]);
    now = 1000;
    timer.setVisible(false);
    now = 61000;
    timer.setVisible(true);
    now = 63000;
    timer.select(false);
    now = 64000;
    timer.leave(true);
    expect(records.q01.firstResponseMs).toBe(3000);
    expect(records.q01.totalActiveMs).toBe(4000);
    expect(records.q01.visits[0].hiddenMs).toBe(60000);
  });
  it('sums observed active time across pre-answer visits, not time spent elsewhere', () => {
    let now = 0;
    const records: Record<string, QuestionTiming> = {};
    const timer = new TimingRecorder(records, () => now);
    timer.enter(questions[0]);
    now = 3000;
    timer.leave(false);
    now = 7000;
    timer.enter(questions[0]);
    now = 9000;
    timer.select(false);
    timer.leave(true);
    expect(records.q01.firstResponseMs).toBe(5000);
    expect(summarizeTiming(records).medianMs).toBe(5000);
  });
  it('invalidates interrupted visits and never adds offline wall time', () => {
    let now = 0;
    const session = createSession(questions);
    const controller = new SurveyController(session, questions, () => now);
    controller.enter();
    now = 2000;
    controller.select(0.5);
    now = 3000;
    controller.timer.checkpoint();
    const restored = JSON.parse(JSON.stringify(session));
    now = 1_000_000;
    const resumed = new SurveyController(restored, questions, () => now);
    resumed.enter();
    now += 1000;
    resumed.select(1);
    resumed.timer.leave(true);
    expect(restored.timing.q01.visits[0].valid).toBe(false);
    expect(restored.timing.q01.totalActiveMs).toBe(4000);
    expect(summarizeTiming(restored.timing).count).toBe(0);
    expect(summarizeTiming(restored.timing).excludedCount).toBe(1);
  });
  it('computes descriptive median, mean, variance, relative times and extremes', () => {
    let now = 0;
    const records: Record<string, QuestionTiming> = {};
    const timer = new TimingRecorder(records, () => now);
    for (const [i, latency] of [1000, 2000, 3000, 14000].entries()) {
      timer.enter(questions[i]);
      now += latency;
      timer.select(false);
      timer.leave(true);
    }
    const summary = summarizeTiming(records);
    expect(summary.medianMs).toBe(2500);
    expect(summary.meanMs).toBe(5000);
    expect(summary.varianceMsSquared).toBe(27500000);
    expect(summary.standardDeviationMs).toBeCloseTo(Math.sqrt(27500000));
    expect(summary.fastest[0].questionId).toBe('q01');
    expect(summary.slowest[0].questionId).toBe('q04');
    expect(summary.unusuallyFast.map((o) => o.questionId)).toEqual(['q01']);
    expect(summary.unusuallySlow.map((o) => o.questionId)).toEqual(['q04']);
    expect(summary.observations[1].relativeToMedian).toBe(0.8);
  });
  it('does not divide by zero for instantaneous responses or empty timing', () => {
    const records: Record<string, QuestionTiming> = {};
    const timer = new TimingRecorder(records, () => 0);
    timer.enter(questions[0]);
    timer.select(false);
    timer.leave(true);
    expect(summarizeTiming(records).medianMs).toBe(0);
    expect(summarizeTiming(records).observations[0].relativeToMedian).toBeNull();
    expect(summarizeTiming({}).meanMs).toBeNull();
    expect(() => recoverInterruptedTiming({})).not.toThrow();
  });
  it('requires completion and freezes historical questions, answers and scoring', () => {
    const bank = structuredClone(questions.slice(0, 2));
    const session = createSession(bank);
    const controller = new SurveyController(session, bank, () => 0);
    expect(() => controller.finish()).toThrow('Answer every question');
    controller.enter();
    controller.select(0.5);
    controller.move(1, true);
    controller.select(-1);
    const result = controller.finish();
    expect(result.surveyVersion).toBe(SURVEY_VERSION);
    expect(result.scoring.answeredCount).toBe(2);
    expect(result.questionIds).toEqual(['q01', 'q02']);
    expect(result.timing.q02.finalSubmittedAt).not.toBeNull();
    bank[0].text = 'Changed later';
    session.answers.q01 = -1;
    expect(result.questions[0].text).not.toBe('Changed later');
    expect(result.answers.q01).toBe(0.5);
  });
  it('never includes timing in the scoring engine', () => {
    const session = createSession(questions);
    session.answers.q01 = 0.5;
    const before = scoreSurvey(questions, session.answers);
    const timer = new TimingRecorder(session.timing, () => 999999);
    timer.enter(questions[0]);
    timer.select(false);
    timer.leave(true);
    expect(scoreSurvey(questions, session.answers)).toEqual(before);
  });
  it('serializes a complete export with versioned definitions, evidence, answers and raw timing', () => {
    let now = Date.UTC(2026, 8, 29);
    const session = createSession(questions);
    const controller = new SurveyController(session, questions, () => now);
    controller.enter();
    for (let i = 0; i < questions.length; i++) {
      now += 1500 + i * 100;
      controller.select(i % 2 ? -0.5 : 1);
      now += 200;
      if (i < questions.length - 1) controller.move(i + 1, true);
    }
    const result = controller.finish();
    const exported = JSON.parse(JSON.stringify(result));
    expect(exported).toEqual(result);
    expect(exported.surveyVersion).toBe(SURVEY_VERSION);
    expect(exported.scoringVersion).toBe('neutral-centred-capacity-1');
    expect(exported.questions).toHaveLength(72);
    expect(exported.questionIds).toHaveLength(72);
    expect(Object.keys(exported.answers)).toHaveLength(72);
    expect(Object.keys(exported.timing)).toHaveLength(72);
    expect(Object.keys(exported.scoring.dimensions)).toHaveLength(36);
    expect(exported.timingSummary.count).toBe(72);
    expect(exported.timing.q01.firstResponseMs).toBe(1500);
    expect(exported.timing.q72.finalSubmittedAt).not.toBeNull();
    expect(Number.isFinite(Date.parse(exported.completedAt))).toBe(true);
  });
});

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    }
  };
}
function completed() {
  const session = createSession(questions);
  for (const q of questions) session.answers[q.id] = 0;
  return new SurveyController(session, questions).finish();
}
describe('local repository', () => {
  it('round trips in-progress and completed data independently', () => {
    const repository = localRepository(memoryStorage());
    const session = createSession(questions);
    session.answers.q01 = 0;
    session.currentIndex = 1;
    const result = completed();
    expect(repository.save({ schemaVersion: 1, session, results: [result] })).toBeNull();
    expect(repository.load()).toEqual({
      state: { schemaVersion: 1, session, results: [result] },
      warning: null
    });
  });
  it('preserves old completed snapshots but rejects incompatible in-progress versions', () => {
    const repository = localRepository(memoryStorage());
    const session = createSession(questions);
    session.surveyVersion = 'older';
    const result = completed();
    result.surveyVersion = 'older';
    repository.save({ schemaVersion: 1, session, results: [result] });
    const loaded = repository.load();
    expect(loaded.state.session).toBeNull();
    expect(loaded.state.results[0].surveyVersion).toBe('older');
    expect(loaded.warning).toContain('incompatible version');
  });
  it('handles malformed JSON, incomplete saved objects and invalid answer values', () => {
    const storage = memoryStorage();
    const repository = localRepository(storage);
    for (const raw of ['{', 'null', '{}', '{"schemaVersion":1,"results":[null],"session":{}}']) {
      storage.setItem(STORAGE_KEY, raw);
      expect(repository.load().warning).not.toBeNull();
      expect(repository.load().state.session).toBeNull();
    }
    const session = createSession(questions);
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        results: [],
        session: { ...session, answers: { q01: 99 } }
      })
    );
    expect(repository.load().state.session).toBeNull();
  });
  it('reports quota and unavailable storage errors without throwing', () => {
    const fail = () => {
      throw new Error('Denied');
    };
    const repository = localRepository({ getItem: fail, setItem: fail, removeItem: fail });
    expect(repository.load().warning).toBeTruthy();
    expect(repository.save({ schemaVersion: 1, session: null, results: [] })).toBeTruthy();
    expect(repository.clear()).toBeTruthy();
  });
  it('rejects malformed nested scoring while preserving a readable result', () => {
    const storage = memoryStorage();
    const good = completed();
    const corrupt = JSON.parse(JSON.stringify(good));
    delete corrupt.scoring.dimensions['big5.O'].contributions;
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, session: null, results: [corrupt, good] })
    );
    const loaded = localRepository(storage).load();
    expect(loaded.state.results).toHaveLength(1);
    expect(loaded.warning).toContain('Some saved results');
  });
  it('clears only this application’s key', () => {
    const storage = memoryStorage();
    storage.setItem('another-app', 'preserve');
    const repository = localRepository(storage);
    repository.save({ schemaVersion: 1, session: null, results: [completed()] });
    expect(repository.clear()).toBeNull();
    expect(repository.load().state.results).toEqual([]);
    expect(storage.getItem('another-app')).toBe('preserve');
  });
});
