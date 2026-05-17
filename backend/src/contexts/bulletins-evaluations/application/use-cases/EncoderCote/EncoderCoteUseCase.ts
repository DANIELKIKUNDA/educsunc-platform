import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import { MoteurEncodageCotes } from '../../../domain/services/MoteurEncodageCotes';
import type { EncoderCoteInput } from '../../dto/input/EncoderCoteInput';
import type { FicheCotationOutput } from '../../dto/output/FicheCotationOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceAuditBulletin } from '../../services/ServiceAuditBulletin';
import { ServiceIdempotence } from '../../services/ServiceIdempotence';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';
import { ServiceValidationConcurrence } from '../../services/ServiceValidationConcurrence';

// Ce use case orchestre l'encodage applicatif d'une cote sur une fiche.
export class EncoderCoteUseCase {
  constructor(
    private readonly depotFicheCotation: DepotFicheCotationEleveCours,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly serviceValidationConcurrence = new ServiceValidationConcurrence(),
    private readonly serviceIdempotence = new ServiceIdempotence<FicheCotationOutput>(),
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly serviceAuditBulletin = new ServiceAuditBulletin(),
    private readonly moteurEncodageCotes = new MoteurEncodageCotes(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  // Cette methode execute l'encodage complet de la cote.
  public async executer(input: EncoderCoteInput): Promise<FicheCotationOutput> {
    const cle = this.serviceIdempotence.exigerCle(input.cleIdempotence);
    const empreinte = cle === undefined ? undefined : this.serviceIdempotence.creerEmpreintePayload(input);
    const sortieDejaTraitee = await this.serviceIdempotence.verifierOuRejouer(cle, empreinte);
    if (sortieDejaTraitee !== null) {
      return sortieDejaTraitee;
    }

    return this.transactionManagerPort.executer(async () => {
      const fiche = await this.depotFicheCotation.trouverParId(input.idFicheCotationEleveCours);
      if (fiche === null) {
        throw new ApplicationException('La fiche de cotation demandee est introuvable.', 'BULLETINS_FICHE_INTROUVABLE');
      }

      this.serviceValidationConcurrence.verifier(input.versionAttendue, fiche.obtenirVersion());
      this.moteurEncodageCotes.encoder(fiche, input.codeColonne, input.cote, input.idUtilisateur, input.versionAttendue);
      await this.depotFicheCotation.sauvegarder(fiche);
      await this.eventBusPort?.publier(fiche.recupererEvenements());
      const sortie = this.serviceProjectionLecture.projeterFiche(fiche);
      await this.serviceIdempotence.enregistrer(cle, empreinte, sortie);
      await this.serviceAuditBulletin.journaliser({
        action: 'ENCODER_COTE',
        idEcole: fiche.obtenirIdEcole(),
        idUtilisateur: input.idUtilisateur,
        referenceMetier: fiche.obtenirId(),
        details: { codeColonne: input.codeColonne, origineSynchronisation: input.origineSynchronisation ?? 'ONLINE' },
      });
      fiche.viderEvenements();
      return sortie;
    });
  }
}
