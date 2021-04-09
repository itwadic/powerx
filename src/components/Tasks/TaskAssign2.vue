<template>
    <div class="justify-center q-mr-sm">
            <q-avatar border>            
            <img :src="image" :title="assignee">
            </q-avatar>
            <div class="text-grey-7" id="assign">{{assignee}}</div>      
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    export default {
        props: ['assignee', 'image', 'selected']
    }

</script>

<style lang="scss" scoped> 
    #assign {
        font-size: 12px;
        text-align: center;
        max-width: 50px;
    }
</style>