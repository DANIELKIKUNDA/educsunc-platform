import { ElevePresenter } from '../presenters/ElevePresenter';
import { ValidateurElevesHttp } from '../validators/eleves.validator';
import { CasUsageHttp } from './TypesControleurs';

// Ce fichier contient le controleur HTTP des eleves.
export class ControleurEleves {
  constructor(
    private readonly creerEleveCas: CasUsageHttp,
    private readonly modifierEleveCas: CasUsageHttp,
    private readonly consulterEleveCas: CasUsageHttp,
    private readonly listerElevesCas: CasUsageHttp,
    private readonly rechercherElevesCas: CasUsageHttp,
    private readonly rattacherFamilleCas: CasUsageHttp,
    private readonly detacherFamilleCas: CasUsageHttp,
    private readonly marquerDecedeCas: CasUsageHttp,
  ) {}

  /** Cree un eleve. */
  public async creerEleve(corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.creerEleveCas.executer(ValidateurElevesHttp.validerCreation(corps, headers))).eleve); }
  /** Modifie l'identite d'un eleve. */
  public async modifierEleve(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.modifierEleveCas.executer(ValidateurElevesHttp.validerModification(params, corps, headers))).eleve); }
  /** Consulte un eleve. */
  public async consulterEleve(params: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.consulterEleveCas.executer(ValidateurElevesHttp.validerConsultation(params, headers))).eleve); }
  /** Liste les eleves. */
  public async listerEleves(query: unknown, headers: unknown) { return ElevePresenter.presenterListe(await this.listerElevesCas.executer(ValidateurElevesHttp.validerListe(query, headers))); }
  /** Recherche les eleves. */
  public async rechercherEleves(query: unknown, headers: unknown) { return ElevePresenter.presenterListe(await this.rechercherElevesCas.executer(ValidateurElevesHttp.validerRecherche(query, headers))); }
  /** Rattache un eleve a une famille. */
  public async rattacherFamille(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.rattacherFamilleCas.executer(ValidateurElevesHttp.validerRattachementFamille(params, corps, headers))).eleve); }
  /** Detache un eleve de sa famille. */
  public async detacherFamille(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.detacherFamilleCas.executer({ ...ValidateurElevesHttp.validerRattachementFamille(params, corps, headers), idFamille: undefined })).eleve); }
  /** Marque un eleve comme decede. */
  public async marquerDecede(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.marquerDecedeCas.executer(ValidateurElevesHttp.validerChangementStatut(params, corps, headers, 'DECEDE' as any))).eleve); }
}
