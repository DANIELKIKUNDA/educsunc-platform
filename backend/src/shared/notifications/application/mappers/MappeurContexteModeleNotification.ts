// Ce fichier construit un contexte de rendu applicatif a partir de donnees d'entree.

/** Cette classe prepare le contexte de rendu d'un modele de notification. */
export class MappeurContexteModeleNotification {
  /** Cette methode fusionne les donnees metier et les placeholders applicatifs. */
  public static construire(
    placeholders: Readonly<Record<string, string>>,
    donnees: Readonly<Record<string, unknown>> = {},
  ): Record<string, unknown> {
    return {
      ...donnees,
      placeholders: { ...placeholders },
    };
  }
}
