import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { ListerClassesAcademiquesEntree } from '../../dto/input/ListerClassesAcademiquesEntree';
import { ListerClassesAcademiquesSortie } from '../../dto/output/ListerClassesAcademiquesSortie';
import { ClasseAcademiqueApplicationMapper } from '../../mappers/ClasseAcademiqueApplicationMapper';

// Ce cas d'usage orchestre la lecture des classes academiques.
export class ListerClassesAcademiques
  implements UseCase<ListerClassesAcademiquesEntree, ListerClassesAcademiquesSortie>
{
  private readonly depotClasseAcademique: DepotClasseAcademique;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances applicatives necessaires au listage des classes academiques.
  constructor(
    depotClasseAcademique: DepotClasseAcademique,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotClasseAcademique = depotClasseAcademique;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne la liste paginee des classes academiques.
  public async executer(
    entree: ListerClassesAcademiquesEntree,
  ): Promise<ListerClassesAcademiquesSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const resultat = await this.depotClasseAcademique.lister({
      page: entreeValidee.page,
      taillePage: entreeValidee.taillePage,
    });

    return {
      classesAcademiques: resultat.donnees.map((classeAcademique) => (
        ClasseAcademiqueApplicationMapper.versSortie(classeAcademique)
      )),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(
    entree: ListerClassesAcademiquesEntree,
  ): ListerClassesAcademiquesEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClasseAcademiqueInvalide(
        "L'entree du cas d'usage ListerClassesAcademiques est obligatoire.",
      );
    }

    return {
      page: this.validerEntierPositif(entree.page, 'page'),
      taillePage: this.validerEntierPositif(entree.taillePage, 'taillePage'),
    };
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurClasseAcademiqueInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
