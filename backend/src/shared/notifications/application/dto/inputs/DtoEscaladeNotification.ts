import { CanalNotification } from '../../../domain';

// Ce fichier expose le DTO stable d'escalade de notification.

/** Cette interface represente la forme serialisable d'une escalade de notification. */
export interface DtoEscaladeNotification {
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
