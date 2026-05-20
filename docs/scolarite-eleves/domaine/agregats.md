# Agregats du BC Scolarite Eleves

Ce document decrit les agregats presents dans le domaine `scolarite-eleves`. Ils portent les invariants metier de la scolarite locale, restent independants de l'infrastructure et encapsulent les transitions critiques du parcours eleve.

## Eleve

`Eleve` represente l'identite permanente d'un eleve dans une ecole.

Responsabilites :

- Porter l'identite civile et scolaire de base : matricule, nom, post-nom, prenom, sexe, date de naissance, nationalite, lieu de naissance.
- Porter l'appartenance organisationnelle et scolaire : organisation, ecole, famille eventuelle, ecole de provenance.
- Encadrer les mutations d'identite, le rattachement famille et les changements de statut global.
- Emettre les evenements lies a la creation, a la modification d'identite, au rattachement famille, au transfert, a la suspension, au deces et a la reactivation.

Invariants :

- L'identite de l'eleve est permanente et ne depend pas d'une inscription annuelle.
- Le matricule est obligatoire et doit rester exploitable au niveau de l'ecole.
- Un eleve decede ne peut plus etre modifie comme un eleve actif.
- La suppression physique est interdite par l'agregat.
- Chaque mutation met a jour la version metier et la tracabilite de modification.

## Famille

`Famille` represente l'unite administrative de rattachement des eleves d'un meme foyer.

Responsabilites :

- Porter l'identite de la famille, son code, ses coordonnees et son appartenance a une organisation et a une ecole.
- Contenir la liste des responsables familiaux.
- Ajouter, modifier, retirer un responsable et definir un responsable principal.
- Supporter l'evaluation metier d'une famille nombreuse.

Invariants :

- Une famille appartient a une organisation et a une ecole.
- Le code famille doit rester coherent et exploitable.
- Les responsables d'une famille doivent rester dedoublonnes et structurellement valides.
- Le responsable principal, lorsqu'il existe, doit appartenir a la famille.

## InscriptionScolaire

`InscriptionScolaire` represente l'inscription annuelle d'un eleve dans une annee scolaire.

Responsabilites :

- Porter l'eleve, l'annee scolaire, la date d'inscription, l'origine de l'inscription, le numero d'ordre eventuel et l'observation administrative.
- Encadrer le cycle de validation et d'annulation.
- Emettre les evenements de creation, validation, annulation et ajout d'observation.

Invariants :

- Une inscription appartient a une organisation, une ecole, un eleve et une annee scolaire.
- Une inscription annulee ne peut plus etre validee.
- Une inscription validee ne doit pas etre revalidee silencieusement.
- La version metier est obligatoire pour la concurrence optimiste.

## AffectationClasse

`AffectationClasse` represente l'affectation locale d'un eleve inscrit a une classe pedagogique.

Responsabilites :

- Porter l'inscription scolaire, la classe pedagogique cible, la date d'affectation et l'etat actif ou non.
- Affecter un eleve a une classe.
- Permettre le changement de classe.
- Permettre la desactivation d'une affectation.

Invariants :

- Une affectation se rattache a une inscription scolaire valide.
- Une seule affectation active est autorisee pour une inscription donnee.
- Une classe pedagogique archivee ou incoherente ne doit pas recevoir d'affectation active.
- Le changement de classe doit preserv er l'historique metier.

## ParcoursScolaireEleve

`ParcoursScolaireEleve` represente l'historique scolaire reconstruit d'un eleve.

Responsabilites :

- Conserver les evenements de parcours d'un eleve.
- Ajouter des evenements de parcours successifs.
- Reconstruire une vue chronologique de l'historique.
- Exposer les evenements par eleve ou par annee.

Invariants :

- Le parcours est historique et ne remplace pas l'identite de l'eleve.
- Les evenements doivent rester chronologiquement coherents.
- L'historique est immuable au sens metier, hors reconstruction explicite controlee.
- Les transitions de parcours invalides sont refusees.
