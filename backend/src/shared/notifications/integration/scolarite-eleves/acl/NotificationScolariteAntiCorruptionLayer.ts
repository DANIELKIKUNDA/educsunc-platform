import { NotificationScolariteEventMapper } from '../mappers/NotificationScolariteEventMapper';
import type {
  NotificationScolariteCommunicationRequest,
  NotificationScolariteEvenementLike,
  NotificationScolariteIntegrationRequest,
} from '../NotificationsScolariteIntegrationTypes';
import type { DtoCommandeCreationNotification } from '../../../application/dto';

// Ce fichier porte l'anti-corruption layer entre le BC scolarite-eleves et le module Notifications.

/** Cette classe traduit le langage de scolarite-eleves vers le langage stable de Notifications. */
export class NotificationScolariteAntiCorruptionLayer {
  /** Cette methode traduit un evenement de scolarite en intention de notification exploitable. */
  public traduireEvenement(
    requete: NotificationScolariteIntegrationRequest,
  ): DtoCommandeCreationNotification | null {
    const evenement = requete.evenement;
    const referenceMetier = NotificationScolariteEventMapper.extraireReferenceMetier(evenement);
    const destinataires =
      requete.destinataires ?? this.construireDestinatairesParDefaut(referenceMetier);

    const mapping = this.resoudreMappingEvenement(evenement, requete.message, requete.titre);
    if (mapping === null) {
      return null;
    }

    return NotificationScolariteEventMapper.convertirDepuisBloc({
      idempotencyKey: `${evenement.typeEvenement}-${evenement.idEvenement}`,
      type: mapping.type,
      priorite: mapping.priorite,
      portee: 'USER',
      temporalite: 'IMMEDIATE',
      visibilite: 'PRIVATE',
      source: 'SYSTEM_EVENT',
      strategieLivraison: 'FALLBACK_CHAIN',
      canaux: requete.canaux ?? mapping.canaux,
      organisationId: evenement.idOrganisation,
      ecoleId: evenement.idEcole,
      acteurId: evenement.declenchePar,
      correlationId: evenement.idEvenement,
      requestId: evenement.idEvenement,
      titre: requete.titre ?? mapping.titre,
      message: requete.message ?? mapping.message,
      metadonnees: {
        contexteOrigine: 'scolarite-eleves',
        typeEvenementScolarite: evenement.typeEvenement,
        referenceMetier,
        ...requete.metadonnees,
      },
      destinataires,
    });
  }

  /** Cette methode traduit une demande legacy de communication de scolarite en intention standard. */
  public traduireDemandeCommunication(
    requete: NotificationScolariteCommunicationRequest,
  ): DtoCommandeCreationNotification {
    return NotificationScolariteEventMapper.convertirDepuisBloc({
      idempotencyKey: `scolarite-legacy-${requete.correlationId ?? requete.notification.destinataire}-${requete.notification.sujet}`,
      type: 'INFORMATION_GENERALE',
      priorite: 'NORMAL',
      portee: 'USER',
      temporalite: 'IMMEDIATE',
      visibilite: 'PRIVATE',
      source: 'USER_ACTION',
      strategieLivraison: 'FALLBACK_CHAIN',
      canaux: ['IN_APP', 'EMAIL'],
      organisationId: requete.organisationId,
      ecoleId: requete.ecoleId,
      acteurId: requete.acteurId,
      correlationId: requete.correlationId,
      requestId: requete.requestId,
      titre: requete.notification.sujet,
      message: requete.notification.message,
      metadonnees: {
        contexteOrigine: 'scolarite-eleves',
        modeIntegration: 'communication-legacy',
        ...requete.metadonnees,
      },
      destinataires: [
        {
          destinataireId: requete.notification.destinataire,
          typeDestinataire: 'USER',
          canauxAutorises: ['IN_APP', 'EMAIL'],
        },
      ],
    });
  }

  /** Cette methode choisit le mapping Notifications adapte a un evenement de scolarite. */
  private resoudreMappingEvenement(
    evenement: NotificationScolariteEvenementLike,
    messageForce?: string,
    titreForce?: string,
  ): {
    readonly type: DtoCommandeCreationNotification['type'];
    readonly priorite: DtoCommandeCreationNotification['priorite'];
    readonly canaux: DtoCommandeCreationNotification['canaux'];
    readonly titre: string;
    readonly message: string;
  } | null {
    switch (evenement.typeEvenement) {
      case 'InscriptionScolaireValidee':
        return {
          type: 'INSCRIPTION_VALIDEE',
          priorite: 'HIGH',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Inscription scolaire validee',
          message: messageForce ?? 'Une inscription scolaire a ete validee.',
        };
      case 'EleveTransfere':
        return {
          type: 'TRANSFERT',
          priorite: 'HIGH',
          canaux: ['IN_APP', 'EMAIL', 'SMS'],
          titre: titreForce ?? 'Transfert eleve enregistre',
          message: messageForce ?? 'Le transfert d un eleve a ete enregistre.',
        };
      case 'EleveAbandonne':
        return {
          type: 'ABANDON',
          priorite: 'HIGH',
          canaux: ['IN_APP', 'EMAIL', 'SMS'],
          titre: titreForce ?? 'Abandon scolaire declare',
          message: messageForce ?? 'Un abandon scolaire a ete declare.',
        };
      case 'EleveReactive':
        return {
          type: 'REINTEGRATION',
          priorite: 'NORMAL',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Reintegration eleve enregistree',
          message: messageForce ?? 'La reintegration d un eleve a ete enregistree.',
        };
      case 'ClasseAffectationChangee':
      case 'EleveAffecteAClasse':
        return {
          type: 'CHANGEMENT_CLASSE',
          priorite: 'NORMAL',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Changement de classe enregistre',
          message: messageForce ?? 'Le changement de classe d un eleve a ete enregistre.',
        };
      case 'EleveSuspendu':
        return {
          type: 'SANCTION',
          priorite: 'CRITICAL',
          canaux: ['IN_APP', 'EMAIL', 'SMS'],
          titre: titreForce ?? 'Suspension eleve enregistree',
          message: messageForce ?? 'Une suspension eleve a ete enregistree.',
        };
      case 'EleveCree':
        return {
          type: 'INFORMATION_GENERALE',
          priorite: 'LOW',
          canaux: ['IN_APP'],
          titre: titreForce ?? 'Eleve cree',
          message: messageForce ?? 'Un nouvel eleve a ete cree dans le systeme.',
        };
      default:
        return null;
    }
  }

  /** Cette methode construit un destinataire par defaut quand seul le referentiel metier est connu. */
  private construireDestinatairesParDefaut(
    referenceMetier?: string,
  ): DtoCommandeCreationNotification['destinataires'] {
    if (!referenceMetier) {
      return [];
    }

    return [
      {
        destinataireId: referenceMetier,
        typeDestinataire: 'USER',
        canauxAutorises: ['IN_APP', 'EMAIL'],
      },
    ];
  }
}
