function normalizeSnapshotValue(value: unknown): unknown {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(normalizeSnapshotValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, normalizeSnapshotValue(entry)]),
    );
  }
  return value;
}

export function createFormSnapshot<TForm extends object>(form: Readonly<TForm>): string {
  return JSON.stringify(normalizeSnapshotValue(form));
}

export function hasFormChanged<TForm extends object>(
  initialSnapshot: string | null,
  form: Readonly<TForm>,
): boolean {
  return initialSnapshot !== null && initialSnapshot !== createFormSnapshot(form);
}
