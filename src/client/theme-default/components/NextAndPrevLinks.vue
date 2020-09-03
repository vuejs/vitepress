<template>
  <div v-if="hasLinks" class="links-wrapper">
    <div class="prev-link">
      <div v-if="prev">
      ← <a :href="prev.link">{{prev.text}}</a>
      </div>
    </div>
    <div class="next-link">
      <div v-if="next">
      <a :href="next.link">{{next.text}}</a> →
      </div>
    </div>
  </div>
</template>

<script src="./NextAndPrevLinks"></script>

<style>
.links-wrapper {
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}
</style>