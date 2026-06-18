// Ce fichier declare la recuperation technique des files du moteur Notifications.

import { JobFileNotification, RegistreFilesNotifications, TypeFileNotification } from '../queues';
import { OperationRecuperationNotification } from './TypesRecuperationNotifications';

/** Cette classe reconstruit ou purge les files techniques apres incident local. */
export class RecuperationQueuesNotifications {
  /** Ce constructeur relie la recuperation au registre partage des files. */
  constructor(private readonly registreFilesNotifications: RegistreFilesNotifications) {}

  /** Cette methode retire les jobs deja expires ou invalides des files techniques. */
  public nettoyerJobsInvalides(): OperationRecuperationNotification {
    let totalSupprimes = 0;
    const maintenant = new Date();

    for (const typeFile of this.obtenirTypesFiles()) {
      const file = this.registreFilesNotifications.obtenirFile(typeFile);
      const tailleInitiale = file.length;
      const filtres = file.filter((job) => this.jobEstRecuperable(job, maintenant));
      totalSupprimes += tailleInitiale - filtres.length;
      file.splice(0, file.length, ...filtres);
    }

    return {
      cible: 'QUEUES',
      succes: true,
      recupereLe: new Date(),
      elementsTraites: totalSupprimes,
      metadata: {
        mode: 'nettoyage',
      },
    };
  }

  /** Cette methode retourne un snapshot de volumetrie des files techniques. */
  public observerVolumes(): OperationRecuperationNotification {
    const volumes: Record<string, number> = {};
    let total = 0;

    for (const typeFile of this.obtenirTypesFiles()) {
      const taille = this.registreFilesNotifications.obtenirFile(typeFile).length;
      volumes[typeFile] = taille;
      total += taille;
    }

    return {
      cible: 'QUEUES',
      succes: true,
      recupereLe: new Date(),
      elementsTraites: total,
      metadata: volumes,
    };
  }

  /** Cette methode liste les types de files connus du runtime local. */
  private obtenirTypesFiles(): readonly TypeFileNotification[] {
    return ['DISPATCH', 'RETRY', 'REPLAY', 'ESCALADE', 'DEAD_LETTER'];
  }

  /** Cette methode determine si un job reste recuperable par le runtime local. */
  private jobEstRecuperable(job: JobFileNotification, maintenant: Date): boolean {
    if (!job.identifiantJob || !job.identifiantNotification) {
      return false;
    }

    return job.disponibleLe.getTime() <= maintenant.getTime() + 365 * 24 * 60 * 60 * 1000;
  }
}
