# Certification du Centre Securite Plateforme

Date de certification : 22 juillet 2026

## Verdict

**CENTRE SECURITE PLATEFORME - CERTIFIE PRODUCTION**

La chaine complete a ete executee en une seule commande, dans un schema PostgreSQL isole, avec authentification reelle, backend et frontend dedies, navigateur Chromium, redemarrage du backend et verification de la persistance.

## Resultats officiels

| Controle | Resultat |
| --- | ---: |
| Scenarios fonctionnels | 37/37 |
| Tests backend Security | 65/65 |
| Controles responsive | 56/56 |
| Erreurs console reelles | 0 |
| Requetes perdues | 0 |
| Refus HTTP attendus et verifies | 13 |
| Typecheck backend | OK |
| Build frontend de production | OK |
| `git diff --check` | OK |

Les 13 refus HTTP correspondent aux protections volontairement testees : mauvaises connexions, dernier administrateur, doublons, motif absent, scope incoherent et tentative hors perimetre. Ils ne constituent pas des erreurs de production.

## Matrice navigateur

| ID | Scenario | Resultat |
| --- | --- | --- |
| SEC-001 | Connexion Manager systeme | Passe |
| SEC-002 | Ouverture du Centre Securite | Passe |
| SEC-003 | Consultation des huit onglets | Passe |
| SEC-004 | Creation d'un compte Plateforme | Passe |
| SEC-005 | Suspension d'un compte | Passe |
| SEC-006 | Reactivation d'un compte | Passe |
| SEC-007 | Desactivation d'un compte | Passe |
| SEC-008 | Deverrouillage d'un compte | Passe |
| SEC-009 | Reinitialisation du mot de passe | Passe |
| SEC-010 | Creation d'un administrateur Organisation | Passe |
| SEC-011 | Affectation d'un compte existant comme administrateur Organisation | Passe |
| SEC-012 | Ajout d'un second administrateur Organisation | Passe |
| SEC-013 | Protection du dernier administrateur Organisation | Passe |
| SEC-014 | Refus transactionnel du dernier administrateur | Passe |
| SEC-015 | Remplacement d'un administrateur Organisation | Passe |
| SEC-016 | Creation d'un administrateur Ecole par l'Organisation | Passe |
| SEC-017 | Contrainte mono-ecole d'un administrateur Ecole | Passe |
| SEC-018 | Refus d'une double affectation administrateur Ecole | Passe |
| SEC-019 | Intervention Plateforme sur un administrateur Ecole | Passe |
| SEC-020 | Motif obligatoire pour les actions sensibles | Passe |
| SEC-021 | Audit des mutations de securite | Passe |
| SEC-022 | Consultation d'un role systeme protege | Passe |
| SEC-023 | Creation d'un role personnalise | Passe |
| SEC-024 | Ajout d'une permission a un role personnalise | Passe |
| SEC-025 | Retrait d'une permission d'un role personnalise | Passe |
| SEC-026 | Ajout et retrait d'une restriction de role | Passe |
| SEC-027 | Creation d'une affectation de role | Passe |
| SEC-028 | Ajout et retrait d'un scope | Passe |
| SEC-029 | Refus d'un scope incoherent | Passe |
| SEC-030 | Consultation des sessions | Passe |
| SEC-031 | Revocation d'une session | Passe |
| SEC-032 | Revocation de toutes les sessions d'un compte | Passe |
| SEC-033 | Consultation des tentatives de connexion | Passe |
| SEC-034 | Verrouillage apres tentatives echouees | Passe |
| SEC-035 | Persistance de l'audit apres redemarrage | Passe |
| SEC-036 | Isolation multi-tenant | Passe |
| SEC-037 | Certification mobile sans overflow | Passe |

## Corrections fermees pendant la certification

- Le verrouillage de connexion est applique par compte tout en conservant une protection distincte par adresse IP.
- Un `ADMIN_SYSTEME_ECOLE` ne peut administrer activement qu'une seule ecole.
- L'ajout d'un scope est transactionnel, audite, motive, protege contre les doublons et controle par organisation et ecole.
- Les routes de scope reutilisent la permission reelle `security.assignments.write`.
- Le CORS accepte uniquement les origines supplementaires explicitement validees.
- La migration d'audit fonctionne dans un schema PostgreSQL isole.
- Le harnais utilise une connexion Manager reelle et distingue les refus de securite attendus des erreurs navigateur.
- La certification est branchee dans la CI avec conservation des rapports en artefacts.

## Persistance et isolation

- Les mutations sont relues depuis PostgreSQL.
- L'audit est retrouve apres redemarrage du backend dans le meme scenario.
- Les donnees et actions de deux organisations distinctes restent isolees.
- Les scopes incoherents, les ecoles hors organisation et les doubles affectations interdites sont refuses par le backend.
- Les secrets ne sont pas exposes dans les reponses ou les rapports.

## Reproductibilite

Depuis le dossier `backend` :

```powershell
npm run certification:security
```

La commande execute le typecheck backend, les tests Security, le build frontend, cree les donnees isolees, lance les services dedies, joue les 37 scenarios, redemarre le backend, controle la persistance, puis nettoie son schema de certification.

Rapport machine : `artifacts/security-production-certification/browser-report.json`.

## Dettes restantes

Aucune dette bloquante specifique au Centre Securite Plateforme n'est ouverte a l'issue de cette certification.

La campagne de certification globale de toute la Plateforme reste une etape distincte : elle devra verifier les interactions entre tous les centres une fois leur implementation terminee.

## Integrite du travail

- Aucun `git reset`, `git restore`, `git checkout`, `git clean` ou rebase destructif n'a ete utilise.
- Aucun travail recent du depot n'a ete ecrase.
- Le certificateur utilise des ports et un schema PostgreSQL reserves.
- Les donnees de certification sont nettoyees apres execution.
