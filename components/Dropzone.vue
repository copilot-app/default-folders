<script setup>
import {ref, onMounted} from 'vue'
const input = ref(null)

onMounted(()=>{
  console.log(input.value)
})

</script>
<template>
  <div class='dropzone'>
    <span>Drop your files here</span>
    <input ref='input' type='file' name='files' class='dropzone-input' multiple/>
  </div>
</template>
<style scoped>
.dropzone {
  border: 0.2rem dashed #DDD;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: .25rem;
  background-color: #DDD;
  text-align: center;
  transition: 0.25s background-color ease-in-out;
  cursor: pointer;
  &-dragging,
  &:hover {
    background-color: #DFFFDF;
  }
  &-icon {
    max-width: 75px;
    display: block;
    margin: 0 auto 1.5rem;
  }
  &-input {
    display: none;
  }
}
</style >
