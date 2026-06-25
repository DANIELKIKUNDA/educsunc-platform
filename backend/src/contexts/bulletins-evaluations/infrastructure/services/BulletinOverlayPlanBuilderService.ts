import type { BulletinDocumentDataReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type { BulletinOverlayPlanReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinOverlayPlanReadModel';
import type { BulletinTemplateLayoutReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinTemplateLayoutReadModel';
import { BulletinMasterBackgroundResolverService } from './BulletinMasterBackgroundResolverService';

function lireValeurDepuisChemin(source: string | undefined, documentData: BulletinDocumentDataReadModel): string {
  if (source === undefined) {
    return '';
  }

  const valeur = source.split('.').reduce<unknown>((courant, segment) => {
    if (courant === null || courant === undefined || typeof courant !== 'object') {
      return undefined;
    }

    return Reflect.get(courant as object, segment);
  }, documentData);

  if (valeur === null || valeur === undefined) {
    return '';
  }

  if (typeof valeur === 'string' || typeof valeur === 'number' || typeof valeur === 'boolean') {
    return String(valeur);
  }

  return '';
}

// Ce service transforme les donnees documentaires en plan overlay exploitable par un renderer reel.
export class BulletinOverlayPlanBuilderService {
  constructor(
    private readonly backgroundResolver = new BulletinMasterBackgroundResolverService(),
  ) {}

  public construire(
    documentData: BulletinDocumentDataReadModel,
    layout: BulletinTemplateLayoutReadModel,
  ): BulletinOverlayPlanReadModel {
    const background = this.backgroundResolver.resoudre(layout);

    return {
      template: layout.template,
      backgroundId: background.id,
      versionLayout: layout.version,
      elements: layout.zones
        .map((zone) => ({
          zoneId: zone.id,
          page: zone.page,
          mode: zone.mode,
          valeur: lireValeurDepuisChemin(zone.source, documentData),
        }))
        .filter((element) => element.valeur.length > 0 || element.mode === 'image'),
      tables: layout.tables.map((table) => ({
        tableId: table.id,
        page: table.page,
        nombreLignes: documentData.structure.lignes.length,
        colonnes: table.colonnes,
      })),
    };
  }
}
