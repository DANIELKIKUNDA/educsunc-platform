import { Entite } from '../../../domain/Entity';

// Cette entite historise une connexion reussie ou restauree pour audit.
export class HistoriqueConnexion extends Entite<string> {
  public readonly idUtilisateur: string;
  public readonly adresseIp?: string;
  public readonly userAgent?: string;
  public readonly dateConnexion: Date;
  public readonly estOffline: boolean;

  constructor(params: {
    idHistoriqueConnexion: string;
    idUtilisateur: string;
    adresseIp?: string;
    userAgent?: string;
    dateConnexion: Date;
    estOffline?: boolean;
  }) {
    super(HistoriqueConnexion.validerTexte(params.idHistoriqueConnexion, 'idHistoriqueConnexion'));
    this.idUtilisateur = HistoriqueConnexion.validerTexte(params.idUtilisateur, 'idUtilisateur');
    this.adresseIp = HistoriqueConnexion.nettoyerOptionnel(params.adresseIp);
    this.userAgent = HistoriqueConnexion.nettoyerOptionnel(params.userAgent);
    this.dateConnexion = HistoriqueConnexion.validerDate(params.dateConnexion, 'dateConnexion');
    this.estOffline = params.estOffline ?? false;
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error(`Le champ ${nomChamp} est invalide.`);
    }
    return new Date(valeur.getTime());
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
