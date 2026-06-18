import { CanalNotification, PorteeNotification, SourceNotification, StrategieLivraison, TemporaliteNotification, TypeNotification, VisibiliteNotification } from '../../domain';

// Ce fichier decrit la commande applicative de creation d'une notification.

/** Cette interface porte l'intention applicative de creation d'une notification. */
export interface CommandeCreerNotification {
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
  readonly datePlanification?: Date;
  readonly dateExpiration?: Date;
  readonly metadonnees?: Readonly<Record<string, unknown>>;
  readonly destinataires: ReadonlyArray<{
    readonly destinataireId: string;
    readonly typeDestinataire: string;
    readonly canauxAutorises?: readonly CanalNotification[];
  }>;
}
