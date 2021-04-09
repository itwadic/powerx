<template>
    <q-slide-item
        :class="setTaskBackground()"
        @left="taskComplete=!taskComplete"
        @right="setInProgress"
        v-touch-hold:1000.mouse="showEditTaskModal"        
        @click="showEditTaskModal"                     
        v-ripple
        clickable 
    >            
        <template v-slot:left v-if="!task.completed">
            <q-icon name="done" /><span class="q-ml-sm">Complete</span>
        </template>
        <template v-slot:left v-else>
            <q-icon name="done" /><span class="q-ml-sm">Un-Mark Complete</span>
        </template>
        <template v-slot:right v-if="!task.completed">
            <q-icon name="alarm" /><span class="q-ml-sm">In Progress</span>
        </template>            
        <div class="row"> 
            <q-item-section :class="setTabColor()" style="max-width:3px"></q-item-section>

            <q-item-section class="col-auto">
                <q-icon v-if="!taskComplete" size="2em" class="text-primary" name="content_paste" @click="taskComplete=!taskComplete"></q-icon>                
                <template v-else>
                    <q-icon v-if="taskPastDue" size="2em" class="text-negative" name="assignment_late"></q-icon>
                    <q-icon v-else size="2em" class="text-primary" name="assignment_turned_in"></q-icon>    
                </template>
                
                <!-- <q-checkbox size="lg" dense v-model="taskComplete" />            -->
            </q-item-section>
        
            <q-item-section class="col q-mt-sm text-left">                    
                <q-item-label :class="{ 'text-complete' : task.completed }" v-html="$options.filters.searchHighlight(task.title, search)">
                    {{ task.title }}
                    <span style="display:none" class="text-caption text-grey-5"> / {{ id }}</span>
                </q-item-label>
                <q-item-label lines="2" class="text-body2 text-weight-light">
                    {{ task.notes }}
                    <q-tooltip 
                        v-if="task.notes.length > 200"
                        content-class="bg-primary" 
                        content-style="font-size: 16px"  
                        transition-show="scale"
                        transition-hide="scale"
                        max-width="400px"
                        >
                    {{ task.notes }}
                    </q-tooltip>
                
                </q-item-label>                    
                
                <!-- Status Line -->
                <div class="col text-grey-6 text-caption">
                    {{showDueDateTime(task)}}
                    {{showAssigned()}}
                    <span v-if="task.points > 0"> | {{ task.points }} pts.</span>                
                </div>                
            </q-item-section>

            <q-item-section class="col-auto">                    
                <div class="row justify-end">
                    <q-icon :name="priorityIcons[task.priority-1]" class="q-mt-xs text-primary" size="md" />

                    <q-btn
                        v-if="task.completed"
                        @click.stop="promptToDelete({id, task})"                            
                        flat
                        round                            
                        size="md"
                        color="red"
                        icon="delete"
                    />
                    
                </div>
            </q-item-section>
        </div>

        <q-dialog v-model="showEditTask">
            <edit-task mode="edit" @close="showEditTask = false" :task="task" :id="id" />
        </q-dialog>
    </q-slide-item>    
</template>

<script>
import { date } from "quasar";
import { mapState, mapActions, mapGetters } from "vuex";
import { Notify } from 'quasar' 
import pushService from 'src/services/push-notifications'

let qs = require('qs')

export default {
    props: ["task", "id"],
    data() {
        return {
            showEditTask: false,
            priorityIcons: ['looks_one', 'looks_two', 'looks_3', 'looks_4', 'looks_5']
        };
    },
    computed: {      
        ...mapGetters('settings', ['settings']),
        ...mapGetters('connections', ['connectionsActive', 'assignableForUid', 'displayNameForUid']),
        ...mapState('tasks', ['search']),  
        ...mapGetters('auth', ['currentUserId']),
        serviceWorkerSupported() {
            return ('serviceWorker' in navigator)
        },
        pushNotificationsSupported() {
            return ('PushManager' in window)
        },
        taskActor() {
            return this.displayNameForUid(this.currentUserId)
        },
        taskPastDue: {
            get() {
                if(!this.task.dueBy) { return false } // can't be past due with no due date

                let now = new Date()                            
                if(this.task.completedDate && this.task.dueBy) {                    
                    let compDate = date.formatDate(new Date(this.task.completedDate), 'YYYY-MM-DD HH:HH')
                    return compDate > this.task.dueBy                                    
                } else {
                    return now > this.task.dueBy
                }
            }
        },
        taskComplete: {
            get() {
                return this.task.completed 
            },
            set(value) {              
                this.toggleComplete({id: this.id, updates: { completed: value }})                
                this.showStatus('Task ' + (value ? 'marked complete.' : 'restored.'))            
                
                let pointsText = ""

                let entry = {
                    actorId: this.currentUserId, 
                    actorName: this.taskActor,
                    actionDate: new Date(),                    
                    logMessage: '',
                    endpoint: '',
                    actionCode: 0 
                }

                if(this.task.assignedTo) { 
                    entry.visibleTo = this.task.assignedTo 
                }

                if(this.task.createdBy != this.currentUserId) {
                    entry.visibleTo = this.task.createdBy
                }

                if(value) { 
                    //task is completed
                    pointsText = this.task.points == 0 ? "." : " (" + this.task.points + " points.)"
                    entry.logMessage = "completed task '" + this.task.title + "'" + pointsText,
                    entry.endpoint = 'completeTask'
                    entry.actionCode = 12 // COMPLETED TASK
                } else {
                    pointsText = this.task.points == 0 ? "." : " (" + this.task.points + " points removed.)"
                    entry.logMessage = "marked task '" + this.task.title + "' as not completed" + pointsText,
                    entry.endpoint = 'restoreTask'
                    entry.actionCode = 15 // TASK NOT COMPLETE                    
                }                
                
                this.addLog(entry)
 
                            
                let notification = {
                    data: entry,
                    recipient: this.otherParty,
                    endpoint: 'completeTask'
                } 
                console.log('task.taskComplete:', notification)

                let payload = qs.stringify(notification)
                let ax = `${ process.env.API }/${ notification.data.endpoint }?${ payload }`                
                this.$axios.post(ax)
                

            }
        },
        taskInProgress:{
            get() {
                return this.task.status == "IN PROGRESS"
            },
            set(value) {         
                let payload = {id: this.id, task: { status: value ? "IN PROGRESS" : ""}}   
                
                this.updateTask(payload)

                let entry = {
                    actor: this.currentUserId,
                    visibleTo: '',
                    actionCode: 14,
                    actionDate: new Date(),
                    logMessage: " marked task '" + this.task.title + "' as in progress."
                }
                if(this.task.assignedTo != '') { 
                    if(this.task.assignedTo != this.currentUserId ){
                        entry.visibleTo = this.task.assignedTo 
                    }
                }
                this.addLog(entry)

                                 
                
                // let notificationData = {
                //     log: entry,
                //     connections: this.connectionsActive
                // }
                // pushService.sendNotification(notificationData)
            }            
            
        },
        otherParty()
        {
            //if(currentUserIsMaster()) {
                if(this.task.assignedTo == this.currentUserId && this.task.createdBy != this.currentUserId ) { 
                    return this.task.createdBy 
                } else {                    
                    return this.task.assignedTo != '' ? this.task.assignedTo : ''
                }   
        },
        currentUserIsMaster() {
            this.task.connections.forEach(conn => {
                return conn.masterUser == this.currentUserId
            })
        }
    },
    methods: {
        ...mapActions("tasks", ["updateTask", "deleteTask", "toggleComplete"]),
        ...mapActions("logging", ["addLog"]),
        setTaskBackground() {
            //task.completed ? 'bg-grey-3 q-pa-xs' : 'bg-white q-pa-xs'
            let disp = "q-pa-none "
            if (this.task.completed) {
                disp += "bg-grey-3"
                return disp
            }

            if(this.task.status) {
                if (this.task.status.toUpperCase() == "IN PROGRESS") {
                    disp += "bg-orange-1" 
                }
            }

            if( this.task.dueBy ) {
                let due = new Date(this.task.dueBy)
                let now = new Date()
                if (due < now) {                            
                    disp += "bg-red-1"
                }
            }
            
            return disp
        },
        setTabColor() {
            let base = "q-pa-none "
            let color = ""

            if (this.task.status == "IN PROGRESS") { color = "bg-orange" } 

            if( this.task.dueBy ) {
                let due = new Date(this.task.dueBy)
                let now = new Date()
                if (due < now) {                            
                    color = "bg-red"
                }
            }  
            if (this.task.completed) { color = "bg-green" }

            return base + color
        },
        setInProgress({reset}) {             
            this.taskInProgress = true         
            
            this.showStatus('Task set to In Progress')
            this.finalize(reset)
        },
        finalize (reset) {
            this.timer = setTimeout(() => {
                reset()
            }, 1000)
        },
        showDueDateTime(task) {
            let result = ""

            // Is the due date/time empty?
            if (task.dueBy == "") {
                return "PENDING"
            }

            // Is the date valid?
            if (!date.isValid(task.dueBy)) {
                return "(invalid due date)";
            }

            let dueDate = date.formatDate(task.dueBy, "dddd, MMMM Do")
            let dueTime = date.formatDate(task.dueBy, this.settings.use24HourTime ? "HH:mm" : "h:mm A")
 
            if (typeof dueDate != "undefined" ) {
                result += 'DUE ' + dueDate
                if (typeof dueTime != "undefined") {
                    result += " @ " + dueTime
                }
            }

            //Is the task completed?            
            if(task.completed) {       
                // console.log('cS', task)   
                // console.log('cT', task.completedDate)   
                let completeDate = date.formatDate(task.completedDate, "dddd, MMMM Do")
                let completeTime = date.formatDate(task.completedDate, this.settings.use24HourTime ? "HH:mm" : "h:mm A")
                
                // console.log('cD', completeDate) 
                // console.log('cT', completeTime) 

                result += " | COMPLETED " + completeDate + ' @ ' + completeTime
            }
            
            return result != "" ? result : "PENDING"
        },
        showAssigned() {
            
            var _task = this.task
            var assigned = ''
            var action = ''
            var asn = ''
            var isDom = false
            var isSub = false
 
            if (_task.assignedTo == '') { return '' }
            
            if (_task.assignedTo == this.currentUserId ) {  // ASSIGNED TO USER
                action = "by"
                let conn = this.assignableForUid(_task.createdBy) 
                if(conn.masterUser == _task.assignedTo) { 
                    assigned = conn.slaveName
                } else { 
                    assigned = conn.masterName
                }
                
            } else {
                if (_task.createdBy != this.currentUserId) { // ASSIGNED BY USER 
                    action = "to" 
                    let conn = this.assignableForUid(_task.assignedTo) 
                    if(conn.masterUser == _task.assignedTo) { 
                        assigned = conn.slaveName
                    } else {  
                        assigned = conn.masterName
                    }
                } else { 
                    action = "by" 
                    let conn = this.assignableForUid(_task.assignedTo) 
                    if(conn.masterUser == _task.assignedTo) { 
                        assigned = conn.slaveName
                    } else {  
                        assigned = 'You'
                    }
                }
            }
            
            if (assigned) {
                assigned = "( Assigned " + action + " " + assigned + " )"
            }
                        
            return assigned

        },
        
        showEditTaskModal() {
            if (!this.task.completed) 
            {
                let asn = this.assignableForUid(this.task.createdBy)                 
                if(this.task.assignedTo == this.currentUserId) {                    
                    if (asn.slaveUser != this.currentUserId) {                        
                        this.showEditTask = true
                    } else {
                        this.showStatus("You're not allowed to edit tasks assigned to you by " + asn.masterName)
                    }
                } else {
                    this.showEditTask = true
                }
            } else {                
                this.showStatus('Completed tasks cannot be edited.')
            }
            
        },
        promptToDelete(args) {
            this.$q
                .dialog({
                    title: "Confirm",
                    message: "Delete this task (" + args.task.title + ")?",
                    ok: {
                        push: true
                    },
                    cancel: {
                        color: "negative"
                    },
                    persistent: true
                })
                .onOk(() => {
                    
                    this.deleteTask(args.id);
                });
        },
        showStatus(message)
        {
            Notify.create({
                message: message,
                color: 'info',
                position: 'top'
            })     
        }        
    },
    components: {
        "edit-task": require("components/Tasks/AddEditTask.vue").default
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
    }
};
</script>
 