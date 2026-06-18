import { randomUUID } from 'node:crypto';
import { DepotAffectationClasse } from '../../domain/repositories/DepotAffectationClasse';
import { DepotInscriptionScolaire } from '../../domain/repositories/DepotInscriptionScolaire';
import { DepotParcoursScolaireEleve } from '../../domain/repositories/DepotParcoursScolaireEleve';
import { EvenementParcours } from '../../domain/entities/EvenementParcours';
import { ParcoursScolaireEleve } from '../../domain/aggregates/ParcoursScolaireEleve';
import { TypeEvenementParcours } from '../../domain/value-objects/TypeEvenementParcours';

interface BaseHistorisationParcours {
  idOrganisation: string;
  idEcole: string;
  idEleve: string;
  declenchePar: string;
  dateEvenement?: Date;
  referenceMetier?: string;
  description?: string;
}

// Ce service centralise l'alimentation du parcours scolaire depuis les workflows amont.
export class HistorisationParcoursScolaire {
  constructor(
    private readonly depotParcours: DepotParcoursScolaireEleve,
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly depotAffectation: DepotAffectationClasse,
  ) {}

  public async enregistrerInscription(params: BaseHistorisationParcours & {
    idInscriptionScolaire: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.enregistrerEvenement({
      ...params,
      typeEvenement: TypeEvenementParcours.INSCRIPTION,
      idAnneeScolaire: params.idAnneeScolaire,
      referenceMetier: params.referenceMetier ?? params.idInscriptionScolaire,
    });
  }

  public async enregistrerValidationInscription(params: BaseHistorisationParcours & {
    idInscriptionScolaire: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.enregistrerEvenement({
      ...params,
      typeEvenement: TypeEvenementParcours.VALIDATION_INSCRIPTION,
      idAnneeScolaire: params.idAnneeScolaire,
      referenceMetier: params.referenceMetier ?? params.idInscriptionScolaire,
    });
  }

  public async enregistrerAnnulationInscription(params: BaseHistorisationParcours & {
    idInscriptionScolaire: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.enregistrerEvenement({
      ...params,
      typeEvenement: TypeEvenementParcours.ANNULATION_INSCRIPTION,
      idAnneeScolaire: params.idAnneeScolaire,
      referenceMetier: params.referenceMetier ?? params.idInscriptionScolaire,
    });
  }

  public async enregistrerAffectation(params: BaseHistorisationParcours & {
    idAffectationClasse: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
  }): Promise<void> {
    await this.enregistrerEvenement({
      ...params,
      typeEvenement: TypeEvenementParcours.AFFECTATION,
      idAnneeScolaire: params.idAnneeScolaire,
      idClassePedagogique: params.idClassePedagogique,
      referenceMetier: params.referenceMetier ?? params.idAffectationClasse,
    });
  }

  public async enregistrerChangementClasse(params: BaseHistorisationParcours & {
    idAffectationClasse: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
  }): Promise<void> {
    await this.enregistrerEvenement({
      ...params,
      typeEvenement: TypeEvenementParcours.CHANGEMENT_CLASSE,
      idAnneeScolaire: params.idAnneeScolaire,
      idClassePedagogique: params.idClassePedagogique,
      referenceMetier: params.referenceMetier ?? params.idAffectationClasse,
    });
  }

  public async enregistrerMutationStatut(params: BaseHistorisationParcours & {
    typeEvenement: TypeEvenementParcours;
    idAnneeScolaire?: string;
    idClassePedagogique?: string;
  }): Promise<void> {
    const perimetre = await this.resoudrePerimetreEleve(params.idEleve);
    await this.enregistrerEvenement({
      ...params,
      idAnneeScolaire: params.idAnneeScolaire ?? perimetre?.idAnneeScolaire,
      idClassePedagogique: params.idClassePedagogique ?? perimetre?.idClassePedagogique,
    });
  }

  private async enregistrerEvenement(params: BaseHistorisationParcours & {
    typeEvenement: TypeEvenementParcours;
    idAnneeScolaire?: string;
    idClassePedagogique?: string;
  }): Promise<void> {
    const parcours = await this.obtenirOuCreerParcours({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idEleve: params.idEleve,
    });

    parcours.enregistrerEvenement(EvenementParcours.creer({
      idEvenementParcours: randomUUID(),
      typeEvenement: params.typeEvenement,
      dateEvenement: params.dateEvenement ?? new Date(),
      idAnneeScolaire: params.idAnneeScolaire,
      idClassePedagogique: params.idClassePedagogique,
      referenceMetier: params.referenceMetier,
      description: params.description,
      declenchePar: params.declenchePar,
    }));

    await this.depotParcours.sauvegarder(parcours);
  }

  private async obtenirOuCreerParcours(params: {
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<ParcoursScolaireEleve> {
    return await this.depotParcours.trouverParEleve(params.idEleve)
      ?? ParcoursScolaireEleve.creer(
        randomUUID(),
        params.idOrganisation,
        params.idEcole,
        params.idEleve,
      );
  }

  private async resoudrePerimetreEleve(idEleve: string): Promise<{
    idAnneeScolaire?: string;
    idClassePedagogique?: string;
  } | null> {
    const inscription = await this.depotInscription.trouverDerniereInscriptionActiveParEleve(idEleve);

    if (inscription === null) {
      return null;
    }

    const affectation = await this.depotAffectation.trouverAffectationActiveParInscription(
      inscription.obtenirId(),
    );

    return {
      idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
      idClassePedagogique: affectation?.obtenirIdClassePedagogique(),
    };
  }
}
