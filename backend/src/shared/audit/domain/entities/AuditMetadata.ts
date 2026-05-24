import { Entite } from '../../../domain/Entity';

export interface ProprietesAuditMetadata {
  idAuditMetadata: string;
  versionApi?: string;
  versionFrontend?: string;
  versionMobile?: string;
  build?: string;
  region?: string;
  runtime?: string;
  langue?: string;
  canal?: string;
  metadataAdditionnelle?: Record<string, unknown>;
}

// Cette entité porte les métadonnées runtime complémentaires d'une entrée audit.
export class AuditMetadata extends Entite<string> {
  private readonly versionApi?: string;
  private readonly versionFrontend?: string;
  private readonly versionMobile?: string;
  private readonly build?: string;
  private readonly region?: string;
  private readonly runtime?: string;
  private readonly langue?: string;
  private readonly canal?: string;
  private readonly metadataAdditionnelle: Record<string, unknown>;

  constructor(proprietes: ProprietesAuditMetadata) {
    super(AuditMetadata.validerTexte(proprietes.idAuditMetadata, 'idAuditMetadata'));
    this.versionApi = AuditMetadata.nettoyerOptionnel(proprietes.versionApi);
    this.versionFrontend = AuditMetadata.nettoyerOptionnel(proprietes.versionFrontend);
    this.versionMobile = AuditMetadata.nettoyerOptionnel(proprietes.versionMobile);
    this.build = AuditMetadata.nettoyerOptionnel(proprietes.build);
    this.region = AuditMetadata.nettoyerOptionnel(proprietes.region);
    this.runtime = AuditMetadata.nettoyerOptionnel(proprietes.runtime);
    this.langue = AuditMetadata.nettoyerOptionnel(proprietes.langue);
    this.canal = AuditMetadata.nettoyerOptionnel(proprietes.canal);
    this.metadataAdditionnelle = { ...(proprietes.metadataAdditionnelle ?? {}) };
  }

  public obtenirVersionApi(): string | undefined { return this.versionApi; }
  public obtenirVersionFrontend(): string | undefined { return this.versionFrontend; }
  public obtenirVersionMobile(): string | undefined { return this.versionMobile; }
  public obtenirBuild(): string | undefined { return this.build; }
  public obtenirRegion(): string | undefined { return this.region; }
  public obtenirRuntime(): string | undefined { return this.runtime; }
  public obtenirLangue(): string | undefined { return this.langue; }
  public obtenirCanal(): string | undefined { return this.canal; }
  public obtenirMetadataAdditionnelle(): Record<string, unknown> { return { ...this.metadataAdditionnelle }; }

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
}
