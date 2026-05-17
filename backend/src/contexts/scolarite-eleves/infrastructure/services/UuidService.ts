// Ce fichier contient un service technique simple pour generer des identifiants UUID.

import { randomUUID } from 'node:crypto';

// Ce service centralise la generation des identifiants techniques.
export class UuidService {
  // Cette methode retourne un UUID v4 exploitable par l'infrastructure.
  public generer(): string {
    return randomUUID();
  }
}
