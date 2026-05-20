import { CodeRole } from '../value-objects/CodeRole';
import { ErreurPermissionRefusee } from '../exceptions/ErreurPermissionRefusee';

export class PolicyEncodageCotes {
  public static verifier(codeRole: CodeRole, enseigneCours: boolean): void {
    if (codeRole.obtenirValeur() !== 'ENSEIGNANT' || !enseigneCours) {
      throw new ErreurPermissionRefusee("L'encodage des cotes est reserve a l'enseignant concerne.");
    }
  }
}
