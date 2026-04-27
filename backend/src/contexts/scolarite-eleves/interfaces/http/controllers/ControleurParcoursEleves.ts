import { ParcoursElevePresenter } from '../presenters/ParcoursElevePresenter';
import { ValidateurParcoursHttp } from '../validators/parcours.validator';
import { CasUsageHttp } from './TypesControleurs';

// Ce fichier contient le controleur HTTP des parcours eleves.
export class ControleurParcoursEleves {
  constructor(
    private readonly consulterParcoursCas: CasUsageHttp,
    private readonly listerEvenementsParEleveCas: CasUsageHttp,
    private readonly listerEvenementsParAnneeCas: CasUsageHttp,
    private readonly reconstruireParcoursCas: CasUsageHttp,
  ) {}

  /** Consulte parcours. */
  public async consulterParcours(params: unknown) { return ParcoursElevePresenter.presenterParcours((await this.consulterParcoursCas.executer(ValidateurParcoursHttp.validerParEleve(params))).parcours); }
  /** Liste evenements eleve. */
  public async listerEvenementsParEleve(params: unknown) { return ParcoursElevePresenter.presenterEvenements(await this.listerEvenementsParEleveCas.executer(ValidateurParcoursHttp.validerParEleve(params))); }
  /** Liste evenements annee. */
  public async listerEvenementsParAnnee(params: unknown) { return ParcoursElevePresenter.presenterEvenements(await this.listerEvenementsParAnneeCas.executer(ValidateurParcoursHttp.validerParAnnee(params))); }
  /** Reconstruit parcours. */
  public async reconstruireParcours(params: unknown, headers: unknown) { return ParcoursElevePresenter.presenterParcours((await this.reconstruireParcoursCas.executer(ValidateurParcoursHttp.validerReconstruction(params, headers))).parcours); }
}
