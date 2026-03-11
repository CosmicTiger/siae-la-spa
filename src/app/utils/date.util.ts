/**
 * Date helpers for AnioLectivo feature.
 * Convert <input type="date"> value (YYYY-MM-DD) to UTC ISO (start of day UTC)
 * and convert ISO -> local date string for display.
 */
export function toUtcIsoFromDateInput(value?: string | null): string | null {
  if (!value) return null;
  const parts = value.split('-');
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
}

export function toLocalDateString(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}
