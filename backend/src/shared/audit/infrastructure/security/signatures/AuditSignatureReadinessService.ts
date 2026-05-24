// Cette couche prépare les futures signatures d événements, exports et bundles forensic.
export class AuditSignatureReadinessService {
  public obtenirPlan() {
    return {
      events: 'SIGNATURE_READY',
      exports: 'SIGNATURE_READY',
      forensic: 'SIGNATURE_READY',
      validation: 'SIGNATURE_VERIFICATION_READY',
    } as const;
  }
}
