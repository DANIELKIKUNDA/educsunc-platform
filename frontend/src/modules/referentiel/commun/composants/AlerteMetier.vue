<script setup lang="ts">
import type { MessageUtilisateur } from '../types/referentiel.types';

defineProps<{
  message: MessageUtilisateur;
}>();
</script>

<template>
  <!-- Affiche une alerte lisible sans exposer les details techniques. -->
  <article class="alerte-metier" :data-ton="message.ton">
    <span class="alerte-metier__icone">!</span>
    <div>
      <h3 class="alerte-metier__titre">{{ message.titre }}</h3>
      <p class="alerte-metier__message">{{ message.message }}</p>
    </div>
  </article>
</template>
