import type { DepotGrilleTarification } from 'contexts/paiements-facturation/domain/repositories/DepotGrilleTarification';
import type { ModifierGrilleTarificationInput } from 'contexts/paiements-facturation/application/dto/input/TarificationEntreeDTO';
import type { GrilleTarificationOutput } from 'contexts/paiements-facturation/application/dto/output/GrilleTarificationSortieDTO';
import { versGrilleTarificationOutput } from 'contexts/paiements-facturation/application/mappers/GrilleTarificationApplicationMapper';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import { ErreurDroitsInsuffisants } from 'contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import { ErreurUseCasePaiement } from 'contexts/paiements-facturation/application/exceptions/ErreurUseCasePaiement';

export class ModifierGrilleTarificationUseCase {
  constructor(
    private readonly depotGrilleTarification: DepotGrilleTarification,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: ModifierGrilleTarificationInput): Promise<GrilleTarificationOutput> {
    this.verifierActeurAutorise(input.roleActif);

    const grille = await this.depotGrilleTarification.trouverParIdEtEcole(
      input.idGrilleTarification,
      input.idEcole,
    );

    if (grille === null) {
      throw new ErreurUseCasePaiement('La grille de tarification a modifier est introuvable.');
    }

    grille.reconfigurer({
      libelle: input.libelle,
      montant: input.montant,
      section: input.section,
      categorieFraisEtat: input.categorieFraisEtat,
      categorieTechnique: input.categorieTechnique,
      estClasseTENASOSP: input.estClasseTENASOSP,
      estClasseEXETAT: input.estClasseEXETAT,
      estClasseFinaliste: input.estClasseFinaliste,
      moisScolaire: input.moisScolaire,
      trancheFraisEtat: input.trancheFraisEtat,
      obligatoire: input.obligatoire,
      dateDebutValidite: input.dateDebutValidite,
      dateFinValidite: input.dateFinValidite,
    }, input.modifiePar);

    if (input.actif === true) {
      grille.activer(input.modifiePar);
    } else if (input.actif === false) {
      grille.desactiver(input.modifiePar);
    }

    await this.depotGrilleTarification.sauvegarder(grille);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'MODIFIER_GRILLE_TARIFICATION',
      idOrganisation: input.idOrganisation,
      idEcole: grille.obtenirIdEcole(),
      idUtilisateur: input.modifiePar,
      roleActif: input.roleActif,
      referenceMetier: grille.obtenirId(),
    });

    return versGrilleTarificationOutput(grille);
  }

  private verifierActeurAutorise(roleActif?: string): void {
    if (roleActif !== 'ADMIN_SYSTEME_ECOLE') {
      throw new ErreurDroitsInsuffisants(
        "Seul l'admin systeme ecole peut modifier les grilles de tarification.",
      );
    }
  }
}
