import { ApplicationException } from '../../contexts/bulletins-evaluations/application/exceptions/ApplicationException';
import { AutorisationClassementAdapter } from './AutorisationClassementAdapter';
import { AutorisationConduiteAdapter } from './AutorisationConduiteAdapter';
import { AutorisationConsultationStatistiquesAdapter } from './AutorisationConsultationStatistiquesAdapter';

interface DependancesAutorisationAuditPedagogiqueAdapter {
  autorisationConsultationStatistiquesAdapter?: Pick<
    AutorisationConsultationStatistiquesAdapter,
    'verifierConsultationStatistiquesClasse'
  > & Partial<Pick<AutorisationConsultationStatistiquesAdapter, 'fermer'>>;
  autorisationConduiteAdapter?: Pick<AutorisationConduiteAdapter, 'verifierEncodageConduite'> &
  Partial<Pick<AutorisationConduiteAdapter, 'fermer'>>;
  autorisationClassementAdapter?: Pick<AutorisationClassementAdapter, 'verifierConsultationClassementClasse'> &
  Partial<Pick<AutorisationClassementAdapter, 'fermer'>>;
}

type AutorisationConsultationStatistiquesAudit = Pick<
  AutorisationConsultationStatistiquesAdapter,
  'verifierConsultationStatistiquesClasse'
> & Partial<Pick<AutorisationConsultationStatistiquesAdapter, 'fermer'>>;
type AutorisationConduiteAudit = Pick<AutorisationConduiteAdapter, 'verifierEncodageConduite'> &
Partial<Pick<AutorisationConduiteAdapter, 'fermer'>>;
type AutorisationClassementAudit = Pick<
  AutorisationClassementAdapter,
  'verifierConsultationClassementClasse'
> & Partial<Pick<AutorisationClassementAdapter, 'fermer'>>;

// Cet adaptateur reapplique la doctrine permission + perimetre sur les lectures d'audit pedagogique.
export class AutorisationAuditPedagogiqueAdapter {
  private readonly autorisationConsultationStatistiquesAdapter: AutorisationConsultationStatistiquesAudit;
  private readonly autorisationConduiteAdapter: AutorisationConduiteAudit;
  private readonly autorisationClassementAdapter: AutorisationClassementAudit;

  constructor(dependances?: DependancesAutorisationAuditPedagogiqueAdapter) {
    this.autorisationConsultationStatistiquesAdapter =
      dependances?.autorisationConsultationStatistiquesAdapter
      ?? new AutorisationConsultationStatistiquesAdapter();
    this.autorisationConduiteAdapter =
      dependances?.autorisationConduiteAdapter
      ?? new AutorisationConduiteAdapter();
    this.autorisationClassementAdapter =
      dependances?.autorisationClassementAdapter
      ?? new AutorisationClassementAdapter();
  }

  public async verifierLectureAuditCotes(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.autorisationConsultationStatistiquesAdapter.verifierConsultationStatistiquesClasse(params);
  }

  public async verifierLectureAuditConduite(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    try {
      await this.autorisationConduiteAdapter.verifierEncodageConduite(params);
      return;
    } catch (erreur) {
      if (!(erreur instanceof ApplicationException)) {
        throw erreur;
      }
    }

    await this.autorisationConsultationStatistiquesAdapter.verifierConsultationStatistiquesClasse(params);
  }

  public async verifierLectureAuditBulletins(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.autorisationConsultationStatistiquesAdapter.verifierConsultationStatistiquesClasse(params);
  }

  public async verifierLectureAuditClassements(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.autorisationClassementAdapter.verifierConsultationClassementClasse(params);
  }

  public async fermer(): Promise<void> {
    await this.autorisationConsultationStatistiquesAdapter.fermer?.();
    await this.autorisationConduiteAdapter.fermer?.();
    await this.autorisationClassementAdapter.fermer?.();
  }
}
