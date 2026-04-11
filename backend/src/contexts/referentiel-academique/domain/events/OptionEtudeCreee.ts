import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { OptionEtudeId } from '../value-objects/OptionEtudeId';

// Cet evenement de domaine trace la creation d'une option d'etude.
export class OptionEtudeCreee extends EvenementDomaine {
  private readonly idOptionEtude: OptionEtudeId;

  // Ce constructeur initialise l'identifiant de l'option d'etude concernee.
  constructor(idOptionEtude: OptionEtudeId) {
    super('OptionEtudeCreee');
    this.idOptionEtude = idOptionEtude;
  }

  // Cette methode retourne l'identifiant de l'option d'etude concernee.
  public obtenirIdOptionEtude(): OptionEtudeId {
    return this.idOptionEtude;
  }
}
