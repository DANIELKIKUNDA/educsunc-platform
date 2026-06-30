<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module pedagogique"
      title="Centre pedagogique"
      description="Point d entree du domaine pedagogique: analyses, resultats, bulletins et workflows deja figes."
    />
    <SectionBlock title="Etat du domaine" description="Racine officielle du module pedagogique branchee sur les vraies lectures backend.">
      <div class="module-home-grid">
        <StatChip label="Lot actif" value="MP-07 / MP-08" />
        <StatChip label="Analyses" value="ResultatBulletinEleve" />
        <StatChip label="Exports" value="Excel / PDF / print" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Acces rapides"
      description="La navigation suit la doctrine documentaire, sans creer de workflows paralleles."
    >
      <div class="pedagogique-home-links">
        <RouterLink class="pedagogique-home-card" to="/app/pedagogique/fiches-cotation">
          <strong>Fiche de cotation electronique</strong>
          <p>Grille scolaire de travail pour ouvrir une classe, un cours et une annee puis encoder les cotes dans le vrai perimetre.</p>
        </RouterLink>
        <RouterLink class="pedagogique-home-card" to="/app/pedagogique/bulletins/generation">
          <strong>Generation du bulletin</strong>
          <p>Vue d action breve pour generer un bulletin sur le bon eleve, la bonne inscription et la bonne annee.</p>
        </RouterLink>
        <RouterLink class="pedagogique-home-card" to="/app/pedagogique/proclamations/generation">
          <strong>Generation de la proclamation</strong>
          <p>Vue d action simple pour generer la proclamation de classe sur la bonne colonne et la bonne annee.</p>
        </RouterLink>
        <RouterLink class="pedagogique-home-card" to="/app/pedagogique/conduite">
          <strong>Encodage de la conduite</strong>
          <p>Vue liste + edition de la conduite avec lecture de classe, mutation de points et audit de conduite.</p>
        </RouterLink>
        <RouterLink class="pedagogique-home-card" to="/app/pedagogique/statistiques/classe">
          <strong>Statistiques pedagogiques de classe</strong>
          <p>Lecture analytique par colonne avec indicateurs garcons, filles et total directement portes par le backend.</p>
        </RouterLink>
        <RouterLink class="pedagogique-home-card" to="/app/pedagogique/classements/classe">
          <strong>Classement de classe</strong>
          <p>Lecture des rangs, pourcentages et statuts de classabilite sans supposer un document imprimable distinct.</p>
        </RouterLink>
        <RouterLink class="pedagogique-home-card" to="/app/pedagogique/resultats/analyses">
          <strong>Centre d analyse pedagogique</strong>
          <p>Echecs, echecs profonds, cours problematiques, non classes, perequation, repechage et deliberation.</p>
        </RouterLink>
        <RouterLink class="pedagogique-home-card" to="/app/pedagogique/resultats/detail">
          <strong>Detail resultat eleve</strong>
          <p>Lecture fine des colonnes consolidees, diagnostics, application, conduite et evolution d un eleve.</p>
        </RouterLink>
      </div>
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import StatChip from '../../../shared/ui/StatChip.vue';
</script>

<style scoped>
.pedagogique-home-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.pedagogique-home-card {
  display: grid;
  gap: 0.75rem;
  padding: 1.2rem;
  border-radius: 24px;
  text-decoration: none;
  color: #11283f;
  border: 1px solid rgba(17, 40, 63, 0.08);
  background: linear-gradient(180deg, rgba(239, 247, 251, 0.96), rgba(255, 255, 255, 0.98));
  box-shadow: 0 18px 45px rgba(17, 40, 63, 0.08);
}

.pedagogique-home-card strong {
  font-size: 1.02rem;
}

.pedagogique-home-card p {
  margin: 0;
  color: #4d6678;
  line-height: 1.55;
}
</style>
