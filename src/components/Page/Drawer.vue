<template>
    <div>
        <!-- Footer for mobile users-->
        <q-footer>                
            <q-tabs class="bg-primary text-white">                
                <q-route-tab                            
                    v-for="(menuItem, index) in menuList" :key="index"                            
                    :icon="menuItem.icon"
                    label=""
                    :to="menuItem.to"
                /> 
            </q-tabs>
        </q-footer>

        <!-- Side drawer for desktop/web app users-->
        <q-drawer
            v-model="leftDrawerOpen"
            :width="200"
            :breakpoint="767" 
            bordered
            show-if-above
            content-class="bg-grey-3"
        >            
            <q-list v-for="(menuItem, index) in menuList" :key="index">
                <q-item exact clickable v-ripple :to="menuItem.to">
                    <q-item-section avatar>
                        <q-icon :name="menuItem.icon" />
                    </q-item-section>
                    <q-item-section>{{ menuItem.label }}</q-item-section>
                </q-item>                    

                <q-separator v-if="menuItem.separator" />                    
            </q-list>
        </q-drawer>

    </div>
</template>

<script>
    export default {
        computed: { 
            mobileMenu() {
                var mobileList = this.menuList.filter(function(item) {
                  
                    return item.showMobile === true
                })                
                return mobileList
            }
        },
        data() {
        return {
            leftDrawerOpen: false,
            menuList: [
                {
                    icon: "inbox",
                    label: "Today",
                    separator: true,
                    showMobile: true,
                    to: "/today"
                },
                {
                    icon: "send",
                    label: "All Tasks",
                    separator: false,
                    showMobile: true,
                    to: "/"
                },
                {
                    icon: "gavel",
                    label: "Rituals, Rules & Protocols",
                    separator: false,
                    showMobile: false,
                    to: "/rules"
                },
                {
                    icon: "account_tree",
                    label: "Connections",
                    separator: true,
                    showMobile: true,
                    to: "/connections"
                },
                {
                    icon: "receipt",
                    label: "Review",
                    separator: true,
                    showMobile: true,
                    to: "/review"
                },
                {
                    icon: "settings",
                    label: "Settings",
                    separator: false,
                    showMobile: true,
                    to: "/settings"
                }
            ]
        };
    },
    }
</script>
 
 <style>
 @media screen and (min-width: 768px) {
    .q-footer {
        display: none;
    }
}
</style>