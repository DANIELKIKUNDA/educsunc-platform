export interface NotificationPaiementInput {
  idEcole: string;
  idEleve: string;
  idPaiement: string;
  message: string;
}

export interface NotificationPort {
  envoyerNotificationPaiement(input: NotificationPaiementInput): Promise<void>;
}
