<template>
    <div>
         <q-card-section class="row">
            <div class="col text-h6">{{ pageTitle }}</div>            
            <div class="col-auto">
                <q-btn @click="$router.push('rules')" flat round dense color="primary" icon="close" class="justify-end" />
            </div>
        </q-card-section>

        <form @submit.prevent="submitForm">
            <q-card-section class="q-pt-none q-pb-none">
            <!-- -------- TITLE -------- -->
                <q-input                
                    outlined
                    v-model="workRule.title"
                    :rules="[val => !!val || 'Field is required']"
                    autofocus
                    label="Rule name"
                    ref="title"
                />  

                <q-editor ref="text" v-model="workRule.text" min-height="5rem" />
 
            </q-card-section>

            <q-card-actions align="right">
                <q-btn @click="$router.push('rules')" label="CANCEL" color="green" class="q-pa-md" />
                <q-btn label="SAVE" color="primary" type="submit" class="q-pa-md" />
            </q-card-actions>
        </form> 
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex"
import { date } from 'quasar'

    export default {        
        data() {
            return { 
                workRule: {
                    text: '',
                    title: '',
                    createdBy: '',
                    createdDate: ''
                }
            }
        },
        computed: {
            ...mapState("rules", ["mode"]),
            ...mapGetters("rules", ["getWorkRule"]),
            ...mapGetters('auth', ['currentUserId']), 
            pageTitle() {                
                if(this.mode == "add") {                    
                    return "Add New Rule"
                } else {
                    return "Edit Rule: " + this.workRule.title
                }
            }     
        },
        methods: {
            ...mapActions("rules", ["addRule", "updateRule"]),
            
            submitForm() {
                // console.log('SUBMITFORM() ENTRY')
                this.$refs.title.validate();
                if (!this.$refs.title.hasError && !this.$refs.text.hasError) {
                    // console.log('NO ERRORS, SO...')
                    this.submitRule();
                }
            },
            submitRule() {
                // console.log('SUBMITRULE() ENTRY')
                if(this.mode == "add") {     
                    // console.log('SUBMITRULE() - ADD RULE')
                    let theDate = new Date()
                    this.workRule.createdBy = this.currentUserId
                    this.workRule.createdDate = date.formatDate(theDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ')     
                    // console.log(this.workRule)
                    this.addRule(this.workRule)
                } else {
                    // console.log('SUBMITRULE() - UPDATE RULE')
                    // console.log(this.workRule)
                    // console.log('ID: ', this.id)
                    this.updateRule({ id: this.id, rule: this.workRule })
                }
                this.$router.push( 'rules', '', '')
            },
        },
        mounted() {            
            this.workRule = Object.assign({}, this.getWorkRule.rule)
        },
        created() {    
            // console.log('CREATED() ENTRY')         
            this.$root.$on('eventModifyRule', (event) => {                 
                if(this.mode === 'edit') {
                    // console.log('CREATED() EDIT')
                    this.workRule = Object.assign({}, event.rule)
                    this.id = event.id
                    // console.log(this.workRule)
                } else { 
                    // console.log('CREATED() ADD')
                    this.workRule = {
                        text: '',
                        title: '',
                        createdBy: '',
                        createdDate: ''
                    }
                    this.id = ''
                    // console.log(this.workRule)
                }
            })
        },
        beforeDestroy() {
            this.$root.$off('eventEditRule', '')
        }
    }
</script>

<style lang="scss" scoped>

</style>