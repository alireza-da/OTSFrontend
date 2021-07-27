 <template>
    <div id="navbar" v-if="showNavbar">
        <h1 class="title">{{logo}}</h1>
        <router-link to="/login"><a class="navbarButton" id="authActionButton" @click="logout">{{authStateText}}</a></router-link>
        <router-link to="/login"><a class="navbarButton"> Host a Meeting </a></router-link>
    </div>
</template>

<script>
import axios from "axios"
import { createToast } from "mosha-vue-toastify";


function getToday(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var mn = today.getMinutes();
    var ss = today.getSeconds()
    today = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + mn + ':' + ss;
    return today
}


export default({
    data() {
        return {
            title : "Online Teaching System",
            logo: "OTS",
            authStateText: "",
            participation: {},
            userId: null,
            api_participation_url : "http://127.0.0.1:8000/api/ots/participation/",
        }
    },
    methods:{
        async fetchParticipation(){    
            await this.$props.userInfo.then(value => {
                this.userId = value["id"]
            })
            
            await this.$props.meetingInfo.then(value => {
                value.forEach(element => {
                    if(element["user"] === this.userId){
                        this.participation = element
                    }
                });
            })
        },
        async logout(){
            await this.fetchParticipation()
            this.participation["end_date"] = getToday()
            var data = {}
            data["user"] = this.userId
            data["fullname"] = this.participation["fullname"]
            data["session"] = this.participation["session"]
            data["start_date"] = this.participation["start_date"]
            data["end_date"] = this.participation["end_date"]
            data["role"] = this.participation["role"]
            await axios.put(this.api_participation_url+this.userId+'/',data).then(
                response => {
                    console.log("logged out");
                    createToast("Logged Out", {type: "success"})
                }
            ).catch(error => {
                console.log(error)
                createToast("Failed to log you out.", {type: "success"})
            })
        }
    },
    props:[
        'authState',
        'meetingInfo',
        'userInfo'
    ],
    computed:{
        showNavbar: async function(){
            await this.$props.authState.then(value => {
                this.authStateText = value
                if(value === 'Logout'){
                    return true
                }else{
                    return false
                }
            })
            
        },
        
    },
})
</script>



<style scoped>
    #navbar {
        width: 100% auto;
        height: 100% auto;
        background: rgb(20, 20, 20);
        overflow: hidden;
        padding: 5px;
    }
    .title {
        font-weight: bold;
        color: white;
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        margin: 0;
        padding: 5px;
        display: inline-block;
    }
    .navbarButton {
        display: block;
        background: rgb(22, 22, 22);
        color: aliceblue;
        margin: 5px;
        padding: 5px;
        border-radius: 4px;
        cursor: pointer;
        float: right;
        margin-top: 5px;
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        
    }
    .navbarButton:hover {
        background-color: rgb(38, 3, 95);
        border: 1px solid rgb(9, 0, 128);
        border-radius: 4px;
    }
    #authActionButton:hover {
        background: rgb(194, 5, 5);
        border: 1px solid rgb(139, 5, 39);
        border-radius: 4px;
    }
</style>