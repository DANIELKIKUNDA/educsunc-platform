import type {
  ProjectionCaissierRecuDTO,
  ProjectionContexteScolaireRecuDTO,
  ProjectionEcoleRecuDTO,
  ProjectionEleveRecuDTO,
  ProjectionRecuPaiementPort,
} from '../../application/ports/ProjectionRecuPaiementPort';
import type { SqlQueryClient } from '../../../../shared/infrastructure/persistence/SqlQueryClient';
import type { DepotUtilisateurAuth } from '../../../../shared/auth/domain/repositories/DepotUtilisateurAuth';

interface LigneEleveRecu {
  id: string;
  matricule: string | null;
  nom: string;
  post_nom: string;
  prenom: string | null;
  sexe: string;
}

interface LigneEcoleRecu {
  id: string;
  nom: string;
  sigle: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
}

interface LigneEcoleIdentiteDocumentaire {
  logo_url: string | null;
  cachet_url: string | null;
  message_remerciement: string | null;
}

interface LigneContexteScolaireRecu {
  id_classe_pedagogique: string | null;
  id_annee_scolaire: string | null;
}

interface LigneClasseRecu {
  libelle_classe: string | null;
}

interface LigneAnneeRecu {
  libelle_annee: string | null;
}

interface LigneSignatureDocumentaireUtilisateur {
  signature_url: string | null;
}

// Cet adaptateur assemble les enrichissements transverses d'un recu officiel sans passer par HTTP.
export class ProjectionRecuPaiementAdapter implements ProjectionRecuPaiementPort {
  constructor(
    private readonly clientScolarite: SqlQueryClient,
    private readonly clientReferentiel: SqlQueryClient,
    private readonly depotUtilisateurAuth: DepotUtilisateurAuth,
    private readonly clientPostgresPaiements?: SqlQueryClient,
  ) {}

  public async consulterEleve(idEleve: string): Promise<ProjectionEleveRecuDTO> {
    const ligne = await this.executerLectureUnique<LigneEleveRecu>(
      this.clientScolarite,
      [
        'SELECT',
        '"id",',
        '"matricule",',
        '"nom",',
        '"post_nom",',
        '"prenom",',
        '"sexe"',
        'FROM "eleves"',
        'WHERE "id" = $1',
        'LIMIT 1',
      ].join(' '),
      [idEleve],
      "L'eleve du recu est introuvable.",
    );

    return {
      idEleve: ligne.id,
      code: ligne.matricule?.trim() || ligne.id,
      nom: ligne.nom,
      postnom: ligne.post_nom,
      prenom: ligne.prenom ?? undefined,
      sexe: ligne.sexe,
    };
  }

  public async consulterEcole(idEcole: string): Promise<ProjectionEcoleRecuDTO> {
    const ligne = await this.executerLectureUnique<LigneEcoleRecu>(
      this.clientReferentiel,
      [
        'SELECT',
        '"id",',
        '"nom",',
        '"sigle",',
        '"adresse",',
        '"telephone",',
        '"email"',
        'FROM "ecoles"',
        'WHERE "id" = $1',
        'LIMIT 1',
      ].join(' '),
      [idEcole],
      "L'ecole du recu est introuvable.",
    );
    const identite = await this.clientLectureOptionnelle<LigneEcoleIdentiteDocumentaire>(
      this.clientPostgresPaiements ?? this.clientReferentiel,
      'SELECT "logo_url", "cachet_url", "message_remerciement" FROM "ecoles_identite_documentaire" WHERE "id_ecole" = $1 LIMIT 1',
      [idEcole],
    );

    return {
      idEcole: ligne.id,
      nom: ligne.nom,
      sigle: ligne.sigle ?? undefined,
      adresse: ligne.adresse ?? undefined,
      telephone: ligne.telephone ?? undefined,
      email: ligne.email ?? undefined,
      logoUrl: identite?.logo_url ?? undefined,
      cachetUrl: identite?.cachet_url ?? undefined,
    };
  }

  public async consulterContexteScolaire(
    idEleve: string,
  ): Promise<ProjectionContexteScolaireRecuDTO> {
    const resultat = await this.clientScolarite.executer<LigneContexteScolaireRecu>(
      [
        'SELECT',
        '"affectation"."id_classe_pedagogique",',
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
      return {};
    }

    const [classe, annee] = await Promise.all([
      ligne.id_classe_pedagogique === null
        ? Promise.resolve<undefined>(undefined)
        : this.executerLectureUnique<LigneClasseRecu>(
          this.clientReferentiel,
          'SELECT "libelle" AS "libelle_classe" FROM "classes_pedagogiques" WHERE "id" = $1 LIMIT 1',
          [ligne.id_classe_pedagogique],
          'La classe pedagogique du recu est introuvable.',
        ).then((resultatClasse) => resultatClasse.libelle_classe ?? undefined),
      ligne.id_annee_scolaire === null
        ? Promise.resolve<undefined>(undefined)
        : this.executerLectureUnique<LigneAnneeRecu>(
          this.clientReferentiel,
          'SELECT "libelle" AS "libelle_annee" FROM "annees_scolaires" WHERE "id" = $1 LIMIT 1',
          [ligne.id_annee_scolaire],
          "L'annee scolaire du recu est introuvable.",
        ).then((resultatAnnee) => resultatAnnee.libelle_annee ?? undefined),
    ]);

    return {
      anneeScolaire: annee,
      classe,
    };
  }

  public async consulterCaissier(idUtilisateur: string): Promise<ProjectionCaissierRecuDTO> {
    const utilisateur = await this.depotUtilisateurAuth.trouverParId(idUtilisateur);
    const signature = await this.clientLectureOptionnelle<LigneSignatureDocumentaireUtilisateur>(
      this.clientPostgresPaiements ?? this.clientReferentiel,
      'SELECT "signature_url" FROM "utilisateurs_signatures_documentaires" WHERE "id_utilisateur" = $1 LIMIT 1',
      [idUtilisateur],
    );

    return {
      idUtilisateur,
      nomComplet: utilisateur?.obtenirNomComplet() ?? idUtilisateur,
      signatureUrl: signature?.signature_url ?? undefined,
    };
  }

  private async executerLectureUnique<TLigne extends object>(
    client: SqlQueryClient,
    requeteSql: string,
    parametres: readonly unknown[],
    messageAbsence: string,
  ): Promise<TLigne> {
    const resultat = await client.executer<TLigne>(requeteSql, parametres);
    const ligne = resultat.lignes[0];

    if (ligne === undefined) {
      throw new Error(messageAbsence);
    }

    return ligne;
  }

  private async clientLectureOptionnelle<TLigne extends object>(
    client: SqlQueryClient,
    requeteSql: string,
    parametres: readonly unknown[],
  ): Promise<TLigne | null> {
    const resultat = await client.executer<TLigne>(requeteSql, parametres);
    return resultat.lignes[0] ?? null;
  }
}
