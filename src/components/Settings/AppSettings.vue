<template>
    <div>
        <q-card-section class="bg-blue-2">
            <q-item-label class="text-subtitle1 text-thin">App Settings</q-item-label>            
        </q-card-section>
        <q-separator />
        <q-list>
            <q-item>
                <q-item-section>
                    <q-item-label>Time format</q-item-label>
                </q-item-section>
                <q-item-section side >
                    <div class="row">
                        <q-item-label class="text-center"><strong>12-Hour</strong><br />( 3:30 PM )</q-item-label>
                        <q-toggle 
                            v-model="use24HourTimeFormat"                            
                            color="primary"
                            :disable="!getEditMode"
                            keep-color/>
                        <q-item-label class="text-center"><strong>24-Hour</strong><br />( 15:30 )</q-item-label>
                    </div>                        
                </q-item-section>
            </q-item>
        </q-list>
        <q-btn class="q-ma-sm" @click="onTest">Send Test</q-btn>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'
    import { date } from "quasar"

    export default { 
        computed: {
            ...mapGetters('settings', ['settings', 'getEditMode', 'displayName']),            
            ...mapGetters("auth", ["currentUserId"]),
            use24HourTimeFormat: {
                get() {
                    return this.settings.use24HourTime
                },
                set(value) {
                    this.setUse24HourTime(value)
                }
            }
        },
        methods: {
            ...mapActions('settings', ['setUse24HourTime']),
            ...mapActions("logging", ["addLog"]),
            onTest() {
                console.log('onTest')

                
                // actor: UID of the person taking the action
                // visibleTo: UID of another person who can see this action.
                // actionCode: integer representation of action
                //     10 - created task
                //     11 - edited task
                //     12 - marked task COMPLETE
                //     13 - deleted task
                //     14 - marked task IN PROGRESS
                //     15 - marked task INCOMPLETE
                //     20 - created connection
                //     21 - accepted connection
                //     22 - denied connection
                //     23 - revoked connection
                //     30 - created ritual
                //     31 - edited ritual
                //     32 - deleted ritual
                //     40 - created rule 
                //     41 - edited rule
                //     42 - deleted rule
                //     50 - created protocol
                //     51 - edited protocol 
                //     52 - deleted protocol 
                //     60 - added points
                //     61 - removed points
                // actionDate: when the action occured 
                // logMessage: unique text of the action   
                
                let entry = {
                    actor: this.currentUserId,
                    actionCode: 10,
                    visibleTo: '',
                    actionDate: new Date(),
                    logMessage: this.displayName + ' created new task. (TEST)'
                }
                this.addLog(entry)

            }
        } 
    }
</script>
