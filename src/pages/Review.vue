<template>
    <div>
        <px-panel class="q-mt-sm" title="Review" v-on:add="refresh()" simple
            description="">

            <div class="row justify-start">
                <div class="q-mr-md">
                    <q-btn-dropdown color="info" :label="selectedViewLabel" class="q-pb-sm q-pt-sm q-mb-sm" >                    
                        <q-list class="col">
                            <q-item clickable v-close-popup @click="selectView('tw')">
                            <q-item-section>
                                <q-item-label>This Week</q-item-label>
                            </q-item-section>
                            </q-item>

                            <q-item clickable v-close-popup @click="selectView('lw')">
                            <q-item-section>
                                <q-item-label>Last Week</q-item-label>
                            </q-item-section>
                            </q-item>

                            <q-item clickable v-close-popup @click="selectView('tm')">
                            <q-item-section>
                                <q-item-label>This Month</q-item-label>
                            </q-item-section>
                            </q-item>

                            <q-item clickable v-close-popup @click="selectView('lm')">
                            <q-item-section>
                                <q-item-label>Last Month</q-item-label>
                            </q-item-section>
                            </q-item>

                            <q-item clickable v-close-popup @click="selectView('cu')">
                            <q-item-section>
                                <q-item-label>Custom</q-item-label>
                            </q-item-section>
                            </q-item>

                        </q-list>
                    </q-btn-dropdown>
                    
                </div>
                <div class="row">
                    <q-input :disable="selectedView!='cu'" label="start date" class="col q-mr-sm" filled v-model="startDate" mask="##/##/####" :rules="[checkDate]">
                        <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxyStart" transition-show="scale" transition-hide="scale">
                            <q-date landscape minimal v-model="startDate" @input="() => $refs.qDateProxyStart.hide()"  mask="MM/DD/YYYY"></q-date>
                            </q-popup-proxy>
                        </q-icon>
                        </template>
                    </q-input> 
                    <q-input :disable="selectedView!='cu'" label="end date" class="col q-mr-sm" filled v-model="endDate" mask="##/##/####" :rules="[checkDate]">
                        <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxyEnd" transition-show="scale" transition-hide="scale">
                            <q-date landscape minimal v-model="endDate" @input="() => $refs.qDateProxyEnd.hide()"  mask="MM/DD/YYYY"></q-date>
                            </q-popup-proxy>
                        </q-icon>
                        </template>
                    </q-input> 
                </div>
            </div>

            <div class="q-mt-sm">
                
            </div>
 
            <div class="row content-start">
                <q-card square flat class="my-card bg-primary q-mr-sm q-mt-sm">
                    <q-card-section class="row items-center">
                        <q-icon name="assignment" style="color: #fff; font-size: 4em;" />
                        <div class="col q-ml-lg text-h5 text-white vertical-center">Opened</div>                        
                        <!-- <div class="justify-end q-ml-lg text-h5 text-white text-weight-light vertical-center">{{ countOfTasksOpen(this.startDate, this.endDate) }}</div> -->
                        <div class="justify-end q-ml-lg text-h5 text-white text-weight-light vertical-center">{{ countOfTasksOpened(currentUserId, startDate, endDate) }}</div>
                        
                    </q-card-section>
                </q-card>

                <q-card square flat class="my-card bg-primary q-mr-sm q-mt-sm">
                    <q-card-section class="row items-center">
                        <q-icon name="assignment" style="color: #fff; font-size: 4em;" />
                        <div class="col q-ml-lg text-h5 text-white vertical-center">Complete</div>
                        <div class="justify-end q-ml-lg text-h5 text-white text-weight-light vertical-center">{{ countOfTasksComplete(currentUserId, startDate, endDate) }}</div>
                    </q-card-section>
                </q-card>

                <q-card square flat class="my-card bg-primary q-mr-sm q-mt-sm">
                    <q-card-section class="row items-center">
                        <q-icon name="assignment" style="color: #fff; font-size: 4em;" />
                        <div class="col q-ml-lg text-h5 text-white vertical-center">% Complete</div>
                        <q-knob
                            readonly
                            show-value
                            :min="0"
                            :max="100"
                            class="text-white"
                            v-model="pctComplete"
                            size="70px"
                            color="white"
                            />
                    </q-card-section>
                </q-card>

                <q-card square flat class="my-card bg-secondary q-mr-sm q-mt-sm">
                    <q-card-section class="row items-center">
                        <q-icon name="assignment" style="color: #fff; font-size: 4em;" />
                        <div class="col q-ml-lg text-h5 text-white vertical-center">Points Possible</div>
                        <div class="justify-end q-ml-lg text-h5 text-white text-weight-light vertical-center">{{ pointsPossible(currentUserId, startDate, endDate) }}
                            
                        </div>
                    </q-card-section>
                </q-card>

                <q-card square flat class="my-card bg-secondary q-mr-sm q-mt-sm">
                    <q-card-section class="row items-center">
                        <q-icon name="assignment" style="color: #fff; font-size: 4em;" />
                        <div class="col q-ml-lg text-h5 text-white vertical-center">Points Earned</div>
                        <q-knob
                            readonly
                            show-value
                            :min="0"
                            :max="totalPointsPossible"
                            class="text-white"
                            v-model="totalPointsEarned" 
                            size="70px"
                            color="white"
                            />
                        <!-- {{ totalPointsEarned }} / {{ totalPointsPossible }} -->
                    </q-card-section>
                </q-card>
            </div>

        </px-panel>

        <px-panel class="q-mt-sm" title="Timeline" simple v-on:add="">
            <q-timeline class="q-ml-md" layout="dense" side="right" color="text-grey-1">

                <q-timeline-entry
                    v-for="log in logs"
                    :key="log.id"                    
                >
                <div class="text-grey-8">
                    {{ displayNameForUid(log.actor) }} {{ log.logMessage }}                    
                </div>
                <div class="text-grey-6">
                    {{ prettyDate(log.actionDate) }}
                </div>

                </q-timeline-entry>
       
 
            </q-timeline>
        </px-panel>
    </div>
</template>

<script>
    import { date } from 'quasar'
    import { mapActions, mapGetters } from "vuex";

    export default {
        data() {
            return { 
                totalPointsEarned: 0,
                totalPointsPossible: 0,     
                pctComplete: 0,
                startDate: '',
                endDate: '',
                selectedView: 'tw',
                selectedViewLabel: 'VIEW: THIS WEEK'
            }
        },    
        components: {
            "px-panel": require("components/Shared/Panel.vue").default,
        },
        computed: {            
            ...mapGetters('auth', ['currentUserId']),
            ...mapGetters('logging', ['logs']),
            ...mapGetters('settings', ['settings']),  
            ...mapGetters('tasks', ['countOfTasksOpened', 'countOfTasksComplete', 'percentComplete', 'pointsPossible', 'pointsEarned']),
            ...mapGetters('connections', ['displayNameForUid']),            
        },     
        methods: {            
            prettyDate(d) {
                let theDate = date.formatDate(d, 'MMM Do, YYYY')
                let theTime = date.formatDate(d, 'h:mm A')

                if(this.settings.use24HourTime) {
                    theTime = date.formatDate(d, 'HH:mm')
                }

                return theDate + ' at ' + theTime
            },
            selectView(selected) {
                this.selectedView = selected
                let currentDate = new Date()
                let currentMonth = currentDate.getMonth()+1
                let dow = date.getDayOfWeek(currentDate)
                let sunday = date.subtractFromDate(currentDate, { days: dow })
                let saturday = date.addToDate(currentDate, { days: 6-dow })

                // console.log('START:', date.formatDate(sunday, 'MM/DD/YYYY'))
                // console.log('  END:', date.formatDate(saturday, 'YYYY/MM/DD'))

                if(selected == 'tw') { 
                    this.selectedViewLabel="VIEW: THIS WEEK"
                    this.startDate = date.formatDate(sunday, 'MM/DD/YYYY')
                    this.endDate = date.formatDate(saturday, 'MM/DD/YYYY')
                }
                if(selected == 'lw') {                     
                    this.selectedViewLabel="VIEW: LAST WEEK"
                    let lastSunday = date.subtractFromDate(sunday, { days: 7 })
                    this.startDate = date.formatDate(lastSunday, 'MM/DD/YYYY')
                    let lastSaturday = date.subtractFromDate(saturday, { days: 7 })
                    this.endDate = date.formatDate(lastSaturday, 'MM/DD/YYYY')
                }

                if(selected == 'tm') { 
                    this.selectedViewLabel="VIEW: THIS MONTH"
                                                        
                    let firstOfMonth = date.buildDate({ year:currentDate.getFullYear(), date:1, month: currentMonth})
                    let endOfMonth = date.subtractFromDate(date.addToDate(firstOfMonth, { month:1 }), { days:1 })
                    this.startDate = date.formatDate(firstOfMonth, 'MM/DD/YYYY')
                    this.endDate = date.formatDate(endOfMonth, 'MM/DD/YYYY')
                }
                if(selected == 'lm') { 
                    this.selectedViewLabel="VIEW: LAST MONTH"
                    
                    let currentYear = currentDate.getFullYear()                    
                    let lastMonth = currentMonth-1
                    if(lastMonth==0) { 
                        lastMonth = 12 
                        currentYear = currentYear - 1 
                    }

                    let firstOfMonth = date.buildDate({ year:currentYear, date:1, month: lastMonth})                  
                    let endOfMonth = date.subtractFromDate(date.addToDate(firstOfMonth, { month:1 }), { days:1 })
                    this.startDate = date.formatDate(firstOfMonth, 'MM/DD/YYYY')
                    this.endDate = date.formatDate(endOfMonth, 'MM/DD/YYYY')
                }
                if(selected == 'cu') { this.selectedViewLabel="VIEW: CUSTOM"}
                
                this.pctComplete = this.percentComplete(this.currentUserId, this.startDate, this.endDate)
                this.totalPointsPossible = this.pointsPossible(this.currentUserId, this.startDate, this.endDate)
                this.totalPointsEarned = this.pointsEarned(this.currentUserId, this.startDate, this.endDate)                

            },            
            currentWeek() {                                
                let d = Date.now()
                let woy = Quasar.utils.date.getWeekOfYear(d)                
                return woy 
            } , 
            checkDate (val) {
               return date.isValid(val) || 'Invalid date.'
            }
        },                
        mounted() {
            this.selectView('tw')
            this.pctComplete = this.percentComplete(this.currentUserId, this.startDate, this.endDate)
            this.totalPointsPossible = this.pointsPossible(this.currentUserId, this.startDate, this.endDate)
            this.totalPointsEarned = this.pointsEarned(this.currentUserId, this.startDate, this.endDate)                
        }
    }
</script>

<style lang="scss" scoped>
    .my-card {
        width: 100%;
        max-width: 30%;
        min-width: 290px;
    }  
</style>