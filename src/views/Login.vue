<template>
    <div class="login-wrap">
	<div class="login-html">
		<input id="tab-1" type="radio" name="tab" class="sign-in" checked><label for="tab-1" class="tab">Sign Up</label>
		<input id="tab-2" type="radio" name="tab" class="sign-up"><label for="tab-2" class="tab">Sign In</label>
		<div class="login-form">

			<div class="sign-in-htm">
                <form class="signin-form" @submit.prevent="checkForm('signup')" method="post" enctype="application/json">
                    <div class="group">
                        <label for="user" class="label">Username</label>
                        <input id="user" type="text" class="input"  placeholder="Username" v-model="username" required>
                    </div>
                    <div class="group">
                        <label for="pass" class="label">Password</label>
                        <input id="pass" type="password" class="input" data-type="password" placeholder="Password" v-model="password" required>
                    </div>
                    <div class="group">
                        <label for="email" class="label">Email</label>
                        <input id="email" type="email" class="input"  placeholder="Email" v-model="email" required>
                    </div>
                    <div class="group">
                        <label for="fullname" class="label">Fullname</label>
                        <input id="fullname" type="text" class="input"  placeholder="Fullname" v-model="fullname" required>
                    </div>
                    <div class="group">
                        <label for="meetingUrl" class="label">Meeting URL</label>
                        <input id="meetingUrl" type="text" class="input"  placeholder="Meeting URL" v-model="meetingUrl" required>
                    </div>
                    <div class="group">
                        <label for="meetingName" class="label">Meeting Name</label>
                        <input id="meetingName" type="text" class="input"  placeholder="Meeting URL" v-model="meetingName" required>
                    </div>
                    <div class="group">
                        <input id="hostCheck" type="checkbox" class="check" v-model="isHost" checked>
                        <label for="hostCheck"><span class="icon"></span>Host</label>
                    </div>
                    <div class="group">
                        <input id="joinCheck" type="checkbox" class="check" v-model="isJoin">
                        <label for="joinCheck"><span class="icon"></span>Join</label>
                    </div>
                    <div class="group">
                        <input type="submit" class="button" value="Sign Up">
                    </div>
                </form>
			</div>
			<div class="sign-up-htm">
                <form class="signin-form" @submit.prevent="checkForm('signin')" method="post" enctype="application/json">
                    <div class="group">
                        <label for="user" class="label">Username</label>
                        <input id="user" type="text" class="input"  v-model="username">
                    </div>
                    <div class="group">
                        <label for="pass" class="label">Password</label>
                        <input id="pass" type="password" class="input" data-type="password" v-model="password">
                    </div>
                    <div class="group">
                        <label for="fullname" class="label">Fullname</label>
                        <input id="fullname" type="text" class="input" v-model="fullname">
                    </div>
                    <div class="group">
                        <label for="meetingUrl" class="label">Meeting URL</label>
                        <input id="meetingUrl" type="text" class="input" v-model="meetingUrl">
                    </div>
                     <div class="group">
                        <label for="meetingName" class="label">Meeting Name</label>
                        <input id="meetingName" type="text" class="input"  placeholder="Meeting URL" v-model="meetingName" required>
                    </div>
                    <div class="group">
                        <input id="hostCheck" type="checkbox" class="check" v-model="isHost" checked>
                        <label for="hostCheck"><span class="icon"></span>Host</label>
                    </div>
                    <div class="group">
                        <input id="joinCheck" type="checkbox" class="check" v-model="isJoin">
                        <label for="joinCheck"><span class="icon"></span>Join</label>
                    </div>
                    <div class="group">
                        <input type="submit" class="button" value="Sign In">
                    </div>
                </form>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import 'jquery'
import 'bootstrap'
import '../assets/js/main'
import '../assets/js/popper'
import axios from 'axios'
import router from '../router'
import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css'

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

export default ({
    
    data(){
        return {
            username : "",
            password : "",
            email: "",
            meetingUrl : "",
            isHost : false,
            isJoin : false,
            meetingName : "",
            api_login_url : "http://127.0.0.1:8000/api/ots/users/",
            api_token_url : "http://127.0.0.1:8000/user/token/",
            api_session_url : "http://127.0.0.1:8000/api/ots/sessions/",
            api_participation_url : "http://127.0.0.1:8000/api/ots/participation/",
            api_userinfo_url : "http://127.0.0.1:8000/user/me/",
            token: "",
            userId: "",
            meetingId: "",
            fullname: "",
            usernameSignIn: "",
            passwordSignIn: ""
        }
    },
    methods:{
        
        async sendLoginData(requestOptions){
            var serverResponse
            var meetingData = {}
            await axios.post(this.api_login_url, requestOptions).then(response => {
                serverResponse = response
                this.userId = serverResponse.data["id"]
            }).catch(function (error) {
                console.log(error.request.response)  
                createToast("Sign up failed, try unique username or email",{type: "danger",})
            })
            await axios.post(this.api_token_url, {"username": this.username, "password": this.password}).then(response => {
                this.token = response.data["token"]
            }).catch(function(error){
                console.log(error.request.response);
                createToast("Login failed.",{type: "danger",})
            })

            meetingData["url"] = this.meetingUrl;
            meetingData["start_date"] = getToday()
            if(this.isHost){
                meetingData["role"] = 'host'
            }
            else if(this.isJoin){
                meetingData["role"] = 'listener'
            }
            meetingData["name"] = this.meetingName
            this.sendMeetingData(meetingData)
            
               
        },
        async createParticipation(participationDetails){ 
            await axios.post(this.api_participation_url, participationDetails).then(response => {
                console.log(response.status);
            }).catch(error => {
                console.log(error.request.response)
                createToast("Sign up failed, try unique username or email",{type: "danger",})
            })
        },
        async sendMeetingData(meetingData){
            var tokenString = 'Token '+this.token
            console.log(tokenString);
            await fetch(this.api_userinfo_url, {
                method: 'GET',
                headers: {
                    'Authorization': tokenString
                }
            }).then(response => {

                    response.json().then(value => {
                        console.log(value);
                        this.userId = value["id"]
                        if(this.isJoin){
                            axios.get(this.api_session_url+this.meetingUrl+'/').then(response => {
                                if(response.status == 200){
                                    //creating participation
                                    var participationDetails = {}
                                    participationDetails["user"] = this.userId
                                    participationDetails["fullname"] = this.fullname
                                    participationDetails["session"] = response.data["id"]
                                    participationDetails["start_date"] = getToday()
                                    participationDetails["end_date"] = getToday()
                                    participationDetails["role"] = "listener"
                                    this.createParticipation(participationDetails)
                                    createToast("You are now participating in meeting.",{type: "success",})
                                    router.push(`/meeting/${this.token}-${this.meetingUrl}-${this.fullname}`)
                                    return
                                    
                                }
                            }).catch(error => {
                                console.log(error.request.response);
                                createToast("Error occured while trying to join meeting, check url and meeting name.",{type: "danger",})
                            })
                        }
                        // host
                        
                        if(this.isHost){
                            meetingData['host'] = value['id']
                            console.log(meetingData);
                            axios.post(this.api_session_url, meetingData).then(response => {
                                if(response.status == 201){
                                    
                                    this.meetingId = response.data["url"]
                                    
                                    var participationDetails = {}
                                    
                                    participationDetails["user"] = this.userId
                                    
                                    participationDetails["fullname"] = this.fullname
                                    
                                    participationDetails["session"] = response.data["id"]
                                    
                                    participationDetails["start_date"] = getToday()
                                    participationDetails["end_date"] = getToday()
                                    
                                    participationDetails["role"] = "host"
                                    
                                    this.createParticipation(participationDetails)
                                    
                                    router.push(`/meeting/${this.token}-${this.meetingUrl}-${this.fullname}`)
                                    // this.$notify({
                                    //     group: "auth",
                                    //     title: "Host",
                                    //     text: "You are now host of meeting."
                                    // })
                                    createToast("You are now host of meeting.",{type: "success",})
                                }
                            }).catch(error => {
                                createToast("The meeting url must be unique, try again.",{type: "danger",})
                                console.log(error.request.response)
                            })
                        }
                    })
                }
            ).catch(error => {
                console.log(error);
                createToast("Login failed.",{type: "danger",})
            })
        },
        async checkForm(mode){
            var userData = {}
            userData["username"] = this.username;
            userData["password"] = this.password;
            userData["email"] = this.email;
            await this.sendLoginData(userData)
            
        },
    }
})


</script>

<style scoped> 
    
    @import url('https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');

    @import url('https://fonts.googleapis.com/css?family=Lato:300,400,700&display=swap');
    body{
	margin:0;
	color:#6a6f8c;
	background:#c8c8c8;
	font:600 16px/18px 'Open Sans',sans-serif;
}
*,:after,:before{box-sizing:border-box}
.clearfix:after,.clearfix:before{content:'';display:table}
.clearfix:after{clear:both;display:block}
a{color:inherit;text-decoration:none}

.login-wrap{
	width:100%;
	margin:auto;
	max-width:525px;
	min-height:670px;
	position:relative;
	background:url('https://raw.githubusercontent.com/khadkamhn/day-01-login-form/master/img/bg.jpg') no-repeat center;
	box-shadow:0 12px 15px 0 rgba(0,0,0,.24),0 17px 50px 0 rgba(0,0,0,.19);
}
.login-html{
	width:100%;
	height:100%;
	position:absolute;
	padding:90px 70px 50px 70px;
	background:rgba(40,57,101,.9);
}
.login-html .sign-in-htm,
.login-html .sign-up-htm{
	top:0;
	left:0;
	right:0;
	bottom:0;
	position:absolute;
	transform:rotateY(180deg);
	backface-visibility:hidden;
	transition:all .4s linear;
}
.login-html .sign-in,
.login-html .sign-up,
.login-form .group .check{
	display:none;
}
.login-html .tab,
.login-form .group .label,
.login-form .group .button{
	text-transform:uppercase;
}
.login-html .tab{
	font-size:22px;
	margin-right:15px;
	padding-bottom:5px;
	margin:0 15px 10px 0;
	display:inline-block;
	border-bottom:2px solid transparent;
}
.login-html .sign-in:checked + .tab,
.login-html .sign-up:checked + .tab{
	color:#fff;
	border-color:#1161ee;
}
.login-form{
	min-height:345px;
	position:relative;
	perspective:1000px;
	transform-style:preserve-3d;
}
.login-form .group{
	margin-bottom:15px;
}
.login-form .group .label,
.login-form .group .input,
.login-form .group .button{
	width:100%;
	color:#fff;
	display:block;
}
.login-form .group .input,
.login-form .group .button{
	border:none;
	padding:15px 20px;
	border-radius:25px;
	background:rgba(255,255,255,.1);
}
.login-form .group input[data-type="password"]{
	text-security:circle;
	-webkit-text-security:circle;
}
.login-form .group .label{
	color:#aaa;
	font-size:12px;
}
.login-form .group .button{
	background:#1161ee;
}
.login-form .group label .icon{
	width:15px;
	height:15px;
	border-radius:2px;
	position:relative;
	display:inline-block;
	background:rgba(255,255,255,.1);
}
.login-form .group label .icon:before,
.login-form .group label .icon:after{
	content:'';
	width:10px;
	height:2px;
	background:#fff;
	position:absolute;
	transition:all .2s ease-in-out 0s;
}
.login-form .group label .icon:before{
	left:3px;
	width:5px;
	bottom:6px;
	transform:scale(0) rotate(0);
}
.login-form .group label .icon:after{
	top:6px;
	right:0;
	transform:scale(0) rotate(0);
}
.login-form .group .check:checked + label{
	color:#fff;
}
.login-form .group .check:checked + label .icon{
	background:#1161ee;
}
.login-form .group .check:checked + label .icon:before{
	transform:scale(1) rotate(45deg);
}
.login-form .group .check:checked + label .icon:after{
	transform:scale(1) rotate(-45deg);
}
.login-html .sign-in:checked + .tab + .sign-up + .tab + .login-form .sign-in-htm{
	transform:rotate(0);
}
.login-html .sign-up:checked + .tab + .login-form .sign-up-htm{
	transform:rotate(0);
}

.hr{
	height:2px;
	margin:60px 0 50px 0;
	background:rgba(255,255,255,.2);
}
.foot-lnk{
	text-align:center;
}
    
</style>