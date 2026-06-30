import type { ActiverQualificationFinanciereEleveInput } from '../../dto/input/QualificationsFinancieresEntreeDTO';
import type { QualificationFinanciereEleveOutput } from '../../dto/output/QualificationsFinancieresSortieDTO';
import type { AutorisationQualificationFinanciereElevePort } from '../../ports/AutorisationQualificationFinanciereElevePort';
import { versQualificationFinanciereEleveOutput } from '../../mappers/QualificationFinanciereEleveApplicationMapper';
import { QualificationFinanciereEleve } from '../../../domain/aggregates/QualificationFinanciereEleve';
import type { DepotQualificationFinanciereEleve } from '../../../domain/repositories/DepotQualificationFinanciereEleve';

export class ActiverQualificationFinanciereEleveUseCase {
  constructor(
    private readonly depotQualification: DepotQualificationFinanciereEleve,
    private readonly autorisationQualification: AutorisationQualificationFinanciereElevePort,
  ) {}

  public async executer(input: ActiverQualificationFinanciereEleveInput): Promise<QualificationFinanciereEleveOutput> {
    await this.autorisationQualification.verifierGestionQualification({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: input.idEleve,
    });

    const existante = await this.depotQualification.trouverActiveParEleveEtCode({
      idEcole: input.idEcole,
      idEleve: input.idEleve,
      codeQualification: input.codeQualification,
    });
    if (existante !== null) {
      return versQualificationFinanciereEleveOutput(existante);
    }

    const qualification = QualificationFinanciereEleve.activer({
      idQualification: `${input.idEcole}-${input.idEleve}-${input.codeQualification}`,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: input.idEleve,
      codeQualification: input.codeQualification,
      raison: input.raison,
      dateDebutEffet: input.dateDebutEffet,
      details: input.details,
      creePar: input.idUtilisateur,
    });

    await this.depotQualification.sauvegarder(qualification);
    return versQualificationFinanciereEleveOutput(qualification);
  }
}
