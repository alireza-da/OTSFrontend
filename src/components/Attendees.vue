<template v-if="attendeesFullDetailedList.length">
    <div class="list">
        <div>
            <p id="title"> Attendees </p>
            <button id="downloadListButton" class="toolButton" v-on:click="downloadAttendeesList"><i class="fas fa-file-download"></i></button>
        </div>
        <ul id="attendeesList" >
            <li v-bind:id="'attendee'+attendee.user" v-for="attendee in attendeesFullDetailedList" v-bind:key="attendee.user" class="listItem">
                <div class="dropdown" v-if="showRoleOptionButtons">
                    <button id="attendeeOptions" style="background: white ; border:none" v-on:click="showDropdown(this)"><i class="fas fa-bars"></i></button>
                    <div class="dropdown-content-shapes" id="dropdownRoles">
                        <button id="listenerRole" v-on:click="setRole(attendee.user, 'listener', $event)">Listener</button>
                        <button id="speakerRole" v-on:click="setRole(attendee.user, 'speaker')">Speaker</button>
                        <button id="presenterRole" v-on:click="setRole(attendee.user, 'presenter')">Presenter</button>
                        <button id="hostRole" v-on:click="setRole(attendee.user, 'host')">Host</button>
                    </div>
                </div>
                {{ attendee.fullname }}
                <i class="fas fa-assistive-listening-systems" id="listenerIcon" v-show="attendee.role == 'listener'" style="float:right"></i>
                <i class="fas fa-microphone" id="speakerIcon" v-show="attendee.role == 'speaker'"  style="float:right;"></i>
                <i class="fas fa-user-alt" id="presenterIcon" v-show="attendee.role == 'presenter'" style="float:right;"></i>
                <i class="fas fa-user-tie" id="hostIcon" v-show="attendee.role == 'host'" style="float:right;"></i>
            </li>
        </ul>
        <chatBox v-bind:userId="chatUserId()" v-bind:meetingId="chatMeetingId()" v-bind:fullname="fullname"/>
    </div>
    
</template>


<script scoped>
import '@fortawesome/fontawesome-free/js/all'
import XLSX from 'xlsx'
import 'file-saver'
import ChatBox from './ChatBox.vue';
import { watch } from 'vue';
import axios from 'axios'
var joinedTime , leftTime;
function s2ab(s) { 
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;    
}

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

window.onload = function(e){
    
    var date = new Date()
    var dateString = String(date.getFullYear()) +"-"+ date.getMonth()+"-"+ date.getDay()+" "+ date.getHours()+":"+ date.getMinutes()+":"+ date.getSeconds();
    joinedTime = dateString;
}

window.onclose = function(e){
    var date = new Date()
    var dateString = String(date.getFullYear()) +"-"+ date.getMonth()+"-"+ date.getDay()+" "+ date.getHours()+":"+ date.getMinutes()+":"+ date.getSeconds();
    leftTime = dateString;
    this.attendeesList.forEach(el => {
        if(el.id == this.user.id){
            el.leftTime = leftTime;
        }
    })
}


window.onclick = function(e){
    if(e.target.parentElement.id !== "attendeeOptions" && e.target.id !== "attendeeOptions"){
        document.getElementsByClassName("dropdown").forEach(dp => {
            dp.childNodes.forEach( e => {
                if(e.id === "dropdownRoles"){
                    e.style.display = "none"
                }
            })
        })
    }
}

export default{
    components: { ChatBox },
    setup(props){
        const attendeesData = props.attendeesList
        
        watch(() => attendeesData.length, () => {
            attendeesData.forEach((item) => {
                console.log(item);
            })
        })
    },
    data(){
        return {
            attendeesFullDetailedList: null,
            showRoleOptionButtons: true,
            fullname: "",
            api_attendees_url: "http://127.0.0.1:8000/api/ots/participation/",
        } 
    },
    props: [
        'attendeesList',
        'meetingInfo',
        'user'
        
    ],
    methods: {
        async setRole(id, role){
            if(!this.showRoleOptionButtons){
                return
            }
            document.getElementsByClassName("listItem").forEach(el => {
                if(el.id === `attendee${id}`){
                    el.childNodes.forEach(child => {
                        if(child.id !== undefined){
                            if(child.id.includes("Icon")){
                                child.style.display = "none"
                            }
                            if(child.id === `${role}Icon`){
                                child.style.display = "inline-block"
                            }
                        }
                    })
                }
            })
            this.attendeesFullDetailedList.forEach(async el => {
                if(el.user === id){
                    el.role = role
                    console.log(el);
                    await axios.delete(this.api_attendees_url+id+'/').then(response => {
                        console.log(response.status);
                    }).catch(error => {
                        console.error(error);
                    })
                    await axios.post(this.api_attendees_url, el).then(response => {
                        console.log(response.data);
                    }).catch(error => {
                        console.error(error);
                    })
                }
                
            })
        },
        showDropdown(e){
            var dropdownRoot = event.target.parentElement.parentElement
            dropdownRoot.childNodes.forEach(e => {
                if(e.id === "dropdownRoles"){
                    e.style.display = "block"
                }
            })
        },
        downloadAttendeesList(){
            var date = new Date()
            var dateString = String(date.getFullYear()) +"-" + date.getMonth()+"-"+ date.getDay()+" "+ date.getHours();
            var wb = XLSX.utils.book_new();
            wb.props = {
                Title: "Attendees Presence List "+ this.classTitle,
                Subject: "precence excel file",
                Author: 'host'.name,
                CreatedDate: dateString
            };
            var ws_data = []
            console.log(dateString);
            wb.SheetNames.push("Session "+dateString);
            this.attendeesFullDetailedList.forEach(element => {
                if(element.id == this.user.id){
                    element["start_date"] = joinedTime;
                }
                var elements = []
                for(const key in element){
                    elements.push(element[key])
                }
                ws_data.push(elements)
            });
            var ws = XLSX.utils.aoa_to_sheet(ws_data);
            wb.Sheets["Session "+dateString] = ws;
            var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'presence list.xlsx');
            
        },
        async fetchAttendeesList(){
            var list
            await this.$props.attendeesList.then(value => {
                this.attendeesFullDetailedList = value

                list = value      
            })
            this.attendeesFullDetailedList = list
            var id
            await this.$props.user.then(value => {
                id = value["id"]
            })
            console.log(this.attendeesFullDetailedList);
            this.attendeesFullDetailedList.forEach(el => {

                if(el["user"] == id){
                    this.fullname = el["fullname"]
                    if(el["role"] == "host" || el["role"] == "presenter"){
                        this.showRoleOptionButtons = true
                    }else this.showRoleOptionButtons = false
                }
            })
        },
        async chatUserId(){
            var id
            await this.$props.user.then(value => {
                id = value["id"]
            })
            return id
        },
        async chatMeetingId(){
            var id
            await this.$props.meetingInfo.then(value => {
                id = value["id"]
            })
            return id
        },
       async refreshAttendeesList(){
            var uid
            var list = []
            await this.$props.user.then(value => {
                uid = value["id"]
            })
             var mid
            await this.$props.meetingInfo.then(value => {
                mid = value["id"]
            })
            await axios.get(this.api_attendees_url).then(response =>{
                response.data.forEach(element => {
                    if(element["session"] === mid && element["start_date"] === element["end_date"]){
                        list.push(element)
                        if(element["user"] == uid){
                            this.fullname = element["fullname"]
                            if(element["role"] == "host" || element["role"] == "presenter"){
                                this.showRoleOptionButtons = true
                            }else this.showRoleOptionButtons = false
                        }
                    }
                })       
            }).catch(error => {
                console.log(error);
            })
            this.attendeesFullDetailedList  =  list
       }
    },
    mounted(){
        setInterval(this.refreshAttendeesList, 100)
        this.chatUserId()
        this.chatMeetingId()
    }
}


</script>


<style scoped>

    .list {
        width: 22%;
        height: 50% auto;
        background-color: rgb(38, 3, 95);
        float: right;
        border: 2px solid;
        border-radius: 5px;
        margin: 5px;
    }
    #attendeesList {
        border: 2px solid white;
        border-radius: 5px;
        align-items: center;
        padding: 2px;
        margin: 5px;
        overflow-y: scroll;
        width: 92%;
        height: 25%;
    }
    #attendee {
        padding: 3px;
        background: white;
        list-style-type: none;
        border: 2px solid black;
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        color: black;
    }
    .listItem {
        padding: 3px;
        background: white;
        list-style-type: none;
        border: 2px solid black;
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    }
    .listItem:hover {
        background: #43e5f7;
    }
    #title {
        text-align: center;
        color: rgb(255, 255, 255);
        font-weight: bold;
        align-content: center;
        display: inline-block;
        padding: 2px;
        margin: 2px;
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    }
    #active {
        display: inline;
    }
    .dropdown-content-shapes {
        display: none;
        position: absolute;
        background-color: #ffffff;
        align-content: center;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }
    .dropdown {
        position: relative;
        display: inline-block;
    }
    .dropdown-content-shapes button {
        color: black;
        padding: 5px;
        width: 100%;
        display: block;
        outline: none;
        border: none;
        background: white;
    }
    .dropdown-content-shapes button:hover {background-color:#43e5f7;}

    .toolButton {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bold;
        background: white;
        padding: 5px;
        border-radius: 5px;
        border: 2px solid rgb(41, 40, 40);
        align-content: center;
        color: black;
        width: 30px;
        height: 30px;
    }
    .toolButton:hover {
        background: #43e5f7;
    }
    #downloadListButton {
        float: right;
        margin-bottom: 3px;
    }
    ::-webkit-scrollbar {
		width: 10px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		background: #f1f1f1; 
	}
	
	/* Handle */
	::-webkit-scrollbar-thumb {
		background: #888; 
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: #555; 
	}
 
</style>