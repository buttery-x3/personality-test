import { dimensions, frameworks } from '../data/frameworks';
import type { Question } from '../types';

export function validateCoverage(questions: Question[]) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const known = new Set(dimensions.map((d) => d.id));
  for (const q of questions) {
    if (ids.has(q.id)) errors.push(`Duplicate question ID: ${q.id}`);
    ids.add(q.id);
    if (!q.text.trim()) errors.push(`${q.id}: missing question text`);
    if (!q.rationale.trim()) errors.push(`${q.id}: missing mapping rationale`);
    if (!q.mappings.length) errors.push(`${q.id}: no mappings`);
    if (new Set(q.mappings.map((m) => m.dimension)).size === 1)
      warnings.push(`${q.id}: only one dimension`);
    const seen = new Set<string>();
    for (const m of q.mappings) {
      if (!known.has(m.dimension)) errors.push(`${q.id}: unknown dimension ${m.dimension}`);
      if (seen.has(m.dimension)) errors.push(`${q.id}: duplicate mapping ${m.dimension}`);
      seen.add(m.dimension);
      if (!Number.isFinite(m.agreeWeight) || !Number.isFinite(m.disagreeWeight ?? -m.agreeWeight))
        errors.push(`${q.id}: non-finite weight`);
      if (m.agreeWeight === 0 && (m.disagreeWeight ?? 0) === 0)
        warnings.push(`${q.id}: zero evidence for ${m.dimension}`);
    }
  }
  const rows = dimensions.map((d) => {
    const mappings = questions.flatMap((q) => q.mappings.filter((m) => m.dimension === d.id));
    const positive = mappings.reduce(
      (s, m) => s + Math.max(0, m.agreeWeight, m.disagreeWeight ?? -m.agreeWeight),
      0
    );
    const negative = mappings.reduce(
      (s, m) => s - Math.min(0, m.agreeWeight, m.disagreeWeight ?? -m.agreeWeight),
      0
    );
    if (mappings.length < 6 || positive + negative < 4)
      warnings.push(
        `${d.id}: low coverage (${mappings.length} questions, ${(positive + negative).toFixed(2)} total capacity)`
      );
    return {
      dimension: d.id,
      label: d.label,
      questions: mappings.length,
      positive,
      negative,
      total: positive + negative
    };
  });
  for (const f of frameworks) {
    const peers = rows.filter((r) => r.dimension.startsWith(f.id + '.'));
    // Compare each endpoint separately, so asymmetry cannot hide weak evidence.
    for (const side of ['positive', 'negative'] as const) {
      const values = peers.map((p) => p[side]);
      const min = Math.min(...values),
        max = Math.max(...values);
      if (min === 0 || max / min > 2.5)
        warnings.push(
          `${f.name}: ${side} capacity differs by more than 2.5× (${min.toFixed(2)}–${max.toFixed(2)}). Normalization corrects scale, not reliability.`
        );
    }
  }
  return {
    questions: questions.length,
    mappings: questions.reduce((s, q) => s + q.mappings.length, 0),
    rows,
    errors,
    warnings
  };
}
