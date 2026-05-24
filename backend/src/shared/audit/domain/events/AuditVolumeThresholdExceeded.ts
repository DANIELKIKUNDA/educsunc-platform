import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditVolumeThresholdExceeded extends EvenementDomaine { constructor(public readonly seuil: number, public readonly volumeObserve: number) { super('AuditVolumeThresholdExceeded'); } }
