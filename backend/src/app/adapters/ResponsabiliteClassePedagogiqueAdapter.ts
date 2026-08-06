import {
  DepotClasseAcademiquePostgres,
  DepotResponsabiliteClassePedagogiquePostgres,
  DepotSectionScolairePostgres,
  creerInfrastructurePostgresReferentielAcademique,
} from '../../contexts/referentiel-academique/infrastructure/persistence/postgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../contexts/referentiel-academique/infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';
import { AnneeScolaireId } from '../../contexts/referentiel-academique/domain/value-objects/AnneeScolaireId';
import { ClassePedagogiqueId } from '../../contexts/referentiel-academique/domain/value-objects/ClassePedagogiqueId';
import type { ResponsabiliteClassePedagogique } from '../../contexts/referentiel-academique/domain/aggregates/ResponsabiliteClassePedagogique';
import type { ResponsabiliteClassePedagogiquePort } from '../../shared/security/application/ports/ResponsabiliteClassePedagogiquePort';
import type { ResponsabiliteClassePedagogiqueReadModel } from '../../shared/security/application/read-models/ResponsabiliteClassePedagogiqueReadModel';
import { ContexteTenant } from '../../shared/tenancy/TenantContext';

// Cet adaptateur de composition lit la verite primaire du responsable de classe depuis le BC referentiel academique.
export class ResponsabiliteClassePedagogiqueAdapter
  implements ResponsabiliteClassePedagogiquePort
{
  private readonly contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  private readonly infrastructure = creerInfrastructurePostgresReferentielAcademique(
    undefined,
    undefined,
    this.contexteExecutionTenant,
  );
  private readonly depotResponsabiliteClassePedagogique =
    new DepotResponsabiliteClassePedagogiquePostgres(
      this.infrastructure.clientLecture,
      this.infrastructure.uniteDeTravail,
      this.contexteExecutionTenant,
    );
  private readonly depotClasseAcademique = new DepotClasseAcademiquePostgres(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
    this.contexteExecutionTenant,
  );
  private readonly depotSectionScolaire = new DepotSectionScolairePostgres(
    this.infrastructure.clientLecture,
    this.infrastructure.uniteDeTravail,
    this.contexteExecutionTenant,
  );
  private estFerme = false;

  public async consulterActiveParClasseEtAnnee(params: {
    idOrganisation?: string;
    idEcole?: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<ResponsabiliteClassePedagogiqueReadModel | null> {
    if (!params.idEcole) {
      return null;
    }

    const contexteTenant = new ContexteTenant();
    contexteTenant.definirTenant(params.idEcole);

    if (params.idOrganisation) {
      contexteTenant.definirOrganisation(params.idOrganisation);
    }

    return this.contexteExecutionTenant.executerAvecContexte(contexteTenant, async () => {
      const responsabilite =
        await this.depotResponsabiliteClassePedagogique.trouverActiveParClasseEtAnnee(
          new ClassePedagogiqueId(params.idClassePedagogique),
          new AnneeScolaireId(params.idAnneeScolaire),
        );

      if (responsabilite === null) {
        return null;
      }

      return this.versReadModel(responsabilite);
    });
  }

  public async listerActivesParUtilisateur(params: {
    idOrganisation?: string;
    idEcole: string;
    idUtilisateur: string;
  }): Promise<readonly ResponsabiliteClassePedagogiqueReadModel[]> {
    const contexteTenant = new ContexteTenant();
    contexteTenant.definirTenant(params.idEcole);
    if (params.idOrganisation) {
      contexteTenant.definirOrganisation(params.idOrganisation);
    }

    return this.contexteExecutionTenant.executerAvecContexte(contexteTenant, async () => {
      const responsabilites =
        await this.depotResponsabiliteClassePedagogique.listerActivesParUtilisateur(
          params.idUtilisateur,
        );
      const projections = await Promise.all(
        responsabilites.map((responsabilite) => this.versReadModel(responsabilite)),
      );
      return projections.filter(
        (projection): projection is ResponsabiliteClassePedagogiqueReadModel =>
          projection !== null,
      );
    });
  }

  private async versReadModel(
    responsabilite: ResponsabiliteClassePedagogique | null,
  ): Promise<ResponsabiliteClassePedagogiqueReadModel | null> {
    if (responsabilite === null) {
      return null;
    }

    const [classeAcademique, sectionScolaire] = await Promise.all([
      this.depotClasseAcademique.trouverParId(
        responsabilite.obtenirIdClasseAcademique(),
      ),
      this.depotSectionScolaire.trouverParId(
        responsabilite.obtenirIdSectionScolaire(),
      ),
    ]);
    if (classeAcademique === null || sectionScolaire === null) {
      return null;
    }

    return {
      idOrganisation: responsabilite.obtenirIdOrganisation().obtenirValeur(),
      idEcole: responsabilite.obtenirIdEcole().obtenirValeur(),
      idClassePedagogique: responsabilite.obtenirIdClassePedagogique().obtenirValeur(),
      idClasseAcademique: classeAcademique.obtenirId().obtenirValeur(),
      idSectionScolaire: sectionScolaire.obtenirId().obtenirValeur(),
      sectionCode: sectionScolaire.obtenirCode(),
      sectionLibelle: sectionScolaire.obtenirLibelle(),
      idAnneeScolaire: responsabilite.obtenirIdAnneeScolaire().obtenirValeur(),
      idUtilisateurEnseignant: responsabilite.obtenirIdUtilisateurEnseignant(),
      active: responsabilite.estActive(),
    };
  }

  public async fermer(): Promise<void> {
    if (this.estFerme) {
      return;
    }

    this.estFerme = true;
    await this.infrastructure.pool.end();
  }
}
