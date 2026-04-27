import {
  GetStatistiquesScolariteQuery,
  StatistiquesScolariteQueryRepository as PortStatistiquesScolariteQueryRepository,
} from '../../../application/queries/GetStatistiquesScolariteQuery';
import {
  StatistiquesClasseScolariteReadModel,
  StatistiquesParEcoleScolariteReadModel,
  StatistiquesScolariteReadModel,
} from '../../../application/read-models/StatistiquesScolariteReadModel';
import { InfrastructureError } from '../../../../../shared/exceptions/InfrastructureError';
import type { ClientPostgresScolariteEleves } from '../postgres/depots/ClientPostgresScolariteEleves';

// Ce fichier implemente la projection SQL des statistiques du BC Scolarite des Eleves.
interface LigneStatistiquesScolarite {
  id_ecole: string;
  classe: string | null;
  sexe: string;
  total_eleves: number | string;
  total_inscriptions: number | string;
  total_participants: number | string;
  total_abandons: number | string;
}

interface CompteurSexe {
  garcons: number;
  filles: number;
  total: number;
}

/**
 * Ce repository execute une seule requete principale et reconstruit le read model statistique.
 */
export class StatistiquesScolariteQueryRepository
implements PortStatistiquesScolariteQueryRepository {
  constructor(private readonly clientLecture: ClientPostgresScolariteEleves) {}

  /** Calcule les statistiques d'une ecole ou d'une organisation sur l'annee active. */
  public async obtenirStatistiques(
    query: GetStatistiquesScolariteQuery,
  ): Promise<StatistiquesScolariteReadModel> {
    const lignes = await this.executerQueryPrincipale(query);
    return this.construireReadModel(query, lignes);
  }

  private async executerQueryPrincipale(
    query: GetStatistiquesScolariteQuery,
  ): Promise<readonly LigneStatistiquesScolarite[]> {
    try {
      const resultat = await this.clientLecture.executer<LigneStatistiquesScolarite>(
        [
          'WITH donnees_statistiques AS (',
          '  SELECT',
          '    i.id_ecole,',
          "    COALESCE(cp.libelle, cp.code, 'Classe non renseignee') AS classe,",
          '    e.sexe,',
          '    e.id AS id_eleve,',
          '    i.id AS id_inscription,',
          '    e.statut_global',
          '  FROM inscriptions i',
          '  INNER JOIN annees_scolaires annee',
          '    ON annee.id = i.id_annee_scolaire',
          '   AND annee.id_ecole = i.id_ecole',
          '   AND annee.active = TRUE',
          '  INNER JOIN eleves e',
          '    ON e.id = i.id_eleve',
          '   AND e.id_organisation = i.id_organisation',
          '  INNER JOIN affectations a',
          '    ON a.id_inscription_scolaire = i.id',
          '   AND a.active = TRUE',
          '   AND a.supprime_logiquement = FALSE',
          '  LEFT JOIN classes_pedagogiques cp',
          '    ON cp.id = a.id_classe_pedagogique',
          '  WHERE i.id_organisation = $1',
          "    AND i.statut_inscription = 'VALIDEE'",
          '    AND i.supprime_logiquement = FALSE',
          '    AND e.supprime_logiquement = FALSE',
          '    AND ($2::uuid IS NULL OR i.id_ecole = $2::uuid)',
          ')',
          'SELECT',
          '  id_ecole,',
          '  classe,',
          '  sexe,',
          '  COUNT(DISTINCT id_eleve) AS total_eleves,',
          '  COUNT(DISTINCT id_inscription) AS total_inscriptions,',
          '  COUNT(DISTINCT id_inscription) AS total_participants,',
          "  COUNT(DISTINCT id_eleve) FILTER (WHERE statut_global = 'ABANDONNE') AS total_abandons",
          'FROM donnees_statistiques',
          'GROUP BY id_ecole, classe, sexe',
          'ORDER BY id_ecole ASC, classe ASC, sexe ASC',
        ].join('\n'),
        [query.idOrganisation, query.idEcole ?? null],
      );

      return resultat.lignes;
    } catch (erreur) {
      throw new InfrastructureError(
        'Le calcul des statistiques de scolarite a echoue.',
        'STATISTIQUES_SCOLARITE_QUERY',
        {
          idOrganisation: query.idOrganisation,
          idEcole: query.idEcole,
          messageErreur: erreur instanceof Error ? erreur.message : String(erreur),
        },
      );
    }
  }

  private construireReadModel(
    query: GetStatistiquesScolariteQuery,
    lignes: readonly LigneStatistiquesScolarite[],
  ): StatistiquesScolariteReadModel {
    const effectifs = this.creerCompteurVide();
    const abandons = this.creerCompteurVide();
    const effectifsParClasse = new Map<string, CompteurSexe>();
    const abandonsParClasse = new Map<string, CompteurSexe>();
    const statistiquesParEcole = new Map<string, StatistiquesParEcoleScolariteReadModel>();
    let inscrits = 0;
    let participants = 0;

    for (const ligne of lignes) {
      const classe = ligne.classe ?? 'Classe non renseignee';
      const totalEleves = this.convertirNombre(ligne.total_eleves);
      const totalInscriptions = this.convertirNombre(ligne.total_inscriptions);
      const totalParticipants = this.convertirNombre(ligne.total_participants);
      const totalAbandons = this.convertirNombre(ligne.total_abandons);

      this.ajouterParSexe(effectifs, ligne.sexe, totalEleves);
      this.ajouterParSexe(this.obtenirCompteur(effectifsParClasse, classe), ligne.sexe, totalEleves);
      this.ajouterParSexe(abandons, ligne.sexe, totalAbandons);
      this.ajouterParSexe(this.obtenirCompteur(abandonsParClasse, classe), ligne.sexe, totalAbandons);

      inscrits += totalInscriptions;
      participants += totalParticipants;
      this.ajouterParEcole(statistiquesParEcole, ligne.id_ecole, totalEleves, totalAbandons);
    }

    return {
      scope: query.idEcole === undefined ? 'ORGANISATION' : 'ECOLE',
      organisation: {
        idOrganisation: query.idOrganisation,
      },
      ecole: query.idEcole === undefined ? undefined : { idEcole: query.idEcole },
      effectifs: {
        ...effectifs,
        parClasse: this.convertirCompteursParClasse(effectifsParClasse),
      },
      abandons: {
        ...abandons,
        tauxAbandon: this.calculerTaux(abandons.total, effectifs.total),
        parClasse: this.convertirCompteursParClasse(abandonsParClasse),
      },
      participation: {
        inscrits,
        participants: Math.min(participants, inscrits),
        tauxParticipation: this.calculerTaux(Math.min(participants, inscrits), inscrits),
      },
      progression: {
        promus: 0,
        redoublants: 0,
      },
      parEcole: query.idEcole === undefined
        ? Array.from(statistiquesParEcole.values()).sort((a, b) => a.idEcole.localeCompare(b.idEcole))
        : undefined,
    };
  }

  private creerCompteurVide(): CompteurSexe {
    return { garcons: 0, filles: 0, total: 0 };
  }

  private obtenirCompteur(
    compteurs: Map<string, CompteurSexe>,
    cle: string,
  ): CompteurSexe {
    const compteurExistant = compteurs.get(cle);

    if (compteurExistant !== undefined) {
      return compteurExistant;
    }

    const compteur = this.creerCompteurVide();
    compteurs.set(cle, compteur);
    return compteur;
  }

  private ajouterParSexe(compteur: CompteurSexe, sexe: string, total: number): void {
    if (sexe === 'M') {
      compteur.garcons += total;
    }

    if (sexe === 'F') {
      compteur.filles += total;
    }

    compteur.total += total;
  }

  private ajouterParEcole(
    statistiquesParEcole: Map<string, StatistiquesParEcoleScolariteReadModel>,
    idEcole: string,
    totalEleves: number,
    totalAbandons: number,
  ): void {
    const statistiquesExistantes = statistiquesParEcole.get(idEcole);

    if (statistiquesExistantes !== undefined) {
      statistiquesExistantes.totalEleves += totalEleves;
      statistiquesExistantes.totalAbandons += totalAbandons;
      return;
    }

    statistiquesParEcole.set(idEcole, {
      idEcole,
      totalEleves,
      totalAbandons,
    });
  }

  private convertirCompteursParClasse(
    compteurs: Map<string, CompteurSexe>,
  ): StatistiquesClasseScolariteReadModel[] {
    return Array.from(compteurs.entries())
      .map(([classe, compteur]) => ({
        classe,
        garcons: compteur.garcons,
        filles: compteur.filles,
        total: compteur.total,
      }))
      .sort((a, b) => a.classe.localeCompare(b.classe));
  }

  private calculerTaux(numerateur: number, denominateur: number): number {
    if (denominateur === 0) {
      return 0;
    }

    return numerateur / denominateur;
  }

  private convertirNombre(valeur: number | string): number {
    return typeof valeur === 'number' ? valeur : Number(valeur);
  }
}
