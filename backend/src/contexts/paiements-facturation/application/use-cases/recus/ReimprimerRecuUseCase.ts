import type { ReimprimerRecuInput } from 'contexts/paiements-facturation/application/dto/input/RecusEntreeDTO';
import type { AutorisationReimpressionRecuPort } from 'contexts/paiements-facturation/application/ports/AutorisationReimpressionRecuPort';
import type { RecuPaiementOfficielOutput } from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import { AssemblageRecuPaiementOfficielService } from 'contexts/paiements-facturation/application/services/AssemblageRecuPaiementOfficielService';

export class ReimprimerRecuUseCase {
  constructor(
    private readonly assembleur: AssemblageRecuPaiementOfficielService,
    private readonly autorisationReimpressionRecuPort?: AutorisationReimpressionRecuPort,
  ) {}

  public async executer(input: ReimprimerRecuInput): Promise<RecuPaiementOfficielOutput> {
    await this.autorisationReimpressionRecuPort?.verifierReimpressionRecu({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
    });

    return this.assembleur.assembler(input.idRecu, input.idEcole);
  }
}
