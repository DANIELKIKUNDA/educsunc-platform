import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurReferentielCoursInvalide } from '../../../domain/exceptions/ErreurReferentielCoursInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotReferentielCours } from '../../../domain/repositories/DepotReferentielCours';
import { ListerReferentielsCoursEntree } from '../../dto/input/ListerReferentielsCoursEntree';
import { ListerReferentielsCoursSortie } from '../../dto/output/ListerReferentielsCoursSortie';
import { ReferentielCoursApplicationMapper } from '../../mappers/ReferentielCoursApplicationMapper';

// Ce cas d'usage orchestre la lecture paginee du catalogue officiel des cours.
export class ListerReferentielsCours
  implements UseCase<ListerReferentielsCoursEntree, ListerReferentielsCoursSortie>
{
  private readonly depotReferentielCours: DepotReferentielCours;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances necessaires a la lecture des cours officiels.
  constructor(
    depotReferentielCours: DepotReferentielCours,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotReferentielCours = depotReferentielCours;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne les cours officiels dans une page stable.
  public async executer(
    entree: ListerReferentielsCoursEntree,
  ): Promise<ListerReferentielsCoursSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const resultat = await this.depotReferentielCours.lister({
      page: entreeValidee.page,
      taillePage: entreeValidee.taillePage,
    });

    return {
      referentielsCours: resultat.donnees.map((referentielCours) => (
        ReferentielCoursApplicationMapper.versSortie(referentielCours)
      )),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(entree: ListerReferentielsCoursEntree): ListerReferentielsCoursEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurReferentielCoursInvalide(
        "L'entree du cas d'usage ListerReferentielsCours est obligatoire.",
      );
    }

    return {
      page: this.validerEntierPositif(entree.page, 'page'),
      taillePage: this.validerEntierPositif(entree.taillePage, 'taillePage'),
    };
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurReferentielCoursInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
