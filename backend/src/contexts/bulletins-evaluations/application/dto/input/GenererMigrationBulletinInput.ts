// Ce DTO porte les informations necessaires a l'analyse d'une migration.
export interface GenererMigrationBulletinInput {
  idClassePedagogique: string;
  idAnneeScolaire: string;
  ancienneVersionReferentiel: string;
  nouvelleVersionReferentiel: string;
  idUtilisateur: string;
}
