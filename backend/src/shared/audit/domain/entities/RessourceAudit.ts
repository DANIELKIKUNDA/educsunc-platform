import { Entite } from '../../../domain/Entity';
import { IdentifiantRessourceAudit, TypeRessourceAudit } from '../value-objects';

export interface ProprietesRessourceAudit {
  idRessourceAudit: string;
  typeRessource: TypeRessourceAudit;
  identifiantRessource: IdentifiantRessourceAudit;
  libelleRessource?: string;
  referenceRessource?: string;
}

// Cette entité référence la donnée métier impactée par l'action.
export class RessourceAudit extends Entite<string> {
  private readonly typeRessource: TypeRessourceAudit;
  private readonly identifiantRessource: IdentifiantRessourceAudit;
  private readonly libelleRessource?: string;
  private readonly referenceRessource?: string;

  constructor(proprietes: ProprietesRessourceAudit) {
    super(RessourceAudit.validerTexte(proprietes.idRessourceAudit, 'idRessourceAudit'));
    this.typeRessource = proprietes.typeRessource;
    this.identifiantRessource = proprietes.identifiantRessource;
    this.libelleRessource = RessourceAudit.nettoyerOptionnel(proprietes.libelleRessource);
    this.referenceRessource = RessourceAudit.nettoyerOptionnel(proprietes.referenceRessource);
  }

  public obtenirTypeRessource(): TypeRessourceAudit { return this.typeRessource; }
  public obtenirIdentifiantRessource(): IdentifiantRessourceAudit { return this.identifiantRessource; }
  public obtenirLibelleRessource(): string | undefined { return this.libelleRessource; }
  public obtenirReferenceRessource(): string | undefined { return this.referenceRessource; }

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
