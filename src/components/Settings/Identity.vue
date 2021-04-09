<template>
    <div>
        <q-separator />
        <q-card-section class="bg-blue-2 row">
            <q-item-label class="text-subtitle1 text-thin">Identity</q-item-label>
            <q-space />
            <q-item-label class="text-caption text-grey-5 text-thin q-mt-sm justify-end">{{ this.currentUserId }}</q-item-label>
            
        </q-card-section>
        <q-separator />
        
        <q-item>
            <q-item-section>
                <q-input
                    :disable="!this.getEditMode"
                    outlined
                    v-model="title"
                    label="Your Title"
                />
                <q-item-label class="text-grey-8 q-mt-sm">How do you like to be addressed? (Master, Mistress, slave, sub, pet, etc)</q-item-label>
            </q-item-section>
        </q-item>
        <q-item class="q-pt-lg">
            <q-item-section class="">
                <q-input
                    :disable="!this.getEditMode"
                    outlined
                    v-model="username" 
                    label="Your Name"
                />
                <q-item-label class="text-grey-8 q-mt-sm">The name you like to be called. Usually, this will be your first name.</q-item-label>
            </q-item-section>
        </q-item>
        <q-item class="q-pt-lg">
            <q-item-label class="text-grey-6">Your contacts will see you as {{this.title}} {{this.username}}</q-item-label>
        </q-item>
        
    </div>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'
    export default {
        computed: {
            ...mapGetters('settings', ['settings', 'getEditMode']),
            ...mapGetters('auth', ['currentUserId']),
            title: {
                get() {
                    return this.settings.title
                },
                set(value) {
                    this.setTitle(value)
                }
            },
            username: {
                get() {
                    return this.settings.userName
                },
                set(value) {
                    this.setUserName(value)
                }
            },            
        },
        methods: {
            ...mapActions('settings', ['setTitle', 'setUserName']),
        }
            

        
    }
</script>

<style lang="scss" scoped>

</style>