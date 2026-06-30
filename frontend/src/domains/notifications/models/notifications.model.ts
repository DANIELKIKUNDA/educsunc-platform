export type NotificationChannel = 'EMAIL' | 'SMS' | 'IN_APP' | 'WHATSAPP' | 'WEBHOOK' | 'PUSH';

export interface NotificationApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

export interface NotificationListItem {
  identifiant: string;
  type: string;
  statut: string;
  titre?: string;
  messageResume: string;
  creeLe: string;
}

export interface NotificationDetailItem {
  identifiant: string;
  type: string;
  statut: string;
  priorite: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  canaux: readonly string[];
  titre?: string;
  message: string;
  organisationId?: string;
  ecoleId?: string;
  creeLe: string;
  misAJourLe: string;
}

export interface NotificationTimelineItem {
  identifiant: string;
  typeEvenement: string;
  statutAvant?: string;
  statutApres: string;
  horodatage: string;
  correlationId?: string;
  requestId?: string;
  acteur?: string;
  metadonnees?: Readonly<Record<string, unknown>>;
}

export interface NotificationMonitoringItem {
  total: number;
  enEchec: number;
  enRetry: number;
  enDeadLetter: number;
  fournisseursDegrades: readonly string[];
  saturationQueues: readonly string[];
}

export interface NotificationDeadLetterItem {
  identifiantNotification: string;
  raison: string;
  dateEntree: string;
  correlationId?: string;
  requestId?: string;
  tenant?: {
    organisationId?: string;
    ecoleId?: string;
  };
}

export interface NotificationRetryHistoryItem {
  compteur: number;
  raison?: string;
  horodatage: string;
  initiateur?: string;
}

export interface NotificationRealtimeCapabilities {
  disponible: boolean;
  canaux: readonly string[];
  mode: 'PREPARATOIRE' | string;
}

export interface NotificationArchiveItem {
  identifiantNotification: string;
  type: string;
  dateArchivage: string;
  raisonArchivage?: string;
  organisationId?: string;
  ecoleId?: string;
}

export interface NotificationArchivesPage {
  elements: readonly NotificationArchiveItem[];
  page: number;
  taillePage: number;
  total: number;
}

export interface NotificationTenantItem {
  organisationId: string;
  ecoleId?: string;
  totalNotifications: number;
  totalArchivees: number;
  totalDeadLetters: number;
  totalEnEchec: number;
  dateObservation: string;
}

export interface NotificationEscalationTraceItem {
  identifiant: string;
  raison: string;
  acteur?: string;
  horodatage: string;
  audienceCible: readonly string[];
}

export interface NotificationEscalationTrace {
  identifiantNotification: string;
  elements: readonly NotificationEscalationTraceItem[];
}

export interface NotificationCreatePayload {
  type: string;
  canaux: readonly string[];
  titre?: string;
  message: string;
  destinataires?: readonly string[];
  metadonnees?: Readonly<Record<string, unknown>>;
}

export interface NotificationAcknowledgePayload {
  acteurId?: string;
  commentaire?: string;
}

export interface NotificationEscalatePayload {
  raison: string;
  audienceCible?: readonly string[];
  acteurId?: string;
}

export interface NotificationRetryPayload {
  raison?: string;
  acteurId?: string;
}

export interface NotificationReplayPayload {
  raison?: string;
  acteurId?: string;
  reinitialiserCompteurs?: boolean;
}

export interface NotificationPublishRealtimePayload {
  canal: string;
  sujet: string;
  message: string;
}

export const notificationSchoolReaders = ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'] as const;
export const notificationSchoolTechnicalActors = ['ADMIN_SYSTEME_ECOLE'] as const;
export const notificationOrganizationActors = [
  'PROMOTEUR_ORGANISATION',
  'ADMIN_SYSTEME_ORGANISATION',
  'GESTIONNAIRE_ORGANISATION',
] as const;
