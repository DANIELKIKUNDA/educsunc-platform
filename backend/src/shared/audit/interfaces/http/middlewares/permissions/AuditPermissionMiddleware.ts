import type { FastifyRequest } from 'fastify';
import { ErreurPermissionRefusee, ErreurScopeRefuse } from 'shared/security/domain';
import { PermissionGuard, ScopeGuard } from 'shared/security/interfaces/http/guards';
import {
  exigerPermissionContexte,
  exigerScopeContexte,
  exigerUtilisateurAuthentifie,
  obtenirContexte,
} from '../AuditMiddlewareSupport';

// Ce middleware centralise les controles de permission et de scope du module Audit.
export class AuditPermissionMiddleware {
  constructor(
    private readonly permissionGuard?: PermissionGuard,
    private readonly scopeGuard?: ScopeGuard,
  ) {}

  public async verifierPermission(
    requete: FastifyRequest,
    permissionDemandee: string,
  ): Promise<void> {
    const idUtilisateur = exigerUtilisateurAuthentifie(requete);

    if (this.permissionGuard) {
      try {
        await this.permissionGuard.verifier(idUtilisateur, permissionDemandee);
        return;
      } catch {
        // On retombe sur le contexte HTTP deja enrichi si le guard n est pas pleinement cable.
      }
    }

    try {
      exigerPermissionContexte(requete, permissionDemandee);
    } catch {
      throw new ErreurPermissionRefusee(
        `La permission ${permissionDemandee} est requise pour cette route Audit.`,
      );
    }
  }

  public async verifierScope(requete: FastifyRequest, scope: string): Promise<void> {
    const contexte = obtenirContexte(requete);
    const idUtilisateur = exigerUtilisateurAuthentifie(requete);

    if (this.scopeGuard) {
      try {
        await this.scopeGuard.verifier(
          idUtilisateur,
          contexte.organisationActiveId,
          contexte.ecoleActiveId,
        );
      } catch {
        throw new ErreurScopeRefuse(`Le scope ${scope} est invalide pour cette route Audit.`);
      }
    }

    try {
      exigerScopeContexte(requete, scope);
    } catch {
      throw new ErreurScopeRefuse(`Le scope ${scope} est invalide pour cette route Audit.`);
    }
  }
}
