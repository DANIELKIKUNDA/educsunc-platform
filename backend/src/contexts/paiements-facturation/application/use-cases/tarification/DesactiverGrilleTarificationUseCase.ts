import type { DepotGrilleTarification } from 'contexts/paiements-facturation/domain/repositories/DepotGrilleTarification';
import type { DesactiverGrilleTarificationInput } from 'contexts/paiements-facturation/application/dto/input/TarificationEntreeDTO';
import type { GrilleTarificationOutput } from 'contexts/paiements-facturation/application/dto/output/GrilleTarificationSortieDTO';
import { versGrilleTarificationOutput } from 'contexts/paiements-facturation/application/mappers/GrilleTarificationApplicationMapper';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import { ErreurUseCasePaiement } from 'contexts/paiements-facturation/application/exceptions/ErreurUseCasePaiement';

export class DesactiverGrilleTarificationUseCase {
  constructor(
    private readonly depotGrilleTarification: DepotGrilleTarification,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: DesactiverGrilleTarificationInput): Promise<GrilleTarificationOutput> {
    const grille = await this.depotGrilleTarification.trouverParId(input.idGrilleTarification);

    if (grille === null) {
      throw new ErreurUseCasePaiement('La grille de tarification a desactiver est introuvable.');
    }

    grille.desactiver(input.modifiePar);
    await this.depotGrilleTarification.sauvegarder(grille);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'DESACTIVER_GRILLE_TARIFICATION',
      idEcole: grille.obtenirIdEcole(),
      idUtilisateur: input.modifiePar,
      referenceMetier: grille.obtenirId(),
    });

    return versGrilleTarificationOutput(grille);
  }
}
