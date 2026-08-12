import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import { MoteurEncodageCotes } from '../../../domain/services/MoteurEncodageCotes';
import { PolicyFenetreEncodageCotes } from '../../../domain/policies/PolicyFenetreEncodageCotes';
import type { EncoderCoteInput } from '../../dto/input/EncoderCoteInput';
import type { FicheCotationOutput } from '../../dto/output/FicheCotationOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { AutorisationEncodageCotesPort } from '../../ports/out/AutorisationEncodageCotesPort';
import type { ClockPort } from '../../ports/out/ClockPort';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { FenetreEncodageCalendrierPort } from '../../ports/out/FenetreEncodageCalendrierPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceAuditBulletin } from '../../services/ServiceAuditBulletin';
import { ServiceIdempotence } from '../../services/ServiceIdempotence';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';
import { ServiceValidationConcurrence } from '../../services/ServiceValidationConcurrence';

const horlogeSysteme: ClockPort = {
  maintenant: () => new Date(),
};

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
    private readonly fenetreEncodageCalendrierPort?: FenetreEncodageCalendrierPort,
    private readonly clockPort: ClockPort = horlogeSysteme,
    private readonly policyFenetreEncodageCotes = new PolicyFenetreEncodageCotes(),
    private readonly autorisationEncodageCotesPort?: AutorisationEncodageCotesPort,
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

      await this.autorisationEncodageCotesPort?.verifierEncodageCotes({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: fiche.obtenirIdEcole(),
        idClassePedagogique: fiche.obtenirIdClassePedagogique(),
        idReferentielCours: fiche.obtenirIdReferentielCours(),
        idAnneeScolaire: fiche.obtenirIdAnneeScolaire(),
      });

      this.serviceValidationConcurrence.verifier(input.versionAttendue, fiche.obtenirVersion());
      if (this.fenetreEncodageCalendrierPort) {
        const fenetreCalendrier =
          await this.fenetreEncodageCalendrierPort.determinerFenetreEncodage({
            idEcole: fiche.obtenirIdEcole(),
            idAnneeScolaire: fiche.obtenirIdAnneeScolaire(),
            codeColonne: input.codeColonne,
            dateReference: this.clockPort.maintenant(),
          });
        this.policyFenetreEncodageCotes.verifier({
          codeColonne: input.codeColonne,
          calendrierTrouve: fenetreCalendrier !== null,
          calendrierVerrouille: fenetreCalendrier?.verrouille ?? false,
          periodeCouranteCode: fenetreCalendrier?.periodeCouranteCode ?? null,
          examenCourantCode: fenetreCalendrier?.examenCourantCode ?? null,
        });
      }
      this.moteurEncodageCotes.encoder(fiche, input.codeColonne, input.cote, input.idUtilisateur, input.versionAttendue);
      await this.depotFicheCotation.sauvegarder(fiche);
      await this.eventBusPort?.publier(fiche.recupererEvenements());
      const sortie = this.serviceProjectionLecture.projeterFiche(fiche);
      await this.serviceIdempotence.enregistrer(cle, empreinte, sortie);
      await this.serviceAuditBulletin.journaliser({
        action: 'ENCODER_COTE',
        idOrganisation: input.idOrganisation,
        idEcole: fiche.obtenirIdEcole(),
        idUtilisateur: input.idUtilisateur,
        referenceMetier: fiche.obtenirId(),
        operationId: input.cleIdempotence ?? `${input.codeColonne}:${input.versionAttendue}`,
        details: { codeColonne: input.codeColonne, origineSynchronisation: input.origineSynchronisation ?? 'ONLINE' },
      });
      fiche.viderEvenements();
      return sortie;
    });
  }
}
