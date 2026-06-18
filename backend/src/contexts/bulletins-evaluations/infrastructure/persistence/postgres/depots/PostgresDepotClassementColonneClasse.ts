import { ClassementColonneClasse } from 'contexts/bulletins-evaluations/domain/aggregates/ClassementColonneClasse';
import { LigneClassementEleve } from 'contexts/bulletins-evaluations/domain/entities/LigneClassementEleve';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { DepotClassementColonneClasse } from 'contexts/bulletins-evaluations/domain/repositories/DepotClassementColonneClasse';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type { ClientPoolPostgresBulletinsEvaluations } from '../ClientPoolPostgresBulletinsEvaluations';

interface ClassementColonneClasseRow {
  id: string;
  id_ecole: string;
  id_classe_pedagogique: string;
  id_annee_scolaire: string;
  code_colonne: CodeColonneBulletin;
  type_structure_evaluation: TypeStructureEvaluation;
  date_calcul: string | Date;
  version: number;
  lignes_json: LigneClassementPersisted[] | string | null;
}

interface LigneClassementPersisted {
  idLigneClassementEleve: string;
  idEleve: string;
  sexe: SexeEleve;
  totalObtenu?: number;
  maximumGeneral?: number;
  pourcentage?: number;
  rang?: number;
  estNonClasse: boolean;
}

// Ce depot persiste reellement les classements de classe dans PostgreSQL, avec un fallback memoire hors infrastructure branchee.
export class PostgresDepotClassementColonneClasse implements DepotClassementColonneClasse {
  private static readonly stockageMemoire = new Map<string, ClassementColonneClasse>();
  private schemaInitialise = false;

  constructor(private readonly clientLecture?: ClientPoolPostgresBulletinsEvaluations) {}

  public async sauvegarder(classementColonneClasse: ClassementColonneClasse): Promise<void> {
    if (this.clientLecture === undefined) {
      PostgresDepotClassementColonneClasse.stockageMemoire.set(
        classementColonneClasse.obtenirId(),
        classementColonneClasse,
      );
      return;
    }

    await this.initialiserSchemaSiNecessaire();
    const lignes = classementColonneClasse.obtenirLignesClassement().map((ligne) => ({
      idLigneClassementEleve: ligne.obtenirId(),
      idEleve: ligne.obtenirIdEleve(),
      sexe: ligne.obtenirSexe(),
      totalObtenu: ligne.obtenirTotalObtenu(),
      maximumGeneral: ligne.obtenirMaximumGeneral(),
      pourcentage: ligne.obtenirPourcentage(),
      rang: ligne.obtenirRang(),
      estNonClasse: ligne.obtenirEstNonClasse(),
    }));

    await this.clientLecture.requeter(
      [
        'INSERT INTO classements_colonnes_classes (',
        'id, id_ecole, id_classe_pedagogique, id_annee_scolaire, code_colonne, type_structure_evaluation, date_calcul, version, lignes_json',
        ') VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)',
        'ON CONFLICT (id) DO UPDATE SET',
        'id_ecole = EXCLUDED.id_ecole,',
        'id_classe_pedagogique = EXCLUDED.id_classe_pedagogique,',
        'id_annee_scolaire = EXCLUDED.id_annee_scolaire,',
        'code_colonne = EXCLUDED.code_colonne,',
        'type_structure_evaluation = EXCLUDED.type_structure_evaluation,',
        'date_calcul = EXCLUDED.date_calcul,',
        'version = EXCLUDED.version,',
        'lignes_json = EXCLUDED.lignes_json',
      ].join(' '),
      [
        classementColonneClasse.obtenirId(),
        classementColonneClasse.obtenirIdEcole(),
        classementColonneClasse.obtenirIdClassePedagogique(),
        classementColonneClasse.obtenirIdAnneeScolaire(),
        classementColonneClasse.obtenirCodeColonne(),
        classementColonneClasse.obtenirTypeStructureEvaluation(),
        classementColonneClasse.obtenirDateCalcul().toISOString(),
        classementColonneClasse.obtenirVersion(),
        JSON.stringify(lignes),
      ],
    );
  }

  public async trouverParClasseEtColonne(
    idClassePedagogique: string,
    codeColonne: string,
    idAnneeScolaire: string,
  ): Promise<ClassementColonneClasse | null> {
    if (this.clientLecture === undefined) {
      return [...PostgresDepotClassementColonneClasse.stockageMemoire.values()].find((classement) =>
        classement.obtenirIdClassePedagogique() === idClassePedagogique
        && classement.obtenirCodeColonne() === codeColonne
        && classement.obtenirIdAnneeScolaire() === idAnneeScolaire,
      ) ?? null;
    }

    await this.initialiserSchemaSiNecessaire();
    const lignes = await this.clientLecture.requeter<ClassementColonneClasseRow>(
      [
        'SELECT * FROM classements_colonnes_classes',
        'WHERE id_classe_pedagogique = $1 AND code_colonne = $2 AND id_annee_scolaire = $3',
        'LIMIT 1',
      ].join(' '),
      [idClassePedagogique, codeColonne, idAnneeScolaire],
    );

    return lignes[0] === undefined ? null : this.depuisRow(lignes[0]);
  }

  public async listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<ClassementColonneClasse[]> {
    if (this.clientLecture === undefined) {
      return [...PostgresDepotClassementColonneClasse.stockageMemoire.values()].filter((classement) =>
        classement.obtenirIdClassePedagogique() === idClassePedagogique
        && classement.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    }

    await this.initialiserSchemaSiNecessaire();
    const lignes = await this.clientLecture.requeter<ClassementColonneClasseRow>(
      [
        'SELECT * FROM classements_colonnes_classes',
        'WHERE id_classe_pedagogique = $1 AND id_annee_scolaire = $2',
        'ORDER BY date_calcul DESC, id ASC',
      ].join(' '),
      [idClassePedagogique, idAnneeScolaire],
    );

    return lignes.map((ligne) => this.depuisRow(ligne));
  }

  public async supprimerLogiquementAncienClassement(
    idClassePedagogique: string,
    codeColonne: string,
    idAnneeScolaire: string,
  ): Promise<void> {
    if (this.clientLecture === undefined) {
      const classement = await this.trouverParClasseEtColonne(idClassePedagogique, codeColonne, idAnneeScolaire);

      if (classement !== null) {
        PostgresDepotClassementColonneClasse.stockageMemoire.delete(classement.obtenirId());
      }

      return;
    }

    await this.initialiserSchemaSiNecessaire();
    await this.clientLecture.requeter(
      [
        'DELETE FROM classements_colonnes_classes',
        'WHERE id_classe_pedagogique = $1 AND code_colonne = $2 AND id_annee_scolaire = $3',
      ].join(' '),
      [idClassePedagogique, codeColonne, idAnneeScolaire],
    );
  }

  private async initialiserSchemaSiNecessaire(): Promise<void> {
    if (this.schemaInitialise || this.clientLecture === undefined) {
      return;
    }

    await this.clientLecture.requeter(
      [
        'CREATE TABLE IF NOT EXISTS classements_colonnes_classes (',
        'id TEXT PRIMARY KEY,',
        'id_ecole TEXT NOT NULL,',
        'id_classe_pedagogique TEXT NOT NULL,',
        'id_annee_scolaire TEXT NOT NULL,',
        'code_colonne TEXT NOT NULL,',
        'type_structure_evaluation TEXT NOT NULL,',
        'date_calcul TIMESTAMPTZ NOT NULL,',
        'version INTEGER NOT NULL,',
        "lignes_json JSONB NOT NULL DEFAULT '[]'::jsonb",
        ')',
      ].join(' '),
    );
    await this.clientLecture.requeter(
      [
        'CREATE UNIQUE INDEX IF NOT EXISTS ux_classements_colonnes_classes_contexte',
        'ON classements_colonnes_classes (id_classe_pedagogique, id_annee_scolaire, code_colonne)',
      ].join(' '),
    );
    this.schemaInitialise = true;
  }

  private depuisRow(ligne: ClassementColonneClasseRow): ClassementColonneClasse {
    const lignesPersisted = this.lireJson<LigneClassementPersisted[]>(ligne.lignes_json) ?? [];

    return new ClassementColonneClasse({
      idClassementColonneClasse: ligne.id,
      idEcole: ligne.id_ecole,
      idClassePedagogique: ligne.id_classe_pedagogique,
      idAnneeScolaire: ligne.id_annee_scolaire,
      codeColonne: ligne.code_colonne,
      typeStructureEvaluation: ligne.type_structure_evaluation,
      dateCalcul: new Date(ligne.date_calcul),
      version: ligne.version,
      lignesClassement: lignesPersisted.map((element) => new LigneClassementEleve({
        idLigneClassementEleve: element.idLigneClassementEleve,
        idEleve: element.idEleve,
        sexe: element.sexe,
        totalObtenu: element.totalObtenu,
        maximumGeneral: element.maximumGeneral,
        pourcentage: element.pourcentage,
        rang: element.rang,
        estNonClasse: element.estNonClasse,
      })),
    });
  }

  private lireJson<T>(valeur: T | string | null): T | null {
    if (valeur === null) {
      return null;
    }

    if (typeof valeur === 'string') {
      return JSON.parse(valeur) as T;
    }

    return valeur;
  }
}
