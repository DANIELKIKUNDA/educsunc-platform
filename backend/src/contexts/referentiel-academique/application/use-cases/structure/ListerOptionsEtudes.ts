import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurOptionEtudeInvalide } from '../../../domain/exceptions/ErreurOptionEtudeInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotOptionEtude } from '../../../domain/repositories/DepotOptionEtude';
import { ListerOptionsEtudesEntree } from '../../dto/input/ListerOptionsEtudesEntree';
import { ListerOptionsEtudesSortie } from '../../dto/output/ListerOptionsEtudesSortie';
import { OptionEtudeApplicationMapper } from '../../mappers/OptionEtudeApplicationMapper';

// Ce cas d'usage orchestre la lecture paginee globale des options d'etude.
export class ListerOptionsEtudes
  implements UseCase<ListerOptionsEtudesEntree, ListerOptionsEtudesSortie>
{
  private readonly depotOptionEtude: DepotOptionEtude;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances applicatives necessaires au listage des options.
  constructor(
    depotOptionEtude: DepotOptionEtude,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotOptionEtude = depotOptionEtude;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne la liste paginee des options d'etude officielles.
  public async executer(
    entree: ListerOptionsEtudesEntree,
  ): Promise<ListerOptionsEtudesSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const resultat = await this.depotOptionEtude.lister({
      page: entreeValidee.page,
      taillePage: entreeValidee.taillePage,
    });

    return {
      optionsEtudes: resultat.donnees.map((optionEtude) => (
        OptionEtudeApplicationMapper.versSortie(optionEtude)
      )),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(
    entree: ListerOptionsEtudesEntree,
  ): ListerOptionsEtudesEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOptionEtudeInvalide(
        "L'entree du cas d'usage ListerOptionsEtudes est obligatoire.",
      );
    }

    return {
      page: this.validerEntierPositif(entree.page, 'page'),
      taillePage: this.validerEntierPositif(entree.taillePage, 'taillePage'),
    };
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurOptionEtudeInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
