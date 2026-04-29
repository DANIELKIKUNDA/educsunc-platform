import { MoisScolaire } from '../value-objects/MoisScolaire';

// Cette policy interdit de sauter un mois scolaire dans la sequence de paiement.
export class PolicyPaiementSequencielMois {
  private static readonly ordreMois: MoisScolaire[] = [
    MoisScolaire.SEPTEMBRE,
    MoisScolaire.OCTOBRE,
    MoisScolaire.NOVEMBRE,
    MoisScolaire.DECEMBRE,
    MoisScolaire.JANVIER,
    MoisScolaire.FEVRIER,
    MoisScolaire.MARS,
    MoisScolaire.AVRIL,
    MoisScolaire.MAI,
    MoisScolaire.JUIN,
  ];

  public verifier(moisAttendu: MoisScolaire, moisDemande: MoisScolaire): void {
    const indexAttendu = PolicyPaiementSequencielMois.ordreMois.indexOf(moisAttendu);
    const indexDemande = PolicyPaiementSequencielMois.ordreMois.indexOf(moisDemande);

    if (indexAttendu === -1 || indexDemande === -1 || indexDemande !== indexAttendu) {
      throw new Error('Le paiement des mois scolaires doit respecter la sequence metier.');
    }
  }
}
