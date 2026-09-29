import type { DimensionId, Question } from '../types';

export const SURVEY_VERSION = 'manyfold-1.0.0';
export const SCORING_VERSION = 'neutral-centred-capacity-1';

// A number is symmetric evidence. A tuple is [strong agreement, strong disagreement].
// Weak negative endpoints intentionally avoid treating absence of an interest as its opposite.
type Weights = Partial<Record<DimensionId, number | [number, number]>>;
function q(
  id: string,
  text: string,
  tags: string[],
  rationale: string,
  weights: Weights,
  answerType: Question['answerType'] = 'agreement',
  baseline = false
): Question {
  return {
    id,
    text,
    tags,
    rationale,
    answerType,
    baseline,
    mappings: Object.entries(weights).map(([dimension, weight]) => ({
      dimension: dimension as DimensionId,
      agreeWeight: typeof weight === 'number' ? weight : weight![0],
      ...(typeof weight === 'number' ? {} : { disagreeWeight: weight![1] })
    }))
  };
}

// The order deliberately mixes concrete preferences, behaviour, and motivation.
// These original items and expert-judgment weights have not been psychometrically validated.
export const questions: Question[] = [
  q(
    'q01',
    'When a group is waiting for someone to make the first move, I usually suggest a direction.',
    ['initiative', 'group decisions'],
    'Taking the first step is evidence of social initiative and directing behaviour; it weakly suggests achievement and courage.',
    {
      'big5.E': 0.6,
      'jung.E': 0.45,
      'jung.I': -0.45,
      'disc.D': 0.8,
      'disc.I': 0.3,
      'riasec.E': [0.7, -0.3],
      'enneagram.8': [0.55, -0.25],
      'enneagram.3': [0.3, -0.1],
      'houses.G': 0.55
    }
  ),
  q(
    'q02',
    'Figuring out why an unfamiliar device has stopped working.',
    ['practical curiosity', 'problem solving'],
    'Troubleshooting combines investigative interest with practical activity. Curiosity, analysis, and knowledge-seeking are secondary signals.',
    {
      'riasec.I': [1, -0.45],
      'riasec.R': [0.7, -0.3],
      'big5.O': 0.35,
      'jung.T': 0.3,
      'jung.F': -0.3,
      'enneagram.5': [0.65, -0.2],
      'disc.C': 0.4,
      'houses.R': 0.55
    },
    'interest',
    true
  ),
  q(
    'q03',
    'I enjoy a free afternoon more when I have left its shape undecided.',
    ['spontaneity', 'novelty'],
    'Unscheduled time signals flexibility and appetite for possibilities, with modest evidence against a preference for advance structure.',
    {
      'big5.C': -0.5,
      'big5.O': 0.25,
      'jung.P': 0.8,
      'jung.J': -0.8,
      'enneagram.7': [0.65, -0.3],
      'disc.C': -0.25,
      'riasec.A': [0.2, -0.1],
      'houses.R': 0.15
    }
  ),
  q(
    'q04',
    'If a friend is struggling, I tend to offer practical help before waiting to be asked.',
    ['helping', 'relationships'],
    'Unprompted help suggests cooperative, supportive action and a motivation to be useful; it does not imply a particular social energy level.',
    {
      'big5.A': 0.65,
      'jung.F': 0.4,
      'jung.T': -0.4,
      'enneagram.2': [0.85, -0.35],
      'enneagram.6': [0.2, -0.1],
      'disc.S': 0.55,
      'riasec.S': [0.7, -0.25],
      'houses.H': 0.65
    }
  ),
  q(
    'q05',
    'An overlooked error bothers me even when fixing it will not earn any recognition.',
    ['standards', 'accuracy'],
    'Private standards and correction connect to conscientiousness, accuracy, and improvement, independently of public achievement.',
    {
      'big5.C': 0.7,
      'jung.J': 0.4,
      'jung.P': -0.4,
      'enneagram.1': [0.9, -0.4],
      'disc.C': 0.8,
      'riasec.C': [0.6, -0.25],
      'houses.H': 0.3,
      'enneagram.3': [-0.2, 0.05]
    }
  ),
  q(
    'q06',
    'After a busy gathering, I usually want time alone before another conversation.',
    ['social energy', 'recovery'],
    'A desire to recover privately is primarily a signal about social energy; protected mental space is a weaker investigative-motivation signal.',
    {
      'big5.E': -0.8,
      'jung.I': 0.9,
      'jung.E': -0.9,
      'enneagram.5': [0.5, -0.2],
      'disc.I': -0.5,
      'enneagram.9': [0.15, -0.05]
    },
    'agreement',
    true
  ),
  q(
    'q07',
    'I would rather make something unmistakably my own than make something widely popular.',
    ['expression', 'authenticity'],
    'Original expression is linked to artistic interest, openness, and personal meaning; popularity is a distinct, only weakly opposing motive.',
    {
      'big5.O': 0.7,
      'jung.N': 0.5,
      'jung.S': -0.5,
      'enneagram.4': [0.9, -0.4],
      'enneagram.3': [-0.2, 0.15],
      'riasec.A': [0.85, -0.35],
      'houses.R': 0.6,
      'disc.I': -0.15
    }
  ),
  q(
    'q08',
    'Before committing to a plan, I like to know what we will do if it goes wrong.',
    ['uncertainty', 'preparation'],
    'Contingency planning suggests security-seeking, deliberation, and structured checking; it alone does not establish emotional instability.',
    {
      'big5.C': 0.5,
      'jung.J': 0.6,
      'jung.P': -0.6,
      'enneagram.6': [0.9, -0.4],
      'disc.C': 0.6,
      'riasec.C': [0.4, -0.2],
      'houses.S': 0.25,
      'enneagram.7': [-0.3, 0.15]
    }
  ),
  q(
    'q09',
    'Once a disagreement is over, I can usually return to what I was doing without replaying it.',
    ['conflict recovery', 'emotional responses'],
    'Recovery after interpersonal friction primarily informs emotional stability and, more weakly, a steady working style.',
    {
      'big5.S': 0.9,
      'disc.S': 0.35,
      'enneagram.9': [0.35, -0.15],
      'enneagram.6': [-0.25, 0.1],
      'houses.H': 0.2
    }
  ),
  q(
    'q10',
    'Repairing or building something useful with my hands.',
    ['making', 'practical interests'],
    'Enjoyment of hands-on work strongly signals practical interests, with weaker links to concrete experience, care, and patient completion.',
    {
      'riasec.R': [1, -0.4],
      'jung.S': 0.55,
      'jung.N': -0.55,
      'big5.C': 0.25,
      'disc.S': 0.25,
      'enneagram.1': [0.25, -0.1],
      'houses.H': 0.3
    },
    'interest',
    true
  ),
  q(
    'q11',
    'A visible milestone gives me more energy than the promise of an interesting process.',
    ['achievement', 'goals'],
    'Outcome orientation suggests achievement, direction, and enterprising interests, with a weaker contrast to exploratory learning.',
    {
      'enneagram.3': [0.9, -0.4],
      'big5.C': 0.35,
      'jung.J': 0.4,
      'jung.P': -0.4,
      'disc.D': 0.55,
      'riasec.E': [0.7, -0.25],
      'houses.S': 0.7,
      'enneagram.5': [-0.25, 0.1]
    }
  ),
  q(
    'q12',
    'In a tense discussion, I often see a workable part of both people’s positions.',
    ['group conflict', 'perspective taking'],
    'Finding common ground suggests accommodation and steady mediation, with a modest signal of curiosity about multiple perspectives.',
    {
      'big5.A': 0.65,
      'big5.O': 0.2,
      'jung.F': 0.4,
      'jung.T': -0.4,
      'enneagram.9': [0.85, -0.35],
      'disc.S': 0.7,
      'riasec.S': [0.5, -0.2],
      'houses.H': 0.55
    }
  ),
  q(
    'q13',
    'I often follow a question far beyond the amount of detail I actually need.',
    ['intellectual curiosity', 'depth'],
    'Voluntary depth signals investigative curiosity and knowledge-seeking, with weaker links to analytical attention and abstract exploration.',
    {
      'big5.O': 0.65,
      'jung.N': 0.45,
      'jung.S': -0.45,
      'enneagram.5': [0.85, -0.35],
      'riasec.I': [0.9, -0.4],
      'disc.C': 0.3,
      'houses.R': 0.8
    }
  ),
  q(
    'q14',
    'I find it easy to start a conversation with someone I have just met.',
    ['social energy', 'connection'],
    'Ease of initiating conversation informs outward engagement and influence; it is weaker evidence of enjoying people-focused activities.',
    {
      'big5.E': 0.85,
      'jung.E': 0.85,
      'jung.I': -0.85,
      'disc.I': 0.8,
      'enneagram.7': [0.3, -0.15],
      'riasec.S': [0.25, -0.1],
      'riasec.E': [0.25, -0.1],
      'houses.G': 0.3
    },
    'agreement',
    true
  ),
  q(
    'q15',
    'I would rather finish one task neatly than keep several promising tasks moving at once.',
    ['structure', 'follow-through'],
    'Preference for sequential completion suggests closure, orderly effort, and detail-focused activity, with weaker evidence against novelty seeking.',
    {
      'big5.C': 0.75,
      'jung.J': 0.8,
      'jung.P': -0.8,
      'disc.C': 0.6,
      'riasec.C': [0.65, -0.3],
      'enneagram.1': [0.5, -0.25],
      'enneagram.7': [-0.5, 0.2],
      'houses.H': 0.3
    }
  ),
  q(
    'q16',
    'If a rule seems unfair, I am willing to challenge it in front of the people enforcing it.',
    ['assertion', 'fairness'],
    'Publicly challenging authority signals direct assertion and courage, with modest signals of principled improvement and leadership.',
    {
      'disc.D': 0.8,
      'enneagram.8': [0.85, -0.35],
      'enneagram.1': [0.4, -0.15],
      'houses.G': 0.9,
      'big5.E': 0.25,
      'jung.T': 0.2,
      'jung.F': -0.2,
      'riasec.E': [0.45, -0.2]
    }
  ),
  q(
    'q17',
    'Helping someone practise a skill until they feel confident using it.',
    ['teaching', 'patience'],
    'Patient instruction is direct evidence of social interests, supportive behaviour, and usefulness as a motivation.',
    {
      'riasec.S': [1, -0.4],
      'big5.A': 0.6,
      'jung.F': 0.35,
      'jung.T': -0.35,
      'enneagram.2': [0.65, -0.25],
      'enneagram.9': [0.3, -0.1],
      'disc.S': 0.75,
      'houses.H': 0.7
    },
    'interest'
  ),
  q(
    'q18',
    'A change of plans often feels like an opening rather than a disruption.',
    ['flexibility', 'uncertainty'],
    'Welcoming changed plans suggests flexible engagement and novelty seeking; ease with disruption adds a smaller emotional-stability signal.',
    {
      'big5.O': 0.5,
      'big5.S': 0.4,
      'jung.P': 0.75,
      'jung.J': -0.75,
      'enneagram.7': [0.8, -0.35],
      'enneagram.6': [-0.3, 0.15],
      'disc.I': 0.4,
      'houses.G': 0.3
    }
  ),
  q(
    'q19',
    'I can spend a long time choosing the right words for a feeling that is hard to explain.',
    ['expression', 'reflection'],
    'Care with subjective expression suggests personal meaning, artistic language, and inward reflection; it does not measure emotional health.',
    {
      'enneagram.4': [0.85, -0.35],
      'big5.O': 0.45,
      'jung.I': 0.35,
      'jung.E': -0.35,
      'jung.F': 0.3,
      'jung.T': -0.3,
      'riasec.A': [0.65, -0.25],
      'houses.R': 0.4
    }
  ),
  q(
    'q20',
    'I trust a method more after I have watched it work than after hearing an elegant explanation.',
    ['concrete evidence', 'practicality'],
    'Direct demonstration contrasts concrete with abstract preferences; checking real-world operation connects to practical activity and verification.',
    {
      'jung.S': 0.8,
      'jung.N': -0.8,
      'riasec.R': [0.6, -0.25],
      'disc.C': 0.45,
      'enneagram.6': [0.3, -0.1],
      'big5.O': -0.25,
      'riasec.I': [0.2, -0.05]
    }
  ),
  q(
    'q21',
    'A small mistake can stay in my mind long after everyone else has moved on.',
    ['emotional responses', 'standards'],
    'Lingering mental replay reversely informs emotional stability, with weaker links to internal standards and checking for problems.',
    {
      'big5.S': -0.9,
      'enneagram.1': [0.45, -0.2],
      'enneagram.6': [0.4, -0.15],
      'disc.C': 0.25,
      'jung.I': 0.2,
      'jung.E': -0.2
    }
  ),
  q(
    'q22',
    'Presenting an idea in a way that makes other people want to get involved.',
    ['persuasion', 'group energy'],
    'Persuasive presentation directly signals enterprising interest and influence, with secondary links to outward engagement and achievement.',
    {
      'riasec.E': [1, -0.4],
      'disc.I': 0.9,
      'big5.E': 0.65,
      'jung.E': 0.6,
      'jung.I': -0.6,
      'enneagram.3': [0.6, -0.25],
      'enneagram.7': [0.3, -0.1],
      'houses.S': 0.45
    },
    'interest'
  ),
  q(
    'q23',
    'I would rather keep a dependable arrangement than replace it with a more exciting but uncertain one.',
    ['loyalty', 'continuity'],
    'Reliable continuity signals security and steadiness, while the explicit trade-off provides evidence against novelty seeking.',
    {
      'enneagram.6': [0.75, -0.3],
      'enneagram.9': [0.4, -0.15],
      'enneagram.7': -0.5,
      'disc.S': 0.75,
      'jung.J': 0.35,
      'jung.P': -0.35,
      'big5.O': -0.4,
      'houses.H': 0.6
    }
  ),
  q(
    'q24',
    'Organising a messy collection of files, supplies, or records into a usable system.',
    ['organisation', 'systems'],
    'Enjoyment of organising records is direct conventional-interest evidence, with links to structure, standards, and orderly attention.',
    {
      'riasec.C': [1, -0.4],
      'big5.C': 0.75,
      'jung.J': 0.55,
      'jung.P': -0.55,
      'disc.C': 0.7,
      'enneagram.1': [0.55, -0.2],
      'houses.H': 0.25
    },
    'interest',
    true
  ),
  q(
    'q25',
    'When someone gives me advice, I first work out whether their reasoning is consistent.',
    ['decision-making', 'analysis'],
    'Testing internal consistency informs analytical decision preferences, investigative interests, and evidence-focused behaviour.',
    {
      'jung.T': 0.8,
      'jung.F': -0.8,
      'riasec.I': [0.55, -0.2],
      'enneagram.5': [0.6, -0.25],
      'disc.C': 0.55,
      'big5.O': 0.2,
      'houses.R': 0.6
    }
  ),
  q(
    'q26',
    'I notice when someone feels left out, and usually make space for them.',
    ['inclusion', 'helping'],
    'Attending and responding to exclusion signals interpersonal consideration, social interests, and a motivation to connect or maintain harmony.',
    {
      'big5.A': 0.8,
      'jung.F': 0.55,
      'jung.T': -0.55,
      'enneagram.2': [0.7, -0.3],
      'enneagram.9': [0.35, -0.1],
      'disc.S': 0.5,
      'riasec.S': [0.65, -0.25],
      'houses.H': 0.8
    }
  ),
  q(
    'q27',
    'A difficult goal becomes more appealing when it would prove what I am capable of.',
    ['achievement', 'challenge'],
    'A competence-demonstrating goal suggests achievement and ambition, with smaller links to assertive action and enterprising activity.',
    {
      'enneagram.3': [0.9, -0.4],
      'enneagram.8': [0.35, -0.1],
      'disc.D': 0.7,
      'riasec.E': [0.65, -0.25],
      'houses.S': 0.8,
      'houses.G': 0.3,
      'big5.C': 0.25
    }
  ),
  q(
    'q28',
    'Sketching, composing, or writing something with no instructions to follow.',
    ['creative interests', 'open-ended work'],
    'Unstructured creation directly signals artistic interests and openness, with secondary signals of possibility and individual expression.',
    {
      'riasec.A': [1, -0.4],
      'big5.O': 0.85,
      'jung.N': 0.6,
      'jung.S': -0.6,
      'jung.P': 0.35,
      'jung.J': -0.35,
      'enneagram.4': [0.75, -0.3],
      'houses.R': 0.65
    },
    'interest'
  ),
  q(
    'q29',
    'I can stay fairly steady when a task becomes urgent and the details are still unclear.',
    ['pressure', 'ambiguity'],
    'Steadiness during uncertainty informs emotional stability and a direct working style, without assuming that calmness implies skill.',
    {
      'big5.S': 0.9,
      'disc.D': 0.4,
      'enneagram.8': [0.45, -0.15],
      'enneagram.6': [-0.35, 0.15],
      'houses.G': 0.5,
      'jung.P': 0.25,
      'jung.J': -0.25
    }
  ),
  q(
    'q30',
    'When a group picks a restaurant, I am usually content to go along with someone else’s preference.',
    ['everyday decisions', 'accommodation'],
    'Low-stakes accommodation suggests harmony and flexibility; it provides modest reverse evidence for directing the group.',
    {
      'big5.A': 0.5,
      'enneagram.9': [0.8, -0.35],
      'disc.S': 0.6,
      'disc.D': -0.5,
      'jung.P': 0.25,
      'jung.J': -0.25,
      'houses.H': 0.4
    },
    'agreement',
    true
  ),
  q(
    'q31',
    'I would enjoy a day spent working outdoors on a tangible physical project.',
    ['practical interests', 'physical activity'],
    'Enjoyment of tangible outdoor work suggests realistic interests and concrete experience; patient task engagement is weaker evidence.',
    {
      'riasec.R': [1, -0.4],
      'jung.S': 0.55,
      'jung.N': -0.55,
      'disc.S': 0.25,
      'enneagram.9': [0.2, -0.05],
      'big5.C': 0.15,
      'houses.G': 0.25
    }
  ),
  q(
    'q32',
    'I get restless when a familiar routine leaves little room for a new experience.',
    ['novelty', 'routine'],
    'Restlessness with repetition signals novelty seeking and flexible exploration, with reverse evidence for conventional activity preferences.',
    {
      'enneagram.7': [0.9, -0.4],
      'big5.O': 0.7,
      'jung.P': 0.65,
      'jung.J': -0.65,
      'riasec.C': -0.55,
      'disc.S': -0.35,
      'riasec.A': [0.3, -0.1],
      'houses.R': 0.3
    }
  ),
  q(
    'q33',
    'I feel useful when people rely on me for support, even if it interrupts my own plans.',
    ['helping motivation', 'relationships'],
    'Finding meaning in being relied upon points to helper motivation and interpersonal support, with a trade-off against personal scheduling.',
    {
      'enneagram.2': [0.9, -0.4],
      'big5.A': 0.7,
      'jung.F': 0.55,
      'jung.T': -0.55,
      'disc.S': 0.65,
      'riasec.S': [0.7, -0.25],
      'houses.H': 0.65,
      'jung.J': -0.15,
      'jung.P': 0.15
    }
  ),
  q(
    'q34',
    'I would prefer an honest disagreement to an agreement that hides what people really think.',
    ['group conflict', 'directness'],
    'Prioritising explicit disagreement suggests direct assertion and consistency; the stated trade-off weakly opposes accommodation.',
    {
      'disc.D': 0.65,
      'enneagram.8': [0.75, -0.3],
      'enneagram.9': -0.45,
      'jung.T': 0.45,
      'jung.F': -0.45,
      'big5.A': -0.3,
      'houses.G': 0.6,
      'riasec.E': [0.3, -0.1]
    }
  ),
  q(
    'q35',
    'I tend to ask what a detail might mean before I ask exactly how it works.',
    ['interpretation', 'abstract interests'],
    'Meaning before mechanism distinguishes interpretive from concrete attention, with secondary signals of openness and artistic sensibility.',
    {
      'jung.N': 0.8,
      'jung.S': -0.8,
      'big5.O': 0.6,
      'enneagram.4': [0.55, -0.2],
      'riasec.A': [0.6, -0.25],
      'riasec.R': -0.3,
      'houses.R': 0.55
    }
  ),
  q(
    'q36',
    'Checking a set of numbers or records until all the details agree.',
    ['accuracy', 'detail work'],
    'Enjoying reconciliation directly informs conventional interests, accuracy-focused style, structured effort, and internal standards.',
    {
      'riasec.C': [1, -0.4],
      'disc.C': 0.9,
      'big5.C': 0.6,
      'jung.J': 0.45,
      'jung.P': -0.45,
      'enneagram.1': [0.65, -0.25],
      'riasec.I': [0.25, -0.1]
    },
    'interest'
  ),
  q(
    'q37',
    'If I have a worry, talking it through often makes it clearer than thinking about it alone.',
    ['processing', 'social energy'],
    'External processing informs outward engagement and influence. Reaching for trusted input provides a smaller security-seeking signal.',
    {
      'jung.E': 0.8,
      'jung.I': -0.8,
      'big5.E': 0.65,
      'disc.I': 0.55,
      'enneagram.6': [0.25, -0.1],
      'enneagram.5': -0.4,
      'riasec.S': [0.2, -0.05]
    }
  ),
  q(
    'q38',
    'I sometimes decline an invitation because I want uninterrupted time to understand something.',
    ['depth', 'personal space'],
    'Choosing independent understanding over engagement signals knowledge-seeking and inward attention, with direct investigative-interest evidence.',
    {
      'enneagram.5': [0.9, -0.4],
      'jung.I': 0.65,
      'jung.E': -0.65,
      'big5.E': -0.5,
      'big5.O': 0.4,
      'riasec.I': [0.8, -0.3],
      'houses.R': 0.65,
      'disc.I': -0.3
    }
  ),
  q(
    'q39',
    'When the stakes are low, I would rather try the uncertain option than repeat the reliable one.',
    ['risk', 'experimentation'],
    'Low-stakes exploration suggests openness, novelty seeking, and flexible action; risk tolerance here is not general risk competence.',
    {
      'big5.O': 0.7,
      'jung.P': 0.6,
      'jung.J': -0.6,
      'enneagram.7': [0.75, -0.3],
      'enneagram.6': -0.4,
      'disc.D': 0.3,
      'houses.G': 0.6,
      'riasec.E': [0.3, -0.1]
    }
  ),
  q(
    'q40',
    'My own sense of what is right matters more to me than how efficiently a decision gets made.',
    ['values', 'standards'],
    'An internal moral standard suggests reformer motivation and value-led choices; efficiency is deliberately traded against conviction.',
    {
      'enneagram.1': [0.8, -0.35],
      'jung.F': 0.6,
      'jung.T': -0.6,
      'big5.A': 0.2,
      'disc.D': -0.3,
      'houses.G': 0.45,
      'houses.H': 0.35
    }
  ),
  q(
    'q41',
    'Negotiating terms so that a project has the resources it needs.',
    ['negotiation', 'strategy'],
    'Negotiation is direct enterprising-interest evidence, with links to direction, strategic resourcefulness, autonomy, and achievement.',
    {
      'riasec.E': [1, -0.4],
      'disc.D': 0.7,
      'enneagram.3': [0.55, -0.2],
      'enneagram.8': [0.45, -0.15],
      'houses.S': 0.85,
      'jung.T': 0.3,
      'jung.F': -0.3
    },
    'interest'
  ),
  q(
    'q42',
    'A quiet, predictable day can feel satisfying without anything memorable happening.',
    ['continuity', 'contentment'],
    'Satisfaction with continuity connects to steadiness and harmony, with reverse evidence for constant novelty and outward stimulation.',
    {
      'disc.S': 0.7,
      'enneagram.9': [0.75, -0.3],
      'enneagram.7': -0.5,
      'big5.E': -0.3,
      'jung.I': 0.3,
      'jung.E': -0.3,
      'houses.H': 0.5,
      'riasec.C': [0.25, -0.1]
    }
  ),
  q(
    'q43',
    'A critical comment tends to affect my mood for the rest of the day.',
    ['emotional responses', 'feedback'],
    'Sustained mood response reversely informs emotional stability; concern with evaluation and personal significance is weaker evidence.',
    {
      'big5.S': -0.9,
      'enneagram.3': [0.25, -0.1],
      'enneagram.4': [0.3, -0.1],
      'enneagram.6': [0.25, -0.1],
      'disc.S': -0.15
    }
  ),
  q(
    'q44',
    'Comparing competing explanations to find which one the evidence supports.',
    ['research', 'analysis'],
    'Evidence comparison directly informs investigative interest, analytical preference, curiosity, and careful evaluation.',
    {
      'riasec.I': [1, -0.4],
      'jung.T': 0.65,
      'jung.F': -0.65,
      'big5.O': 0.45,
      'enneagram.5': [0.7, -0.3],
      'disc.C': 0.65,
      'houses.R': 0.8
    },
    'interest'
  ),
  q(
    'q45',
    'I keep an eye on whether my effort is taking me closer to something I want to achieve.',
    ['goals', 'strategy'],
    'Monitoring progress suggests achievement, strategic intent, organised effort, and task direction.',
    {
      'enneagram.3': [0.85, -0.35],
      'houses.S': 0.75,
      'big5.C': 0.6,
      'jung.J': 0.5,
      'jung.P': -0.5,
      'disc.D': 0.45,
      'riasec.E': [0.6, -0.2],
      'riasec.C': [0.2, -0.05]
    }
  ),
  q(
    'q46',
    'When someone tells me about a problem, I first try to understand how it feels to them.',
    ['empathy', 'decision-making'],
    'Prioritising subjective experience signals interpersonal decision preferences and support; it is not a claim about reasoning ability.',
    {
      'jung.F': 0.8,
      'jung.T': -0.8,
      'big5.A': 0.7,
      'enneagram.2': [0.7, -0.3],
      'disc.S': 0.55,
      'riasec.S': [0.65, -0.25],
      'houses.H': 0.6
    }
  ),
  q(
    'q47',
    'I like to have the things I need ready before I begin a task.',
    ['preparation', 'everyday habits'],
    'Concrete preparation informs structure, conscientiousness, and orderly work, with smaller security and standards signals.',
    {
      'big5.C': 0.8,
      'jung.J': 0.75,
      'jung.P': -0.75,
      'disc.C': 0.5,
      'riasec.C': [0.55, -0.2],
      'enneagram.6': [0.3, -0.1],
      'enneagram.1': [0.25, -0.1]
    },
    'agreement',
    true
  ),
  q(
    'q48',
    'An unusual piece of art can hold my attention even when I cannot explain why I like it.',
    ['creative interests', 'ambiguity'],
    'Engagement with unfamiliar art suggests aesthetic openness and artistic interests, with secondary interpretive and personal-meaning signals.',
    {
      'big5.O': 0.85,
      'riasec.A': [0.9, -0.35],
      'jung.N': 0.5,
      'jung.S': -0.5,
      'enneagram.4': [0.7, -0.3],
      'houses.R': 0.65,
      'disc.C': -0.15
    }
  ),
  q(
    'q49',
    'If a task is going badly, I can usually separate that setback from how I feel about myself.',
    ['emotional recovery', 'achievement'],
    'Separating a setback from self-evaluation primarily informs emotional stability; it weakly opposes defining oneself through achievement.',
    {
      'big5.S': 0.9,
      'enneagram.3': [-0.4, 0.2],
      'enneagram.4': [-0.25, 0.1],
      'disc.S': 0.3,
      'enneagram.9': [0.25, -0.1]
    }
  ),
  q(
    'q50',
    'Maintaining a garden, workshop, or physical space through regular hands-on care.',
    ['practical interests', 'patience'],
    'Regular physical care connects realistic interests with patient maintenance, dependability, and concrete attention.',
    {
      'riasec.R': [1, -0.4],
      'big5.C': 0.45,
      'jung.S': 0.5,
      'jung.N': -0.5,
      'disc.S': 0.5,
      'enneagram.9': [0.3, -0.1],
      'houses.H': 0.55
    },
    'interest'
  ),
  q(
    'q51',
    'I often bring energy to a group by making an ordinary activity feel like an event.',
    ['group energy', 'playfulness'],
    'Energising a group suggests outward engagement, influence, novelty seeking, and enjoyment of expressive activity.',
    {
      'big5.E': 0.8,
      'jung.E': 0.65,
      'jung.I': -0.65,
      'disc.I': 0.9,
      'enneagram.7': [0.75, -0.3],
      'riasec.E': [0.45, -0.15],
      'riasec.A': [0.25, -0.1],
      'houses.G': 0.35
    }
  ),
  q(
    'q52',
    'I am slow to withdraw my support from someone who has proved dependable in the past.',
    ['loyalty', 'trust'],
    'Continuity of trust suggests loyalty, supportive steadiness, and relationship maintenance; it does not measure uncritical obedience.',
    {
      'enneagram.6': [0.8, -0.35],
      'big5.A': 0.45,
      'disc.S': 0.65,
      'houses.H': 0.8,
      'jung.F': 0.3,
      'jung.T': -0.3,
      'enneagram.2': [0.25, -0.1]
    }
  ),
  q(
    'q53',
    'I would rather take responsibility for a hard choice than have someone else control the outcome.',
    ['autonomy', 'leadership'],
    'Choosing responsibility to preserve agency signals autonomy, direct action, enterprising interests, and strategic self-direction.',
    {
      'enneagram.8': [0.9, -0.4],
      'disc.D': 0.85,
      'riasec.E': [0.65, -0.25],
      'houses.S': 0.6,
      'houses.G': 0.4,
      'jung.J': 0.3,
      'jung.P': -0.3,
      'big5.E': 0.2
    }
  ),
  q(
    'q54',
    'Collecting observations about a natural or technical process over time.',
    ['research', 'observation'],
    'Sustained observation links investigative interests with concrete attention, practical phenomena, and careful record keeping.',
    {
      'riasec.I': [1, -0.4],
      'riasec.R': [0.45, -0.15],
      'jung.S': 0.3,
      'jung.N': -0.3,
      'enneagram.5': [0.65, -0.25],
      'disc.C': 0.6,
      'big5.C': 0.35,
      'houses.R': 0.6
    },
    'interest'
  ),
  q(
    'q55',
    'I sometimes set aside my own preference simply to keep a disagreement from growing.',
    ['group conflict', 'accommodation'],
    'Yielding to preserve harmony signals accommodation and peace-seeking, with reverse evidence of direct assertion.',
    {
      'enneagram.9': [0.9, -0.4],
      'big5.A': 0.6,
      'disc.S': 0.6,
      'disc.D': -0.6,
      'enneagram.8': -0.45,
      'jung.F': 0.35,
      'jung.T': -0.35,
      'houses.H': 0.35
    }
  ),
  q(
    'q56',
    'I enjoy noticing patterns that connect subjects most people keep separate.',
    ['abstract interests', 'connections'],
    'Cross-domain pattern seeking signals abstract exploration, openness, and investigative curiosity; creative connection is secondary.',
    {
      'big5.O': 0.8,
      'jung.N': 0.85,
      'jung.S': -0.85,
      'riasec.I': [0.7, -0.3],
      'riasec.A': [0.35, -0.15],
      'enneagram.5': [0.55, -0.2],
      'houses.R': 0.8
    }
  ),
  q(
    'q57',
    'Having several attractive options can make it hard for me to settle on just one.',
    ['options', 'commitment'],
    'Keeping attractive options alive suggests novelty seeking and flexible exploration, with modest reverse evidence for closure and follow-through.',
    {
      'jung.P': 0.75,
      'jung.J': -0.75,
      'enneagram.7': [0.8, -0.35],
      'big5.C': -0.4,
      'big5.O': 0.35,
      'disc.C': -0.25,
      'riasec.A': [0.3, -0.1]
    }
  ),
  q(
    'q58',
    'I feel a pull to improve a process even when everyone says it is good enough.',
    ['improvement', 'standards'],
    'Improvement beyond external expectations suggests internal standards, systematic checking, and conscientious effort.',
    {
      'enneagram.1': [0.9, -0.4],
      'big5.C': 0.6,
      'disc.C': 0.6,
      'jung.J': 0.4,
      'jung.P': -0.4,
      'riasec.C': [0.55, -0.2],
      'houses.S': 0.25,
      'riasec.I': [0.25, -0.1]
    }
  ),
  q(
    'q59',
    'I can sit with an uncertain outcome without repeatedly checking for news.',
    ['uncertainty', 'emotional responses'],
    'Tolerance of unresolved outcomes informs emotional stability and steadiness, with weaker reverse evidence for security checking and closure.',
    {
      'big5.S': 0.85,
      'enneagram.6': [-0.55, 0.25],
      'disc.S': 0.4,
      'jung.P': 0.35,
      'jung.J': -0.35,
      'enneagram.9': [0.3, -0.1]
    }
  ),
  q(
    'q60',
    'Creating an atmosphere through music, images, words, or the arrangement of a room.',
    ['creative interests', 'expression'],
    'Shaping an expressive atmosphere signals artistic interest and aesthetic openness, with secondary signals of personal meaning and social expression.',
    {
      'riasec.A': [1, -0.4],
      'big5.O': 0.6,
      'enneagram.4': [0.8, -0.3],
      'jung.F': 0.3,
      'jung.T': -0.3,
      'disc.I': 0.35,
      'houses.R': 0.4
    },
    'interest'
  ),
  q(
    'q61',
    'I like knowing exactly what I am responsible for when working with other people.',
    ['roles', 'reliability'],
    'Explicit responsibilities suggest structure, dependable coordination, and conventional work preferences, with a smaller security-seeking signal.',
    {
      'big5.C': 0.55,
      'jung.J': 0.65,
      'jung.P': -0.65,
      'riasec.C': [0.65, -0.25],
      'disc.C': 0.45,
      'enneagram.6': [0.5, -0.2],
      'houses.H': 0.35
    },
    'agreement',
    true
  ),
  q(
    'q62',
    'When introducing an idea, I pay attention to what will make it compelling to the audience.',
    ['persuasion', 'strategy'],
    'Audience-aware presentation suggests influence, enterprising interests, achievement, and strategic communication.',
    {
      'disc.I': 0.75,
      'riasec.E': [0.75, -0.3],
      'enneagram.3': [0.7, -0.3],
      'houses.S': 0.65,
      'big5.E': 0.35,
      'jung.E': 0.3,
      'jung.I': -0.3,
      'riasec.A': [0.2, -0.05]
    }
  ),
  q(
    'q63',
    'I feel disconnected from work that leaves no room for a personal point of view.',
    ['authenticity', 'meaning'],
    'Wanting personal expression signals individualist motivation and artistic interests, with reverse evidence for highly standardised activity preferences.',
    {
      'enneagram.4': [0.9, -0.4],
      'big5.O': 0.55,
      'riasec.A': [0.75, -0.3],
      'riasec.C': -0.4,
      'jung.N': 0.4,
      'jung.S': -0.4,
      'houses.R': 0.45
    }
  ),
  q(
    'q64',
    'Showing up regularly for people matters more to me than making a memorable impression.',
    ['support', 'continuity'],
    'Dependable support suggests helping and steady engagement, with a trade-off against visible recognition and social impact.',
    {
      'enneagram.2': [0.6, -0.25],
      'enneagram.9': [0.35, -0.15],
      'enneagram.3': -0.4,
      'big5.A': 0.6,
      'disc.S': 0.75,
      'disc.I': -0.3,
      'riasec.S': [0.6, -0.25],
      'houses.H': 0.8
    }
  ),
  q(
    'q65',
    'Taking something apart to understand how its pieces fit together.',
    ['making', 'mechanisms'],
    'Hands-on exploration directly connects realistic and investigative interests, with analytical attention and understanding as supporting themes.',
    {
      'riasec.R': [1, -0.4],
      'riasec.I': [0.7, -0.3],
      'jung.T': 0.4,
      'jung.F': -0.4,
      'enneagram.5': [0.55, -0.2],
      'disc.C': 0.35,
      'houses.R': 0.45
    },
    'interest'
  ),
  q(
    'q66',
    'I say what I need fairly directly, even when it might disappoint someone.',
    ['boundaries', 'assertion'],
    'Explicit needs and tolerance of disappointment signal autonomy and directness, with a modest trade-off against accommodation.',
    {
      'enneagram.8': [0.85, -0.35],
      'disc.D': 0.8,
      'big5.A': -0.35,
      'jung.T': 0.3,
      'jung.F': -0.3,
      'houses.G': 0.55,
      'houses.S': 0.3,
      'riasec.E': [0.35, -0.15]
    }
  ),
  q(
    'q67',
    'Unexpected demands can leave me feeling unsettled even after I have worked out what to do.',
    ['pressure', 'emotional responses'],
    'Continuing distress after planning reversely informs emotional stability; planning needs and security seeking are weaker accompanying signals.',
    {
      'big5.S': -0.85,
      'enneagram.6': [0.45, -0.2],
      'jung.J': 0.3,
      'jung.P': -0.3,
      'disc.D': -0.25,
      'enneagram.1': [0.2, -0.05]
    }
  ),
  q(
    'q68',
    'Helping a newcomer find their feet in an unfamiliar place or group.',
    ['helping', 'connection'],
    'Welcoming and orienting someone directly informs social interests, cooperative care, supportive motivation, and interpersonal influence.',
    {
      'riasec.S': [1, -0.4],
      'big5.A': 0.6,
      'enneagram.2': [0.75, -0.3],
      'disc.I': 0.4,
      'disc.S': 0.4,
      'jung.F': 0.45,
      'jung.T': -0.45,
      'houses.H': 0.65
    },
    'interest'
  ),
  q(
    'q69',
    'I am comfortable letting a first attempt be rough so I can learn by doing.',
    ['experimentation', 'practicality'],
    'Learning through an imperfect attempt suggests flexible action and practical engagement, with reverse evidence for exacting standards before acting.',
    {
      'jung.P': 0.6,
      'jung.J': -0.6,
      'enneagram.1': -0.55,
      'disc.C': -0.5,
      'riasec.R': [0.6, -0.25],
      'big5.S': 0.3,
      'houses.G': 0.5,
      'enneagram.7': [0.3, -0.1]
    }
  ),
  q(
    'q70',
    'I often rehearse an idea privately before I feel ready to share it.',
    ['reflection', 'communication'],
    'Private rehearsal informs inward processing and cautious expression, with weaker links to preparation and protected thinking space.',
    {
      'jung.I': 0.75,
      'jung.E': -0.75,
      'big5.E': -0.65,
      'disc.I': -0.55,
      'enneagram.5': [0.4, -0.15],
      'enneagram.6': [0.25, -0.1],
      'big5.C': 0.2
    }
  ),
  q(
    'q71',
    'I enjoy finding a route to a goal that other people have overlooked.',
    ['resourcefulness', 'strategy'],
    'Unconventional routes combine openness with strategic goal pursuit, enterprising interest, initiative, and achievement.',
    {
      'houses.S': 0.85,
      'big5.O': 0.5,
      'riasec.E': [0.75, -0.3],
      'enneagram.3': [0.55, -0.2],
      'enneagram.8': [0.3, -0.1],
      'disc.D': 0.5,
      'jung.N': 0.4,
      'jung.S': -0.4
    }
  ),
  q(
    'q72',
    'When plans fall apart, I can usually find something worthwhile in the day that remains.',
    ['recovery', 'flexibility'],
    'Recovering a sense of possibility informs emotional stability and flexible optimism, with weaker links to novelty seeking and social energy.',
    {
      'big5.S': 0.8,
      'jung.P': 0.5,
      'jung.J': -0.5,
      'enneagram.7': [0.55, -0.25],
      'disc.I': 0.4,
      'big5.O': 0.25,
      'houses.G': 0.3
    }
  )
];

export const agreementLabels = [
  'Strongly disagree',
  'Disagree',
  'Neither / unsure',
  'Agree',
  'Strongly agree'
];
export const interestLabels = [
  'Strongly dislike',
  'Dislike',
  'Neutral / unsure',
  'Like',
  'Strongly like'
];
export const answerValues = [-1, -0.5, 0, 0.5, 1] as const;
