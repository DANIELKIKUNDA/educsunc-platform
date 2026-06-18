// Ce fichier regroupe les enumerations officielles du domaine Notifications.

/** Cette enumeration liste les types metiers principaux de notification. */
export type TypeNotification =
  | 'PAIEMENT_RECU'
  | 'RAPPEL_DETTE'
  | 'ECHEC_PAIEMENT'
  | 'FRAIS_ECHEANCE'
  | 'REMBOURSEMENT'
  | 'ANNULATION_PAIEMENT'
  | 'INSCRIPTION_VALIDEE'
  | 'REINSCRIPTION'
  | 'TRANSFERT'
  | 'ABANDON'
  | 'REINTEGRATION'
  | 'CHANGEMENT_CLASSE'
  | 'BULLETIN_DISPONIBLE'
  | 'PROCLAMATION'
  | 'NOTE_PUBLIEE'
  | 'RETARD_COTATION'
  | 'ECHEC_SCOLAIRE'
  | 'REUSSITE'
  | 'ABSENCE'
  | 'RETARD'
  | 'SANCTION'
  | 'CONVOCATION'
  | 'INCIDENT_DISCIPLINAIRE'
  | 'REUNION'
  | 'COMMUNIQUE'
  | 'CHANGEMENT_HORAIRE'
  | 'EVENEMENT_ECOLE'
  | 'INFORMATION_GENERALE'
  | 'CONNEXION_SUSPECTE'
  | 'ECHEC_CONNEXION'
  | 'COMPTE_BLOQUE'
  | 'CHANGEMENT_MOT_PASSE'
  | 'INCIDENT_SECURITE'
  | 'SYNC_FAILURE'
  | 'RETRY_STORM'
  | 'QUEUE_SATURATION'
  | 'PROVIDER_DOWN'
  | 'WORKER_CRASH'
  | 'REPLAY_MASSIF'
  | 'ALERT_PERFORMANCE'
  | 'ALERT_DISK'
  | 'ALERT_DATABASE'
  | 'ALERT_LATENCY'
  | 'ALERT_QUEUE_LAG';

/** Cette enumeration represente le statut global de la notification. */
export type StatutNotification =
  | 'CREATED'
  | 'VALIDATED'
  | 'SCHEDULED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'RETRYING'
  | 'FALLBACK_PROCESSING'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REPLAYING'
  | 'ARCHIVED';

/** Cette enumeration represente les canaux de communication connus du domaine. */
export type CanalNotification = 'IN_APP' | 'SMS' | 'EMAIL' | 'WHATSAPP' | 'PUSH' | 'SYSTEM_INTERNAL' | 'WEBHOOK';

/** Cette enumeration represente la provenance logique d'une notification. */
export type SourceNotification = 'USER_ACTION' | 'SYSTEM_EVENT' | 'WORKER' | 'MONITORING' | 'SECURITY_ENGINE' | 'SCHEDULED_TASK';

/** Cette enumeration represente la portee metier d'une notification. */
export type PorteeNotification = 'USER' | 'ROLE' | 'CLASSROOM' | 'SCHOOL' | 'ORGANIZATION' | 'SYSTEM';

/** Cette enumeration represente la temporalite attendue d'une notification. */
export type TemporaliteNotification = 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING' | 'EXPIRABLE';

/** Cette enumeration represente la visibilite metier d'une notification. */
export type VisibiliteNotification = 'PRIVATE' | 'INTERNAL' | 'RESTRICTED_GROUP' | 'ORGANIZATION_WIDE' | 'SYSTEM_INTERNAL';

/** Cette enumeration represente la strategie de diffusion d'une notification. */
export type StrategieLivraison =
  | 'SINGLE_CHANNEL'
  | 'SIMULTANEOUS_MULTI_CHANNEL'
  | 'PRIORITY_ORDERED'
  | 'FALLBACK_CHAIN'
  | 'ESCALATION_DELIVERY';

/** Cette enumeration represente la criticite de la livraison attendue. */
export type CriticiteLivraison = 'BEST_EFFORT' | 'IMPORTANT' | 'STRICT';

/** Cette enumeration represente le niveau d'attention souhaite cote utilisateur. */
export type NiveauAttentionUtilisateur = 'SILENT' | 'NORMAL' | 'IMPORTANT' | 'INTERRUPTIVE';

/** Cette enumeration represente l'exigence d'audit associee a la notification. */
export type ExigenceAudit = 'NONE' | 'BASIC' | 'FULL_TRACE';

/** Cette enumeration represente l'exigence de monitoring associee a la notification. */
export type ExigenceMonitoring = 'BASIC' | 'DETAILED' | 'CRITICAL_REALTIME';

/** Cette enumeration represente le type de destinataire vise par la notification. */
export type TypeDestinataireNotification =
  | 'USER'
  | 'PARENT'
  | 'TEACHER'
  | 'TITULAIRE'
  | 'CAISSIER'
  | 'PREFET'
  | 'DIRECTION'
  | 'PROMOTEUR'
  | 'ROLE'
  | 'CLASSROOM'
  | 'SCHOOL'
  | 'ORGANIZATION'
  | 'SYSTEM'
  | 'EXTERNAL_CONTACT';

/** Cette enumeration represente la maniere dont l'audience a ete calculee. */
export type StrategieCiblage =
  | 'DIRECT_TARGET'
  | 'ROLE_BASED'
  | 'GROUP_BASED'
  | 'DYNAMIC_QUERY'
  | 'ESCALATION_TARGETING'
  | 'BROADCAST_CONTROLLED';

/** Cette enumeration represente le niveau auquel une preference de communication est definie. */
export type NiveauPreferenceNotification = 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER' | 'RECIPIENT';

/** Cette enumeration represente le type de retry choisi par la politique. */
export type TypePolitiqueRetry = 'FIXED_RETRY' | 'EXPONENTIAL_BACKOFF' | 'CRITICAL_AGGRESSIVE' | 'BEST_EFFORT';

/** Cette enumeration represente le type de politique d'expiration. */
export type TypePolitiqueExpiration = 'NO_EXPIRATION' | 'TIME_BASED' | 'EVENT_BASED' | 'TTL_BASED' | 'BUSINESS_WINDOW_BASED';

/** Cette enumeration represente la granularite de la chronology conservee. */
export type GranulariteChronologie = 'BASIC' | 'DETAILED' | 'FORENSIC';

/** Cette enumeration represente le statut d'un consentement de communication. */
export type StatutConsentementCommunication = 'AUTHORIZED' | 'REFUSED' | 'MANDATORY' | 'LEGAL_REQUIRED';
