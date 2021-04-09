<template>
    <div>
        <form @submit.prevent="submitForm">
            <div class="row q-mb-md">
                <q-banner class="bg-grey-3 col">
                    <template v-slot:avatar>
                        <q-icon name="account_circle" color="primary" />
                    </template>
                    {{ tab | titleCase }} to access PowerX!
                </q-banner>
            </div>
            <div class="row q-mb-md">
                <q-input
                    v-model="formData.email"
                    :rules="emailRules"
                    ref="email"
                    lazy-rules
                    outlined
                    class="col"
                    label="Email"
                    stack-label
                />
            </div>
            <div class="row q-mb-md">
                <q-input
                    v-model="formData.password"
                    :rules="passwordRules"
                    ref="password"
                    lazy-rules
                    type="password"
                    outlined
                    class="col"
                    label="Password"
                    stack-label
                />
            </div>
            <div class="row q-mb-md" v-if="tab=='register'">
                <q-input                
                    v-model="formData.inviteCode"
                    :rules="codeRules"
                    ref="inviteCode"
                    lazy-rules                
                    outlined
                    class="col"
                    label="Invitation Code"
                    stack-label
                />
            </div>
            <div class="row">
                <div id="divError" class="text-red">{{ errorMessage }} </div>
                <q-space />            
                <q-btn color="primary" :label="tab" type="submit" />
            </div>
        </form>
        <div class="row" v-if="tab=='login'">        
            <q-space />
            <q-btn 
                flat 
                dense 
                class="q-mt-sm text-primary text-weight-normal" 
                label="Forgot Password" 
                @click="forgotPassword()"
                />
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { firebaseAuth } from "src/services/firebase"

export default {
    props: ["tab"],
    data() {
        return {
            formData: {
                email: '',
                password: '',
                inviteCode: ''            
            },
            emailRules: [
                v => !!v || 'Email is required', 
                v => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'Please enter a valid email address.'
            ],
            passwordRules: [ 
                v => !!v || 'Password is required', 
                v => (v && v.length >= 6) || 'Password must have 6+ characters',                
                v => /(?=.*\d)/.test(v) || 'Must have one number',
                // v => /(?=.*[A-Z])/.test(v) || 'Must have one uppercase character', 
                // v => /([!@$%])/.test(v) || 'Must have one special character [!@#$%]'                  
            ],
            codeRules: [
                v => !!v || 'Invitation code is required', 
                v => (v == 't1b3aak0g') || 'Invalid invitation code'
            ],
            errorMessage: ''
        };
    },
    methods: {
        ...mapActions("auth", ["registerUser", "loginUser"]),
        ...mapGetters("auth", ["getAuthError"]),  
        forgotPassword() {            
            this.$q.dialog({
                title: 'PASSWORD RECOVERY',
                message: 'Enter your email address:',
                prompt: {
                model: '',
                isValid: v => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'Please enter a valid email address.',
                type: 'email' // optional
                },
                cancel: true,
                persistent: true
            }).onOk(email => {
                // console.log('>>>> OK, received', email)                
                this.sendResetEmail(email)
                this.notifySent()
            })
        },  
        notifySent () {
            console.log('notifySent fired')
            this.$q.dialog({
            title: 'EMAIL SENT',
            message: "An email has been sent to the requested address with instructions for resetting your PowerX password."
            }).onOk(() => {
            // console.log('OK')
            })
        },        
        sendResetEmail(toEmail) {            
            var settings = {
                url: 'https://beta.powerx.app/#/auth',  
                handleCodeInApp: false
                };

            firebaseAuth.sendPasswordResetEmail(toEmail, settings).then(function() {
                //email sent
                //LOGGING - record this event.                              
            }).catch(function(error) {
                // An error happened.
                console.log('Error: ', error)
            })                
        },
        async submitForm() {
            this.$refs.email.validate();
            this.$refs.password.validate();
            
            if(this.tab=='register') {
                this.$refs.inviteCode.validate();
                if (!this.$refs.email.hasError && !this.$refs.password.hasError && !this.$refs.inviteCode.hasError) {                    
                    this.registerUser(this.formData)                    
                }
            } else {
                if (!this.$refs.email.hasError && !this.$refs.password.hasError) {
                    this.loginUser(this.formData)
                }
            }
                                    
            this.errorMessage = ''
            let result = await this.getAuthError()    
            
            switch(result) {
                case "auth/wrong-password":
                    this.errorMessage = "Invalid email or password. Please try again."                    
                    break
                case "auth/too-many-requests":
                    this.errorMessage = "Too many unsuccessful login attempts. Please try again later."
                    break
                case "auth/email-already-in-use":
                    this.errorMessage = "This email address is already in use by another account."
                    break
                default:                    
            }
        }     
    },
    filters: {
        titleCase(value) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        }
    }
};
</script>
