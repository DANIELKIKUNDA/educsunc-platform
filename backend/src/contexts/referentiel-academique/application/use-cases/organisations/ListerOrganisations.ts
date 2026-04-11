import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurOrganisationInvalide } from '../../../domain/exceptions/ErreurOrganisationInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotOrganisation } from '../../../domain/repositories/DepotOrganisation';
import { ListerOrganisationsEntree } from '../../dto/input/ListerOrganisationsEntree';
import { ListerOrganisationsSortie } from '../../dto/output/ListerOrganisationsSortie';
import { OrganisationApplicationMapper } from '../../mappers/OrganisationApplicationMapper';

// Ce cas d'usage orchestre la lecture paginee des organisations.
export class ListerOrganisations implements UseCase<ListerOrganisationsEntree, ListerOrganisationsSortie> {
  private readonly depotOrganisation: DepotOrganisation;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances applicatives necessaires au listage des organisations.
  constructor(
    depotOrganisation: DepotOrganisation,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotOrganisation = depotOrganisation;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne une lecture paginee des organisations.
  public async executer(entree: ListerOrganisationsEntree): Promise<ListerOrganisationsSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const resultat = await this.depotOrganisation.lister({
      page: entreeValidee.page,
      taillePage: entreeValidee.taillePage,
    });

    return {
      organisations: resultat.donnees.map((organisation) =>
        OrganisationApplicationMapper.versSortie(organisation)),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(entree: ListerOrganisationsEntree): ListerOrganisationsEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOrganisationInvalide(
        "L'entree du cas d'usage ListerOrganisations est obligatoire.",
      );
    }

    return {
      page: this.validerEntier(entree.page, 'page'),
      taillePage: this.validerEntier(entree.taillePage, 'taillePage'),
    };
  }

  private validerEntier(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur)) {
      throw new ErreurOrganisationInvalide(
        `Le champ "${nomChamp}" doit etre un entier.`,
      );
    }

    return valeur;
  }
}
