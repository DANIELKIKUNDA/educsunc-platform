import type { ChargeLivraisonNotification } from './TypesProvidersNotification';

export interface ResultatTransportNotification {
  readonly identifiantLivraison: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface PortTransportNotification {
  envoyer(charge: ChargeLivraisonNotification): Promise<ResultatTransportNotification>;
  verifierDisponibilite?(): Promise<boolean>;
}

export type PortTransportEmail = PortTransportNotification;
export type PortTransportSms = PortTransportNotification;
export type PortTransportPush = PortTransportNotification;
