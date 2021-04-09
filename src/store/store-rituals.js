import Vue from 'vue'
import { firebaseDb, firebaseAuth } from 'src/services/firebase'
import { Notify } from 'quasar'

const state = {   
    ritualsDownloaded: false,
    mode: 'add',    
    workRitual: '',
    rituals: {}
}

const mutations = {   
    addRitual(state, payload) {        
        Vue.set(state.rituals, payload.id, payload.ritual)
    },
    updateRitual(state, payload) {
        Object.assign(state.rituals[payload.id], payload.ritual)
    }, 
    deleteRitual(state, id) {
        Vue.delete(state.rituals, id)
        Notify.create({
            message: 'Ritual deleted.',
            color: 'info',
            position: 'top'
        })
    },
    clearRituals(state) {
        state.rituals = {}
    }, 
    setRitualsDownloaded(state, value) {
        state.ritualsDownloaded = value
    },
    setAddEditRitualMode(state, mode) {        
        state.mode = mode 
        if(mode === 'add') {
            state.workRitual = ""
        }
    },
    setAddEditRitual(state, payload) {   
        state.workRitual = payload 
    }
}

const actions = {   
    addRitual({ dispatch }, ritual) {             
        dispatch('dbAddRitual', ritual)
    },
    updateRitual({ dispatch }, payload) {
        dispatch('dbUpdateRitual', payload)
    }, 
    deleteRitual({ dispatch }, id) {
        dispatch('dbDeleteRitual', id)
    },  
    setAddEditRitualMode({commit}, mode) {        
        commit('setAddEditRitualMode', mode)
    },
    setAddEditRitual({commit}, payload) {        
        commit('setAddEditRitual', payload)
    },
    dbAddRitual({ commit }, ritual) {        
        firebaseDb.collection('rituals').add({
            ...ritual           
        })
            .then(function (docRef) {
                let payload = {
                    id: docRef.id,
                    ritual: ritual
                }
                commit('addRitual', payload)
            })

            .catch(err => {
                console.error('ADD RULE ERROR: ', err)
            })

    },
    dbUpdateRitual({ commit }, payload) {
        firebaseDb.collection('rituals').doc(payload.id).update({            
            ...payload.ritual 
        }).then(() => {
            commit('updateRitual', payload)
        }).catch(err => {
            console.error('UPDATE RULE ERROR: ', err)
        })
    },  
    dbDeleteRitual({ commit }, ritualId) {
        firebaseDb.collection('rituals').doc(ritualId)
            .delete()
            .then(() => {
                commit('deleteRitual', ritualId)
            })
    }  ,

    dbLoadRituals: ({ commit }, state) => {
        //console.log('dbLoadRituals ENTRY')
        state.rituals = []
        var t1 = firebaseDb.collection('rituals')
                    .where("createdBy", "==", firebaseAuth.currentUser.uid)                    
        
        t1.onSnapshot((snapshot) => {
            snapshot.forEach(function (doc) {
                let newRitual = {
                    id: doc.id,
                    ritual: doc.data()
                }
                commit('addRitual', newRitual)
            })
        }) 
        // commit('setListener', { switch: 'user', unsubscribe: unsub})

        firebaseDb.collection('connections').where("slaveUser", "==", firebaseAuth.currentUser.uid)
        .get()
        .then(function (snapshot) {                
            snapshot.forEach(function(doc) {                 
                firebaseDb.collection('rituals').where("createdBy", "==", doc.data().masterUser)
                .get()
                .then(function (snap2) {                
                    snap2.forEach(function(rit) { 
                        // console.log(rit)
                        let newRit = {
                            id: rit.id,
                            ritual: rit.data()
                        }
                        commit('addRitual', newRit)            
                    })
                })
            })
        })

        // var t2 = firebaseDb.collection('rituals')
        //             .where("assignedTo", "==", firebaseAuth.currentUser.uid)                    
        
        // t2.onSnapshot((snapshot) => {
        //     snapshot.forEach(function (doc) {
        //         let newRitual = {
        //             id: doc.id,
        //             Ritual: doc.data()
        //         }
        //         commit('addRitual', newRitual)
        //     })
        // }) 
        // // commit('setListener', { switch: 'conn', unsubscribe: unsub})

        commit('setRitualsDownloaded', true)        
    } 
}

const getters = {   
    ritualsList() {        
        return state.rituals
    }, 
    getWorkRitual() {
        let ritual = state.workRitual
        return ritual
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
