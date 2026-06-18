import type { EvenementDomaine } from '../../../../../shared/domain/DomainEvent';
import type { DtoCommandeCreationNotification } from '../../../application/dto';
import { NotificationBulletinsEventMapper } from '../mappers/NotificationBulletinsEventMapper';
import type { NotificationBulletinsIntegrationRequest } from '../NotificationsBulletinsIntegrationTypes';

// Ce fichier porte l'anti-corruption layer entre le BC bulletins-evaluations et le module Notifications.

/** Cette classe traduit le langage pedagogique vers le langage stable de Notifications. */
export class NotificationBulletinsAntiCorruptionLayer {
  /** Cette methode traduit un evenement pedagogique en intention de notification exploitable. */
  public traduireEvenement(
    requete: NotificationBulletinsIntegrationRequest,
  ): DtoCommandeCreationNotification | null {
    const evenement = requete.evenement;
    const referenceMetier = NotificationBulletinsEventMapper.extraireReferenceMetier(evenement);
    const destinataires =
      requete.destinataires ?? this.construireDestinatairesParDefaut(evenement);

    const mapping = this.resoudreMappingEvenement(evenement, requete.message, requete.titre);
    if (mapping === null) {
      return null;
    }

    return NotificationBulletinsEventMapper.convertirDepuisBloc({
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
        contexteOrigine: 'bulletins-evaluations',
        typeEvenementBulletins: evenement.typeEvenement,
        referenceMetier,
        ...requete.metadonnees,
      },
      destinataires,
    });
  }

  /** Cette methode choisit le mapping Notifications adapte a un evenement pedagogique. */
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
      case 'BulletinGenere':
      case 'BulletinValideOfficiellement':
      case 'BulletinVersionFigee':
        return {
          type: 'BULLETIN_DISPONIBLE',
          priorite: 'HIGH',
          portee: 'USER',
          visibilite: 'PRIVATE',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Bulletin disponible',
          message: messageForce ?? 'Un bulletin est disponible pour consultation.',
        };
      case 'ProclamationClasseGeneree':
        return {
          type: 'PROCLAMATION',
          priorite: 'HIGH',
          portee: 'CLASSROOM',
          visibilite: 'RESTRICTED_GROUP',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Proclamation generee',
          message: messageForce ?? 'Une proclamation de classe a ete generee.',
        };
      case 'CoteEncodee':
      case 'CoteModifiee':
      case 'ResultatBulletinRecalcule':
        return {
          type: 'NOTE_PUBLIEE',
          priorite: 'NORMAL',
          portee: 'USER',
          visibilite: 'PRIVATE',
          canaux: ['IN_APP'],
          titre: titreForce ?? 'Nouvelle cote enregistree',
          message: messageForce ?? 'Une cote ou un resultat a ete mis a jour.',
        };
      case 'AnomalieAcademiqueDetectee':
      case 'EchecCoteDetecte':
      case 'ConflitEncodageCoteDetecte':
        return {
          type: 'INCIDENT_DISCIPLINAIRE',
          priorite: 'CRITICAL',
          portee: 'SCHOOL',
          visibilite: 'INTERNAL',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Anomalie academique detectee',
          message: messageForce ?? 'Une anomalie academique ou un conflit de cotation a ete detecte.',
        };
      case 'EleveMarqueNonClasse':
      case 'NonClassesProclamationDetectes':
        return {
          type: 'ECHEC_SCOLAIRE',
          priorite: 'HIGH',
          portee: 'USER',
          visibilite: 'PRIVATE',
          canaux: ['IN_APP', 'EMAIL'],
          titre: titreForce ?? 'Situation scolaire a verifier',
          message: messageForce ?? 'Une situation scolaire necessite une verification.',
        };
      default:
        return null;
    }
  }

  /** Cette methode construit des destinataires par defaut a partir des identifiants pedagogiques disponibles. */
  private construireDestinatairesParDefaut(
    evenement: EvenementDomaine,
  ): DtoCommandeCreationNotification['destinataires'] {
    const idEleve = this.extraireChaine(evenement, 'idEleve');
    if (idEleve) {
      return [
        {
          destinataireId: idEleve,
          typeDestinataire: 'USER',
          canauxAutorises: ['IN_APP', 'EMAIL'],
        },
      ];
    }

    const idClasse = this.extraireChaine(evenement, 'idClassePedagogique');
    if (idClasse) {
      return [
        {
          destinataireId: idClasse,
          typeDestinataire: 'CLASSROOM',
          canauxAutorises: ['IN_APP', 'EMAIL'],
        },
      ];
    }

    return [];
  }

  /** Cette methode lit une propriete chaine optionnelle sur un evenement pedagogique. */
  private extraireChaine(
    evenement: EvenementDomaine,
    cle: string,
  ): string | undefined {
    const valeur = (evenement as unknown as Record<string, unknown>)[cle];
    return typeof valeur === 'string' ? valeur : undefined;
  }
}
