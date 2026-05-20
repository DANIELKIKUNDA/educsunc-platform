import { ClasseReglesFraisDTO } from '../../../../application/dto/output/ClasseReglesFraisDTO';
import { ReglesFraisClasseRepository } from '../../../../application/use-cases/structure/ConsulterReglesFraisClasse';
import { ContexteExecutionTenantReferentielAcademique } from '../../../tenancy/ContexteExecutionTenantReferentielAcademique';
import { BaseDepotPostgresReferentielAcademique } from '../depots/BaseDepotPostgresReferentielAcademique';
import { ClientPostgresReferentielAcademique } from '../depots/ClientPostgresReferentielAcademique';
import { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';

interface LigneReglesFraisClassePostgres {
  id_classe: string;
  nom_classe: string;
  code_section: string;
  libelle_section: string;
  cycle: string;
  id_option: string | null;
  nom_option: string | null;
  est_technique: boolean | null;
  categorie_technique: 'GROUPE_1' | 'GROUPE_2' | null;
  est_classe_tenasosp: boolean;
  est_classe_exetat: boolean;
  est_classe_finaliste: boolean;
}

type SectionFrais = ClasseReglesFraisDTO['section'];
type CategorieFraisEtat = ClasseReglesFraisDTO['categorieFraisEtat'];

// Ce repository lit les faits academiques exposes au BC Paiements sans calculer les frais.
export class ReglesFraisClasseQueryRepository
  extends BaseDepotPostgresReferentielAcademique
  implements ReglesFraisClasseRepository
{
  // Ce constructeur injecte le client PostgreSQL, l'unite de travail et le contexte tenant.
  constructor(
    clientLecture: ClientPostgresReferentielAcademique,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresReferentielAcademique>,
    contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
  ) {
    super(clientLecture, uniteDeTravail, contexteExecutionTenant);
  }

  // Cette methode retourne les faits de frais d'une classe pedagogique dans le tenant courant.
  public async consulterParClassePedagogique(
    idClassePedagogique: string,
  ): Promise<ClasseReglesFraisDTO | null> {
    const isolation = this.construireClauseIsolationLectureParEcole('"cp"."id_ecole"', 2);
    const ligne = await this.executerRequeteUnique<LigneReglesFraisClassePostgres>(
      [
        'SELECT',
        '"cp"."id" AS "id_classe",',
        '"cp"."libelle" AS "nom_classe",',
        '"ss"."code" AS "code_section",',
        '"ss"."libelle" AS "libelle_section",',
        '"ca"."cycle" AS "cycle",',
        '"oe"."id" AS "id_option",',
        '"oe"."libelle" AS "nom_option",',
        '"oe"."est_technique" AS "est_technique",',
        '"oe"."categorie_technique" AS "categorie_technique",',
        '"ca"."est_classe_tenasosp" AS "est_classe_tenasosp",',
        '"ca"."est_classe_exetat" AS "est_classe_exetat",',
        '"ca"."est_classe_finaliste" AS "est_classe_finaliste"',
        'FROM "classes_pedagogiques" "cp"',
        'JOIN "classes_academiques" "ca" ON "ca"."id" = "cp"."id_classe_academique"',
        'JOIN "sections_scolaires" "ss" ON "ss"."id" = "ca"."id_section_scolaire"',
        'LEFT JOIN "options_etudes" "oe" ON "oe"."id" = "ca"."id_option_etude"',
        'WHERE "cp"."id" = $1',
        'AND "cp"."archive_le" IS NULL',
        isolation.clauseSql,
        'LIMIT 1',
      ].join(' '),
      [idClassePedagogique, ...isolation.parametres],
    );

    return ligne === null ? null : this.mapperVersDto(ligne);
  }

  private mapperVersDto(ligne: LigneReglesFraisClassePostgres): ClasseReglesFraisDTO {
    const section = this.normaliserSection(ligne.code_section, ligne.libelle_section);
    const option = ligne.id_option === null || ligne.nom_option === null
      ? undefined
      : {
        idOption: ligne.id_option,
        nom: ligne.nom_option,
        estTechnique: ligne.est_technique ?? false,
        categorieTechnique: ligne.categorie_technique,
      };

    return {
      idClasse: ligne.id_classe,
      nomClasse: ligne.nom_classe,
      section,
      cycle: ligne.cycle,
      option,
      estClasseTENASOSP: ligne.est_classe_tenasosp,
      estClasseEXETAT: ligne.est_classe_exetat,
      estClasseFinaliste: ligne.est_classe_finaliste,
      categorieFraisEtat: this.calculerCategorieFraisEtat(
        section,
        ligne.cycle,
        option?.estTechnique ?? false,
        ligne.est_classe_tenasosp,
      ),
    };
  }

  private normaliserSection(codeSection: string, libelleSection: string): SectionFrais {
    const valeur = `${codeSection} ${libelleSection}`.toUpperCase();

    if (valeur.includes('MATERNEL')) {
      return 'MATERNELLE';
    }

    if (valeur.includes('PRIMAIR')) {
      return 'PRIMAIRE';
    }

    return 'SECONDAIRE';
  }

  private calculerCategorieFraisEtat(
    section: SectionFrais,
    cycle: string,
    optionTechnique: boolean,
    classeTENASOSP: boolean,
  ): CategorieFraisEtat {
    if (section === 'MATERNELLE') {
      return 'MATERNELLE';
    }

    if (section === 'PRIMAIRE') {
      return 'PRIMAIRE';
    }

    if (classeTENASOSP || cycle.toUpperCase().includes('EB')) {
      return 'SECONDAIRE_EB';
    }

    return optionTechnique ? 'SECONDAIRE_TECHNIQUE' : 'SECONDAIRE_GENERALE';
  }
}
