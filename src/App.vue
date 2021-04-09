<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
    import { mapActions } from 'vuex'
  
    export default {
        name: 'App',
        methods: {
            ...mapActions('auth', ['onAuthStateChange']),            
        },
        mounted() {            
            this.onAuthStateChange()
        }

    }
</script>

<style>
  .text-complete {   
    color: #888
  }   
</style>
