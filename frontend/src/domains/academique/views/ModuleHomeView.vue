<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module academique"
      title="Centre academique"
      description="Point d entree du domaine academique: socle officiel, publications, activations, imports, comparaisons et migrations."
    />
    <SectionBlock title="Etat du domaine" description="Le module academique reste un module de gouvernance plateforme.">
      <div class="module-home-grid">
        <StatChip label="SCR-ACA-001" value="Lecture referentiel" />
        <StatChip label="SCR-ACA-002 a 004" value="Mutations officielles" />
        <StatChip label="SCR-ACA-005 / 006" value="Comparaison + migration" />
        <StatChip label="ACA-03 a 07" value="Exploitation locale" />
      </div>
    </SectionBlock>

    <SectionBlock
      title="Acces rapides"
      description="Les ecrans suivent strictement les workflows et contrats academiques deja figes."
    >
      <div class="academique-home-links">
        <RouterLink class="academique-home-card" to="/app/academique/referentiels">
          <strong>Referentiels academiques</strong>
          <p>Lecture du socle officiel, des classes academiques, des options et des referentiels programmes.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/publication">
          <strong>Publication d un referentiel</strong>
          <p>Publier une nouvelle version officielle sur un referentiel programme existant.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/activation">
          <strong>Activation d une version</strong>
          <p>Activer explicitement une version officielle deja publiee.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/imports">
          <strong>Import d un referentiel</strong>
          <p>Importer sections, options, classes, cours, programmes ou lignes selon les validateurs backend.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/comparaisons">
          <strong>Comparaison de versions</strong>
          <p>Comparer deux versions officielles pour une classe academique donnee.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/migrations">
          <strong>Migration referentielle</strong>
          <p>Analyser, appliquer, annuler et superviser les migrations de programme niveau.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/annees-scolaires">
          <strong>Annees scolaires</strong>
          <p>Creer, preparer, garantir, basculer, activer, cloturer et archiver les annees scolaires locales.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/classes-pedagogiques">
          <strong>Classes pedagogiques</strong>
          <p>Ouvrir et piloter la structure scolaire locale de l ecole pour une annee donnee.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/responsabilites-classes">
          <strong>Responsables de classes</strong>
          <p>Attribuer, consulter ou retirer le responsable officiel d une classe pedagogique.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/calendriers">
          <strong>Calendrier academique</strong>
          <p>Creer, ajuster, valider et verrouiller le calendrier academique local.</p>
        </RouterLink>
        <RouterLink class="academique-home-card" to="/app/academique/programmes-locaux">
          <strong>Programmes niveau</strong>
          <p>Initialiser, valider, archiver et relire l etat local du programme-niveau.</p>
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
.academique-home-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.academique-home-card {
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

.academique-home-card strong {
  font-size: 1.02rem;
}

.academique-home-card p {
  margin: 0;
  color: #4d6678;
  line-height: 1.55;
}
</style>
