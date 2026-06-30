export function lireEnveloppe<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;

    if ('donnees' in candidate) {
      return (candidate.donnees as T) ?? fallback;
    }

    if ('data' in candidate) {
      return (candidate.data as T) ?? fallback;
    }
  }

  return (payload as T) ?? fallback;
}

export function lireListe(payload: unknown): readonly Record<string, unknown>[] {
  const data = lireEnveloppe<unknown>(payload, []);
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
}

export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
