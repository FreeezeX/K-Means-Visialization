<template>
  <div>
    <input @input="onInput"/>
  </div>
</template>


<style>

</style>


<script>
export default {
  name: 'k-input-form',

  props: {
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
    },
    modelValue: {
      type: String,
    },
    valid: {
      type: Boolean,
      default: true,
    }
  },

  methods: {
    onInput(event) {
      this.$emit('update:modelValue', event.target.value)
    }
  },

  watch: {
    validValue(payload) {
      this.$emit('update:valid', payload)
    },
  }
}
</script>