import { ParametresPaiementEcole } from 'contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import type { DepotParametresPaiementEcole } from 'contexts/paiements-facturation/domain/repositories/DepotParametresPaiementEcole';
import type { ConfigurerParametresPaiementEcoleInput } from 'contexts/paiements-facturation/application/dto/input/ParametresPaiementEntreeDTO';
import type { ParametresPaiementEcoleOutput } from 'contexts/paiements-facturation/application/dto/output/ParametresPaiementSortieDTO';
import { versParametresPaiementOutput } from 'contexts/paiements-facturation/application/mappers/ParametresPaiementApplicationMapper';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export class ConfigurerParametresPaiementEcoleUseCase {
  constructor(
    private readonly depotParametresPaiementEcole: DepotParametresPaiementEcole,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: ConfigurerParametresPaiementEcoleInput): Promise<ParametresPaiementEcoleOutput> {
    const existant = await this.depotParametresPaiementEcole.trouverActifParEcole(input.idEcole);
    existant?.desactiver();
    if (existant !== null) {
      await this.depotParametresPaiementEcole.sauvegarder(existant);
    }

    const parametres = new ParametresPaiementEcole({
      idParametresPaiementEcole: `${input.idEcole}-${Date.now()}`,
      idEcole: input.idEcole,
      paiementPartielAutorise: input.paiementPartielAutorise,
      paiementPartielParTypeFrais: input.paiementPartielParTypeFrais === undefined
        ? undefined
        : new Map(Object.entries(input.paiementPartielParTypeFrais) as Array<[TypeFrais, boolean]>),
      politiqueArrieres: input.politiqueArrieres,
      autoriserInscriptionAvecDette: input.autoriserInscriptionAvecDette,
      bloquerRetraitDocumentsSiDette: input.bloquerRetraitDocumentsSiDette,
      appliquerFamilleNombreuse: input.appliquerFamilleNombreuse,
      nombreEnfantsSeuilFamilleNombreuse: input.nombreEnfantsSeuilFamilleNombreuse,
      modesPaiementAutorises: input.modesPaiementAutorises,
      moisObligatoireInscription: input.moisObligatoireInscription,
      exigerFraisInscription: input.exigerFraisInscription,
      actif: true,
      version: 1,
    });

    await this.depotParametresPaiementEcole.sauvegarder(parametres);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'CONFIGURER_PARAMETRES_PAIEMENT_ECOLE',
      idEcole: input.idEcole,
      referenceMetier: parametres.obtenirId(),
    });

    return versParametresPaiementOutput(parametres);
  }
}
