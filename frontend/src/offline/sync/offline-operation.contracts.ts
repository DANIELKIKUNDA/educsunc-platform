import type { RequeteApi } from '../../shared/http/api.client';
import type { OfflineOperationType } from '../database';

export interface EncoderCoteOfflinePayload {
  idFicheCotationEleveCours: string;
  codeColonne: string;
  cote: number;
  versionAttendue: number;
}

export interface ModifierCoteOfflinePayload {
  idFicheCotationEleveCours: string;
  codeColonne: string;
  nouvelleCote: number;
  versionAttendue: number;
}

export type OfflineOperationPayload =
  | EncoderCoteOfflinePayload
  | ModifierCoteOfflinePayload;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasCommonGradeFields(payload: Record<string, unknown>): boolean {
  return typeof payload.idFicheCotationEleveCours === 'string'
    && payload.idFicheCotationEleveCours.trim().length > 0
    && typeof payload.codeColonne === 'string'
    && payload.codeColonne.trim().length > 0
    && Number.isInteger(payload.versionAttendue)
    && Number(payload.versionAttendue) >= 0;
}

export function assertOfflineOperationPayload(
  operationType: OfflineOperationType,
  payload: unknown,
): asserts payload is OfflineOperationPayload {
  if (!isRecord(payload) || !hasCommonGradeFields(payload)) {
    throw new Error('Cette operation de cotation ne peut pas etre conservee hors ligne.');
  }

  if (operationType === 'ENCODER_COTE' && !Number.isFinite(payload.cote)) {
    throw new Error('La cote a conserver hors ligne est invalide.');
  }
  if (operationType === 'MODIFIER_COTE' && !Number.isFinite(payload.nouvelleCote)) {
    throw new Error('La nouvelle cote a conserver hors ligne est invalide.');
  }
}

export function buildOfflineReplayRequest(
  operationType: OfflineOperationType,
  payload: unknown,
  contextHeaders: Record<string, string>,
  idempotencyKey: string,
): RequeteApi {
  assertOfflineOperationPayload(operationType, payload);
  const headers = {
    ...contextHeaders,
    'x-idempotency-key': idempotencyKey,
    'x-sync-origin': 'OFFLINE',
  };

  if (operationType === 'ENCODER_COTE') {
    return {
      chemin: '/api/cotes',
      methode: 'POST',
      corps: payload,
      entetes: headers,
    };
  }

  const modification = payload as ModifierCoteOfflinePayload;
  return {
    chemin: `/api/cotes/${encodeURIComponent(modification.idFicheCotationEleveCours)}`,
    methode: 'PUT',
    corps: {
      codeColonne: modification.codeColonne,
      nouvelleCote: modification.nouvelleCote,
      versionAttendue: modification.versionAttendue,
    },
    entetes: headers,
  };
}
