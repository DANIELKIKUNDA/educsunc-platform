// Ce presenter transforme des traces d'audit en reponse HTTP uniforme.
export class AuditPresenter {
  // Cette methode enveloppe les traces d'audit dans un objet API stable.
  public static presenter(audit: unknown): { donnee: unknown } {
    return { donnee: audit };
  }
}
