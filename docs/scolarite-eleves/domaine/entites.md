# Entites du BC Scolarite Eleves

Le domaine `scolarite-eleves` contient aussi des entites internes qui enrichissent les agregats sans devenir des racines autonomes.

## ResponsableFamille

`ResponsableFamille` est une entite interne de `Famille`.

Responsabilites :

- Porter l'identite du responsable, ses coordonnees et son lien de parente.
- Indiquer si le responsable est principal ou non.
- Encadrer la mise a jour des informations du responsable.

Points d'attention :

- Le lien de parente est borne par un value object dedie.
- Le role de responsable principal reste unique dans une meme famille.
- La coherence du responsable principal est aussi protegee par policies et exceptions.

## EvenementParcours

`EvenementParcours` est une entite interne de `ParcoursScolaireEleve`.

Responsabilites :

- Porter un type d'evenement, une date, un auteur et les informations metier utiles au suivi.
- Servir a la reconstruction de l'historique de parcours.
- Permettre la consultation des transitions scolaires dans l'ordre chronologique.

Points d'attention :

- Le type d'evenement est borne par `TypeEvenementParcours`.
- Un evenement de parcours ne doit pas contredire l'etat global de l'eleve ou de l'inscription.
- L'entite est descriptive ; les regles de transition restent portees par agregats, moteurs et policies.
