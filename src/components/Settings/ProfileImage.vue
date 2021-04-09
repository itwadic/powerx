<template>

    <q-card class="q-pb-xs">
        <q-card-section class="bg-blue-2">
            <q-item-label class="text-subtitle1 text-thin">Profile Image</q-item-label>            
        </q-card-section>
        
        <div class="q-ma-md">
            <div class="col">                                        
                <croppa 
                    :disabled="!this.getEditMode"
                    v-model="croppa"                  
                    :accept="'image/*'"
                    :width="180"
                    :height="180"
                    :prevent-white-space="true"
                    :zoom-speed="3"                    
                    :show-remove-button="true"    
                    :placeholder-font-size="12"                
                    placeholder="1. Click Here or Drop Photo"
                    >
                    <!-- <img src="placeholder.jpg" slot="placeholder"> -->
                </croppa>
            </div>
            <div class="row justify-center q-pa-sm">
                <q-btn
                    @click="upload"                      
                    :disabled="!this.getEditMode"
                    :class="getEditMode ? 'bg-positive text-white' : 'bg-grey-7 text-white'">
                    2. CLICK TO UPLOAD
                </q-btn>
            </div>
        </div>
    </q-card>    
</template>

<script>
    import { mapActions, mapGetters } from "vuex"
    import cloudStorage from 'src/services/cloud-storage'
        
    export default {        
        data() {
            return {                
                croppa: {}
            }
        },   
        computed: {
            ...mapGetters('settings', ['settings', 'getEditMode']),
            profileImage: {
                get() {                    
                    return this.settings.profileImageUrl
                },
                set(value) {              
                    this.setProfileImageUrl(value)
                }
            }
        },
        methods: {
            ...mapActions("settings", ["setProfileImageUrl"]),            
           
            // removeBase64Prefix(base64Str) {
            //     return base64Str.substr(base64Str.indexOf(",") + 1);
            // },
            async upload() {
                // if (!this.croppa.hasImage()) {
                //     this.$q.dialog({
                //         title: 'Oops...',
                //         message: 'There is no image to upload.',
                //         ok: {
                //         push: true
                //         },
                //         cancel: {
                //         push: true,
                //         color: 'negative'
                //         },
                //         persistent: true                    
                //     })
                // } else {
                    const blob = await this.croppa.promisedBlob()
                    const uploadedPic = await cloudStorage.uploadBlob(blob)
                    this.profileImage = uploadedPic
                //}



                
                
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>