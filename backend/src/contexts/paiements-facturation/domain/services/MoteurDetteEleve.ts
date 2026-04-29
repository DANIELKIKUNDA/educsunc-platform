import { DetteEleve } from '../aggregates/DetteEleve';
import { ObligationFinanciereEleve } from '../aggregates/ObligationFinanciereEleve';
import { DetteAnnuelle } from '../entities/DetteAnnuelle';
import { LigneDette } from '../entities/LigneDette';
import { Money } from '../value-objects/Money';

export class MoteurDetteEleve {
  public calculer(idEcole: string, idEleve: string, obligations: ObligationFinanciereEleve[], statutParAnnee: Map<string, 'ACTIVE' | 'CLOTUREE'>): DetteEleve {
    const obligationsParAnnee = new Map<string, ObligationFinanciereEleve[]>();

    obligations.forEach((obligation) => {
      const liste = obligationsParAnnee.get(obligation.obtenirIdAnneeScolaire()) ?? [];
      liste.push(obligation);
      obligationsParAnnee.set(obligation.obtenirIdAnneeScolaire(), liste);
    });

    const devise = obligations[0]?.obtenirMontantDuHistorique().obtenirDevise() ?? 'CDF';
    const dettesAnnuelles = Array.from(obligationsParAnnee.entries()).map(([idAnneeScolaire, lignesObligations]) => {
      const lignes = lignesObligations.map((obligation) => new LigneDette({
        idObligation: obligation.obtenirId(),
        typeFrais: obligation.obtenirTypeFrais(),
        referenceFrais: obligation.obtenirReferenceFrais(),
        libelle: obligation.obtenirLibelle(),
        montantDuHistorique: obligation.obtenirMontantDuHistorique(),
        montantPaye: obligation.obtenirMontantPaye(),
        montantExonere: obligation.obtenirMontantExonere(),
        solde: obligation.obtenirSolde(),
        statut: obligation.obtenirStatut(),
      }));

      const totalDu = lignes.reduce((courant, ligne) => courant.additionner(ligne.obtenirMontantDuHistorique()), Money.zero(devise));
      const totalPaye = lignes.reduce((courant, ligne) => courant.additionner(ligne.obtenirMontantPaye()), Money.zero(devise));
      const totalExonere = lignes.reduce((courant, ligne) => courant.additionner(ligne.obtenirMontantExonere()), Money.zero(devise));
      const soldeRestant = lignes.reduce((courant, ligne) => courant.additionner(ligne.obtenirSolde()), Money.zero(devise));

      return new DetteAnnuelle({
        idAnneeScolaire,
        statutAnnee: statutParAnnee.get(idAnneeScolaire) ?? 'ACTIVE',
        lignes,
        totalDu,
        totalPaye,
        totalExonere,
        soldeRestant,
      });
    });

    const totalArrieres = dettesAnnuelles
      .filter((dette) => dette.obtenirStatutAnnee() === 'CLOTUREE')
      .reduce((courant, dette) => courant.additionner(dette.obtenirSoldeRestant()), Money.zero(devise));
    const totalAnneeActive = dettesAnnuelles
      .filter((dette) => dette.obtenirStatutAnnee() === 'ACTIVE')
      .reduce((courant, dette) => courant.additionner(dette.obtenirSoldeRestant()), Money.zero(devise));

    return new DetteEleve({
      idDetteEleve: `${idEcole}-${idEleve}`,
      idEcole,
      idEleve,
      dettesParAnnee: dettesAnnuelles,
      totalArrieres,
      totalAnneeActive,
      totalGlobal: totalArrieres.additionner(totalAnneeActive),
    });
  }
}
