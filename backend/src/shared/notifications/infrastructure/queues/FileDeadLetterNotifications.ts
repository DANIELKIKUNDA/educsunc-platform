import { RegistreFilesNotifications } from './RegistreFilesNotifications';
import { JobDeadLetterNotification, JobFileNotification } from './TypesFilesNotifications';

// Ce fichier implemente la dead-letter queue technique du moteur Notifications.

/** Cette classe centralise le placement et la lecture des jobs morts. */
export class FileDeadLetterNotifications {
  /** Ce constructeur relie la DLQ au registre memoire partage. */
  constructor(private readonly registreFilesNotifications: RegistreFilesNotifications) {}

  /** Cette methode place un job technique dans la dead-letter queue. */
  public async placer(job: JobFileNotification, raisonDeadLetter: string): Promise<void> {
    const deadLetter: JobDeadLetterNotification = {
      ...job,
      typeFile: 'DEAD_LETTER',
      raisonDeadLetter,
      deadLetterLe: new Date(),
    };
    this.registreFilesNotifications.deadLetters.push(deadLetter);
    this.registreFilesNotifications.obtenirFile('DEAD_LETTER').push(deadLetter);
  }

  /** Cette methode retourne toutes les dead letters connues. */
  public lireToutes(): JobDeadLetterNotification[] {
    return [...this.registreFilesNotifications.deadLetters];
  }

  /** Cette methode retire la prochaine dead letter pour un traitement de recovery. */
  public extraireProchaine(): JobDeadLetterNotification | null {
    const file = this.registreFilesNotifications.obtenirFile('DEAD_LETTER');
    const index = file.findIndex(() => true);
    if (index < 0) {
      return null;
    }
    const [job] = file.splice(index, 1);
    return (job as JobDeadLetterNotification | undefined) ?? null;
  }
}
