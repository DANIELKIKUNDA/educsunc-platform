import type {
  BulletinTemplateLayoutReadModel,
  BulletinTemplateTableLayoutReadModel,
  BulletinTemplateZoneReadModel,
} from 'contexts/bulletins-evaluations/application/read-models/BulletinTemplateLayoutReadModel';
import type { BulletinTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import { BulletinTemplateManifestFileRepository } from './BulletinTemplateManifestFileRepository';

function creerZonesCommunes(): BulletinTemplateZoneReadModel[] {
  return [
    {
      id: 'z_institution_pays',
      page: 1,
      famille: 'Z-INSTITUTION',
      ancrage: 'bande haute centrale',
      alignement: 'center',
      mode: 'text',
      source: 'identiteInstitutionnelle.pays',
      politiqueOverflow: 'reduce-font',
      criticite: 'forte',
    },
    {
      id: 'z_institution_ministere',
      page: 1,
      famille: 'Z-INSTITUTION',
      ancrage: 'sous pays',
      alignement: 'center',
      mode: 'text',
      source: 'identiteInstitutionnelle.ministere',
      politiqueOverflow: 'reduce-font',
      criticite: 'forte',
    },
    {
      id: 'z_titre_niveau',
      page: 1,
      famille: 'Z-TITRE',
      ancrage: 'ligne centrale de titre',
      alignement: 'center',
      mode: 'text',
      source: 'meta.libelleNiveauDocumentaire',
      politiqueOverflow: 'reduce-font',
      criticite: 'critique',
    },
    {
      id: 'z_admin_id_document',
      page: 1,
      famille: 'Z-ADMIN',
      ancrage: 'haut gauche du bloc administratif',
      alignement: 'left',
      mode: 'text',
      source: 'meta.idBulletinEleve',
      politiqueOverflow: 'truncate',
      criticite: 'standard',
    },
    {
      id: 'z_admin_province',
      page: 1,
      famille: 'Z-ADMIN',
      ancrage: 'ligne province educationnelle',
      alignement: 'left',
      mode: 'text',
      source: 'identiteInstitutionnelle.provinceEducationnelle',
      politiqueOverflow: 'reduce-font',
      criticite: 'forte',
    },
    {
      id: 'z_admin_ville',
      page: 1,
      famille: 'Z-ADMIN',
      ancrage: 'ligne ville',
      alignement: 'left',
      mode: 'text',
      source: 'identiteInstitutionnelle.ville',
      politiqueOverflow: 'reduce-font',
      criticite: 'forte',
    },
    {
      id: 'z_admin_commune_territoire',
      page: 1,
      famille: 'Z-ADMIN',
      ancrage: 'ligne commune / territoire',
      alignement: 'left',
      mode: 'text',
      source: 'identiteInstitutionnelle.communeOuTerritoire',
      politiqueOverflow: 'reduce-font',
      criticite: 'forte',
    },
    {
      id: 'z_admin_ecole',
      page: 1,
      famille: 'Z-ADMIN',
      ancrage: 'ligne ecole',
      alignement: 'left',
      mode: 'text',
      source: 'identiteInstitutionnelle.nomEcole',
      politiqueOverflow: 'reduce-font',
      criticite: 'critique',
    },
    {
      id: 'z_admin_code_ecole',
      page: 1,
      famille: 'Z-ADMIN',
      ancrage: 'case code',
      alignement: 'left',
      mode: 'text',
      source: 'identiteInstitutionnelle.codeEcole',
      politiqueOverflow: 'truncate',
      criticite: 'forte',
    },
    {
      id: 'z_eleve_nom_complet',
      page: 1,
      famille: 'Z-ELEVE',
      ancrage: 'ligne eleve',
      alignement: 'left',
      mode: 'text',
      source: 'identiteEleve.nomComplet',
      politiqueOverflow: 'reduce-font',
      criticite: 'critique',
    },
    {
      id: 'z_eleve_sexe',
      page: 1,
      famille: 'Z-ELEVE',
      ancrage: 'case sexe',
      alignement: 'center',
      mode: 'text',
      source: 'identiteEleve.sexe',
      politiqueOverflow: 'truncate',
      criticite: 'forte',
    },
    {
      id: 'z_eleve_lieu_naissance',
      page: 1,
      famille: 'Z-ELEVE',
      ancrage: 'ligne ne(e) a',
      alignement: 'left',
      mode: 'text',
      source: 'identiteEleve.lieuNaissance',
      politiqueOverflow: 'truncate',
      criticite: 'forte',
    },
    {
      id: 'z_eleve_date_naissance',
      page: 1,
      famille: 'Z-ELEVE',
      ancrage: 'ligne le',
      alignement: 'center',
      mode: 'text',
      source: 'identiteEleve.dateNaissance',
      politiqueOverflow: 'truncate',
      criticite: 'forte',
    },
    {
      id: 'z_eleve_classe',
      page: 1,
      famille: 'Z-ELEVE',
      ancrage: 'ligne classe',
      alignement: 'left',
      mode: 'text',
      source: 'identiteEleve.libelleClasse',
      politiqueOverflow: 'reduce-font',
      criticite: 'critique',
    },
    {
      id: 'z_eleve_numero_permanent',
      page: 1,
      famille: 'Z-ELEVE',
      ancrage: 'case numero permanent',
      alignement: 'left',
      mode: 'text',
      source: 'identiteEleve.numeroPermanent',
      politiqueOverflow: 'truncate',
      criticite: 'forte',
    },
    {
      id: 'z_titre_annee_scolaire',
      page: 1,
      famille: 'Z-TITRE',
      ancrage: 'titre annee',
      alignement: 'center',
      mode: 'text',
      source: 'meta.libelleAnneeScolaire',
      politiqueOverflow: 'truncate',
      criticite: 'critique',
    },
    {
      id: 'z_synthese_application',
      page: 1,
      famille: 'Z-SYNTHESE',
      ancrage: 'case application',
      alignement: 'center',
      mode: 'text',
      source: 'structure.resumeGlobal.application',
      politiqueOverflow: 'truncate',
      criticite: 'forte',
    },
    {
      id: 'z_synthese_conduite',
      page: 1,
      famille: 'Z-SYNTHESE',
      ancrage: 'case conduite',
      alignement: 'center',
      mode: 'text',
      source: 'structure.resumeGlobal.conduite',
      politiqueOverflow: 'truncate',
      criticite: 'forte',
    },
    {
      id: 'z_signature_date',
      page: 1,
      famille: 'Z-DECISION-SIGNATURE',
      ancrage: 'ligne date signature',
      alignement: 'center',
      mode: 'text',
      source: 'meta.dateEditionDocument',
      politiqueOverflow: 'truncate',
      criticite: 'forte',
    },
    {
      id: 'z_signature_ville',
      page: 1,
      famille: 'Z-DECISION-SIGNATURE',
      ancrage: 'ligne ville signature',
      alignement: 'left',
      mode: 'text',
      source: 'identiteInstitutionnelle.villeSignature',
      politiqueOverflow: 'truncate',
      criticite: 'forte',
    },
    {
      id: 'z_legal_reference',
      page: 1,
      famille: 'Z-LEGAL',
      ancrage: 'fin de ligne note importante',
      alignement: 'left',
      mode: 'text',
      source: 'meta.referenceDocumentaire',
      politiqueOverflow: 'truncate',
      criticite: 'standard',
    },
    {
      id: 'z_cachet_ecole',
      page: 1,
      famille: 'Z-DECISION-SIGNATURE',
      ancrage: 'zone sceau ecole',
      alignement: 'center',
      mode: 'image',
      source: 'assets.cachet',
      politiqueOverflow: 'n/a',
      criticite: 'forte',
    },
  ];
}

function creerTableauStandard(
  source: string,
  colonnes: string[],
): BulletinTemplateTableLayoutReadModel {
  return {
    id: 'z_table_rows_window',
    page: 1,
    source,
    colonnes,
    hauteurLigne: 'FIXE',
  };
}

// Ce service centralise les layouts documentaires versionnes des templates bulletin.
export class BulletinTemplateLayoutRegistryService {
  constructor(
    private readonly manifestRepository = new BulletinTemplateManifestFileRepository(),
  ) {}

  public async resoudre(template: BulletinTemplateDocumentaire): Promise<BulletinTemplateLayoutReadModel> {
    const manifest = await this.manifestRepository.charger(template);

    if (manifest !== null) {
      return this.completerZonesSiNecessaire(manifest);
    }

    return this.resoudreFallback(template);
  }

  private resoudreFallback(template: BulletinTemplateDocumentaire): BulletinTemplateLayoutReadModel {
    switch (template) {
      case 'BULL-TPL-01':
        return {
          template,
          version: '2026.06.23-bull-tpl-01',
          pages: [{
            numeroPage: 1,
            formatPage: 'A4-PORTRAIT',
            background: {
              id: 'bull-tpl-01/background-master-neutralise',
              format: 'PDF',
              description: 'Fond maitre neutralise bulletin trimestriel general',
              neutralise: true,
            },
          }],
          zones: creerZonesCommunes(),
          tables: [creerTableauStandard('structure.lignes', [
            'branche',
            't1_max_per',
            't1_p1',
            't1_p2',
            't1_max_ex',
            't1_pts_obt_ex',
            't1_max_trim',
            't1_pts_obt_trim',
            't2_p3',
            't2_p4',
            't2_max_ex',
            't2_pts_obt_ex',
            't2_max_trim',
            't2_pts_obt_trim',
            't3_p5',
            't3_p6',
            't3_max_ex',
            't3_pts_obt_ex',
            't3_max_trim',
            't3_pts_obt_trim',
            'total_max_pts',
            'total_pts_obt',
          ])],
        };
      case 'BULL-TPL-03':
        return {
          template,
          version: '2026.06.23-bull-tpl-03',
          pages: [{
            numeroPage: 1,
            formatPage: 'A4-PORTRAIT',
            background: {
              id: 'bull-tpl-03/background-master-neutralise',
              format: 'PDF',
              description: 'Fond maitre neutralise bulletin semestriel domaines',
              neutralise: true,
            },
          }],
          zones: creerZonesCommunes(),
          tables: [creerTableauStandard('structure.lignes', [
            'branche',
            's1_total',
            's2_total',
            'total_general',
            'repechage',
          ])],
        };
      case 'BULL-TPL-04':
        return {
          template,
          version: '2026.06.23-bull-tpl-04',
          pages: [{
            numeroPage: 1,
            formatPage: 'A4-PORTRAIT',
            background: {
              id: 'bull-tpl-04/background-master-neutralise',
              format: 'PDF',
              description: 'Fond maitre neutralise bulletin enseignement special',
              neutralise: true,
            },
          }],
          zones: creerZonesCommunes(),
          tables: [creerTableauStandard('structure.lignes', ['structure-speciale'])],
        };
      case 'BULL-TPL-02':
      case 'BULL-TPL-05':
      case 'BULL-TPL-06':
      default:
        return {
          template,
          version: `2026.06.23-${template.toLowerCase()}`,
          pages: [{
            numeroPage: 1,
            formatPage: 'A4-PORTRAIT',
            background: {
              id: `${template.toLowerCase()}/background-master-neutralise`,
              format: 'PDF',
              description: 'Fond maitre neutralise bulletin semestriel branches',
              neutralise: true,
            },
          }],
          zones: creerZonesCommunes(),
          tables: [creerTableauStandard('structure.lignes', [
            'branche',
            's1_total',
            's2_total',
            'total_general',
            'repechage',
          ])],
        };
    }
  }

  private completerZonesSiNecessaire(
    manifest: BulletinTemplateLayoutReadModel,
  ): BulletinTemplateLayoutReadModel {
    const zonesCommunes = creerZonesCommunes();

    if (manifest.zones.length === 0) {
      return {
        ...manifest,
        zones: zonesCommunes,
      };
    }

    const zonesExistantes = new Set(manifest.zones.map((zone) => zone.id));
    return {
      ...manifest,
      zones: [
        ...manifest.zones,
        ...zonesCommunes.filter((zone) => !zonesExistantes.has(zone.id)),
      ],
    };
  }
}
