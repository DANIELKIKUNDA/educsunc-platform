import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurMigrationReferentielInvalide } from '../../../domain/exceptions/ErreurMigrationReferentielInvalide';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { MigrationReferentielProgrammeId } from '../../../domain/value-objects/MigrationReferentielProgrammeId';
import { ConsulterRapportMigrationEntree } from '../../dto/input/ConsulterRapportMigrationEntree';
import { RapportMigrationSortie } from '../../dto/output/RapportMigrationSortie';
import { MigrationReferentielProgrammeApplicationMapper } from '../../mappers/MigrationReferentielProgrammeApplicationMapper';

// Cette interface represente la sortie du cas d'usage ConsulterRapportMigration.
export interface SortieConsulterRapportMigration {
  rapportMigration: RapportMigrationSortie;
}

// Ce cas d'usage orchestre la consultation du rapport d'une migration.
export class ConsulterRapportMigration
  implements UseCase<ConsulterRapportMigrationEntree, SortieConsulterRapportMigration>
{
  private readonly depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme;

  // Ce constructeur injecte les dependances applicatives necessaires a la consultation du rapport de migration.
  constructor(depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme) {
    this.depotMigrationReferentielProgramme = depotMigrationReferentielProgramme;
  }

  // Cette methode consulte un rapport complet de migration a partir de son identifiant.
  public async executer(
    entree: ConsulterRapportMigrationEntree,
  ): Promise<SortieConsulterRapportMigration> {
    const entreeValidee = this.validerEntree(entree);
    const migrationReferentielProgramme = await this.depotMigrationReferentielProgramme.trouverParId(
      new MigrationReferentielProgrammeId(entreeValidee.idMigrationReferentielProgramme),
    );

    if (migrationReferentielProgramme === null) {
      throw new ErreurMigrationReferentielInvalide(
        'Le rapport de migration demande est introuvable.',
      );
    }

    return {
      rapportMigration: {
        migrationReferentielProgramme: MigrationReferentielProgrammeApplicationMapper.versSortie(
          migrationReferentielProgramme,
        ),
        totalDifferences: migrationReferentielProgramme.obtenirLignesDiffMigration().length,
        totalTransformationsNotes: migrationReferentielProgramme.obtenirTransformationsNotes().length,
      },
    };
  }

  private validerEntree(
    entree: ConsulterRapportMigrationEntree,
  ): ConsulterRapportMigrationEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurMigrationReferentielInvalide(
        "L'entree du cas d'usage ConsulterRapportMigration est obligatoire.",
      );
    }

    return {
      idMigrationReferentielProgramme: this.validerTexteObligatoire(
        entree.idMigrationReferentielProgramme,
        'idMigrationReferentielProgramme',
      ),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurMigrationReferentielInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurMigrationReferentielInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
