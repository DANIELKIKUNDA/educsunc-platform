import { AuditVolumeExceededException } from '../exceptions';

// Cette policy évite l'explosion de volumétrie sur une unité d'opération.
export class PolicyAuditVolumetrie {
  public static verifier(nombreEntrees: number, seuilMaximum: number): void {
    if (nombreEntrees > seuilMaximum) {
      throw new AuditVolumeExceededException(`Seuil de volumetrie depasse: ${nombreEntrees}/${seuilMaximum}.`);
    }
  }
}
