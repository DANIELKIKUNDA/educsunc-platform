import { randomUUID } from 'node:crypto';
import type { ClientPostgresReferentielAcademique } from 'contexts/referentiel-academique/infrastructure/persistence/postgres/depots/ClientPostgresReferentielAcademique';
import { InfrastructureError } from 'shared/exceptions/InfrastructureError';
import { ValidationError } from 'shared/exceptions/ValidationError';
import type {
  CommandeEnregistrementIdempotence,
  EnregistrementIdempotence,
  IdempotencyStore,
} from 'shared/infrastructure/idempotency/IdempotencyStore';

interface LigneIdempotencePostgres {
  cle: string;
  statut: string;
  operation: string | null;
  empreinte_requete: string | null;
  resultat: Record<string, unknown> | string | null;
  expire_le: Date | string | null;
  cree_le: Date | string;
}

const STATUT_ENREGISTREMENT_PAR_DEFAUT = 'ENREGISTREE';

// Cette implementation persiste les cles d'idempotence dans PostgreSQL.
export class PostgresIdempotencyStore implements IdempotencyStore {
  private readonly clientPostgres: ClientPostgresReferentielAcademique;
  private readonly nomTable = 'idempotency_keys';

  // Ce constructeur injecte le client PostgreSQL reutilisable du BC.
  constructor(clientPostgres: ClientPostgresReferentielAcademique) {
    this.clientPostgres = clientPostgres;
  }

  // Cette methode indique si une cle non expiree est deja presente en base.
  public async existe(cle: string, dateReference: Date = new Date()): Promise<boolean> {
    this.validerCle(cle);
    this.validerDateReference(dateReference);

    try {
      const resultat = await this.clientPostgres.executer<{ correspondance: number }>(
        [
          'SELECT 1 AS correspondance',
          `FROM "${this.nomTable}"`,
          'WHERE "cle" = $1',
          'AND ("expire_le" IS NULL OR "expire_le" > $2)',
          'LIMIT 1',
        ].join(' '),
        [cle.trim(), dateReference],
      );

      return resultat.lignes.length > 0;
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "La verification d'existence d'une cle d'idempotence a echoue.",
        'VERIFICATION_EXISTENCE_IDEMPOTENCE',
        { cle: cle.trim(), dateReference },
        erreur,
      );
    }
  }

  // Cette methode retourne la cle d'idempotence complete si elle existe encore.
  public async obtenir(
    cle: string,
    dateReference: Date = new Date(),
  ): Promise<EnregistrementIdempotence | null> {
    this.validerCle(cle);
    this.validerDateReference(dateReference);

    try {
      const resultat = await this.clientPostgres.executer<LigneIdempotencePostgres>(
        [
          'SELECT "cle", "statut", "operation", "empreinte_requete", "resultat", "expire_le", "cree_le"',
          `FROM "${this.nomTable}"`,
          'WHERE "cle" = $1',
          'AND ("expire_le" IS NULL OR "expire_le" > $2)',
          'LIMIT 1',
        ].join(' '),
        [cle.trim(), dateReference],
      );

      const ligne = resultat.lignes[0];

      return ligne === undefined ? null : this.mapperEnregistrement(ligne);
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "La lecture d'une cle d'idempotence a echoue.",
        'LECTURE_IDEMPOTENCE',
        { cle: cle.trim(), dateReference },
        erreur,
      );
    }
  }

  // Cette surcharge reserve une cle simple avec un statut technique par defaut.
  public async enregistrer(cle: string): Promise<void>;

  // Cette surcharge enregistre une cle avec son contexte technique complet.
  public async enregistrer(commande: CommandeEnregistrementIdempotence): Promise<void>;

  // Cette methode enregistre une reservation idempotente en evitant les doublons non expires.
  public async enregistrer(
    cleOuCommande: string | CommandeEnregistrementIdempotence,
  ): Promise<void> {
    const commande = this.normaliserCommande(cleOuCommande);

    try {
      await this.clientPostgres.executer(
        [
          `DELETE FROM "${this.nomTable}"`,
          'WHERE "cle" = $1',
          'AND "expire_le" IS NOT NULL',
          'AND "expire_le" <= CURRENT_TIMESTAMP',
        ].join(' '),
        [commande.cle],
      );

      await this.clientPostgres.executer(
        [
          `INSERT INTO "${this.nomTable}"`,
          '("id", "cle", "operation", "statut", "empreinte_requete", "resultat", "expire_le")',
          'VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)',
          'ON CONFLICT ("cle") DO NOTHING',
        ].join(' '),
        [
          randomUUID(),
          commande.cle,
          commande.operation,
          commande.statut,
          commande.empreinteRequete,
          commande.resultat === null ? null : JSON.stringify(commande.resultat),
          commande.expireLe,
        ],
      );
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "L'enregistrement d'une cle d'idempotence a echoue.",
        'ENREGISTREMENT_IDEMPOTENCE',
        {
          cle: commande.cle,
          statut: commande.statut,
          operation: commande.operation,
        },
        erreur,
      );
    }
  }

  // Cette methode met a jour le resultat memorise pour une cle existante.
  public async marquerResultat(
    cle: string,
    statut: string,
    resultat: Record<string, unknown> | null = null,
  ): Promise<void> {
    this.validerCle(cle);
    const statutNormalise = this.normaliserTexteTechnique(statut, 'statut');

    try {
      const resultatMiseAJour = await this.clientPostgres.executer(
        [
          `UPDATE "${this.nomTable}"`,
          'SET "statut" = $2, "resultat" = $3::jsonb',
          'WHERE "cle" = $1',
        ].join(' '),
        [
          cle.trim(),
          statutNormalise,
          resultat === null ? null : JSON.stringify(resultat),
        ],
      );

      if (resultatMiseAJour.nombreLignesAffectees === 0) {
        throw new InfrastructureError(
          "Impossible de mettre a jour une cle d'idempotence introuvable.",
          'CLE_IDEMPOTENCE_INTRouvABLE',
          {
            cle: cle.trim(),
            statut: statutNormalise,
          },
        );
      }
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "La mise a jour du resultat d'idempotence a echoue.",
        'MISE_A_JOUR_RESULTAT_IDEMPOTENCE',
        {
          cle: cle.trim(),
          statut: statutNormalise,
        },
        erreur,
      );
    }
  }

  // Cette methode nettoie les cles expirees devenues inutiles.
  public async supprimerExpirees(dateReference: Date = new Date()): Promise<number> {
    this.validerDateReference(dateReference);

    try {
      const resultat = await this.clientPostgres.executer(
        [
          `DELETE FROM "${this.nomTable}"`,
          'WHERE "expire_le" IS NOT NULL',
          'AND "expire_le" <= $1',
        ].join(' '),
        [dateReference],
      );

      return resultat.nombreLignesAffectees;
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "La suppression des cles d'idempotence expirees a echoue.",
        'SUPPRESSION_IDEMPOTENCE_EXPIREE',
        { dateReference },
        erreur,
      );
    }
  }

  // Cette methode transforme une commande flexible en commande exploitable et validee.
  private normaliserCommande(
    cleOuCommande: string | CommandeEnregistrementIdempotence,
  ): CommandeEnregistrementIdempotence {
    if (typeof cleOuCommande === 'string') {
      const cle = cleOuCommande.trim();

      this.validerCle(cle);

      return {
        cle,
        statut: STATUT_ENREGISTREMENT_PAR_DEFAUT,
      };
    }

    const cle = cleOuCommande.cle.trim();
    const statut = this.normaliserTexteTechnique(cleOuCommande.statut, 'statut');

    this.validerCle(cle);

    return {
      cle,
      statut,
      operation: this.normaliserTexteOptionnel(cleOuCommande.operation),
      empreinteRequete: this.normaliserTexteOptionnel(cleOuCommande.empreinteRequete),
      resultat: cleOuCommande.resultat ?? null,
      expireLe: this.normaliserDateOptionnelle(cleOuCommande.expireLe),
    };
  }

  // Cette methode mappe une ligne PostgreSQL vers le contrat du stockage.
  private mapperEnregistrement(
    ligne: LigneIdempotencePostgres,
  ): EnregistrementIdempotence {
    return {
      cle: ligne.cle,
      statut: ligne.statut,
      operation: ligne.operation,
      empreinteRequete: ligne.empreinte_requete,
      resultat: this.normaliserResultat(ligne.resultat),
      expireLe: this.normaliserDateOptionnelleDepuisBase(ligne.expire_le, 'expire_le'),
      creeLe: this.convertirEnDate(ligne.cree_le, 'cree_le'),
    };
  }

  // Cette methode valide qu'une cle technique non vide est fournie.
  private validerCle(cle: string): void {
    if (cle.trim().length === 0) {
      throw new ValidationError(
        "La cle d'idempotence doit etre une chaine non vide.",
        'CLE_IDEMPOTENCE_INVALIDE',
      );
    }
  }

  // Cette methode valide qu'une date de reference exploitable est fournie.
  private validerDateReference(dateReference: Date): void {
    if (Number.isNaN(dateReference.getTime())) {
      throw new ValidationError(
        "La date de reference de l'idempotence est invalide.",
        'DATE_REFERENCE_IDEMPOTENCE_INVALIDE',
      );
    }
  }

  // Cette methode normalise un texte technique obligatoire.
  private normaliserTexteTechnique(valeur: string, nomChamp: string): string {
    const valeurNormalisee = valeur.trim();

    if (valeurNormalisee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une chaine non vide.`,
        'CHAMP_TECHNIQUE_IDEMPOTENCE_INVALIDE',
        {
          nomChamp,
        },
      );
    }

    return valeurNormalisee;
  }

  // Cette methode normalise un texte optionnel en null lorsqu'il est absent.
  private normaliserTexteOptionnel(valeur?: string | null): string | null {
    if (valeur === undefined || valeur === null) {
      return null;
    }

    const valeurNormalisee = valeur.trim();

    return valeurNormalisee.length === 0 ? null : valeurNormalisee;
  }

  // Cette methode normalise une date optionnelle avant persistence.
  private normaliserDateOptionnelle(valeur?: Date | null): Date | null {
    if (valeur === undefined || valeur === null) {
      return null;
    }

    if (Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        "La date d'expiration d'une cle d'idempotence est invalide.",
        'DATE_EXPIRATION_IDEMPOTENCE_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode convertit une date optionnelle issue de PostgreSQL.
  private normaliserDateOptionnelleDepuisBase(
    valeur: Date | string | null,
    nomChamp: string,
  ): Date | null {
    if (valeur === null) {
      return null;
    }

    return this.convertirEnDate(valeur, nomChamp);
  }

  // Cette methode convertit une date PostgreSQL en objet Date valide.
  private convertirEnDate(valeur: Date | string, nomChamp: string): Date {
    if (valeur instanceof Date && !Number.isNaN(valeur.getTime())) {
      return new Date(valeur.getTime());
    }

    if (typeof valeur === 'string') {
      const date = new Date(valeur);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    throw new InfrastructureError(
      `Le champ "${nomChamp}" ne contient pas une date PostgreSQL exploitable.`,
      'DATE_IDEMPOTENCE_POSTGRES_INVALIDE',
      {
        nomChamp,
        valeur,
      },
    );
  }

  // Cette methode normalise un resultat JSONB lu depuis PostgreSQL.
  private normaliserResultat(
    resultat: Record<string, unknown> | string | null,
  ): Record<string, unknown> | null {
    if (resultat === null) {
      return null;
    }

    if (typeof resultat === 'string') {
      try {
        const resultatParse = JSON.parse(resultat) as unknown;

        if (
          typeof resultatParse === 'object' &&
          resultatParse !== null &&
          !Array.isArray(resultatParse)
        ) {
          return resultatParse as Record<string, unknown>;
        }
      } catch {
        throw new InfrastructureError(
          "Le resultat JSONB d'une cle d'idempotence est invalide.",
          'RESULTAT_IDEMPOTENCE_INVALIDE',
        );
      }

      throw new InfrastructureError(
        "Le resultat JSONB d'une cle d'idempotence doit etre un objet.",
        'RESULTAT_IDEMPOTENCE_FORMAT_INVALIDE',
      );
    }

    return resultat;
  }

  // Cette methode construit une erreur technique coherente pour les operations d'idempotence.
  private creerErreurInfrastructure(
    message: string,
    etape: string,
    contexte: Record<string, unknown>,
    erreur: unknown,
  ): InfrastructureError {
    if (erreur instanceof InfrastructureError || erreur instanceof ValidationError) {
      return erreur;
    }

    return new InfrastructureError(message, 'POSTGRES_IDEMPOTENCY_STORE', {
      ...contexte,
      etape,
      messageErreur: this.decrireErreur(erreur),
    });
  }

  // Cette methode produit une description robuste d'une erreur inconnue.
  private decrireErreur(erreur: unknown): string {
    if (erreur instanceof Error) {
      return erreur.message;
    }

    if (typeof erreur === 'string') {
      return erreur;
    }

    try {
      return JSON.stringify(erreur);
    } catch {
      return 'Erreur inconnue';
    }
  }
}
