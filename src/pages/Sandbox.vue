<template>
    <div>
        <q-card class="q-ma-sm q-pa-xl">
            
            {{ someValue() }}
                    
        </q-card>
        
    </div>
</template>

<script>
    
        import {mapActions} from 'vuex'

    export default {
        props: ['path'],
        data() {
            return { 
                metadata: '',

            }
        },
        methods: {
            ...mapActions('settings', ['setProfileImageUrl']),
            addImage(item) {                
                let payload = {
                    uid: this.$store.state.firebaseAuth.uid,
                    image: item
                }            
                this.setProfileImageUrl(payload) 
            },
            someValue() {
                this.$store.state.settings.use24HourTime
            }
        }
    }
</script>
