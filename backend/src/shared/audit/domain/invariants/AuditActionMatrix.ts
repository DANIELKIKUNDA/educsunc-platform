import type {
  ActionAuditEnum,
  GraviteAuditEnum,
  NiveauAuditEnum,
  ResultatAuditEnum,
  TypeAuditEnum,
} from '../enums';

export interface DefinitionActionAuditable {
  action: ActionAuditEnum;
  typeAuditPrincipal: TypeAuditEnum;
  categoriesAudit: readonly TypeAuditEnum[];
  niveauAudit: NiveauAuditEnum;
  gravitesAutorisees: readonly GraviteAuditEnum[];
  snapshotsAutorises: boolean;
  actionSensible: boolean;
  resultatsAutorises?: readonly ResultatAuditEnum[];
}

// Cette matrice officielle traduit le tableau documentaire des actions auditables.
export const AUDIT_ACTION_MATRIX: Record<ActionAuditEnum, DefinitionActionAuditable> = {
  LOGIN_REUSSI: { action: 'LOGIN_REUSSI', typeAuditPrincipal: 'SECURITE', categoriesAudit: ['SECURITE'], niveauAudit: 'INFORMATION', gravitesAutorisees: ['FAIBLE'], snapshotsAutorises: false, actionSensible: false, resultatsAutorises: ['SUCCESS'] },
  LOGIN_ECHOUE: { action: 'LOGIN_ECHOUE', typeAuditPrincipal: 'SECURITE', categoriesAudit: ['SECURITE'], niveauAudit: 'AVERTISSEMENT', gravitesAutorisees: ['MOYENNE'], snapshotsAutorises: false, actionSensible: true, resultatsAutorises: ['FAILED', 'REFUSED'] },
  LOGOUT: { action: 'LOGOUT', typeAuditPrincipal: 'SECURITE', categoriesAudit: ['SECURITE'], niveauAudit: 'INFORMATION', gravitesAutorisees: ['FAIBLE'], snapshotsAutorises: false, actionSensible: false, resultatsAutorises: ['SUCCESS'] },
  SESSION_REVOQUEE: { action: 'SESSION_REVOQUEE', typeAuditPrincipal: 'SECURITE', categoriesAudit: ['SECURITE'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: false, actionSensible: true },
  ROLE_ATTRIBUE: { action: 'ROLE_ATTRIBUE', typeAuditPrincipal: 'SECURITE', categoriesAudit: ['SECURITE', 'ADMINISTRATIF'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: true, actionSensible: true },
  PERMISSION_AJOUTEE: { action: 'PERMISSION_AJOUTEE', typeAuditPrincipal: 'SECURITE', categoriesAudit: ['SECURITE', 'ADMINISTRATIF'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: true, actionSensible: true },
  ACCES_REFUSE: { action: 'ACCES_REFUSE', typeAuditPrincipal: 'SECURITE', categoriesAudit: ['SECURITE'], niveauAudit: 'AVERTISSEMENT', gravitesAutorisees: ['MOYENNE', 'ELEVEE'], snapshotsAutorises: false, actionSensible: true, resultatsAutorises: ['REFUSED'] },
  PAIEMENT_CREE: { action: 'PAIEMENT_CREE', typeAuditPrincipal: 'FINANCIER', categoriesAudit: ['FINANCIER', 'METIER'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: true, actionSensible: true },
  PAIEMENT_ANNULE: { action: 'PAIEMENT_ANNULE', typeAuditPrincipal: 'FINANCIER', categoriesAudit: ['FINANCIER', 'METIER'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['CRITIQUE'], snapshotsAutorises: true, actionSensible: true, resultatsAutorises: ['CANCELLED', 'SUCCESS'] },
  RECU_GENERE: { action: 'RECU_GENERE', typeAuditPrincipal: 'FINANCIER', categoriesAudit: ['FINANCIER'], niveauAudit: 'INFORMATION', gravitesAutorisees: ['MOYENNE'], snapshotsAutorises: false, actionSensible: true },
  CAISSE_CLOTUREE: { action: 'CAISSE_CLOTUREE', typeAuditPrincipal: 'FINANCIER', categoriesAudit: ['FINANCIER', 'METIER'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: true, actionSensible: true },
  COTE_ENCODEE: { action: 'COTE_ENCODEE', typeAuditPrincipal: 'PEDAGOGIQUE', categoriesAudit: ['PEDAGOGIQUE', 'METIER'], niveauAudit: 'INFORMATION', gravitesAutorisees: ['MOYENNE'], snapshotsAutorises: true, actionSensible: true },
  COTE_MODIFIEE: { action: 'COTE_MODIFIEE', typeAuditPrincipal: 'PEDAGOGIQUE', categoriesAudit: ['PEDAGOGIQUE', 'METIER'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: true, actionSensible: true },
  BULLETIN_GENERE: { action: 'BULLETIN_GENERE', typeAuditPrincipal: 'PEDAGOGIQUE', categoriesAudit: ['PEDAGOGIQUE', 'METIER'], niveauAudit: 'INFORMATION', gravitesAutorisees: ['MOYENNE'], snapshotsAutorises: false, actionSensible: true },
  PROCLAMATION_GENEREE: { action: 'PROCLAMATION_GENEREE', typeAuditPrincipal: 'PEDAGOGIQUE', categoriesAudit: ['PEDAGOGIQUE', 'METIER'], niveauAudit: 'INFORMATION', gravitesAutorisees: ['MOYENNE'], snapshotsAutorises: false, actionSensible: true },
  ELEVE_INSCRIT: { action: 'ELEVE_INSCRIT', typeAuditPrincipal: 'METIER', categoriesAudit: ['METIER', 'ADMINISTRATIF'], niveauAudit: 'INFORMATION', gravitesAutorisees: ['MOYENNE'], snapshotsAutorises: true, actionSensible: false },
  ABANDON_DECLARE: { action: 'ABANDON_DECLARE', typeAuditPrincipal: 'ADMINISTRATIF', categoriesAudit: ['ADMINISTRATIF', 'METIER'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: true, actionSensible: true },
  TRANSFERT_ENREGISTRE: { action: 'TRANSFERT_ENREGISTRE', typeAuditPrincipal: 'ADMINISTRATIF', categoriesAudit: ['ADMINISTRATIF', 'METIER'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: true, actionSensible: true },
  REFERENTIEL_MODIFIE: { action: 'REFERENTIEL_MODIFIE', typeAuditPrincipal: 'CONFORMITE', categoriesAudit: ['CONFORMITE', 'ADMINISTRATIF'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE', 'CRITIQUE'], snapshotsAutorises: true, actionSensible: true },
  PONDERATION_MODIFIEE: { action: 'PONDERATION_MODIFIEE', typeAuditPrincipal: 'PEDAGOGIQUE', categoriesAudit: ['PEDAGOGIQUE', 'CONFORMITE'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['CRITIQUE'], snapshotsAutorises: true, actionSensible: true },
  EXPORT_GENERE: { action: 'EXPORT_GENERE', typeAuditPrincipal: 'EXPORT', categoriesAudit: ['EXPORT', 'CONSULTATION_SENSIBLE'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: false, actionSensible: true },
  EXPORT_MASSIF: { action: 'EXPORT_MASSIF', typeAuditPrincipal: 'EXPORT', categoriesAudit: ['EXPORT', 'CONSULTATION_SENSIBLE'], niveauAudit: 'ALERTE', gravitesAutorisees: ['CRITIQUE'], snapshotsAutorises: false, actionSensible: true },
  AUDIT_CONSULTE: { action: 'AUDIT_CONSULTE', typeAuditPrincipal: 'CONSULTATION_SENSIBLE', categoriesAudit: ['CONSULTATION_SENSIBLE', 'SECURITE'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: false, actionSensible: true },
  SYNCHRONISATION_REUSSIE: { action: 'SYNCHRONISATION_REUSSIE', typeAuditPrincipal: 'SYNCHRONISATION', categoriesAudit: ['SYNCHRONISATION', 'SYSTEME'], niveauAudit: 'INFORMATION', gravitesAutorisees: ['FAIBLE'], snapshotsAutorises: false, actionSensible: false, resultatsAutorises: ['SUCCESS', 'RETRIED'] },
  CONFLIT_SYNCHRONISATION_DETECTE: { action: 'CONFLIT_SYNCHRONISATION_DETECTE', typeAuditPrincipal: 'SYNCHRONISATION', categoriesAudit: ['SYNCHRONISATION', 'SYSTEME'], niveauAudit: 'CRITIQUE', gravitesAutorisees: ['ELEVEE'], snapshotsAutorises: true, actionSensible: true, resultatsAutorises: ['CONFLICT', 'REPLAYED', 'IGNORED_DUPLICATE'] },
};
