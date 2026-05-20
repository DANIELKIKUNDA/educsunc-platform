import { AffectationTitulariat } from '../aggregates/AffectationTitulariat';
import { PolicyTitulariatClasse } from '../policies/PolicyTitulariatClasse';

// Ce moteur porte la logique d'attribution et de verification du titulariat.
export class MoteurTitulariat {
  public attribuerTitulariat(params: {
    idUtilisateur: string;
    idClasse: string;
    idAnneeScolaire: string;
    creePar?: string;
    classePossedeDejaTitulaire?: boolean;
  }): AffectationTitulariat {
    PolicyTitulariatClasse.verifier(Boolean(params.classePossedeDejaTitulaire));
    return AffectationTitulariat.attribuer(params);
  }

  public verifierTitulariat(titulariat: AffectationTitulariat): void {
    titulariat.verifierTitulariat();
  }
}
