import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { NiveauGraviteAnomalie } from '../value-objects/NiveauGraviteAnomalie';
import { TypeAnomalieAcademique } from '../value-objects/TypeAnomalieAcademique';

// Cet evenement signale qu'une anomalie academique a ete detectee.
export class AnomalieAcademiqueDetectee extends EvenementDomaine {
  public readonly idDiagnosticTechniqueAcademique: string;
  public readonly typeAnomalie: TypeAnomalieAcademique;
  public readonly niveauGravite: NiveauGraviteAnomalie;
  public readonly message: string;
  public readonly detecteLe: Date;

  constructor(
    idDiagnosticTechniqueAcademique: string,
    typeAnomalie: TypeAnomalieAcademique,
    niveauGravite: NiveauGraviteAnomalie,
    message: string,
    detecteLe: Date,
  ) {
    super('AnomalieAcademiqueDetectee');
    this.idDiagnosticTechniqueAcademique = idDiagnosticTechniqueAcademique;
    this.typeAnomalie = typeAnomalie;
    this.niveauGravite = niveauGravite;
    this.message = message;
    this.detecteLe = detecteLe;
  }
}
