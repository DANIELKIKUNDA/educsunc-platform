# D1.4 - Socle frontend de donnees

## Verdict

Le socle frontend de donnees d'EduSync repose officiellement sur :

- un client HTTP Fetch unique dans `shared/http` ;
- des services API par domaine ;
- les stores reactifs Vue existants ;
- un cycle de vie central qui annule les requetes et purge les stores ;
- un cache memoire court, explicite et isole par contexte ;
- le stockage durable offline reserve au lot D1.7.

Aucune migration vers Pinia, Axios ou TanStack Query n'est retenue dans D1.4.

## Preuves initiales

L'audit du depot a etabli les faits suivants :

- 299 appels metier utilisaient deja le client HTTP commun ;
- les 53 stores de domaine exposaient tous `reinitialiser` ;
- le coordinateur de cycle de vie portait deja une revision monotone et un `AbortSignal` ;
- la session, l'acteur, les permissions, l'organisation, l'ecole et l'annee scolaire invalidaient deja les portees concernees ;
- Pinia, Axios et TanStack Query n'etaient pas installes ;
- un seul appel metier contournait encore le client commun : le PDF d'un recu ;
- le client reel etait place dans `src/services/api.ts`, tandis que `shared/http/api.client.ts` n'etait qu'un alias inverse.

## Decisions

| Capacite | Decision | Justification |
| --- | --- | --- |
| Fetch natif | CONSERVER | Il couvre l'authentification, les cookies, les erreurs, la reprise 401 et l'annulation. |
| Client HTTP | STANDARDISER | L'implementation officielle reside maintenant dans `shared/http/api.client.ts`. |
| Axios | REPORTER HORS PERIMETRE | Aucun besoin non couvert ne justifie une seconde pile HTTP. |
| Stores reactifs Vue | CONSERVER | Ils sont utilises, types, reinitialisables et integres au cycle de vie. |
| Pinia | REPORTER HORS PERIMETRE | Une migration des 53 stores n'apporterait aucun gain prouve aujourd'hui. |
| TanStack Query | REPORTER HORS PERIMETRE | Le besoin actuel est couvert sans introduire un second proprietaire de l'etat serveur. |
| Cache memoire | STANDARDISER | Il reste opt-in, court, clone les valeurs et est purge lors des transitions. |
| Cache durable offline | AJOUTER DANS UN LOT DETERMINE | Il appartient a D1.7 avec Dexie, migrations et synchronisation. |
| Telechargements | STANDARDISER | Les fichiers passent maintenant par le meme transport authentifie et annulable. |

## Architecture officielle

La chaine de donnees est la suivante :

```text
Vue / ViewModel
  -> Store de domaine
    -> Service API de domaine
      -> shared/http/api.client.ts
        -> Fetch
```

Les domaines ne peuvent pas appeler `fetch` directement. Le client HTTP assure :

- l'URL de base ;
- l'authentification ;
- les cookies de session ;
- la serialisation JSON ;
- la lecture JSON ou binaire ;
- la traduction des erreurs HTTP ;
- la reprise unique apres renouvellement de session ;
- l'annulation locale ;
- l'annulation lors d'un changement de contexte ;
- le rejet des reponses tardives ;
- l'invalidation du cache apres une mutation.

## Cache tenant-aware

Le cache de donnees est desactive par defaut. Une lecture doit declarer explicitement :

- une duree positive ;
- eventuellement une cle fonctionnelle stable.

La cle effective comprend :

- la revision du cycle de vie ;
- l'utilisateur ;
- le role actif ;
- l'organisation ;
- l'ecole et le tenant ;
- la cle fonctionnelle ou le chemin de la requete.

Le cache est entierement vide lors d'un changement d'identite, d'acteur, de permission ou de contexte. Toute mutation HTTP reussie le vide egalement. Les valeurs sont clonees a l'ecriture et a la lecture afin qu'un store ne puisse pas modifier silencieusement une entree partagee.

Le catalogue plateforme des modules est la premiere lecture cachee, pour 60 secondes. Aucun cache n'est generalise aux donnees financieres, pedagogiques ou scolaires sans preuve de stabilite.

## Annulation et isolation

Chaque requete reste liee a la revision courante du frontend. Une transition :

1. annule les requetes precedentes ;
2. purge les stores de la portee concernee ;
3. purge le cache HTTP ;
4. interdit a une reponse tardive de modifier l'etat ;
5. repart avec la projection de permissions et le contexte confirmes.

Cette regle s'applique aussi aux telechargements PDF.

## Tests et commandes

Les preuves D1.4 sont portees par :

- `frontend/scripts/run-frontend-data-tests.cjs` ;
- `frontend/scripts/run-frontend-lifecycle-tests.cjs` ;
- le build TypeScript et Vite ;
- la certification E2E existante de la pipeline.

Commandes officielles :

```powershell
npm --prefix frontend run test:data
npm --prefix frontend run test:access
npm --prefix frontend run test
npm --prefix frontend run build
```

## Frontiere avec D1.7

D1.4 ne cree aucun cache persistant de donnees metier. La persistance offline, les migrations locales, le chiffrement eventuel, les conflits et la synchronisation seront traites ensemble dans D1.7 afin de ne pas melanger cache reseau et stockage durable.

## Etat final

D1.4 est considere valide lorsque :

- les tests de donnees sont verts ;
- les tests de cycle de vie sont verts ;
- le build frontend est vert ;
- la pipeline GitHub est verte ;
- aucun second client HTTP ou `fetch` metier direct n'est reintroduit.
