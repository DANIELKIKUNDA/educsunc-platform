// Ce presenter stabilise la lecture HTTP des logs d'audit SECURITY.
export class SecuriteAuditPresenter {
  public static presenter(sortie: readonly Record<string, unknown>[]): { donnee: { success: true; data: readonly Record<string, unknown>[] } } {
    return { donnee: { success: true, data: sortie } };
  }
}
