import { SURVEY_VERSION, SCORING_VERSION } from '../data/questions';
import { scoreSurvey } from '../engine/scoring';
import type { Answer, CompletedResult, Question, SurveySession } from '../types';
import { recoverInterruptedTiming, summarizeTiming, TimingRecorder } from './timing';

export function createSession(
  questions: Question[],
  now = new Date().toISOString()
): SurveySession {
  return {
    schemaVersion: 1,
    surveyVersion: SURVEY_VERSION,
    startedAt: now,
    updatedAt: now,
    currentIndex: 0,
    questionIds: questions.map((q) => q.id),
    answers: {},
    timing: {}
  };
}

export class SurveyController {
  readonly timer: TimingRecorder;
  constructor(
    readonly session: SurveySession,
    readonly questions: Question[],
    now: () => number = Date.now
  ) {
    recoverInterruptedTiming(session.timing);
    this.timer = new TimingRecorder(session.timing, now);
  }
  enter(visible = true) {
    this.timer.enter(this.questions[this.session.currentIndex], visible);
  }
  select(answer: Answer) {
    const id = this.questions[this.session.currentIndex].id;
    const previous = this.session.answers[id];
    this.timer.select(previous !== undefined && previous !== answer);
    this.session.answers[id] = answer;
  }
  move(index: number, submitted = false, visible = true) {
    this.timer.leave(submitted);
    this.session.currentIndex = Math.max(0, Math.min(this.questions.length - 1, index));
    this.enter(visible);
  }
  finish(): CompletedResult {
    if (this.questions.some((q) => this.session.answers[q.id] === undefined))
      throw new Error('Answer every question before completing the survey.');
    this.timer.leave(true);
    return structuredClone({
      schemaVersion: 1,
      surveyVersion: this.session.surveyVersion,
      scoringVersion: SCORING_VERSION,
      startedAt: this.session.startedAt,
      completedAt: new Date().toISOString(),
      questionIds: this.session.questionIds,
      questions: this.questions,
      answers: this.session.answers,
      scoring: scoreSurvey(this.questions, this.session.answers),
      timing: this.session.timing,
      timingSummary: summarizeTiming(this.session.timing)
    });
  }
}
