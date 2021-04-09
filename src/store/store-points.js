import Vue from 'vue'

const state = {   
    points
}

const mutations = {
    addPoints(state, payload) {
        Vue.set(state.points, payload.id, payload.points)
    },
    updatePoints(state, payload) {
        Object.assign(state.points[payload.id], payload.points)
    },
}

const actions = {

}

const getters = {

}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
