import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotSectionScolaire } from '../../../domain/repositories/DepotSectionScolaire';
import { SectionScolaireSortie } from '../../dto/output/SectionScolaireSortie';
import { SectionScolaireApplicationMapper } from '../../mappers/SectionScolaireApplicationMapper';

export interface ListerSectionsScolairesEntree {
  page: number;
  taillePage: number;
}

export interface ListerSectionsScolairesSortie {
  sectionsScolaires: SectionScolaireSortie[];
  total: number;
  page: number;
  taillePage: number;
}

// Ce cas d'usage orchestre la lecture paginee des sections scolaires officielles.
export class ListerSectionsScolaires
  implements UseCase<ListerSectionsScolairesEntree, ListerSectionsScolairesSortie>
{
  private readonly depotSectionScolaire: DepotSectionScolaire;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances de lecture du referentiel des sections.
  constructor(
    depotSectionScolaire: DepotSectionScolaire,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotSectionScolaire = depotSectionScolaire;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne les sections scolaires officielles dans une page stable.
  public async executer(
    entree: ListerSectionsScolairesEntree,
  ): Promise<ListerSectionsScolairesSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const resultat = await this.depotSectionScolaire.lister({
      page: entreeValidee.page,
      taillePage: entreeValidee.taillePage,
    });

    return {
      sectionsScolaires: resultat.donnees.map((sectionScolaire) => (
        SectionScolaireApplicationMapper.versSortie(sectionScolaire)
      )),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(entree: ListerSectionsScolairesEntree): ListerSectionsScolairesEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClasseAcademiqueInvalide(
        "L'entree du cas d'usage ListerSectionsScolaires est obligatoire.",
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
