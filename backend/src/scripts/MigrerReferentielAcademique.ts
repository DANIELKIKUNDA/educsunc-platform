import '../config/variables-environnement.config';
import { creerInfrastructurePostgresReferentielAcademique } from '../contexts/referentiel-academique/infrastructure/persistence/postgres';

// Ce script execute les migrations PostgreSQL du BC Referentiel Academique sans demarrer le serveur HTTP.
const migrerReferentielAcademique = async (): Promise<void> => {
  const infrastructure = creerInfrastructurePostgresReferentielAcademique();

  try {
    const bilan = await infrastructure.migrateur.executerMigrationsEnAttente();

    console.log('Migrations du referentiel academique terminees.', {
      executees: bilan.executees,
      sautees: bilan.sautees,
    });
  } finally {
    await infrastructure.pool.end();
  }
};

void migrerReferentielAcademique().catch((erreur: unknown) => {
  const message = erreur instanceof Error ? erreur.message : String(erreur);

  console.error('Echec des migrations du referentiel academique.', {
    message,
  });

  process.exitCode = 1;
});
