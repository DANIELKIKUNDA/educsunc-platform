import type { DepotGrilleTarification } from 'contexts/paiements-facturation/domain/repositories/DepotGrilleTarification';
import type { DesactiverGrilleTarificationInput } from 'contexts/paiements-facturation/application/dto/input/TarificationEntreeDTO';
import type { GrilleTarificationOutput } from 'contexts/paiements-facturation/application/dto/output/GrilleTarificationSortieDTO';
import { versGrilleTarificationOutput } from 'contexts/paiements-facturation/application/mappers/GrilleTarificationApplicationMapper';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import { ErreurDroitsInsuffisants } from 'contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import { ErreurUseCasePaiement } from 'contexts/paiements-facturation/application/exceptions/ErreurUseCasePaiement';

export class DesactiverGrilleTarificationUseCase {
  constructor(
    private readonly depotGrilleTarification: DepotGrilleTarification,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: DesactiverGrilleTarificationInput): Promise<GrilleTarificationOutput> {
    this.verifierActeurAutorise(input.roleActif);

    const grille = await this.depotGrilleTarification.trouverParIdEtEcole(
      input.idGrilleTarification,
      input.idEcole,
    );

    if (grille === null) {
      throw new ErreurUseCasePaiement('La grille de tarification a desactiver est introuvable.');
    }

    grille.desactiver(input.modifiePar);
    await this.depotGrilleTarification.sauvegarder(grille);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'DESACTIVER_GRILLE_TARIFICATION',
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
        "Seul l'admin systeme ecole peut desactiver les grilles de tarification.",
      );
    }
  }
}
