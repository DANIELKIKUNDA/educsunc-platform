import { AutorisationSocleAcademiqueAdapter } from './AutorisationSocleAcademiqueAdapter';

// Cet adaptateur specialise ACA-09 sans recreer un systeme de permissions parallele.
export class AutorisationMigrationReferentielAdapter {
  constructor(
    private readonly autorisationSocleAcademique: AutorisationSocleAcademiqueAdapter =
      new AutorisationSocleAcademiqueAdapter(),
  ) {}

  public async verifierLectureMigrationReferentiel(params: {
    idUtilisateur: string;
    roleActif?: string;
  }): Promise<void> {
    await this.autorisationSocleAcademique.verifierLectureSocleAcademique(params);
  }

  public async verifierMutationMigrationReferentiel(params: {
    idUtilisateur: string;
    roleActif?: string;
  }): Promise<void> {
    await this.autorisationSocleAcademique.verifierMutationSocleAcademique(params);
  }
}
