<script setup lang="ts">
import BadgeStatut from './BadgeStatut.vue';
import type { CartePilotageReferentiel } from '../types/referentiel.types';

defineProps<{
  carte: CartePilotageReferentiel;
}>();
</script>

<template>
  <!-- Resume un espace de pilotage sans multiplier les boutons. -->
  <article class="carte-statut">
    <BadgeStatut :libelle="carte.statut" />
    <h3>{{ carte.titre }}</h3>
    <p>{{ carte.description }}</p>
    <button class="bouton-secondaire" type="button">{{ carte.actionLibelle }}</button>
  </article>
</template>
