import type { GenererObligationsEleveInput } from 'contexts/paiements-facturation/application/dto/input/ObligationsEntreeDTO';
import type { ObligationFinanciereOutput } from 'contexts/paiements-facturation/application/dto/output/ObligationsSortieDTO';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import type { ReferentielAcademiquePort } from 'contexts/paiements-facturation/application/ports/ReferentielAcademiquePort';
import type { ScolariteElevesPort } from 'contexts/paiements-facturation/application/ports/ScolariteElevesPort';
import { MoteurGenerationObligations } from 'contexts/paiements-facturation/domain/services/MoteurGenerationObligations';
import type { DepotGrilleTarification } from 'contexts/paiements-facturation/domain/repositories/DepotGrilleTarification';
import type { DepotObligationFinanciere } from 'contexts/paiements-facturation/domain/repositories/DepotObligationFinanciere';
import type { DepotParametresPaiementEcole } from 'contexts/paiements-facturation/domain/repositories/DepotParametresPaiementEcole';

export class GenererObligationsEleveUseCase {
  constructor(
    private readonly scolariteElevesPort: ScolariteElevesPort,
    private readonly referentielAcademiquePort: ReferentielAcademiquePort,
    private readonly depotParametresPaiementEcole: DepotParametresPaiementEcole,
    private readonly depotGrilleTarification: DepotGrilleTarification,
    private readonly depotObligationFinanciere: DepotObligationFinanciere,
    private readonly moteurGenerationObligations = new MoteurGenerationObligations(),
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: GenererObligationsEleveInput): Promise<ObligationFinanciereOutput[]> {
    await this.scolariteElevesPort.consulterEleve(input.idEleve);
    const classe = await this.scolariteElevesPort.consulterClasseActiveEleve(input.idEleve);
    if (classe !== null) {
      await this.referentielAcademiquePort.consulterReglesFraisClasse(classe.idClassePedagogique);
    }
    await this.depotParametresPaiementEcole.trouverActifParEcole(input.idEcole);
    const grilles = await this.depotGrilleTarification.listerActivesParEcoleEtAnnee(input.idEcole, input.idAnneeScolaire);
    const obligationsExistantes = await this.depotObligationFinanciere.listerParEleveEtAnnee(input.idEcole, input.idEleve, input.idAnneeScolaire);
    const obligationsGenerees = this.moteurGenerationObligations.genererDepuisGrilles(input, grilles)
      .filter((obligation) => !obligationsExistantes.some((existante) =>
        existante.obtenirTypeFrais() === obligation.obtenirTypeFrais()
        && existante.obtenirReferenceFrais().obtenirValeur() === obligation.obtenirReferenceFrais().obtenirValeur(),
      ));

    for (const obligation of obligationsGenerees) {
      await this.depotObligationFinanciere.sauvegarder(obligation);
    }

    await this.auditPort?.journaliserActionFinanciere({
      action: 'GENERER_OBLIGATIONS_ELEVE',
      idEcole: input.idEcole,
      referenceMetier: input.idEleve,
    });

    return obligationsGenerees.map((obligation) => ({
      idObligation: obligation.obtenirId(),
      idEcole: obligation.obtenirIdEcole(),
      idEleve: obligation.obtenirIdEleve(),
      idAnneeScolaire: obligation.obtenirIdAnneeScolaire(),
      typeFrais: obligation.obtenirTypeFrais(),
      referenceFrais: obligation.obtenirReferenceFrais().obtenirValeur(),
      libelle: obligation.obtenirLibelle(),
      montantDuHistorique: obligation.obtenirMontantDuHistorique(),
      montantPaye: obligation.obtenirMontantPaye(),
      montantExonere: obligation.obtenirMontantExonere(),
      solde: obligation.obtenirSolde(),
      statut: obligation.obtenirStatut(),
    }));
  }
}
