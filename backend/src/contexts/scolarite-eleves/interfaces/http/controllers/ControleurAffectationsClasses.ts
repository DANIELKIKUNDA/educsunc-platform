import { AffectationClassePresenter } from '../presenters/AffectationClassePresenter';
import { ValidateurAffectationsHttp } from '../validators/affectations.validator';
import { CasUsageHttp } from './TypesControleurs';

// Ce fichier contient le controleur HTTP des affectations de classes.
export class ControleurAffectationsClasses {
  constructor(
    private readonly affecterEleveCas: CasUsageHttp,
    private readonly changerClasseCas: CasUsageHttp,
    private readonly consulterAffectationActiveCas: CasUsageHttp,
    private readonly listerElevesParClasseCas: CasUsageHttp,
    private readonly desactiverAffectationCas: CasUsageHttp,
  ) {}

  /** Affecte un eleve a une classe. */
  public async affecterEleve(corps: unknown, headers: unknown) { return AffectationClassePresenter.presenterAffectation((await this.affecterEleveCas.executer(ValidateurAffectationsHttp.validerCreation(corps, headers))).affectation); }
  /** Change un eleve de classe. */
  public async changerClasse(params: unknown, corps: unknown, headers: unknown) { return AffectationClassePresenter.presenterAffectation((await this.changerClasseCas.executer(ValidateurAffectationsHttp.validerChangementClasse(params, corps, headers))).affectation); }
  /** Consulte une affectation par id comme affectation active. */
  public async consulterAffectation(params: unknown) { return this.consulterAffectationActive(params); }
  /** Consulte l'affectation active d'une inscription. */
  public async consulterAffectationActive(params: unknown) { return AffectationClassePresenter.presenterAffectation((await this.consulterAffectationActiveCas.executer(ValidateurAffectationsHttp.validerActive(params))).affectation); }
  /** Liste les eleves d'une classe via les affectations. */
  public async listerElevesParClasse(params: unknown) { return AffectationClassePresenter.presenterListe(await this.listerElevesParClasseCas.executer(ValidateurAffectationsHttp.validerClasse(params))); }
  /** Desactive une affectation. */
  public async desactiverAffectation(params: unknown, headers: unknown) { await this.desactiverAffectationCas.executer(ValidateurAffectationsHttp.validerDesactivation(params, headers)); return { donnee: { desactivee: true } }; }
}
