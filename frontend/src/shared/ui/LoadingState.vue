<template>
  <div class="ui-state ui-state--loading">
    <div class="ui-state__icon">
      <LoaderCircle />
    </div>
    <div class="ui-state__content">
      <strong>{{ title }}</strong>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';

defineProps<{
  title?: string;
  message?: string;
}>();
</script>
