import type { BulletinEleveOutput } from 'contexts/bulletins-evaluations/application/dto/output/BulletinEleveOutput';

// Ce presenter transforme un bulletin en reponse HTTP simple et stable.
export class BulletinPresenter {
  // Cette methode enveloppe la sortie bulletin dans une structure API lisible.
  public static presenter(bulletin: BulletinEleveOutput): { donnee: BulletinEleveOutput } {
    return { donnee: bulletin };
  }
}
