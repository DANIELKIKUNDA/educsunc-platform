import {
  DeterminerFenetreCalendrier,
  type SortieDeterminerFenetreCalendrier,
} from '../../contexts/referentiel-academique/application/use-cases/calendriers/DeterminerFenetreCalendrier';
import {
  DepotCalendrierAcademiquePostgres,
  creerInfrastructurePostgresReferentielAcademique,
} from '../../contexts/referentiel-academique/infrastructure/persistence/postgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../contexts/referentiel-academique/infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';
import type {
  FenetreEncodageCalendrierPort,
  FenetreEncodageCalendrierReadModel,
} from '../../contexts/bulletins-evaluations/application/ports/out/FenetreEncodageCalendrierPort';
import type { CodeColonneBulletin } from '../../contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { ContexteTenant } from '../../shared/tenancy/TenantContext';

// Cet adaptateur relit le calendrier academique pour exposer au BC bulletins la fenetre temporelle exploitable.
export class FenetreEncodageCalendrierAdapter implements FenetreEncodageCalendrierPort {
  private readonly contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  private readonly infrastructure = creerInfrastructurePostgresReferentielAcademique(
    undefined,
    undefined,
    this.contexteExecutionTenant,
  );
  private readonly determinerFenetreCalendrier = new DeterminerFenetreCalendrier(
    new DepotCalendrierAcademiquePostgres(
      this.infrastructure.clientLecture,
      this.infrastructure.uniteDeTravail,
      this.contexteExecutionTenant,
    ),
  );
  private estFerme = false;

  public async determinerFenetreEncodage(params: {
    idEcole: string;
    idAnneeScolaire: string;
    codeColonne: CodeColonneBulletin;
    dateReference: Date;
  }): Promise<FenetreEncodageCalendrierReadModel | null> {
    void params.codeColonne;

    const contexteTenant = new ContexteTenant();
    contexteTenant.definirTenant(params.idEcole);

    const sortie: SortieDeterminerFenetreCalendrier =
      await this.contexteExecutionTenant.executerAvecContexte(contexteTenant, () =>
        this.determinerFenetreCalendrier.executer({
          idEcole: params.idEcole,
          idAnneeScolaire: params.idAnneeScolaire,
          dateReference: params.dateReference,
        }));

    if (sortie.fenetreCalendrier === null) {
      return null;
    }

    return {
      idCalendrierAcademique: sortie.fenetreCalendrier.idCalendrierAcademique,
      idEcole: sortie.fenetreCalendrier.idEcole,
      idAnneeScolaire: sortie.fenetreCalendrier.idAnneeScolaire,
      verrouille: sortie.fenetreCalendrier.verrouille,
      dateReference: sortie.fenetreCalendrier.dateReference,
      periodeCouranteCode: sortie.fenetreCalendrier.periodeCourante?.code ?? null,
      examenCourantCode: sortie.fenetreCalendrier.examenCourant?.code ?? null,
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
