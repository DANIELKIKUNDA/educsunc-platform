import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import {
  CanalNotification,
  CriticiteLivraison,
  ExigenceAudit,
  ExigenceMonitoring,
  NiveauAttentionUtilisateur,
  PorteeNotification,
  SourceNotification,
  StatutNotification,
  StrategieLivraison,
  TemporaliteNotification,
  TypeNotification,
  VisibiliteNotification,
} from '../enumerations';
import {
  ConsentementCommunication,
  DestinataireNotification,
  EntreeChronologieNotification,
  TentativeLivraison,
} from '../entites';
import {
  ChronologieNotification,
  ContexteNotification,
  ContenuNotification,
  IdentifiantNotification,
  InformationsReplay,
  InformationsRetry,
  MetadonneesNotification,
} from '../objets-valeur';
import {
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
} from '../politiques';
import {
  ExceptionAnnulationNotification,
  ExceptionArchiveNotification,
  ExceptionExpirationNotification,
  ExceptionRetryNotification,
  ExceptionSecuriteContenuNotification,
  ExceptionTransitionNotification,
  ExceptionViolationLivraisonNotification,
  ExceptionViolationTenantNotification,
} from '../exceptions';
import {
  SpecificationAudienceNotification,
  SpecificationRetryNotification,
  SpecificationSecuriteContenuNotification,
  SpecificationTransitionNotification,
} from '../specifications';
import {
  EvenementNotificationArchivee,
  EvenementNotificationCreee,
  EvenementNotificationEchecLivraison,
  EvenementNotificationEnvoyee,
  EvenementNotificationExpiree,
  EvenementNotificationFallbackDemarre,
  EvenementNotificationMiseEnFile,
  EvenementNotificationProcessingDemarre,
  EvenementNotificationReplayDemarre,
  EvenementNotificationReplayTermine,
  EvenementNotificationRetryDemarre,
  EvenementNotificationRetryPlanifiee,
  EvenementNotificationValidee,
  EvenementTentativeLivraisonDemarree,
} from '../evenements';

/**
 * Cette interface decrit l'etat complet protege par l'agregat Notification.
 */
export interface ProprietesNotification {
  identifiant: IdentifiantNotification;
  type: TypeNotification;
  priorite: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  statut: StatutNotification;
  portee: PorteeNotification;
  temporalite: TemporaliteNotification;
  visibilite: VisibiliteNotification;
  source: SourceNotification;
  strategieLivraison: StrategieLivraison;
  criticiteLivraison: CriticiteLivraison;
  niveauAttentionUtilisateur: NiveauAttentionUtilisateur;
  exigenceAudit: ExigenceAudit;
  exigenceMonitoring: ExigenceMonitoring;
  comportementOffline: 'IGNORABLE' | 'DELAYABLE' | 'MUST_SYNC' | 'MUST_CONFIRM';
  contenu: ContenuNotification;
  contexte: ContexteNotification;
  chronologie: ChronologieNotification;
  metadonnees: MetadonneesNotification;
  destinataires: DestinataireNotification[];
  canaux: CanalNotification[];
  informationsRetry: InformationsRetry;
  informationsReplay: InformationsReplay;
  politiqueRetry: PolitiqueRetry;
  politiqueExpiration: PolitiqueExpiration;
  politiqueQuotas?: PolitiqueQuotasNotification;
  politiqueBudget?: PolitiqueBudgetNotification;
  politiqueThrottling?: PolitiqueThrottling;
  politiqueAntiSpam?: PolitiqueAntiSpam;
  politiqueGouvernanceLivraison?: PolitiqueGouvernanceLivraison;
  politiqueSecurite: PolitiqueSecuriteNotification;
  politiqueOffline: PolitiqueOfflineNotification;
  politiquePanneFournisseur: PolitiquePanneFournisseur;
  politiqueAudit: PolitiqueAuditNotification;
  politiqueMonitoring: PolitiqueMonitoringNotification;
  politiqueSecuriteContenu: PolitiqueSecuriteContenu;
  consentements: ConsentementCommunication[];
  timeline: EntreeChronologieNotification[];
  tentativesLivraison: TentativeLivraison[];
  creeLe: Date;
  misAJourLe: Date;
}

/**
 * Cette interface decrit les donnees minimales necessaires pour creer une notification.
 */
export interface CommandeCreationNotification extends Omit<
  ProprietesNotification,
  'identifiant' | 'statut' | 'chronologie' | 'timeline' | 'tentativesLivraison' | 'creeLe' | 'misAJourLe'
> {
  identifiant?: IdentifiantNotification;
}

/**
 * Cet agregat est la racine officielle du domaine Notifications.
 * Il protege le cycle de vie, les transitions, le retry, le replay et la chronology.
 */
export class Notification extends RacineAgregat<string> {
  private readonly identifiant: IdentifiantNotification;
  public readonly type: TypeNotification;
  public readonly priorite: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  private statut: StatutNotification;
  public readonly portee: PorteeNotification;
  public readonly temporalite: TemporaliteNotification;
  public readonly visibilite: VisibiliteNotification;
  public readonly source: SourceNotification;
  public readonly strategieLivraison: StrategieLivraison;
  public readonly criticiteLivraison: CriticiteLivraison;
  public readonly niveauAttentionUtilisateur: NiveauAttentionUtilisateur;
  public readonly exigenceAudit: ExigenceAudit;
  public readonly exigenceMonitoring: ExigenceMonitoring;
  public readonly comportementOffline: 'IGNORABLE' | 'DELAYABLE' | 'MUST_SYNC' | 'MUST_CONFIRM';
  public readonly contenu: ContenuNotification;
  public readonly contexte: ContexteNotification;
  public readonly chronologie: ChronologieNotification;
  public readonly metadonnees: MetadonneesNotification;
  private readonly destinataires: DestinataireNotification[];
  private readonly canaux: CanalNotification[];
  private informationsRetry: InformationsRetry;
  private informationsReplay: InformationsReplay;
  public readonly politiqueRetry: PolitiqueRetry;
  public readonly politiqueExpiration: PolitiqueExpiration;
  public readonly politiqueQuotas?: PolitiqueQuotasNotification;
  public readonly politiqueBudget?: PolitiqueBudgetNotification;
  public readonly politiqueThrottling?: PolitiqueThrottling;
  public readonly politiqueAntiSpam?: PolitiqueAntiSpam;
  public readonly politiqueGouvernanceLivraison?: PolitiqueGouvernanceLivraison;
  public readonly politiqueSecurite: PolitiqueSecuriteNotification;
  public readonly politiqueOffline: PolitiqueOfflineNotification;
  public readonly politiquePanneFournisseur: PolitiquePanneFournisseur;
  public readonly politiqueAudit: PolitiqueAuditNotification;
  public readonly politiqueMonitoring: PolitiqueMonitoringNotification;
  private readonly politiqueSecuriteContenu: PolitiqueSecuriteContenu;
  public readonly consentements: ConsentementCommunication[];
  private readonly timeline: EntreeChronologieNotification[];
  private readonly tentativesLivraison: TentativeLivraison[];
  public readonly creeLe: Date;
  public misAJourLe: Date;

  /**
   * Ce constructeur hydrate l'agregat complet et verifie les invariants principaux.
   */
  constructor(proprietes: ProprietesNotification) {
    super(proprietes.identifiant.obtenirValeur());
    this.identifiant = proprietes.identifiant;
    this.type = proprietes.type;
    this.priorite = proprietes.priorite;
    this.statut = proprietes.statut;
    this.portee = proprietes.portee;
    this.temporalite = proprietes.temporalite;
    this.visibilite = proprietes.visibilite;
    this.source = proprietes.source;
    this.strategieLivraison = proprietes.strategieLivraison;
    this.criticiteLivraison = proprietes.criticiteLivraison;
    this.niveauAttentionUtilisateur = proprietes.niveauAttentionUtilisateur;
    this.exigenceAudit = proprietes.exigenceAudit;
    this.exigenceMonitoring = proprietes.exigenceMonitoring;
    this.comportementOffline = proprietes.comportementOffline;
    this.contenu = proprietes.contenu;
    this.contexte = proprietes.contexte;
    this.chronologie = proprietes.chronologie;
    this.metadonnees = proprietes.metadonnees;
    this.destinataires = [...proprietes.destinataires];
    this.canaux = [...proprietes.canaux];
    this.informationsRetry = proprietes.informationsRetry;
    this.informationsReplay = proprietes.informationsReplay;
    this.politiqueRetry = proprietes.politiqueRetry;
    this.politiqueExpiration = proprietes.politiqueExpiration;
    this.politiqueQuotas = proprietes.politiqueQuotas;
    this.politiqueBudget = proprietes.politiqueBudget;
    this.politiqueThrottling = proprietes.politiqueThrottling;
    this.politiqueAntiSpam = proprietes.politiqueAntiSpam;
    this.politiqueGouvernanceLivraison = proprietes.politiqueGouvernanceLivraison;
    this.politiqueSecurite = proprietes.politiqueSecurite;
    this.politiqueOffline = proprietes.politiqueOffline;
    this.politiquePanneFournisseur = proprietes.politiquePanneFournisseur;
    this.politiqueAudit = proprietes.politiqueAudit;
    this.politiqueMonitoring = proprietes.politiqueMonitoring;
    this.politiqueSecuriteContenu = proprietes.politiqueSecuriteContenu;
    this.consentements = [...proprietes.consentements];
    this.timeline = [...proprietes.timeline];
    this.tentativesLivraison = [...proprietes.tentativesLivraison];
    this.creeLe = proprietes.creeLe;
    this.misAJourLe = proprietes.misAJourLe;

    this.validerAudience();
    this.validerContenu();
    this.validerCanaux();
  }

  /**
   * Cette fabrique cree la notification initiale et emet l'evenement de creation.
   */
  public static creer(proprietes: CommandeCreationNotification): Notification {
    const notification = new Notification({
      ...proprietes,
      identifiant: proprietes.identifiant ?? new IdentifiantNotification(randomUUID()),
      statut: 'CREATED',
      chronologie: new ChronologieNotification(
        'FORENSIC',
        proprietes.contexte.obtenirCorrelationId(),
        proprietes.contexte.obtenirRequestId(),
      ),
      timeline: [],
      tentativesLivraison: [],
      creeLe: new Date(),
      misAJourLe: new Date(),
    });

    notification.ajouterEntreeTimeline('CREATED', undefined, 'CREATED');
    notification.ajouterEvenement(new EvenementNotificationCreee(
      notification.identifiant.obtenirValeur(),
      notification.type,
    ));
    return notification;
  }

  /** Cette methode expose l'identifiant metier de la notification. */
  public obtenirIdentifiant(): IdentifiantNotification { return this.identifiant; }

  /** Cette methode expose le statut courant de la notification. */
  public obtenirStatut(): StatutNotification { return this.statut; }

  /** Cette methode expose les destinataires resolves de la notification. */
  public obtenirDestinataires(): DestinataireNotification[] { return [...this.destinataires]; }

  /** Cette methode expose la timeline append-only de la notification. */
  public obtenirTimeline(): EntreeChronologieNotification[] { return [...this.timeline]; }

  /** Cette methode expose les tentatives de livraison deja connues. */
  public obtenirTentativesLivraison(): TentativeLivraison[] { return [...this.tentativesLivraison]; }

  /** Cette methode expose la politique de retry appliquee a la notification. */
  public obtenirPolitiqueRetry(): PolitiqueRetry { return this.politiqueRetry; }

  /** Cette methode expose les informations runtime de retry. */
  public obtenirInformationsRetry(): InformationsRetry { return this.informationsRetry; }

  /** Cette methode expose les informations runtime de replay. */
  public obtenirInformationsReplay(): InformationsReplay { return this.informationsReplay; }

  /** Cette methode marque la notification comme validee. */
  public valider(): void {
    this.transitionnerVers('VALIDATED');
    this.ajouterEvenement(new EvenementNotificationValidee(this.identifiant.obtenirValeur()));
  }

  /** Cette methode place la notification dans l'orchestration asynchrone. */
  public mettreEnFile(): void {
    this.transitionnerVers('QUEUED');
    this.ajouterEvenement(new EvenementNotificationMiseEnFile(this.identifiant.obtenirValeur()));
  }

  /** Cette methode demarre le traitement runtime de la notification. */
  public demarrerTraitement(): void {
    this.transitionnerVers('PROCESSING');
    this.ajouterEvenement(new EvenementNotificationProcessingDemarre(this.identifiant.obtenirValeur()));
  }

  /** Cette methode ouvre une nouvelle tentative de livraison sur un canal donne. */
  public demarrerTentativeLivraison(canal: CanalNotification, fournisseur?: string): TentativeLivraison {
    this.verifierEtatTerminal();
    const tentative = TentativeLivraison.creer(
      randomUUID(),
      canal,
      fournisseur,
      this.contexte.obtenirOrganisationId(),
      this.contexte.obtenirEcoleId(),
      this.informationsRetry.obtenirCompteurRetry(),
    );
    this.tentativesLivraison.push(tentative);
    this.ajouterEvenement(new EvenementTentativeLivraisonDemarree(this.identifiant.obtenirValeur(), canal));
    return tentative;
  }

  /** Cette methode marque une tentative precise comme reussie et fait avancer la notification. */
  public marquerLivraisonReussie(identifiantTentative: string, resultat?: string): void {
    const tentative = this.obtenirTentative(identifiantTentative);
    tentative.marquerSucces(resultat);
    this.transitionnerVers('SENT');
    this.ajouterEvenement(new EvenementNotificationEnvoyee(this.identifiant.obtenirValeur(), tentative.obtenirCanal()));
  }

  /** Cette methode marque une tentative precise comme echouee et enrichit l'historique de retry. */
  public marquerLivraisonEnEchec(identifiantTentative: string, erreur: string): void {
    const tentative = this.obtenirTentative(identifiantTentative);
    tentative.marquerEchec(erreur);
    this.informationsRetry = this.informationsRetry.incrementer(erreur);
    this.transitionnerVers('FAILED');
    this.ajouterEvenement(new EvenementNotificationEchecLivraison(
      this.identifiant.obtenirValeur(),
      tentative.obtenirCanal(),
      erreur,
    ));
  }

  /** Cette methode planifie un retry quand les regles metier l'autorisent. */
  public planifierRetry(): void {
    if (!SpecificationRetryNotification.estAutorise(this.statut, this.informationsRetry, this.estExpiree())) {
      throw new ExceptionRetryNotification('Le retry n est pas autorise pour cette notification.');
    }
    this.transitionnerVers('RETRYING');
    this.ajouterEvenement(new EvenementNotificationRetryPlanifiee(this.identifiant.obtenirValeur()));
  }

  /** Cette methode signale le demarrage effectif du workflow de retry. */
  public demarrerRetry(): void {
    if (!SpecificationRetryNotification.estAutorise(this.statut, this.informationsRetry, this.estExpiree())) {
      throw new ExceptionRetryNotification('Le retry ne peut pas demarrer.');
    }
    this.ajouterEvenement(new EvenementNotificationRetryDemarre(this.identifiant.obtenirValeur()));
  }

  /** Cette methode bascule la notification en fallback de canal. */
  public demarrerFallback(): void {
    this.transitionnerVers('FALLBACK_PROCESSING');
    this.ajouterEvenement(new EvenementNotificationFallbackDemarre(this.identifiant.obtenirValeur()));
  }

  /** Cette methode rend la notification obsolete selon sa politique d'expiration. */
  public expirer(): void {
    this.transitionnerVers('EXPIRED');
    this.ajouterEvenement(new EvenementNotificationExpiree(this.identifiant.obtenirValeur()));
  }

  /** Cette methode annule volontairement la notification. */
  public annuler(): void {
    this.transitionnerVers('CANCELLED');
  }

  /** Cette methode ouvre un replay technique sans recréer une intention metier. */
  public demarrerReplay(raison?: string, initiateur?: string): void {
    this.verifierEtatTerminal();
    this.informationsReplay = this.informationsReplay.incrementer(raison, initiateur);
    this.transitionnerVers('REPLAYING');
    this.ajouterEvenement(new EvenementNotificationReplayDemarre(this.identifiant.obtenirValeur()));
  }

  /** Cette methode cloture le replay et archive l'objet. */
  public terminerReplay(): void {
    this.transitionnerVers('ARCHIVED');
    this.ajouterEvenement(new EvenementNotificationReplayTermine(this.identifiant.obtenirValeur()));
  }

  /** Cette methode archive explicitement la notification. */
  public archiver(): void {
    this.transitionnerVers('ARCHIVED');
    this.ajouterEvenement(new EvenementNotificationArchivee(this.identifiant.obtenirValeur()));
  }

  /** Cette methode applique les regles d'isolation tenant sur les audiences. */
  private validerAudience(): void {
    if (!SpecificationAudienceNotification.respecteIsolationTenant(
      this.contexte.obtenirOrganisationId(),
      this.contexte.obtenirEcoleId(),
      this.destinataires,
    )) {
      throw new ExceptionViolationTenantNotification(
        'Tous les destinataires doivent respecter l isolation tenant de la notification.',
      );
    }
  }

  /** Cette methode verifie que le contenu ne porte aucune donnee interdite. */
  private validerContenu(): void {
    if (!SpecificationSecuriteContenuNotification.estValide(this.contenu, this.politiqueSecuriteContenu)) {
      throw new ExceptionSecuriteContenuNotification(
        'Le contenu de la notification contient des donnees interdites.',
      );
    }
  }

  /** Cette methode verifie qu'au moins un canal reste compatible avec chaque destinataire. */
  private validerCanaux(): void {
    const auMoinsUnDestinataireIncompatible = this.destinataires.some((destinataire) => {
      const canauxAutorises = destinataire.obtenirCanauxAutorises();
      return canauxAutorises.length > 0 && this.canaux.every((canal) => !canauxAutorises.includes(canal));
    });

    if (auMoinsUnDestinataireIncompatible) {
      throw new ExceptionViolationLivraisonNotification(
        'Au moins un destinataire n accepte aucun des canaux prevus.',
      );
    }
  }

  /** Cette methode applique la machine de transition officielle du document. */
  private transitionnerVers(statutCible: StatutNotification): void {
    if (this.estExpiree() && !['EXPIRED', 'ARCHIVED'].includes(statutCible)) {
      throw new ExceptionExpirationNotification('Une notification expiree ne peut plus etre traitee.');
    }
    if (this.statut === 'CANCELLED' && statutCible !== 'ARCHIVED') {
      throw new ExceptionAnnulationNotification('Une notification annulee ne peut plus etre relancee.');
    }
    if (this.statut === 'ARCHIVED') {
      throw new ExceptionArchiveNotification('Une notification archivee est en lecture seule.');
    }
    if (!SpecificationTransitionNotification.estAutorisee(this.statut, statutCible)) {
      throw new ExceptionTransitionNotification(`Transition interdite: ${this.statut} -> ${statutCible}.`);
    }

    const statutAvant = this.statut;
    this.statut = statutCible;
    this.misAJourLe = new Date();
    this.ajouterEntreeTimeline(statutCible, statutAvant, statutCible);
  }

  /** Cette methode ajoute une entree append-only a la chronology locale de la notification. */
  private ajouterEntreeTimeline(typeEvenement: string, statutAvant: StatutNotification | undefined, statutApres: StatutNotification): void {
    this.timeline.push(EntreeChronologieNotification.creer({
      identifiant: randomUUID(),
      horodatage: new Date(),
      typeEvenement,
      origine: this.source,
      statutAvant,
      statutApres,
      correlationId: this.contexte.obtenirCorrelationId(),
      requestId: this.contexte.obtenirRequestId(),
      acteur: this.contexte.obtenirActeurId(),
      metadonnees: this.metadonnees.obtenirAdditionnelles(),
      metadonneesForensic: this.contexte.obtenirMetadonneesChronologie(),
    }));
  }

  /** Cette methode retrouve une tentative connue ou signale une incoherence de livraison. */
  private obtenirTentative(identifiantTentative: string): TentativeLivraison {
    const tentative = this.tentativesLivraison.find((element) => element.obtenirId() === identifiantTentative);
    if (!tentative) {
      throw new ExceptionViolationLivraisonNotification(`La tentative ${identifiantTentative} est introuvable.`);
    }
    return tentative;
  }

  /** Cette methode interdit tout traitement actif sur les statuts terminaux. */
  private verifierEtatTerminal(): void {
    if (this.statut === 'EXPIRED') {
      throw new ExceptionExpirationNotification('Cette notification est expiree.');
    }
    if (this.statut === 'CANCELLED') {
      throw new ExceptionAnnulationNotification('Cette notification est annulee.');
    }
    if (this.statut === 'ARCHIVED') {
      throw new ExceptionArchiveNotification('Cette notification est archivee.');
    }
  }

  /** Cette methode applique la politique d'expiration sur l'instant courant. */
  private estExpiree(): boolean {
    return this.statut === 'EXPIRED' || this.politiqueExpiration.estExpiree(new Date());
  }
}
