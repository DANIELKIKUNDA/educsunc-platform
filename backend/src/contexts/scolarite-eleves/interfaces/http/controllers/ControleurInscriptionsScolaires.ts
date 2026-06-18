import { InscriptionScolairePresenter } from '../presenters/InscriptionScolairePresenter';
import { ValidateurInscriptionsHttp } from '../validators/inscriptions.validator';
import { CasUsageHttp } from './TypesControleurs';

// Ce fichier contient le controleur HTTP des inscriptions scolaires.
export class ControleurInscriptionsScolaires {
  constructor(
    private readonly creerInscriptionCas: CasUsageHttp,
    private readonly creerInscriptionCompleteCas: CasUsageHttp,
    private readonly validerInscriptionCas: CasUsageHttp,
    private readonly annulerInscriptionCas: CasUsageHttp,
    private readonly consulterInscriptionCas: CasUsageHttp,
    private readonly listerParAnneeCas: CasUsageHttp,
    private readonly listerParClasseCas: CasUsageHttp,
  ) {}

  /** Cree une inscription. */
  public async creerInscription(corps: unknown, headers: unknown) { return InscriptionScolairePresenter.presenterInscription((await this.creerInscriptionCas.executer(ValidateurInscriptionsHttp.validerCreation(corps, headers))).inscription); }
  /** Cree une inscription complete. */
  public async creerInscriptionComplete(corps: unknown, headers: unknown) { return { donnee: await this.creerInscriptionCompleteCas.executer(ValidateurInscriptionsHttp.validerComplete(corps, headers)) }; }
  /** Valide une inscription. */
  public async validerInscription(params: unknown, corps: unknown, headers: unknown) { return InscriptionScolairePresenter.presenterInscription((await this.validerInscriptionCas.executer(ValidateurInscriptionsHttp.validerAction(params, corps, headers))).inscription); }
  /** Annule une inscription. */
  public async annulerInscription(params: unknown, corps: unknown, headers: unknown) { return InscriptionScolairePresenter.presenterInscription((await this.annulerInscriptionCas.executer(ValidateurInscriptionsHttp.validerAction(params, corps, headers))).inscription); }
  /** Consulte une inscription. */
  public async consulterInscription(params: unknown) { return InscriptionScolairePresenter.presenterInscription((await this.consulterInscriptionCas.executer(ValidateurInscriptionsHttp.validerConsultation(params))).inscription); }
  /** Liste par annee. */
  public async listerParAnnee(params: unknown) { return InscriptionScolairePresenter.presenterListe(await this.listerParAnneeCas.executer(ValidateurInscriptionsHttp.validerParametre(params, 'idAnneeScolaire'))); }
  /** Liste par classe. */
  public async listerParClasse(params: unknown) { return InscriptionScolairePresenter.presenterListe(await this.listerParClasseCas.executer(ValidateurInscriptionsHttp.validerParametre(params, 'idClassePedagogique'))); }
}
