/** A neutral-centred, piecewise capacity scale. This is not a percentile.
 * Separate denominators preserve neutral=50 even with asymmetric endpoints.
 * Capacities include all presented items; missing answers add zero evidence.
 */
export function normalize(raw: number, positiveCapacity: number, negativeCapacity: number): number {
  const capacity = raw >= 0 ? positiveCapacity : negativeCapacity;
  if (!capacity) return 50;
  return Math.max(0, Math.min(100, 50 + (50 * raw) / capacity));
}
