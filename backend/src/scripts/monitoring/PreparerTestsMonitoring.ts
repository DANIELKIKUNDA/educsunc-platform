import { obtenirPoolPostgresAuth } from '../../shared/auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { migrerPostgresMonitoring } from '../../shared/monitoring/infrastructure/persistence/postgres/MigrationPostgresMonitoring';

async function preparerTestsMonitoring(): Promise<void> {
  const pool = obtenirPoolPostgresAuth();

  try {
    await migrerPostgresMonitoring(pool);
  } finally {
    await pool.end();
  }
}

void preparerTestsMonitoring().catch((erreur: unknown) => {
  console.error('La preparation PostgreSQL Monitoring a echoue.', erreur);
  process.exitCode = 1;
});
