import { EleveSortieDTO } from '../../application/dto/output/EleveSortieDTO';

// Ce fichier contient le service infrastructure d'export specifique aux eleves.
/**
 * Ce service prepare des exports simples sans devenir un service de stockage generique.
 */
export class ExportEleveService {
  /** Transforme une liste d'eleves en representation JSON exportable. */
  public exporterVersJson(eleves: EleveSortieDTO[]): string {
    return JSON.stringify(eleves, null, 2);
  }
}
