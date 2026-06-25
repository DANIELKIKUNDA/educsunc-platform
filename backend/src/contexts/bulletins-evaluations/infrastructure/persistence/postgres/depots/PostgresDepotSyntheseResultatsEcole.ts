import { SyntheseResultatsEcole } from 'contexts/bulletins-evaluations/domain/aggregates/SyntheseResultatsEcole';
import { LigneSyntheseResultatsClasse } from 'contexts/bulletins-evaluations/domain/entities/LigneSyntheseResultatsClasse';
import {
  StatistiquesProclamationClasse,
  type StatistiquesProclamationClasseProps,
} from 'contexts/bulletins-evaluations/domain/entities/StatistiquesProclamationClasse';
import { TotauxSyntheseEcole } from 'contexts/bulletins-evaluations/domain/entities/TotauxSyntheseEcole';
import type { DepotSyntheseResultatsEcole } from 'contexts/bulletins-evaluations/domain/repositories/DepotSyntheseResultatsEcole';
import type { TypeSyntheseResultats } from 'contexts/bulletins-evaluations/domain/value-objects/TypeSyntheseResultats';
import type { ClientPoolPostgresBulletinsEvaluations } from '../ClientPoolPostgresBulletinsEvaluations';

interface SyntheseResultatsRow {
  id: string;
  id_ecole: string;
  id_annee_scolaire: string;
  code_colonne: string;
  type_synthese: TypeSyntheseResultats;
  date_generation: string | Date;
  generee_par: string;
  version: number;
  lignes_json: LigneSynthesePersisted[] | string | null;
  totaux_json: StatistiquesProclamationClasseProps | string | null;
}

interface LigneSynthesePersisted {
  idClassePedagogique: string;
  libelleClasse: string;
  idSectionScolaire?: string;
  sectionCode?: string;
  sectionLibelle?: string;
  statistiques: StatistiquesProclamationClasseProps;
}

// Ce depot persiste reellement les syntheses d'ecole dans PostgreSQL, avec un fallback memoire pour les contextes non relies.
export class PostgresDepotSyntheseResultatsEcole implements DepotSyntheseResultatsEcole {
  private static readonly stockageMemoire = new Map<string, SyntheseResultatsEcole>();
  private schemaInitialise = false;

  constructor(private readonly clientLecture?: ClientPoolPostgresBulletinsEvaluations) {}

  public async sauvegarder(syntheseResultatsEcole: SyntheseResultatsEcole): Promise<void> {
    if (this.clientLecture === undefined) {
      PostgresDepotSyntheseResultatsEcole.stockageMemoire.set(
        syntheseResultatsEcole.obtenirId(),
        syntheseResultatsEcole,
      );
      return;
    }

    await this.initialiserSchemaSiNecessaire();
    const lignes = syntheseResultatsEcole.obtenirLignesSyntheseResultatsClasse().map((ligne) => ({
      idClassePedagogique: ligne.obtenirIdClassePedagogique(),
      libelleClasse: ligne.obtenirLibelleClasse(),
      idSectionScolaire: ligne.obtenirIdSectionScolaire(),
      sectionCode: ligne.obtenirSectionCode(),
      sectionLibelle: ligne.obtenirSectionLibelle(),
      statistiques: ligne.obtenirStatistiques().obtenirValeurs(),
    }));
    const totaux = syntheseResultatsEcole.obtenirTotauxSyntheseEcole()?.obtenirValeurs() ?? null;

    await this.clientLecture.requeter(
      [
        'INSERT INTO syntheses_resultats_ecoles (',
        'id, id_ecole, id_annee_scolaire, code_colonne, type_synthese, date_generation, generee_par, version, lignes_json, totaux_json',
        ') VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb)',
        'ON CONFLICT (id) DO UPDATE SET',
        'id_ecole = EXCLUDED.id_ecole,',
        'id_annee_scolaire = EXCLUDED.id_annee_scolaire,',
        'code_colonne = EXCLUDED.code_colonne,',
        'type_synthese = EXCLUDED.type_synthese,',
        'date_generation = EXCLUDED.date_generation,',
        'generee_par = EXCLUDED.generee_par,',
        'version = EXCLUDED.version,',
        'lignes_json = EXCLUDED.lignes_json,',
        'totaux_json = EXCLUDED.totaux_json',
      ].join(' '),
      [
        syntheseResultatsEcole.obtenirId(),
        syntheseResultatsEcole.obtenirIdEcole(),
        syntheseResultatsEcole.obtenirIdAnneeScolaire(),
        syntheseResultatsEcole.obtenirCodeColonne(),
        syntheseResultatsEcole.obtenirTypeSynthese(),
        syntheseResultatsEcole.obtenirDateGeneration().toISOString(),
        syntheseResultatsEcole.obtenirGenereePar(),
        this.obtenirVersionMetier(syntheseResultatsEcole),
        JSON.stringify(lignes),
        JSON.stringify(totaux),
      ],
    );
  }

  public async trouverParEcoleEtColonne(
    idEcole: string,
    codeColonne: string,
    idAnneeScolaire: string,
  ): Promise<SyntheseResultatsEcole | null> {
    if (this.clientLecture === undefined) {
      return [...PostgresDepotSyntheseResultatsEcole.stockageMemoire.values()].find((synthese) =>
        synthese.obtenirIdEcole() === idEcole
        && synthese.obtenirCodeColonne() === codeColonne
        && synthese.obtenirIdAnneeScolaire() === idAnneeScolaire,
      ) ?? null;
    }

    await this.initialiserSchemaSiNecessaire();
    const lignes = await this.clientLecture.requeter<SyntheseResultatsRow>(
      [
        'SELECT * FROM syntheses_resultats_ecoles',
        'WHERE id_ecole = $1 AND code_colonne = $2 AND id_annee_scolaire = $3',
        'LIMIT 1',
      ].join(' '),
      [idEcole, codeColonne, idAnneeScolaire],
    );

    return lignes[0] === undefined ? null : this.depuisRow(lignes[0]);
  }

  public async listerParAnnee(idEcole: string, idAnneeScolaire: string): Promise<SyntheseResultatsEcole[]> {
    if (this.clientLecture === undefined) {
      return [...PostgresDepotSyntheseResultatsEcole.stockageMemoire.values()].filter((synthese) =>
        synthese.obtenirIdEcole() === idEcole
        && synthese.obtenirIdAnneeScolaire() === idAnneeScolaire,
      );
    }

    await this.initialiserSchemaSiNecessaire();
    const lignes = await this.clientLecture.requeter<SyntheseResultatsRow>(
      [
        'SELECT * FROM syntheses_resultats_ecoles',
        'WHERE id_ecole = $1 AND id_annee_scolaire = $2',
        'ORDER BY date_generation DESC, id ASC',
      ].join(' '),
      [idEcole, idAnneeScolaire],
    );

    return lignes.map((ligne) => this.depuisRow(ligne));
  }

  private async initialiserSchemaSiNecessaire(): Promise<void> {
    if (this.schemaInitialise || this.clientLecture === undefined) {
      return;
    }

    await this.clientLecture.requeter(
      [
        'CREATE TABLE IF NOT EXISTS syntheses_resultats_ecoles (',
        'id TEXT PRIMARY KEY,',
        'id_ecole TEXT NOT NULL,',
        'id_annee_scolaire TEXT NOT NULL,',
        'code_colonne TEXT NOT NULL,',
        'type_synthese TEXT NOT NULL,',
        'date_generation TIMESTAMPTZ NOT NULL,',
        'generee_par TEXT NOT NULL,',
        'version INTEGER NOT NULL,',
        "lignes_json JSONB NOT NULL DEFAULT '[]'::jsonb,",
        'totaux_json JSONB NULL',
        ')',
      ].join(' '),
    );
    await this.clientLecture.requeter(
      [
        'CREATE UNIQUE INDEX IF NOT EXISTS ux_syntheses_resultats_ecoles_contexte',
        'ON syntheses_resultats_ecoles (id_ecole, id_annee_scolaire, code_colonne)',
      ].join(' '),
    );
    this.schemaInitialise = true;
  }

  private depuisRow(ligne: SyntheseResultatsRow): SyntheseResultatsEcole {
    const lignesPersisted = this.lireJson<LigneSynthesePersisted[]>(ligne.lignes_json) ?? [];
    const totauxPersisted = this.lireJson<StatistiquesProclamationClasseProps | null>(ligne.totaux_json) ?? null;

    return new SyntheseResultatsEcole({
      idSyntheseResultatsEcole: ligne.id,
      idEcole: ligne.id_ecole,
      idAnneeScolaire: ligne.id_annee_scolaire,
      codeColonne: ligne.code_colonne as SyntheseResultatsEcole['obtenirCodeColonne'] extends () => infer T ? T : never,
      typeSynthese: ligne.type_synthese,
      dateGeneration: new Date(ligne.date_generation),
      genereePar: ligne.generee_par,
      version: ligne.version,
      lignesSyntheseResultatsClasse: lignesPersisted.map((element) => new LigneSyntheseResultatsClasse({
        idClassePedagogique: element.idClassePedagogique,
        libelleClasse: element.libelleClasse,
        idSectionScolaire: element.idSectionScolaire,
        sectionCode: element.sectionCode,
        sectionLibelle: element.sectionLibelle,
        statistiques: new StatistiquesProclamationClasse(element.statistiques),
      })),
      totauxSyntheseEcole: totauxPersisted === null ? undefined : new TotauxSyntheseEcole(totauxPersisted),
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

  private obtenirVersionMetier(synthese: SyntheseResultatsEcole): number {
    return Number(Reflect.get(synthese, 'version') ?? 1);
  }
}
