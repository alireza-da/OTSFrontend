import { StreamChat } from 'stream-chat'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
//import Notifications from 'vue-notification'

const cors = require('cors')
createApp(App).use(router).mount('#app')

