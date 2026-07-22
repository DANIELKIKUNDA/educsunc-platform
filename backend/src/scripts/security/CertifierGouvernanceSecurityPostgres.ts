import { randomUUID } from 'node:crypto';
import { RefreshToken, SessionUtilisateur } from '../../shared/auth/domain';
import { PostgresRefreshTokenRepository, PostgresSessionUtilisateurRepository } from '../../shared/auth/infrastructure';
import { ClientPoolPostgresAuth, creerPoolPostgresAuth, obtenirClientPostgresAuth, obtenirPoolPostgresAuth } from '../../shared/auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { SecurityGovernanceError, SecurityGovernancePostgresService } from '../../shared/security/infrastructure/services/SecurityGovernancePostgresService';

const PASSWORD='CertificationEduSync2026';
const ACTOR='certification-security-postgres';

function expect(condition:unknown,message:string): asserts condition { if(!condition) throw new Error(message); }
function userId(value:Record<string,unknown>):string { const id=String(value.id_utilisateur ?? ''); expect(id,'Le compte de certification ne possède pas d’identifiant.'); return id; }

type AccesTemporaire={sessionId:string;refreshTokenId:string};

async function creerAccesTemporaire(
  utilisateurId:string,
  tokenVersion:number,
  libelle:string,
  sessions:PostgresSessionUtilisateurRepository,
  refreshTokens:PostgresRefreshTokenRepository,
):Promise<AccesTemporaire>{
  const sessionId=`security-cert-session-${libelle}-${randomUUID()}`;
  const refreshToken=RefreshToken.creer({
    idUtilisateur:utilisateurId,idSessionUtilisateur:sessionId,
    tokenHash:`security-cert-hash-${randomUUID()}`,tokenVersionEmise:tokenVersion,
  });
  const session=new SessionUtilisateur({
    idSessionUtilisateur:sessionId,idUtilisateur:utilisateurId,refreshTokenId:refreshToken.obtenirId(),
    deviceId:`security-cert-${libelle}`,estOffline:false,creeLe:new Date(),version:1,
  });
  await refreshTokens.sauvegarder(refreshToken);
  await sessions.sauvegarder(session);
  return {sessionId,refreshTokenId:refreshToken.obtenirId()};
}

function contientCleSecrete(value:unknown):boolean{
  if(!value || typeof value!=='object') return false;
  return Object.entries(value).some(([cle,enfant])=>
    /mot.?de.?passe|password|secret|hash/i.test(cle) || contientCleSecrete(enfant));
}

async function main():Promise<void>{
  const shared=obtenirClientPostgresAuth();
  const poolA=creerPoolPostgresAuth(); const poolB=creerPoolPostgresAuth();
  const clientA=new ClientPoolPostgresAuth(poolA); const clientB=new ClientPoolPostgresAuth(poolB);
  const serviceA=new SecurityGovernancePostgresService(clientA); const serviceB=new SecurityGovernancePostgresService(clientB);
  const sessions=new PostgresSessionUtilisateurRepository(shared);
  const refreshTokens=new PostgresRefreshTokenRepository(shared);
  const suffix=randomUUID().slice(0,8); const orgA=randomUUID(); const orgB=randomUUID(); const schoolA=randomUUID(); const schoolB=randomUUID();
  const createdUsers:string[]=[];
  try{
    await shared.executer(`INSERT INTO organisations(id,code,nom,type_organisation,actif,cree_par)
      VALUES($1,$2,$3,'SCOLAIRE',TRUE,$4),($5,$6,$7,'SCOLAIRE',TRUE,$4)`,
      [orgA,`CERT-A-${suffix}`,`Certification Organisation A ${suffix}`,ACTOR,orgB,`CERT-B-${suffix}`,`Certification Organisation B ${suffix}`]);
    await shared.executer(`INSERT INTO ecoles(id,id_organisation,code,nom,mode_exploitation,actif,cree_par)
      VALUES($1,$2,$3,$4,'SYNC',TRUE,$5),($6,$7,$8,$9,'SYNC',TRUE,$5)`,
      [schoolA,orgA,`CERT-A1-${suffix}`,`Certification École A1 ${suffix}`,ACTOR,schoolB,orgB,`CERT-B1-${suffix}`,`Certification École B1 ${suffix}`]);
    const context={auteurId:ACTOR,motif:'Certification PostgreSQL isolée',traceId:`security-cert-${suffix}`};
    const createOrgAdmin=(service:SecurityGovernancePostgresService,organisationId:string,index:string)=>service.creerCompteAvecAffectation({
      nomComplet:`Administrateur certification ${index}`,email:`security-cert-${suffix}-${index}@edusync.test`,motDePasseInitial:PASSWORD,
      codeRole:'ADMIN_SYSTEME_ORGANISATION',niveau:'ORGANISATION',organisationId,motif:context.motif,
    },context);
    const adminA1=await createOrgAdmin(serviceA,orgA,'a1');
    const adminA2=await createOrgAdmin(serviceA,orgA,'a2');
    const adminB1=await createOrgAdmin(serviceB,orgB,'b1');
    createdUsers.push(userId(adminA1),userId(adminA2),userId(adminB1));
    const schoolAdmin=await serviceA.creerCompteAvecAffectation({
      nomComplet:'Administrateur école certification',email:`security-cert-${suffix}-school@edusync.test`,motDePasseInitial:PASSWORD,
      codeRole:'ADMIN_SYSTEME_ECOLE',niveau:'ECOLE',organisationId:orgA,ecoleId:schoolA,motif:context.motif,
    },context); createdUsers.push(userId(schoolAdmin));

    await serviceA.creerAffectationGouvernance({
      idUtilisateur:userId(schoolAdmin),codeRole:'CAISSIER',niveau:'ECOLE',organisationId:orgA,ecoleId:schoolA,
      motif:context.motif,
    },context);
    const assignmentResult=await shared.executer<{id:string}>(`SELECT a.id_affectation_utilisateur AS id
      FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
      WHERE a.id_utilisateur=$1 AND r.code_role='CAISSIER' AND a.id_ecole=$2`,[userId(schoolAdmin),schoolA]);
    const assignmentId=assignmentResult.lignes[0]?.id;
    expect(assignmentId,'L’affectation métier de certification n’a pas été persistée.');
    await serviceA.desactiverAffectation(assignmentId,context);
    await serviceA.activerAffectation(assignmentId,context);
    const assignmentState=await shared.executer<{etat:string}>(`SELECT etat_affectation AS etat
      FROM security_affectations_utilisateurs WHERE id_affectation_utilisateur=$1`,[assignmentId]);
    expect(assignmentState.lignes[0]?.etat==='ACTIVE','La réactivation durable de l’affectation a échoué.');

    const visibleA=await serviceA.listerAdministrateurs('ORGANISATION',{organisationId:orgA});
    const visibleB=await serviceA.listerAdministrateurs('ORGANISATION',{organisationId:orgB});
    expect(visibleA.length===2 && visibleA.every(row=>row.id_organisation===orgA),'La lecture Organisation A fuit ou perd des administrateurs.');
    expect(visibleB.length===1 && visibleB.every(row=>row.id_organisation===orgB),'La lecture Organisation B fuit ou perd des administrateurs.');

    let crossTenantRejected=false;
    try{
      await serviceA.creerCompteAvecAffectation({nomComplet:'Intrus certification',email:`security-cert-${suffix}-intrus@edusync.test`,motDePasseInitial:PASSWORD,
        codeRole:'ADMIN_SYSTEME_ECOLE',niveau:'ECOLE',organisationId:orgA,ecoleId:schoolB,motif:context.motif},context);
    }catch(error){ crossTenantRejected=error instanceof SecurityGovernanceError && error.code==='SECURITY_SCHOOL_SCOPE_INVALID'; }
    expect(crossTenantRejected,'Une école étrangère a été acceptée dans le périmètre de l’organisation A.');

    let lastAdminRejected=false;
    try{ await serviceB.changerEtatCompte(userId(adminB1),'SUSPENDED',context); }
    catch(error){ lastAdminRejected=error instanceof SecurityGovernanceError && error.code==='SECURITY_LAST_ADMIN_PROTECTED'; }
    expect(lastAdminRejected,'Le dernier administrateur actif de l’organisation B a pu être suspendu.');

    const adminAIds=[userId(adminA1),userId(adminA2)];
    const versionsAvantSuspension=await shared.executer<{id_utilisateur:string;token_version:number}>(
      'SELECT id_utilisateur,token_version FROM auth_utilisateurs WHERE id_utilisateur=ANY($1::text[])',[adminAIds]);
    const versionParUtilisateur=new Map(versionsAvantSuspension.lignes.map(row=>[row.id_utilisateur,row.token_version]));
    const accesAvantSuspension:AccesTemporaire[]=[];
    for(const [index,id] of adminAIds.entries()){
      const version=versionParUtilisateur.get(id); expect(version,'La version de jeton initiale est introuvable.');
      accesAvantSuspension.push(await creerAccesTemporaire(id,version,`suspension-${index}`,sessions,refreshTokens));
    }
    const concurrent=await Promise.allSettled([
      serviceA.changerEtatCompte(userId(adminA1),'SUSPENDED',context),
      serviceB.changerEtatCompte(userId(adminA2),'SUSPENDED',context),
    ]);
    const successes=concurrent.filter(result=>result.status==='fulfilled').length;
    const protectedFailures=concurrent.filter(result=>result.status==='rejected' && result.reason instanceof SecurityGovernanceError && result.reason.code==='SECURITY_LAST_ADMIN_PROTECTED').length;
    expect(successes===1 && protectedFailures===1,'La protection concurrente du dernier administrateur n’est pas déterministe.');

    const suspendedIndex=concurrent.findIndex(result=>result.status==='fulfilled');
    const suspendedUserId=adminAIds[suspendedIndex]; const suspendedAccess=accesAvantSuspension[suspendedIndex];
    expect(suspendedUserId && suspendedAccess,'Le compte suspendu par la course n’a pas pu être identifié.');
    const suspensionProof=await shared.executer<{
      etat_compte:string;token_version:number;revoquee_le:Date|null;raison_revocation:string|null;revoque:boolean;revoque_le:Date|null;
    }>(`SELECT u.etat_compte,u.token_version,s.revoquee_le,s.raison_revocation,t.revoque,t.revoque_le
      FROM auth_utilisateurs u JOIN auth_sessions_utilisateurs s ON s.id_utilisateur=u.id_utilisateur
      JOIN auth_refresh_tokens t ON t.id_refresh_token=s.refresh_token_id
      WHERE u.id_utilisateur=$1 AND s.id_session_utilisateur=$2 AND t.id_refresh_token=$3`,
      [suspendedUserId,suspendedAccess.sessionId,suspendedAccess.refreshTokenId]);
    const suspendedState=suspensionProof.lignes[0];
    expect(suspendedState?.etat_compte==='SUSPENDED','Le compte non-dernier administrateur n’est pas suspendu dans PostgreSQL.');
    expect(suspendedState.token_version===versionParUtilisateur.get(suspendedUserId)!+1,'La suspension n’a pas incrémenté tokenVersion exactement une fois.');
    expect(Boolean(suspendedState.revoquee_le) && suspendedState.raison_revocation==='compte-suspendu','La session active n’a pas été révoquée par la suspension.');
    expect(suspendedState.revoque && Boolean(suspendedState.revoque_le),'Le refresh token actif n’a pas été révoqué par la suspension.');

    await serviceA.changerEtatCompte(suspendedUserId,'ACTIVE',context);
    const reactivationProof=await shared.executer<{
      etat_compte:string;token_version:number;sessions_actives:number;refresh_actifs:number;session_revoquee_le:Date|null;refresh_revoque:boolean;
    }>(`SELECT u.etat_compte,u.token_version,
        (SELECT COUNT(*)::int FROM auth_sessions_utilisateurs WHERE id_utilisateur=u.id_utilisateur AND revoquee_le IS NULL) AS sessions_actives,
        (SELECT COUNT(*)::int FROM auth_refresh_tokens WHERE id_utilisateur=u.id_utilisateur AND revoque=FALSE) AS refresh_actifs,
        s.revoquee_le AS session_revoquee_le,t.revoque AS refresh_revoque
      FROM auth_utilisateurs u JOIN auth_sessions_utilisateurs s ON s.id_session_utilisateur=$2
      JOIN auth_refresh_tokens t ON t.id_refresh_token=$3 WHERE u.id_utilisateur=$1`,
      [suspendedUserId,suspendedAccess.sessionId,suspendedAccess.refreshTokenId]);
    const reactivatedState=reactivationProof.lignes[0];
    expect(reactivatedState?.etat_compte==='ACTIVE','La réactivation du compte n’a pas été persistée.');
    expect(reactivatedState.token_version===suspendedState.token_version,'La réactivation a modifié tokenVersion.');
    expect(reactivatedState.sessions_actives===0 && reactivatedState.refresh_actifs===0 && Boolean(reactivatedState.session_revoquee_le) && reactivatedState.refresh_revoque,
      'La réactivation a restauré un accès précédemment révoqué.');

    const accesAvantReset=await creerAccesTemporaire(suspendedUserId,reactivatedState.token_version,'reset',sessions,refreshTokens);
    const nouveauMotDePasse=`Reset-${randomUUID()}-A1`;
    const resetResult=await serviceA.reinitialiserMotDePasse(suspendedUserId,nouveauMotDePasse,context);
    expect(!JSON.stringify(resetResult).includes(nouveauMotDePasse) && !contientCleSecrete(resetResult),
      'La réponse de réinitialisation expose le mot de passe ou une donnée secrète.');
    const resetProof=await shared.executer<{
      token_version:number;revoquee_le:Date|null;raison_revocation:string|null;revoque:boolean;revoque_le:Date|null;
    }>(`SELECT u.token_version,s.revoquee_le,s.raison_revocation,t.revoque,t.revoque_le
      FROM auth_utilisateurs u JOIN auth_sessions_utilisateurs s ON s.id_session_utilisateur=$2
      JOIN auth_refresh_tokens t ON t.id_refresh_token=$3 WHERE u.id_utilisateur=$1`,
      [suspendedUserId,accesAvantReset.sessionId,accesAvantReset.refreshTokenId]);
    const resetState=resetProof.lignes[0];
    expect(resetState?.token_version===reactivatedState.token_version+1,'La réinitialisation administrative n’a pas incrémenté tokenVersion exactement une fois.');
    expect(Boolean(resetState.revoquee_le) && resetState.raison_revocation==='mot-de-passe-reinitialise',
      'La session active n’a pas été révoquée par la réinitialisation administrative.');
    expect(resetState.revoque && Boolean(resetState.revoque_le),'Le refresh token actif n’a pas été révoqué par la réinitialisation administrative.');

    const audit=await shared.executer<{total:number}>(`SELECT COUNT(*)::int AS total FROM audit_entries
      WHERE correlation_id=$1 AND action IN ('COMPTE_CREE','COMPTE_SUSPENDU')`,[`security-cert-${suffix}`]);
    expect((audit.lignes[0]?.total ?? 0)>=5,'Les décisions de certification ne sont pas toutes auditées durablement.');
    const assignmentAudit=await shared.executer<{total:number}>(`SELECT COUNT(*)::int AS total FROM audit_entries
      WHERE correlation_id=$1 AND action IN ('AFFECTATION_CREEE','AFFECTATION_DESACTIVEE','AFFECTATION_REACTIVEE')`,[`security-cert-${suffix}`]);
    expect((assignmentAudit.lignes[0]?.total ?? 0)===3,'Le cycle de vie de l’affectation n’est pas entièrement audité.');
    console.log(JSON.stringify({isolationMultiTenant:true,ecoleHorsOrganisationRefusee:true,dernierAdministrateurProtege:true,
      concurrencePostgresCertifiee:true,suspensionRevoqueAcces:true,reinitialisationRevoqueAccesSansSecret:true,
      reactivationSansRestauration:true,affectationsCertifiees:true,auditDurable:true,organisationsTemporaires:2,ecolesTemporaires:2,comptesTemporaires:4}));
  }finally{
    if(createdUsers.length){
      await shared.executer('DELETE FROM security_scopes_acces WHERE id_affectation_utilisateur IN (SELECT id_affectation_utilisateur FROM security_affectations_utilisateurs WHERE id_utilisateur=ANY($1::text[]))',[createdUsers]);
      await shared.executer('DELETE FROM security_affectations_utilisateurs WHERE id_utilisateur=ANY($1::text[])',[createdUsers]);
      await shared.executer('DELETE FROM auth_contextes_actifs WHERE id_utilisateur=ANY($1::text[])',[createdUsers]);
      await shared.executer('DELETE FROM auth_sessions_utilisateurs WHERE id_utilisateur=ANY($1::text[])',[createdUsers]);
      await shared.executer('DELETE FROM auth_refresh_tokens WHERE id_utilisateur=ANY($1::text[])',[createdUsers]);
      await shared.executer('DELETE FROM auth_utilisateurs WHERE id_utilisateur=ANY($1::text[])',[createdUsers]);
    }
    await shared.executer('DELETE FROM ecoles WHERE id=ANY($1::uuid[])',[[schoolA,schoolB]]);
    await shared.executer('DELETE FROM organisations WHERE id=ANY($1::uuid[])',[[orgA,orgB]]);
    await Promise.all([poolA.end(),poolB.end(),obtenirPoolPostgresAuth().end()]);
  }
}

main().catch(error=>{console.error(error);process.exitCode=1;});
