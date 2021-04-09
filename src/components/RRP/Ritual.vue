<template>    
    <q-item-section class="col q-mt-xs text-left">                    
            
        <q-item-label lines="2" class="text-body2 text-weight-light">{{ ritual.title }}</q-item-label>
        
        <!-- Status Line -->
        <div class="col text-grey-6 text-caption q-mt-xs">
            {{ ritual.description }}                  
        </div>
        
    </q-item-section>

    <q-item-section class="col-auto">                    
        <div class="row justify-end">                    
            <q-btn
                @click.stop="promptToDelete({id, ritual})"
                flat
                round                            
                size="md"
                color="red"
                icon="delete"
            />
            
        </div>
    </q-item-section>
    
    <q-dialog v-model="showEditRule">
        
    </q-dialog> 

</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex"

export default {
    props: ["ritual", "id"],
    data() {
        showEditRule: false
    }
}
</script>
