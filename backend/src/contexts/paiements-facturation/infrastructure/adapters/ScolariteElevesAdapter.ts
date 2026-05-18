import type {
  ClasseEleveDTO,
  ElevePaiementDTO,
  FamillePaiementDTO,
  InscriptionPaiementDTO,
  ScolariteElevesPort,
  StatutScolaireDTO,
} from '../../application/ports/ScolariteElevesPort';
import type { SqlQueryClient } from '../../../../shared/infrastructure/persistence/SqlQueryClient';

interface LigneElevePaiement {
  id: string;
  id_ecole: string;
  id_organisation: string;
}

interface LigneInscriptionPaiement {
  id: string;
  id_eleve: string;
  id_ecole: string;
  id_annee_scolaire: string;
}

interface LigneAffectationPaiement {
  id_classe_pedagogique: string;
  id_ecole: string;
  id_annee_scolaire: string;
}

interface LigneFamillePaiement {
  id_famille: string;
  id_ecole: string;
  nombre_enfants: number | string | null;
}

interface LigneStatutPaiement {
  id_eleve: string;
  statut: string;
  actif: boolean;
}

// Ce fichier adapte les donnees scolaires reelles de l'eleve aux besoins du BC Paiements.
export class ScolariteElevesAdapter implements ScolariteElevesPort {
  // Ce constructeur injecte le client PostgreSQL du BC Scolarite afin de lire les donnees sans couplage HTTP.
  constructor(
    private readonly clientPostgresScolarite: SqlQueryClient,
  ) {}

  // Cette methode retrouve l'eleve exploitable par le BC Paiements.
  public async consulterEleve(idEleve: string): Promise<ElevePaiementDTO> {
    const ligne = await this.executerLectureUnique<LigneElevePaiement>(
      [
        'SELECT',
        '"id",',
        '"id_ecole",',
        '"id_organisation"',
        'FROM "eleves"',
        'WHERE "id" = $1',
        'LIMIT 1',
      ].join(' '),
      [idEleve],
      "L'eleve demande est introuvable.",
    );

    return {
      idEleve: ligne.id,
      idEcole: ligne.id_ecole,
      idOrganisation: ligne.id_organisation,
    };
  }

  // Cette methode retourne l'inscription active de l'eleve si elle existe.
  public async consulterInscriptionActive(
    idEleve: string,
  ): Promise<InscriptionPaiementDTO | null> {
    const ligne =
      await this.clientPostgresScolarite.executer<LigneInscriptionPaiement>(
        [
          'SELECT',
          '"id",',
          '"id_eleve",',
          '"id_ecole",',
          '"id_annee_scolaire"',
          'FROM "inscriptions_scolaires"',
          'WHERE "id_eleve" = $1',
          'AND "statut_inscription" = $2',
          'ORDER BY "date_inscription" DESC',
          'LIMIT 1',
        ].join(' '),
        [idEleve, 'VALIDEE'],
      );

    const resultat = ligne.lignes[0];

    if (resultat === undefined) {
      return null;
    }

    return {
      idInscriptionScolaire: resultat.id,
      idEleve: resultat.id_eleve,
      idEcole: resultat.id_ecole,
      idAnneeScolaire: resultat.id_annee_scolaire,
    };
  }

  // Cette methode retourne la classe pedagogique active de l'eleve si elle existe.
  public async consulterClasseActiveEleve(
    idEleve: string,
  ): Promise<ClasseEleveDTO | null> {
    const resultat =
      await this.clientPostgresScolarite.executer<LigneAffectationPaiement>(
        [
          'SELECT',
          '"affectation"."id_classe_pedagogique",',
          '"affectation"."id_ecole",',
          '"inscription"."id_annee_scolaire"',
          'FROM "affectations_classe" "affectation"',
          'JOIN "inscriptions_scolaires" "inscription"',
          'ON "inscription"."id" = "affectation"."id_inscription_scolaire"',
          'WHERE "inscription"."id_eleve" = $1',
          'AND "affectation"."active" = true',
          'ORDER BY "affectation"."date_affectation" DESC',
          'LIMIT 1',
        ].join(' '),
        [idEleve],
      );

    const ligne = resultat.lignes[0];

    if (ligne === undefined) {
      return null;
    }

    return {
      idClassePedagogique: ligne.id_classe_pedagogique,
      idEcole: ligne.id_ecole,
      idAnneeScolaire: ligne.id_annee_scolaire,
    };
  }

  // Cette methode retourne la famille rattachee a l'eleve si elle existe.
  public async consulterFamilleEleve(
    idEleve: string,
  ): Promise<FamillePaiementDTO | null> {
    const resultat =
      await this.clientPostgresScolarite.executer<LigneFamillePaiement>(
        [
          'SELECT',
          '"famille"."id" AS "id_famille",',
          '"famille"."id_ecole",',
          'COUNT("membre"."id_eleve") AS "nombre_enfants"',
          'FROM "familles" "famille"',
          'JOIN "membres_famille" "membre" ON "membre"."id_famille" = "famille"."id"',
          'WHERE "membre"."id_eleve" = $1',
          'GROUP BY "famille"."id", "famille"."id_ecole"',
          'LIMIT 1',
        ].join(' '),
        [idEleve],
      );
    const ligne = resultat.lignes[0];

    if (ligne === undefined) {
      return null;
    }

    return {
      idFamille: ligne.id_famille,
      idEcole: ligne.id_ecole,
      nombreEnfants:
        ligne.nombre_enfants === null
          ? undefined
          : Number.parseInt(String(ligne.nombre_enfants), 10),
    };
  }

  // Cette methode expose le statut scolaire utile a la creation ou au blocage d'une dette.
  public async verifierStatutScolaire(
    idEleve: string,
  ): Promise<StatutScolaireDTO> {
    const ligne = await this.executerLectureUnique<LigneStatutPaiement>(
      [
        'SELECT',
        '"id" AS "id_eleve",',
        '"statut" AS "statut",',
        'CASE WHEN "statut" IN ($2, $3, $4) THEN false ELSE true END AS "actif"',
        'FROM "eleves"',
        'WHERE "id" = $1',
        'LIMIT 1',
      ].join(' '),
      [idEleve, 'ABANDON', 'TRANSFERE', 'DECEDE'],
      "Le statut scolaire de l'eleve est introuvable.",
    );

    return {
      idEleve: ligne.id_eleve,
      statut: ligne.statut,
      actif: ligne.actif,
    };
  }

  // Cette methode centralise une lecture unique et produit un message simple en cas d'absence.
  private async executerLectureUnique<TLigne extends object>(
    requeteSql: string,
    parametres: readonly unknown[],
    messageAbsence: string,
  ): Promise<TLigne> {
    const resultat = await this.clientPostgresScolarite.executer<TLigne>(
      requeteSql,
      parametres,
    );
    const ligne = resultat.lignes[0];

    if (ligne === undefined) {
      throw new Error(messageAbsence);
    }

    return ligne;
  }
}
