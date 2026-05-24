import { Entite } from '../../../domain/Entity';
import { AuditSnapshotData } from '../value-objects';

export interface ProprietesAuditSnapshot {
  idAuditSnapshot: string;
  snapshots: AuditSnapshotData;
  version?: string;
  dateCapture: Date;
}

// Cette entité fige l'ancien et le nouvel état après nettoyage.
export class AuditSnapshot extends Entite<string> {
  private readonly snapshots: AuditSnapshotData;
  private readonly version?: string;
  private readonly dateCapture: Date;

  constructor(proprietes: ProprietesAuditSnapshot) {
    super(AuditSnapshot.validerTexte(proprietes.idAuditSnapshot, 'idAuditSnapshot'));
    this.snapshots = proprietes.snapshots;
    this.version = AuditSnapshot.nettoyerOptionnel(proprietes.version);
    this.dateCapture = AuditSnapshot.validerDate(proprietes.dateCapture, 'dateCapture');
  }

  public obtenirSnapshots(): AuditSnapshotData {
    return this.snapshots;
  }

  public obtenirVersion(): string | undefined {
    return this.version;
  }

  public obtenirDateCapture(): Date {
    return new Date(this.dateCapture.getTime());
  }

  private static validerTexte(valeur: string, champ: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${champ} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }

  private static validerDate(valeur: Date, champ: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error(`Le champ ${champ} est invalide.`);
    }
    return new Date(valeur.getTime());
  }
}
