import Vue from 'vue'
import { firebaseDb, firebaseAuth } from 'src/services/firebase'
import { Notify } from 'quasar'

const state = {   
    rulesDownloaded: false,
    mode: 'add',    
    workRule: '',
    rules: {}
}

const mutations = {   
    addRule(state, payload) {        
        Vue.set(state.rules, payload.id, payload.rule)
    },
    updateRule(state, payload) {
        Object.assign(state.rules[payload.id], payload.rule)
    }, 
    deleteRule(state, id) {
        Vue.delete(state.rules, id)
        Notify.create({
            message: 'Rule deleted.',
            color: 'info',
            position: 'top'
        })
    },
    clearRules(state) {
        state.rules = {}
    }, 
    setRulesDownloaded(state, value) {
        state.rulesDownloaded = value
    },
    setAddEditRuleMode(state, mode) {        
        state.mode = mode 
        if(mode === 'add') {
            state.workRule = ""
        }
    },
    setAddEditRule(state, payload) {   
        state.workRule = payload 
    }
}

const actions = {   
    addRule({ dispatch }, rule) {             
        dispatch('dbAddRule', rule)
    },
    updateRule({ dispatch }, payload) {
        dispatch('dbUpdateRule', payload)
    }, 
    deleteRule({ dispatch }, id) {
        dispatch('dbDeleteRule', id)
    },  
    setAddEditRuleMode({commit}, mode) {        
        commit('setAddEditRuleMode', mode)
    },
    setAddEditRule({commit}, payload) {        
        commit('setAddEditRule', payload)
    },
    dbAddRule({ commit }, rule) {        
        firebaseDb.collection('rules').add({
            ...rule           
        })
            .then(function (docRef) {
                let payload = {
                    id: docRef.id,
                    rule: rule
                }
                commit('addRule', payload)
            })

            .catch(err => {
                console.error('ADD RULE ERROR: ', err)
            })

    },
    dbUpdateRule({ commit }, payload) {
        firebaseDb.collection('rules').doc(payload.id).update({            
            ...payload.rule 
        }).then(() => {
            commit('updateRule', payload)
        }).catch(err => {
            console.error('UPDATE RULE ERROR: ', err)
        })
    },  
    dbDeleteRule({ commit }, ruleId) {
        firebaseDb.collection('rules').doc(ruleId)
            .delete()
            .then(() => {
                commit('deleteRule', ruleId)
            })
    }  ,

    dbLoadRules: ({ commit }, state) => {
        // console.log('dbLoadRules ENTRY')
        state.rules = []
        var t1 = firebaseDb.collection('rules')
                    .where("createdBy", "==", firebaseAuth.currentUser.uid)                    
        
        t1.onSnapshot((snapshot) => {
            snapshot.forEach(function (doc) {
                let newRule = {
                    id: doc.id,
                    rule: doc.data()
                }
                commit('addRule', newRule)
            })
        }) 
        // commit('setListener', { switch: 'user', unsubscribe: unsub})
     
        firebaseDb.collection('connections').where("slaveUser", "==", firebaseAuth.currentUser.uid)
        .get()
        .then(function (snapshot) {                
            snapshot.forEach(function(doc) {                 
                firebaseDb.collection('rules').where("createdBy", "==", doc.data().masterUser)
                .get()
                .then(function (snap2) {                
                    snap2.forEach(function(rule) {                         
                        let newRule = {
                            id: rule.id,
                            rule: rule.data()
                        }
                        commit('addRule', newRule)            
                    })
                })
            })
        })


        // var t2 = firebaseDb.collection('rules')
        //             .where("createdBy", "==", firebaseAuth.currentUser.uid)                    
        
        // t2.onSnapshot((snapshot) => {
        //     snapshot.forEach(function (doc) {
        //         let newRule = {
        //             id: doc.id,
        //             Rule: doc.data()
        //         }
        //         commit('addRule', newRule)
        //     })
        // }) 
        // commit('setListener', { switch: 'conn', unsubscribe: unsub})

        commit('setRulesDownloaded', true)
    } 
}

const getters = {   
    rulesList() {        
        return state.rules
    }, 
    getWorkRule() {
        let rule = state.workRule
        return rule
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
