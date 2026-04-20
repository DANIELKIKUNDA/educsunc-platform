import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type {
  ReponseListeMigrationsReferentiel,
  ReponseMigrationReferentiel,
  ReponseRapportMigrationReferentiel,
} from '../../commun/types/migrations-referentiel.types';

export interface ParametresAnalyseMigrationReferentiel {
  idEcole: string;
  idProgrammeNiveau: string;
  idAncienneVersionReferentiel: string;
  idNouvelleVersionReferentiel: string;
  declenchePar: string;
}

export interface ParametresListeMigrationsReferentiel {
  idProgrammeNiveau: string;
  page: number;
  taillePage: number;
}

export interface ParametresApplicationMigrationReferentiel {
  idEcole: string;
  idMigrationReferentielProgramme: string;
  appliquePar: string;
}

export interface ParametresAnnulationMigrationReferentiel {
  idMigrationReferentielProgramme: string;
  annulePar: string;
}

export interface ParametresRelanceRecalculMigrationReferentiel {
  idMigrationReferentielProgramme: string;
  relancePar: string;
}

export const migrationsReferentielApi = {
  lister(
    parametres: ParametresListeMigrationsReferentiel,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseListeMigrationsReferentiel> {
    const query = new URLSearchParams({
      idProgrammeNiveau: parametres.idProgrammeNiveau,
      page: parametres.page.toString(),
      taillePage: parametres.taillePage.toString(),
    });

    return referentielApi.obtenir<ReponseListeMigrationsReferentiel>(
      `/api/migrations-referentiel?${query.toString()}`,
      options,
    );
  },

  analyser(
    parametres: ParametresAnalyseMigrationReferentiel,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseRapportMigrationReferentiel> {
    return referentielApi.envoyer<ParametresAnalyseMigrationReferentiel, ReponseRapportMigrationReferentiel>(
      '/api/migrations-referentiel/analyser',
      parametres,
      options,
    );
  },

  appliquer(
    parametres: ParametresApplicationMigrationReferentiel,
    options?: OptionsRequeteReferentiel,
  ): Promise<{
    donnee: {
      migrationReferentielProgramme: ReponseMigrationReferentiel['donnee'];
      programmeNiveau: unknown;
    };
  }> {
    return referentielApi.envoyer<ParametresApplicationMigrationReferentiel, {
      donnee: {
        migrationReferentielProgramme: ReponseMigrationReferentiel['donnee'];
        programmeNiveau: unknown;
      };
    }>(
      '/api/migrations-referentiel/appliquer',
      parametres,
      options,
    );
  },

  annuler(
    parametres: ParametresAnnulationMigrationReferentiel,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseMigrationReferentiel> {
    return referentielApi.envoyer<Pick<ParametresAnnulationMigrationReferentiel, 'annulePar'>, ReponseMigrationReferentiel>(
      `/api/migrations-referentiel/${parametres.idMigrationReferentielProgramme}/annuler`,
      { annulePar: parametres.annulePar },
      options,
    );
  },

  relancerRecalcul(
    parametres: ParametresRelanceRecalculMigrationReferentiel,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseMigrationReferentiel> {
    return referentielApi.envoyer<
      Pick<ParametresRelanceRecalculMigrationReferentiel, 'relancePar'>,
      ReponseMigrationReferentiel
    >(
      `/api/migrations-referentiel/${parametres.idMigrationReferentielProgramme}/relancer-recalcul`,
      { relancePar: parametres.relancePar },
      options,
    );
  },

  consulter(
    idMigrationReferentielProgramme: string,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseRapportMigrationReferentiel> {
    return referentielApi.obtenir<ReponseRapportMigrationReferentiel>(
      `/api/migrations-referentiel/${idMigrationReferentielProgramme}`,
      options,
    );
  },
};
