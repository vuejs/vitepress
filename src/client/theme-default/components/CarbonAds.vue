<template>
  <div class="carbon-ads" ref="el"></div>
</template>

<script>
import { onMounted, ref } from 'vue'

export default {
  name: 'CarbonAds',
  props: {
    code: {
      type: String,
      required: true,
    },
    placement: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const el = ref()

    onMounted(() => {
      const s = document.createElement('script')
      s.id = '_carbonads_js'
      s.src = `//cdn.carbonads.com/carbon.js?serve=${props.code}&placement=${props.placement}`
      el.value.appendChild(s)
    })

    return { el }
  },
}
</script>

<style>
.carbon-ads {
  min-height: 102px;
  padding: 1.5rem 1.5rem 0;
  font-size: 0.75rem;

  width: 125px;
  position: fixed;
  z-index: 19;
  bottom: 0;
  right: 22px;
  padding: 10px;
}

@media screen and (max-width: 425px) {
  .carbon-ads {
    width: auto;
    right: 0;
  }
}

@media screen and (max-width: 1300px) {
  .carbon-ads {
    z-index: 1;
    position: relative;
    top: 12px;
    right: 20px;
    float: right;
    padding: 0 0 20px 30px;
  }
}

.carbon-ads a {
  color: #444;
  font-weight: normal;
  display: inline;
}

.carbon-ads .carbon-img {
  float: left;
  margin-right: 1rem;
  border: 1px solid var(--border-color);
}

.carbon-ads .carbon-img img {
  display: block;
}

.carbon-ads .carbon-poweredby {
  color: #999;
  display: block;
  margin-top: 0.5em;
}

@media (max-width: 719px) {
  .carbon-ads .carbon-img img {
    width: 100px;
    height: 77px;
  }
}
</style>
