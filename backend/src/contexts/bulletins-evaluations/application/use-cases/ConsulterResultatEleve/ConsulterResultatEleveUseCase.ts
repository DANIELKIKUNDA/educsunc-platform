import type { ConsulterResultatInput } from '../../dto/input/ConsulterResultatInput';
import type { ResultatBulletinOutput } from '../../dto/output/ResultatBulletinOutput';
import { QueryException } from '../../exceptions/QueryException';
import type { AutorisationConsultationStatistiquesPort } from '../../ports/out/AutorisationConsultationStatistiquesPort';
import type { ResultatsEleveQuery } from '../../queries/ResultatsEleveQuery';

// Ce use case expose la lecture optimisee d'un resultat consolide eleve.
export class ConsulterResultatEleveUseCase {
  constructor(
    private readonly query: ResultatsEleveQuery,
    private readonly autorisationConsultationStatistiquesPort?: AutorisationConsultationStatistiquesPort,
  ) {}

  // Cette methode retourne le resultat consolide demande ou echoue proprement.
  public async executer(input: ConsulterResultatInput): Promise<ResultatBulletinOutput> {
    const resultat = await this.query.executer(input.idEleve, input.idAnneeScolaire);
    if (resultat === null) {
      throw new QueryException('Le resultat consolide demande est introuvable.');
    }

    if (input.idUtilisateur !== undefined) {
      await this.autorisationConsultationStatistiquesPort?.verifierConsultationStatistiquesClasse({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: resultat.idEcole,
        idClassePedagogique: resultat.idClassePedagogique,
        idAnneeScolaire: input.idAnneeScolaire,
      });
    }

    return resultat;
  }
}
