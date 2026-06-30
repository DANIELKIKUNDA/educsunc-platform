<template>
  <ConfigurationWorkspaceView
    screen-code="SCR-CFG-005"
    title="Notifications ecole"
    description="Templates, quotas et politiques locales de communication de l ecole active."
    scope-level="SCHOOL"
    key-prefix-default="notifications."
    default-key="notifications.templates.default"
    value-placeholder="true"
    :allow-delete="false"
    :allow-lock="true"
    :allow-snapshots="true"
    :allow-propagate="true"
    :allow-reload="true"
  />
</template>

<script setup lang="ts">
import ConfigurationWorkspaceView from './ConfigurationWorkspaceView.vue';
</script>

