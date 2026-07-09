import { ValidationError } from '../../../../../shared/exceptions/ValidationError';
import { ReferentielProgramme } from '../../../domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../../../domain/aggregates/VersionReferentielProgramme';
import { ErreurMigrationImpossible } from '../../../domain/exceptions/ErreurMigrationImpossible';
import { ErreurVersionReferentielInvalide } from '../../../domain/exceptions/ErreurVersionReferentielInvalide';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { VersionReferentielProgrammeId } from '../../../domain/value-objects/VersionReferentielProgrammeId';

export interface ContexteEditionVersionReferentiel {
  referentielProgramme: ReferentielProgramme;
  versionReferentielProgramme: VersionReferentielProgramme;
  idVersionReferentielProgramme: VersionReferentielProgrammeId;
}

// Ce support centralise le chargement et les verrous applicatifs communs a l'edition des versions de travail.
export class SupportEditionVersionReferentiel {
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly depotMigrationReferentielProgramme?: DepotMigrationReferentielProgramme;

  constructor(
    depotReferentielProgramme: DepotReferentielProgramme,
    depotMigrationReferentielProgramme?: DepotMigrationReferentielProgramme,
  ) {
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.depotMigrationReferentielProgramme = depotMigrationReferentielProgramme;
  }

  public async chargerVersionEditable(
    idVersionReferentielProgrammeTexte: string,
  ): Promise<ContexteEditionVersionReferentiel> {
    const idVersionReferentielProgramme = this.validerTexteIdentifiant(
      idVersionReferentielProgrammeTexte,
      'idVersionReferentielProgramme',
    );
    const referentielProgramme = await this.depotReferentielProgramme.trouverParIdVersion(
      idVersionReferentielProgramme,
    );

    if (referentielProgramme === null) {
      throw new ErreurVersionReferentielInvalide(
        "La version de referentiel demandee est introuvable.",
      );
    }

    const versionReferentielProgramme = referentielProgramme.trouverVersionParId(
      idVersionReferentielProgramme,
    );

    if (versionReferentielProgramme === null) {
      throw new ErreurVersionReferentielInvalide(
        "La version de referentiel demandee n'appartient a aucun referentiel charge.",
      );
    }

    if (
      this.depotMigrationReferentielProgramme !== undefined
      && await this.depotMigrationReferentielProgramme.estVersionEngagee(idVersionReferentielProgramme)
    ) {
      throw new ErreurMigrationImpossible(
        'Cette version a deja ete engagee dans une migration et ne peut plus etre modifiee.',
      );
    }

    return {
      referentielProgramme,
      versionReferentielProgramme,
      idVersionReferentielProgramme,
    };
  }

  public convertirErreurEdition(erreur: unknown): Error {
    if (erreur instanceof ErreurVersionReferentielInvalide || erreur instanceof ErreurMigrationImpossible) {
      return erreur;
    }

    if (erreur instanceof ValidationError) {
      return new ErreurVersionReferentielInvalide(erreur.message);
    }

    if (erreur instanceof Error) {
      return new ErreurVersionReferentielInvalide(erreur.message);
    }

    return new ErreurVersionReferentielInvalide(
      "La mutation de la version de referentiel a echoue.",
    );
  }

  public validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurVersionReferentielInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurVersionReferentielInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  public validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw new ErreurVersionReferentielInvalide(
        'Une valeur textuelle optionnelle doit etre une chaine de caracteres.',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  public validerTexteIdentifiant(valeur: string, nomChamp: string): VersionReferentielProgrammeId {
    return new VersionReferentielProgrammeId(this.validerTexteObligatoire(valeur, nomChamp));
  }
}
