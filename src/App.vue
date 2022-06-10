<template>
  <app-header/>
  <div id="content">
    <router-view/>
  </div>
</template>


<style>
@import url('https://rsms.me/inter/inter.css');

html {
  height: 100%;
} 

body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-family: Inter;
  overflow: auto;
}
</style>


<script>
import AppHeader from '@/components/header/AppHeader.vue'

export default {
  components: {
    AppHeader,
  },
  
  setup() {
    
  },
}
</script>
