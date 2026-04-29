import type { EnregistrerPaiementInput } from 'contexts/paiements-facturation/application/dto/input/PaiementsEntreeDTO';
import type { PaiementEnregistreOutput } from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import { EnregistrerPaiementUseCase } from 'contexts/paiements-facturation/application/use-cases/paiements/EnregistrerPaiementUseCase';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import type { SynchronisationPort } from 'contexts/paiements-facturation/application/ports/SynchronisationPort';

export class SagaPaiementComplet {
  constructor(
    private readonly enregistrerPaiementUseCase: EnregistrerPaiementUseCase,
    private readonly auditPort?: AuditPort,
    private readonly synchronisationPort?: SynchronisationPort,
  ) {}

  public async executer(input: EnregistrerPaiementInput): Promise<PaiementEnregistreOutput> {
    const sortie = await this.enregistrerPaiementUseCase.executer(input);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'SAGA_PAIEMENT_COMPLET',
      idEcole: input.idEcole,
      idUtilisateur: input.idCaissier,
      referenceMetier: sortie.idPaiement,
    });
    await this.synchronisationPort?.enregistrerOperationSynchronisable({
      typeOperation: 'PAIEMENT_COMPLET',
      referenceMetier: sortie.idPaiement,
      idEcole: input.idEcole,
      payload: { idEleve: input.idEleve },
    });
    return sortie;
  }
}
