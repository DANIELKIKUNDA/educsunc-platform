import {
  OperationRecuperationNotification,
  RecuperationDeadLetterNotifications,
} from '../../infrastructure/recovery';

// Ce fichier expose le runtime specialise de recovery des dead letters Notifications.

/** Cette classe specialisa la reprise des jobs dead-letterises. */
export class RuntimeRecoveryDeadLetters {
  /** Ce constructeur relie le runtime a la recuperation technique de la DLQ. */
  constructor(
    private readonly recuperationDeadLetterNotifications: RecuperationDeadLetterNotifications,
  ) {}

  /** Cette methode rejoue les jobs dead-letterises vers la file de replay. */
  public async rejouer(limite = 25): Promise<OperationRecuperationNotification> {
    return this.recuperationDeadLetterNotifications.rejouerDepuisDeadLetter(limite);
  }

  /** Cette methode observe le stock courant de la dead-letter queue. */
  public observer(): OperationRecuperationNotification {
    return this.recuperationDeadLetterNotifications.observerEnAttente();
  }
}
