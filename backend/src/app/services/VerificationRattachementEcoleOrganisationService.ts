import type { SqlQueryClient } from '../../shared/infrastructure/persistence/SqlQueryClient';

interface RattachementEcoleOrganisation {
  readonly organisationId: string;
  readonly ecoleId: string;
}

// Cette facade garde le referentiel academique comme source de verite du rattachement.
export class VerificationRattachementEcoleOrganisationService {
  private readonly rattachementsMemoire = new Map<string, string>();

  constructor(private readonly clientSql?: SqlQueryClient) {}

  public enregistrerRattachement(params: RattachementEcoleOrganisation): void {
    this.rattachementsMemoire.set(params.ecoleId, params.organisationId);
  }

  public async verifierRattachement(
    params: RattachementEcoleOrganisation,
  ): Promise<boolean> {
    if (!this.clientSql) {
      return this.rattachementsMemoire.get(params.ecoleId) === params.organisationId;
    }

    const resultat = await this.clientSql.executer<{ existe: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM ecoles
         WHERE id = $1
           AND id_organisation = $2
       ) AS existe`,
      [params.ecoleId, params.organisationId],
    );

    return resultat.lignes[0]?.existe === true;
  }
}
