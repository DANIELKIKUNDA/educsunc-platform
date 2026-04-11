import { ValidationError } from '../../../../../../shared/exceptions/ValidationError';
import { ReferentielProgramme } from '../../../../domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../../../../domain/aggregates/VersionReferentielProgramme';
import { LigneReferentielProgramme } from '../../../../domain/entities/LigneReferentielProgramme';
import { LigneReferentielProgrammeId } from '../../../../domain/value-objects/LigneReferentielProgrammeId';
import {
  ReferentielProgrammeId,
} from '../../../../domain/value-objects/ReferentielProgrammeId';
import { ClasseAcademiqueId } from '../../../../domain/value-objects/ClasseAcademiqueId';
import { ReferentielCoursId } from '../../../../domain/value-objects/ReferentielCoursId';
import { SourceLigneProgramme } from '../../../../domain/value-objects/SourceLigneProgramme';
import { SourceReferentiel } from '../../../../domain/value-objects/SourceReferentiel';
import { TypeStructureEvaluation } from '../../../../domain/value-objects/TypeStructureEvaluation';
import {
  VersionReferentielProgrammeId,
} from '../../../../domain/value-objects/VersionReferentielProgrammeId';
import {
  BaseMapperPostgresReferentielAcademique,
  ValeurDatePostgres,
} from './BaseMapperPostgresReferentielAcademique';

// Cette interface represente une ligne PostgreSQL de la table versions_referentiel_programme.
export interface PersistanceVersionReferentielProgrammePostgres {
  id: string;
  id_referentiel_programme: string;
  code_version: string;
  annee_reference: string;
  date_publication: ValeurDatePostgres;
  motif_publication?: string | null;
  active: boolean;
  publiee: boolean;
  source_import: SourceReferentiel;
  cree_le: ValeurDatePostgres;
}

// Ce mapper traduit une version officielle de referentiel entre domaine et persistance.
export class MapperVersionReferentielProgrammePostgres
  extends BaseMapperPostgresReferentielAcademique
{
  // Cette methode reconstruit un agregat VersionReferentielProgramme depuis une ligne PostgreSQL.
  public static depuisPersistance(
    ligne: PersistanceVersionReferentielProgrammePostgres,
  ): VersionReferentielProgramme {
    return new VersionReferentielProgramme(
      new VersionReferentielProgrammeId(ligne.id),
      ligne.code_version,
      ligne.annee_reference,
      this.versDate(ligne.date_publication, 'date_publication'),
      ligne.source_import,
      ligne.motif_publication ?? undefined,
      ligne.active,
      this.versDate(ligne.cree_le, 'cree_le'),
      [],
      ligne.publiee,
    );
  }

  // Cette methode reconstruit une version officielle et ses lignes dependantes.
  public static depuisPersistanceAvecLignes(
    ligne: PersistanceVersionReferentielProgrammePostgres,
    lignes: readonly PersistanceLigneReferentielProgrammePostgres[],
  ): VersionReferentielProgramme {
    return new VersionReferentielProgramme(
      new VersionReferentielProgrammeId(ligne.id),
      ligne.code_version,
      ligne.annee_reference,
      this.versDate(ligne.date_publication, 'date_publication'),
      ligne.source_import,
      ligne.motif_publication ?? undefined,
      ligne.active,
      this.versDate(ligne.cree_le, 'cree_le'),
      lignes.map((ligneProgramme) => (
        MapperLigneReferentielProgrammePostgres.depuisPersistance(ligneProgramme)
      )),
      ligne.publiee,
    );
  }

  // Cette methode serialise un agregat VersionReferentielProgramme vers une ligne PostgreSQL.
  public static versPersistance(
    versionReferentielProgramme: VersionReferentielProgramme,
    idReferentielProgramme: string,
  ): PersistanceVersionReferentielProgrammePostgres {
    if (idReferentielProgramme.trim().length === 0) {
      throw new ValidationError(
        "L'identifiant du referentiel programme est obligatoire pour la persistance d'une version.",
        'MAPPING_POSTGRES_VERSION_REFERENTIEL_PROGRAMME_PARENT_ABSENT',
      );
    }

    return {
      id: versionReferentielProgramme.obtenirId().obtenirValeur(),
      id_referentiel_programme: idReferentielProgramme,
      code_version: versionReferentielProgramme.obtenirCodeVersion(),
      annee_reference: versionReferentielProgramme.obtenirAnneeReference(),
      date_publication: this.versDatePersistance(
        versionReferentielProgramme.obtenirDatePublication(),
      ),
      motif_publication: versionReferentielProgramme.obtenirMotifPublication() ?? null,
      active: versionReferentielProgramme.estActive(),
      publiee: versionReferentielProgramme.estPubliee(),
      source_import: versionReferentielProgramme.obtenirSourceImport(),
      cree_le: this.versDatePersistance(versionReferentielProgramme.obtenirCreeLe()),
    };
  }
}

// Cette interface represente une ligne PostgreSQL de la table lignes_referentiel_programme.
export interface PersistanceLigneReferentielProgrammePostgres {
  id: string;
  id_version_referentiel_programme: string;
  id_referentiel_cours: string;
  ordre_affichage: number;
  obligatoire: boolean;
  a_examen: boolean;
  est_calculable: boolean;
  source_ligne: SourceLigneProgramme;
  ponderation: {
    maxP1: number;
    maxP2: number;
    maxEX1: number;
    maxP3: number;
    maxP4: number;
    maxEX2: number;
    maxP5: number;
    maxP6: number;
    maxEX3: number;
  };
}

// Ce mapper traduit une ligne officielle de programme entre domaine et persistance.
export class MapperLigneReferentielProgrammePostgres
  extends BaseMapperPostgresReferentielAcademique
{
  // Cette methode reconstruit une LigneReferentielProgramme depuis une ligne PostgreSQL.
  public static depuisPersistance(
    ligne: PersistanceLigneReferentielProgrammePostgres,
  ): LigneReferentielProgramme {
    return new LigneReferentielProgramme(
      new LigneReferentielProgrammeId(ligne.id),
      new ReferentielCoursId(ligne.id_referentiel_cours),
      ligne.ordre_affichage,
      ligne.obligatoire,
      ligne.a_examen,
      ligne.est_calculable,
      ligne.source_ligne,
      this.versPonderationEvaluation(ligne.ponderation),
    );
  }

  // Cette methode serialise une LigneReferentielProgramme vers une ligne PostgreSQL.
  public static versPersistance(
    ligneReferentielProgramme: LigneReferentielProgramme,
    idVersionReferentielProgramme: string,
  ): PersistanceLigneReferentielProgrammePostgres {
    if (idVersionReferentielProgramme.trim().length === 0) {
      throw new ValidationError(
        "L'identifiant de version officielle est obligatoire pour persister une ligne de referentiel.",
        'MAPPING_POSTGRES_LIGNE_REFERENTIEL_VERSION_ABSENTE',
      );
    }

    return {
      id: ligneReferentielProgramme.obtenirId().obtenirValeur(),
      id_version_referentiel_programme: idVersionReferentielProgramme,
      id_referentiel_cours: ligneReferentielProgramme.obtenirReferentielCoursId().obtenirValeur(),
      ordre_affichage: ligneReferentielProgramme.obtenirOrdreAffichage(),
      obligatoire: ligneReferentielProgramme.estObligatoire(),
      a_examen: ligneReferentielProgramme.aExamenAssocie(),
      est_calculable: ligneReferentielProgramme.estCalculableDansProgramme(),
      source_ligne: ligneReferentielProgramme.obtenirSourceLigne(),
      ponderation: this.versPonderationPersistance(ligneReferentielProgramme.obtenirPonderation()),
    };
  }
}

// Cette interface represente une ligne PostgreSQL de la table referentiels_programmes.
export interface PersistanceReferentielProgrammePostgres {
  id: string;
  id_classe_academique: string;
  type_structure_evaluation: TypeStructureEvaluation;
  actif: boolean;
  cree_le: ValeurDatePostgres;
  version: number;
}

// Ce mapper traduit un referentiel programme entre domaine et persistance PostgreSQL.
export class MapperReferentielProgrammePostgres
  extends BaseMapperPostgresReferentielAcademique
{
  // Cette methode reconstruit un agregat ReferentielProgramme depuis une ligne parent et ses lignes officielles.
  public static depuisPersistance(
    ligne: PersistanceReferentielProgrammePostgres,
    versions: readonly VersionReferentielProgramme[],
  ): ReferentielProgramme {
    return new ReferentielProgramme(
      new ReferentielProgrammeId(ligne.id),
      new ClasseAcademiqueId(ligne.id_classe_academique),
      ligne.type_structure_evaluation,
      ligne.actif,
      this.versDate(ligne.cree_le, 'cree_le'),
      ligne.version,
      [...versions],
    );
  }

  // Cette methode serialise un agregat ReferentielProgramme vers sa ligne parent PostgreSQL.
  public static versPersistance(
    referentielProgramme: ReferentielProgramme,
  ): PersistanceReferentielProgrammePostgres {
    return {
      id: referentielProgramme.obtenirId().obtenirValeur(),
      id_classe_academique: referentielProgramme.obtenirClasseAcademiqueId().obtenirValeur(),
      type_structure_evaluation: referentielProgramme.obtenirTypeStructureEvaluation(),
      actif: referentielProgramme.estActif(),
      cree_le: this.versDatePersistance(referentielProgramme.obtenirCreeLe()),
      version: referentielProgramme.obtenirVersion(),
    };
  }

  // Cette methode serialise les lignes officielles d'une version choisie.
  public static versLignesPersistance(
    versionReferentielProgramme: VersionReferentielProgramme,
  ): PersistanceLigneReferentielProgrammePostgres[] {
    const idVersionReferentielProgramme = versionReferentielProgramme.obtenirId().obtenirValeur();

    return versionReferentielProgramme.obtenirLignes().map((ligne) => (
      MapperLigneReferentielProgrammePostgres.versPersistance(
        ligne,
        idVersionReferentielProgramme,
      )
    ));
  }
}
