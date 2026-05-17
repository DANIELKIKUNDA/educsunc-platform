// Ce presenter transforme des statistiques en reponse HTTP standard.
export class StatistiquesPresenter {
  // Cette methode enveloppe des statistiques ou listes statistiques dans un objet stable.
  public static presenter(statistiques: unknown): { donnee: unknown } {
    return { donnee: statistiques };
  }
}
