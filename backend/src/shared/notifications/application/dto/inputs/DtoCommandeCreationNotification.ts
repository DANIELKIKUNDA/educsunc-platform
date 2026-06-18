import { CanalNotification, PorteeNotification, SourceNotification, StrategieLivraison, TemporaliteNotification, TypeNotification, VisibiliteNotification } from '../../../domain';

// Ce fichier expose le DTO stable de creation de notification.

/** Cette interface represente la forme serialisable d'une creation de notification. */
export interface DtoCommandeCreationNotification {
  readonly idempotencyKey?: string;
  readonly type: TypeNotification;
  readonly priorite: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  readonly portee: PorteeNotification;
  readonly temporalite: TemporaliteNotification;
  readonly visibilite: VisibiliteNotification;
  readonly source: SourceNotification;
  readonly strategieLivraison: StrategieLivraison;
  readonly canaux: readonly CanalNotification[];
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly titre?: string;
  readonly message: string;
  readonly placeholders?: Readonly<Record<string, string>>;
  readonly codeModele?: string;
  readonly versionModele?: number;
  readonly datePlanification?: string;
  readonly dateExpiration?: string;
  readonly metadonnees?: Readonly<Record<string, unknown>>;
  readonly destinataires: ReadonlyArray<{
    readonly destinataireId: string;
    readonly typeDestinataire: string;
    readonly canauxAutorises?: readonly CanalNotification[];
  }>;
}
