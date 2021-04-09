import Vue from 'vue'
import Vuex from 'vuex'
import tasks from './store-tasks.js'
import rules from './store-rules.js'
import rituals from './store-rituals.js'
import protocols from './store-protocols.js'
import auth from './store-auth.js'
import logging from './store-log.js'
import settings from './store-settings.js'
import connections from './store-connections.js'
import 'vue-croppa/dist/vue-croppa.css'
import Croppa from 'vue-croppa'

Vue.use(Vuex)
Vue.use(Croppa)

export const Store = new Vuex.Store({
    modules: {
      tasks,
      rules,
      rituals,
      protocols,
      auth,
      logging,
      settings,
      connections
    },
    
    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
})
export default Store