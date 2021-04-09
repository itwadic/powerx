<template>
    <div class="q-pa-sm">
        <px-panel title="Settings" simple> 
            <div class="row">
                <q-card class="q-mr-md">
                    <px-app-settings></px-app-settings>                        
                    <px-identity></px-identity>
                </q-card>            
                <div>
                    <q-card>
                        <px-profile-image></px-profile-image>                    
                    </q-card>

                    <div class="row q-mt-md justify-center">    
                        <q-btn
                            @click="save"
                            :label="saveEdit"
                            :color="btnColor"
                            class="q-pa-lg"
                        />
                    </div>
                </div>
            </div>
        </px-panel> 
        <!-- <q-btn @click="testMessageInit">Test Message Init</q-btn>         -->
    </div>
</template>

<script>        
    import { mapActions, mapGetters } from 'vuex'
    import { colors } from 'quasar'
    //import msgService from 'src/services/firebase-messaging'

    export default {     
        data() {
            return {
                saveEdit: 'EDIT SETTINGS',
                btnColor: "primary"
            }
        },
        computed: { 
            ...mapGetters('settings', ['settings', 'getEditMode'])
        },
        components: {
            "px-identity": require("components/Settings/Identity.vue").default,
            "px-app-settings": require("components/Settings/AppSettings.vue").default,
            "px-profile-image": require("components/Settings/ProfileImage.vue").default,
            "px-panel": require("components/Shared/Panel.vue").default
        },
        methods: {
            ...mapActions('settings', ['saveSettings', 'setEditMode']),            
            save() {                
                if(!this.getEditMode) {   //Going into EDIT MODE
                    this.saveEdit = "SAVE SETTINGS"                     
                    this.btnColor = "positive"
                    this.setEditMode(true)                  
                } else {                        // Going into SAVE MODE
                     
                    let payload = {                        
                        title: this.settings.title,
                        userName: this.settings.userName,
                        profileImageUrl: this.settings.profileImageUrl,
                        use24HourTime: this.settings.use24HourTime
                    }
                    this.saveSettings(payload)
                    this.btnColor = "primary"
                    this.saveEdit = "EDIT SETTINGS"
                    this.setEditMode(false)
                }
            }, 
            // testMessageInit() {
            //     msgService.initMessaging('hello')
            // }
        },
        mounted() {
            this.setEditMode(false)
        }
        
    }
</script>