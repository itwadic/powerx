import { LocalStorage, Loading } from 'quasar'
import { firebaseAuth } from 'src/services/firebase'
import { showErrorMessage } from 'src/functions/function-show-error-message'
import defaultTasks from './default-tasks'

const state = {
    loggedIn: false,
    loggedInUid: '',
    authError: ''
}

const mutations = {
    setLoggedIn(state, payload) {
        if (payload.loggedIn == true) {
            state.loggedIn = payload.loggedIn
            state.loggedInUid = payload.loggedInUid                   
        } else {
            state.loggedIn = false
            state.loggedInUid = ''            
        }        
    },
    setAuthError(state, message) {
        state.authError = message
    }
}

const actions = {
    registerUser({ commit, dispatch }, payload) {
        Loading.show()
        firebaseAuth.createUserWithEmailAndPassword(payload.email, payload.password)
            .then(response => {                
                // Create default tasks to show up on their task list.                
                 Object.entries(defaultTasks.defaultTasks).forEach(function(entry) {
                    let task = entry[1]                    
                    task.createdBy = response.user.uid
                    dispatch('tasks/addTask', task, { root: true })
                })

                // Create 'blank' new user profile
                dispatch('settings/initSettings', response.user.uid, { root: true })
 
            })
            .catch(error => {
                Loading.hide()                
                //console.log(error)
                setTimeout(() => {
                    commit('setAuthError', error.code)
                }, 1000)
            })
    },
    loginUser({commit}, payload) {
        Loading.show()            
        firebaseAuth.signInWithEmailAndPassword(payload.email, payload.password)
            .then(response => {                         
            })
            .catch(error => {                                
                Loading.hide()                
                console.log(error)
                setTimeout(() => {
                    commit('setAuthError', error.code)
                }, 1000)   
            })                 
    },
    logoutUser( {commit} ) {        
        state.settings = {}
        commit('tasks/unsubscribeListeners', false, { root: true })
        commit('connections/unsubscribeListeners', false, { root: true })
        firebaseAuth.signOut()
    },
    onAuthStateChange({ commit, dispatch }) {                
        firebaseAuth.onAuthStateChanged(user => {
            Loading.hide()
            if (user) {                                                
                // console.log('LOGGED IN', user.uid)
                                
                dispatch('settings/loadSettings', state, { root: true })
                dispatch('connections/dbLoadConnections', state, { root: true })
                dispatch('tasks/dbLoadTasks', state, { root: true })
                dispatch('rules/dbLoadRules', state, { root: true })
                dispatch('rituals/dbLoadRituals', state, { root: true })
                dispatch('protocols/dbLoadProtocols', state, { root: true })
                dispatch('logging/dbLoadLogs', state, { root: true })

                commit('setLoggedIn', { loggedIn: true, loggedInUid: user.uid})                
                LocalStorage.set('loggedIn', true)
                this.$router.push('/').catch(err => {})
                
            }
            else {
                // console.log('LOGGED OUT')
                dispatch('settings/clearSettings', null, { root: true })
                commit('tasks/clearTasks', null, { root: true })
                commit('rules/clearRules', null, { root: true })
                commit('rituals/clearRituals', null, { root: true })
                commit('protocols/clearProtocols', null, { root: true })
                
                commit('tasks/setTasksDownloaded', false, { root: true })
                commit('rules/setRulesDownloaded', false, { root: true })
                commit('rituals/setRitualsDownloaded', false, { root: true })
                commit('protocols/setProtocolsDownloaded', false, { root: true })
                commit('logging/setLogsDownloaded', false, { root: true })
                
                commit('setLoggedIn', { loggedIn: false, loggedInUid: '' })
                LocalStorage.set('loggedIn', false)
                this.$router.replace('/auth')
            }
        })
    }
}

const getters = {
    currentUserId() {
        return state.loggedInUid
    },
    getAuthError() {
        return state.authError
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}