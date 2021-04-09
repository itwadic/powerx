<template>
    <div class="justify-center q-mr-xs">        
        <q-chip outline clickable square ripple size="lg" class="text-grey-6">
            <q-avatar>
            <img :src="image" :title="assignee">
            </q-avatar>
            <div class="text-subtitle1" >{{assignee}}</div>
      </q-chip>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    export default {
        props: ['assignee', 'image']
    }

</script>

<style lang="scss" scoped> 
    
</style>