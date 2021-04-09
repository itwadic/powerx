<template>
    <q-page>
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >      
          <div
            v-if="showNotificationsBanner && pushNotificationsSupported"
            class="banner-container bg-primary"
          >
            <div class="constrain">            
                <q-banner
                  class="bg-green-6 text-white q-pa-md"
                  dense
                >
                  <template v-slot:avatar>
                    <q-icon 
                      name="notifications"
                      size="25px"
                      class="q-mt-xs"
                      dense
                    />
                  </template>
                  Enable notifications?
                  
                  <template v-slot:action>
                    <q-btn flat dense label="Yes" class="q-px-sm" @click="enableNotifications"/>
                    <q-btn flat dense label="Later" class="q-px-sm" @click="showNotificationsBanner = false"/>
                    <q-btn flat dense label="Never" class="q-px-sm" @click="neverShowNotificationsBanner"/>
                  </template>
                </q-banner>    
              </div>  
          </div> 
       </transition> 
        <div class="full-width full-height column">
            <template v-if="tasksDownloaded">
                <!-- TASK TOOLBAR -->
                <div class="row bg-grey-2">
                    <div class="col">
                        <q-select @input="showTasksForUsers"                    
                            v-model="showTasksFor" 
                            :options="filterUserOptions()" 
                            outlined 
                            square                            
                            emit-value                    
                            label="Show tasks for" />                        
                    </div>            
                    <div class="col-6 large-screen-only"><search /></div>                
                    <div class="col"><sort /></div>
                    <div class="col-auto small-screen-only">
                        <q-btn
                            @click="showSearch = !showSearch"
                            color="grey-8"
                            size="24px"
                            icon="search"
                            flat round dense
                        />
                    </div>
                    <div class="row full-width q-ml-md q-mr-md small-screen-only" v-if="showSearch"><search /></div>
                </div>
                <!-- /TASK TOOLBAR -->

                <px-panel 
                    title="Your Tasks" 
                    v-if="showTasksForUsers()=='Me' || showTasksForUsers()=='Everyone'" 
                    v-on:add="showAddTask=true">
                        <q-card 
                            v-if="!Object.keys(tasksTodo(this.currentUserId)).length && !Object.keys(tasksTodo(this.currentUserId)).length"
                            class="q-pa-lg"
                        >                    
                            <span class="text-h5 text-grey-5">No Tasks... well done!</span>
                        </q-card>
                        <!-- SHOW PENDING TASKS -->
                        <q-list
                            v-if="Object.keys(tasksTodo(this.currentUserId)).length"
                            bordered 
                            separator                    
                        >
                            <task v-for="(task, key) in tasksTodo(this.currentUserId)" :key="key" :task="task" :id="key" />
                        </q-list>

                        <!-- SHOW COMPLETED TASKS -->
                        <q-list
                            v-if="Object.keys(tasksCompleted(this.currentUserId)).length"
                            bordered
                            separator
                            class="q-mt-lg"
                        >
                            <task v-for="(task, key) in tasksCompleted(this.currentUserId)" :key="key" :task="task" :id="key" />
                        </q-list>
                    </px-panel>
                    <div v-for="connection in connectionsActive" :key="connection.id">
                        <px-panel 
                            v-if="connection.toName == showTasksForUsers() || showTasksForUsers() == 'All S-types' || showTasksForUsers() == 'Everyone'"
                            :title="panelTitle(connection.toName)"
                            v-on:add="showAddTask=true">
                            <q-card 
                                v-if="!Object.keys(tasksTodo(connection.toUid)).length && !Object.keys(tasksTodo(connection.toUid)).length"
                                class="q-pa-lg"
                            >                    
                                <span class="text-h5 text-grey-5">No Tasks.</span>
                            </q-card>
                            <!-- SHOW PENDING TASKS -->
                            <q-list
                                v-if="Object.keys(tasksTodo(connection.toUid)).length"
                                bordered 
                                separator                    
                            >
                                <task v-for="(task, key) in tasksTodo(connection.toUid)" :key="key" :task="task" :id="key" />
                            </q-list>

                            <!-- SHOW COMPLETED TASKS -->
                            <q-list
                                v-if="Object.keys(tasksCompleted(connection.toUid)).length"
                                bordered
                                separator
                                class="q-mt-lg"
                            >
                                <task v-for="(task, key) in tasksCompleted(connection.toUid)" :key="key" :task="task" :id="key" />
                            </q-list>
                        </px-panel>       
                    </div>                       
            </template>  

            <template v-else>
                <span class="absolute-center">
                    <q-spinner
                        color="primary"
                        size="3em"
                    />            
                </span>
            </template>

            <!-- <q-page-sticky position="bottom" :offset="[18, 18]">
                <q-btn fab @click="showAddTask=true" icon="add" color="primary" />
            </q-page-sticky> -->
        </div>

        <q-dialog v-model="showAddTask">
            <work-task mode="add" @close="showAddTask = false" />
        </q-dialog>
        
    </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex"
import { LocalStorage } from 'quasar'
//import push from 'src/services/push-notifications'

let qs = require('qs')

export default {
    
    data() {
        return {
            showAddTask: false,
            showSearch: false,
            showTasksFor: 'Everyone',
            componentKey: 0,
            model: null,
            showNotificationsBanner: false           
        }
    },
    computed: {
        ...mapGetters('connections', ['connectionsActive']),
        ...mapGetters("tasks", ["tasksTodo", "tasksCompleted"]),
        ...mapGetters("auth", ["currentUserId"]),
        ...mapGetters('settings', ["displayName"]),
        ...mapState("tasks", ["tasksDownloaded", "setSort"]),
        showTasksFor: {
            get() {
                return this.$q.localStorage.getItem('showTaskKey')
            },
            set(value) {
                this.$q.localStorage.set('showTaskKey', value)
            }
        },
        serviceWorkerSupported() {
            return ('serviceWorker' in navigator)
        },
        pushNotificationsSupported() {
            return ('PushManager' in window)
        }
    },
    components: {
        "px-panel": require("components/Shared/Panel.vue").default,
        "task": require("components/Tasks/Task.vue").default,
        "work-task": require("components/Tasks/AddEditTask.vue").default,
        "sort": require('components/Tasks/Tools/Sort.vue').default,
        "search": require('components/Tasks/Tools/Search.vue').default
    },
    filters: {
        searchHighlight(value, search) {
            if (search) {
                let searchRegExp = new RegExp(search, 'ig')
                return value.replace(searchRegExp, (match) => {
                    return '<span class="bg-yellow-6">' + match + '</span>'
                })
            }
            return value
        }
    },    
    methods: {        
        ...mapActions("tasks", ["deleteTask"]),         
        panelTitle(name) {
            let result = name.toLowerCase()
            if (result.toLowerCase().substr(-1) == "s") {
                return name + "' Tasks"
            } else {
                return name + "'s Tasks"
            }            
        },
        filterUserOptions() {        
            var options = []
            let list = this.connectionsActive
            let uid = this.currentUserId
            
            options.push({ label: 'Me', value: 'Me', id: uid })
            Object.keys(list).forEach(function(key) {
                let item = list[key]
                options.push({ label: item.toName, value: item.toName, id: item.toUid })
            })
            options.push({ label: 'All S-types', value: "All S-types", id: 'All S-types' })
            options.push({ label: 'Everyone', value: "Everyone", id: 'Everyone' }) 
            
            return options
 
        },
        showTasksForUsers() {
            let users = this.filterUserOptions() 
            let selected = ''

            try {
                selected = users.filter(user => user.value == this.showTasksFor)[0].value 
                this.$q.localStorage.set('showTaskKey', selected)
            } catch (error) {
                // safe to ignore this; this fires before mounting is complete
            }
            return selected 
        },
        //#region
        initNotificationsBanner() {
            let neverShowNotificationsBanner = this.$q.localStorage.getItem('suppressNotificationsBanner') 
            
            if(!neverShowNotificationsBanner) {
                this.showNotificationsBanner = true        
            }    
        },
        enableNotifications() { 
            this.showNotificationsBanner = false            
            if(this.pushNotificationsSupported) {
                Notification.requestPermission(result => {
                    this.neverShowNotificationsBanner()
                    console.log(result)
                    if(result=='granted') {                    
                        this.displayGrantedNotification()
                        //this.enableNotifications()
                        this.checkForExistingPushSubscription()       
                    }
                })
            }
        },
        neverShowNotificationsBanner() {      
            this.showNotificationsBanner = false
            this.$q.localStorage.set('suppressNotificationsBanner', true)
        },
        //#endregion
        
        checkForExistingPushSubscription() {    
            let reg
            if(this.serviceWorkerSupported && this.pushNotificationsSupported) {        
            navigator.serviceWorker.ready.then(swreg => {
                reg=swreg
                reg.pushManager.getSubscription()
            }).then(sub => {
                if(!sub) {
                    this.createPushSubscription(reg)  
                }
            })
            }
        }, 
        createPushSubscription(reg) {
            let vapidPublicKey='BEasyhN92tM-ukjUS71uhsfTT1hyAlWFzfa2Qto7PA98kyQKJPSPhXnxt5lLPZwWBQ1mvQKNYJJY6McuOWuF6XU'
            let vpk64 = this.urlBase64ToUint8Array(vapidPublicKey)
            reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vpk64
                }).then(newSub => {                                                 
                    let subData = newSub.toJSON(),
                        subDataQS = qs.stringify(subData)                                        
                    return this.$axios.post(`${ process.env.API }/createSubscription?${ subDataQS }&user=${ this.currentUserId }`)
                }).then(response => {
                    this.displayGrantedNotification()
                }).catch(err => {
                    console.error('Error creating push subscription:', err)
                })         
        },
        displayGrantedNotification() {
            // new Notification("You're subscribed to PowerX.", {
            //   body: 'Thanks for subscribing.',
            //   icon: 'icons/icon-128x128.png',
            //   image: 'icons/icon-128x128.png', 
            //   badge: 'icons/icon-128x128.png',
            //   dir: 'ltr',
            //   lang: 'en-US',
            //   vibrate: [100,50,200],
            //   tag: confirm-notification',
            //   renotify: true
            // })

            if(this.serviceWorkerSupported && this.pushNotificationsSupported) {
                navigator.serviceWorker.ready.then(swreg => {
                    swreg.showNotification("You're subscribed to PowerX notifications.", {
                        body: 'Thank you for subscribing.',
                        icon: 'icons/icon-128x128.png',
                        image: 'icons/icon-128x128.png', 
                        badge: 'icons/icon-128x128.png',
                        dir: 'ltr',
                        lang: 'en-US',
                        vibrate: [100,50,200],
                        tag: 'confirm-notification',
                        renotify: true,
                        actions: [
                            {
                                action: 'view',
                                title: 'View',
                                icon: 'icons/icon-128x128.png'
                            },
                            {
                                action: 'open-in-browser',
                                title: 'Open',
                                icon: 'icons/icon-128x128.png'
                            }
                        ]
                    })
                })
            }
        },
        urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }
    },
    mounted() {             
    }, 
    meta() {
        return { title: 'PowerX - ' + this.displayName }
    },
    created() {
        this.initNotificationsBanner()
    }
}
</script>

<style>
 
</style>