import type { ConsulterFraisExigiblesEleveInput } from 'contexts/paiements-facturation/application/dto/input/DettesEntreeDTO';
import type { FraisExigiblesEleveOutput } from 'contexts/paiements-facturation/application/dto/output/DettesSortieDTO';
import type { DepotObligationFinanciere } from 'contexts/paiements-facturation/domain/repositories/DepotObligationFinanciere';
import type { DepotParametresPaiementEcole } from 'contexts/paiements-facturation/domain/repositories/DepotParametresPaiementEcole';
import { ServiceLectureFraisExigibles } from 'contexts/paiements-facturation/application/services/ServiceLectureFraisExigibles';
import type { ScolariteElevesPort } from 'contexts/paiements-facturation/application/ports/ScolariteElevesPort';

export class ConsulterFraisExigiblesEleveUseCase {
  constructor(
    private readonly scolariteElevesPort: ScolariteElevesPort,
    private readonly depotObligationFinanciere: DepotObligationFinanciere,
    private readonly depotParametresPaiementEcole: DepotParametresPaiementEcole,
    private readonly serviceLectureFraisExigibles = new ServiceLectureFraisExigibles(),
  ) {}

  public async executer(input: ConsulterFraisExigiblesEleveInput): Promise<FraisExigiblesEleveOutput> {
    const eleve = await this.scolariteElevesPort.consulterEleve(input.idEleve);
    const inscription = await this.scolariteElevesPort.consulterInscriptionActive(input.idEleve);
    const obligations = inscription === null
      ? []
      : await this.depotObligationFinanciere.listerParEleveEtAnnee(eleve.idEcole, input.idEleve, inscription.idAnneeScolaire);
    const parametres = await this.depotParametresPaiementEcole.trouverActifParEcole(eleve.idEcole);
    const lecture = this.serviceLectureFraisExigibles.construire(
      input.idEleve,
      obligations,
      parametres?.obtenirPaiementPartielParTypeFrais(),
    );

    return {
      idEleve: lecture.idEleve,
      fraisDisponibles: lecture.frais.map((frais) => ({
        typeFrais: frais.typeFrais,
        libelle: frais.libelle,
        montantAttendu: frais.montantAttendu,
        paiementPartielAutorise: frais.paiementPartielAutorise,
        resteAPayer: frais.resteAPayer,
      })),
    };
  }
}
