import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';

// Ce presenter transforme une synthese en reponse HTTP stable.
export class SynthesePresenter {
  // Cette methode enveloppe la synthese dans une charge utile API uniforme.
  public static presenter(synthese: SyntheseEcoleOutput): { donnee: SyntheseEcoleOutput } {
    return { donnee: synthese };
  }
}
