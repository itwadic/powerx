<template>
    <div>
        
            <q-banner class="white">
                <div class="row">
                    <div class="col-auto text-h5 text-grey-8 text-weight-thin vertical-center">{{ title }}</div>
                    <q-separator vertical insert class="q-ml-sm q-mr-sm" />
                    <div style="line-height: 1.2em" class="bubble col text-caption1 text-grey-6 text-weight-light vertical-center">{{ description }}</div>
                    <div class="col-auto" v-if="!simple">
                        <q-btn flat icon="add" color="text-grey-8" @click.stop="$emit('add')" />
                    </div>
                </div>  
                <q-separator></q-separator>
            </q-banner>
        
            <q-card-section>
                <slot></slot>
            </q-card-section>
        

        <!-- <q-card class="q-mt-xs">
            <q-banner class="bg-primary">
                <div class="row text-h5 text-white text-weight-thin vertical-center">
                    <div class="col">{{ title }}</div>
                    <div class="col-auto">
                        <q-btn flat icon="add" color="text-white" @click.stop="$emit('add')" />
                    </div>
                </div>  
                <q-separator></q-separator>
            </q-banner>
        
            <q-card-section>
                <slot></slot>
            </q-card-section>
        </q-card> -->
    </div>
</template>

<script>
    export default {
        props: {
            'title': String,
            'description': String, 
            'simple': Boolean
        }
    }
</script>

<style>
    .bubble div { position: absolute; top:50%;}
    .bubble div p {position: relative; top: -50%}
</style>
 