// Ce fichier declare les types techniques du bloc security Notifications.

/** Cette interface represente un contexte de securite runtime pour un job ou une action. */
export interface ContexteSecuriteNotification {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly scopes?: readonly string[];
  readonly securityMetadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente un secret technique gere par l'infrastructure Notifications. */
export interface SecretTechniqueNotification {
  readonly cle: string;
  readonly valeurMasquee: string;
  readonly enregistreLe: Date;
}

/** Cette interface represente le resultat d'un controle de securite runtime. */
export interface ResultatControleSecuriteNotification {
  readonly autorise: boolean;
  readonly raison?: string;
  readonly verifieLe: Date;
}
