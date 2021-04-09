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
                    v-model="workProtocol.title"
                    :protocols="[val => !!val || 'Field is required']"
                    autofocus
                    label="Protocol name"
                    ref="title"
                />  

                <q-editor 
                    ref="text" 
                    v-model="workProtocol.text" 
                    value=""
                    min-height="5rem" 
                    :toolbar="[
                        ['left', 'center', 'right', 'justify'],
                        ['bold', 'italic', 'strike', 'underline'],
                        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
                        ['hr', 'fullscreen'],                        
                        [                        
                        {
                            label: $q.lang.editor.fontSize,
                            icon: $q.iconSet.editor.fontSize,
                            fixedLabel: true,
                            fixedIcon: true,
                            list: 'no-icons',
                            options: [
                            'size-1',
                            'size-2',
                            'size-3',
                            'size-4',
                            'size-5',
                            'size-6',
                            'size-7'
                            ]
                        },
                        {
                            label: $q.lang.editor.defaultFont,
                            icon: $q.iconSet.editor.font,
                            fixedIcon: true,
                            list: 'no-icons',
                            options: [
                            'default_font',
                            'arial',
                            'arial_black',
                            'comic_sans',
                            'courier_new',
                            'impact',
                            'lucida_grande',
                            'times_new_roman',
                            'verdana'
                            ]
                        },
                        'removeFormat'
                        ],
                        ['undo', 'redo'] 
                    ]"
                    :fonts="{
                        arial: 'Arial',
                        arial_black: 'Arial Black',
                        comic_sans: 'Comic Sans MS',
                        courier_new: 'Courier New',
                        impact: 'Impact',
                        lucida_grande: 'Lucida Grande',
                        times_new_roman: 'Times New Roman',
                        verdana: 'Verdana'
                    }"
 
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
                workProtocol: {
                    text: '',
                    title: '',
                    createdBy: '',
                    createdDate: ''
                }
            }
        },
        computed: {
            ...mapState("protocols", ["mode"]),
            ...mapGetters("protocols", ["getWorkProtocol"]),
            ...mapGetters('auth', ['currentUserId']), 
            pageTitle() {                
                if(this.mode == "add") {                    
                    return "Add New Protocol"
                } else {
                    return "Edit Protocol: " + this.workProtocol.title
                }
            }     
        },
        methods: {
            ...mapActions("protocols", ["addProtocol", "updateProtocol"]),
            
            submitForm() {
                //console.log('SUBMITFORM() ENTRY')
                this.$refs.title.validate();
                if (!this.$refs.title.hasError && !this.$refs.text.hasError) {
                    //console.log('NO ERRORS, SO...')
                    this.submitProtocol();
                }
            },
            submitProtocol() {
                //console.log('SUBMITRITUAL() ENTRY')
                if(this.mode == "add") {     
                    //console.log('SUBMITRITUAL() - ADD RITUAL')
                    let theDate = new Date()
                    this.workProtocol.createdBy = this.currentUserId
                    this.workProtocol.createdDate = date.formatDate(theDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ')     
                    //console.log(this.workProtocol)
                    this.addProtocol(this.workProtocol)
                } else {
                    // console.log('SUBMITRITUAL() - UPDATE RITUAL')
                    // console.log(this.workProtocol)
                    // console.log('ID: ', this.id)
                    this.updateProtocol({ id: this.id, protocol: this.workProtocol })
                }
                this.$router.push( 'rules', '', '')
            },
        },
        mounted() {            
            this.workProtocol = Object.assign({}, this.getWorkProtocol.protocol)
        },
        created() {    
            // console.log('CREATED() ENTRY')         
            this.$root.$on('eventModifyProtocol', (event) => {                 
                if(this.mode === 'edit') {
                    // console.log('CREATED() EDIT')
                    this.workProtocol = Object.assign({}, event.protocol)
                    this.id = event.id
                    // console.log(this.workProtocol)
                } else { 
                    // console.log('CREATED() ADD')
                    this.workProtocol = {
                        text: '',
                        title: '',
                        createdBy: '',
                        createdDate: ''
                    }
                    this.id = ''
                    // console.log(this.workProtocol)
                }
            })
        },
        beforeDestroy() {
            this.$root.$off('eventEditProtocol', '')
        }
    }
</script>

<style lang="scss" scoped>

</style>