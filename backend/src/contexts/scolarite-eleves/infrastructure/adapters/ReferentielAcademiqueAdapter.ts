import { InformationsClassePedagogique, ReferentielAcademiquePort } from '../../application/ports/ReferentielAcademiquePort';
import { ClientHttpScolarite } from './ClientHttpScolarite';

// Ce fichier implemente le port vers le BC Referentiel Academique.
/**
 * Cet adapter transforme les appels applicatifs en appels techniques vers le referentiel.
 */
export class ReferentielAcademiqueAdapter implements ReferentielAcademiquePort {
  constructor(private readonly clientHttp: ClientHttpScolarite, private readonly urlBase: string) {}

  /** Verifie l'existence d'une organisation. */
  public async verifierOrganisationExiste(idOrganisation: string): Promise<boolean> {
    const reponse = await this.clientHttp.get(`${this.urlBase}/organisations/${idOrganisation}`);
    return reponse.statut === 200;
  }

  /** Verifie qu'une ecole appartient a une organisation. */
  public async verifierEcoleAppartientOrganisation(idOrganisation: string, idEcole: string): Promise<boolean> {
    const reponse = await this.clientHttp.get<{ idOrganisation: string }>(`${this.urlBase}/ecoles/${idEcole}`);
    return reponse.statut === 200 && reponse.corps.idOrganisation === idOrganisation;
  }

  /** Verifie qu'une annee scolaire est exploitable. */
  public async verifierAnneeScolaireValide(idEcole: string, idAnneeScolaire: string): Promise<boolean> {
    const reponse = await this.clientHttp.get(`${this.urlBase}/ecoles/${idEcole}/annees/${idAnneeScolaire}`);
    return reponse.statut === 200;
  }

  /** Recupere les informations techniques d'une classe pedagogique. */
  public async obtenirClassePedagogique(idClassePedagogique: string): Promise<InformationsClassePedagogique | null> {
    const reponse = await this.clientHttp.get<InformationsClassePedagogique>(`${this.urlBase}/classes-pedagogiques/${idClassePedagogique}`);
    return reponse.statut === 200 ? reponse.corps : null;
  }
}
