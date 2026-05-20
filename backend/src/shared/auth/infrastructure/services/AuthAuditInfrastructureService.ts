import { SecurityAuditAdapter } from '../adapters/security/SecurityAuditAdapter';

// Ce service expose la facade technique d'audit de securite pour AUTH.
export class AuthAuditInfrastructureService extends SecurityAuditAdapter {}
