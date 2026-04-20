import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurMigrationReferentielInvalide } from '../../../domain/exceptions/ErreurMigrationReferentielInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { ProgrammeNiveauId } from '../../../domain/value-objects/ProgrammeNiveauId';
import { ListerMigrationsReferentielParProgrammeNiveauEntree } from '../../dto/input/ListerMigrationsReferentielParProgrammeNiveauEntree';
import { ListerMigrationsReferentielParProgrammeNiveauSortie } from '../../dto/output/ListerMigrationsReferentielParProgrammeNiveauSortie';
import { MigrationReferentielProgrammeApplicationMapper } from '../../mappers/MigrationReferentielProgrammeApplicationMapper';

// Ce cas d'usage liste les migrations rattachees a un programme niveau.
export class ListerMigrationsReferentielParProgrammeNiveau
  implements
    UseCase<
      ListerMigrationsReferentielParProgrammeNiveauEntree,
      ListerMigrationsReferentielParProgrammeNiveauSortie
    >
{
  private readonly depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte le depot de migrations et la policy de pagination.
  constructor(
    depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotMigrationReferentielProgramme = depotMigrationReferentielProgramme;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne les migrations connues pour le programme niveau cible.
  public async executer(
    entree: ListerMigrationsReferentielParProgrammeNiveauEntree,
  ): Promise<ListerMigrationsReferentielParProgrammeNiveauSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const resultat = await this.depotMigrationReferentielProgramme.listerParProgrammeNiveau(
      new ProgrammeNiveauId(entreeValidee.idProgrammeNiveau),
      {
        page: entreeValidee.page,
        taillePage: entreeValidee.taillePage,
      },
    );

    return {
      migrationsReferentielProgramme: resultat.donnees.map((migration) =>
        MigrationReferentielProgrammeApplicationMapper.versSortie(migration)
      ),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(
    entree: ListerMigrationsReferentielParProgrammeNiveauEntree,
  ): ListerMigrationsReferentielParProgrammeNiveauEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurMigrationReferentielInvalide(
        "L'entree de listage des migrations est obligatoire.",
      );
    }

    return {
      idProgrammeNiveau: this.validerTexteObligatoire(
        entree.idProgrammeNiveau,
        'idProgrammeNiveau',
      ),
      page: this.validerEntierPositif(entree.page, 'page'),
      taillePage: this.validerEntierPositif(entree.taillePage, 'taillePage'),
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

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurMigrationReferentielInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
