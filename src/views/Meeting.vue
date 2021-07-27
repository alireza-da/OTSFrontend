<template>
    <navbar v-bind:authState="this.getUserAuthState" v-bind:meetingInfo="this.getAttendeesInfo" v-bind:userInfo="this.getUserInfo"/>
    <div style="display: flex ; height: 100%; width: 100%">
        <whiteboard v-bind:userRole="this.getUserRole" v-bind:token="givenToken"/>
        <attendees v-bind:attendeesList="this.getAttendeesInfo" v-bind:meetingInfo="this.getMeetingInfo" v-bind:user="this.getUserInfo"/>
    </div>
</template>


<script>
import WhiteBoard from '../components/Whiteboard.vue'
import Navbar from '../components/Navbar.vue'
import Attendees from '../components/Attendees.vue'
import axios from 'axios'


export default({
    components: {
        whiteboard: WhiteBoard,
        navbar: Navbar,
        attendees: Attendees
    },
    data() {
        return{
            api_user_info: "http://127.0.0.1:8000/user/me/",
            api_session_url: "http://127.0.0.1:8000/api/ots/sessions/",
            api_attendees_url: "http://127.0.0.1:8000/api/ots/participation/",
            api_users_url: "http://127.0.0.1:8000/api/ots/users/",
            givenToken: this.token,
            givenMeetingId: this.meetingId,
            host: "",
            userRole: "",
            userInfo: {},
            meetingInfo: {},
            authState: "",
            attendees: []
        }
    },
    methods:{
        async getUserById(id){
            var userNameAndEmail = {}
            await axios.get(this.api_users_url+id+'/', {headers: {
                                    "Access-Control-Allow-Origin" : "*",
                                    "Content-Type": "application/json",
                                    }
                                }
                             ).then(response => {
                                userNameAndEmail["name"] = response.data["username"]
                                userNameAndEmail["email"] = response.data["email"]


            }).catch(error => {
                console.log(error.request.response)
            })
            
            return userNameAndEmail
        },
        async getUserId(){
            var id
            await axios.get(this.api_user_info,
                            {headers: {
                                "Access-Control-Allow-Origin" : "*",
                                "Content-type": "Application/json",
                                "Authorization": `Token ${this.token}`
                            }   
                    }).then(response => {
                        id = response.data['id']
                    })
            return id 
        },
        async getMeetingId(){
            var id;
            await axios.get(`${this.api_session_url+this.$props.meetingUrl}/`).then(response => {
                id = response.data["id"]
                
            }).catch(error => {
                console.log(error.request.response)
            })
            return id
        },
    },
    computed:{
        async getUserInfo(){
            await axios.get(this.api_user_info,
                            {headers: {
                                "Access-Control-Allow-Origin" : "*",
                                "Content-type": "Application/json",
                                "Authorization": `Token ${this.token}`
                            }   
                    }).then(response => {
                        this.userInfo['username'] = response.data['username']
                        this.userInfo['email'] = response.data['email']
                        this.userInfo['id'] = response.data['id']
                        this.authState = "Log Out"
                    }).catch(error =>{
                        console.log(error);
                    })
            
            return this.userInfo
                        
        },
        async getMeetingInfo(){
            var meetingInfo
            await axios.get(`${this.api_session_url+this.$props.meetingUrl}/`).then(response => {
                this.meetingInfo["id"] = response.data["id"]
                this.meetingInfo["name"] = response.data["name"]
                this.meetingInfo["start_date"] = response.data["start_date"]
                this.meetingInfo["host"] = response.data["host"]
                this.meetingInfo["url"] = response.data["url"]
                
                meetingInfo = this.meetingInfo
            }).catch(error => {
                console.error(error)
                
            })
            return meetingInfo
        },
        async getUserAuthState(){
            var authSt
            await axios.get(this.api_user_info,
                            {headers: {
                                "Access-Control-Allow-Origin" : "*",
                                "Content-type": "Application/json",
                                "Authorization": `Token ${this.token}`
                            }   
                    }).then(response => {
                        this.authState = "Logout"
                        authSt = "Logout"
                    }).catch(function(error){
                        console.log(error.request.response);
                        authSt = "Login"
                    })
            return authSt       
        },
        async getUserRole(){
            var userId = this.getUserId()
            await userId.then(value => {
                userId = value
            })
            var meetingId = this.getMeetingId()
            await meetingId.then(value => {
                meetingId = value 
            })
            var role
            await axios.get(this.api_attendees_url).then(response =>{
                response.data.forEach(element => {
                    if(element["session"] === meetingId){
                        if(userId === element["user"]){
                            role = element["role"]
                        }
                    }
                })       
            }).catch(error => {
                console.log(error);
            })
            return role
        },
        async getAttendeesInfo(){
            var userId = this.getUserId()
            await userId.then(value => {
                userId = value
            })
            var meetingId = this.getMeetingId()
            await meetingId.then(value => {
                meetingId = value
            })
            
            await axios.get(this.api_attendees_url).then(response =>{
                response.data.forEach(element => {
                    if(element["session"] === meetingId){
                        this.attendees.push(element)
                        console.log(this.attendees);
                        if(userId === element["user"]){
                            this.userRole = element["role"]
                            
                        }
                    }
                })
               
            })
            var i
            for (let i = 0; i < this.attendees.length; i++) {
                const element = this.attendees[i];
                var userDetails = this.getUserById(element["user"])
                await userDetails.then(value => {
                    element["username"] = value["name"]
                    element["email"] = value["email"]
                })
            }
            console.log(this.attendees);
            return this.attendees
        },
        
        
    },
    props: [
        'token',
        'meetingUrl',
        'fullname'
    ],
    mounted(){
        
    }

    
})
</script>

