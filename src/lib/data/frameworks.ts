import type { Dimension, DimensionId, Framework } from '../types';

const d = (id: DimensionId, label: string, short: string, description: string): Dimension => ({
  id,
  label,
  short,
  description
});
export const frameworks: Framework[] = [
  {
    id: 'big5',
    name: 'Big Five',
    eyebrow: 'Your everyday tendencies',
    color: '#47745c',
    description:
      'Five broad, continuous traits: how you explore, organise, connect, cooperate, and respond to pressure.',
    dimensions: [
      d(
        'big5.O',
        'Openness',
        'O',
        'Interest in unfamiliar ideas, experiences, and creative possibilities.'
      ),
      d(
        'big5.C',
        'Conscientiousness',
        'C',
        'Preference for preparation, follow-through, and orderly work.'
      ),
      d(
        'big5.E',
        'Extraversion',
        'E',
        'Tendency to seek social engagement, activity, and outward expression.'
      ),
      d('big5.A', 'Agreeableness', 'A', 'Tendency to consider others, cooperate, and accommodate.'),
      d(
        'big5.S',
        'Emotional stability',
        'S',
        'Tendency to remain steady and recover after uncertainty or setbacks.'
      )
    ]
  },
  {
    id: 'jung',
    name: 'Jungian / 16-type',
    eyebrow: 'How you tend to approach things',
    color: '#a1804b',
    description:
      'Four preference balances form a familiar four-letter profile. A near-even balance is a small lean, not a firm category.',
    dimensions: [
      d('jung.E', 'Extraversion', 'E', 'Processing through interaction and outward activity.'),
      d('jung.I', 'Introversion', 'I', 'Processing privately and reflecting before engaging.'),
      d('jung.S', 'Sensing', 'S', 'Attending to concrete details and direct experience.'),
      d('jung.N', 'Intuition', 'N', 'Attending to patterns, interpretations, and possibilities.'),
      d('jung.T', 'Thinking', 'T', 'Using consistency and impersonal criteria in decisions.'),
      d('jung.F', 'Feeling', 'F', 'Using personal values and effects on people in decisions.'),
      d('jung.J', 'Judging', 'J', 'Preferring decisions, preparation, and closure.'),
      d('jung.P', 'Perceiving', 'P', 'Preferring adaptability and keeping options open.')
    ]
  },
  {
    id: 'enneagram',
    name: 'Enneagram',
    eyebrow: 'What pulls you forward',
    color: '#b77963',
    description:
      'Nine possible motivational themes. Treat the strongest themes as prompts for reflection, rather than fixed identities.',
    dimensions: [
      d('enneagram.1', 'The reformer', '1', 'Improving what falls short of an internal standard.'),
      d('enneagram.2', 'The helper', '2', 'Being useful and personally connected to others.'),
      d(
        'enneagram.3',
        'The achiever',
        '3',
        'Progress, effectiveness, and recognition for contribution.'
      ),
      d(
        'enneagram.4',
        'The individualist',
        '4',
        'Personal meaning, authenticity, and distinct expression.'
      ),
      d('enneagram.5', 'The investigator', '5', 'Understanding, competence, and space to think.'),
      d('enneagram.6', 'The loyalist', '6', 'Reliability, preparation, and trusted relationships.'),
      d(
        'enneagram.7',
        'The enthusiast',
        '7',
        'Possibility, variety, and enjoyable new experiences.'
      ),
      d(
        'enneagram.8',
        'The challenger',
        '8',
        'Autonomy, direct action, and protecting boundaries.'
      ),
      d('enneagram.9', 'The peacemaker', '9', 'Harmony, continuity, and making room for others.')
    ]
  },
  {
    id: 'disc',
    name: 'DISC',
    eyebrow: 'Your way of working with others',
    color: '#6c83a1',
    description:
      'A lens on behavioural style: directing, energising, supporting, and checking. Most profiles contain a blend.',
    dimensions: [
      d(
        'disc.D',
        'Dominance',
        'D',
        'Moving things forward through directness and decisive action.'
      ),
      d('disc.I', 'Influence', 'I', 'Building momentum through enthusiasm and connection.'),
      d(
        'disc.S',
        'Steadiness',
        'S',
        'Creating continuity through patience and dependable support.'
      ),
      d(
        'disc.C',
        'Conscientiousness',
        'C',
        'Checking standards, accuracy, and supporting evidence.'
      )
    ]
  },
  {
    id: 'riasec',
    name: 'Holland / RIASEC',
    eyebrow: 'What you might enjoy doing',
    color: '#887494',
    description:
      'Six activity-interest themes. Your three-letter code highlights activities to explore; it is not a career prescription.',
    dimensions: [
      d(
        'riasec.R',
        'Realistic',
        'R',
        'Making, repairing, handling tools, and practical physical activity.'
      ),
      d(
        'riasec.I',
        'Investigative',
        'I',
        'Researching, analysing, and figuring out how things work.'
      ),
      d('riasec.A', 'Artistic', 'A', 'Creating, designing, performing, and expressing ideas.'),
      d('riasec.S', 'Social', 'S', 'Teaching, supporting, and helping people develop.'),
      d(
        'riasec.E',
        'Enterprising',
        'E',
        'Leading, persuading, negotiating, and initiating projects.'
      ),
      d(
        'riasec.C',
        'Conventional',
        'C',
        'Organising records, maintaining systems, and working with detail.'
      )
    ]
  },
  {
    id: 'houses',
    name: 'Hogwarts houses',
    eyebrow: 'A little imaginative licence',
    color: '#b28b38',
    description:
      'A playful affinity map for courage, curiosity, loyalty, and ambition. Entirely recreational, with no official sorting algorithm.',
    dimensions: [
      d('houses.G', 'Gryffindor', 'G', 'An affinity with courage, conviction, and taking action.'),
      d('houses.R', 'Ravenclaw', 'R', 'An affinity with curiosity, originality, and learning.'),
      d('houses.H', 'Hufflepuff', 'H', 'An affinity with fairness, patience, and loyalty.'),
      d(
        'houses.S',
        'Slytherin',
        'S',
        'An affinity with ambition, resourcefulness, and strategic intent.'
      )
    ]
  }
];
export const dimensions = frameworks.flatMap((f) => f.dimensions);
export const dimensionById = Object.fromEntries(dimensions.map((d) => [d.id, d])) as Record<
  DimensionId,
  Dimension
>;
export const jungPairs: [DimensionId, DimensionId][] = [
  ['jung.E', 'jung.I'],
  ['jung.S', 'jung.N'],
  ['jung.T', 'jung.F'],
  ['jung.J', 'jung.P']
];
