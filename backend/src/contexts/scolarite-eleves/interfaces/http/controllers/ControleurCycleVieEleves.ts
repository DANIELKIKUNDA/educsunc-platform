import { ElevePresenter } from '../presenters/ElevePresenter';
import { ValidateurCycleVieHttp } from '../validators/cycle-vie.validator';
import { CasUsageHttp } from './TypesControleurs';

// Ce fichier contient le controleur HTTP du cycle de vie des eleves.
export class ControleurCycleVieEleves {
  constructor(
    private readonly declarerAbandonCas: CasUsageHttp,
    private readonly transfererEleveCas: CasUsageHttp,
    private readonly reintegrerEleveCas: CasUsageHttp,
    private readonly suspendreEleveCas: CasUsageHttp,
    private readonly reactiverEleveCas: CasUsageHttp,
    private readonly declarerDecesCas: CasUsageHttp,
  ) {}

  /** Declare abandon. */
  public async declarerAbandon(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.declarerAbandonCas.executer(ValidateurCycleVieHttp.validerAbandon(params, corps, headers))).eleve); }
  /** Transfere eleve. */
  public async transfererEleve(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.transfererEleveCas.executer(ValidateurCycleVieHttp.validerTransfert(params, corps, headers))).eleve); }
  /** Reintegre eleve. */
  public async reintegrerEleve(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.reintegrerEleveCas.executer(ValidateurCycleVieHttp.validerReintegration(params, corps, headers))).eleve); }
  /** Suspend eleve. */
  public async suspendreEleve(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.suspendreEleveCas.executer(ValidateurCycleVieHttp.validerSuspension(params, corps, headers))).eleve); }
  /** Reactive eleve. */
  public async reactiverEleve(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.reactiverEleveCas.executer(ValidateurCycleVieHttp.validerReactivation(params, corps, headers))).eleve); }
  /** Declare deces. */
  public async declarerDeces(params: unknown, corps: unknown, headers: unknown) { return ElevePresenter.presenterEleve((await this.declarerDecesCas.executer(ValidateurCycleVieHttp.validerDeces(params, corps, headers))).eleve); }
}
