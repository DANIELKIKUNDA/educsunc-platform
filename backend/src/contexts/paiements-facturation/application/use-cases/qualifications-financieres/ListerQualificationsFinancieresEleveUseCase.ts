import type { ListerQualificationsFinancieresEleveInput } from '../../dto/input/QualificationsFinancieresEntreeDTO';
import type { QualificationFinanciereEleveOutput } from '../../dto/output/QualificationsFinancieresSortieDTO';
import type { AutorisationQualificationFinanciereElevePort } from '../../ports/AutorisationQualificationFinanciereElevePort';
import { versQualificationFinanciereEleveOutput } from '../../mappers/QualificationFinanciereEleveApplicationMapper';
import type { DepotQualificationFinanciereEleve } from '../../../domain/repositories/DepotQualificationFinanciereEleve';

export class ListerQualificationsFinancieresEleveUseCase {
  constructor(
    private readonly depotQualification: DepotQualificationFinanciereEleve,
    private readonly autorisationQualification: AutorisationQualificationFinanciereElevePort,
  ) {}

  public async executer(input: ListerQualificationsFinancieresEleveInput): Promise<QualificationFinanciereEleveOutput[]> {
    await this.autorisationQualification.verifierConsultationQualification({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: input.idEleve,
    });

    const qualifications = await this.depotQualification.listerParEleve(input.idEcole, input.idEleve);
    return qualifications.map((qualification) => versQualificationFinanciereEleveOutput(qualification));
  }
}
