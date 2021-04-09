<template>
    <div>
        <px-panel title="Connections" v-on:add="showAddConnection=true"> 

            <template v-if="!Object.keys(connectionsActiveAndPending).length">
                <q-card class="q-pa-lg">
                    <div class="text-h5 text-grey-5">No Connections Yet</div>
                    <div class="text-subtitle1 text-grey-5">Click the button below to add one.</div>
                </q-card>            
            </template>

            <template v-else>
                <div class="row items-stretch q-gutter-md">
                    <connection
                    v-for="(connection, key) in connectionsActiveAndPending"
                    :key="key"
                    :connection="connection"
                    :connectionCount = connectionCount
                    :id="key" />
                </div>
            </template>
        </px-panel>
        <div class="q-pt-xl q-pb-lg"> </div> <!-- let them scroll up past the "add" button -->
 
        <q-dialog v-model="showAddConnection">
            <add-connection @close="showAddConnection = false" />
        </q-dialog>
    </div>
</template>

<script>    
    import { mapState, mapGetters, mapActions } from "vuex"
    export default {        
        data() {
            return {
                showAddConnection: false
            }
        },
        components: {
            "px-panel": require("components/Shared/Panel.vue").default,
            "add-connection": require("components/Connections/AddEditConnection.vue").default,
            "connection": require("components/Connections/Connection.vue").default
        },
        computed: {
            ...mapGetters("connections", ["connectionsActiveAndPending", "connectionCount"])
        },
        methods: {
            ...mapActions('connections', ['deleteConnection']),
            
            // connectionCount() {
            //     let count = 0
            //     for(var prop in this.connectionsActiveAndPending)
            //     {
            //         if(this.connectionsActiveAndPending.hasOwnProperty(prop)) { ++count }
            //     }
            // }
        } 
    }
</script>