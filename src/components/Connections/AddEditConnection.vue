<template>
    <q-card style="width:750px">
        <q-card-section class="row">
            <div class="text-h6">{{pageLabel}}</div>
            <q-space />
            <q-btn v-close-popup flat round dense color="primary" icon="close" />
            <div class="text-grey-7 text-subtitle">
                Fill out the information below to request authority over another 
                PowerX user. This will allow you to create and assign tasks to 
                them, assign punishments and rewards, and monitor their progress.
            </div>
            
        </q-card-section> 

        <form @submit.prevent="submitForm">
            <q-card-section class="q-pt-none">
                <div class="row">
                <q-avatar size="60px" v-if="this.userData" class="q-mr-md">
                        <img :src="userData.profileImageUrl"/>
                </q-avatar>
                <q-input class="col"
                    v-model="workConnection.inviteEmail" 
                    outlined 
                    ref="email"
                    autofocus
                    :disable="isEditMode"                    
                    @blur="validateEmail"                    
                    label="Enter the email address of the person you want authority over." 
                />
                </div>

                <div :class="!emailValidated ? 'text-red-5' : 'text-green-5'" >{{ checkResult }}</div>
                <q-toggle
                    v-model="workConnection.allowAssign"
                    color="blue"
                    label="Allow this person to also assign tasks to you."
                    class="q-mt-md"
                />

                <q-input 
                    v-model="workConnection.masterName" 
                    outlined                  
                    label="How will they refer to you?" 
                    class="q-mt-md"
                />
                <q-input 
                    v-model="workConnection.slaveName"
                    outlined                                         
                    label="How will you refer to them?" 
                    class="q-mt-md"
                />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn :disable="!emailValidated && !isEditMode" :label="buttonLabel" color="primary" type="submit" class="q-pa-md" />
            </q-card-actions>
        </form>
    </q-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import { firebaseDb, firebaseAuth } from "src/services/firebase"
import { date } from "quasar"

export default {
    props: ['mode', 'connection', 'id'],
    data() {
        return {
            workConnection: {
                inviteEmail: "",                
                masterUser: "",
                slaveUser: "",
                allowAssign: false,
                masterName: "",
                slaveName: "",
                requestDate: "",
                responseDate: "",
                responseResult: "PENDING",
                rank: 0           
            },
            emailValidated: false,
            checkResult: '',
            userData: null
        }
    }, 
    computed: {
        ...mapGetters('settings', ['settings', 'displayName']),    
        ...mapGetters('auth', ['currentUserId']),    
        title() {
            return this.settings.title
        },
        username() {
            return this.settings.userName
        },
        isEditMode() {
            return this.mode == "edit"
        },
        pageLabel() {
            return this.isEditMode ? "Edit Connection" : "Add New Connection"
        },
        buttonLabel() {
            return this.isEditMode ? "Update Request" : "Request Authority"
        }
        
    },
    methods: {
        ...mapActions("connections", ["addConnection", "updateConnection", "deleteConnection"]),
        submitForm() {
            // this.$refs.title.validate();
            // if (!this.$refs.title.hasError) {
                this.submitConnection();
            //}
        },
        submitConnection() {
            if (this.isEditMode) {                
                this.updateConnection({id: this.id, connection: this.workConnection })
            } else {                            
                // Fri May 29 2020 13:54:56 GMT-0600 (Mountain Daylight Time)
                // May 28, 2020 at 4:19:57 PM UTC-6
                // Let's fill in some last-minute housekeeping details
                this.workConnection.masterUser = this.currentUserId
                this.workConnection.slaveUser = this.userData.uid

                //console.log(Date.parse(new Date()) )
                this.workConnection.requestDate = Date.parse(new Date()) 

                // And submit this new connection to the database.
                this.addConnection({id: '', connection: this.workConnection});
            }

            // Lastly, inform the UI to close the pop-up.
            this.$emit("close");
        },
        validateEmail() {                        
            let _this = this              
            firebaseDb.collection('settings').where("email", "==", this.$refs.email.value.toLowerCase())
            .get()
            .then(function (snapshot) {                
                snapshot.forEach(function(doc) { 
                    _this.userData  = {
                        uid: doc.data().user,
                        userName: doc.data().userName,
                        email: doc.data().email,
                        title: doc.data().title,                        
                        use24HourTime: doc.data().use24HourTime,
                        profileImageUrl: doc.data().profileImageUrl
                    }                                 
                    _this.checkResult = "User found: " + _this.userData.title + ' ' + _this.userData.userName
                    _this.workConnection.slaveName = _this.userData.title + ' ' + _this.userData.userName
                    _this.emailValidated = true    
                    // console.log(">>>", _this.userData)
                })                
            })
            
            /* We will hit this code only in the circumstance that the email entered is not in 
               the PowerX database. Let's clear everything out so the form is fresh. 
            */ 
            _this.userData  = null
            this.checkResult = "Email address not found. You can only invite existing users (for now)."
            this.emailValidated = false
        },   
        workConnectionDisplayName()
        {
            return userData.title + ' ' + userData.userName
        }       
    }, 
    mounted()
    {
        this.workConnection.masterName = this.settings.title + ' ' + this.settings.userName

        if (this.mode == "edit") {
            this.workConnection = Object.assign({}, this.connection)
        }
    }
};
</script>

<style lang="scss" scoped>
</style>