import { access, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { InfrastructureError } from '../../exceptions/InfrastructureError';
import type { ServiceStockageFichier } from './FileStorageService';

// Cette classe fournit une implementation locale simple et reelle du stockage de fichiers.
// Elle reste volontairement transverse et pourra etre remplacee ou enrichie plus tard.
export class StockageLocal implements ServiceStockageFichier {
  private readonly dossierRacine: string;

  // Ce constructeur definit le dossier racine physique qui recevra les fichiers stockes.
  constructor(dossierRacine = 'stockage-local') {
    this.dossierRacine = path.resolve(dossierRacine);
  }

  // Cette methode construit un chemin absolu securise a l'interieur du dossier racine.
  private construireCheminAbsolu(chemin: string): string {
    const cheminNettoye = chemin.trim();

    if (cheminNettoye.length === 0) {
      throw new InfrastructureError('Le chemin de stockage est vide.', 'STOCKAGE_CHEMIN_VIDE');
    }

    const cheminNormalise = path.normalize(cheminNettoye);
    const cheminAbsolu = path.resolve(this.dossierRacine, cheminNormalise);
    const prefixeAutorise = `${this.dossierRacine}${path.sep}`;

    if (cheminAbsolu !== this.dossierRacine && !cheminAbsolu.startsWith(prefixeAutorise)) {
      throw new InfrastructureError(
        'Le chemin de stockage sort du dossier racine autorise.',
        'STOCKAGE_CHEMIN_INTERDIT',
        {
          chemin,
        },
      );
    }

    return cheminAbsolu;
  }

  // Cette methode televerse un contenu dans le stockage local en creant les dossiers parents si necessaire.
  public async televerser(chemin: string, contenu: Buffer | string): Promise<string> {
    const cheminAbsolu = this.construireCheminAbsolu(chemin);

    await mkdir(path.dirname(cheminAbsolu), { recursive: true });
    await writeFile(cheminAbsolu, contenu);

    return cheminAbsolu;
  }

  // Cette methode telecharge le contenu local s'il existe, sinon retourne null.
  public async telecharger(chemin: string): Promise<Buffer | string | null> {
    const cheminAbsolu = this.construireCheminAbsolu(chemin);

    try {
      await access(cheminAbsolu);
      return await readFile(cheminAbsolu);
    } catch (erreur: any) {
      if (erreur?.code === 'ENOENT') {
        return null;
      }

      throw new InfrastructureError(
        'Impossible de lire le fichier demande dans le stockage local.',
        'STOCKAGE_LOCAL_LECTURE_IMPOSSIBLE',
        {
          chemin,
        },
      );
    }
  }

  // Cette methode supprime un fichier local s'il est present et ignore silencieusement son absence.
  public async supprimer(chemin: string): Promise<void> {
    const cheminAbsolu = this.construireCheminAbsolu(chemin);

    try {
      await unlink(cheminAbsolu);
    } catch (erreur: any) {
      if (erreur?.code === 'ENOENT') {
        return;
      }

      throw new InfrastructureError(
        'Impossible de supprimer le fichier demande dans le stockage local.',
        'STOCKAGE_LOCAL_SUPPRESSION_IMPOSSIBLE',
        {
          chemin,
        },
      );
    }
  }
}

export { StockageLocal as LocalStorage };
