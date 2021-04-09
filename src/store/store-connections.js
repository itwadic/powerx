import Vue from 'vue'
import { firebaseDb, firebaseAuth } from "src/services/firebase"
import { Notify } from 'quasar'

const state = {
    connections: {},
    profileImages: {}
}

const debug = false

const mutations = {
    addConnection(state, payload) {        
        if(debug) {console.log('STORE-CONNECTIONS.MUTATION.addConnection()')}
        Vue.set(state.connections, payload.id, payload.connection)        
    },
    updateConnection(state, payload) {
        if(debug) {console.log('STORE-CONNECTIONS.MUTATION.updateConnection()')  }
        Object.assign(state.connections[payload.id], payload.connection)
    },
    deleteConnection(state, id) {
        Vue.delete(state.connections, id)
        Notify.create({
            message: 'Connection deleted.',
            color: 'info',
            position: 'top'
        })        
    },
    clearConnections(state) {
        state.connections = {}
        
    },
    addProfileImage(state, payload) {        
        Vue.set(state.profileImages, payload.uid, payload.path)
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
        if(state.unsubscribeConn) { state.unsubscribeConn() }
    }
}

const actions = {
    addConnection({ dispatch }, payload) {
        if(debug) {console.log('STORE-CONNECTIONS.ACTION.addConnection()')}
        dispatch('dbAddConnection', payload)
    },
    updateConnection({ dispatch }, payload) { 
        if(debug) {console.log('STORE-CONNECTIONS.ACTION.updateConnection()')}
        dispatch('dbUpdateConnection', payload)
    },
    deleteConnection({ dispatch }, id) {        
        dispatch('dbDeleteConnection', id)
    },

    dbLoadConnections: ({ commit, dispatch }, state) => {   
        if(debug) {console.log('STORE-CONNECTIONS.ACTION.dbLoadConnections()')}
        commit('connections/clearConnections', null, { root: true })
        let _this = this

        var c1 = firebaseDb.collection("connections")
            .where("masterUser", "==", firebaseAuth.currentUser.uid)
            .orderBy("rank")
        
        var unsub = c1.onSnapshot((snapshot) => {
            snapshot.forEach(function (doc) {    
                let newConn = {
                    id: doc.id,
                    connection: doc.data()
                }
                newConn.connection.userIsMaster = true
                newConn.connection.userIsSlave = false 
                dispatch('getProfileImageByEmail', newConn.connection.inviteEmail)
                commit('addConnection', newConn)
            }) 
        })
        commit('setListener', { switch: 'user', unsubscribe: unsub})


        var c2 = firebaseDb.collection("connections")
            .where("slaveUser", "==", firebaseAuth.currentUser.uid)
            .orderBy("rank")

        unsub = c2.onSnapshot((snapshot) => {            
            snapshot.forEach(function (doc) {    
                let newConn = {
                    id: doc.id,
                    connection: doc.data()
                }      
                newConn.connection.userIsMaster = true
                newConn.connection.userIsSlave = false
                dispatch('getProfileImageByUserId', newConn.connection.masterUser)
                commit('addConnection', newConn)
            }) 
        })
        commit('setListener', { switch: 'conn', unsubscribe: unsub})
    },
    dbAddConnection({ commit }, payload) {      
        if(debug) {console.log('STORE-CONNECTIONS.ACTION.dbAddConnection()') } 
        firebaseDb.collection('connections').add({
            ...payload.connection
        })
            .then(function (docRef) {
                payload.id = docRef.id
                commit('addConnection', payload)
            })

            .catch(err => {
                console.error('ADD CONNECTION ERROR: ', err)
            })

    },
    dbUpdateConnection({ commit }, payload) {    
        if(debug) {console.log('STORE-CONNECTIONS.ACTION.dbUpdateConnection()')}
        firebaseDb.collection('connections').doc(payload.id).update({
            ...payload.connection 
        }).then(() => {
            commit('updateConnection', payload)
        }).catch(err => {
            console.error('UPDATE CONNECTION ERROR: ', err)
        })
    },  
    dbDeleteConnection({ commit }, id) {
        if(debug) {console.log('DELETING ', id)}
        firebaseDb.collection('connections').doc(id)
            .delete()
            .then(() => {
                commit('deleteConnection', id)
            })
    },
    getProfileImageByEmail({ commit }, email) {        
        firebaseDb.collection('settings').where("email", "==", email)
        .get()
        .then(function (snapshot) {                
            snapshot.forEach(function(doc) { 
                let payload = {
                    uid: doc.data().user,
                    path: doc.data().profileImageUrl
                }                
                commit('addProfileImage', payload)                
            })
        })
    },
    getProfileImageByUserId({ commit }, uid) {        
        firebaseDb.collection('settings').where("user", "==", uid)
        .get()
        .then(function (snapshot) {                
            snapshot.forEach(function(doc) { 
                let payload = {
                    uid: doc.data().user,
                    path: doc.data().profileImageUrl
                }                
                commit('addProfileImage', payload)                
            })
        })
    } 
}

const getters = {
    connections: (state) => {
        return state.connections
    },
    profileImageForUid: (state) => (uid) => {        
        
        let search = "https://www.powerx.app/bdsm-emblem.png"
        
        Object.keys(state.profileImages).forEach(function(key) {
            
            if (key === uid) { 
                search = state.profileImages[key]
            }
            
        })            

        return search
    },
    connectionsActiveAndPending: (state) => {        
        let conns = {}
        let keysOrdered = Object.keys(state.connections)
        keysOrdered.sort((a,b) => {            
            return state.connections[a].rank < state.connections[b].rank ? -1 : 1 
        })

		keysOrdered.forEach(function(key) {
            let conn = state.connections[key]            
			if (conn.responseResult != "REVOKED") {                
                conns[key] = conn                 
			}
        })
        
        return conns
    },
    connectionsActive: (state, getters) => {
        let conns = getters.connectionsActiveAndPending
        let list = []

        /*
            Cycle through all connections in State, and build a list of active
            object with all relevant information. Data is "flipped" from To to From 
            if the current User is the slave user in the connection
        */
        Object.keys(conns).forEach(function(key) {
            let conn = state.connections[key]         
			if (conn.masterUser == firebaseAuth.currentUser.uid && conn.responseResult == 'ACCEPTED') {
                conns[key] = conn
                let assignable = {
                    id: conn.masterUser + conn.slaveUser,
                    byUid: conn.masterUser,
                    byName: conn.masterName,
                    byImage: state.profileImages[conn.masterUser],
                    toUid: conn.slaveUser,
                    toName: conn.slaveName,
                    toImage: state.profileImages[conn.slaveUser]
                }
                list.push(assignable)

            } else if ( conn.slaveUser == firebaseAuth.currentUser.uid && conn.allowAssign && conn.responseResult == 'ACCEPTED') {
                conns[key] = conn
                let assignable = {
                    id: conn.slaveUser + conn.masterUser,
                    byUid: conn.slaveUser,
                    byName: conn.slaveName,
                    byImage: state.profileImages[conn.slaveUser],
                    toUid: conn.masterUser,
                    toName: conn.masterName,
                    toImage: state.profileImages[conn.masterUser]
                }
                list.push(assignable)
            }
        })         
        return list
    },
    connectionForUid: ({}, getters) => (uid) => {
        let conns = getters.connectionsActiveAndPending
        let found = ''
        
        Object.keys(conns).forEach(function(key) {
            let conn = conns[key]      
            if(conn.slaveUser == uid || conn.masterUser == uid) {
                found = conn                
            }
        })

        return found
    },
    displayNameForUid: ({}, getters) => (uid) => {
        let connection = getters.connectionForUid(uid)
        let name = "none"
        //debugger             
        name = uid == connection.masterUser ? connection.masterName : connection.slaveName
        return name
    },
    assignableForUid: ({}, getters) => (uid) => { 
        let conns = getters.connectionsActiveAndPending
        let result = ''
 
        Object.keys(conns).forEach(function(key) {
            let conn = state.connections[key]

            if(conn.masterUser == firebaseAuth.currentUser.uid) {
                if(conn.slaveUser == uid) {                    
                    result = conn
                }
            } else if (conn.slaveUser == firebaseAuth.currentUser.uid) {
                if(conn.masterUser == uid) {                    
                    result = conn
                }
            }
        })    

        // if(result) {
        //     console.log("ASSIGNABLE-FOR-UID-SUCCESS", result) 
        // } else {
        //     console.log("ASSIGNABLE-FOR-UID-FAILED")
        // }
        return result
    },
    connectionCount: (state) => {
        return Object.keys(state.connections).length
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}