import type { DiagnosticIncidentProps } from '../entities';

// Ce fichier declare l evenement de generation d un diagnostic.

/** Cette classe represente la generation d un diagnostic. */
export class DiagnosticGenere {
  constructor(public readonly payload: DiagnosticIncidentProps) {}
}
