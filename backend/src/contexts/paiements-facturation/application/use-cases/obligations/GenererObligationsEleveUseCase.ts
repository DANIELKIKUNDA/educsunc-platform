import type { GenererObligationsEleveInput } from 'contexts/paiements-facturation/application/dto/input/ObligationsEntreeDTO';
import type { ObligationFinanciereOutput } from 'contexts/paiements-facturation/application/dto/output/ObligationsSortieDTO';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import type { ClasseReglesFraisDTO } from 'contexts/paiements-facturation/application/ports/ReferentielAcademiquePort';
import type { ReferentielAcademiquePort } from 'contexts/paiements-facturation/application/ports/ReferentielAcademiquePort';
import type { ScolariteElevesPort } from 'contexts/paiements-facturation/application/ports/ScolariteElevesPort';
import { GrilleTarification } from 'contexts/paiements-facturation/domain/aggregates/GrilleTarification';
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
    let reglesClasse: ClasseReglesFraisDTO | undefined;
    if (classe !== null) {
      reglesClasse = await this.referentielAcademiquePort.consulterReglesFraisClasse(
        classe.idClassePedagogique,
      );
    }
    await this.depotParametresPaiementEcole.trouverActifParEcole(input.idEcole);
    const grilles = await this.depotGrilleTarification.listerActivesParEcoleEtAnnee(
      input.idEcole,
      input.idAnneeScolaire,
    );
    const grillesApplicables = this.selectionnerGrillesApplicables(grilles, reglesClasse);
    const obligationsExistantes = await this.depotObligationFinanciere.listerParEleveEtAnnee(input.idEcole, input.idEleve, input.idAnneeScolaire);
    const obligationsGenerees = this.moteurGenerationObligations.genererDepuisGrilles(
      input,
      grillesApplicables,
    )
      .filter((obligation) => !obligationsExistantes.some((existante) =>
        existante.obtenirTypeFrais() === obligation.obtenirTypeFrais()
        && existante.obtenirReferenceFrais().obtenirValeur() === obligation.obtenirReferenceFrais().obtenirValeur(),
      ));

    for (const obligation of obligationsGenerees) {
      await this.depotObligationFinanciere.sauvegarder(obligation);
    }

    await this.auditPort?.journaliserActionFinanciere({
      action: 'GENERER_OBLIGATIONS_ELEVE',
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idUtilisateur: input.creePar,
      roleActif: input.roleActif,
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

  private selectionnerGrillesApplicables(
    grilles: GrilleTarification[],
    reglesClasse?: ClasseReglesFraisDTO,
  ): GrilleTarification[] {
    if (reglesClasse === undefined) {
      return grilles.filter((grille) =>
        grille.obtenirSection() === undefined
        && grille.obtenirCategorieTechnique() === undefined
        && grille.obtenirCategorieFraisEtat() === undefined
        && grille.obtenirEstClasseTENASOSP() === undefined
        && grille.obtenirEstClasseEXETAT() === undefined
        && grille.obtenirEstClasseFinaliste() === undefined,
      );
    }

    return grilles.filter((grille) => {
      if (grille.obtenirSection() !== undefined && grille.obtenirSection() !== reglesClasse.section) {
        return false;
      }

      if (
        grille.obtenirCategorieTechnique() !== undefined
        && (
          reglesClasse.optionEstTechnique !== true
          || grille.obtenirCategorieTechnique() !== reglesClasse.optionCategorieTechnique
        )
      ) {
        return false;
      }

      if (
        grille.obtenirCategorieFraisEtat() !== undefined
        && grille.obtenirCategorieFraisEtat() !== reglesClasse.categorieFraisEtat
      ) {
        return false;
      }

      if (
        grille.obtenirEstClasseTENASOSP() !== undefined
        && grille.obtenirEstClasseTENASOSP() !== reglesClasse.estClasseTENASOSP
      ) {
        return false;
      }

      if (
        grille.obtenirEstClasseEXETAT() !== undefined
        && grille.obtenirEstClasseEXETAT() !== reglesClasse.estClasseEXETAT
      ) {
        return false;
      }

      if (
        grille.obtenirEstClasseFinaliste() !== undefined
        && grille.obtenirEstClasseFinaliste() !== reglesClasse.estClasseFinaliste
      ) {
        return false;
      }

      return true;
    });
  }
}
