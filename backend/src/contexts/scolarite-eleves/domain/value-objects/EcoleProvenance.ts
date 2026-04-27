import { ObjetValeur } from '../../../../shared/domain/ValueObject';
import { TypeProvenanceEcole } from './TypeProvenanceEcole';
import { UUID } from './TypesPrimitifs';
import { ErreurEcoleProvenanceInvalide } from '../exceptions/ErreurEcoleProvenanceInvalide';

// Ce fichier contient le value object qui garde l'origine administrative d'un eleve.
export interface ProprietesEcoleProvenance {
  typeProvenance: TypeProvenanceEcole;
  nomEcoleProvenance: string;
  idEcoleProvenance?: UUID;
}

/**
 * Ce value object immutable represente l'ecole d'origine de l'eleve au moment de son entree.
 */
export class EcoleProvenance extends ObjetValeur<ProprietesEcoleProvenance> {
  private constructor(proprietes: ProprietesEcoleProvenance) {
    EcoleProvenance.validerProprietes(proprietes);
    super(proprietes);
  }

  /** Cree une provenance externe quand l'ecole source n'existe pas dans EduSync. */
  public static externe(nomEcoleProvenance: string): EcoleProvenance {
    const nom = EcoleProvenance.nettoyerTexteObligatoire(nomEcoleProvenance, 'nomEcoleProvenance');

    return new EcoleProvenance({ typeProvenance: TypeProvenanceEcole.EXTERNE, nomEcoleProvenance: nom });
  }

  /** Cree une provenance interne quand l'ecole source est connue dans EduSync. */
  public static interne(idEcoleProvenance: UUID, nomEcoleProvenance: string): EcoleProvenance {
    const identifiantEcole = EcoleProvenance.validerIdentifiant(idEcoleProvenance, 'idEcoleProvenance');
    const nom = EcoleProvenance.nettoyerTexteObligatoire(nomEcoleProvenance, 'nomEcoleProvenance');

    return new EcoleProvenance({ typeProvenance: TypeProvenanceEcole.INTERNE, nomEcoleProvenance: nom, idEcoleProvenance: identifiantEcole });
  }

  /** Reconstitue une provenance depuis des donnees deja persistees. */
  public static depuisProprietes(proprietes: ProprietesEcoleProvenance): EcoleProvenance {
    return new EcoleProvenance({ ...proprietes });
  }

  /** Retourne le type de provenance, interne ou externe. */
  public obtenirTypeProvenance(): TypeProvenanceEcole {
    return this.proprietes.typeProvenance;
  }

  /** Retourne le nom lisible de l'ecole de provenance. */
  public obtenirNomEcoleProvenance(): string {
    return this.proprietes.nomEcoleProvenance;
  }

  /** Retourne l'identifiant de l'ecole interne de provenance quand il existe. */
  public obtenirIdEcoleProvenance(): UUID | undefined {
    return this.proprietes.idEcoleProvenance;
  }

  /** Retourne une copie simple des proprietes pour les mappers futurs. */
  public versProprietes(): ProprietesEcoleProvenance {
    return { ...this.proprietes };
  }

  /** Indique si la provenance reference une ecole deja connue du systeme. */
  public estInterne(): boolean {
    return this.proprietes.typeProvenance === TypeProvenanceEcole.INTERNE;
  }

  private static validerProprietes(proprietes: ProprietesEcoleProvenance): void {
    if (!Object.values(TypeProvenanceEcole).includes(proprietes.typeProvenance)) {
      throw new ErreurEcoleProvenanceInvalide('Le type de provenance de l ecole est invalide.');
    }

    EcoleProvenance.nettoyerTexteObligatoire(proprietes.nomEcoleProvenance, 'nomEcoleProvenance');

    if (proprietes.typeProvenance === TypeProvenanceEcole.INTERNE) {
      EcoleProvenance.validerIdentifiant(proprietes.idEcoleProvenance, 'idEcoleProvenance');
      return;
    }

    if (proprietes.idEcoleProvenance !== undefined) {
      throw new ErreurEcoleProvenanceInvalide('Une provenance externe ne doit pas contenir idEcoleProvenance.');
    }
  }

  private static nettoyerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurEcoleProvenanceInvalide(`Le champ ${nomChamp} doit etre une chaine de caracteres.`);
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurEcoleProvenanceInvalide(`Le champ ${nomChamp} est obligatoire.`);
    }

    return valeurNettoyee;
  }

  private static validerIdentifiant(valeur: UUID | undefined, nomChamp: string): UUID {
    if (typeof valeur !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(valeur)) {
      throw new ErreurEcoleProvenanceInvalide(`Le champ ${nomChamp} doit etre un UUID valide.`);
    }

    return valeur;
  }
}
