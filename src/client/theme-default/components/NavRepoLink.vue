<template>
  <a
    v-if="repoLink"
    :href="repoLink"
    class="repo-link"
    target="_blank"
    rel="noopener noreferrer"
  >
    {{ repoLabel }}
    <OutboundLink />
  </a>
</template>

<script src="./NavRepoLink"></script>

<style>
.repo-link {
  margin-left: 1.5rem;
  color: var(--text-color);
  font-weight: 600;
}
</style>
