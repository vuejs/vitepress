<template>
  <footer class="page-edit">
    <div v-if="editLink" class="edit-link">
      <a :href="editLink" target="_blank" rel="noopener noreferrer">
        {{ editLinkText }}
        <OutboundLink />
      </a>
    </div>
  </footer>
</template>

<script src="./PageEdit"></script>

<style>
.page-edit {
  padding-top: 1rem;
  padding-bottom: 1rem;
  overflow: auto;
}
.page-edit .edit-link {
  display: inline-block;
}
.page-edit .edit-link a {
  color: #4e6e8e;
  margin-right: 0.25rem;
}
</style>
