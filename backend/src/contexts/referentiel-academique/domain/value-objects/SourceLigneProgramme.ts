// Cet enum represente la provenance metier autorisee d'une ligne de programme.
export enum SourceLigneProgramme {
  OFFICIEL = 'OFFICIEL',
  AJOUT_ETAT = 'AJOUT_ETAT',
  HERITE_ANCIENNE_VERSION = 'HERITE_ANCIENNE_VERSION',
  OBSOLETE = 'OBSOLETE',
}
