<template>
    <q-card class="q-pa-md flat">
    
        <!-- this template is shown if this connection was created by the active user -- MASTER-->
        <template v-if="isRequestor">        
            <div class="row">                
                <q-avatar 
                    class="col "
                    size="150px">                    
                    <img :src="profileImagePathForSlave()"/>
                </q-avatar>
                
                <div class="col q-ml-lg">
                    <div class="q-mt-xs text-h5">{{ this.connection.slaveName }}</div>
                    <div class="text-grey-5">({{ this.connection.inviteEmail }})</div>
                    <div class="q-mt-md" v-if="isPending">
                        <div class="text-red-9">PENDING</div>
                        <div class="text-red-3">Sent: {{ requestDate() }}</div> 
                    </div>
                    <div class="q-mt-md" v-else>
                        <div class="text-grey-9">IN SERVICE</div>
                        <div class="text-grey-5">Since {{ responseDate() }}</div>
                    </div>
                    <div class="q-mt-md">
                        <q-icon name="assignment_ind" class="text-primary" size="2em" v-if="this.connection.allowAssign">
                            <q-tooltip>This connection is allowed to assign tasks to you.</q-tooltip>
                        </q-icon>
                    </div>
                </div>                
            </div>            
            <div> 
                <q-separator class="q-mt-md q-mb-xs"></q-separator>
                <span class="q-mr-sm">ADD POINTS </span>
                <q-btn @click.prevent="addScore(-10)">-10</q-btn><q-btn @click.prevent="addScore(-1)">-1</q-btn>
                <q-btn @click.prevent="addScore(1)">+1</q-btn><q-btn @click.prevent="addScore(10)">+10</q-btn>
                <q-separator class="q-mt-xs"></q-separator>
            </div>
            
        </template>

        <!-- this template is shown if this connection was created by a different user -- SLAVE -->
        <template v-else>
            <div class="row">                
                <q-avatar 
                    class="col "
                    size="150px">                    
                    <img :src="profileImagePathForMaster()"/>
                </q-avatar>

                <div class="col q-ml-lg">                    
                    <div class="q-mt-xs text-h5">{{ this.connection.masterName }}</div>            
                    <div v-if="isPending">is requesting authority over you.</div>
                    <div v-else>has authority over you.</div>        
                    <div class="q-mt-md" v-if="isPending">
                        <div class="text-red-9">PENDING</div>
                        <div class="text-red-3">Requested: {{ requestDate() }}</div>
                        <div class="q-mt-sm">
                            <q-btn @click="denyAuthority" class="bg-negative q-mr-sm">DENY</q-btn>
                            <q-btn @click="acceptAuthority" class="bg-positive">ACCEPT</q-btn>
                        </div>
                    </div>
                    <div class="q-mt-md" v-else>
                        <div class="text-grey-9">IN SERVICE</div>
                        <div class="text-grey-5">Since {{ responseDate() }}</div>
                        <q-btn 
                            @click.stop="promptToRevoke({id, connection})" 
                            class="bg-negative q-mt-md">
                            REVOKE
                        </q-btn>
                    </div>
                </div>
            </div>
        </template>
        
        
        <div class="q-mt-sm row justify-end" v-if="isRequestor">     
            <div class="q-pt-xs row">
                <div class="col">
                    <q-btn @click="rankUp" flat round dense size="sm" icon="keyboard_arrow_down" class="text-grey-5" />
                    {{ this.connection.rank }} / {{ this.connectionCount }}
                    <q-btn @click="rankDown" flat round dense size="sm" icon="keyboard_arrow_up" class="text-grey-5" />
                </div>
            </div>

            <q-space />
           
            <q-btn                        
                @click.stop="showEditConnectionModal"
                flat round dense
                size="sm"
                color="primary"
                icon="edit"
            />

            <q-btn
                @click.stop="promptToDelete({id, connection})"
                flat round dense
                size="sm"
                color="red"
                icon="delete"
            />
        </div>   
        <q-dialog v-model="showEditConnection">
            <edit-connection mode="edit" @close="showEditConnection = false" :connection="connection" :id="id" />
        </q-dialog>    

        <!-- <q-btn @click="showMe()">TEST</q-btn> -->

    </q-card>
</template>

<script>
import { date } from "quasar";
import { mapActions, mapGetters } from "vuex";
import { firebaseDb } from "src/services/firebase";
import * as firebase from "firebase/app"
import audioService from 'src/services/cloud-audio'

export default {    
    props: ['connection', 'id'],
    data() {
        return {
            showEditConnection: false
        }
    },
    components: {
        "edit-connection": require("components/Connections/AddEditConnection.vue").default
    },
    computed: {      
      ...mapGetters('auth', ['currentUserId']),
      ...mapGetters('connections', ['profileImageForUid', 'connectionCount']),
      isRequestor() {
          return this.connection.masterUser == this.currentUserId
      },
      isPending() {
          return this.connection.responseResult =='PENDING'
      }
    },
    methods: {    
        ...mapActions('connections', ['updateConnection', 'deleteConnection', 'promoteConnection']),
        rankUp() {    
            //console.log('START:',this.connection.rank)       
            let newRank = this.connection.rank - 1
            //console.log('NEW RANK:',this.connection.rank)       
            if(newRank <= 1) {newRank = 1} //Don't let ranks go below 0            
            //console.log('ADJUSTED:',this.connection.rank)                   
            //console.log("connectionCount = ", this.connectionCount)

            let updates = { id: this.id, connection: {rank: newRank  }}             
            this.updateConnection(updates)
        },
        rankDown() {            
            //console.log('START:',this.connection.rank)       
            let newRank = this.connection.rank + 1
            //console.log('NEW RANK:',this.connection.rank)       
            if(newRank >= this.connectionCount) {newRank = this.connectionCount} //Don't let ranks go below 0            
            //console.log('ADJUSTED:',this.connection.rank)                   
            //console.log("connectioNCount = ", this.connectionCount)

            let updates = { id: this.id, connection: {rank: newRank  }}             
            this.updateConnection(updates)
        },
        addScore(value) {
            if(value < 0) {
                audioService.playSound('FAIL')    
            } else {
                audioService.playSound('SUCCESS')
            }
        },
        showEditConnectionModal() {
            this.showEditConnection = true;
        },
        profileImagePathForMaster() {            
            return this.profileImageForUid(this.connection.masterUser)
        },
        profileImagePathForSlave() {            
            return this.profileImageForUid(this.connection.slaveUser)
        },
        requestDate() {            
            let theDate = new Date(this.connection.requestDate)
            theDate = date.formatDate(theDate, "MM/D/YYYY")            
            return theDate
        },
        responseDate() {            
            let theDate = new Date(this.connection.responseDate)
            theDate = date.formatDate(theDate, "MM/D/YYYY")            
            return theDate
        },
        promptToDelete(args) {            
            this.$q
                .dialog({
                    title: "Delete connection to " + args.connection.slaveName + "?",
                    message: "WARNING: THIS ACTION CANNOT BE UN-DONE!",
                    ok: {
                        push: true
                    },
                    cancel: {
                        color: "negative"
                    },
                    persistent: true
                })
                .onOk(() => {
                    this.deleteConnection(args.id);
                });
        },
        promptToRevoke(args) {            
            this.$q
                .dialog({
                    title: "Revoke authority from " + args.connection.masterName + "?",
                    message: "WARNING: THIS ACTION CANNOT BE UN-DONE!",
                    ok: {
                        push: true
                    },
                    cancel: {
                        color: "negative"
                    },
                    persistent: true
                })
                .onOk(() => {
                    this.revokeAuthority()
                });
        },
        acceptAuthority() {
            let updates = { id: this.id, connection: {responseDate: Date.parse(new Date()), responseResult: "ACCEPTED" }} 
            this.updateConnection(updates)
        },
        denyAuthority() {            
            let updates = { id: this.id, connection: {responseDate: Date.parse(new Date()), responseResult: "DENIED" }} 
            this.updateConnection(updates)
        },
        revokeAuthority() {
            let updates = { id: this.id, connection: {responseDate: Date.parse(new Date()), responseResult: "REVOKED" }} 
            this.updateConnection(updates)
        },
        showMe() {            
            
        }
    },
    mounted() {
        // console.log('MOUNTED!')
        // console.log('MU: ', this.connection.masterUser)
        // console.log('LI: ', this.currentUserId)
    }
}
</script>

<style lang="scss" scoped> 
</style>