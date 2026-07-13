import { randomUUID } from 'node:crypto';
import {
  mkdir,
  open,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
  type FileHandle,
} from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as attendre } from 'node:timers/promises';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';

export interface JournalInitialisationConfigurationEntry {
  readonly executionId: string;
  readonly executedAt: string;
  readonly type: string;
  readonly scope: Record<string, unknown>;
  readonly createdKeys: readonly string[];
  readonly skippedKeys: readonly string[];
}

export interface ConfigurationBootstrapJournalStore {
  journaliser(entry: JournalInitialisationConfigurationEntry): Promise<void>;
}

export class ConfigurationBootstrapJournalStoreFichier implements ConfigurationBootstrapJournalStore {
  constructor(private readonly cheminJournal: string) {}

  public async journaliser(entry: JournalInitialisationConfigurationEntry): Promise<void> {
    const dossier = path.dirname(this.cheminJournal);
    await mkdir(dossier, { recursive: true });
    const verrou = await this.acquerirVerrou();
    const cheminTemporaire = `${this.cheminJournal}.${process.pid}.${randomUUID()}.tmp`;

    try {
      const journal = await this.lireJournalOuMettreEnQuarantaine();
      journal.push(entry);
      await writeFile(cheminTemporaire, JSON.stringify(journal, null, 2), 'utf8');
      await rename(cheminTemporaire, this.cheminJournal);
    } finally {
      await unlink(cheminTemporaire).catch(() => undefined);
      await verrou.close();
      await unlink(this.cheminVerrou()).catch(() => undefined);
    }
  }

  private async lireJournalOuMettreEnQuarantaine(): Promise<JournalInitialisationConfigurationEntry[]> {
    let contenu: string;
    try {
      contenu = await readFile(this.cheminJournal, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }

    try {
      return JSON.parse(contenu.trim() || '[]') as JournalInitialisationConfigurationEntry[];
    } catch {
      const cheminQuarantaine = `${this.cheminJournal}.corrupt.${Date.now()}.${randomUUID()}.json`;
      await rename(this.cheminJournal, cheminQuarantaine);
      return [];
    }
  }

  private async acquerirVerrou(): Promise<FileHandle> {
    const limite = Date.now() + 10_000;
    const cheminVerrou = this.cheminVerrou();

    while (Date.now() < limite) {
      try {
        const verrou = await open(cheminVerrou, 'wx');
        await verrou.writeFile(`${process.pid}\n${new Date().toISOString()}\n`, 'utf8');
        return verrou;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }

        const informations = await stat(cheminVerrou).catch(() => null);
        if (informations && Date.now() - informations.mtimeMs > 30_000) {
          await unlink(cheminVerrou).catch(() => undefined);
          continue;
        }
        await attendre(20);
      }
    }

    throw new Error('Le journal d initialisation Configuration est temporairement occupe.');
  }

  private cheminVerrou(): string {
    return `${this.cheminJournal}.lock`;
  }
}

export class ConfigurationBootstrapJournalStorePostgres implements ConfigurationBootstrapJournalStore {
  constructor(private readonly client: SqlQueryClient) {}

  public async journaliser(entry: JournalInitialisationConfigurationEntry): Promise<void> {
    await this.client.executer(
      `
        INSERT INTO educsyn_configuration_bootstrap_journal (
          execution_id, executed_at, type_evenement, scope, created_keys, skipped_keys
        ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb)
        ON CONFLICT (execution_id) DO NOTHING
      `,
      [
        entry.executionId,
        entry.executedAt,
        entry.type,
        JSON.stringify(entry.scope),
        JSON.stringify(entry.createdKeys),
        JSON.stringify(entry.skippedKeys),
      ],
    );
  }
}
