import {
  CanalNotification,
  ContexteNotification,
  ContenuNotification,
  DestinataireNotification,
  InformationsReplay,
  InformationsRetry,
  MetadonneesNotification,
  Notification,
  PolitiqueAntiSpam,
  PolitiqueAuditNotification,
  PolitiqueBudgetNotification,
  PolitiqueExpiration,
  PolitiqueGouvernanceLivraison,
  PolitiqueMonitoringNotification,
  PolitiqueOfflineNotification,
  PolitiquePanneFournisseur,
  PolitiqueQuotasNotification,
  PolitiqueRetry,
  PolitiqueSecuriteContenu,
  PolitiqueSecuriteNotification,
  PolitiqueThrottling,
  PreferencesNotification,
} from '../../domain';
import { CommandeCreerNotification } from '../commands';
import {
  ExceptionCanalInterditApplication,
  ExceptionModeleInvalideApplication,
  ExceptionPayloadInvalideNotification,
} from '../exceptions';
import {
  PortDepotModelesNotification,
  PortDepotNotifications,
  PortDepotPreferencesNotification,
  PortPublicationEvenementsNotification,
} from '../ports';

// Ce fichier porte le service applicatif central du module Notifications.

/** Cette classe encapsule les operations communes de construction, chargement et publication. */
export class ServiceApplicationNotifications {
  /** Ce constructeur relie le service aux depots et a la publication d'evenements. */
  constructor(
    private readonly portDepotNotifications: PortDepotNotifications,
    private readonly portDepotModelesNotification: PortDepotModelesNotification,
    private readonly portDepotPreferencesNotification: PortDepotPreferencesNotification,
    private readonly portPublicationEvenements: PortPublicationEvenementsNotification,
  ) {}

  /** Cette methode charge une notification et echoue si elle est absente. */
  public async chargerNotificationExigee(identifiantNotification: string): Promise<Notification> {
    const notification = await this.portDepotNotifications.rechercherParId(identifiantNotification);
    if (notification === null) {
      throw new ExceptionPayloadInvalideNotification(
        `La notification ${identifiantNotification} est introuvable.`,
      );
    }
    return notification;
  }

  /** Cette methode persiste une notification puis publie et vide ses evenements. */
  public async sauvegarderEtPublier(notification: Notification): Promise<void> {
    await this.portDepotNotifications.sauvegarder(notification);
    const evenements = notification.recupererEvenements();
    if (evenements.length > 0) {
      await this.portPublicationEvenements.publier(evenements);
      notification.viderEvenements();
    }
  }

  /** Cette methode construit l'agregat Notification complet depuis la commande applicative. */
  public async creerDepuisCommande(commande: CommandeCreerNotification): Promise<Notification> {
    const canaux = [...commande.canaux];
    if (canaux.length === 0) {
      throw new ExceptionCanalInterditApplication();
    }

    const modele = commande.codeModele
      ? await this.portDepotModelesNotification.rechercherParTypeEtCanal(
          commande.type,
          canaux[0],
          commande.organisationId,
          commande.ecoleId,
        )
      : null;

    if (commande.codeModele && modele === null) {
      throw new ExceptionModeleInvalideApplication('Le modele de notification demande est introuvable.');
    }

    const destinataires = await Promise.all(
      commande.destinataires.map(async (destinataire, index) => {
        const preferences = await this.portDepotPreferencesNotification.rechercherPourDestinataire(
          destinataire.destinataireId,
        );

        const canauxAutorises = this.resoudreCanauxAutorises(
          canaux,
          destinataire.canauxAutorises,
          preferences,
        );

        return new DestinataireNotification(
          `${commande.type}-${destinataire.destinataireId}-${index}`,
          destinataire.typeDestinataire as DestinataireNotification['type'],
          'DIRECT_TARGET',
          commande.visibilite,
          canauxAutorises,
          preferences?.niveau ?? 'USER',
          undefined,
          destinataire.destinataireId,
          undefined,
          undefined,
          undefined,
          commande.ecoleId,
          commande.organisationId,
        );
      }),
    );

    return Notification.creer({
      type: commande.type,
      priorite: commande.priorite,
      portee: commande.portee,
      temporalite: commande.temporalite,
      visibilite: commande.visibilite,
      source: commande.source,
      strategieLivraison: commande.strategieLivraison,
      criticiteLivraison: commande.priorite === 'CRITICAL' ? 'STRICT' : 'IMPORTANT',
      niveauAttentionUtilisateur: commande.priorite === 'LOW' ? 'SILENT' : 'NORMAL',
      exigenceAudit: commande.priorite === 'CRITICAL' ? 'FULL_TRACE' : 'BASIC',
      exigenceMonitoring: commande.priorite === 'CRITICAL' ? 'CRITICAL_REALTIME' : 'DETAILED',
      comportementOffline: 'DELAYABLE',
      contenu: new ContenuNotification(
        commande.message,
        commande.titre,
        { ...(commande.placeholders ?? {}) },
        commande.codeModele ?? modele?.codeModele,
        commande.versionModele ?? modele?.version,
      ),
      contexte: new ContexteNotification(
        commande.source,
        commande.organisationId,
        commande.ecoleId,
        commande.utilisateurId,
        commande.destinataires[0]?.destinataireId,
        commande.type,
        commande.acteurId,
        commande.correlationId,
        commande.requestId,
        { ...(commande.metadonnees ?? {}) },
      ),
      metadonnees: new MetadonneesNotification(undefined, undefined, [], { ...(commande.metadonnees ?? {}) }),
      destinataires,
      canaux,
      informationsRetry: new InformationsRetry(0, this.determinerMaximumRetry(commande.priorite)),
      informationsReplay: new InformationsReplay(0),
      politiqueRetry: new PolitiqueRetry('EXPONENTIAL_BACKOFF', this.determinerMaximumRetry(commande.priorite), 60_000),
      politiqueExpiration: new PolitiqueExpiration(
        commande.dateExpiration ? 'TIME_BASED' : 'NO_EXPIRATION',
        commande.dateExpiration,
      ),
      politiqueQuotas: new PolitiqueQuotasNotification({ SMS: 1000, EMAIL: 10000 }),
      politiqueBudget: new PolitiqueBudgetNotification(1000),
      politiqueThrottling: new PolitiqueThrottling({ minute: 100 }),
      politiqueAntiSpam: new PolitiqueAntiSpam(60_000),
      politiqueGouvernanceLivraison: new PolitiqueGouvernanceLivraison(commande.priorite === 'CRITICAL'),
      politiqueSecurite: new PolitiqueSecuriteNotification(true),
      politiqueOffline: new PolitiqueOfflineNotification('DELAYABLE'),
      politiquePanneFournisseur: new PolitiquePanneFournisseur(true, true),
      politiqueAudit: new PolitiqueAuditNotification(
        commande.priorite === 'CRITICAL' ? 'FULL_TRACE' : 'BASIC',
      ),
      politiqueMonitoring: new PolitiqueMonitoringNotification(
        commande.priorite === 'CRITICAL' ? 'CRITICAL_REALTIME' : 'DETAILED',
        commande.priorite === 'CRITICAL' ? 'STRICT' : 'IMPORTANT',
      ),
      politiqueSecuriteContenu: new PolitiqueSecuriteContenu(),
      consentements: [],
    });
  }

  /** Cette methode calcule les canaux applicables en croisant commande et preferences. */
  private resoudreCanauxAutorises(
    canauxDemandes: readonly CanalNotification[],
    canauxDestinataire: readonly CanalNotification[] | undefined,
    preferences: PreferencesNotification | null,
  ): CanalNotification[] {
    const depuisDestinataire = canauxDestinataire && canauxDestinataire.length > 0
      ? [...canauxDestinataire]
      : [...canauxDemandes];
    const depuisPreferences = preferences?.obtenirCanauxAutorises() ?? depuisDestinataire;
    const resultat = depuisDestinataire.filter((canal) => depuisPreferences.includes(canal));

    if (resultat.length === 0) {
      throw new ExceptionCanalInterditApplication(
        'Aucun canal compatible n a ete resolu pour un destinataire.',
      );
    }

    return resultat;
  }

  /** Cette methode derive un maximum de retry selon la priorite applicative. */
  private determinerMaximumRetry(priorite: CommandeCreerNotification['priorite']): number {
    switch (priorite) {
      case 'CRITICAL':
        return 5;
      case 'HIGH':
        return 4;
      case 'NORMAL':
        return 3;
      default:
        return 1;
    }
  }
}
