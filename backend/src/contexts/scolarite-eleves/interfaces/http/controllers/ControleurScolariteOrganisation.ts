import { SyntheseScolaritePresenter } from '../presenters/SyntheseScolaritePresenter';
import { ValidateurOrganisationScolariteHttp } from '../validators/organisation-scolarite.validator';
import { ElevePresenter } from '../presenters/ElevePresenter';
import { InscriptionScolairePresenter } from '../presenters/InscriptionScolairePresenter';
import { CasUsageHttp } from './TypesControleurs';

// Ce fichier contient le controleur HTTP des lectures organisationnelles.
export class ControleurScolariteOrganisation {
  constructor(
    private readonly listerElevesParOrganisationCas: CasUsageHttp,
    private readonly listerInscriptionsParOrganisationCas: CasUsageHttp,
    private readonly consulterSyntheseOrganisationCas: CasUsageHttp,
    private readonly listerAlertesOrganisationCas: CasUsageHttp,
  ) {}

  /** Liste eleves organisation. */
  public async listerElevesParOrganisation(params: unknown, query: unknown) { return ElevePresenter.presenterListe(await this.listerElevesParOrganisationCas.executer(ValidateurOrganisationScolariteHttp.validerOrganisation(params, query))); }
  /** Liste inscriptions organisation. */
  public async listerInscriptionsParOrganisation(params: unknown, query: unknown) { return InscriptionScolairePresenter.presenterListe(await this.listerInscriptionsParOrganisationCas.executer(ValidateurOrganisationScolariteHttp.validerOrganisation(params, query))); }
  /** Consulte synthese organisation. */
  public async consulterSyntheseOrganisation(params: unknown) { return SyntheseScolaritePresenter.presenterSynthese(await this.consulterSyntheseOrganisationCas.executer(ValidateurOrganisationScolariteHttp.validerOrganisation(params))); }
  /** Liste alertes organisation. */
  public async listerAlertesOrganisation(params: unknown) { return SyntheseScolaritePresenter.presenterAlertes(await this.listerAlertesOrganisationCas.executer(ValidateurOrganisationScolariteHttp.validerOrganisation(params))); }
}
