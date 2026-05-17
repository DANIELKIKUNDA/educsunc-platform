import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import { MoteurEncodageCotes } from '../../../domain/services/MoteurEncodageCotes';
import type { ViderCoteInput } from '../../dto/input/ViderCoteInput';
import type { FicheCotationOutput } from '../../dto/output/FicheCotationOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceAuditBulletin } from '../../services/ServiceAuditBulletin';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';
import { ServiceValidationConcurrence } from '../../services/ServiceValidationConcurrence';

// Ce use case orchestre le vidage applicatif d'une cote.
export class ViderCoteUseCase {
  constructor(
    private readonly depotFicheCotation: DepotFicheCotationEleveCours,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly serviceValidationConcurrence = new ServiceValidationConcurrence(),
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly serviceAuditBulletin = new ServiceAuditBulletin(),
    private readonly moteurEncodageCotes = new MoteurEncodageCotes(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  // Cette methode execute le vidage complet de la cote.
  public async executer(input: ViderCoteInput): Promise<FicheCotationOutput> {
    return this.transactionManagerPort.executer(async () => {
      const fiche = await this.depotFicheCotation.trouverParId(input.idFicheCotationEleveCours);
      if (fiche === null) {
        throw new ApplicationException('La fiche de cotation demandee est introuvable.', 'BULLETINS_FICHE_INTROUVABLE');
      }

      this.serviceValidationConcurrence.verifier(input.versionAttendue, fiche.obtenirVersion());
      this.moteurEncodageCotes.vider(fiche, input.codeColonne, input.idUtilisateur, input.versionAttendue);
      await this.depotFicheCotation.sauvegarder(fiche);
      await this.eventBusPort?.publier(fiche.recupererEvenements());
      await this.serviceAuditBulletin.journaliser({
        action: 'VIDER_COTE',
        idEcole: fiche.obtenirIdEcole(),
        idUtilisateur: input.idUtilisateur,
        referenceMetier: fiche.obtenirId(),
        details: { codeColonne: input.codeColonne },
      });
      const sortie = this.serviceProjectionLecture.projeterFiche(fiche);
      fiche.viderEvenements();
      return sortie;
    });
  }
}
