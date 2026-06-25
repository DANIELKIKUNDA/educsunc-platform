# 41 - Cadrage DOC-EXETAT-01

## Objet

Ce document ouvre le mini-chantier `DOC-EXETAT-01`.

Il ne modifie pas le metier deja fige des bulletins.

Il cadre uniquement la suite a moyen terme pour les donnees documentaires specifiques aux bulletins finalistes.

## Contexte

Le moteur bulletin actuel est maintenant sain sur les points suivants :

- choix du template finaliste correct pour les `4e humanites`
- usage des marqueurs backend reels `estClasseFinaliste` et `estClasseEXETAT`
- packages documentaires `BULL-TPL-05` et `BULL-TPL-06` poses
- fonds maitres officiels finalistes poses

Le bloc finaliste visuel existe donc deja.

En revanche, certains champs documentaires du modele officiel observe dans les PDF sources ne disposent pas encore d'une source backend metier explicite.

## Champs concernes

Les champs a traiter dans `DOC-EXETAT-01` sont :

- `Chef de Centre`
- `Code du Centre`
- `Resultat final`
- `Diplome`
- `Pour temoignage`
- eventuelles mentions finales de jury ou de session si elles sont confirmees par les sources

## Regle de verite

Ces champs ne doivent pas :

- etre inventes dans le renderer PDF
- etre derives artificiellement des notes du bulletin
- etre relies au hasard au branding standard de l'ecole
- etre deduits uniquement du libelle de classe

Ils doivent etre portes par une source documentaire explicite et gouvernee.

## Position d'architecture retenue

`DOC-EXETAT-01` doit rester distinct du moteur bulletin courant.

Le moteur bulletin :

- choisit le bon template
- charge le bon fond
- affiche les donnees documentaires disponibles

Le moteur bulletin ne doit pas devenir lui-meme le lieu de stockage ou de calcul des metadonnees administratives EXETAT.

## Cible recommandee

La cible recommandee est un support documentaire specialise pour les editions finalistes.

Ce support doit pouvoir porter au minimum :

- ecole
- annee scolaire
- classe academique ou classe pedagogique si necessaire
- centre d'examen
- signataires documentaires finaux
- mentions de diplome / temoignage
- regles d'affichage documentaire finaliste

## Options possibles

### Option A - Sous-module documentaire d'examen

Usage :

- si les donnees changent par annee
- si elles changent par centre
- si elles changent par session
- si elles relevent d'une verite administrative officielle

Avantage :

- modele propre
- bonne auditabilite
- reutilisable pour plusieurs documents finalistes

### Option B - Configuration documentaire specialisee

Usage :

- si les donnees sont surtout editoriales
- si elles sont peu frequentes
- si elles ne dependent pas d'un cycle administratif complexe

Avantage :

- plus simple
- plus rapide a mettre en place

Limite :

- moins adaptatif si la logique devient plus riche qu'un simple parametrage

## Choix CTO recommande

Choix recommande :

- partir sur un support documentaire specialise
- ne pas surcharger `shared/configuration` tant que la nature exacte des donnees n'est pas confirmee comme purement editoriale

Autrement dit :

- si la donnee est administrative et sessionnelle => support documentaire d'examen
- si la donnee est seulement textuelle et locale => configuration specialisee

## Non-objectifs

`DOC-EXETAT-01` n'ouvre pas :

- un recalcul des resultats pedagogiques
- une relecture des permissions pedagogiques
- une refonte des templates `BULL-TPL-05` et `BULL-TPL-06`
- un nouveau workflow bulletin

## Preuves backend actuelles

Le backend porte deja les marqueurs utiles de selection documentaire :

- `estClasseFinaliste`
- `estClasseEXETAT`

Ils existent dans le referentiel academique et sont maintenant consommes par le pipeline bulletin.

En revanche, aucune source backend propre n'a ete prouvee a ce stade pour :

- `Chef de Centre`
- `Code du Centre`
- `Diplome`
- `Pour temoignage`

## Resultat attendu de DOC-EXETAT-01

Le chantier sera considere ferme si :

1. une source documentaire officielle est choisie
2. les champs finalistes sont modelises proprement
3. le moteur bulletin les lit sans logique cachee
4. les templates finalistes les affichent sans dur
5. les tests prouvent la non-regression

## Verdict de cadrage

`DOC-EXETAT-01` est un chantier legitime de moyen terme.

Il ne bloque plus le lot courant des bulletins.

Il doit etre traite comme une extension documentaire specialisee, et non comme un bricolage dans le renderer PDF.

## Statut De Figement

Le statut officiel retenu pour ce document est :

- `PHASE 41 FIGEE`
