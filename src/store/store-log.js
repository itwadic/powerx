import Vue from 'vue'
// import { uid } from 'quasar'
import { firebaseDb, firebaseAuth } from 'src/services/firebase'
import { date, Notify, LocalStorage } from 'quasar'
// import storeConnections from './store-connections'

const state = {   
    logs: {},
    unsubscribeUser: null
}

/*
    Log Notification Definition

    actor: UID of the person taking the action
    actionCode: integer representation of action
        10 - created task
        11 - edited task
        12 - completed task
        13 - deleted task
        20 - created connection
        21 - accepted connection
        22 - denied connection
        23 - revoked connection
        30 - created ritual
        31 - edited ritual
        32 - deleted ritual
        40 - created rule 
        41 - edited rule
        42 - deleted rule
        50 - created protocol
        51 - edited protocol 
        52 - deleted protocol 
        60 - added points
        61 - removed points
    actionDate: when the action occured 
    logMessage: unique text of the action    
*/

const mutations = {
    addLog(state, payload) {
        Vue.set(state.logs, payload.id, payload.entry)
    },
    setListener(state, payload)
    {
        if(payload.switch == 'user') {
            state.unsubscribeUser = payload.unsubscribe
        } else {
            state.unsubscribeConn = payload.unsubscribe
        }

    },
    unsubscribeListeners(state) {
        if(state.unsubscribeUser) { state.unsubscribeUser() }
        //if(state.unsubscribeConn) { state.unsubscribeConn() }
    },
    setLogsDownloaded(state, value) {
        state.logsDownloaded = value
    },
}

const actions = {   
    addLog({dispatch}, entry) {
        dispatch('dbAddLog', entry)
    },
    dbAddLog({commit}, entry) {
        firebaseDb.collection('logs').add({
            ...entry
        })
            .then(function (docRef) {
                let timeStamp = Date.now()
                LocalStorage.set('lastLogDate', timeStamp)

                let payload = {
                    id: docRef.id,
                    entry: entry
                }
                commit('addLog', payload)
            })
    },
    dbLoadLogs: ({ commit, dispatch, rootState, rootGetters }, state) => {
        //console.log('dbLoadTasks Entry')
        
        // Retrieve all logs where the CURRENT USER is the ACTOR
        state.logs = []
        var t1 = firebaseDb.collection('logs')
                    .where("actor", "==", firebaseAuth.currentUser.uid)                    
                            
        var unsub = t1.onSnapshot((snapshot) => {
                snapshot.forEach(function (doc) {
                    let newLog = {
                        id: doc.id,
                        entry: {
                            actionCode: doc.data().actionCode,
                            actor: doc.data().actor,
                            visibleTo: doc.data().visibleTo,
                            logMessage: doc.data().logMessage,
                            actionDate: doc.data().actionDate.toDate()    
                        } 
                    }
                    commit('addLog', newLog)
                })
            }) 
        commit('setListener', { switch: 'user', unsubscribe: unsub})
 
        // Retrieve all connections where the CURRENT USER is the MASTER
        var c1 = firebaseDb.collection("connections")
        .where("masterUser", "==", firebaseAuth.currentUser.uid)
        .orderBy("rank")

        // Load all logs from each SLAVE USER into the view for the MASTER
        c1.onSnapshot((snapshot) => {
            snapshot.forEach(function (doc) {    
                let newConn = {
                    id: doc.id,
                    connection: doc.data()
                }
                
                var t3 = firebaseDb.collection('logs')
                    .where("actor", "==", newConn.connection.slaveUser) 

                unsub = t3.onSnapshot((snapshot) => {
                    snapshot.forEach(function (doc) {
                        let newLog = {
                            id: doc.id,
                            entry: {
                                actionCode: doc.data().actionCode,
                                actor: doc.data().actor,
                                visibleTo: doc.data().visibleTo,
                                logMessage: doc.data().logMessage,
                                actionDate: doc.data().actionDate.toDate()    
                            } 
                        }                        
                        commit('addLog', newLog)
                    })
                })         
                commit('setListener', { switch: 'conn', unsubscribe: unsub})
                
            }) 
        })
        
        // If being viewed by a slave... Load all logs from the MASTER user for the view of the THIS SLAVE ONLY
        var c2 = firebaseDb.collection("connections")
        .where("slaveUser", "==", firebaseAuth.currentUser.uid) 

        c2.onSnapshot((snapshot) => {
            snapshot.forEach(function (doc) {    
                let newConn = {
                    id: doc.id,
                    connection: doc.data()
                }
            
                            
                var t4 = firebaseDb.collection('logs')
                .where("actor", "==", newConn.connection.masterUser) 
                .where("visibleTo", "==", newConn.connection.slaveUser) 

                let unsub4 = t4.onSnapshot((snapshot) => {
                    snapshot.forEach(function (doc) {
                        let newLog = {
                            id: doc.id,
                            entry: {
                                actionCode: doc.data().actionCode,
                                actor: doc.data().actor,
                                visibleTo: doc.data().visibleTo,
                                logMessage: doc.data().logMessage,
                                actionDate: doc.data().actionDate.toDate()    
                            }                        
                        }
                        //console.log(newLog.entry)
                        commit('addLog', newLog)
                    })
                })
                commit('setListener', { switch: 'conn', unsubscribe: unsub4})
            })
        })

        
                
        

        commit('setLogsDownloaded', true)
    },
}

const getters = {       
    logs: (state) => {        
        let entriesOrdered = Object.entries(state.logs)
        let entriesSorted = {}
        let logsSorted = {}
         
        entriesOrdered.sort((a,b) => {date.formatDate(a[1].actionDate, 'MM/DD/YYYY') > date.formatDate(b[1].actionDate, 'MM/DD/YYYY') ? 1 : -1 })
        entriesSorted = entriesOrdered.sort((a,b) => { return a[1].actionDate > b[1].actionDate ? -1 : 1 })  
        
        
        entriesSorted.forEach((entry) => {             
            logsSorted[entry[0]] = (entry[1])
		 })
        
        
        return logsSorted
		
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
