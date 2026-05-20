import { randomUUID } from 'node:crypto';
import { Entite } from '../../../domain/Entity';
import { CodeRestrictionMetier } from '../value-objects/CodeRestrictionMetier';

export interface ProprietesRestrictionRole {
  idRestrictionRole: string;
  codeRestriction: CodeRestrictionMetier;
  description?: string;
}

// Cette entite porte une interdiction metier attachee a un role.
export class RestrictionRole extends Entite<string> {
  private codeRestriction: CodeRestrictionMetier;
  private description?: string;

  constructor(proprietes: ProprietesRestrictionRole) {
    super(RestrictionRole.validerTexte(proprietes.idRestrictionRole, 'idRestrictionRole'));
    this.codeRestriction = proprietes.codeRestriction;
    this.description = RestrictionRole.nettoyerOptionnel(proprietes.description);
  }

  public static creer(codeRestriction: CodeRestrictionMetier, description?: string): RestrictionRole {
    return new RestrictionRole({
      idRestrictionRole: randomUUID(),
      codeRestriction,
      description,
    });
  }

  public obtenirCodeRestriction(): CodeRestrictionMetier {
    return this.codeRestriction;
  }

  public obtenirDescription(): string | undefined {
    return this.description;
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim() === '') {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre === '' ? undefined : propre;
  }
}
