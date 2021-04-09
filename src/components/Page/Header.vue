<template>
    <q-header elevated>
        <q-toolbar class="q-pa-xs">                
            <q-avatar size="60px" class="q-mr-sm">
                <img :src="profileImage"/>
            </q-avatar> 
            <div>
                <div class="row col text-h5 q-mt-md" style="line-height: 80%">Tasks</div>
                <div class="row col"><div class="text-caption">{{ todaysDate }}</div></div>
            </div>
            <q-space/>
            <div>
                <q-btn
                    name="fullscreen" 
                    size="md" 
                    flat
                    class="q-mt-sm" 
                    :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
                    @click="$q.fullscreen.toggle()"/>
            </div>
            <div class="q-mt-sm justify-end">
                <div v-if="!loggedIn">
                    <q-btn                            
                        to="/auth"
                        flat
                        icon-right="account_circle"
                        label="Login"              
                    />
                </div>  
                <div v-else>
                    <q-btn                            
                        @click="logoutUser"
                        flat
                        icon-right="account_circle"
                        label="Logout"
                    />
                </div>
            </div>
        </q-toolbar>
        
        <q-img src="mountains.jpg" class="header-image absolute-top" />
    </q-header>
</template>

<script>
    import { mapActions, mapState, mapGetters } from 'vuex';
    import { date } from 'quasar'
    
    export default {
        methods: {
            ...mapActions("auth", ["logoutUser"]),            
        }, 
        computed: {
            ...mapState("auth", ["loggedIn", "loggedInUserName"]),
            ...mapGetters('settings', ['settings']),
            todaysDate() {
                let timeStamp = Date.now();
                return date.formatDate(timeStamp, "dddd D MMMM");
            },
            profileImage: {
                get() {
                    return this.settings.profileImageUrl
                },
                set(value) {                    
                    this.imageUrl = value
                    this.setProfileImageUrl(value)
                }
            }
        }
    }
</script>
 