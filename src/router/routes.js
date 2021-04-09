const routes = [
    {
        path: '/',
        component: () => import('layouts/Layout.vue'),
        children: [
            {
                path: '/auth',
                component: () => import('pages/Auth.vue')
            },            
            {
                path: '/connections',
                component: () => import('pages/Connections.vue')
            },
            {
                path: '/help',
                component: () => import('pages/Help.vue')
            },
            {
                path: '',
                component: () => import('pages/Index.vue')
            },
            {
                name: 'protocol-modify',
                path: '/protocol-modify',
                component: () => import('pages/ProtocolAddEdit.vue'),
                props: true
            },
            {
                name: 'review',
                path: '/review',
                component: () => import('pages/Review.vue'),
            },
            {
                name: 'ritual-modify',
                path: '/ritual-modify',
                component: () => import('pages/RitualAddEdit.vue'),
                props: true
            },
            {
                name: 'rule-modify',
                path: '/rule-modify',
                component: () => import('pages/RuleAddEdit.vue'),
                props: true
            },            
            {
                path: '/rules',
                component: () => import('pages/RRP.vue')
            },
            {
                path: '/settings',
                component: () => import('pages/Settings.vue')
            },
            {
                path: '/timeline',
                component: () => import('pages/Timeline.vue')
            },
            {
                path: '/today',
                component: () => import('pages/Today.vue')
            },                        
            
        ]
    }
]

// Always leave this as last one
routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
})

export default routes
