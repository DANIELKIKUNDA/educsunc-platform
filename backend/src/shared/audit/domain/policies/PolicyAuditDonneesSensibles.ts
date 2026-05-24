import { AuditSensitiveDataDetectedException } from '../exceptions';

const MOTIFS_SENSIBLES = ['password', 'motdepasse', 'refreshtoken', 'accesstoken', 'jwt', 'secret', 'privatekey'];

// Cette policy refuse les snapshots qui exposent des données interdites.
export class PolicyAuditDonneesSensibles {
  public static verifierSnapshots(serialisation: string): void {
    const normalise = serialisation.toLowerCase();
    if (MOTIFS_SENSIBLES.some((motif) => normalise.includes(motif))) {
      throw new AuditSensitiveDataDetectedException("Les donnees sensibles ne doivent jamais etre conservees dans l'audit.");
    }
  }
}
