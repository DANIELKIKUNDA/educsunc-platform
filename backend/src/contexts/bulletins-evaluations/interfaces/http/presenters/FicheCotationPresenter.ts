import type { FicheCotationOutput } from 'contexts/bulletins-evaluations/application/dto/output/FicheCotationOutput';

// Ce presenter transforme une fiche de cotation en reponse HTTP stable.
export class FicheCotationPresenter {
  // Cette methode enveloppe la fiche dans un objet HTTP uniforme.
  public static presenter(fiche: FicheCotationOutput): { donnee: FicheCotationOutput } {
    return { donnee: fiche };
  }
}
