<template>
    <div class="chatPanel" style="height: 80%">
		<div class="chatMessages">
			<ul id="messagesList">
				<li v-for="message in chatMessages" class="message">
					{{ message.fullname }}: {{ message.content }}
				</li>
			</ul>
		</div>
		<div class="sendMessageDiv">
			<input type="text" placeholder="Type your message here..." id="sendMessageContent" v-model="chatBody">
			<button id="sendButton" @click="sendMessage"><i class="fa fa-paper-plane" aria-hidden="true"></i></button>
			<button id="clearChat" @click="clearChatFeed" v-if="showToolButton"><span class="fa fa-trash" aria-hidden="true"></span></button>
			<button id="downloadChatList" @click="downloadChatList"><i class="fa fa-download" aria-hidden="true"></i></button>
		</div>

    </div>
</template>


<script>
import axios from 'axios'
import 'file-saver'
export default {
	data(){
		return{
			api_messages_url: "http://127.0.0.1:8000/api/ots/messages/",
			api_user_info_url: "http://127.0.0.1:8000/api/ots/users/",
			api_participation_url: "http://127.0.0.1:8000/api/ots/participation/",
			chatMessages: [], 
			chatBody: "",
			client: "",
			showToolButton: false
		}
	},
	methods:{
		async fetchChatMessagesList()	{
			var mId 
			await this.$props.meetingId.then(value => {
				
				mId = value
			})
			await axios.get(this.api_messages_url+mId+'/').then(response => {
				this.chatMessages = response.data
			}).catch(error => {
				console.error(error)
			})
		},
		async sendMessage(){
			if(this.chatBody.trim().length){
				var mId 
				await this.$props.meetingId.then(value => {
					
					mId = value
				})
				var uId 
				await this.$props.userId.then(value => {
					uId = value
				})
				
				console.log(uId,mId,this.$props.fullname);
				await axios.post(this.api_messages_url, {
					
					"sender": uId, "fullname": this.$props.fullname ,"session": mId, "content": this.chatBody
					}).then(response => {
						console.log(response);
					}).catch(error => {
						console.error(error);
					})
			}
			document.querySelector("#sendMessageContent").value = ""
			this.chatBody = ""
		},
		async clearChatFeed(){
			var mId
			await this.$props.meetingId.then(value => {
				mId = value
			})
			await axios.delete(this.api_messages_url+mId+'/').then(response =>{
				console.log(response);
			}).catch(error => {
				console.error(error);
			})
		},
		async fetchUserRole(){
			var mId 
			await this.$props.meetingId.then(value => {
				
				mId = value
			})
			var uId 
			await this.$props.userId.then(value => {
				uId = value
			})
			await axios.get(this.api_participation_url+uId+'/').then(
				response => {
					response.data.forEach(element => {
						if(element["session"] === mId && element["start_date"] === element["end_date"]){
							if(element["role"] == "host"){
								this.showToolButton = true
							}else{
								false
							}
						}
					});
				}
			)
		},
		downloadChatList(){
			var messages = []
			this.chatMessages.forEach(el => {
				messages.push(el.fullname+": "+el.content+'\n')
			})
			var blob = new Blob(messages, { type: "text/plain;charset=utf-8" })
			saveAs(blob, "chat-list.txt")
		}
	},
	mounted(){
		setInterval(this.fetchChatMessagesList,100);
		this.fetchUserRole()
	},
	props:[
		'userId',
		'meetingId',
		'fullname'
	],
	
	
}
</script>


<style scoped>
	.chatMessages{
		height: 70%;
	}
	button {
		background: white;
		color: black;
        border-radius: 5px;
        border: 2px solid rgb(41, 40, 40);
        align-content: center;
        width: 30px;
        height: 30px;
	}
	#sendButton{
		background: white;
		color: black;
        border-radius: 5px;
        border: 2px solid rgb(41, 40, 40);
        align-content: center;
        width: 30px;
        height: 30px;
		float: inline-end;
	}
	#clearChat{
		background: white;
		color: black;
        border-radius: 5px;
        border: 2px solid rgb(41, 40, 40);
        align-content: center;
        width: 30px;
        height: 30px;
		float: inline-end;
	}
	#clearChat:hover{
		background: #43e5f7;
	}
	#sendButton:hover{
		background: #43e5f7;
	}
	button:hover{
		background: #43e5f7;
	}
	.sendMessageDiv{
		margin: 5px;
		margin-top: 20px;
		width: 100%;
		height: 30%;
	}
	#sendMessageContent{
		border: 2px solid black;
		border-radius: 5px;
		background: white;
		padding: 5px;
		width: 78% auto;
	}
	#messagesList{
		overflow-y: scroll;
		background: white;
		margin: 5px;
		border: 2px solid black;
		border-radius: 5px;
		list-style: none;
		padding: 5px;
		height: 100%;
	}
	.message {
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		font-size: 10px;
		font-weight: bold;
	}
	::-webkit-scrollbar {
		width: 10px;
		border: 2px solid black;
		border-radius: 5px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		background: #f1f1f1; 
		border: 2px;
		border-radius: 2px;
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