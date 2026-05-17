import type { ClientPostgresPaiementsFacturation } from '../persistence/postgres/depots/ClientPostgresPaiementsFacturation';

interface LigneCompteurRecu {
  valeur: number | string;
}

// Ce fichier gere la numerotation transactionnelle des recus de paiement.
export class ServiceNumeroRecuPaiement {
  // Ce constructeur injecte le client PostgreSQL du BC pour s'appuyer sur une sequence persistante.
  constructor(
    private readonly clientPostgres: ClientPostgresPaiementsFacturation,
  ) {}

  // Cette methode genere le prochain numero de recu unique pour une ecole et une annee civile.
  public async generer(
    idEcole: string,
    annee: number = new Date().getFullYear(),
  ): Promise<string> {
    await this.clientPostgres.executer(
      [
        'INSERT INTO "compteurs_recus_paiement" ("id_ecole", "annee_reference", "valeur_courante")',
        'VALUES ($1, $2, 0)',
        'ON CONFLICT ("id_ecole", "annee_reference") DO NOTHING',
      ].join(' '),
      [idEcole, annee],
    );

    const resultat =
      await this.clientPostgres.executer<LigneCompteurRecu>(
        [
          'UPDATE "compteurs_recus_paiement"',
          'SET "valeur_courante" = "valeur_courante" + 1',
          'WHERE "id_ecole" = $1 AND "annee_reference" = $2',
          'RETURNING "valeur_courante" AS "valeur"',
        ].join(' '),
        [idEcole, annee],
      );

    const ligne = resultat.lignes[0];

    if (ligne === undefined) {
      throw new Error(
        "Le compteur de recus n'a pas pu etre incremente correctement.",
      );
    }

    const valeur = Number.parseInt(String(ligne.valeur), 10);
    const prefixeEcole = idEcole.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'ECOLE';

    return `${prefixeEcole}-${annee}-${String(valeur).padStart(6, '0')}`;
  }
}
