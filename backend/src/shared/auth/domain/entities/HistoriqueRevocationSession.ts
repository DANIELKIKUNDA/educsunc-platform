import { Entite } from '../../../domain/Entity';

// Cette entite conserve la trace des revocations de session deja appliquees.
export class HistoriqueRevocationSession extends Entite<string> {
  public readonly idSessionUtilisateur: string;
  public readonly raison: string;
  public readonly revoqueeLe: Date;
  public readonly revoqueePar?: string;

  constructor(params: {
    idHistoriqueRevocationSession: string;
    idSessionUtilisateur: string;
    raison: string;
    revoqueeLe: Date;
    revoqueePar?: string;
  }) {
    super(HistoriqueRevocationSession.validerTexte(params.idHistoriqueRevocationSession, 'idHistoriqueRevocationSession'));
    this.idSessionUtilisateur = HistoriqueRevocationSession.validerTexte(params.idSessionUtilisateur, 'idSessionUtilisateur');
    this.raison = HistoriqueRevocationSession.validerTexte(params.raison, 'raison');
    this.revoqueeLe = HistoriqueRevocationSession.validerDate(params.revoqueeLe);
    this.revoqueePar = HistoriqueRevocationSession.nettoyerOptionnel(params.revoqueePar);
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date de revocation est invalide.');
    }
    return new Date(valeur.getTime());
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
