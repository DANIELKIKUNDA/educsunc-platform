// Ce DTO represente les statistiques calculees d'une proclamation.
export interface StatistiquesProclamationOutput {
  inscritsGarcons: number;
  inscritsFilles: number;
  inscritsTotal: number;
  participantsGarcons: number;
  participantsFilles: number;
  participantsTotal: number;
  classesGarcons: number;
  classesFilles: number;
  classesTotal: number;
  nonClassesGarcons: number;
  nonClassesFilles: number;
  nonClassesTotal: number;
  abandonsGarcons: number;
  abandonsFilles: number;
  abandonsTotal: number;
  reussitesGarcons: number;
  reussitesFilles: number;
  reussitesTotal: number;
  echecsGarcons: number;
  echecsFilles: number;
  echecsTotal: number;
  tauxParticipation: number;
  tauxReussite: number;
  tauxEchec: number;
  tauxAbandon: number;
}
