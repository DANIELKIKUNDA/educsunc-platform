import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { OptionEtudeId } from '../value-objects/OptionEtudeId';

// Cet evenement de domaine trace le renommage d'une option d'etude.
export class OptionEtudeRenommee extends EvenementDomaine {
  private readonly idOptionEtude: OptionEtudeId;

  // Ce constructeur initialise l'identifiant de l'option d'etude concernee.
  constructor(idOptionEtude: OptionEtudeId) {
    super('OptionEtudeRenommee');
    this.idOptionEtude = idOptionEtude;
  }

  // Cette methode retourne l'identifiant de l'option d'etude concernee.
  public obtenirIdOptionEtude(): OptionEtudeId {
    return this.idOptionEtude;
  }
}
