import type { ReimprimerRecuInput } from 'contexts/paiements-facturation/application/dto/input/RecusEntreeDTO';
import type {
  RecuPaiementPdfOutput,
} from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import type { AutorisationReimpressionRecuPort } from 'contexts/paiements-facturation/application/ports/AutorisationReimpressionRecuPort';
import { AssemblageRecuPaiementOfficielService } from 'contexts/paiements-facturation/application/services/AssemblageRecuPaiementOfficielService';
import { ServicePdfRecuPaiement } from 'contexts/paiements-facturation/infrastructure/services/ServicePdfRecuPaiement';

export class TelechargerRecuPdfUseCase {
  constructor(
    private readonly assembleur: AssemblageRecuPaiementOfficielService,
    private readonly servicePdfRecuPaiement: ServicePdfRecuPaiement,
    private readonly autorisationReimpressionRecuPort?: AutorisationReimpressionRecuPort,
  ) {}

  public async executer(input: ReimprimerRecuInput): Promise<RecuPaiementPdfOutput> {
    await this.autorisationReimpressionRecuPort?.verifierReimpressionRecu({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
    });

    const recu = await this.assembleur.assembler(input.idRecu, input.idEcole);

    return this.servicePdfRecuPaiement.genererDepuisSortie(recu);
  }
}
