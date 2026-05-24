import { Entite } from '../../../domain/Entity';
import { TYPE_ACTEUR_AUDIT_ENUM, type TypeActeurAuditEnum } from '../enums';

export type TypeActeurAudit = TypeActeurAuditEnum;

export interface ProprietesActeurAudit {
  idActeurAudit: string;
  typeActeur: TypeActeurAudit;
  idUtilisateur?: string;
  nomUtilisateur?: string;
  emailUtilisateur?: string;
  roleActif?: string;
  sourceActeur: string;
}

// Cette entité identifie l'auteur réel de l'action auditée.
export class ActeurAudit extends Entite<string> {
  private readonly typeActeur: TypeActeurAudit;
  private readonly idUtilisateur?: string;
  private readonly nomUtilisateur?: string;
  private readonly emailUtilisateur?: string;
  private readonly roleActif?: string;
  private readonly sourceActeur: string;

  constructor(proprietes: ProprietesActeurAudit) {
    super(ActeurAudit.validerTexte(proprietes.idActeurAudit, 'idActeurAudit'));
    if (!TYPE_ACTEUR_AUDIT_ENUM.includes(proprietes.typeActeur)) {
      throw new Error(`typeActeur invalide: ${proprietes.typeActeur}`);
    }
    this.typeActeur = proprietes.typeActeur;
    this.idUtilisateur = ActeurAudit.nettoyerOptionnel(proprietes.idUtilisateur);
    this.nomUtilisateur = ActeurAudit.nettoyerOptionnel(proprietes.nomUtilisateur);
    this.emailUtilisateur = ActeurAudit.nettoyerOptionnel(proprietes.emailUtilisateur);
    this.roleActif = ActeurAudit.nettoyerOptionnel(proprietes.roleActif);
    this.sourceActeur = ActeurAudit.validerTexte(proprietes.sourceActeur, 'sourceActeur');

    if (this.typeActeur === 'UTILISATEUR' && !this.idUtilisateur) {
      throw new Error("Un acteur utilisateur doit porter un idUtilisateur.");
    }
    if (this.typeActeur === 'UTILISATEUR' && !this.roleActif) {
      throw new Error("Un acteur utilisateur doit porter un roleActif.");
    }
  }

  public obtenirTypeActeur(): TypeActeurAudit { return this.typeActeur; }
  public obtenirIdUtilisateur(): string | undefined { return this.idUtilisateur; }
  public obtenirNomUtilisateur(): string | undefined { return this.nomUtilisateur; }
  public obtenirEmailUtilisateur(): string | undefined { return this.emailUtilisateur; }
  public obtenirNomAffichage(): string { return this.nomUtilisateur ?? this.sourceActeur; }
  public obtenirRoleActif(): string | undefined { return this.roleActif; }
  public obtenirSourceActeur(): string { return this.sourceActeur; }

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
