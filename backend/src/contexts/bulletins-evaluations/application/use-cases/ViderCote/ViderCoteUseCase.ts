import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import { MoteurEncodageCotes } from '../../../domain/services/MoteurEncodageCotes';
import { PolicyFenetreEncodageCotes } from '../../../domain/policies/PolicyFenetreEncodageCotes';
import type { ViderCoteInput } from '../../dto/input/ViderCoteInput';
import type { FicheCotationOutput } from '../../dto/output/FicheCotationOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { AutorisationEncodageCotesPort } from '../../ports/out/AutorisationEncodageCotesPort';
import type { ClockPort } from '../../ports/out/ClockPort';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { FenetreEncodageCalendrierPort } from '../../ports/out/FenetreEncodageCalendrierPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceAuditBulletin } from '../../services/ServiceAuditBulletin';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';
import { ServiceValidationConcurrence } from '../../services/ServiceValidationConcurrence';

const horlogeSysteme: ClockPort = {
  maintenant: () => new Date(),
};

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
    private readonly fenetreEncodageCalendrierPort?: FenetreEncodageCalendrierPort,
    private readonly clockPort: ClockPort = horlogeSysteme,
    private readonly policyFenetreEncodageCotes = new PolicyFenetreEncodageCotes(),
    private readonly autorisationEncodageCotesPort?: AutorisationEncodageCotesPort,
  ) {}

  // Cette methode execute le vidage complet de la cote.
  public async executer(input: ViderCoteInput): Promise<FicheCotationOutput> {
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
