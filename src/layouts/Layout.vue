
<template>    
    <q-layout view="hHh LpR fFf"> 
        <px-header /> 
        <px-drawer />
       
        <q-page-container >
            <keep-alive>
                <router-view />
            </keep-alive>
        </q-page-container>
    </q-layout>
</template>

<script>
    export default {
        name: "MainLayout",    
        components: {
            'px-header' : require('components/Page/Header.vue').default,
            'px-drawer' : require('components/Page/Drawer.vue').default
            
        }
    }
</script>

<style lang="scss">
.header-image {
    height: 100%;
    z-index: -1;
    opacity: 0.2;
    filter: grayscale(100%);
}


</style>
