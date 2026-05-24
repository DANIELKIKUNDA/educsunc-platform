import { PolicyAuditVolumetrie } from '../policies';

// Ce moteur vérifie les seuils de volumétrie pour éviter l'emballement du registre.
export class MoteurVolumetrieAudit {
  public verifier(nombreEntrees: number, seuilMaximum: number): void {
    PolicyAuditVolumetrie.verifier(nombreEntrees, seuilMaximum);
  }
}
