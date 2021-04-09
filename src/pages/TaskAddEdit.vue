<template>

    <!-- 
        Convert all the pop-up add/edit windows into single-page states.
    -->
    <q-card>
        <q-card-section class="row">              
            <div class="col-1">
                <q-btn v-close-popup flat round dense color="primary" icon="keyboard_arrow_left" />
            </div>
            <div class="col text-h6">{{ pageTitle }}</div>          
        </q-card-section>

        <form @submit.prevent="submitForm">
            <q-card-section class="q-pt-none q-pb-none">
                <!-- -------- TITLE -------- -->
                <q-input                    
                    v-model="workTask.title"
                    :rules="[val => !!val || 'Task name is required']"
                    autofocus
                    label="Task name"
                    ref="title"
                />                

                <!-- -------- TASK NOTES -------- -->
                <q-input                    
                    v-model="workTask.notes"                    
                    label="Notes"
                    type="textarea"
                    autogrow                  
                />
 
                <!-- -------- ASSIGNED TO -------- -->
                <q-card  flat  >
                    <div style="width:100%">
                        <div class="q-mt-sm text-subtitle1 text-grey-7">{{assignedName}}</div>
                    </div>
                    <div class="row">
                        <task-assign 
                            assignee="Me" 
                            :image="this.settings.profileImageUrl"
                            clickable 
                            @click.native="assignTask(currentUserId, 'Me')" 
                        />
                        
                        <task-assign 
                            v-for="assignable in connectionsActive" 
                            :key="assignable.id" 
                            :assignee="assignable.toName"
                            :image="assignable.toImage"
                            clickable
                            @keyUp
                            @click.native="assignTask(assignable.toUid, assignable.toName)"                             
                        />
                    </div>
                    <hr>
                </q-card>

                <!-- DUE DATE+TIME -->                
                <q-card class="row" flat >
                    <div class="col-auto q-mt-sm text-grey-8 text-subtitle1">Due:</div>
                    <div class="col q-pl-sm q-mt-sm text-grey-8 text-subtitle1">{{ showDueDateTime() }}</div>
                    <q-icon size="lg" color="primary" name="event" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                                v-model="workTask.dueBy"
                                mask="YYYY-MM-DD HH:mm"
                            />
                        </q-popup-proxy>
                    </q-icon>
                    <q-icon size="lg" color="primary" name="access_time" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-time
                                v-model="workTask.dueBy"
                                mask="YYYY-MM-DD HH:mm"
                            />
                        </q-popup-proxy>
                    </q-icon>                    
                </q-card>
                <hr>
                

                <!-- PRIORITY -->
                <div class="row">
                    <div class="col">
                        <q-card class="row" flat >       
                            <div class="col q-mt-sm text-grey-8 text-subtitle1">Priority:</div>            
                            <div class="col-auto">
                            <q-rating           
                                v-model="workTask.priority"                                
                                size="lg"
                                icon="stars"
                                color="primary">
                                <template v-slot:tip-1>
                                    <q-tooltip>We'll get to this when we can.</q-tooltip>
                                </template>
                                <template v-slot:tip-2>
                                    <q-tooltip>This would be nice to have done soon.</q-tooltip>
                                </template>
                                <template v-slot:tip-3>
                                    <q-tooltip>This needs to get done.</q-tooltip>
                                </template>                        
                                <template v-slot:tip-4>
                                    <q-tooltip>It is urgent that this is completed as soon as possible.</q-tooltip>
                                </template>
                                <template v-slot:tip-5>
                                    <q-tooltip>Drop EVERYTHING and GET THIS DONE PRONTO!</q-tooltip>
                                </template>
                            </q-rating>   
                            </div>                         
                        </q-card>
                     </div>
                </div>
                <hr>

                <!-- ASSIGN POINTS -->                                
                <q-card class="row q-mt-sm" flat>
                    <div class="col-auto q-mt-sm text-grey-8 text-subtitle1">Points:</div>
                    <div class="col-auto q-pl-sm q-mt-sm text-grey-8 text-subtitle1">{{ workTask.points }}</div>
                    <div class="col q-ml-md">
                        <q-slider
                        v-model="workTask.points"
                        :min="0"
                        :max="100"
                        :step="5"
                        snap                                
                        label 
                        :label-value="workTask.points + ' points'"                        
                        color="primary"
                    />
                    <q-tooltip max-width="350px">
                        Select the amount of points to be awarded if this task is completed, or, if a due date/time is provided, if it is completed before it is due.
                    </q-tooltip>     
                    </div>                       
                </q-card>
                
            </q-card-section>

            <q-card-actions align="right">
                <q-btn label="CANCEL" color="green" class="q-pa-md" v-close-popup />
                <q-btn label="SAVE" color="primary" type="submit" class="q-pa-md" />
            </q-card-actions>
        </form>
    </q-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import { firebaseAuth } from "src/services/firebase"
import { date } from "quasar"

export default {
    props: ['mode', "task", "id"],
    data() {        
        return {
            workTask: {
                title: "",
                notes: "",
                priority: 3,
                points: 10,
                status: "",
                category: 'Task',
                createdBy: "",
                createdDate: Date.parse(new Date()),
                assignedTo: "",
                assignedDate: Date.parse(new Date()),
                dueBy: "",
                completed: false,
                completedDate: "",
                metadata: {}
            },
            categories: ["Task", "Protocol", "Ritual", "Rule"],            
            assignedName: 'Assign To Me'            
        };
    },
    components: {
        "task-assign": require("components/Tasks/TaskAssign2.vue").default
    },
    computed: {
        ...mapGetters('connections', ['connectionsActive', 'connectionForUid', 'profileImageForUid']),
        ...mapGetters('settings', ['settings']),
        ...mapGetters('auth', ['currentUserId']),
        pageTitle() {
            if(this.mode == "add") {                
                this.workTask.createdBy = this.currentUserId
                return "Add New Task"
            } else {
                return "Edit Task: " + this.workTask.title
            }
        }
    },
    methods: {
        ...mapActions("tasks", ["addTask", "updateTask"]),
        assignTask(uid, name) {    
            this.assignedName = "Assigned to " + name
            if (uid != this.currentUserId) {                
                this.workTask.assignedTo = uid
            } else if (uid == this.currentUserId && 
                       uid == this.workTask.createdBy) {
                this.workTask.assignedTo = ''
            }
        },            
        submitForm() {
            this.$refs.title.validate();
            if (!this.$refs.title.hasError) {
                this.submitTask();
            }
        },
        submitTask() {
            if(this.mode == "add") {                
                this.addTask(this.workTask);                
            } else {
                this.updateTask({ id: this.id, task: this.workTask });                
            }
            this.$emit("close");
        },
        showDueDateTime() {
            // Is the due date/time empty?
            if (this.workTask.dueBy == "") {
                return "PENDING";
            }

            // Is the date valid?
            if (!date.isValid(this.workTask.dueBy)) {
                console.error('dueBy=', this.workTask.dueBy)
                return "???";
            }

            let dueDate = date.formatDate(this.workTask.dueBy, "dddd, MMMM Do")
            let dueTime = date.formatDate(this.workTask.dueBy, this.settings.use24HourTime ? "HH:mm" : "h:mm A")

            if (dueTime == "0:00 AM") {
                return dueDate;
            }

            return dueDate + " @ " + dueTime;
        },
    },
    mounted() {
        if(this.mode == "edit") {
            this.workTask = Object.assign({}, this.task)
            if(this.workTask.assignedTo) {                
                // console.log('MOUNT', this.workTask.assignedTo)
                let conn = this.connectionForUid(this.workTask.assignedTo)
                this.assignTask(this.workTask.assignedTo, conn.slaveName)
                // console.log('MOUNT', this.workTask)
            }
        }        
    }
};
</script>

<style lang="scss" scoped>
    hr {
        border-top: 1px solid #ccc
    }
</style>