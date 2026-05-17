// Ce presenter transforme un etat de sante en reponse HTTP exploitable.
export class HealthPresenter {
  // Cette methode enveloppe les informations de sante du BC.
  public static presenter(etat: Record<string, unknown>): { donnee: Record<string, unknown> } {
    return { donnee: etat };
  }
}
