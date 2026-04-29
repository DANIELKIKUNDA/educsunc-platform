import { GrilleTarification } from 'contexts/paiements-facturation/domain/aggregates/GrilleTarification';
import type { DepotGrilleTarification } from 'contexts/paiements-facturation/domain/repositories/DepotGrilleTarification';
import type { CreerGrilleTarificationInput } from 'contexts/paiements-facturation/application/dto/input/TarificationEntreeDTO';
import type { GrilleTarificationOutput } from 'contexts/paiements-facturation/application/dto/output/GrilleTarificationSortieDTO';
import { versGrilleTarificationOutput } from 'contexts/paiements-facturation/application/mappers/GrilleTarificationApplicationMapper';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import { ErreurUseCasePaiement } from 'contexts/paiements-facturation/application/exceptions/ErreurUseCasePaiement';

export class CreerGrilleTarificationUseCase {
  constructor(
    private readonly depotGrilleTarification: DepotGrilleTarification,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: CreerGrilleTarificationInput): Promise<GrilleTarificationOutput> {
    const grillesExistantes = await this.depotGrilleTarification.listerActivesParEcoleEtAnnee(input.idEcole, input.idAnneeScolaire);
    const conflit = grillesExistantes.some((grille) =>
      grille.obtenirTypeFrais() === input.typeFrais
      && grille.obtenirLibelle() === input.libelle,
    );

    if (conflit) {
      throw new ErreurUseCasePaiement('Une grille active equivalente existe deja pour cette ecole et cette annee.');
    }

    const grille = GrilleTarification.creer({
      idGrilleTarification: `${input.idEcole}-${input.idAnneeScolaire}-${Date.now()}`,
      idEcole: input.idEcole,
      idAnneeScolaire: input.idAnneeScolaire,
      typeFrais: input.typeFrais,
      libelle: input.libelle,
      montant: input.montant,
      section: input.section,
      categorieFraisEtat: input.categorieFraisEtat,
      categorieTechnique: input.categorieTechnique,
      estClasseTENASOSP: input.estClasseTENASOSP,
      estClasseEXETAT: input.estClasseEXETAT,
      estClasseFinaliste: input.estClasseFinaliste,
      obligatoire: input.obligatoire,
      actif: true,
      creePar: input.creePar,
    });

    await this.depotGrilleTarification.sauvegarder(grille);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'CREER_GRILLE_TARIFICATION',
      idEcole: input.idEcole,
      idUtilisateur: input.creePar,
      referenceMetier: grille.obtenirId(),
    });

    return versGrilleTarificationOutput(grille);
  }
}
