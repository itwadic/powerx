<template>
    <q-page>
        <template v-if="tasksDownloaded">            
            <!-- TASK TOOLBAR -->
            <div class="row bg-grey-2">
                <div class="col-auto">
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
                title="Today's Tasks" 
                v-if="showTasksForUsers()=='Me' || showTasksForUsers()=='Everyone'"
                v-on:add="showAddTask=true"
            >                
                <q-card 
                    v-if="!Object.keys(tasksTodoToday(this.currentUserId)).length && !Object.keys(tasksTodoToday(this.currentUserId)).length"
                    class="q-pa-lg"
                >                    
                    <span class="text-h5 text-grey-5">No Tasks... well done!</span>
                </q-card>
                <!-- SHOW PENDING TASKS -->
                <q-list
                    v-if="Object.keys(tasksTodoToday(this.currentUserId)).length"
                    bordered 
                    separator                    
                >
                    <task v-for="(task, key) in tasksTodoToday(this.currentUserId)" :key="key" :task="task" :id="key" />
                </q-list>

                <!-- SHOW COMPLETED TASKS -->
                <q-list
                    v-if="Object.keys(tasksCompletedToday(this.currentUserId)).length"
                    bordered
                    separator
                    class="q-mt-lg"
                >
                    <task v-for="(task, key) in tasksCompletedToday(this.currentUserId)" :key="key" :task="task" :id="key" />
                </q-list>
            </px-panel>
            <div v-for="connection in connectionsActive" :key="connection.id">
                <px-panel 
                    v-if="connection.toName == showTasksForUsers() || showTasksForUsers() == 'All S-types' || showTasksForUsers() == 'Everyone'"
                    :title="panelTitle(connection.toName)"
                    v-on:add="showAddTask=true">
                    <q-card 
                        v-if="!Object.keys(tasksTodoToday(connection.toUid)).length && !Object.keys(tasksTodoToday(connection.toUid)).length"
                        class="q-pa-lg"
                    >                    
                        <span class="text-h5 text-grey-5">No Tasks.</span>
                    </q-card>
                    <!-- SHOW PENDING TASKS -->
                    <q-list
                        v-if="Object.keys(tasksTodoToday(connection.toUid)).length"
                        bordered 
                        separator                    
                    >
                        <task v-for="(task, key) in tasksTodoToday(connection.toUid)" :key="key" :task="task" :id="key" />
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

        <q-dialog v-model="showAddTask">
            <work-task mode="add" @close="showAddTask = false" />
        </q-dialog>
        
    </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex"

export default {
    prop: ['value'],
    data() {
        return {
            showAddTask: false,
            showSearch: false, 
            componentKey: 0,
            model: null,
            showTasksFor: 'Me',
            sortOptions: ['Title', 'Created Date', 'Due Date']
        }
    },
    computed: {
        ...mapGetters('connections', ['connectionsActive']),
        ...mapGetters("tasks", ["tasksTodoToday", "tasksCompleted", "tasksCompletedToday"]),
        ...mapGetters("auth", ["currentUserId"]),
        ...mapState("tasks", ["tasksDownloaded", "sort"])
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
        showEditActionModal() {
            this.showEditAction = true
        },
        panelTitle(name)
        {
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
            let selected = users.filter(user => user.value == this.showTasksFor)[0].value 
            this.$q.localStorage.set('show-task-for', selected)
            return selected 
        } 

    },
    mounted() {
        this.showTasksFor = "Me"
    }
}
</script>

<style>

.visibledevice {display:none;}
.visibledesktop {display:display;}

@media (max-width : 480px) {
    .visibledevice {display:block;}
    .visibledesktop {display:none;}
}


</style>