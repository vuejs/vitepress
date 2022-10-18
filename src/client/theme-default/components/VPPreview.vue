<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed, ref } from 'vue';

defineProps<{
  image: string
  alt?: string
}>()

defineEmits<{
  (e: 'close-preview'): void
}>()

const scaleCount = ref<number>(1)

const enlarge = ()=>{
  if(scaleCount.value===3){
    return
  }
  scaleCount.value+=0.5
}

const narrow = ()=>{
  if(scaleCount.value === 0.1){
    return
  }
  if(scaleCount.value === 0.5){
    scaleCount.value = 0.1
    return
  }
  scaleCount.value -= 0.5
}

const calcScale = computed(()=>{
  return {
    'transform':`scale(${scaleCount.value})`
  }
})

</script>

<template>
  <div class="VPPreview-container">
    <img
      :style="calcScale"
      :src="withBase(image)"
      :alt="alt"
    />
    <div class="VPPreview-button-bar">
      <div class="VPPreview-icon" @click="enlarge">+</div>
      <div class="VPPreview-icon" @click="narrow">-</div>
      <div class="VPPreview-icon" @click="$emit('close-preview')">×</div>
    </div>
  </div>
</template>

<style scoped>
.VPPreview-container{
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, .2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.VPPreview-container> img{
  transition: all ease-in-out 0.3s;
}

.VPPreview-button-bar{
  width: 100%;
  height: 50px;
  background-color: rgba(0, 0, 0,.2);
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 30px;
}

.VPPreview-icon{
  border: 1px solid #f5f6f7;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  cursor: pointer;
  color: #f5f6f7;
  margin: 0 10px;
  user-select: none;
}
</style>
