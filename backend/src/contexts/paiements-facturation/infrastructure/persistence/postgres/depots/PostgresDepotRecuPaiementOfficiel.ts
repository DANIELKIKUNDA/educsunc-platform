import type {
  DepotRecuPaiementOfficielPort,
  LigneRecuPaiementOfficiel,
  RecuPaiementOfficielPersistable,
} from '../../../../application/ports/DepotRecuPaiementOfficielPort';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';

interface LigneRecuOfficielEntete {
  id: string;
  numero_recu: string;
  id_paiement: string;
  id_ecole: string;
  id_eleve: string;
  total_paye: number;
  devise: string;
  montant_lettres: string;
  mode_paiement: string;
  id_caissier: string;
  date_emission: Date | string;
  statut_recu: string;
}

interface LigneRecuOfficielLigne {
  id: string;
  id_recu_officiel: string;
  numero_ligne: number;
  id_recu_ligne: string;
  id_obligation: string;
  type_frais: string;
  reference_frais: string;
  libelle: string;
  montant: number;
  devise: string;
}

export class PostgresDepotRecuPaiementOfficiel
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotRecuPaiementOfficielPort
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(recu: RecuPaiementOfficielPersistable): Promise<void> {
    this.verifierEcritureLocaleAutorisee(recu.idEcole);

    await this.executerCommande(
      [
        'INSERT INTO "recus_paiement_officiels"',
        '("id", "numero_recu", "id_paiement", "id_ecole", "id_eleve", "total_paye", "devise", "montant_lettres", "mode_paiement", "id_caissier", "date_emission", "statut_recu")',
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        'ON CONFLICT ("id") DO UPDATE SET',
        '"numero_recu" = EXCLUDED."numero_recu",',
        '"id_paiement" = EXCLUDED."id_paiement",',
        '"id_ecole" = EXCLUDED."id_ecole",',
        '"id_eleve" = EXCLUDED."id_eleve",',
        '"total_paye" = EXCLUDED."total_paye",',
        '"devise" = EXCLUDED."devise",',
        '"montant_lettres" = EXCLUDED."montant_lettres",',
        '"mode_paiement" = EXCLUDED."mode_paiement",',
        '"id_caissier" = EXCLUDED."id_caissier",',
        '"date_emission" = EXCLUDED."date_emission",',
        '"statut_recu" = EXCLUDED."statut_recu"',
      ].join(' '),
      [
        recu.idRecu,
        recu.numeroRecu,
        recu.idPaiement,
        recu.idEcole,
        recu.idEleve,
        recu.totalPaye,
        recu.devise,
        recu.montantEnLettres,
        String(recu.modePaiement),
        recu.idCaissier,
        recu.dateEmission,
        recu.statutRecu,
      ],
    );

    await this.executerCommande(
      'DELETE FROM "recus_paiement_officiels_lignes" WHERE "id_recu_officiel" = $1',
      [recu.idRecu],
    );

    for (const ligne of recu.lignes) {
      await this.executerCommande(
        [
          'INSERT INTO "recus_paiement_officiels_lignes"',
          '("id", "id_recu_officiel", "numero_ligne", "id_recu_ligne", "id_obligation", "type_frais", "reference_frais", "libelle", "montant", "devise")',
          'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        ].join(' '),
        [
          ligne.idLigne,
          recu.idRecu,
          ligne.numeroLigne,
          ligne.idRecuLigne,
          ligne.idObligation,
          ligne.typeFrais,
          ligne.referenceFrais,
          ligne.libelle,
          ligne.montant,
          ligne.devise,
        ],
      );
    }
  }

  public async trouverParIdRecu(idRecu: string): Promise<RecuPaiementOfficielPersistable | null> {
    const entete = await this.executerRequeteUnique<LigneRecuOfficielEntete>(
      [
        'SELECT "entete".*',
        'FROM "recus_paiement_officiels" "entete"',
        'LEFT JOIN "recus_paiement_officiels_lignes" "ligne"',
        'ON "ligne"."id_recu_officiel" = "entete"."id"',
        'WHERE "entete"."id" = $1 OR "ligne"."id_recu_ligne" = $1',
        'ORDER BY "entete"."date_emission" ASC',
        'LIMIT 1',
      ].join(' '),
      [idRecu],
    );

    if (entete === null) {
      return null;
    }

    return this.chargerDocument(entete);
  }

  public async trouverParPaiement(idPaiement: string): Promise<RecuPaiementOfficielPersistable | null> {
    const entete = await this.executerRequeteUnique<LigneRecuOfficielEntete>(
      'SELECT * FROM "recus_paiement_officiels" WHERE "id_paiement" = $1 LIMIT 1',
      [idPaiement],
    );

    if (entete === null) {
      return null;
    }

    return this.chargerDocument(entete);
  }

  private async chargerDocument(
    entete: LigneRecuOfficielEntete,
  ): Promise<RecuPaiementOfficielPersistable> {
    const lignes = await this.executerRequete<LigneRecuOfficielLigne>(
      [
        'SELECT * FROM "recus_paiement_officiels_lignes"',
        'WHERE "id_recu_officiel" = $1',
        'ORDER BY "numero_ligne" ASC',
      ].join(' '),
      [entete.id],
    );

    return {
      idRecu: entete.id,
      numeroRecu: entete.numero_recu,
      idPaiement: entete.id_paiement,
      idEcole: entete.id_ecole,
      idEleve: entete.id_eleve,
      totalPaye: entete.total_paye,
      devise: entete.devise,
      montantEnLettres: entete.montant_lettres,
      modePaiement: entete.mode_paiement as never,
      idCaissier: entete.id_caissier,
      dateEmission: new Date(entete.date_emission),
      statutRecu: entete.statut_recu,
      lignes: lignes.map<LigneRecuPaiementOfficiel>((ligne) => ({
        idLigne: ligne.id,
        numeroLigne: ligne.numero_ligne,
        idRecuLigne: ligne.id_recu_ligne,
        idObligation: ligne.id_obligation,
        typeFrais: ligne.type_frais,
        referenceFrais: ligne.reference_frais,
        libelle: ligne.libelle,
        montant: ligne.montant,
        devise: ligne.devise,
      })),
    };
  }
}
