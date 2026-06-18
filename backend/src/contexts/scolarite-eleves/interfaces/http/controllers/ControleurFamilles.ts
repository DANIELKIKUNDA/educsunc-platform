import { FamillePresenter } from '../presenters/FamillePresenter';
import { ValidateurFamillesHttp } from '../validators/familles.validator';
import { CasUsageHttp } from './TypesControleurs';

// Ce fichier contient le controleur HTTP des familles.
export class ControleurFamilles {
  constructor(
    private readonly creerFamilleCas: CasUsageHttp,
    private readonly modifierFamilleCas: CasUsageHttp,
    private readonly consulterFamilleCas: CasUsageHttp,
    private readonly listerFamillesCas: CasUsageHttp,
    private readonly ajouterResponsableCas: CasUsageHttp,
    private readonly modifierResponsableCas: CasUsageHttp,
    private readonly retirerResponsableCas: CasUsageHttp,
    private readonly definirResponsablePrincipalCas: CasUsageHttp,
    private readonly evaluerFamilleNombreuseCas: CasUsageHttp,
  ) {}

  /** Cree une famille. */
  public async creerFamille(corps: unknown, headers: unknown) { return FamillePresenter.presenterFamille((await this.creerFamilleCas.executer(ValidateurFamillesHttp.validerCreation(corps, headers))).famille); }
  /** Modifie une famille. */
  public async modifierFamille(params: unknown, corps: unknown, headers: unknown) { return FamillePresenter.presenterFamille((await this.modifierFamilleCas.executer(ValidateurFamillesHttp.validerModification(params, corps, headers))).famille); }
  /** Consulte une famille. */
  public async consulterFamille(params: unknown, headers: unknown) { return FamillePresenter.presenterFamille((await this.consulterFamilleCas.executer(ValidateurFamillesHttp.validerConsultation(params, headers))).famille); }
  /** Liste les familles. */
  public async listerFamilles(query: unknown, headers: unknown) { return FamillePresenter.presenterListe(await this.listerFamillesCas.executer(ValidateurFamillesHttp.validerListe(query, headers))); }
  /** Ajoute un responsable. */
  public async ajouterResponsable(params: unknown, corps: unknown, headers: unknown) { return FamillePresenter.presenterFamille((await this.ajouterResponsableCas.executer(ValidateurFamillesHttp.validerResponsable(params, corps, headers))).famille); }
  /** Modifie un responsable. */
  public async modifierResponsable(params: unknown, corps: unknown, headers: unknown) { return FamillePresenter.presenterFamille((await this.modifierResponsableCas.executer(ValidateurFamillesHttp.validerResponsable(params, corps, headers))).famille); }
  /** Retire un responsable. */
  public async retirerResponsable(params: unknown, corps: unknown, headers: unknown) { return FamillePresenter.presenterFamille((await this.retirerResponsableCas.executer(ValidateurFamillesHttp.validerIdResponsable(params, corps, headers))).famille); }
  /** Definit le responsable principal. */
  public async definirResponsablePrincipal(params: unknown, corps: unknown, headers: unknown) { return FamillePresenter.presenterFamille((await this.definirResponsablePrincipalCas.executer(ValidateurFamillesHttp.validerIdResponsable(params, corps, headers))).famille); }
  /** Evalue famille nombreuse. */
  public async evaluerFamilleNombreuse(params: unknown, headers: unknown) { return { donnee: await this.evaluerFamilleNombreuseCas.executer(ValidateurFamillesHttp.validerConsultation(params, headers)) }; }
}
