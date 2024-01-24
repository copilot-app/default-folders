<template>
  <div class='wrapper'>
    <div class="content">
      <div>
        <h2>Default Files Configuration</h2>
        <p>Set up default files & folders in the Files App when new clients are created.</p>
      </div>
      <div>
        <h2>File & Folder Configuration</h2>
      </div>
      <div class='dropzone'>
        Dropzone Placeholder
      </div>
    </div>
  </div>
</template>

<style scoped>
  .wrapper {
    width:100%;
    display: flex;
    justify-content: center;
    margin-top: 10%;
  }
  .content{
    display: grid;
    gap: 4rem;
  }
  .dropzone{
    min-height: 100px;
    border: solid;
    border-width: 2px;
    border-color: #AAA;
    border-radius: 3px;
    padding: 1rem;
    text-align: center;
    color: #555;
  }
</style>
