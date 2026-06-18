import { CanalNotification } from '../../domain';

// Ce fichier decrit la commande applicative d'escalade d'une notification.

/** Cette interface porte la demande d'escalade vers une audience plus large ou plus critique. */
export interface CommandeEscaladerNotification {
  readonly identifiantNotification: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly raison: string;
  readonly nouveauxDestinataires?: ReadonlyArray<{
    readonly destinataireId: string;
    readonly typeDestinataire: string;
    readonly canauxAutorises?: readonly CanalNotification[];
  }>;
  readonly canauxSupplementaires?: readonly CanalNotification[];
}
