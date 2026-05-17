import type {
  NotificationPaiementInput,
  NotificationPort,
} from '../../application/ports/NotificationPort';

// Ce fichier adapte les notifications Paiements vers un mecanisme externe facultatif.
export class NotificationAdapter implements NotificationPort {
  // Ce constructeur accepte un emetteur concret injectable pour garder la notification optionnelle.
  constructor(
    private readonly emetteur?: (input: NotificationPaiementInput) => Promise<void>,
  ) {}

  // Cette methode emet une notification sans jamais imposer une implementation technique au BC.
  public async envoyerNotificationPaiement(
    input: NotificationPaiementInput,
  ): Promise<void> {
    await this.emetteur?.(input);
  }
}
