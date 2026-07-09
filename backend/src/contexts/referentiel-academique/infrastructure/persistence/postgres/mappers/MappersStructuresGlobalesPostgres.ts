import { ValidationError } from '../../../../../../shared/exceptions/ValidationError';
import { ClasseAcademique } from '../../../../domain/aggregates/ClasseAcademique';
import { Ecole } from '../../../../domain/aggregates/Ecole';
import { OptionEtude } from '../../../../domain/aggregates/OptionEtude';
import { Organisation } from '../../../../domain/aggregates/Organisation';
import { ReferentielCours } from '../../../../domain/aggregates/ReferentielCours';
import { SectionScolaire } from '../../../../domain/aggregates/SectionScolaire';
import { ClasseAcademiqueId } from '../../../../domain/value-objects/ClasseAcademiqueId';
import { CodeOption } from '../../../../domain/value-objects/CodeOption';
import { EcoleId } from '../../../../domain/value-objects/EcoleId';
import { ModeExploitation } from '../../../../domain/value-objects/ModeExploitation';
import { OptionEtudeId } from '../../../../domain/value-objects/OptionEtudeId';
import { OrdreClasse } from '../../../../domain/value-objects/OrdreClasse';
import { OrganisationId } from '../../../../domain/value-objects/OrganisationId';
import { ReferentielCoursId } from '../../../../domain/value-objects/ReferentielCoursId';
import { SectionScolaireId } from '../../../../domain/value-objects/SectionScolaireId';
import { TypeOrganisation } from '../../../../domain/value-objects/TypeOrganisation';
import { TypeStructureEvaluation } from '../../../../domain/value-objects/TypeStructureEvaluation';
import {
  BaseMapperPostgresReferentielAcademique,
  ValeurDatePostgres,
} from './BaseMapperPostgresReferentielAcademique';

// Cette interface represente une ligne PostgreSQL de la table organisations.
export interface PersistanceOrganisationPostgres {
  id: string;
  code: string;
  nom: string;
  type_organisation: TypeOrganisation;
  actif: boolean;
  description?: string | null;
  cree_le: ValeurDatePostgres;
  cree_par?: string | null;
  promoteur_principal_utilisateur_id?: string | null;
  promoteur_principal_nom_complet?: string | null;
  promoteur_principal_email?: string | null;
  promoteur_principal_telephone?: string | null;
  promoteur_principal_identifiant?: string | null;
  modifie_le?: ValeurDatePostgres | null;
  modifie_par?: string | null;
  version: number;
}

// Ce mapper traduit une organisation entre domaine et persistance PostgreSQL.
export class MapperOrganisationPostgres extends BaseMapperPostgresReferentielAcademique {
  // Cette methode reconstruit un agregat Organisation depuis une ligne PostgreSQL.
  public static depuisPersistance(ligne: PersistanceOrganisationPostgres): Organisation {
    return new Organisation(
      new OrganisationId(ligne.id),
      ligne.code,
      ligne.nom,
      ligne.type_organisation,
      ligne.description ?? undefined,
      ligne.cree_par ?? undefined,
      ligne.promoteur_principal_utilisateur_id ?? undefined,
      ligne.promoteur_principal_nom_complet ?? undefined,
      ligne.promoteur_principal_email ?? undefined,
      ligne.promoteur_principal_telephone ?? undefined,
      ligne.promoteur_principal_identifiant ?? undefined,
      ligne.actif,
      this.versDate(ligne.cree_le, 'cree_le'),
      this.versDateOptionnelle(ligne.modifie_le, 'modifie_le'),
      ligne.modifie_par ?? undefined,
      ligne.version,
    );
  }

  // Cette methode serialise un agregat Organisation vers une ligne PostgreSQL.
  public static versPersistance(organisation: Organisation): PersistanceOrganisationPostgres {
    return {
      id: organisation.obtenirId().obtenirValeur(),
      code: organisation.obtenirCode(),
      nom: organisation.obtenirNom(),
      type_organisation: organisation.obtenirTypeOrganisation(),
      actif: organisation.estActif(),
      description: organisation.obtenirDescription() ?? null,
      cree_le: this.versDatePersistance(organisation.obtenirCreeLe()),
      cree_par: organisation.obtenirCreePar() ?? null,
      promoteur_principal_utilisateur_id:
        organisation.obtenirPromoteurPrincipalUtilisateurId() ?? null,
      promoteur_principal_nom_complet:
        organisation.obtenirPromoteurPrincipalNomComplet() ?? null,
      promoteur_principal_email:
        organisation.obtenirPromoteurPrincipalEmail() ?? null,
      promoteur_principal_telephone:
        organisation.obtenirPromoteurPrincipalTelephone() ?? null,
      promoteur_principal_identifiant:
        organisation.obtenirPromoteurPrincipalIdentifiant() ?? null,
      modifie_le: this.versDatePersistanceOptionnelle(organisation.obtenirModifieLe()) ?? null,
      modifie_par: organisation.obtenirModifiePar() ?? null,
      version: organisation.obtenirVersion(),
    };
  }
}

// Cette interface represente une ligne PostgreSQL de la table ecoles.
export interface PersistanceEcolePostgres {
  id: string;
  id_organisation?: string | null;
  code: string;
  nom: string;
  sigle?: string | null;
  mode_exploitation: ModeExploitation;
  actif: boolean;
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
  province_educationnelle?: string | null;
  ville?: string | null;
  commune_ou_territoire?: string | null;
  cree_le: ValeurDatePostgres;
  cree_par?: string | null;
  modifie_le?: ValeurDatePostgres | null;
  modifie_par?: string | null;
  version: number;
}

// Ce mapper traduit une ecole entre domaine et persistance PostgreSQL.
export class MapperEcolePostgres extends BaseMapperPostgresReferentielAcademique {
  // Cette methode reconstruit un agregat Ecole depuis une ligne PostgreSQL.
  public static depuisPersistance(ligne: PersistanceEcolePostgres): Ecole {
    if (ligne.id_organisation === undefined || ligne.id_organisation === null) {
      throw new ValidationError(
        "La persistance d'une ecole doit fournir un identifiant d'organisation.",
        'MAPPING_POSTGRES_ECOLE_ORGANISATION_ABSENTE',
      );
    }

    return new Ecole(
      new EcoleId(ligne.id),
      new OrganisationId(ligne.id_organisation),
      ligne.code,
      ligne.nom,
      ligne.mode_exploitation,
      ligne.sigle ?? undefined,
      ligne.adresse ?? undefined,
      ligne.telephone ?? undefined,
      ligne.email ?? undefined,
      ligne.province_educationnelle ?? undefined,
      ligne.ville ?? undefined,
      ligne.commune_ou_territoire ?? undefined,
      ligne.cree_par ?? undefined,
      ligne.actif,
      this.versDate(ligne.cree_le, 'cree_le'),
      this.versDateOptionnelle(ligne.modifie_le, 'modifie_le'),
      ligne.modifie_par ?? undefined,
      ligne.version,
    );
  }

  // Cette methode serialise un agregat Ecole vers une ligne PostgreSQL.
  public static versPersistance(ecole: Ecole): PersistanceEcolePostgres {
    return {
      id: ecole.obtenirId().obtenirValeur(),
      id_organisation: ecole.obtenirOrganisationId().obtenirValeur(),
      code: ecole.obtenirCode(),
      nom: ecole.obtenirNom(),
      sigle: ecole.obtenirSigle() ?? null,
      mode_exploitation: ecole.obtenirModeExploitation(),
      actif: ecole.estActif(),
      adresse: ecole.obtenirAdresse() ?? null,
      telephone: ecole.obtenirTelephone() ?? null,
      email: ecole.obtenirEmail() ?? null,
      province_educationnelle: ecole.obtenirProvinceEducationnelle() ?? null,
      ville: ecole.obtenirVille() ?? null,
      commune_ou_territoire: ecole.obtenirCommuneOuTerritoire() ?? null,
      cree_le: this.versDatePersistance(ecole.obtenirCreeLe()),
      cree_par: ecole.obtenirCreePar() ?? null,
      modifie_le: this.versDatePersistanceOptionnelle(ecole.obtenirModifieLe()) ?? null,
      modifie_par: ecole.obtenirModifiePar() ?? null,
      version: ecole.obtenirVersion(),
    };
  }
}

// Cette interface represente une ligne PostgreSQL de la table sections_scolaires.
export interface PersistanceSectionScolairePostgres {
  id: string;
  code: string;
  libelle: string;
  ordre_affichage: number;
  active: boolean;
  cree_le: ValeurDatePostgres;
  modifie_le?: ValeurDatePostgres | null;
  version: number;
}

// Ce mapper traduit une section scolaire entre domaine et persistance PostgreSQL.
export class MapperSectionScolairePostgres extends BaseMapperPostgresReferentielAcademique {
  // Cette methode reconstruit un agregat SectionScolaire depuis une ligne PostgreSQL.
  public static depuisPersistance(
    ligne: PersistanceSectionScolairePostgres,
  ): SectionScolaire {
    return new SectionScolaire(
      new SectionScolaireId(ligne.id),
      ligne.code,
      ligne.libelle,
      ligne.ordre_affichage,
      ligne.active,
      this.versDate(ligne.cree_le, 'cree_le'),
      this.versDateOptionnelle(ligne.modifie_le, 'modifie_le'),
      ligne.version,
    );
  }

  // Cette methode serialise un agregat SectionScolaire vers une ligne PostgreSQL.
  public static versPersistance(
    sectionScolaire: SectionScolaire,
  ): PersistanceSectionScolairePostgres {
    return {
      id: sectionScolaire.obtenirId().obtenirValeur(),
      code: sectionScolaire.obtenirCode(),
      libelle: sectionScolaire.obtenirLibelle(),
      ordre_affichage: sectionScolaire.obtenirOrdreAffichage(),
      active: sectionScolaire.estActive(),
      cree_le: this.versDatePersistance(sectionScolaire.obtenirCreeLe()),
      modifie_le:
        this.versDatePersistanceOptionnelle(sectionScolaire.obtenirModifieLe()) ?? null,
      version: sectionScolaire.obtenirVersion(),
    };
  }
}

// Cette interface represente une ligne PostgreSQL de la table options_etudes.
export interface PersistanceOptionEtudePostgres {
  id: string;
  code: number;
  libelle: string;
  type_option?: string | null;
  est_technique: boolean;
  categorie_technique?: 'GROUPE_1' | 'GROUPE_2' | null;
  abreviation?: string | null;
  ordre_affichage?: number | null;
  active: boolean;
  cree_le: ValeurDatePostgres;
  modifie_le?: ValeurDatePostgres | null;
  version: number;
}

// Ce mapper traduit une option d'etude entre domaine et persistance PostgreSQL.
export class MapperOptionEtudePostgres extends BaseMapperPostgresReferentielAcademique {
  // Cette methode reconstruit un agregat OptionEtude depuis une ligne PostgreSQL.
  public static depuisPersistance(ligne: PersistanceOptionEtudePostgres): OptionEtude {
    return new OptionEtude(
      new OptionEtudeId(ligne.id),
      new CodeOption(ligne.code),
      ligne.libelle,
      ligne.type_option ?? undefined,
      ligne.ordre_affichage ?? undefined,
      ligne.abreviation ?? undefined,
      ligne.active,
      this.versDate(ligne.cree_le, 'cree_le'),
      this.versDateOptionnelle(ligne.modifie_le, 'modifie_le'),
      ligne.version,
      ligne.est_technique ?? false,
      ligne.categorie_technique ?? null,
    );
  }

  // Cette methode serialise un agregat OptionEtude vers une ligne PostgreSQL.
  public static versPersistance(optionEtude: OptionEtude): PersistanceOptionEtudePostgres {
    return {
      id: optionEtude.obtenirId().obtenirValeur(),
      code: optionEtude.obtenirCodeNumerique(),
      libelle: optionEtude.obtenirLibelle(),
      type_option: optionEtude.obtenirTypeOption() ?? null,
      est_technique: optionEtude.estTechnique(),
      categorie_technique: optionEtude.obtenirCategorieTechnique(),
      abreviation: optionEtude.obtenirAbreviation() ?? null,
      ordre_affichage: optionEtude.obtenirOrdreAffichage() ?? null,
      active: optionEtude.estActive(),
      cree_le: this.versDatePersistance(optionEtude.obtenirCreeLe()),
      modifie_le: this.versDatePersistanceOptionnelle(optionEtude.obtenirModifieLe()) ?? null,
      version: optionEtude.obtenirVersion(),
    };
  }
}

// Cette interface represente une ligne PostgreSQL de la table classes_academiques.
export interface PersistanceClasseAcademiquePostgres {
  id: string;
  id_section_scolaire: string;
  id_option_etude?: string | null;
  code: string;
  libelle: string;
  ordre_pedagogique: number;
  cycle: string;
  accepte_options: boolean;
  option_obligatoire: boolean;
  type_structure_evaluation: TypeStructureEvaluation;
  est_classe_tenasosp: boolean;
  est_classe_exetat: boolean;
  est_classe_finaliste: boolean;
  active: boolean;
  cree_le: ValeurDatePostgres;
  modifie_le?: ValeurDatePostgres | null;
  version: number;
}

// Ce mapper traduit une classe academique entre domaine et persistance PostgreSQL.
export class MapperClasseAcademiquePostgres extends BaseMapperPostgresReferentielAcademique {
  // Cette methode reconstruit un agregat ClasseAcademique depuis une ligne PostgreSQL.
  public static depuisPersistance(
    ligne: PersistanceClasseAcademiquePostgres,
  ): ClasseAcademique {
    return new ClasseAcademique(
      new ClasseAcademiqueId(ligne.id),
      new SectionScolaireId(ligne.id_section_scolaire),
      ligne.code,
      ligne.libelle,
      new OrdreClasse(ligne.ordre_pedagogique),
      ligne.cycle,
      ligne.accepte_options,
      ligne.option_obligatoire,
      ligne.type_structure_evaluation,
      ligne.id_option_etude === undefined || ligne.id_option_etude === null
        ? undefined
        : new OptionEtudeId(ligne.id_option_etude),
      ligne.active,
      this.versDate(ligne.cree_le, 'cree_le'),
      this.versDateOptionnelle(ligne.modifie_le, 'modifie_le'),
      ligne.version,
      ligne.est_classe_tenasosp ?? false,
      ligne.est_classe_exetat ?? false,
      ligne.est_classe_finaliste ?? false,
    );
  }

  // Cette methode serialise un agregat ClasseAcademique vers une ligne PostgreSQL.
  public static versPersistance(
    classeAcademique: ClasseAcademique,
  ): PersistanceClasseAcademiquePostgres {
    return {
      id: classeAcademique.obtenirId().obtenirValeur(),
      id_section_scolaire: classeAcademique.obtenirSectionScolaireId().obtenirValeur(),
      id_option_etude: classeAcademique.obtenirOptionEtudeId()?.obtenirValeur() ?? null,
      code: classeAcademique.obtenirCode(),
      libelle: classeAcademique.obtenirLibelle(),
      ordre_pedagogique: classeAcademique.obtenirOrdrePedagogiqueNumerique(),
      cycle: classeAcademique.obtenirCycle(),
      accepte_options: classeAcademique.accepteOptionsEtude(),
      option_obligatoire: classeAcademique.estOptionObligatoire(),
      type_structure_evaluation: classeAcademique.obtenirTypeStructureEvaluation(),
      est_classe_tenasosp: classeAcademique.estClasseTENASOSP(),
      est_classe_exetat: classeAcademique.estClasseEXETAT(),
      est_classe_finaliste: classeAcademique.estClasseFinaliste(),
      active: classeAcademique.estActive(),
      cree_le: this.versDatePersistance(classeAcademique.obtenirCreeLe()),
      modifie_le:
        this.versDatePersistanceOptionnelle(classeAcademique.obtenirModifieLe()) ?? null,
      version: classeAcademique.obtenirVersion(),
    };
  }
}

// Cette interface represente une ligne PostgreSQL de la table referentiels_cours.
export interface PersistanceReferentielCoursPostgres {
  id: string;
  code: string;
  libelle: string;
  abreviation?: string | null;
  domaine?: string | null;
  sous_domaine?: string | null;
  actif: boolean;
  cree_le: ValeurDatePostgres;
  modifie_le?: ValeurDatePostgres | null;
  version: number;
}

// Ce mapper traduit un cours officiel entre domaine et persistance PostgreSQL.
export class MapperReferentielCoursPostgres extends BaseMapperPostgresReferentielAcademique {
  // Cette methode reconstruit un agregat ReferentielCours depuis une ligne PostgreSQL.
  public static depuisPersistance(
    ligne: PersistanceReferentielCoursPostgres,
  ): ReferentielCours {
    return new ReferentielCours(
      new ReferentielCoursId(ligne.id),
      ligne.code,
      ligne.libelle,
      ligne.abreviation ?? undefined,
      ligne.domaine ?? undefined,
      ligne.sous_domaine ?? undefined,
      ligne.actif,
      this.versDate(ligne.cree_le, 'cree_le'),
      this.versDateOptionnelle(ligne.modifie_le, 'modifie_le'),
      ligne.version,
    );
  }

  // Cette methode serialise un agregat ReferentielCours vers une ligne PostgreSQL.
  public static versPersistance(
    referentielCours: ReferentielCours,
  ): PersistanceReferentielCoursPostgres {
    return {
      id: referentielCours.obtenirId().obtenirValeur(),
      code: referentielCours.obtenirCode(),
      libelle: referentielCours.obtenirLibelle(),
      abreviation: referentielCours.obtenirAbreviation() ?? null,
      domaine: referentielCours.obtenirDomaine() ?? null,
      sous_domaine: referentielCours.obtenirSousDomaine() ?? null,
      actif: referentielCours.estActif(),
      cree_le: this.versDatePersistance(referentielCours.obtenirCreeLe()),
      modifie_le:
        this.versDatePersistanceOptionnelle(referentielCours.obtenirModifieLe()) ?? null,
      version: referentielCours.obtenirVersion(),
    };
  }
}
