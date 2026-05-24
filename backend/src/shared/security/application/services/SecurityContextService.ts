import { ContexteActifUtilisateur, MoteurScope, PolicyIsolationTenant } from '../../../security/domain';
import { ContexteActifMapper } from '../mappers';
import type { ChangerEcoleActiveInput, ChangerOrganisationActiveInput } from '../dto/input';
import type { ContexteActifOutput } from '../dto/output';
import type {
  AuditSecurityPort,
  ContexteActifRepositoryPort,
  SessionContextPort,
  TenantValidationPort,
} from '../ports';
import { ErreurChangementContexteActif, ErreurContexteInvalide } from '../exceptions';

// Ce service gere le contexte actif exploite par les decisions de securite.
export class SecurityContextService {
  constructor(
    private readonly contexteActifRepositoryPort: ContexteActifRepositoryPort,
    private readonly tenantValidationPort: TenantValidationPort,
    private readonly sessionContextPort: SessionContextPort,
    private readonly moteurScope: MoteurScope,
    private readonly auditSecurityPort?: AuditSecurityPort,
  ) {}

  public async obtenirContexteActif(idUtilisateur: string): Promise<ContexteActifOutput> {
    const contexte = await this.contexteActifRepositoryPort.trouverParUtilisateur(idUtilisateur);
    if (!contexte) {
      throw new ErreurContexteInvalide();
    }
    return ContexteActifMapper.depuisDomaine(contexte);
  }

  public async changerOrganisationActive(
    input: ChangerOrganisationActiveInput,
  ): Promise<ContexteActifOutput> {
    try {
      const contexte = await this.obtenirOuCreerContexte(input.idUtilisateur);
      if (input.idOrganisationActive) {
        const organisationValide = await this.tenantValidationPort.verifierOrganisation(
          input.idOrganisationActive,
        );
        this.moteurScope.verifierOrganisation(
          organisationValide ? [input.idOrganisationActive] : [],
          input.idOrganisationActive,
        );
      }
      contexte.changerOrganisation(input.idOrganisationActive);
      await this.contexteActifRepositoryPort.sauvegarder(contexte);
      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_SCOPE_CHANGED',
        idUtilisateur: input.idUtilisateur,
        succes: true,
        details: {
          organisationActiveId: input.idOrganisationActive,
          ecoleActiveId: contexte.obtenirIdEcoleActive(),
        },
      });
      return ContexteActifMapper.depuisDomaine(contexte);
    } catch (error) {
      throw new ErreurChangementContexteActif(
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  public async changerEcoleActive(input: ChangerEcoleActiveInput): Promise<ContexteActifOutput> {
    try {
      const contexte = await this.obtenirOuCreerContexte(input.idUtilisateur);
      const contexteSession = await this.sessionContextPort.obtenirUtilisateurAuthentifie();
      const idOrganisationActive =
        contexte.obtenirIdOrganisationActive() ?? contexteSession?.organisationActiveId;

      if (input.idEcoleActive) {
        const ecoleValide = await this.tenantValidationPort.verifierEcole(input.idEcoleActive);
        const coherence = idOrganisationActive
          ? await this.tenantValidationPort.verifierAppartenanceEcoleOrganisation(
              input.idEcoleActive,
              idOrganisationActive,
            )
          : false;
        this.moteurScope.verifierEcole(
          ecoleValide ? [input.idEcoleActive] : [],
          input.idEcoleActive,
        );
        PolicyIsolationTenant.verifier(idOrganisationActive, input.idEcoleActive, coherence);
      }

      if (idOrganisationActive && !contexte.obtenirIdOrganisationActive()) {
        contexte.changerOrganisation(idOrganisationActive);
      }

      contexte.changerEcole(input.idEcoleActive, true);
      await this.contexteActifRepositoryPort.sauvegarder(contexte);
      await this.auditSecurityPort?.journaliser({
        action: 'SECURITY_SCOPE_CHANGED',
        idUtilisateur: input.idUtilisateur,
        succes: true,
        details: {
          organisationActiveId: contexte.obtenirIdOrganisationActive(),
          ecoleActiveId: input.idEcoleActive,
        },
      });
      return ContexteActifMapper.depuisDomaine(contexte);
    } catch (error) {
      throw new ErreurChangementContexteActif(
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  private async obtenirOuCreerContexte(idUtilisateur: string): Promise<ContexteActifUtilisateur> {
    const existant = await this.contexteActifRepositoryPort.trouverParUtilisateur(idUtilisateur);
    if (existant) {
      return existant;
    }

    const contexte = ContexteActifUtilisateur.creer(idUtilisateur);
    await this.contexteActifRepositoryPort.sauvegarder(contexte);
    return contexte;
  }
}
