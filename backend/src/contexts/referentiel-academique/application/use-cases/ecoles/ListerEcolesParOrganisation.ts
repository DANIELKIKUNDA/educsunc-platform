import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurOrganisationInvalide } from '../../../domain/exceptions/ErreurOrganisationInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { OrganisationId } from '../../../domain/value-objects/OrganisationId';
import { ListerEcolesParOrganisationEntree } from '../../dto/input/ListerEcolesParOrganisationEntree';
import { ListerEcolesParOrganisationSortie } from '../../dto/output/ListerEcolesParOrganisationSortie';
import { EcoleApplicationMapper } from '../../mappers/EcoleApplicationMapper';

// Ce cas d'usage orchestre la lecture des ecoles rattachees a une organisation.
export class ListerEcolesParOrganisation
  implements UseCase<ListerEcolesParOrganisationEntree, ListerEcolesParOrganisationSortie>
{
  private readonly depotEcole: DepotEcole;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances applicatives necessaires au listage des ecoles d'une organisation.
  constructor(
    depotEcole: DepotEcole,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotEcole = depotEcole;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne la liste paginee des ecoles rattachees a une organisation.
  public async executer(
    entree: ListerEcolesParOrganisationEntree,
  ): Promise<ListerEcolesParOrganisationSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const resultat = await this.depotEcole.listerParOrganisation(
      new OrganisationId(entreeValidee.idOrganisation),
      {
        page: entreeValidee.page,
        taillePage: entreeValidee.taillePage,
      },
    );

    return {
      ecoles: resultat.donnees.map((ecole) => EcoleApplicationMapper.versSortie(ecole)),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(
    entree: ListerEcolesParOrganisationEntree,
  ): ListerEcolesParOrganisationEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOrganisationInvalide(
        "L'entree du cas d'usage ListerEcolesParOrganisation est obligatoire.",
      );
    }

    return {
      idOrganisation: this.validerTexteObligatoire(entree.idOrganisation, 'idOrganisation'),
      page: this.validerEntierPositif(entree.page, 'page'),
      taillePage: this.validerEntierPositif(entree.taillePage, 'taillePage'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurOrganisationInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurOrganisationInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurOrganisationInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
