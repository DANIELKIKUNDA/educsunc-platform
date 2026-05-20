import { randomUUID } from 'node:crypto';
import { Entite } from '../../../domain/Entity';
import { TypeScope } from '../value-objects/TypeScope';

export interface ProprietesScopeAcces {
  idScopeAcces: string;
  typeScope: TypeScope;
  valeurScope: string;
  estLectureSeule: boolean;
}

// Cette entite decrit une portee d'acces reelle accordee a une affectation.
export class ScopeAcces extends Entite<string> {
  private typeScope: TypeScope;
  private valeurScope: string;
  private estLectureSeule: boolean;

  constructor(proprietes: ProprietesScopeAcces) {
    super(ScopeAcces.validerTexte(proprietes.idScopeAcces, 'idScopeAcces'));
    this.typeScope = proprietes.typeScope;
    this.valeurScope = ScopeAcces.validerTexte(proprietes.valeurScope, 'valeurScope');
    this.estLectureSeule = Boolean(proprietes.estLectureSeule);
  }

  public static creer(typeScope: TypeScope, valeurScope: string, estLectureSeule = false): ScopeAcces {
    return new ScopeAcces({
      idScopeAcces: randomUUID(),
      typeScope,
      valeurScope,
      estLectureSeule,
    });
  }

  public obtenirTypeScope(): TypeScope {
    return this.typeScope;
  }

  public obtenirValeurScope(): string {
    return this.valeurScope;
  }

  public obtenirEstLectureSeule(): boolean {
    return this.estLectureSeule;
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim() === '') {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }
}
