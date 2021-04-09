import Vue from 'vue'
import { firebaseAuth, firebaseDb } from 'src/services/firebase'

const state = {   
    settings: {
        title: '',
        userName: '', 
        email: '',       
        use24HourTime: false,
        profileImageUrl: ''        
    },
    editMode: false
}

const mutations = {
    setTitle(state, value) {
        state.settings.title = value
    },
    setUserName(state, value) {
        state.settings.userName = value
    },
    setEmail(state, value) {
        state.settings.email = value
    },
    setUse24HourTime(state, value) {
        state.settings.use24HourTime = value
    },
    setProfileImageUrl(state, value) {        
        state.settings.profileImageUrl = value
    },
    setSettings(state, value) {         
        state.settings.title = value.title
        state.settings.userName = value.userName
        state.settings.email = value.email
        state.settings.use24HourTime = value.use24HourTime
        state.settings.profileImageUrl = value.profileImageUrl
        state.editMode = false       
    },
    setEditMode(state, value) {
        state.editMode = value
    },
    clearSettings(state) {        
        state.settings.title = ''
        state.settings.userName = ''
        state.settings.email = ''
        state.settings.profileImageUrl = ''
        state.settings.use24HourTime = false
    },
}

const actions = {
    setTitle({ commit }, value) {
        commit('setTitle', value)
    },
    setUserName({ commit }, value) {
        commit('setUserName', value)
    },    
    setEmail({ commit }, value) {
        commit('setEmail', value)
    },    
    setProfileImageUrl({ commit }, value) {        
        commit('setProfileImageUrl', value)        
    },
    setUse24HourTime({ commit, dispatch }, value) {
        commit('setUse24HourTime', value)
        //dispatch('dbUpdateProfile') TODO: write changes to the profile table
    },
    setEditMode({commit}, value) {
        commit('setEditMode', value)
    },
    clearSettings({commit}) {
        commit('clearSettings')
    },
    

    
    initSettings({ commit }, userId) {        
        //Write a fresh settings profile to the DB (only happens upon new user creation)
        let newSettings = {
            user: userId,
            title: '',
            email: firebaseAuth.currentUser.email,
            userName: '',
            profileImageUrl: '',
            use24HourTime: false
        }

        firebaseDb.collection('settings').add(
            newSettings     
        )
            .catch(err => {
                console.error('ADD SETTINGS ERROR: ', err)
            })

    },
    saveSettings({}, payload) {
        firebaseDb.collection('settings').where("user", "==", firebaseAuth.currentUser.uid)
            .get()
            .then(function (snapshot) {
                snapshot.forEach(function (doc) {
                    firebaseDb.collection('settings').doc(doc.id).update({
                        title: payload.title,
                        userName: payload.userName,                        
                        profileImageUrl: payload.profileImageUrl,
                        use24HourTime: payload.use24HourTime
                    })
                })
            })
        state.settings.editMode = false

    },
    loadSettings({commit}) {        

        firebaseDb.collection('settings').where("user", "==", firebaseAuth.currentUser.uid)
            .get()
            .then(function (snapshot) {

                snapshot.forEach(function (doc) {                    
                    let profile = {
                        user: firebaseAuth.currentUser.uid,
                        title: doc.data().title,
                        email: doc.data().email,
                        userName: doc.data().userName,
                        use24HourTime: doc.data().use24HourTime,
                        profileImageUrl: doc.data().profileImageUrl
                    }
                    commit('setSettings', profile)
                })
            })
    }
}

const getters = {
    settings: state => {
        return state.settings
    },
    displayName: state => {     
        
        if (state.settings.title != "" && state.settings.username != "") {            
            return state.settings.title + ' ' + state.settings.userName 
        }
        
        if (state.settings.userName != "") { 
            return state.settings.userName 
        }

        return "(no name)"
        
    },
    getEditMode: state => {
        return state.editMode
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
