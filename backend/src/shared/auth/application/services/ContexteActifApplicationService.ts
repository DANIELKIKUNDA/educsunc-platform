import { ContexteActifAuth, DepotContexteActifAuth, MoteurContexteActif } from '../../domain';
import {
  ContexteActifInvalideApplicationException,
  EcoleActiveRefuseeApplicationException,
  OrganisationActiveRefuseeApplicationException,
} from '../exceptions';
import { ContexteActifMapper } from '../mappers/ContexteActifMapper';
import { SecurityAuthorizationPort } from '../ports/security/SecurityAuthorizationPort';
import { TenantContextPort } from '../ports/tenancy/TenantContextPort';
import { ContexteActifOutput } from '../dto/output';

// Ce service applicatif gere le contexte actif organisation/ecole d'un utilisateur.
export class ContexteActifApplicationService {
  constructor(
    private readonly depotContexteActifAuth: DepotContexteActifAuth,
    private readonly securityAuthorizationPort: SecurityAuthorizationPort,
    private readonly tenantContextPort: TenantContextPort,
    private readonly moteurContexteActif: MoteurContexteActif,
  ) {}

  // Cette methode retourne le contexte actif courant de l'utilisateur.
  public async obtenirContexteActif(idUtilisateur: string): Promise<ContexteActifOutput> {
    const contexte = await this.depotContexteActifAuth.trouverContexteUtilisateur(idUtilisateur);
    if (!contexte) {
      throw new ContexteActifInvalideApplicationException();
    }

    return ContexteActifMapper.depuisDomaine(contexte);
  }

  // Cette methode revient au pilotage plateforme sans conserver un ancien tenant.
  public async viderContexteActif(idUtilisateur: string): Promise<ContexteActifOutput> {
    const contexte = await this.obtenirOuCreerContexte(idUtilisateur);
    contexte.viderContexte();
    await this.depotContexteActifAuth.sauvegarder(contexte);
    return ContexteActifMapper.depuisDomaine(contexte);
  }

  // Cette methode change l'organisation active apres verification de la portee.
  public async changerOrganisationActive(idUtilisateur: string, organisationActiveId: string): Promise<ContexteActifOutput> {
    const contexte = await this.obtenirOuCreerContexte(idUtilisateur);
    const autorise = await this.securityAuthorizationPort.verifierAccesOrganisation(idUtilisateur, organisationActiveId);
    if (!autorise) {
      throw new OrganisationActiveRefuseeApplicationException();
    }

    this.moteurContexteActif.changerOrganisationActive(contexte, organisationActiveId, [organisationActiveId]);
    await this.tenantContextPort.verifierContexteActif({ organisationActiveId });
    await this.depotContexteActifAuth.sauvegarder(contexte);
    return ContexteActifMapper.depuisDomaine(contexte);
  }

  // Cette methode change l'ecole active apres verification de la portee et de la coherence tenant.
  public async changerEcoleActive(idUtilisateur: string, ecoleActiveId: string): Promise<ContexteActifOutput> {
    const contexte = await this.obtenirOuCreerContexte(idUtilisateur);
    const autorise = await this.securityAuthorizationPort.verifierAccesEcole(idUtilisateur, ecoleActiveId);
    if (!autorise) {
      throw new EcoleActiveRefuseeApplicationException();
    }

    const coherenceTenant = await this.tenantContextPort.verifierCoherenceTenant({
      organisationActiveId: contexte.obtenirOrganisationActiveId(),
      ecoleActiveId,
    });
    if (!coherenceTenant) {
      throw new ContexteActifInvalideApplicationException();
    }

    this.moteurContexteActif.changerEcoleActive(contexte, ecoleActiveId, [ecoleActiveId], true);
    await this.tenantContextPort.verifierContexteActif({
      organisationActiveId: contexte.obtenirOrganisationActiveId(),
      ecoleActiveId,
    });
    await this.depotContexteActifAuth.sauvegarder(contexte);
    return ContexteActifMapper.depuisDomaine(contexte);
  }

  private async obtenirOuCreerContexte(idUtilisateur: string): Promise<ContexteActifAuth> {
    const existant = await this.depotContexteActifAuth.trouverContexteUtilisateur(idUtilisateur);
    if (existant) {
      return existant;
    }

    const contexte = ContexteActifAuth.creer(idUtilisateur);
    await this.depotContexteActifAuth.sauvegarder(contexte);
    return contexte;
  }
}
