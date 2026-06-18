// Ce fichier declare la facade technique de diffusion du futur temps reel Notifications.

import { randomUUID } from 'node:crypto';
import { PortTempsReelNotification } from '../../application';
import { JournalObservabiliteNotifications, TraceurNotifications } from '../observability';
import {
  InitialiseurRuntimeRealtime,
  PrioriteRealtime,
  TypeDiffusionRealtime,
  type PublierEvenementTempsReelCommand,
} from 'shared/realtime';
import {
  CanalTempsReelNotification,
  ContexteTempsReelNotification,
  MessageTempsReelNotification,
} from './TypesTempsReelNotification';

/** Cette classe implemente le port applicatif de diffusion temps reel future. */
export class DiffuseurTempsReelNotification implements PortTempsReelNotification {
  /** Cette liste conserve l'historique local des publications realtime. */
  private readonly publications: MessageTempsReelNotification[] = [];
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  /** Ce constructeur assemble les canaux techniques et les outils d'observabilite. */
  constructor(
    private readonly canaux: readonly CanalTempsReelNotification[],
    private readonly traceurNotifications = new TraceurNotifications(),
    private readonly journalObservabiliteNotifications = new JournalObservabiliteNotifications(),
  ) {}

  /** Cette methode publie un message logique vers les canaux temps reel disponibles. */
  public async publier(sujet: string, donnees: Readonly<Record<string, unknown>>): Promise<void> {
    const contexte = this.extraireContexte(donnees);
    const message: MessageTempsReelNotification = {
      identifiant: randomUUID(),
      sujet,
      publieLe: new Date(),
      donnees,
      contexte,
    };

    const trace = this.traceurNotifications.demarrer(
      'notifications.realtime.publish',
      'REALTIME',
      {
        organisationId: contexte.organisationId,
        ecoleId: contexte.ecoleId,
        correlationId: contexte.correlationId,
        requestId: contexte.requestId,
        acteurId: contexte.acteurId,
        source: 'notifications.infrastructure.realtime-futur',
        metadata: {
          sujet,
        },
      },
      {
        sujet,
      },
    );

    this.publications.push(message);
    const commande = this.construireCommandeRealtime(sujet, donnees, contexte, message.identifiant);
    await this.runtime.broadcast.diffusion.publier(commande);
    await this.runtime.broadcast.diffusion.diffuser(commande);

    const canauxDisponibles = this.canaux.filter((canal) => canal.estDisponible());
    if (canauxDisponibles.length === 0) {
      this.journalObservabiliteNotifications.journaliser(
        'WARN',
        'Aucun canal temps reel futur actif; diffusion relaye par shared/realtime.',
        {
          organisationId: contexte.organisationId,
          ecoleId: contexte.ecoleId,
          correlationId: contexte.correlationId,
          requestId: contexte.requestId,
          acteurId: contexte.acteurId,
          source: 'notifications.infrastructure.realtime-futur',
          metadata: {
            sujet,
          },
        },
      );
    }
    this.journalObservabiliteNotifications.journaliser(
      'INFO',
      'Publication temps reel executee via shared/realtime.',
      {
        organisationId: contexte.organisationId,
        ecoleId: contexte.ecoleId,
        correlationId: contexte.correlationId,
        requestId: contexte.requestId,
        acteurId: contexte.acteurId,
        source: 'notifications.infrastructure.realtime-futur',
        metadata: {
          sujet,
          canaux: canauxDisponibles.map((canal) => canal.obtenirNom()),
        },
      },
    );
    this.traceurNotifications.terminer(trace.identifiantTrace, true, undefined, {
      canauxDiffuses: canauxDisponibles.length,
      canauxTentes: this.canaux.length,
    });
  }

  /** Cette methode retourne les publications memorisees dans le runtime local. */
  public lirePublications(): readonly MessageTempsReelNotification[] {
    return this.publications;
  }

  /** Cette methode extrait le contexte technique temps reel depuis la charge logique. */
  private extraireContexte(donnees: Readonly<Record<string, unknown>>): ContexteTempsReelNotification {
    return {
      organisationId: this.lireChaine(donnees, 'organisationId'),
      ecoleId: this.lireChaine(donnees, 'ecoleId'),
      acteurId: this.lireChaine(donnees, 'acteurId'),
      correlationId: this.lireChaine(donnees, 'correlationId'),
      requestId: this.lireChaine(donnees, 'requestId'),
      metadata: { ...donnees },
    };
  }

  /** Cette methode mappe le contrat historique Notifications vers la commande shared/realtime. */
  private construireCommandeRealtime(
    sujet: string,
    donnees: Readonly<Record<string, unknown>>,
    contexte: ContexteTempsReelNotification,
    identifiant: string,
  ): PublierEvenementTempsReelCommand {
    return {
      evenementId: identifiant,
      type: sujet,
      visible: true,
      impacteInterface: true,
      necessiteReaction: false,
      priorite: PrioriteRealtime.NORMALE,
      typeDiffusion: TypeDiffusionRealtime.MULTICAST,
      raisonValeurUtilisateur: 'notification transportee en temps reel',
      utileImmediatement: true,
      organisationId: contexte.organisationId,
      ecoleId: contexte.ecoleId,
      utilisateurIds: this.extraireUtilisateurs(donnees, contexte),
      permissionsRequises: this.extrairePermissions(donnees),
      canal: 'notifications',
      contexte: {
        organisationId: contexte.organisationId,
        ecoleId: contexte.ecoleId,
        utilisateurId: contexte.acteurId ?? 'notifications-runtime',
        correlationId: contexte.correlationId,
        requestId: contexte.requestId,
        sessionId: this.lireChaine(donnees, 'sessionId') ?? 'notifications-runtime-session',
        permissions: this.extrairePermissions(donnees),
        emittedAt: new Date().toISOString(),
      },
      payload: { sujet, ...donnees },
    };
  }

  /** Cette methode extrait une audience minimale exploitable pour le runtime transverse. */
  private extraireUtilisateurs(
    donnees: Readonly<Record<string, unknown>>,
    contexte: ContexteTempsReelNotification,
  ): readonly string[] {
    const utilisateurIds = donnees['utilisateurIds'];
    if (Array.isArray(utilisateurIds)) {
      const filtres = utilisateurIds.filter(
        (valeur): valeur is string => typeof valeur === 'string' && valeur.length > 0,
      );
      if (filtres.length > 0) {
        return filtres;
      }
    }

    const utilisateurId = this.lireChaine(donnees, 'utilisateurId');
    if (utilisateurId) {
      return [utilisateurId];
    }

    if (contexte.acteurId) {
      return [contexte.acteurId];
    }

    return ['notifications-runtime'];
  }

  /** Cette methode lit les permissions du contrat legacy ou applique un fallback stable. */
  private extrairePermissions(donnees: Readonly<Record<string, unknown>>): readonly string[] {
    const permissions = donnees['permissions'];
    if (Array.isArray(permissions)) {
      const filtres = permissions.filter(
        (valeur): valeur is string => typeof valeur === 'string' && valeur.length > 0,
      );
      if (filtres.length > 0) {
        return filtres;
      }
    }

    return ['notifications.read'];
  }

  /** Cette methode lit une chaine optionnelle depuis une charge de publication. */
  private lireChaine(
    donnees: Readonly<Record<string, unknown>>,
    cle: string,
  ): string | undefined {
    const valeur = donnees[cle];
    return typeof valeur === 'string' && valeur.length > 0 ? valeur : undefined;
  }
}
