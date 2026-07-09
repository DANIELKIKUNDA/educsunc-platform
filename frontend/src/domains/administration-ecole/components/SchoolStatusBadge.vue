<template>
  <span class="school-status-badge" :class="active ? 'school-status-badge--active' : 'school-status-badge--inactive'">
    {{ active ? 'Active' : 'Inactive' }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean;
}>();
</script>

<style scoped>
.school-status-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:96px;
  padding:.42rem .8rem;
  border-radius:999px;
  font-size:.82rem;
  font-weight:700;
  letter-spacing:.01em;
}

.school-status-badge--active{
  background:rgba(25,163,100,.12);
  color:#147448;
}

.school-status-badge--inactive{
  background:rgba(216,75,75,.12);
  color:#b03636;
}
</style>

