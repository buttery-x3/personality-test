import { dimensions, frameworks, jungPairs } from '../data/frameworks';
import type {
  Answer,
  Answers,
  DimensionId,
  DimensionScore,
  Mapping,
  Question,
  ScoringOutput
} from '../types';
import { normalize } from './normalization';

export function evidence(mapping: Mapping, answer: Answer): number {
  if (answer === 0) return 0;
  return answer >= 0
    ? answer * mapping.agreeWeight
    : -answer * (mapping.disagreeWeight ?? -mapping.agreeWeight);
}

export function scoreSurvey(questions: Question[], answers: Answers): ScoringOutput {
  const scores = Object.fromEntries(
    dimensions.map(({ id }) => [
      id,
      {
        id,
        raw: 0,
        positiveCapacity: 0,
        negativeCapacity: 0,
        normalized: 50,
        mappedQuestions: 0,
        answeredQuestions: 0,
        contributions: []
      }
    ])
  ) as unknown as Record<DimensionId, DimensionScore>;
  let answeredCount = 0;
  for (const question of questions) {
    const value = answers[question.id];
    const answered = [-1, -0.5, 0, 0.5, 1].includes(value);
    if (answered) answeredCount++;
    for (const mapping of question.mappings) {
      const score = scores[mapping.dimension];
      if (!score) throw new Error(`Unknown dimension: ${mapping.dimension}`);
      const disagree = mapping.disagreeWeight ?? -mapping.agreeWeight;
      score.positiveCapacity += Math.max(0, mapping.agreeWeight, disagree);
      score.negativeCapacity += -Math.min(0, mapping.agreeWeight, disagree);
      score.mappedQuestions++;
      if (answered) score.answeredQuestions++;
      const contribution = answered ? evidence(mapping, value) : 0;
      score.raw += contribution;
      score.contributions.push({
        questionId: question.id,
        answer: answered ? value : null,
        agreeWeight: mapping.agreeWeight,
        disagreeWeight: disagree,
        contribution
      });
    }
  }
  for (const score of Object.values(scores)) {
    score.normalized = normalize(score.raw, score.positiveCapacity, score.negativeCapacity);
  }
  const axes = jungPairs.map(([left, right]) => {
    const leftPercent = (100 + scores[left].normalized - scores[right].normalized) / 2;
    const tied = Math.abs(leftPercent - 50) < 1e-8;
    return {
      left,
      right,
      leftPercent,
      rightPercent: 100 - leftPercent,
      letter: tied ? 'X' : (leftPercent > 50 ? left : right).split('.')[1],
      tied
    };
  });
  const rank = (framework: string): DimensionId[] =>
    frameworks
      .find((f) => f.id === framework)!
      .dimensions.map((d) => d.id)
      .sort((a, b) => scores[b].normalized - scores[a].normalized);
  const ties = (ranking: DimensionId[], cutoff = 1) =>
    Math.abs(scores[ranking[cutoff - 1]].normalized - scores[ranking[cutoff]].normalized) < 1e-8;
  const enneagram = rank('enneagram');
  const primary = enneagram[0].split('.')[1];
  const number = Number(primary);
  const neighbours = [number === 1 ? 9 : number - 1, number === 9 ? 1 : number + 1]
    .map((n) => `enneagram.${n}` as DimensionId)
    .sort((a, b) => scores[b].normalized - scores[a].normalized);
  const wing =
    scores[neighbours[0]].normalized > 50 && !ties(neighbours) && !ties(enneagram)
      ? neighbours[0].split('.')[1]
      : null;
  const disc = rank('disc');
  const blend =
    scores[disc[1]].normalized > 50 &&
    scores[disc[0]].normalized - scores[disc[1]].normalized <= 12;
  const riasec = rank('riasec');
  const houses = rank('houses');
  return {
    dimensions: scores,
    answeredCount,
    presentedCount: questions.length,
    jung: {
      type: axes.map((a) => a.letter).join(''),
      axes,
      tentative: axes.some((a) => Math.abs(a.leftPercent - 50) < 5)
    },
    enneagram: {
      primary,
      wing,
      code: wing ? `${primary}w${wing}` : primary,
      tied: ties(enneagram),
      ranking: enneagram
    },
    disc: {
      code: disc
        .slice(0, blend ? 2 : 1)
        .map((d) => d.split('.')[1])
        .join('/'),
      ranking: disc,
      tied: ties(disc)
    },
    riasec: {
      code: riasec
        .slice(0, 3)
        .map((d) => d.split('.')[1])
        .join(''),
      ranking: riasec,
      tied: ties(riasec) || ties(riasec, 2) || ties(riasec, 3)
    },
    houses: { primary: houses[0], ranking: houses, tied: ties(houses) }
  };
}
