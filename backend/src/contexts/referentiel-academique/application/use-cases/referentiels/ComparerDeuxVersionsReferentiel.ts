import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { ErreurComparaisonVersionsImpossible } from '../../../domain/exceptions/ErreurComparaisonVersionsImpossible';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { ClasseAcademiqueId } from '../../../domain/value-objects/ClasseAcademiqueId';
import { ComparerDeuxVersionsReferentielEntree } from '../../dto/input/ComparerDeuxVersionsReferentielEntree';
import { LigneDiffMigrationSortie } from '../../dto/output/LigneDiffMigrationSortie';
import { LigneDiffMigrationApplicationMapper } from '../../mappers/LigneDiffMigrationApplicationMapper';

// Cette interface represente la sortie du cas d'usage ComparerDeuxVersionsReferentiel.
export interface SortieComparerDeuxVersionsReferentiel {
  versionReferentielSource: string;
  versionReferentielCible: string;
  differences: LigneDiffMigrationSortie[];
}

// Ce cas d'usage orchestre la comparaison de deux versions de referentiel pour une classe academique.
export class ComparerDeuxVersionsReferentiel
  implements UseCase<ComparerDeuxVersionsReferentielEntree, SortieComparerDeuxVersionsReferentiel>
{
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly depotClasseAcademique: DepotClasseAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a la comparaison de deux versions.
  constructor(
    depotReferentielProgramme: DepotReferentielProgramme,
    depotClasseAcademique: DepotClasseAcademique,
  ) {
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.depotClasseAcademique = depotClasseAcademique;
  }

  // Cette methode compare deux versions de referentiel d'une meme classe academique.
  public async executer(
    entree: ComparerDeuxVersionsReferentielEntree,
  ): Promise<SortieComparerDeuxVersionsReferentiel> {
    const entreeValidee = this.validerEntree(entree);

    if (entreeValidee.versionReferentielSource === entreeValidee.versionReferentielCible) {
      throw new ErreurComparaisonVersionsImpossible(
        'La comparaison exige deux versions de referentiel distinctes.',
      );
    }

    const classeAcademique = await this.depotClasseAcademique.trouverParId(
      new ClasseAcademiqueId(entreeValidee.idClasseAcademique),
    );

    if (classeAcademique === null) {
      throw new ErreurClasseAcademiqueInvalide(
        "La classe academique ciblee de la comparaison est introuvable.",
      );
    }

    const referentielProgramme = await this.depotReferentielProgramme.trouverParClasseAcademique(
      classeAcademique.obtenirId(),
    );

    if (referentielProgramme === null) {
      throw new ErreurComparaisonVersionsImpossible(
        'Le referentiel programme de cette classe academique est introuvable.',
      );
    }

    const versionSource = referentielProgramme.trouverVersionParCode(
      entreeValidee.versionReferentielSource,
    );
    const versionCible = referentielProgramme.trouverVersionParCode(
      entreeValidee.versionReferentielCible,
    );

    if (versionSource === null || versionCible === null) {
      throw new ErreurComparaisonVersionsImpossible(
        'Les deux versions officielles a comparer doivent exister dans le referentiel de cette classe.',
      );
    }

    return {
      versionReferentielSource: entreeValidee.versionReferentielSource,
      versionReferentielCible: entreeValidee.versionReferentielCible,
      differences: versionSource
        .produireUnDiff(versionCible)
        .map((difference) => LigneDiffMigrationApplicationMapper.versSortie(difference)),
    };
  }

  private validerEntree(
    entree: ComparerDeuxVersionsReferentielEntree,
  ): ComparerDeuxVersionsReferentielEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurComparaisonVersionsImpossible(
        "L'entree du cas d'usage ComparerDeuxVersionsReferentiel est obligatoire.",
      );
    }

    return {
      idClasseAcademique: this.validerTexteObligatoire(entree.idClasseAcademique, 'idClasseAcademique'),
      versionReferentielSource: this.validerTexteObligatoire(
        entree.versionReferentielSource,
        'versionReferentielSource',
      ),
      versionReferentielCible: this.validerTexteObligatoire(
        entree.versionReferentielCible,
        'versionReferentielCible',
      ),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurComparaisonVersionsImpossible(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurComparaisonVersionsImpossible(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
