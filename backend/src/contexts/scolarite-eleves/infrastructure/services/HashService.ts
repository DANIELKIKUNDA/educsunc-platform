// Ce fichier contient un service technique simple pour les empreintes de contenu.

import { createHash } from 'node:crypto';

// Ce service calcule des empreintes deterministes a partir d'une chaine.
export class HashService {
  // Cette methode retourne l'empreinte SHA-256 d'une valeur.
  public calculerSha256(valeur: string): string {
    return createHash('sha256').update(valeur, 'utf8').digest('hex');
  }
}
