import type { ConsulterClassementInput } from '../../dto/input/ConsulterClassementInput';
import type { ClassementClasseOutput } from '../../dto/output/ClassementClasseOutput';
import { QueryException } from '../../exceptions/QueryException';
import type { AutorisationClassementPort } from '../../ports/out/AutorisationClassementPort';
import type { ClassementClasseQuery } from '../../queries/ClassementClasseQuery';

// Ce use case expose la lecture optimisee d'un classement de classe.
export class ConsulterClassementClasseUseCase {
  constructor(
    private readonly query: ClassementClasseQuery,
    private readonly autorisationClassementPort?: AutorisationClassementPort,
  ) {}

  // Cette methode retourne le classement demande ou echoue proprement.
  public async executer(input: ConsulterClassementInput): Promise<ClassementClasseOutput> {
    await this.autorisationClassementPort?.verifierConsultationClassementClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    const classement = await this.query.executer(input.idClassePedagogique, input.idAnneeScolaire, input.codeColonne);
    if (classement === null) {
      throw new QueryException('Le classement demande est introuvable.');
    }

    return classement;
  }
}
