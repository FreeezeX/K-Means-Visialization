<template>
  <div id="box">
    <input v-model="k" placeholder="k">
    <input v-model="iterationsLimit" placeholder="iterations">
    <button @click="drawPlots">запустить</button>
    <plot 
      v-if="plotVisible" 
      :kValue="k" 
      :itrationsLimit="iterationsLimit"
      :generatedData="generatedData"
      :genDataLength="generatedDataLength"
    >
    </plot>
  </div>
</template>


<style scoped>
</style>


<script>
/* eslint-disable */
import Plot from '@/components/Plot.vue'
//import KInputForm from '@/components/KInputForm.vue'

export default {
  components: {
    Plot,
    //KInputForm,
  },

  data() {
    return {
      k: 3,
      iterationsLimit: 14,
      generatedDataLength: 100,
      generatedData: {},
      plotVisible: false,
    }
  },

  methods: {
    drawPlots() {
      if (this.plotVisible) {
        this.plotVisible = false;
      }
      else {
        if (!isNaN(this.k) && !isNaN(this.iterationsLimit)) {
          if (this.generatedData != {}) {
            this.plotVisible = true
          }
        }
      }
    }
  },

  mounted() {
    // генерируем данные
    for (var i = 0; i < this.generatedDataLength; i++) {
      var elem = {
        id: i,
        claster: 0,
        distToCentriod: 0,
        x: Math.random(),
        y: Math.random(),
        val: Math.random() * 1500
      }
      this.generatedData[i] = elem;
      
    }
  }
}
</script>