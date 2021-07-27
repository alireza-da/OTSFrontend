import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Meeting from '../views/Meeting.vue'
import PageNotFound from '../views/PageNotFound.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/meeting/:token-:meetingUrl-:fullname',
        name: 'Meeting',
        component: Meeting,
        props: true  
    },
    // catch all 404
    {
        path: '/:catchAll(.*)',
        name: 'PageNotFound',
        component: PageNotFound,
    }
]


const router = new createRouter({
    history: createWebHistory(),
    routes: routes
})



export default router