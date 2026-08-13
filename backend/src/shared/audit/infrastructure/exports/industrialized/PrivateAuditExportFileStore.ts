import { createReadStream, createWriteStream, type ReadStream, type WriteStream } from 'node:fs';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

export class PrivateAuditExportFileStore {
  private readonly racine: string;

  public constructor(racine = process.env.EDUCSYN_AUDIT_EXPORT_DIR) {
    this.racine = resolve(racine?.trim() || resolve(process.cwd(), 'stockage-local', 'audit-exports'));
  }

  public async ouvrirEcriture(fileKey: string): Promise<{ flux: WriteStream; temporaire: string; final: string }> {
    await mkdir(this.racine, { recursive: true });
    const final = this.resoudre(fileKey);
    const temporaire = `${final}.part`;
    await rm(temporaire, { force: true });
    return { flux: createWriteStream(temporaire, { flags: 'wx', encoding: 'utf8' }), temporaire, final };
  }

  public async publier(temporaire: string, final: string): Promise<number> {
    // Un fichier final orphelin peut rester apres un crash avant la confirmation PostgreSQL.
    await rm(final, { force: true });
    await rename(temporaire, final);
    return (await stat(final)).size;
  }

  public async ouvrirLecture(fileKey: string): Promise<{ flux: ReadStream; chemin: string; taille: number }> {
    const chemin = this.resoudre(fileKey);
    return { flux: createReadStream(chemin), chemin, taille: (await stat(chemin)).size };
  }

  public async supprimer(fileKey: string): Promise<void> {
    await rm(this.resoudre(fileKey), { force: true });
  }

  public async abandonner(temporaire: string): Promise<void> {
    await rm(temporaire, { force: true });
  }

  private resoudre(fileKey: string): string {
    if (!/^[a-f0-9-]+\.(csv|json|pdf)$/.test(fileKey)) throw new Error("La reference du fichier d'export est invalide.");
    const chemin = resolve(this.racine, fileKey);
    if (!chemin.startsWith(`${this.racine}${sep}`)) throw new Error("La reference du fichier d'export est hors de la zone privee.");
    return chemin;
  }
}
