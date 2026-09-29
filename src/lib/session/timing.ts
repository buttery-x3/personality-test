import type { Question, QuestionTiming, TimingSummary, TimingVisit } from '../types';

/** Inject a clock for deterministic tests. Persisted visits are raw, auditable data.
 * A live visit is kept out of storage-specific code. Hidden intervals never count.
 */
export class TimingRecorder {
  private active: {
    record: QuestionTiming;
    visit: TimingVisit;
    last: number;
    visible: boolean;
  } | null = null;
  constructor(
    private records: Record<string, QuestionTiming>,
    private now: () => number = Date.now
  ) {}

  enter(question: Question, visible = true) {
    this.leave(false);
    const time = this.now();
    const record = (this.records[question.id] ??= {
      questionId: question.id,
      textLength: question.text.length,
      firstSelectedAt: null,
      firstResponseMs: null,
      finalSubmittedAt: null,
      totalActiveMs: 0,
      answerChanged: false,
      changeCount: 0,
      returned: false,
      visits: []
    });
    const returned = record.visits.length > 0;
    record.returned ||= returned;
    const visit: TimingVisit = {
      activatedAt: new Date(time).toISOString(),
      endedAt: null,
      firstSelectedAt: null,
      submittedAt: null,
      activeMs: 0,
      hiddenMs: 0,
      firstResponseMs: null,
      valid: true,
      returned
    };
    record.visits.push(visit);
    this.active = { record, visit, last: time, visible };
  }

  checkpoint() {
    if (!this.active) return;
    const time = this.now();
    const elapsed = Math.max(0, time - this.active.last);
    if (this.active.visible) {
      this.active.visit.activeMs += elapsed;
      this.active.record.totalActiveMs += elapsed;
    } else this.active.visit.hiddenMs += elapsed;
    this.active.last = time;
  }

  setVisible(visible: boolean) {
    this.checkpoint();
    if (this.active) this.active.visible = visible;
  }

  select(changed: boolean) {
    if (!this.active) return;
    this.checkpoint();
    const { record, visit } = this.active;
    const timestamp = new Date(this.now()).toISOString();
    if (!visit.firstSelectedAt) {
      visit.firstSelectedAt = timestamp;
      visit.firstResponseMs = visit.activeMs;
    }
    if (!record.firstSelectedAt) {
      record.firstSelectedAt = timestamp;
      record.firstResponseMs = record.totalActiveMs;
    }
    if (changed) {
      record.changeCount++;
      record.answerChanged = true;
    }
  }

  leave(submitted: boolean) {
    if (!this.active) return;
    this.checkpoint();
    const timestamp = new Date(this.now()).toISOString();
    this.active.visit.endedAt = timestamp;
    if (submitted) {
      this.active.visit.submittedAt = timestamp;
      this.active.record.finalSubmittedAt = timestamp;
    }
    this.active = null;
  }
}

/** A reload/crash leaves an open visit. Its unknown wall time must not be added.
 * Exclude that visit's first-response latency rather than estimating it.
 */
export function recoverInterruptedTiming(records: Record<string, QuestionTiming>) {
  for (const record of Object.values(records))
    for (const visit of record.visits) {
      if (!visit.endedAt) {
        visit.valid = false;
        visit.invalidReason =
          'Interrupted by reload, tab closure, or another session; unobserved time excluded.';
        visit.endedAt = visit.submittedAt ?? visit.firstSelectedAt ?? visit.activatedAt;
      }
    }
}

export function summarizeTiming(records: Record<string, QuestionTiming>): TimingSummary {
  const samples = Object.values(records).flatMap((record) => {
    // The first selection only; later revision visits never replace the baseline.
    const index = record.visits.findIndex((v) => v.firstSelectedAt !== null);
    const priorVisitsValid = index >= 0 && record.visits.slice(0, index + 1).every((v) => v.valid);
    return priorVisitsValid &&
      record.firstResponseMs !== null &&
      Number.isFinite(record.firstResponseMs)
      ? [{ questionId: record.questionId, firstResponseMs: record.firstResponseMs }]
      : [];
  });
  const times = samples.map((s) => s.firstResponseMs).sort((a, b) => a - b);
  const n = times.length;
  const medianMs = n ? (times[Math.floor((n - 1) / 2)] + times[Math.floor(n / 2)]) / 2 : null;
  const meanMs = n ? times.reduce((s, t) => s + t, 0) / n : null;
  const varianceMsSquared =
    meanMs !== null ? times.reduce((s, t) => s + (t - meanMs) ** 2, 0) / n : null;
  const observations = samples.map((s) => ({
    ...s,
    relativeToMedian: medianMs && medianMs > 0 ? s.firstResponseMs / medianMs : null
  }));
  const sorted = [...observations].sort((a, b) => a.firstResponseMs - b.firstResponseMs);
  return {
    count: n,
    excludedCount: Object.keys(records).length - n,
    medianMs,
    meanMs,
    varianceMsSquared,
    standardDeviationMs: varianceMsSquared === null ? null : Math.sqrt(varianceMsSquared),
    observations,
    fastest: sorted.slice(0, 3),
    slowest: sorted.slice(-3).reverse(),
    unusuallyFast: sorted.filter((o) => o.relativeToMedian !== null && o.relativeToMedian < 0.5),
    unusuallySlow: [...sorted]
      .reverse()
      .filter((o) => o.relativeToMedian !== null && o.relativeToMedian > 2)
  };
}
