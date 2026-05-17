import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import { MoteurEncodageCotes } from '../../../domain/services/MoteurEncodageCotes';
import type { ModifierCoteInput } from '../../dto/input/ModifierCoteInput';
import type { FicheCotationOutput } from '../../dto/output/FicheCotationOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceAuditBulletin } from '../../services/ServiceAuditBulletin';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';
import { ServiceValidationConcurrence } from '../../services/ServiceValidationConcurrence';

// Ce use case orchestre la modification applicative d'une cote existante.
export class ModifierCoteUseCase {
  constructor(
    private readonly depotFicheCotation: DepotFicheCotationEleveCours,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly serviceValidationConcurrence = new ServiceValidationConcurrence(),
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly serviceAuditBulletin = new ServiceAuditBulletin(),
    private readonly moteurEncodageCotes = new MoteurEncodageCotes(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  // Cette methode execute la modification complete de la cote.
  public async executer(input: ModifierCoteInput): Promise<FicheCotationOutput> {
    return this.transactionManagerPort.executer(async () => {
      const fiche = await this.depotFicheCotation.trouverParId(input.idFicheCotationEleveCours);
      if (fiche === null) {
        throw new ApplicationException('La fiche de cotation demandee est introuvable.', 'BULLETINS_FICHE_INTROUVABLE');
      }

      this.serviceValidationConcurrence.verifier(input.versionAttendue, fiche.obtenirVersion());
      this.moteurEncodageCotes.modifier(fiche, input.codeColonne, input.nouvelleCote, input.idUtilisateur, input.versionAttendue);
      await this.depotFicheCotation.sauvegarder(fiche);
      await this.eventBusPort?.publier(fiche.recupererEvenements());
      await this.serviceAuditBulletin.journaliser({
        action: 'MODIFIER_COTE',
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
