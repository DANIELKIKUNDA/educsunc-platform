import { type Pool } from 'pg';
import type { Journaliseur } from '../../../../../../shared/infrastructure/logger/Logger';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { Migration_001_CreateParametresPaiementEcole } from './Migration_001_CreateParametresPaiementEcole';
import { Migration_002_CreateGrillesTarification } from './Migration_002_CreateGrillesTarification';
import { Migration_003_CreateObligationsFinancieres } from './Migration_003_CreateObligationsFinancieres';
import { Migration_004_CreatePaiements } from './Migration_004_CreatePaiements';
import { Migration_005_CreateRepartitionsPaiement } from './Migration_005_CreateRepartitionsPaiement';
import { Migration_006_CreateRecusPaiement } from './Migration_006_CreateRecusPaiement';
import { Migration_007_CreateCaisseJour } from './Migration_007_CreateCaisseJour';
import { Migration_008_CreateOperationsCaisse } from './Migration_008_CreateOperationsCaisse';
import { Migration_009_CreateExonerations } from './Migration_009_CreateExonerations';
import { Migration_010_CreatePlansAnticipationFrais } from './Migration_010_CreatePlansAnticipationFrais';
import { Migration_011_CreateRestitutions } from './Migration_011_CreateRestitutions';
import { Migration_012_CreateAnnulationsPaiement } from './Migration_012_CreateAnnulationsPaiement';

// Ce fichier execute sequentiellement les migrations PostgreSQL du BC Paiements.
export class MigrateurPostgresPaiementsFacturation {
  private readonly migrations: readonly MigrationPostgresPaiementsFacturation[] = [
    new Migration_001_CreateParametresPaiementEcole(),
    new Migration_002_CreateGrillesTarification(),
    new Migration_003_CreateObligationsFinancieres(),
    new Migration_004_CreatePaiements(),
    new Migration_005_CreateRepartitionsPaiement(),
    new Migration_006_CreateRecusPaiement(),
    new Migration_007_CreateCaisseJour(),
    new Migration_008_CreateOperationsCaisse(),
    new Migration_009_CreateExonerations(),
    new Migration_010_CreatePlansAnticipationFrais(),
    new Migration_011_CreateRestitutions(),
    new Migration_012_CreateAnnulationsPaiement(),
  ];

  constructor(
    private readonly pool: Pool,
    private readonly journaliseur?: Journaliseur,
  ) {}

  public async executerToutes(): Promise<void> {
    const client = await this.pool.connect();

    try {
      for (const migration of this.migrations) {
        this.journaliseur?.info?.(
          'Execution de la migration paiements facturation.',
          {
            version: migration.version,
            nom: migration.nom,
          },
        );
        await migration.executer(client);
      }
    } finally {
      client.release();
    }
  }
}
