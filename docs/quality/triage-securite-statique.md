# Triage de securite statique EduSync

## 1. Objet

Ce document cadre le premier lot de controles statiques EduSync. Il couvre
uniquement Semgrep, Gitleaks et Trivy. Il ne modifie pas le code applicatif et ne
constitue pas, a lui seul, une certification de securite.

Les configurations versionnees sont :

- `.semgrep.yml` : regles locales sur les frontieres de securite deja observees ;
- `.gitleaks.toml` : regles standard Gitleaks avec une tolerance strictement
  bornee aux valeurs factices des certifications ;
- `trivy.yaml` : severites `HIGH` et `CRITICAL` pour les dependances et les
  configurations.

Les rapports doivent etre produits dans `artifacts/security/`, repertoire ignore
par Git. Chaque rapport conserve la version de l'outil, la date, le commit analyse
et, pour Trivy, la version de la base de vulnerabilites.

## 2. Alertes historiques

Un ancien resultat Semgrep mentionne **29 alertes**. Le rapport brut JSON ou
SARIF, la version de Semgrep, les regles utilisees et les empreintes des constats
ne sont pas disponibles dans le depot.

Ces 29 alertes sont donc **non tracables individuellement**. Elles ne sont ni
fermees, ni confirmees, ni classees comme faux positifs. Un nouveau scan conserve
doit etablir la nouvelle base de reference avant toute comparaison historique.

## 3. Execution reproductible

Creer le repertoire de rapports avant l'execution :

```powershell
New-Item -ItemType Directory -Force artifacts/security
```

### Semgrep

Les regles sont locales : aucun paquet de regles distant n'est charge.

```powershell
semgrep scan --config .semgrep.yml --error --json --output artifacts/security/semgrep.json backend/src frontend/src
semgrep scan --config .semgrep.yml --sarif --output artifacts/security/semgrep.sarif backend/src frontend/src
```

### Gitleaks

Le premier scan controle l'arborescence courante ; le second controle l'historique
Git. Les valeurs detectees sont masquees dans les rapports.

```powershell
gitleaks dir . --config .gitleaks.toml --redact --report-format json --report-path artifacts/security/gitleaks-current.json
gitleaks git . --config .gitleaks.toml --redact --report-format sarif --report-path artifacts/security/gitleaks-history.sarif
```

### Trivy

Le scan `fs` controle les dependances. Le scan `config` controle les fichiers
d'infrastructure et de deploiement. Les options de sortie remplacent le format
`table` local defini dans `trivy.yaml`.

```powershell
trivy fs --config trivy.yaml --scanners vuln --format json --output artifacts/security/trivy-fs.json .
trivy config --config trivy.yaml --format sarif --output artifacts/security/trivy-config.sarif .
```

Le code de sortie `1` est reserve a une finding `HIGH` ou `CRITICAL`. Les
vulnerabilites sans correctif restent visibles et ne sont pas ignorees.

## 4. Matrice de triage initiale

| ID | Surface prouvee | Preuves actuelles | Controle | Risque a examiner | Etat initial | Preuve requise pour fermer |
| --- | --- | --- | --- | --- | --- | --- |
| STAT-001 | Verification TLS PostgreSQL desactivee | `ClientPoolPostgresConfiguration.ts`, `ClientPoolPostgresAuth.ts`, `ClientPoolPostgresScolariteEleves.ts`, `ClientPoolPostgresReferentielAcademique.ts` utilisent `rejectUnauthorized: false` | `edusync-postgresql-tls-verification-disabled` | Interception d'une connexion PostgreSQL chiffree mais non authentifiee | Defaut de durcissement prouve ; correction applicative hors de ce lot | Configuration de confiance explicite, tests local/CI/production et preuve qu'aucun environnement distant n'accepte un certificat non valide |
| STAT-002 | Origine CORS dynamique | `backend/src/app/serveur.ts` relit `Origin`, verifie un `Set` d'origines autorisees puis renvoie la valeur retenue avec les credentials | `edusync-cors-dynamic-allow-origin` | Reflection d'une origine non autorisee ou valeur de repli incorrecte | Controle par allowlist visible, comportement complet a prouver ; pas de classement en faux positif | Tests d'origine autorisee, interdite, absente et mal formee, avec verification des credentials |
| STAT-003 | Fusion des entrees HTTP | `syntheses.routes.ts` et `proclamations.routes.ts` fusionnent `params` et `query` avec `Object.assign` | `edusync-http-input-object-assign` | Collision de champs, contournement de validation ou pollution de prototype | Indetermine | Contrat des validateurs, liste des champs acceptes et tests avec cles inattendues, `__proto__`, `constructor` et collisions |
| STAT-004 | Generation de fenetres d'impression | `StatistiquesPedagogiquesClasseView.vue`, `useStudentResultDetailViewModel.ts`, `usePedagogicalAnalysisCenterViewModel.ts` et `useOrganizationRegistryViewModel.ts` appellent `document.write` | `edusync-dynamic-document-write` | Injection HTML ou script depuis une donnee metier non echappee | Indetermine | Tracage des sources, preuve d'echappement par contexte et tests avec caracteres HTML hostiles |
| STAT-005 | Expression reguliere dynamique | `frontend/src/shared/doctrine/doctrine.resolver.ts` construit un `RegExp` depuis un motif transforme | `edusync-dynamic-regular-expression` | Injection de syntaxe reguliere ou traitement excessif | Source apparemment interne, confiance et bornage a prouver ; pas de classement en faux positif | Test des caracteres speciaux, longueur maximale et preuve que la source ne peut pas etre influencee par une entree non fiable |
| STAT-006 | Valeurs de certification ressemblant a des secrets | Scripts de certification nommes dans `.gitleaks.toml` | Regles standard Gitleaks et allowlist `AND` chemin + valeur exacte | Masquage trop large d'un vrai secret | Valeurs deterministes explicitement non productives | Verification qu'une nouvelle valeur ou le meme texte hors des chemins autorises reste detecte |
| STAT-007 | Dependances et configurations vulnerables | Lockfiles npm, workflows, compose et futures definitions de deploiement | Trivy `fs` et `config` | Vulnerabilite de dependance ou configuration dangereuse | Baseline absente | Rapports JSON/SARIF conserves, triage par composant, version et correctif disponible |

## 5. Regles de classement

Chaque finding recoit un proprietaire, une severite confirmee, une exposition, une
preuve et une decision parmi :

- `A_CORRIGER` : faiblesse exploitable ou durcissement obligatoire demontre ;
- `A_CONFIRMER` : chemin de donnees ou exposition encore incomplet ;
- `ACCEPTE_TEMPORAIREMENT` : risque documente, borne, date et valide par le
  responsable securite ;
- `CORRIGE` : correctif et test de non-regression disponibles ;
- `FAUX_POSITIF_PROUVE` : preuve reproductible montrant que le chemin signale est
  impossible.

Une alerte n'est jamais masquee pour obtenir un rapport vert. `nosemgrep`, les
desactivations globales et les exclusions larges sont interdits. Toute exception
doit etre locale, motivee et couverte par un test qui demontre son innocuite.

## 6. Regles de conservation

Pour chaque campagne :

1. enregistrer le commit et les versions des outils ;
2. produire JSON pour le traitement automatique et SARIF pour la revue ;
3. conserver les rapports comme artefacts, jamais dans le code source ;
4. attribuer un identifiant stable a chaque finding ;
5. comparer par regle, chemin, ligne et empreinte ;
6. rouvrir un finding si son empreinte reapparait ;
7. ne declarer la baseline certifiee qu'apres triage de chaque finding bloquant.

## 7. Limites du lot

Ce lot ne lance aucun outil et n'integre aucun controle a la CI. Il n'installe
aucune dependance, ne corrige aucune surface applicative et ne reconstitue pas les
29 alertes historiques sans leurs preuves brutes. Son resultat est un socle
deterministe pour la prochaine campagne de scans.
