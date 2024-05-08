# API References

<script setup>
import { VPApiPage } from 'vitepress/theme'
</script>

<VPApiPage :apis="[
    {
      type: 'namespace',
      name: 'name',
      items: [
        {
          type: 'class',
          name: 'ClassName',
          link: '/home'
        },
        {
          type: 'namespace',
          name: 'NameSpace1'
        }
      ]
    },
    {
      type: 'function',
      name: 'func',
      items: []
    },
    {
      type: 'namespace',
      name: 'name',
      items: []
    }, 
    {
      type: 'type',
      name: 'name',
      items: []
    }, 
    {
      type: 'enum',
      name: 'name',
      items: []
    }, 
    {
      type: 'variable',
      name: 'name',
      items: []
    },
    {
      type: 'class',
      name: 'name',
      items: []
    },
    {
      type: 'interface',
      name: 'name',
      items: []
    },
  ]"
/>