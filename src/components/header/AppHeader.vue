<template>
  <div>
    <app-title/>
    <navigation-panel/>
  </div>
</template>


<style scoped>

</style>


<script>
import NavigationPanel from '@/components/header/NavigationPanel.vue'
import AppTitle from '@/components/header/AppTitle.vue'

export default {
  name: 'app-header',
  
  components: {
    AppTitle,
    NavigationPanel,

  },

}
</script>