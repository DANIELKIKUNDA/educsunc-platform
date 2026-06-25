<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module financier"
      title="Centre financier"
      description="Le shell Lot 1 est maintenant en place. Les ecrans pilotes PF viendront se brancher ici."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill" to="/app/finances/paiements/enregistrer">
            Ouvrir SCR-PF-001
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/caisse">
            Ouvrir SCR-PF-004
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/historiques">
            Ouvrir SCR-PF-005
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/dettes">
            Ouvrir SCR-PF-006
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/recus/recu-250625-006">
            Ouvrir SCR-PF-007
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/rapports">
            Ouvrir SCR-PF-008
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/exonerations">
            Ouvrir SCR-PF-009
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/recus">
            Ouvrir SCR-PF-010
          </RouterLink>
          <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances/caisse/ouverture">
            Ouvrir SCR-PF-002
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/caisse/cloture">
            Ouvrir SCR-PF-003
          </RouterLink>
        </div>
      </template>
    </PageHeader>
    <SectionBlock title="Etat du domaine" description="Point d'entree officiel du module finances.">
      <div class="module-home-grid">
        <StatChip label="Priorite" value="Haute" />
        <StatChip label="Lot en cours" value="SCR-PF-001 a SCR-PF-010" />
        <StatChip label="Perimetre" value="Ecole active" />
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
