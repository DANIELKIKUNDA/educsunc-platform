import type { MigrationBulletinOutput } from 'contexts/bulletins-evaluations/application/dto/output/MigrationBulletinOutput';

// Ce presenter transforme une migration de bulletin en reponse HTTP stable.
export class MigrationPresenter {
  // Cette methode enveloppe la migration dans une charge utile simple.
  public static presenter(migration: MigrationBulletinOutput): { donnee: MigrationBulletinOutput } {
    return { donnee: migration };
  }
}
