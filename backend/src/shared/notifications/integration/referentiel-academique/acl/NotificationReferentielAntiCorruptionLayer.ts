import type { EvenementDomaine } from '../../../../../shared/domain/DomainEvent';
import type { DtoCommandeCreationNotification } from '../../../application/dto';
import { NotificationReferentielEventMapper } from '../mappers/NotificationReferentielEventMapper';
import type { NotificationReferentielIntegrationRequest } from '../NotificationsReferentielIntegrationTypes';

// Ce fichier porte l'anti-corruption layer entre le BC referentiel-academique et le module Notifications.

/** Cette classe traduit le langage du referentiel vers le langage stable de Notifications. */
export class NotificationReferentielAntiCorruptionLayer {
  /** Cette methode traduit un evenement de referentiel en intention de notification exploitable. */
  public traduireEvenement(
    requete: NotificationReferentielIntegrationRequest,
  ): DtoCommandeCreationNotification | null {
    const evenement = requete.evenement;
    const referenceMetier = NotificationReferentielEventMapper.extraireReferenceMetier(evenement);
    const mapping = this.resoudreMappingEvenement(evenement, requete.message, requete.titre);
    if (mapping === null) {
      return null;
    }

    return NotificationReferentielEventMapper.convertirDepuisBloc({
      idempotencyKey: `${evenement.typeEvenement}-${evenement.idEvenement}`,
      type: mapping.type,
      priorite: mapping.priorite,
      portee: mapping.portee,
      temporalite: 'IMMEDIATE',
      visibilite: mapping.visibilite,
      source: 'SYSTEM_EVENT',
      strategieLivraison: 'FALLBACK_CHAIN',
      canaux: requete.canaux ?? mapping.canaux,
      organisationId: requete.organisationId,
      ecoleId: requete.ecoleId,
      acteurId: requete.acteurId,
      correlationId: evenement.idEvenement,
      requestId: evenement.idEvenement,
      titre: requete.titre ?? mapping.titre,
      message: requete.message ?? mapping.message,
      metadonnees: {
        contexteOrigine: 'referentiel-academique',
        typeEvenementReferentiel: evenement.typeEvenement,
        referenceMetier,
        ...requete.metadonnees,
      },
      destinataires: requete.destinataires ?? [],
    });
  }

  /** Cette methode choisit le mapping Notifications adapte a un evenement de referentiel. */
  private resoudreMappingEvenement(
    evenement: EvenementDomaine,
    messageForce?: string,
    titreForce?: string,
  ): {
    readonly type: DtoCommandeCreationNotification['type'];
    readonly priorite: DtoCommandeCreationNotification['priorite'];
    readonly portee: DtoCommandeCreationNotification['portee'];
    readonly visibilite: DtoCommandeCreationNotification['visibilite'];
    readonly canaux: DtoCommandeCreationNotification['canaux'];
    readonly titre: string;
    readonly message: string;
  } | null {
    switch (evenement.typeEvenement) {
      case 'VersionReferentielPubliee':
      case 'VersionReferentielActivee':
      case 'ReferentielProgrammePublie':
      case 'ReferentielProgrammeActive':
      case 'ReferentielCoursActive':
      case 'ReferentielProgrammeCharge':
      case 'ReferentielCoursCharge':
      case 'ProgrammeNiveauValide':
      case 'ProgrammeNiveauMigre':
      case 'ProgrammeNiveauInitialise':
        return {
          type: 'COMMUNIQUE',
          priorite: 'NORMAL',
          portee: 'ORGANIZATION',
          visibilite: 'INTERNAL',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Mise a jour du referentiel',
          message: messageForce ?? 'Une mise a jour du referentiel academique est disponible.',
        };
      case 'CalendrierCree':
      case 'CalendrierValide':
      case 'CalendrierAcademiqueVerrouille':
      case 'AnneeScolaireCreee':
      case 'AnneeScolaireActivee':
      case 'AnneeScolaireCloturee':
      case 'AnneeScolaireArchivee':
        return {
          type: 'EVENEMENT_ECOLE',
          priorite: 'HIGH',
          portee: 'SCHOOL',
          visibilite: 'INTERNAL',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Calendrier academique mis a jour',
          message: messageForce ?? "Une evolution du calendrier ou de l'annee scolaire a ete enregistree.",
        };
      case 'EcoleCreee':
      case 'EcoleActivee':
      case 'EcoleDesactivee':
      case 'EcoleRenommee':
      case 'OrganisationCreee':
      case 'OrganisationActivee':
      case 'OrganisationDesactivee':
      case 'OrganisationRenommee':
      case 'ClassePedagogiqueCreee':
      case 'ClassePedagogiqueActivee':
      case 'ClassePedagogiqueDesactivee':
      case 'ClassePedagogiqueArchivee':
      case 'ClassePedagogiqueRenommee':
      case 'ClasseAcademiqueCreee':
      case 'ClasseAcademiqueDesactivee':
      case 'ClasseAcademiqueMiseAJour':
      case 'SectionScolaireCreee':
      case 'SectionScolaireActivee':
      case 'SectionScolaireDesactivee':
      case 'SectionScolaireRenommee':
      case 'OptionEtudeCreee':
      case 'OptionEtudeDesactivee':
      case 'OptionEtudeRenommee':
      case 'ModeExploitationChange':
      case 'MigrationAppliquee':
      case 'MigrationAnnulee':
      case 'MigrationAnalysee':
        return {
          type: 'INFORMATION_GENERALE',
          priorite: 'NORMAL',
          portee: 'ORGANIZATION',
          visibilite: 'INTERNAL',
          canaux: ['IN_APP'],
          titre: titreForce ?? 'Structure academique mise a jour',
          message: messageForce ?? 'Une structure ou un parametre academique a ete mis a jour.',
        };
      default:
        return null;
    }
  }
}
