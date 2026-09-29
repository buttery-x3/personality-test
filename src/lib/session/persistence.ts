import type { CompletedResult, SurveySession } from '../types';
import { SURVEY_VERSION, questions } from '../data/questions';
import { dimensions } from '../data/frameworks';

export const STORAGE_KEY = 'manyfold.local.v1';
export interface SavedState {
  schemaVersion: 1;
  session: SurveySession | null;
  results: CompletedResult[];
}
export interface Repository {
  load(): { state: SavedState; warning: string | null };
  save(state: SavedState): string | null;
  clear(): string | null;
}
const empty = (): SavedState => ({ schemaVersion: 1, session: null, results: [] });
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const date = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const optionalDate = (v: unknown) => v === null || date(v);
const answersValid = (v: unknown) =>
  object(v) && Object.values(v).every((x) => [-1, -0.5, 0, 0.5, 1].includes(x as number));
function timingValid(v: unknown): boolean {
  return (
    object(v) &&
    Object.values(v).every(
      (t) =>
        object(t) &&
        typeof t.questionId === 'string' &&
        finite(t.totalActiveMs) &&
        t.totalActiveMs >= 0 &&
        finite(t.textLength) &&
        Number.isInteger(t.changeCount) &&
        typeof t.answerChanged === 'boolean' &&
        typeof t.returned === 'boolean' &&
        optionalDate(t.firstSelectedAt) &&
        optionalDate(t.finalSubmittedAt) &&
        (t.firstResponseMs === null || finite(t.firstResponseMs)) &&
        Array.isArray(t.visits) &&
        t.visits.every(
          (visit) =>
            object(visit) &&
            date(visit.activatedAt) &&
            finite(visit.activeMs) &&
            finite(visit.hiddenMs) &&
            optionalDate(visit.endedAt) &&
            optionalDate(visit.firstSelectedAt) &&
            optionalDate(visit.submittedAt) &&
            (visit.firstResponseMs === null || finite(visit.firstResponseMs)) &&
            typeof visit.valid === 'boolean' &&
            typeof visit.returned === 'boolean'
        )
    )
  );
}
function validResult(v: unknown): v is CompletedResult {
  if (
    !object(v) ||
    v.schemaVersion !== 1 ||
    typeof v.surveyVersion !== 'string' ||
    typeof v.scoringVersion !== 'string' ||
    !date(v.completedAt) ||
    !Array.isArray(v.questionIds) ||
    !Array.isArray(v.questions) ||
    !answersValid(v.answers) ||
    !timingValid(v.timing) ||
    !object(v.scoring) ||
    !object(v.scoring.dimensions) ||
    !object(v.timingSummary)
  )
    return false;
  const s = v.scoring;
  const known = new Set(dimensions.map((d) => d.id as string));
  return (
    dimensions.every((d) => {
      const value = (s.dimensions as Record<string, unknown>)[d.id];
      return (
        object(value) &&
        [
          'raw',
          'positiveCapacity',
          'negativeCapacity',
          'normalized',
          'mappedQuestions',
          'answeredQuestions'
        ].every((k) => finite(value[k])) &&
        Array.isArray(value.contributions) &&
        value.contributions.every(
          (c) =>
            object(c) &&
            typeof c.questionId === 'string' &&
            (c.answer === null || [-1, -0.5, 0, 0.5, 1].includes(c.answer as number)) &&
            finite(c.agreeWeight) &&
            finite(c.disagreeWeight) &&
            finite(c.contribution)
        )
      );
    }) &&
    ['jung', 'enneagram', 'disc', 'riasec', 'houses'].every((k) => object(s[k])) &&
    typeof (s.jung as Record<string, unknown>).type === 'string' &&
    Array.isArray((s.jung as Record<string, unknown>).axes) &&
    ((s.jung as Record<string, unknown>).axes as unknown[]).every(
      (a) =>
        object(a) &&
        known.has(a.left as string) &&
        known.has(a.right as string) &&
        finite(a.leftPercent) &&
        finite(a.rightPercent)
    ) &&
    ['enneagram', 'disc', 'riasec', 'houses'].every((k) => {
      const ranking = (s[k] as Record<string, unknown>).ranking;
      return (
        Array.isArray(ranking) &&
        ranking.length >= (k === 'enneagram' ? 9 : k === 'riasec' ? 6 : 4) &&
        ranking.every((id) => typeof id === 'string' && known.has(id) && id.startsWith(k + '.'))
      );
    }) &&
    ['enneagram', 'disc', 'riasec'].every(
      (k) => typeof (s[k] as Record<string, unknown>).code === 'string'
    ) &&
    known.has((s.houses as Record<string, unknown>).primary as string) &&
    ['medianMs', 'meanMs', 'standardDeviationMs', 'varianceMsSquared'].every(
      (k) =>
        (v.timingSummary as Record<string, unknown>)[k] === null ||
        finite((v.timingSummary as Record<string, unknown>)[k])
    ) &&
    ['observations', 'fastest', 'slowest', 'unusuallyFast', 'unusuallySlow'].every((k) => {
      const rows = (v.timingSummary as Record<string, unknown>)[k];
      return (
        Array.isArray(rows) &&
        rows.every(
          (o) =>
            object(o) &&
            typeof o.questionId === 'string' &&
            finite(o.firstResponseMs) &&
            (o.relativeToMedian === null || finite(o.relativeToMedian))
        )
      );
    }) &&
    v.questions.every(
      (q) =>
        object(q) &&
        typeof q.id === 'string' &&
        typeof q.text === 'string' &&
        Array.isArray(q.mappings) &&
        q.mappings.every(
          (m) =>
            object(m) &&
            known.has(m.dimension as string) &&
            finite(m.agreeWeight) &&
            (m.disagreeWeight === undefined || finite(m.disagreeWeight))
        )
    )
  );
}

/** Storage is injected, so a future repository can replace localStorage. No network calls. */
export function localRepository(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): Repository {
  return {
    load() {
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) return { state: empty(), warning: null };
        const data: unknown = JSON.parse(raw);
        if (!object(data) || data.schemaVersion !== 1 || !Array.isArray(data.results))
          throw new Error('Invalid saved data');
        const results = data.results.filter(validResult);
        let warning =
          results.length === data.results.length
            ? null
            : 'Some saved results could not be read. Readable results are still available.';
        let session: SurveySession | null = null;
        const s = data.session;
        if (s !== null) {
          const valid =
            object(s) &&
            s.schemaVersion === 1 &&
            s.surveyVersion === SURVEY_VERSION &&
            date(s.startedAt) &&
            Array.isArray(s.questionIds) &&
            s.questionIds.length === questions.length &&
            s.questionIds.every((id, i) => id === questions[i].id) &&
            Number.isInteger(s.currentIndex) &&
            Number(s.currentIndex) >= 0 &&
            Number(s.currentIndex) < questions.length &&
            answersValid(s.answers) &&
            Object.keys(s.answers as object).every((id) => questions.some((q) => q.id === id)) &&
            timingValid(s.timing);
          if (valid) session = s as unknown as SurveySession;
          else
            warning =
              'The unfinished survey belongs to an incompatible version or could not be read. Start a new survey; readable completed results are preserved.';
        }
        return { state: { schemaVersion: 1, session, results }, warning };
      } catch {
        return {
          state: empty(),
          warning:
            'Local saved data is unavailable or could not be read. You can still take the survey and export your result.'
        };
      }
    },
    save(state) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        return null;
      } catch {
        return 'Your browser could not save this session. Keep this tab open and export your result when finished.';
      }
    },
    clear() {
      try {
        storage.removeItem(STORAGE_KEY);
        return null;
      } catch {
        return 'Your browser could not remove the saved data.';
      }
    }
  };
}
