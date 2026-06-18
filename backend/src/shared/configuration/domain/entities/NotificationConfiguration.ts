// Ce fichier declare l entite de configuration Notifications.

/** Cette interface represente une fenetre de diffusion autorisee par canal. */
export interface FenetreCanalNotificationConfiguration {
  readonly canal: string;
  readonly debut: string;
  readonly fin: string;
}

/** Cette interface represente les reglages fonctionnels envoyes au module Notifications. */
export interface NotificationConfigurationProps {
  readonly canauxActifs: readonly string[];
  readonly budgetsParCanal: Readonly<Record<string, number>>;
  readonly quotasParCanal: Readonly<Record<string, number>>;
  readonly templatesActifs: readonly string[];
  readonly preferencesUtilisateurAutorisables: boolean;
  readonly fallbackCanalAutorise: boolean;
  readonly brandingCommunicationActif: boolean;
  readonly fenetresParCanal: readonly FenetreCanalNotificationConfiguration[];
  readonly signatureCommunication?: string;
  readonly horairesSilencieux?: {
    readonly debut: string;
    readonly fin: string;
  };
}

/** Cette classe represente la configuration delegable vers le module Notifications. */
export class NotificationConfiguration {
  constructor(private readonly props: NotificationConfigurationProps) {}

  /** Cette methode indique si un canal reste autorise a la diffusion. */
  public canalActif(canal: string): boolean {
    return this.props.canauxActifs.includes(canal);
  }

  /** Cette methode retourne les reglages notification bruts. */
  public valeur(): NotificationConfigurationProps {
    return {
      ...this.props,
      canauxActifs: [...this.props.canauxActifs],
      budgetsParCanal: { ...this.props.budgetsParCanal },
      quotasParCanal: { ...this.props.quotasParCanal },
      templatesActifs: [...this.props.templatesActifs],
      fenetresParCanal: this.props.fenetresParCanal.map((fenetre) => ({ ...fenetre })),
    };
  }
}
