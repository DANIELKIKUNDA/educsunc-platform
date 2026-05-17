import type { ResultatBulletinOutput } from 'contexts/bulletins-evaluations/application/dto/output/ResultatBulletinOutput';

// Ce presenter transforme un resultat bulletin en reponse HTTP simple.
export class ResultatBulletinPresenter {
  // Cette methode enveloppe le resultat dans un objet de sortie stable.
  public static presenter(resultat: ResultatBulletinOutput): { donnee: ResultatBulletinOutput } {
    return { donnee: resultat };
  }
}
