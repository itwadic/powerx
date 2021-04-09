<template>
    <q-page>
        <div class="full-width full-height column">
            <template v-if="rulesDownloaded">
                <div class="row q-pa-xs shadow-1">
                    <div class="col-auto q-mr-xs">                 
                        <!-- <q-select       
                            v-model="showRulesFor"                             
                            outlined 
                            emit-value  
                            :options = "showOptions"
                            label="Show" /> -->
                        <q-btn class="q-mr-sm" @click="showRulesFor='Everything'" label="All" flat />
                        <q-btn class="q-mr-sm" @click="showRulesFor='Rules'" label="Rules" flat />
                        <q-btn class="q-mr-sm" @click="showRulesFor='Rituals'" label="Rituals" flat />
                        <q-btn class="q-mr-sm" @click="showRulesFor='Protocols'" label="Protocols" flat />
                        
                    </div>             
                </div>

                <px-panel class="q-mt-sm" title="Rules" v-if="showRulesFor == 'Rules' || showRulesFor == 'Everything'" v-on:add="addNew('rule')"
                    description="Rules are specific expectations of behavior that are applicable at all times.">
                    <q-item v-if="!Object.keys(rulesList).length">
                        <q-item-section>
                            <q-item-label class="text-subtitle text-grey-6">Nothing to see here...</q-item-label>
                            <q-item-label class="text-caption text-grey-6">Click the + above to add your first rule.</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-list
                        v-if="Object.keys(rulesList).length"
                        separator
                    >
                        <q-item 
                            clickable 
                            v-ripple
                            v-for="(rule, key) in rulesList" :key="key" :rule="rule" :id="key"
                        >
                            <q-item-section>
                                <q-item-label class="text-h2">{{ rule.title }}</q-item-label>
                                <q-item-label class="text-body1 text-weight-light" v-html="rule.text"></q-item-label>
                                <q-item-label class="q-pt-xs text-primary-light" caption>Created by {{ createdName(rule) }} on {{ createdDateTime(rule) }}</q-item-label>
                            </q-item-section> 
                            <q-item-section side top v-if="rule.createdBy == currentUserId">
                                <q-btn                        
                                    @click.stop="editRule({rule: rule, id: key})"
                                    flat round dense
                                    size="sm"
                                    color="primary"
                                    icon="edit"
                                />
                                <q-btn
                                    v-if="rule.createdBy == currentUserId"
                                    @click.stop="promptToDelete({type: 'rule', id: key, rule: rule})"                            
                                    flat
                                    round                            
                                    size="sm"
                                    color="red"
                                    icon="delete"
                                />
                            </q-item-section>
                        </q-item> 
                        
                    </q-list>
                </px-panel>  

                <px-panel class="q-mt-sm" title="Rituals" v-if="showRulesFor == 'Rituals' || showRulesFor == 'Everything'" v-on:add="addNew('ritual')"
                    description="Rituals are a series of planned actions or behaviors performed according to a prescribed order that are executed with solemn ceremony.">
                    <q-item v-if="!Object.keys(ritualsList).length">
                        <q-item-section>
                            <q-item-label class="text-subtitle text-grey-6">Nothing to see here...</q-item-label>
                            <q-item-label class="text-caption text-grey-6">Click the + above to add your first ritual.</q-item-label>
                        </q-item-section>                        
                    </q-item>

                    <q-list
                        v-if="Object.keys(ritualsList).length"
                        separator
                    >    
                        <q-item 
                            clickable 
                            v-ripple
                            v-for="(ritual, key) in ritualsList" :key="key" :ritual="ritual" :id="key"
                        >
                            <q-item-section>
                                <q-item-label class="text-h2">{{ ritual.title }}</q-item-label>
                                <q-item-label class="text-body1 text-weight-light" v-html="ritual.text"></q-item-label>
                                <q-item-label class="q-pt-xs text-primary-light" caption>Created by {{ createdName(ritual) }} on {{ createdDateTime(ritual) }}</q-item-label>
                            </q-item-section> 
                            <q-item-section side top v-if="ritual.createdBy == currentUserId">
                                <q-btn                        
                                    @click.stop="editRitual({ritual: ritual, id: key})"
                                    flat round dense
                                    size="sm"
                                    color="primary"
                                    icon="edit"
                                />
                                <q-btn
                                    v-if="ritual.createdBy == currentUserId"
                                    @click.stop="promptToDelete({type: 'ritual', id: key, ritual: ritual})"                            
                                    flat
                                    round                            
                                    size="sm"
                                    color="red"
                                    icon="delete"
                                />
                            </q-item-section>
                        </q-item> 
                        
                    </q-list> 
                </px-panel> 

                <px-panel class="q-mt-sm" title="Protocols" v-if="showRulesFor == 'Protocols' || showRulesFor == 'Everything'" v-on:add="addNew('protocol')"
                    description="Protocols are specific behaviors that are expected in specific situations">
                    <q-item v-if="!Object.keys(protocolsList).length">
                        <q-item-section>
                            <q-item-label class="text-subtitle text-grey-6">Nothing to see here...</q-item-label>
                            <q-item-label class="text-caption text-grey-6">Click the + above to add your first protocol.</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-list
                        v-if="Object.keys(protocolsList).length"
                        separator
                    >    
                        <q-item 
                            clickable 
                            v-ripple
                            v-for="(protocol, key) in protocolsList" :key="key" :protocol="protocol" :id="key"
                        >
                            <q-item-section>
                                <q-item-label class="text-h2">{{ protocol.title }}</q-item-label>
                                <q-item-label class="text-body1 text-weight-light" v-html="protocol.text"></q-item-label>
                                <q-item-label class="q-pt-xs text-primary-light" caption>Created by {{ createdName(protocol) }} on {{ createdDateTime(protocol) }}</q-item-label>
                            </q-item-section> 
                            <q-item-section side top v-if="protocol.createdBy == currentUserId">
                                <q-btn                        
                                    @click.stop="editProtocol({protocol: protocol, id: key})"
                                    flat round dense
                                    size="sm"
                                    color="primary"
                                    icon="edit"
                                />
                                <q-btn
                                    v-if="protocol.createdBy == currentUserId"
                                    @click.stop="promptToDelete({type: 'protocol', id: key, protocol: protocol})"                            
                                    flat
                                    round                            
                                    size="sm"
                                    color="red"
                                    icon="delete"
                                />
                            </q-item-section>
                        </q-item> 
                        
                    </q-list>
                </px-panel> 
            </template>
        </div>

        <!-- <q-page-sticky position="bottom" :offset="[18, 18]">
              <q-btn fab @click="showAddMenu=!showAddMenu" icon="add" color="primary" />
        </q-page-sticky> -->

        <!-- <q-page-sticky position="bottom" :offset="[18, 88]" v-if="showAddMenu">
            <q-btn @click="showAddRitual=true" label="RITUAL" size="md" color="primary" class="q-mr-sm q-pa-xs" />
            <q-btn @click="addNew('rule')" label="RULE" size="md" color="primary" class="q-pa-xs"/>
            <q-btn @click="showAddProtocol=true" label="PROTOCOL" size="md" color="primary" class="q-ml-sm q-pa-xs"/>
        </q-page-sticky> -->
<!-- 
        <q-dialog v-model="showAddRule">
            <add-edit-rule mode="add" @close="showAddRule = false" />
        </q-dialog> -->
    </q-page>
</template>

<script>    
    import { mapState, mapGetters, mapActions } from "vuex"
    import { date } from 'quasar'    

    export default {        
        data() {
            return {                
                showRulesFor: ''
            }
        },        
        components: {
            "px-panel": require("components/Shared/Panel.vue").default,
            "add-edit-rule": require("components/RRP/AddEditRule.vue").default,
        },
        computed: {
            ...mapGetters('settings', ['settings', 'displayName']),   
            ...mapGetters('auth', ['currentUserId']),
            ...mapGetters("rules", ["rulesList"]),
            ...mapGetters("rituals", ["ritualsList"]),
            ...mapGetters("protocols", ["protocolsList"]),
            ...mapState("rules", ["rulesDownloaded"]),      
        },
        methods: {
            ...mapActions("rules", ["setAddEditRuleMode", "setAddEditRule", 'deleteRule']),
            ...mapActions("rituals", ["setAddEditRitualMode", "setAddEditRitual", 'deleteRitual']),
            ...mapActions("protocols", ["setAddEditProtocolMode", "setAddEditProtocol", 'deleteProtocol']),
            createdName(rule) {                
                if ( rule.createdBy == this.currentUserId ) {
                    return this.displayName
                }
            },
            createdDateTime(rule) {
                return date.formatDate(rule.createdDate, "MMMM Do, YYYY")
            },
            addNew(type)
            {   
                if ( type == 'rule' ) {
                    this.setAddEditRuleMode('add')
                    this.$router.push( 'rule-modify', '', '')
                    this.$root.$emit('eventModifyRule', null)
                } else if ( type == 'ritual' ) {
                    this.setAddEditRitualMode('add')
                    this.$router.push( 'ritual-modify', '', '')
                    this.$root.$emit('eventModifyRitual', null)
                } else if ( type == 'protocol' ) {
                    this.setAddEditProtocolMode('add')
                    this.$router.push( 'protocol-modify', '', '')
                    this.$root.$emit('eventModifyProtocol', null)
                } 
            },
            editRule(payload) {   
                this.setAddEditRuleMode('edit') 
                this.setAddEditRule(payload)
                this.$router.push( 'rule-modify', '', '')
                this.$root.$emit('eventModifyRule', payload)
            },
            editRitual(payload) {
                this.setAddEditRitualMode('edit') 
                this.setAddEditRitual(payload)
                this.$router.push( 'ritual-modify', '', '')
                this.$root.$emit('eventModifyRitual', payload)
            },
            editProtocol(payload) {
                this.setAddEditProtocolMode('edit') 
                this.setAddEditProtocol(payload)
                this.$router.push( 'protocol-modify', '', '')
                this.$root.$emit('eventModifyProtocol', payload)
            },
            promptToDelete(args) {
                let title = ''
                if(args.type === 'rule') {
                    title = args.rule.title
                } else if(args.type === 'ritual') {
                    title = args.ritual.title
                } else if(args.type === 'protocol') {
                    title = args.protocol.title
                }

                this.$q
                    .dialog({
                        title: "Confirm",
                        message: "Delete this " + args.type + " (" + title + ")?",
                        ok: {
                            push: true
                        },
                        cancel: {
                            color: "negative"
                        },
                        persistent: true
                    })
                    .onOk(() => {
                        if(args.type === 'rule') {
                            this.deleteRule(args.id);
                        } else if (args.type === 'ritual') {
                            this.deleteRitual(args.id);
                        } else if (args.type === 'protocol') {
                            this.deleteProtocol(args.id);
                        }                        
                    });
            },              
        },
        mounted() {
            this.showRulesFor = this.$q.localStorage.getItem('showRuleKey')
            this.showRulesFor = this.showRulesFor || 'Everything'
            
        }
    }
</script>

