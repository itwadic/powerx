import Vue from 'vue'
import { firebaseDb, firebaseAuth } from 'src/services/firebase'
import { Notify } from 'quasar'

const state = {   
    protocolsDownloaded: false,
    mode: 'add',    
    workProtocol: '',
    protocols: {}
}

const mutations = {   
    addProtocol(state, payload) {        
        Vue.set(state.protocols, payload.id, payload.protocol)
    },
    updateProtocol(state, payload) {
        Object.assign(state.protocols[payload.id], payload.protocol)
    }, 
    deleteProtocol(state, id) {
        Vue.delete(state.protocols, id)
        Notify.create({
            message: 'Protocol deleted.',
            color: 'info',
            position: 'top'
        })
    },
    clearProtocols(state) {
        state.protocols = {}
    }, 
    setProtocolsDownloaded(state, value) {
        state.protocolsDownloaded = value
    },
    setAddEditProtocolMode(state, mode) {        
        state.mode = mode 
        if(mode === 'add') {
            state.workProtocol = ""
        }
    },
    setAddEditProtocol(state, payload) {   
        state.workProtocol = payload 
    }
}

const actions = {   
    addProtocol({ dispatch }, protocol) {             
        dispatch('dbAddProtocol', protocol)
    },
    updateProtocol({ dispatch }, payload) {
        dispatch('dbUpdateProtocol', payload)
    }, 
    deleteProtocol({ dispatch }, id) {
        dispatch('dbDeleteProtocol', id)
    },  
    setAddEditProtocolMode({commit}, mode) {        
        commit('setAddEditProtocolMode', mode)
    },
    setAddEditProtocol({commit}, payload) {        
        commit('setAddEditProtocol', payload)
    },
    dbAddProtocol({ commit }, protocol) {        
        firebaseDb.collection('protocols').add({
            ...protocol           
        })
            .then(function (docRef) {
                let payload = {
                    id: docRef.id,
                    protocol: protocol
                }
                commit('addProtocol', payload)
            })

            .catch(err => {
                console.error('ADD RULE ERROR: ', err)
            })

    },
    dbUpdateProtocol({ commit }, payload) {
        firebaseDb.collection('protocols').doc(payload.id).update({            
            ...payload.protocol 
        }).then(() => {
            commit('updateProtocol', payload)
        }).catch(err => {
            console.error('UPDATE RULE ERROR: ', err)
        })
    },  
    dbDeleteProtocol({ commit }, protocolId) {
        firebaseDb.collection('protocols').doc(protocolId)
            .delete()
            .then(() => {
                commit('deleteProtocol', protocolId)
            })
    }  ,

    dbLoadProtocols: ({ commit }, state) => {
        //console.log('dbLoadProtocols ENTRY')
        state.protocols = []
        var t1 = firebaseDb.collection('protocols')
                    .where("createdBy", "==", firebaseAuth.currentUser.uid)                    
        
        t1.onSnapshot((snapshot) => {
            snapshot.forEach(function (doc) {
                let newProtocol = {
                    id: doc.id,
                    protocol: doc.data()
                }
                commit('addProtocol', newProtocol)
            })
        }) 
        // commit('setListener', { switch: 'user', unsubscribe: unsub})

        // Get all protocols for every master this person has an active service with.
        firebaseDb.collection('connections').where("slaveUser", "==", firebaseAuth.currentUser.uid)
        .get()
        .then(function (snapshot) {                
            snapshot.forEach(function(doc) {                
                firebaseDb.collection('protocols').where("createdBy", "==", doc.data().masterUser)
                .get()
                .then(function (snap2) {                           
                    snap2.forEach(function(prot) {                         
                        let newProt = {
                            id: prot.id,
                            protocol: prot.data()
                        }                        
                        commit('addProtocol', newProt)            
                    })
                })
            })
        })

        // var t2 = firebaseDb.collection('protocols')
        //             .where("assignedTo", "==", firebaseAuth.currentUser.uid)                    
        
        // t2.onSnapshot((snapshot) => {
        //     snapshot.forEach(function (doc) {
        //         let newProtocol = {
        //             id: doc.id,
        //             Protocol: doc.data()
        //         }
        //         commit('addProtocol', newProtocol)
        //     })
        // }) 
        // // commit('setListener', { switch: 'conn', unsubscribe: unsub})

        commit('setProtocolsDownloaded', true)
        // console.log(state.protocols)
    } 
}

const getters = {   
    protocolsList() {        
        return state.protocols
    }, 
    getWorkProtocol() {
        let protocol = state.workProtocol
        return protocol
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
