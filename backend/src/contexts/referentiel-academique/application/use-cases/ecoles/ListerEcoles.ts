import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { ListerEcolesEntree } from '../../dto/input/ListerEcolesEntree';
import { ListerEcolesSortie } from '../../dto/output/ListerEcolesSortie';
import { EcoleApplicationMapper } from '../../mappers/EcoleApplicationMapper';

// Ce cas d'usage orchestre la lecture paginee globale des ecoles.
export class ListerEcoles implements UseCase<ListerEcolesEntree, ListerEcolesSortie> {
  private readonly depotEcole: DepotEcole;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances applicatives necessaires au listage global des ecoles.
  constructor(
    depotEcole: DepotEcole,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotEcole = depotEcole;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne la liste paginee de toutes les ecoles accessibles.
  public async executer(entree: ListerEcolesEntree): Promise<ListerEcolesSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const resultat = await this.depotEcole.lister({
      page: entreeValidee.page,
      taillePage: entreeValidee.taillePage,
    });

    return {
      ecoles: resultat.donnees.map((ecole) => EcoleApplicationMapper.versSortie(ecole)),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(entree: ListerEcolesEntree): ListerEcolesEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurEcoleInvalide(
        "L'entree du cas d'usage ListerEcoles est obligatoire.",
      );
    }

    return {
      page: this.validerEntierPositif(entree.page, 'page'),
      taillePage: this.validerEntierPositif(entree.taillePage, 'taillePage'),
    };
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurEcoleInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
