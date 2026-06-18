// Ce fichier prepare le contexte de rendu de notification a partir des donnees applicatives.

/** Cette classe consolide les placeholders et les metadonnees de rendu. */
export class ServicePreparationContexteRendu {
  /** Cette methode construit un contexte de rendu simple et serialisable. */
  public preparer(
    placeholders: Readonly<Record<string, string>>,
    metadonnees: Readonly<Record<string, unknown>> = {},
  ): Record<string, unknown> {
    return {
      placeholders: { ...placeholders },
      metadonnees: { ...metadonnees },
    };
  }
}
