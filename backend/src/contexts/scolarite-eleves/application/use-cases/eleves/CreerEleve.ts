import { UseCase } from '../../../../../shared/application/UseCase';
import { Eleve } from '../../../domain/aggregates/Eleve';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { EcoleProvenance } from '../../../domain/value-objects/EcoleProvenance';
import { TypeProvenanceEcole } from '../../../domain/value-objects/TypeProvenanceEcole';
import { CreerEleveEntreeDTO } from '../../dto/input/CreerEleveEntreeDTO';
import { EleveDetailSortieDTO } from '../../dto/output/EleveDetailSortieDTO';
import { ErreurValidationDTO } from '../../exceptions/ErreurValidationDTO';
import { EleveMapper } from '../../mappers/EleveMapper';
import { ServiceApplicationTenant } from '../../services/ServiceApplicationTenant';
import { ServiceTransactionApplication, ServiceTransactionApplicationSansEffet } from '../../services/ServiceTransactionApplication';

// Ce fichier contient le cas d'usage de creation d'un eleve.
export interface SortieCreerEleve { eleve: EleveDetailSortieDTO }

/**
 * Ce cas d'usage orchestre la creation de l'identite permanente d'un eleve.
 */
export class CreerEleve implements UseCase<CreerEleveEntreeDTO, SortieCreerEleve> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly serviceTenant: ServiceApplicationTenant = new ServiceApplicationTenant(),
    private readonly serviceTransaction: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
  ) {}

  /** Execute la creation d'un eleve apres validation applicative minimale. */
  public async executer(entree: CreerEleveEntreeDTO): Promise<SortieCreerEleve> {
    this.validerEntree(entree);
    await this.serviceTenant.verifierTenant(entree.idOrganisation, entree.idEcole);

    return this.serviceTransaction.executerDansTransaction(async () => {
      const ecoleProvenance = entree.typeProvenance === TypeProvenanceEcole.INTERNE
        ? EcoleProvenance.interne(entree.idEcoleProvenance ?? '', entree.nomEcoleProvenance)
        : EcoleProvenance.externe(entree.nomEcoleProvenance);

      const eleve = Eleve.creer({
        idEleve: entree.idEleve,
        idOrganisation: entree.idOrganisation,
        idEcole: entree.idEcole,
        matricule: entree.matricule,
        nom: entree.nom,
        postNom: entree.postNom,
        prenom: entree.prenom,
        sexe: entree.sexe,
        dateNaissance: entree.dateNaissance,
        lieuNaissance: entree.lieuNaissance,
        nationalite: entree.nationalite,
        ecoleProvenance,
        idFamille: entree.idFamille,
        creePar: entree.idUtilisateur,
      });

      await this.depotEleve.sauvegarder(eleve);

      return { eleve: EleveMapper.versDetail(eleve) };
    });
  }

  private validerEntree(entree: CreerEleveEntreeDTO): void {
    if (entree.idEleve?.trim().length === 0 || entree.nom?.trim().length === 0 || entree.postNom?.trim().length === 0) {
      throw new ErreurValidationDTO('idEleve, nom et postNom sont obligatoires pour creer un eleve.');
    }
  }
}
