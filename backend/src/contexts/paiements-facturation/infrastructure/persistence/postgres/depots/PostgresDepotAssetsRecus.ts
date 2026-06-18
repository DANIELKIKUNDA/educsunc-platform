import type {
  DepotAssetsRecusPort,
  IdentiteDocumentaireEcolePersistable,
  SignatureDocumentaireUtilisateurPersistable,
} from '../../../../application/ports/DepotAssetsRecusPort';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';

interface LigneIdentiteDocumentaireEcole {
  id_ecole: string;
  logo_url: string | null;
  cachet_url: string | null;
}

interface LigneSignatureDocumentaireUtilisateur {
  id_utilisateur: string;
  signature_url: string | null;
}

export class PostgresDepotAssetsRecus
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotAssetsRecusPort
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarderIdentiteEcole(
    identite: IdentiteDocumentaireEcolePersistable,
  ): Promise<void> {
    this.verifierEcritureLocaleAutorisee(identite.idEcole);
    await this.executerCommande(
      [
        'INSERT INTO "ecoles_identite_documentaire"',
        '("id_ecole", "logo_url", "cachet_url", "mis_a_jour_par", "mis_a_jour_le")',
        'VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
        'ON CONFLICT ("id_ecole") DO UPDATE SET',
        '"logo_url" = EXCLUDED."logo_url",',
        '"cachet_url" = EXCLUDED."cachet_url",',
        '"mis_a_jour_par" = EXCLUDED."mis_a_jour_par",',
        '"mis_a_jour_le" = CURRENT_TIMESTAMP',
      ].join(' '),
      [
        identite.idEcole,
        identite.logoUrl ?? null,
        identite.cachetUrl ?? null,
        identite.misAJourPar ?? null,
      ],
    );
  }

  public async consulterIdentiteEcole(
    idEcole: string,
  ): Promise<IdentiteDocumentaireEcolePersistable | null> {
    const ligne = await this.executerRequeteUnique<LigneIdentiteDocumentaireEcole>(
      'SELECT "id_ecole", "logo_url", "cachet_url" FROM "ecoles_identite_documentaire" WHERE "id_ecole" = $1 LIMIT 1',
      [idEcole],
    );

    if (ligne === null) {
      return null;
    }

    return {
      idEcole: ligne.id_ecole,
      logoUrl: ligne.logo_url ?? undefined,
      cachetUrl: ligne.cachet_url ?? undefined,
    };
  }

  public async sauvegarderSignatureUtilisateur(
    signature: SignatureDocumentaireUtilisateurPersistable,
  ): Promise<void> {
    await this.executerCommande(
      [
        'INSERT INTO "utilisateurs_signatures_documentaires"',
        '("id_utilisateur", "signature_url", "mis_a_jour_par", "mis_a_jour_le")',
        'VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        'ON CONFLICT ("id_utilisateur") DO UPDATE SET',
        '"signature_url" = EXCLUDED."signature_url",',
        '"mis_a_jour_par" = EXCLUDED."mis_a_jour_par",',
        '"mis_a_jour_le" = CURRENT_TIMESTAMP',
      ].join(' '),
      [
        signature.idUtilisateur,
        signature.signatureUrl ?? null,
        signature.misAJourPar ?? null,
      ],
    );
  }

  public async consulterSignatureUtilisateur(
    idUtilisateur: string,
  ): Promise<SignatureDocumentaireUtilisateurPersistable | null> {
    const ligne = await this.executerRequeteUnique<LigneSignatureDocumentaireUtilisateur>(
      'SELECT "id_utilisateur", "signature_url" FROM "utilisateurs_signatures_documentaires" WHERE "id_utilisateur" = $1 LIMIT 1',
      [idUtilisateur],
    );

    if (ligne === null) {
      return null;
    }

    return {
      idUtilisateur: ligne.id_utilisateur,
      signatureUrl: ligne.signature_url ?? undefined,
    };
  }
}
