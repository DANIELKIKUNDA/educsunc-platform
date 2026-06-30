import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { EleveAffecteClasseSortieDTO } from '../../dto/output/EleveAffecteClasseSortieDTO';
import type { AutorisationAffectationClassePort } from '../../ports';

// Ce fichier contient le cas d'usage de liste des affectations actives d'une classe.
export interface ListerElevesParClasseEntree {
  idClassePedagogique: string;
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
}

/** Ce cas d'usage liste les affectations actives d'une classe. */
export class ListerElevesParClasse implements UseCase<ListerElevesParClasseEntree, EleveAffecteClasseSortieDTO[]> {
  constructor(
    private readonly depotAffectation: DepotAffectationClasse,
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly depotEleve: DepotEleve,
    private readonly autorisationAffectationClasse?: AutorisationAffectationClassePort,
  ) {}
  /** Execute la liste des eleves par classe. */
  public async executer(entree: ListerElevesParClasseEntree): Promise<EleveAffecteClasseSortieDTO[]> {
    await this.autorisationAffectationClasse?.verifierConsultationClassePedagogique({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idClassePedagogique: entree.idClassePedagogique,
    });
    const affectations = await this.depotAffectation.listerActivesParClasse(entree.idClassePedagogique);
    const lignes: EleveAffecteClasseSortieDTO[] = [];

    for (const affectation of affectations) {
      const inscription = await this.depotInscription.trouverParId(affectation.obtenirIdInscriptionScolaire());
      if (inscription === null) {
        continue;
      }

      const eleve = await this.depotEleve.trouverParId(inscription.obtenirIdEleve());
      if (eleve === null) {
        continue;
      }

      const eleveProjection = eleve.versProprietes();
      const affectationProjection = affectation.versProprietes();
      lignes.push({
        idEleve: eleveProjection.idEleve,
        matricule: eleveProjection.matricule,
        nom: eleveProjection.nom,
        postNom: eleveProjection.postNom,
        prenom: eleveProjection.prenom,
        sexe: eleveProjection.sexe,
        statutGlobal: eleveProjection.statutGlobal,
        idFamille: eleveProjection.idFamille,
        idInscriptionScolaire: inscription.obtenirId(),
        idAffectationClasse: affectationProjection.idAffectationClasse,
        idClassePedagogique: affectationProjection.idClassePedagogique,
        dateAffectation: affectationProjection.dateAffectation,
        motifAffectation: affectationProjection.motifAffectation,
        versionAffectation: affectationProjection.version,
      });
    }

    return lignes.sort((a, b) => `${a.nom} ${a.postNom} ${a.prenom ?? ''}`.localeCompare(`${b.nom} ${b.postNom} ${b.prenom ?? ''}`));
  }
}
