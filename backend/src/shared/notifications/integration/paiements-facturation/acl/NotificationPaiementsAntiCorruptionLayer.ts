import type { EvenementDomaine } from '../../../../../shared/domain/DomainEvent';
import type { DtoCommandeCreationNotification } from '../../../application/dto';
import { NotificationPaiementsEventMapper } from '../mappers/NotificationPaiementsEventMapper';
import type {
  NotificationPaiementsEvenementLike,
  NotificationPaiementsIntegrationRequest,
  NotificationPaiementsLegacyRequest,
} from '../NotificationsPaiementsIntegrationTypes';

// Ce fichier porte l'anti-corruption layer entre le BC paiements-facturation et le module Notifications.

/** Cette classe traduit le langage financier vers le langage stable de Notifications. */
export class NotificationPaiementsAntiCorruptionLayer {
  /** Cette methode traduit un evenement financier en intention de notification exploitable. */
  public traduireEvenement(
    requete: NotificationPaiementsIntegrationRequest,
  ): DtoCommandeCreationNotification | null {
    const evenement = requete.evenement as NotificationPaiementsEvenementLike;
    const referenceMetier = NotificationPaiementsEventMapper.extraireReferenceMetier(evenement);
    const destinataires =
      requete.destinataires ?? this.construireDestinatairesParDefaut(evenement);

    const mapping = this.resoudreMappingEvenement(evenement, requete.message, requete.titre);
    if (mapping === null) {
      return null;
    }

    const ecoleId = requete.ecoleId ?? this.extraireChaine(evenement, 'idEcole');
    const acteurId = requete.acteurId ?? this.extraireChaine(evenement, 'declenchePar');

    return NotificationPaiementsEventMapper.convertirDepuisBloc({
      idempotencyKey: `${evenement.typeEvenement}-${evenement.idEvenement}`,
      type: mapping.type,
      priorite: mapping.priorite,
      portee: 'USER',
      temporalite: 'IMMEDIATE',
      visibilite: 'PRIVATE',
      source: 'SYSTEM_EVENT',
      strategieLivraison: 'FALLBACK_CHAIN',
      canaux: requete.canaux ?? mapping.canaux,
      organisationId: requete.organisationId,
      ecoleId,
      acteurId,
      correlationId: evenement.idEvenement,
      requestId: evenement.idEvenement,
      titre: requete.titre ?? mapping.titre,
      message: requete.message ?? mapping.message,
      metadonnees: {
        contexteOrigine: 'paiements-facturation',
        typeEvenementPaiement: evenement.typeEvenement,
        referenceMetier,
        ...requete.metadonnees,
      },
      destinataires,
    });
  }

  /** Cette methode traduit une demande legacy de notification du BC financier. */
  public traduireDemandeLegacy(
    requete: NotificationPaiementsLegacyRequest,
  ): DtoCommandeCreationNotification {
    return NotificationPaiementsEventMapper.convertirDepuisBloc({
      idempotencyKey: `paiements-legacy-${requete.correlationId ?? requete.notification.idPaiement}-${requete.notification.idEleve}`,
      type: 'PAIEMENT_RECU',
      priorite: 'NORMAL',
      portee: 'USER',
      temporalite: 'IMMEDIATE',
      visibilite: 'PRIVATE',
      source: 'USER_ACTION',
      strategieLivraison: 'FALLBACK_CHAIN',
      canaux: ['IN_APP', 'EMAIL'],
      organisationId: requete.organisationId,
      ecoleId: requete.notification.idEcole,
      acteurId: requete.acteurId,
      correlationId: requete.correlationId,
      requestId: requete.requestId,
      titre: 'Notification paiement',
      message: requete.notification.message,
      metadonnees: {
        contexteOrigine: 'paiements-facturation',
        modeIntegration: 'notification-port-legacy',
        idPaiement: requete.notification.idPaiement,
        ...requete.metadonnees,
      },
      destinataires: [
        {
          destinataireId: requete.notification.idEleve,
          typeDestinataire: 'USER',
          canauxAutorises: ['IN_APP', 'EMAIL'],
        },
      ],
    });
  }

  /** Cette methode choisit le mapping Notifications adapte a un evenement financier. */
  private resoudreMappingEvenement(
    evenement: EvenementDomaine,
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
      case 'PaiementValide':
      case 'PaiementCree':
      case 'RecuPaiementEmis':
        return {
          type: 'PAIEMENT_RECU',
          priorite: 'NORMAL',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Paiement enregistre',
          message: messageForce ?? 'Un paiement a ete enregistre avec succes.',
        };
      case 'ArriereDetecte':
      case 'DetteEleveMiseAJour':
      case 'ObligationFinanciereCreee':
        return {
          type: 'RAPPEL_DETTE',
          priorite: 'HIGH',
          canaux: ['IN_APP', 'EMAIL', 'SMS'],
          titre: titreForce ?? 'Nouvelle obligation financiere',
          message: messageForce ?? 'Une obligation financiere ou un arriere a ete detecte.',
        };
      case 'PaiementAnnule':
      case 'RecuPaiementAnnule':
        return {
          type: 'ANNULATION_PAIEMENT',
          priorite: 'HIGH',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Paiement annule',
          message: messageForce ?? 'Un paiement a ete annule.',
        };
      case 'PaiementRembourse':
      case 'ExcedentRestitue':
        return {
          type: 'REMBOURSEMENT',
          priorite: 'NORMAL',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Remboursement enregistre',
          message: messageForce ?? 'Un remboursement ou une restitution a ete enregistre.',
        };
      case 'ConflitPaiementDetecte':
      case 'EcartCaisseDetecte':
        return {
          type: 'INCIDENT_SECURITE',
          priorite: 'CRITICAL',
          canaux: ['IN_APP', 'EMAIL', 'SMS'],
          titre: titreForce ?? 'Incident de paiement detecte',
          message: messageForce ?? 'Un incident ou un conflit de paiement a ete detecte.',
        };
      default:
        return null;
    }
  }

  /** Cette methode construit un destinataire par defaut a partir des identifiants du fait financier. */
  private construireDestinatairesParDefaut(
    evenement: EvenementDomaine,
  ): DtoCommandeCreationNotification['destinataires'] {
    const idEleve = this.extraireChaine(evenement as NotificationPaiementsEvenementLike, 'idEleve');
    if (!idEleve) {
      return [];
    }

    return [
      {
        destinataireId: idEleve,
        typeDestinataire: 'USER',
        canauxAutorises: ['IN_APP', 'EMAIL'],
      },
    ];
  }

  /** Cette methode lit une propriete chaine optionnelle sur un evenement financier. */
  private extraireChaine(
    evenement: NotificationPaiementsEvenementLike,
    cle: string,
  ): string | undefined {
    const valeur = (evenement as unknown as Record<string, unknown>)[cle];
    return typeof valeur === 'string' ? valeur : undefined;
  }
}
