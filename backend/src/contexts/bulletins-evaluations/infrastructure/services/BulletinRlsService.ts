import { BulletinRlsPolicy } from '../tenancy/BulletinRlsPolicy';

// Ce fichier construit les instructions de session utiles aux futures policies RLS PostgreSQL.
export class BulletinRlsService {
  // Ce constructeur injecte la policy locale du BC pour centraliser la preparation de session.
  constructor(private readonly policy: BulletinRlsPolicy) {}

  // Cette methode expose les parametres de session a poser avant les lectures/transactions.
  public preparerParametresSession(idEcole: string, idOrganisation?: string | null): Record<string, string> {
    return this.policy.construireParametresSession(idEcole, idOrganisation);
  }
}
