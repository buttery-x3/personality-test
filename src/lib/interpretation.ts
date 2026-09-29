import { dimensionById } from './data/frameworks';
import type { FrameworkId, ScoringOutput } from './types';

export function interpretation(id: FrameworkId, result: ScoringOutput): string {
  const name = (dimension: keyof typeof dimensionById) =>
    dimensionById[dimension].label.toLowerCase();
  switch (id) {
    case 'big5': {
      const pairs = [
        ['big5.O', 'exploring unfamiliar ideas', 'working with familiar, concrete ideas'],
        ['big5.C', 'planning and following through', 'leaving room for flexibility'],
        ['big5.E', 'outward engagement', 'quieter, more private engagement'],
        ['big5.A', 'accommodating and supporting others', 'being direct about your own position'],
        [
          'big5.S',
          'recovering steadily after setbacks',
          'feeling the effects of uncertainty or setbacks'
        ]
      ] as const;
      const distinctive = [...pairs].sort(
        (a, b) =>
          Math.abs(result.dimensions[b[0]].normalized - 50) -
          Math.abs(result.dimensions[a[0]].normalized - 50)
      );
      if (Math.abs(result.dimensions[distinctive[0][0]].normalized - 50) < 5)
        return 'Your answers sit near the middle of these five scales. This survey does not show a pronounced lean in either direction.';
      const themes = distinctive
        .slice(0, 2)
        .filter((p) => Math.abs(result.dimensions[p[0]].normalized - 50) >= 5)
        .map((p) => p[result.dimensions[p[0]].normalized >= 50 ? 1 : 2]);
      return `Your answers leaned most clearly toward ${themes.join(' and ')}. Each bar is a separate tendency, so a lower score is not a worse result.`;
    }
    case 'jung': {
      if (result.jung.axes.every((a) => a.tied))
        return 'Your answers balanced both sides of all four preferences. X marks an exact tie; there is no single four-letter lean to report.';
      const themes = result.jung.axes
        .filter((a) => !a.tied)
        .map((a) => name(a.leftPercent > 50 ? a.left : a.right));
      return `Your responses leaned toward ${themes.join(', ')}.${result.jung.tentative ? ' At least one balance is close, so neighbouring profiles may resonate too.' : ' These preferences describe a pattern in your answers, not a fixed identity.'}`;
    }
    case 'enneagram':
      return result.enneagram.tied
        ? 'Two or more motivational themes share the highest score. Read those descriptions together; this survey does not distinguish a clear primary type.'
        : `Your strongest theme was ${name(result.enneagram.ranking[0])}: ${dimensionById[result.enneagram.ranking[0]].description.toLowerCase()}${result.enneagram.wing ? ` Type ${result.enneagram.wing} was the stronger adjacent theme above the midpoint, giving a tentative ${result.enneagram.code} profile.` : ' Neither adjacent theme offers a distinct wing above the midpoint.'}`;
    case 'disc':
      return result.disc.tied
        ? 'Your leading working styles are tied. The four scores are more useful here than choosing one dominant letter.'
        : `Your answers leaned toward ${name(result.disc.ranking[0])}: ${dimensionById[result.disc.ranking[0]].description.toLowerCase()}${result.disc.code.includes('/') ? ` ${dimensionById[result.disc.ranking[1]].label} sits within 12 points and above the midpoint, adding a secondary influence.` : ' Other styles may still appear in different situations.'}`;
    case 'riasec':
      return `Your leading activity themes were ${result.riasec.ranking.slice(0, 3).map(name).join(', ')}. Try these as starting points for projects or interests to explore.${result.riasec.tied ? ' Some leading scores are tied; the displayed code uses framework order to break exact ties.' : ''}`;
    case 'houses':
      return result.houses.tied
        ? 'More than one house shares your strongest affinity. There is room for more than one fictional common room in this result.'
        : `Your strongest affinity in this playful model was ${dimensionById[result.houses.primary].label}: ${dimensionById[result.houses.primary].description.toLowerCase()} A conversation starter, with absolutely no sorting hat required.`;
  }
}
