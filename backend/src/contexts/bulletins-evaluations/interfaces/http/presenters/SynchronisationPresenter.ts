import type { SynchronisationOutput } from 'contexts/bulletins-evaluations/application/dto/output/SynchronisationOutput';

// Ce presenter transforme un resultat de synchronisation en reponse HTTP stable.
export class SynchronisationPresenter {
  // Cette methode enveloppe le resultat de sync dans un objet standard.
  public static presenter(sortie: SynchronisationOutput): { donnee: SynchronisationOutput } {
    return { donnee: sortie };
  }
}
