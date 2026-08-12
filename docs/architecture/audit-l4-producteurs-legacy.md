# L4 - Producteurs Audit et journaux historiques

## Statut et perimetre

L4 raccorde les producteurs metier et de securite au chemin d'ecriture canonique certifie en L2. Il ne modifie ni la politique tenant L1, ni les lectures L3, ni Monitoring. Les exports avances, le replay, la retention, l'archivage et la preuve d'integrite restent reserves a L5. L'interface finale reste reservee a L6.

Base certifiee L3 : `90aaa274df1b70b158f71c80796cc9126468255e`.

## Chemin canonique unique

```text
Action metier ou de securite
  -> port applicatif du bounded context
  -> mapping explicite vers ActionAuditEnum
  -> CanonicalAuditProducer ou adaptateur canonique equivalent
  -> AuditCanonicalWritePort
  -> audit_entries + audit_categories + audit_outbox
  -> publication durable L2
  -> lectures PostgreSQL L3
```

Le producteur ne construit pas de second DTO d'audit et ne depend pas d'un repository PostgreSQL Audit. Lorsqu'une mutation metier possede deja une transaction PostgreSQL, l'adaptateur d'ecriture reutilise son client courant afin que la mutation, l'entree Audit et l'outbox soient atomiques.

## Inventaire et classification

| Producteur ou famille | Actions observees | Mecanisme initial | Etat L4 | Durabilite / transaction | Tenant | Decision |
|---|---|---|---|---|---|---|
| Authentification | connexion reussie, echec, deconnexion, revocation | bridge d'integration sans persistance canonique garantie | B -> A | L2 ; transaction Auth partagee lorsqu'elle existe | contexte Auth controle | Raccorde par `SecurityAuditAdapter` |
| Securite | acces refuse, role, permission, affectation, revocation, gouvernance | inserts directs `audit_entries` et categories | C -> A | L2 ; transaction Auth/Security partagee | organisation/ecole issues des services de securite | Inserts directs supprimes |
| Configuration | modification SYSTEM, ORGANIZATION, SCHOOL, USER | `educsyn_configuration_audit_events` | C -> A | entree + outbox dans la transaction Configuration | portee persistante relue avant emission | Ancienne table conservee en historique uniquement |
| Referentiel academique | publication, activation, versions, lignes, ponderations, migrations, calendrier, annees | table `audit_logs` | C -> A | entree + outbox dans la transaction Referentiel | organisation/ecole portees par l'entree metier | Nouvelles ecritures canoniques ; historique encore lisible |
| Organisation et ecoles | creation, modification, activation/desactivation, identite | journal referentiel `audit_logs` | C -> A | meme transaction Referentiel | portee reelle de l'organisation ou de l'ecole | Mapping vers `REFERENTIEL_MODIFIE` |
| Paiements | paiement, caisse, tarification, parametres, obligations | adaptateur canonique partiel | B -> A | transaction Paiements partagee | organisation + ecole obligatoires | Mappings existants conserves |
| Annulation paiement | annulation documentee | saga inactive avec `idEcole` vide ; route active sans Audit | D -> A | mutation + Audit + outbox atomiques | input autorise recoupe avec le paiement | `PAIEMENT_ANNULE` ; ancien double chemin neutralise |
| Recu officiel | creation avec le paiement | aucun producteur explicite | D -> A | meme transaction que le paiement | meme organisation/ecole que le paiement | `RECU_GENERE`, sans snapshot interdit |
| Scolarite | inscription, abandon, transfert | callback/log Pino ou aucun branchement runtime | C/D -> A | unite de travail Scolarite partagee | organisation + ecole controlees | `ELEVE_INSCRIT`, `ABANDON_DECLARE`, `TRANSFERT_ENREGISTRE` |
| Notes et bulletins | encoder/modifier/vider une cote, generer bulletin | journal Pino local | C -> A | transaction Bulletins partagee | organisation + ecole obligatoires | Mapping canonique minimal, sans contenu du bulletin |
| Proclamation | generation officielle | Domain Event sans raccordement Audit | D -> A | meme transaction Bulletins | organisation de session + ecole de l'agregat | `PROCLAMATION_GENEREE` |
| Notifications | diffusion et historique de notification | journaux propres au BC | D non applicable | historique operationnel du BC | propre au BC | Aucun evenement Audit ajoute sans action canonique documentee |
| Communication / realtime | bridges et projections techniques | integration en memoire / logs | D non applicable | non metier | non applicable | Ne pas confondre observabilite et Audit |
| Synchronisation transverse | pousser/tirer simules | journal technique `DepotJournalSynchronisation` | D non raccorde | simulation, aucune integration distante reelle | contexte non authentifie insuffisant | Ne pas produire un faux succes Audit ; a raccorder lors du vrai workflow |
| Offline Bulletins | memorisation locale et poussee simulee | map memoire + service sync simule | D non raccorde | non durable metier | tenant non porte par le contrat actuel | Dette fonctionnelle explicite, pas une dette de convergence L4 |
| Imports Referentiel | import officiel et mutations resultantes | service journal Referentiel | A | transaction Referentiel + L2 | scope de l'import | Couvert par `REFERENTIEL_MODIFIE` |
| Migrations administratives Referentiel | analyser/appliquer/annuler | service journal Referentiel | A | transaction Referentiel + L2 | organisation/ecole selon migration | Conserve source et action metier |
| Uploads/assets documentaires | logo, cachet, signature | stockage documentaire dedie | D non applicable | persistance documentaire | ecole/utilisateur | Aucune action canonique existante a inventer |
| Consultation Audit | listes, details, filtres | read side L3 | A lecture | PostgreSQL L3 | `TenantScopePolicy` L1 | Ne pas auto-auditer la lecture et creer une boucle |
| Exports Audit | exports sensibles | perimetre L5 | reporte | a certifier en L5 | L1 obligatoire | `EXPORT_GENERE` et `EXPORT_MASSIF` reportes a L5 |
| Monitoring / logs HTTP | traces, metriques, erreurs techniques | Pino / Prometheus | hors L4 | observabilite | cardinalite controlee | Ne jamais les convertir automatiquement en Audit metier |

## Mappings officiels raccordes

### Authentification et securite

| Source | Action canonique |
|---|---|
| `AUTH_LOGIN` | `LOGIN_REUSSI` |
| `AUTH_FAILURE` | `LOGIN_ECHOUE` |
| `AUTH_LOGOUT` | `LOGOUT` |
| revocation/replay refresh | `SESSION_REVOQUEE` |
| refus permission/scope/restriction | `ACCES_REFUSE` |
| affectation de role | `ROLE_ATTRIBUE` |
| ajout de permission | `PERMISSION_AJOUTEE` |
| autre mutation de gouvernance prouvee | `GOUVERNANCE_SECURITE_MODIFIEE` |

Un refresh normal n'est pas persiste comme evenement Audit : aucun evenement officiel ne le requiert et son volume creerait du bruit.

### Configuration et referentiel

| Source | Action canonique |
|---|---|
| evenement de configuration persiste | `CONFIGURATION_MODIFIEE` |
| mutation referentiel, organisation ou ecole | `REFERENTIEL_MODIFIE` |
| modification de ponderation | `PONDERATION_MODIFIEE` |

### Finance

| Source | Action canonique |
|---|---|
| `ENREGISTRER_PAIEMENT` | `PAIEMENT_CREE` |
| `ANNULER_PAIEMENT` | `PAIEMENT_ANNULE` |
| `GENERER_RECU_OFFICIEL` | `RECU_GENERE` |
| ouverture/cloture caisse | `CAISSE_OUVERTE` / `CAISSE_CLOTUREE` |
| parametrage/tarification/obligations | actions canoniques correspondantes de la matrice |

### Scolarite et pedagogie

| Source | Action canonique |
|---|---|
| inscription complete | `ELEVE_INSCRIT` |
| abandon | `ABANDON_DECLARE` |
| transfert | `TRANSFERT_ENREGISTRE` |
| encodage de cote | `COTE_ENCODEE` |
| modification ou vidage controle d'une cote | `COTE_MODIFIEE` |
| generation bulletin | `BULLETIN_GENERE` |
| generation proclamation | `PROCLAMATION_GENEREE` |

## Tenant, acteur et correlations

- Le scope plateforme ne porte ni organisation ni ecole.
- Le scope organisation porte obligatoirement `organisationId`.
- Le scope ecole porte obligatoirement `organisationId` et `ecoleId`.
- Les identifiants tenant proviennent du contexte authentifie, d'un agregat relu, ou d'un contexte systeme controle ; ils ne sont jamais acceptes seuls comme preuve depuis un body client.
- Les anciens ports qui ne transportent pas encore le role exact utilisent `UTILISATEUR_AUTHENTIFIE` comme role de compatibilite. Ils ne fabriquent pas un role metier.
- La cle d'idempotence produit un identifiant Audit stable. Une nouvelle tentative de la meme action ne cree donc pas de doublon fonctionnel.
- `requestId` et `correlationId` existants sont conserves. A defaut, un `requestId` stable est derive de la cle d'idempotence.

## Redaction et minimisation

La redaction est recursive et insensible a la casse. Elle masque notamment mots de passe, tokens, JWT, cookies, secrets, cles privees et entetes d'autorisation, y compris dans les objets et tableaux imbriques.

Les producteurs scolaires et financiers journalisent des identifiants et des metadonnees minimales. Ils ne copient ni bulletin complet, ni recu PDF, ni piece jointe, ni secret de paiement.

## Strategie legacy

1. `security_audit_events` : migration idempotente vers `audit_entries`, vocabulaire canonique, date historique conservee, provenance `sourceLegacy` conservee, puis suppression de l'ancienne table par la migration existante.
2. `audit_logs` du Referentiel : aucune nouvelle ecriture ; conservation en lecture seule et union avec les nouvelles entrees canoniques pour l'historique Organisation.
3. `educsyn_configuration_audit_events` : aucune nouvelle ecriture ; table conservee comme historique technique afin de ne supprimer aucune donnee existante.
4. `AuditScolariteService` / `AuditLogger` : facade legacy non branchee au runtime. Elle ne produit donc aucun doublon ; son retrait physique pourra suivre une politique generale de suppression des API mortes sans incidence L4.
5. Sagas financieres non composees : elles ne constituent pas le chemin runtime. Le faux audit d'annulation avec ecole vide est neutralise pour prevenir tout doublon futur.

Aucun backfill massif de `audit_logs` ou du journal Configuration n'est requis par la doctrine actuelle. Une migration de donnees complete ne doit pas etre lancee sans besoin de lecture centralisee explicite et sera alors batchee, reprenable et idempotente.

## Garanties transactionnelles

- Paiements : `PaiementsAuditCanonicalWriteAdapter` reutilise l'unite de travail Paiements.
- Bulletins : `BulletinTransactionContext` expose le client PostgreSQL courant au writer canonique.
- Scolarite : `ScolariteAuditCanonicalWriteAdapter` reutilise le client de l'unite de travail.
- Referentiel : le service journal utilise le client transactionnel courant.
- Configuration : le port Audit recoit le client de la mutation Configuration.
- Auth/Security : le writer reutilise le contexte transactionnel PostgreSQL Auth lorsqu'il est actif.

Une erreur d'ecriture Audit critique provoque donc le rollback de la mutation lorsque le workflow est transactionnel.

## Frontieres confirmees

- L4 n'introduit pas Event Sourcing.
- Les Domain Events existants restent destines aux integrations ; un seul producteur persistant canonique est compose par action.
- Les logs Pino restent des logs techniques.
- Les historiques internes necessaires a la reconstitution d'un agregat restent dans leur BC.
- Les services simules ou inactifs ne sont pas declares raccordes.
- Les exports, retention, archivage, replay et preuve d'integrite restent explicitement reportes a L5.
- L'UX du Centre Audit reste explicitement reportee a L6.

## Invariants de non-regression

1. Aucun code runtime hors `shared/audit` ne fait d'insert direct dans `audit_entries` ou `audit_categories`.
2. Une action raccordee produit une seule entree canonique et une seule entree outbox pour une cle d'idempotence.
3. Une entree sans tenant complet est refusee ou ignoree avant persistance.
4. Une action sans snapshot autorise conserve ses details en metadata et laisse les snapshots vides.
5. Les historiques legacy restent lisibles sans recevoir de nouvelles ecritures.
6. Aucun secret n'est present dans snapshots ou metadata.
