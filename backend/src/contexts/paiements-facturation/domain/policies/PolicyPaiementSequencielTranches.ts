import { TrancheFraisEtat } from '../value-objects/TrancheFraisEtat';

// Cette policy interdit de sauter une tranche des frais Etat.
export class PolicyPaiementSequencielTranches {
  private static readonly ordreTranches: TrancheFraisEtat[] = [
    TrancheFraisEtat.TRANCHE_1,
    TrancheFraisEtat.TRANCHE_2,
    TrancheFraisEtat.TRANCHE_3,
  ];

  public verifier(trancheAttendue: TrancheFraisEtat, trancheDemandee: TrancheFraisEtat): void {
    const indexAttendu = PolicyPaiementSequencielTranches.ordreTranches.indexOf(trancheAttendue);
    const indexDemandee = PolicyPaiementSequencielTranches.ordreTranches.indexOf(trancheDemandee);

    if (indexAttendu === -1 || indexDemandee === -1 || indexDemandee !== indexAttendu) {
      throw new Error('Le paiement des tranches Etat doit respecter la sequence metier.');
    }
  }
}
