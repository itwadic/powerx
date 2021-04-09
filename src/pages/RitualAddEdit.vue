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
                    v-model="workRitual.title"
                    :rituals="[val => !!val || 'Field is required']"
                    autofocus
                    label="Ritual name"
                    ref="title"
                />  

                <q-editor 
                    ref="text" 
                    v-model="workRitual.text" 
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
                />
 
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
                workRitual: {
                    text: '',
                    title: '',
                    createdBy: '',
                    createdDate: ''
                }
            }
        },
        computed: {
            ...mapState("rituals", ["mode"]),
            ...mapGetters("rituals", ["getWorkRitual"]),
            ...mapGetters('auth', ['currentUserId']), 
            pageTitle() {                
                if(this.mode == "add") {                    
                    return "Add New Ritual"
                } else {
                    return "Edit Ritual: " + this.workRitual.title
                }
            }     
        },
        methods: {
            ...mapActions("rituals", ["addRitual", "updateRitual"]),
            
            submitForm() {
                // console.log('SUBMITFORM() ENTRY')
                this.$refs.title.validate();
                if (!this.$refs.title.hasError && !this.$refs.text.hasError) {
                    // console.log('NO ERRORS, SO...')
                    this.submitRitual();
                }
            },
            submitRitual() {
                // console.log('SUBMITRITUAL() ENTRY')
                if(this.mode == "add") {     
                    // console.log('SUBMITRITUAL() - ADD RITUAL')
                    let theDate = new Date()
                    this.workRitual.createdBy = this.currentUserId
                    this.workRitual.createdDate = date.formatDate(theDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ')     
                    // console.log(this.workRitual)
                    this.addRitual(this.workRitual)
                } else {
                    // console.log('SUBMITRITUAL() - UPDATE RITUAL')
                    // console.log(this.workRitual)
                    // console.log('ID: ', this.id)
                    this.updateRitual({ id: this.id, ritual: this.workRitual })
                }
                this.$router.push( 'rules', '', '')
            },
        },
        mounted() {            
            this.workRitual = Object.assign({}, this.getWorkRitual.ritual)
        },
        created() {    
            // console.log('CREATED() ENTRY')         
            this.$root.$on('eventModifyRitual', (event) => {                 
                if(this.mode === 'edit') {
                    // console.log('CREATED() EDIT')
                    this.workRitual = Object.assign({}, event.ritual)
                    this.id = event.id
                    // console.log(this.workRitual)
                } else { 
                    // console.log('CREATED() ADD')
                    this.workRitual = {
                        text: '',
                        title: '',
                        createdBy: '',
                        createdDate: ''
                    }
                    this.id = ''
                    // console.log(this.workRitual)
                }
            })
        },
        beforeDestroy() {
            this.$root.$off('eventEditRitual', '')
        }
    }
</script>

<style lang="scss" scoped>

</style>