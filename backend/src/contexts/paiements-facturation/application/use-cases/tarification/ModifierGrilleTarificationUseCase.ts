import type { DepotGrilleTarification } from 'contexts/paiements-facturation/domain/repositories/DepotGrilleTarification';
import type { ModifierGrilleTarificationInput } from 'contexts/paiements-facturation/application/dto/input/TarificationEntreeDTO';
import type { GrilleTarificationOutput } from 'contexts/paiements-facturation/application/dto/output/GrilleTarificationSortieDTO';
import { versGrilleTarificationOutput } from 'contexts/paiements-facturation/application/mappers/GrilleTarificationApplicationMapper';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import { ErreurUseCasePaiement } from 'contexts/paiements-facturation/application/exceptions/ErreurUseCasePaiement';

export class ModifierGrilleTarificationUseCase {
  constructor(
    private readonly depotGrilleTarification: DepotGrilleTarification,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: ModifierGrilleTarificationInput): Promise<GrilleTarificationOutput> {
    const grille = await this.depotGrilleTarification.trouverParId(input.idGrilleTarification);

    if (grille === null) {
      throw new ErreurUseCasePaiement('La grille de tarification a modifier est introuvable.');
    }

    if (input.libelle !== undefined) {
      grille.renommer(input.libelle, input.modifiePar);
    }

    if (input.montant !== undefined) {
      grille.modifierMontant(input.montant, input.modifiePar);
    }

    if (input.actif === true) {
      grille.activer(input.modifiePar);
    }

    if (input.actif === false) {
      grille.desactiver(input.modifiePar);
    }

    await this.depotGrilleTarification.sauvegarder(grille);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'MODIFIER_GRILLE_TARIFICATION',
      idEcole: grille.obtenirIdEcole(),
      idUtilisateur: input.modifiePar,
      referenceMetier: grille.obtenirId(),
    });

    return versGrilleTarificationOutput(grille);
  }
}
