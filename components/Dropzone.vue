<script setup>
import {ref, computed, onMounted} from 'vue'
import {v4 as uuid} from 'uuid'

const texts = {
  drag: "Drag your files here...",
  drop: "Drop your file!"
}
const input = ref(null)
const inputStyle = ref("dropzone")
const inputText = ref(texts.drag)
const files = ref([])


const handleDefaultEvent = (event)=>{
  event.preventDefault()
  event.stopPropagation()
}

const handleDragover = (event) => {
  handleDefaultEvent(event)
  inputStyle.value = 'dropzone dropzone-dragging'
  inputText.value = texts.drop
}

const handleDragleave = (event) => {
  handleDefaultEvent(event)
  inputStyle.value = "dropzone"
  inputText.value = texts.drag
}

const handleDrop = (event) => { 
  handleDefaultEvent(event)
  inputStyle.value = "dropzone"
  inputText.value = texts.drag
  console.log(event.dataTransfer.files)
  for (const f of event.dataTransfer.files){
    files.value.push(f);
  }
}

const fileNames = computed(()=>{
  return files.value.map((f) => f.name)
})


onMounted(()=>{
  console.log(input.value)
})

</script>

////////////////////////////////////////////////////////////////////////////////

<template>
  <div 
    v-bind:class="inputStyle"
    draggeable
    @drag="handleDefaultEvent"
    @dragstart="handleDefaultEvent"
    @dragend="handleDefaultEvent"
    @dragover="handleDragover"
    @dragenter="handleDefaultEvent"
    @dragleave="handleDragleave"
    @drop="handleDrop"
    >
    <span>{{ inputText }}</span>
    <input ref='input' type='file' name='files' class='dropzone-input' multiple/>
  </div>
  <div class='files'>
    <ul>
      <li class='file' v-for="f in fileNames" :key="uuid()">
        <span>{{ f }}</span>
      </li>
    </ul>
  </div>
</template>

////////////////////////////////////////////////////////////////////////////////

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
.file{
  border: solid 1px;
  padding: .25rem;
  border-color: #AAA;
  margin: 3px;
}

</style >
