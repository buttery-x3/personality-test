import { describe, expect, it } from 'vitest';
import { scoreSurvey, evidence } from './scoring';
import { normalize } from './normalization';
import { validateCoverage } from './coverage';
import { questions } from '../data/questions';
import { dimensions } from '../data/frameworks';
import type { Answer, Answers, DimensionId, Mapping, Question } from '../types';

const item = (id: string, mappings: Mapping[]): Question => ({
  id,
  text: `Original item ${id}`,
  answerType: 'agreement',
  rationale: 'Test fixture.',
  tags: [],
  mappings
});
const mapping = (dimension: DimensionId, agreeWeight = 1, disagreeWeight?: number): Mapping => ({
  dimension,
  agreeWeight,
  disagreeWeight
});

describe('weighted evidence and normalization', () => {
  it('uses positive mappings and five-point magnitudes', () => {
    const m = mapping('big5.O', 0.6);
    expect(evidence(m, 1)).toBe(0.6);
    expect(evidence(m, 0.5)).toBe(0.3);
    expect(evidence(m, -0.5)).toBe(-0.3);
    expect(evidence(m, -1)).toBe(-0.6);
  });
  it('reverses a negative mapping', () => {
    expect(evidence(mapping('big5.S', -0.8), 1)).toBe(-0.8);
    expect(evidence(mapping('big5.S', -0.8), -1)).toBe(0.8);
  });
  it('uses asymmetric negative endpoints without multiplying by a negative twice', () => {
    const m = mapping('riasec.I', 0.55, -0.15);
    expect(evidence(m, 1)).toBe(0.55);
    expect(evidence(m, -1)).toBe(-0.15);
    expect(evidence(m, -0.5)).toBe(-0.075);
    expect(evidence(m, 0)).toBe(0);
  });
  it('supports asymmetric mappings whose disagreement is positive evidence', () => {
    const m = mapping('enneagram.3', -0.4, 0.2);
    expect(evidence(m, -1)).toBe(0.2);
    expect(evidence(m, 0.5)).toBe(-0.2);
    const s = scoreSurvey([item('a', [m])], { a: -1 }).dimensions['enneagram.3'];
    expect(s.positiveCapacity).toBe(0.2);
    expect(s.negativeCapacity).toBe(0.4);
    expect(s.normalized).toBe(100);
  });
  it('anchors neutral at 50 despite asymmetric capacity', () => {
    const bank = [item('a', [mapping('riasec.I', 0.55, -0.15)])];
    expect(scoreSurvey(bank, { a: 0 }).dimensions['riasec.I'].normalized).toBe(50);
    expect(scoreSurvey(bank, { a: 1 }).dimensions['riasec.I'].normalized).toBe(100);
    expect(scoreSurvey(bank, { a: -1 }).dimensions['riasec.I'].normalized).toBe(0);
    expect(scoreSurvey(bank, { a: 0.5 }).dimensions['riasec.I'].normalized).toBe(75);
  });
  it('normalizes by possible evidence, not item count or raw rank', () => {
    const bank = [
      item('a', [mapping('houses.G', 1), mapping('houses.R', 0.1)]),
      item('b', [mapping('houses.R', 0.7)]),
      item('c', [mapping('houses.R', 0.4)])
    ];
    const scores = scoreSurvey(bank, { a: 0.5, b: 0.5, c: 0.5 }).dimensions;
    expect(scores['houses.G'].raw).not.toBe(scores['houses.R'].raw);
    expect(scores['houses.G'].normalized).toBe(75);
    expect(scores['houses.R'].normalized).toBe(75);
  });
  it('keeps missing items neutral without removing their possible capacity', () => {
    const bank = [item('a', [mapping('big5.O')]), item('b', [mapping('big5.O')])];
    const output = scoreSurvey(bank, { a: 1 });
    expect(output.dimensions['big5.O'].normalized).toBe(75);
    expect(output.dimensions['big5.O'].answeredQuestions).toBe(1);
    expect(output.dimensions['big5.O'].contributions[1].answer).toBeNull();
    expect(output.answeredCount).toBe(1);
  });
  it('returns finite midpoint scores for an empty bank or no answers', () => {
    for (const bank of [[], questions]) {
      expect(
        Object.values(scoreSurvey(bank, {}).dimensions).every((s) => s.normalized === 50)
      ).toBe(true);
    }
    expect(normalize(0, 0, 0)).toBe(50);
    expect(normalize(4, 1, 1)).toBe(100);
    expect(normalize(-4, 1, 1)).toBe(0);
  });
  it('replaces revised answers rather than accumulating them', () => {
    const bank = [item('a', [mapping('big5.O')])];
    const answers: Answers = { a: 1 };
    expect(scoreSurvey(bank, answers).dimensions['big5.O'].raw).toBe(1);
    answers.a = -0.5;
    expect(scoreSurvey(bank, answers).dimensions['big5.O'].raw).toBe(-0.5);
  });
  it('ignores invalid answers and unknown answer IDs', () => {
    const output = scoreSurvey([item('a', [mapping('big5.O')])], { a: 12 as Answer, unused: 1 });
    expect(output.answeredCount).toBe(0);
    expect(output.dimensions['big5.O'].normalized).toBe(50);
  });
});

describe('framework projections', () => {
  it('scores both Jungian poles and returns INTP', () => {
    const bank = [
      item('a', [
        mapping('jung.I'),
        mapping('jung.E', -1),
        mapping('jung.N'),
        mapping('jung.S', -1),
        mapping('jung.T'),
        mapping('jung.F', -1),
        mapping('jung.P'),
        mapping('jung.J', -1)
      ])
    ];
    const output = scoreSurvey(bank, { a: 1 });
    expect(output.jung.type).toBe('INTP');
    expect(output.jung.axes[0].leftPercent).toBe(0);
    expect(output.jung.axes[0].rightPercent).toBe(100);
    expect(output.jung.tentative).toBe(false);
  });
  it('does not pretend an exact Jungian tie is a distinct preference', () => {
    const output = scoreSurvey(questions, {});
    expect(output.jung.type).toBe('XXXX');
    expect(output.jung.tentative).toBe(true);
  });
  it('ranks Enneagram and chooses the stronger adjacent wing, not the global runner-up', () => {
    const bank = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) =>
      item(String(n), [mapping(`enneagram.${n}` as DimensionId)])
    );
    const output = scoreSurvey(bank, { '5': 1, '2': 1, '4': 0.5, '6': 0 });
    expect(output.enneagram.tied).toBe(true);
    expect(output.enneagram.wing).toBeNull();
    const distinct = scoreSurvey(bank, { '5': 1, '2': 0.5, '4': 0.5, '6': 0 });
    expect(distinct.enneagram.code).toBe('5w4');
    expect(distinct.enneagram.ranking[0]).toBe('enneagram.5');
  });
  it('wraps Enneagram wings at 1 and 9 and omits weak or equal wings', () => {
    const bank = [1, 2, 8, 9].map((n) =>
      item(String(n), [mapping(`enneagram.${n}` as DimensionId)])
    );
    expect(scoreSurvey(bank, { '1': 1, '9': 0.5 }).enneagram.code).toBe('1w9');
    expect(scoreSurvey(bank, { '9': 1, '1': 0.5 }).enneagram.code).toBe('9w1');
    expect(scoreSurvey(bank, { '1': 1 }).enneagram.wing).toBeNull();
    expect(scoreSurvey(bank, { '1': 1, '2': 0.5, '9': 0.5 }).enneagram.wing).toBeNull();
  });
  it('returns a normalized RIASEC top-three code', () => {
    const bank = ['R', 'I', 'A', 'S', 'E', 'C'].map((l) =>
      item(l, [mapping(`riasec.${l}` as DimensionId)])
    );
    const output = scoreSurvey(bank, { I: 1, A: 0.5, S: 0, R: -0.5, E: -1, C: -1 });
    expect(output.riasec.code).toBe('IAS');
    expect(output.riasec.tied).toBe(false);
  });
  it('reports deterministic ties at the RIASEC cutoff', () => {
    const output = scoreSurvey(questions, {});
    expect(output.riasec.tied).toBe(true);
    expect(output.riasec.code).toBe('RIA');
  });
  it('ranks house affinities by normalized score', () => {
    const bank = [
      item('a', [mapping('houses.H')]),
      item('b', [mapping('houses.R', 2)]),
      item('c', [mapping('houses.S', 0.1)])
    ];
    const output = scoreSurvey(bank, { a: 0, b: 0.5, c: 1 });
    expect(output.houses.primary).toBe('houses.S');
    expect(output.houses.tied).toBe(false);
  });
  it('shows a DISC blend only for a nearby secondary style above the midpoint', () => {
    const bank = [
      item('a', [mapping('disc.D')]),
      item('b', [mapping('disc.I')]),
      item('c', [mapping('disc.D')])
    ];
    expect(scoreSurvey(bank, { a: 1, b: 1, c: 0.5 }).disc.code).toBe('I');
    expect(scoreSurvey(bank, { a: 1, b: 0.5, c: 0 }).disc.code).toBe('D/I');
  });
});

describe('the authored bank', () => {
  it('has original complete definitions and cross-framework reuse', () => {
    expect(questions).toHaveLength(72);
    const audit = validateCoverage(questions);
    expect(audit.errors).toEqual([]);
    expect(audit.warnings).toEqual([]);
    expect(audit.rows).toHaveLength(36);
    expect(
      questions.every((q) => new Set(q.mappings.map((m) => m.dimension.split('.')[0])).size >= 3)
    ).toBe(true);
    expect(questions.filter((q) => q.baseline).length).toBeGreaterThanOrEqual(6);
  });
  it('flags missing, single-dimension, duplicate, sparse, and unbalanced definitions', () => {
    const bank = [
      item('a', []),
      item('b', [mapping('big5.O', 9)]),
      item('b', [mapping('big5.O', 1), mapping('big5.O', 1)])
    ];
    const report = validateCoverage(bank);
    expect(report.errors.some((e) => e.includes('no mappings'))).toBe(true);
    expect(report.errors.some((e) => e.includes('Duplicate question'))).toBe(true);
    expect(report.errors.some((e) => e.includes('duplicate mapping'))).toBe(true);
    expect(report.warnings.some((e) => e.includes('only one dimension'))).toBe(true);
    expect(report.warnings.some((e) => e.includes('low coverage'))).toBe(true);
    expect(report.warnings.some((e) => e.includes('2.5×'))).toBe(true);
  });
  it('keeps scores bounded across extreme and mixed answer profiles', () => {
    for (let profile = 0; profile < 50; profile++) {
      const answers = Object.fromEntries(
        questions.map((q, i) => [
          q.id,
          [-1, -0.5, 0, 0.5, 1][profile < 5 ? profile : (i * 7 + profile * 3) % 5]
        ])
      ) as Answers;
      const result = scoreSurvey(questions, answers);
      expect(result.answeredCount).toBe(72);
      for (const d of dimensions) {
        expect(Number.isFinite(result.dimensions[d.id].normalized)).toBe(true);
        expect(result.dimensions[d.id].normalized).toBeGreaterThanOrEqual(0);
        expect(result.dimensions[d.id].normalized).toBeLessThanOrEqual(100);
      }
      for (const axis of result.jung.axes)
        expect(axis.leftPercent + axis.rightPercent).toBeCloseTo(100);
    }
  });
});
