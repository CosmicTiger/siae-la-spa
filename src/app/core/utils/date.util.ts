/**
 * Utilities to normalize reading created/ingestion timestamps coming
 * from the backend. Backend may return either `fechaRegistro` or
 * `audit.fechaIngreso` (ISO strings, UTC). These helpers centralize
 * access and formatting.
 */
export function getCreatedAtIso(item: any): string | null {
  if (!item) return null;
  return item?.audit?.fechaIngreso ?? item?.fechaRegistro ?? null;
}

export function parseCreatedAt(item: any): Date | null {
  const iso = getCreatedAtIso(item);
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function formatCreatedAtLocal(item: any, options?: Intl.DateTimeFormatOptions): string {
  const d = parseCreatedAt(item);
  if (!d) return '—';
  return d.toLocaleString(
    undefined,
    options ?? {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}
