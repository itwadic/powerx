import Vue from 'vue'
import { uid } from 'quasar'
import { firebaseDb, firebaseAuth } from 'src/services/firebase'
import { date, Notify } from 'quasar'
import storeConnections from './store-connections'

const state = {
    tasksDownloaded: false,
    tasks: {},
    search: '',
    sort: 'Title',
    unsubscribeUser: null,
    unsubscribeConn: null,
    reviewPercentCompleted: 0,
    reviewPointsEarned: 0
}

const mutations = {
    addTask(state, payload) {
        Vue.set(state.tasks, payload.id, payload.task)
    },
    updateTask(state, payload) {
        Object.assign(state.tasks[payload.id], payload.task)
    },
    completeTask(state, payload) {
        Object.assign(state.tasks[payload.id], payload.updates)
    },
    deleteTask(state, id) {
        Vue.delete(state.tasks, id)
        Notify.create({
            message: 'Task deleted.',
            color: 'info',
            position: 'top'
        })
    },
    clearTasks(state) {
        state.tasks = {}
    },
    setSearch(state, value) {
        state.search = value
    },
    setSort(state, value) {
        state.sort = value
    },
    setTasksDownloaded(state, value) {
        state.tasksDownloaded = value
    },
    setListener(state, payload) {
        if (payload.switch == 'user') {
            state.unsubscribeUser = payload.unsubscribe
        } else {
            state.unsubscribeConn = payload.unsubscribe
        }

    },
    unsubscribeListeners(state) {
        if (state.unsubscribeUser) { state.unsubscribeUser() }
        if (state.unsubscribeConn) { state.unsubscribeConn() }
    }
}

const actions = {
    updateTask({ dispatch }, payload) {
        dispatch('dbUpdateTask', payload)
    },
    toggleComplete({ dispatch }, payload) {
        dispatch('dbToggleComplete', payload)
    },
    deleteTask({ dispatch }, id) {
        dispatch('dbDeleteTask', id)
    },
    addTask({ dispatch }, task) {
        dispatch('dbAddTask', task)
    },
    setSearch({ commit }, value) {
        commit('setSearch', value)
    },
    setSort({ commit }, value) {
        commit('setSort', value)
    },
    dbLoadTasks: ({ commit, dispatch, rootState, rootGetters }, state) => {
        //console.log('dbLoadTasks Entry')

        state.tasks = []
        var t1 = firebaseDb.collection('tasks')
            .where("createdBy", "==", firebaseAuth.currentUser.uid)
            .where("category", "==", "Task")


        var unsub = t1.onSnapshot((snapshot) => {
            snapshot.forEach(function (doc) {
                let newTask = {
                    id: doc.id,
                    task: doc.data()
                }
                commit('addTask', newTask)
            })
        })
        commit('setListener', { switch: 'user', unsubscribe: unsub })

        var t2 = firebaseDb.collection('tasks')
            .where("assignedTo", "==", firebaseAuth.currentUser.uid)
            .where("category", "==", "Task")

        unsub = t2.onSnapshot((snapshot) => {
            snapshot.forEach(function (doc) {
                let newTask = {
                    id: doc.id,
                    task: doc.data()
                }
                commit('addTask', newTask)
            })
        })
        commit('setListener', { switch: 'conn', unsubscribe: unsub })

        // Now let's get tasks for connections that aren't assigned to anyone
        var c1 = firebaseDb.collection("connections")
            .where("masterUser", "==", firebaseAuth.currentUser.uid)
            .orderBy("rank")

        c1.onSnapshot((snapshot) => {
            snapshot.forEach(function (doc) {
                let newConn = {
                    id: doc.id,
                    connection: doc.data()
                }

                var t3 = firebaseDb.collection('tasks')
                    .where("createdBy", "==", newConn.connection.slaveUser)
                    .where("assignedTo", "==", "")

                unsub = t3.onSnapshot((snapshot) => {
                    snapshot.forEach(function (doc) {
                        let newTask = {
                            id: doc.id,
                            task: doc.data()
                        }
                        //console.log('loading task', newTask)
                        commit('addTask', newTask)
                    })
                })
                commit('setListener', { switch: 'conn', unsubscribe: unsub })

            })
        })

        commit('setTasksDownloaded', true)
    },
    dbAddTask({ commit }, task) {
        firebaseDb.collection('tasks').add({
            ...task
        })
            .then(function (docRef) {
                let payload = {
                    id: docRef.id,
                    task: task
                }
                commit('addTask', payload)
            })

            .catch(err => {
                console.error('ADD TASK ERROR: ', err)
            })

    },
    dbUpdateTask({ commit }, payload) {
        firebaseDb.collection('tasks').doc(payload.id).update({
            ...payload.task
        }).then(() => {
            commit('updateTask', payload)
        }).catch(err => {
            console.error('UPDATE TASK ERROR: ', err)
        })
    },
    dbToggleComplete({ commit }, payload) {

        let taskRef = firebaseDb.collection('tasks').doc(payload.id)

        taskRef.update({
            completedDate: payload.updates.completed ? Date.parse(new Date()) : '',
            completed: payload.updates.completed
        }).then(() => {
            commit('completeTask', payload)
        }).catch(err => {
            console.error('COMPLETE TASK ERROR: ', err)
        })
    },
    dbDeleteTask({ commit }, taskId) {
        firebaseDb.collection('tasks').doc(taskId)
            .delete()
            .then(() => {
                commit('deleteTask', taskId)
            })
    }
}

const getters = {

    tasksSorted: (state) => {
        let keysOrdered = Object.keys(state.tasks)
        let tasksSorted = {}

        if (state.sort == "priority") {
            keysOrdered.sort((a, b) => {
                return state.tasks[a][state.sort] > state.tasks[b][state.sort] ? -1 : 1
            })
        } else {
            keysOrdered.sort((a, b) => {
                return state.tasks[a][state.sort] > state.tasks[b][state.sort] ? 1 : -1
            })
        }

        keysOrdered.forEach((key) => {
            tasksSorted[key] = state.tasks[key]
        })

        return tasksSorted

    },
    tasksFiltered: (state, getters) => {
        let tasksSorted = getters.tasksSorted

        let tasksFiltered = {}
        if (state.search) {
            Object.keys(tasksSorted).forEach(function (key) {
                let task = tasksSorted[key],
                    taskNameLowerCase = task.title.toLowerCase(),
                    searchLowerCase = state.search.toLowerCase()
                if (taskNameLowerCase.includes(searchLowerCase)) {
                    tasksFiltered[key] = task
                }
            })
            return tasksFiltered
        }
        return tasksSorted
    },
    tasksTodo: (state, getters) => (id) => {

        let tasksFiltered = getters.tasksFiltered
        let tasks = {}
        Object.keys(tasksFiltered).forEach(function (key) {
            let task = tasksFiltered[key]
            // console.log(task)
            if (!task.completed) {
                // if (task.title == 'test reverse') { debugger}
                if (task.assignedTo == id || (task.createdBy == id && task.assignedTo == "")) {
                    tasks[key] = task
                }
            }
        })
        return tasks
    },
    tasksCompleted: (state, getters) => (id) => {
        // console.log('TASKSCOMPLETED()')
        let tasksFiltered = getters.tasksFiltered
        let tasks = {}
        Object.keys(tasksFiltered).forEach(function (key) {
            let task = tasksFiltered[key]
            if (task.completed) {
                if (task.assignedTo == id || (task.createdBy == id && task.assignedTo == "")) {
                    tasks[key] = task
                }
            }
        })
        // console.log('COMPLETED:', tasks)
        return tasks
    },
    tasksTodoToday: (state, getters) => (id) => {
        let taskList = getters.tasksFiltered
        let tasks = {}
        let now = new Date()
        Object.keys(taskList).forEach(function (key) {
            let task = taskList[key]
            if (!task.completed && task.dueBy) {
                let due = new Date(task.dueBy)
                if (!task.completed && due <= now) { // Task isn't completed and due date has past
                    if (task.assignedTo == id || (task.createdBy == id && task.assignedTo == "")) {
                        tasks[key] = task
                    }
                }
            } else {
                if (!task.completed && (task.assignedTo == id || (task.createdBy == id && task.assignedTo == ""))) { // Also show uncompleted "Pending" Tasks.
                    tasks[key] = task
                }
            }
        })
        return tasks
    },
    tasksCompletedToday: (state, getters) => (id) => {
        let taskList = getters.tasksFiltered
        let tasks = {}
        let now = new Date()

        Object.keys(taskList).forEach(function (key) {
            let task = taskList[key]
            if (task.completed) {
                let comp = new Date(task.completedDate)
                if (comp.toDateString() == now.toDateString()) { tasks[key] = task }
            }
        })
        return tasks
    },
    tasksOpenedByRange: (state, getters)  => (id, startDate, endDate) => {
        let tasks = state.tasks
        let tasksInRange = []

        Object.entries(tasks).forEach(function (entry) {
            let task = entry[1]
            let taskDate = date.formatDate(new Date(task.createdDate), 'MM/DD/YYYY')
            if (date.isBetweenDates(taskDate, startDate, endDate, { inclusiveFrom: true, inclusiveTo: true })) {
                tasksInRange.push(task)
            }
        })        
        return tasksInRange
    },
    tasksCompletedByRange: (state, getters) => (id, startDate, endDate) => {
        let tasks = getters.tasksCompleted(id)
        let tasksInRange = []

        Object.entries(tasks).forEach(function (entry) {
            let task = entry[1]
            let taskDate = date.formatDate(new Date(task.completedDate), 'MM/DD/YYYY')
            if (date.isBetweenDates(taskDate, startDate, endDate, { inclusiveFrom: true, inclusiveTo: true })) {
                tasksInRange.push(task)
            }
        })        
        return tasksInRange
    },
    countOfTasksOpened: (state, getters) => (id, startDate, endDate) => {         
        let tasks = getters.tasksOpenedByRange(id, startDate, endDate)
        return tasks.length
    },
    countOfTasksComplete: (state, getters) => (id, startDate, endDate) => {
        let tasks = getters.tasksCompletedByRange(id, startDate, endDate)
        return tasks.length

    },
    percentComplete: (state, getters) => (id, startDate, endDate) => {
        let opened = getters.countOfTasksOpened(id, startDate, endDate)
        let complete = getters.countOfTasksComplete(id, startDate, endDate)
        let percent = 0
        if(opened == 0) { 
            percent = 100 
            //console.log('opened == 0')
        } else if( opened > 0 && complete == 0 ) { 
            percent = 0 
            // console.log('opened != 0 and complete ==', complete)
        } else {
            percent = (complete / opened) * 100     //).toFixed(0), 10)
            // console.log (complete, opened , percent)
        }    
        return percent
    },
    calculatePoints: (state, getters) => (id, startDate, endDate, flag) => {
        let tasks = []

        if (flag == 'P') {
            let tasksTodo = getters.tasksTodo(id)
            Object.entries(tasksTodo).forEach(function (item) { tasks.push(item[1]) })
        }

        let tasksCompleted = getters.tasksCompleted(id)
        Object.entries(tasksCompleted).forEach(function (item) { tasks.push(item[1]) })

        let points = 0
        Object.entries(tasks).forEach(function (entry) {
            let task = entry[1]

            if ((date.isBetweenDates(date.formatDate(new Date(task.createdDate), 'MM/DD/YYYY'), startDate, endDate, { inclusiveFrom: true, inclusiveTo: true }) && task.dueBy == '') ||
                (date.isBetweenDates(date.formatDate(new Date(task.dueBy), 'MM/DD/YYYY'), startDate, endDate, { inclusiveFrom: true, inclusiveTo: true }))) {
                if (task.points > 0) {
                    points += task.points
                }
            }
        })
        return points
    },
    pointsPossible: (state, getters) => (id, startDate, endDate) => {
        let points = getters.calculatePoints(id, startDate, endDate, 'P')
        return points
    },
    pointsEarned: (state, getters) => (id, startDate, endDate) => {
        let points = getters.calculatePoints(id, startDate, endDate, 'E')
        return points
    }

}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}


// LEFT OFF:   Let's make %Complete and Points Earned into state properties instead of getters, so we get a reactive update.