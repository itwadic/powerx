<template>
    <q-card style="width:750px" class="q-pa-sm">
         <q-card-section class="row">
            <div class="col text-h6">{{ pageTitle }}</div>            
            <div class="col-1">
                <q-btn v-close-popup flat round dense color="primary" icon="close" />
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
                

                <!-- -------- TEXT -------- -->
                <q-input                    
                    v-model="workRule.text"
                    outlined
                    :rules="[val => !!val || 'Field is required']"
                    label="Rule description"
                    type="textarea"
                    ref="text"
                />
 
            </q-card-section>

            <q-card-actions align="right">
                <q-btn label="CANCEL" color="green" class="q-pa-md" v-close-popup />
                <q-btn label="SAVE" color="primary" type="submit" class="q-pa-md" />
            </q-card-actions>
        </form>
    </q-card>
</template>

<script>
import { date } from 'quasar'

    export default {
        props: ['mode', 'rule', 'id'],
        data() {
            return {
                workRule: {
                    title: "",
                    text: "",
                    createdBy: "",
                    createdDate: ""
                }                
            }
        },
        computed: {
            pageTitle() {
                if(this.mode == "add") {                
                    this.workRule.createdBy = this.currentUserId
                    return "Add New Rule"
                } else {
                    return "Edit Rule: " + this.workRule.title
                }
            }
        },
        methods: {
            submitForm() {
                this.$refs.title.validate();
                if (!this.$refs.title.hasError && !this.$refs.text.hasError) {
                    this.submitTask();
                }
            },
            submitTask() {
                if(this.mode == "add") {     
                    let theDate = new Date()

                    workRule.createdDate = date.formatDate(theDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ')     
                    this.addRule(this.workRule)
                } else {
                    //console.log(this.workTask)
                    this.updateRule({ id: this.id, rule: this.workRule })
                }
                this.$emit("close")
            },
        },
        mounted() {
            if(this.mode == "edit") {
                this.workRule = Object.assign({}, this.rule)
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>