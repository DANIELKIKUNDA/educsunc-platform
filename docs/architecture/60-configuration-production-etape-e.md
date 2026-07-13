# Configuration - Etape E

## Portee

Cette etape industrialise l integrite durable du module Configuration dans PostgreSQL.

Elle couvre :

- l unicite logique d une cle dans sa portee metier
- la detection des modifications concurrentes
- l atomicite entre la configuration, sa version et sa trace d audit
- l immutabilite des versions et des snapshots
- la journalisation durable des mutations
- la serialisation des migrations entre plusieurs instances
- la memorisation des migrations deja appliquees
- la preuve de persistance apres reconnexion a PostgreSQL

## Unicite Metier

Une configuration est unique par combinaison :

- cle
- niveau
- organisation eventuelle
- ecole eventuelle
- utilisateur eventuel

La migration refuse explicitement de creer la contrainte lorsqu elle detecte des doublons
historiques. Elle ne choisit jamais arbitrairement une valeur a conserver.

## Concurrence Optimiste

Chaque configuration persistante porte une revision technique interne.

Lors d une mutation :

1. le repository relit la revision courante
2. la mise a jour exige cette meme revision
3. PostgreSQL incremente la revision atomiquement
4. aucune ligne modifiee signifie qu une autre operation a deja gagne
5. le backend retourne alors un conflit HTTP `409`

La seconde operation ne peut donc jamais ecraser silencieusement la premiere.

## Transaction Atomique

Le client PostgreSQL Configuration fournit une unite de travail reutilisee par les use cases.

Sont executes dans une seule transaction :

- sauvegarde de la configuration
- sauvegarde de la version lorsqu elle existe
- sauvegarde du snapshot lorsqu il existe
- ecriture de la trace d audit
- suppression et trace de suppression

Une erreur sur une seule de ces ecritures provoque un rollback complet.

## Historique Immuable

Les repositories de versions et snapshots utilisent uniquement des insertions.

Ils ne contiennent plus de mise a jour automatique en cas de conflit. Une collision constitue
une anomalie d integrite visible et non un pretexte pour remplacer l historique existant.

## Audit Durable

En mode PostgreSQL, le port d audit memoire est remplace par un adaptateur persistant.

Chaque trace conserve :

- un identifiant unique
- la configuration concernee
- le type d evenement
- le contenu de l evenement
- la date de survenue
- la date de persistence

L audit partage la transaction de la mutation qui l a produit.

## Migrations Industrielles

Le migrateur :

- ouvre une transaction
- prend un verrou PostgreSQL dedie
- cree son registre de versions
- execute uniquement les migrations absentes
- enregistre chaque migration reussie
- annule l ensemble en cas d erreur

Cette strategie supporte le redemarrage et le lancement simultane de plusieurs instances.

## Preuves Automatisees

La suite ciblee verifie :

- initialisation et incrementation de revision
- refus d une revision obsolete
- absence d ecrasement des versions et snapshots
- commit sur succes
- rollback sur erreur
- persistence de l audit
- idempotence du migrateur
- verrou de migration

Une integration sur PostgreSQL local verifie en plus :

- migrations reelles
- creation et mise a jour reelles
- historique durable
- audit durable
- conflit concurrent reel
- fermeture puis recreation du pool
- relecture de la valeur apres reconnexion

Les donnees d integration utilisent un identifiant aleatoire et sont supprimees en fin de test.

## Robustesse Du Mode Local

La validation globale a detecte une concurrence possible entre plusieurs amorcages ecrivant le
meme journal JSON local. Cette dette a ete fermee dans la meme etape :

- verrou de fichier inter-processus
- detection et liberation d un verrou abandonne
- ecriture dans un fichier temporaire unique
- remplacement atomique du journal
- quarantaine d un ancien contenu invalide sans suppression de ses octets
- nettoyage systematique des fichiers temporaires et du verrou

Une preuve automatisee lance douze ecritures concurrentes et verifie que les douze traces restent
presentes dans un JSON valide.

## Verdict Etape E

Le stockage PostgreSQL du module Configuration ne repose plus sur des ecritures independantes ni
sur un historique reecrivable. L integrite, la concurrence, les migrations et l audit sont
desormais proteges par la base et prouves sur une instance PostgreSQL reelle.
