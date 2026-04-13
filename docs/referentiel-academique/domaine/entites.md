# Entites du domaine Referentiel Academique

Les entites du domaine sont rattachees aux agregats ou representent des objets metier identifiables utiles aux traitements internes. Elles portent des validations et des comportements metier.

## LigneReferentielProgramme

`LigneReferentielProgramme` represente une ligne officielle dans une version de referentiel programme.

Role metier :

- Rattacher un cours officiel au programme d'une version.
- Porter l'ordre d'affichage.
- Indiquer si la ligne est obligatoire.
- Indiquer si la ligne est associee a un examen.
- Indiquer si la ligne est calculable.
- Porter la source de ligne.
- Porter la ponderation d'evaluation.
- Porter la classification optionnelle actuellement persistable : domaine et sous-domaine.

Invariants :

- Le cours, l'ordre, les indicateurs metier et la ponderation sont obligatoires.
- La ponderation doit etre compatible avec le type de structure d'evaluation.
- La ponderation doit etre compatible avec la presence ou non d'un examen.
- Une ligne officielle reste une donnee de version de referentiel, pas une adaptation locale.

## LigneProgrammeNiveau

`LigneProgrammeNiveau` represente une ligne locale d'un programme niveau.

Role metier :

- Copier une ligne officielle vers un programme local.
- Porter l'ordre, l'obligation, l'association examen, l'etat actif dans l'ecole, le caractere calculable, l'obsolescence, la source de ligne et la ponderation.
- Permettre les adaptations locales controlees par le moteur de programme local.

Invariants :

- Une ligne locale cible toujours un cours officiel.
- Une ligne locale doit rester compatible avec la structure d'evaluation.
- Une ligne obsolete reste historisee.
- Une ligne inactive dans l'ecole peut etre conservee sans participer a l'exploitation active.

## PeriodeCalendrier

`PeriodeCalendrier` represente une periode academique dans un calendrier.

Role metier :

- Porter un code, un libelle, un ordre, un type de periode, une date de debut et une date de fin.
- Permettre la detection de chevauchement entre periodes.

Invariants :

- Le code et le libelle sont obligatoires.
- L'ordre doit etre valide.
- Le type de periode doit appartenir aux valeurs du domaine.
- La date de debut doit etre anterieure a la date de fin.
- Deux periodes incompatibles ne doivent pas se chevaucher dans un calendrier valide.

## LigneDiffMigration

`LigneDiffMigration` represente une difference detectee entre deux versions de referentiel.

Role metier :

- Porter le type de difference.
- Identifier le cours concerne.
- Porter l'ancienne et la nouvelle ponderation si disponibles.
- Porter l'ancien et le nouvel ordre si disponibles.
- Fournir une trace exploitable par la migration.

Invariants :

- Le type de diff et le code cours sont obligatoires.
- Les anciennes et nouvelles valeurs sont optionnelles selon le type de difference.
- La ligne de diff ne modifie pas elle-meme le programme ; elle documente l'ecart.

## TransformationNote

`TransformationNote` represente une conversion de note lors d'une migration de programme.

Role metier :

- Porter l'identifiant de note.
- Porter l'ancienne valeur, l'ancien maximum, le nouveau maximum et la nouvelle valeur calculee.
- Encadrer la conversion des notes lors des changements de ponderation.

Invariants :

- Les valeurs et maximums doivent etre numeriques et coherents.
- Le nouveau maximum doit permettre un calcul exploitable.
- La transformation est rattachee a une migration, pas au cours ou au referentiel lui-meme.

## LigneProgramme

`LigneProgramme` existe dans le domaine comme representation de ligne de programme. Dans l'implementation actuelle, les usages principaux du flux referentiel et local s'appuient sur `LigneReferentielProgramme` et `LigneProgrammeNiveau`.
