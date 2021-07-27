<template>
    <video id="remote-view" autoplay></video>
    <video id="self-view" autoplay></video>
    
</template>


<script>

var webSocket
var mapPeers = {}
var localStream = new MediaStream()
var username
function sendSignal(action, message){
  var jsonStr = JSON.stringify({
      'peer': username,
      'action': action,
      'message': message
    })
  webSocket.send(jsonStr)
}
export default {
    setup() {
        
    },
    data(){
        return({
            wsBackendUrl: 'localhost:8000',
            wsStart: 'ws://',
            isPresenting: null
        })
    },
    methods:{
        
        async initializeStream(){
            const localVideo = document.getElementById("self-view")
            var endPoint = this.wsStart + this.wsBackendUrl
            webSocket = new WebSocket(endPoint)
            webSocket.onopen =  function(e){
                console.log("Connection Opened");
                sendSignal('new-peer', {})
            }
            webSocket.onclose = function(e){
                console.log("Connection Closed");
            }
            webSocket.onerror = function(e){
                console.error("Error Occurred");
            }
            webSocket.onmessage = this.webSocketOnMessage
            if(this.role === "host" || this.role === "presenter"){
              document.getElementById("remote-view").style.display = "none"
              console.log(this.$props.mode);
              if(this.$props.mode === "screen"){
                var userMedia = await window.navigator.mediaDevices.getDisplayMedia({
                  video: true,
                  audio: true
                }).then(stream => {
                    localStream = stream
                    localVideo.srcObject = localStream
                    localVideo.muted = true
                }).catch(error => {
                    console.error(error);
                })
              }
              else if(this.$props.mode === "microphone"){
                var userMedia = await window.navigator.mediaDevices.getUserMedia({
                  audio: true
                }).then(stream => {
                    localStream = stream
                    localVideo.srcObject = localStream
                    localVideo.muted = true
                }).catch(error => {
                    console.error(error);
                })
                console.log("here");
              }
              
            }
            else{
              localVideo.style.display = "none";
            }
            
        },
        webSocketOnMessage(event){
          var parsedData = JSON.parse(event.data)
          var peerUsername = parsedData['peer']
          var peerAction = parsedData['action']
          if(peerUsername == this.username){
            return
          }
          var receiver_channel_name = parsedData['message']['receiver_channel_name']
          if(peerAction == 'new-peer'){
            this.createOfferer(peerUsername, receiver_channel_name)
            return 
          }
          if(peerAction == 'new-offer'){
            var offer = parsedData['message']['sdp']
            this.createAnswerer(offer, peerUsername, receiver_channel_name)
            return 
          }
          if(peerAction == 'new-answer'){
            var answer = parsedData['message']['sdp']
            var peer = mapPeers[peerUsername][0]
            peer.setRemoteDescription(answer)
            return
          }
        },
        
        createOfferer(username, channel_room){
          var peer = new RTCPeerConnection(null)
          this.addLocalTrack(peer)
          var dataChannel = peer.createDataChannel('channel')
          dataChannel.addEventListener('open', () => {
            console.log("Connection Opened");
          })
          dataChannel.onmessage = this.dataChannelOnMessage
          var remoteVideo = document.getElementById("remote-view")
          this.setOnTrack(peer, remoteVideo)
          mapPeers[username] = [peer, dataChannel]
          peer.oniceconnectionstatechange = function(){
            document.getElementById("self")
            var iceConnectionState = peer.iceConnectionState
            if(iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed'){
              delete mapPeers[username]
              if(iceConnectionState !== 'closed'){
                peer.close()
              }
              this.removeVideo(remoteVideo)
            }
          }
          peer.onicecandidate = function(event){
            if(event.candidate){
              console.log(JSON.stringify(peer.localDescription));
              return 
            }
            sendSignal('new-offer', {
              'sdp': peer.localDescription,
              'receiver_channel_name': channel_room
            })
          },
          
          peer.createOffer().then(
            o => peer.setLocalDescription(o).then(
              () =>{
                console.log("local description set successfully"); 
              }
            )
          )
        },
        createAnswerer(offer, peerUsername, receiver_channel_name){
          var peer = new RTCPeerConnection(null)
          this.addLocalTrack(peer)
          
          var remoteVideo = document.getElementById("remote-view")
          this.setOnTrack(peer, remoteVideo)

          peer.ondatachannel = function(e){
            peer.dc = e.channel
            peer.dc.addEventListener('open', () => {
              console.log("Connection Opened");
            })
            peer.dc.onmessage = this.dataChannelOnMessage
            mapPeers[peerUsername] = [peer, peer.dc]
          }
          
          
          peer.oniceconnectionstatechange = function(){
            var iceConnectionState = peer.iceConnectionState
            if(iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed'){
              delete mapPeers[peerUsername]
              if(iceConnectionState !== 'closed'){
                peer.close()
              }
              this.removeVideo(remoteVideo)
            }
          }
          peer.onicecandidate = function(event){
            if(event.candidate){
              console.log(JSON.stringify(peer.localDescription));
              return 
            }
            sendSignal('new-answer', {
              'sdp': peer.localDescription,
              'receiver_channel_name': receiver_channel_name
            })
          },
          peer.setRemoteDescription(offer).then(
            () => {
              console.log("remote desctription set successfully for %s", peerUsername);
              return peer.createAnswer()
            }
          ).then(
            a => {
              console.log("Answer Created");
              peer.setLocalDescription(a)
            }
          )
        },
        addLocalTrack(peer){
          localStream.getTracks().forEach(element => {
            peer.addTrack(element, localStream)
          })
          return 
        },
        dataChannelOnMessage(event){
          var message = event.data

        },
        setOnTrack(peer, remoteVideo){
          var remoteStream = new MediaStream()
          remoteVideo.srcObject = remoteStream
          peer.ontrack = function(event){
            remoteStream.addTrack(event.track, remoteStream) 
          }
        },


    },
    mounted(){
        this.initializeStream()
        username = this.$props.username
        console.log(this.$props.role);
        if(this.$props.role === "host" || this.$props.role === "presenter"){
          this.isPresenting = true  
        }
        
    },
    props:[
      'username',
      'role',
      'mode'
    ]
}
</script>

<style scoped>
   
#start {
  position: relative;
  top: 40%;
  width: 100%;
  text-align: center;
}

#code-input {
  border-radius: 3px;
  margin-bottom: 20px;
  padding: 5px;
  font-size: 16px;
  text-align: center;
  border: none;
}

#start-button {
  display: block;
  margin: auto;
  padding: 10px;
  font-size: 16px;
  border-radius: 3px;
  font-weight: bold;
  color: white;
  border: none;
}

#start-button:not(:disabled) {
  cursor: pointer;
  background-color: #000f1c;
}

#start-button:disabled {
  cursor: not-allowed ;
  background-color: #7691a8;
}

video {
  width: 100%;
}

#chat-room {
  display: grid;
  grid-gap: 16px;
  width: 100%;
  grid-template-columns: 1fr 3fr;
}

#remote-view-container{
  position: relative;
  grid-column: 2;
  background-color: black;
  height: 95vh;
}

#self-view {
  grid-column: 1;
  background-color: black;
  height: 100%;
  width: 100%;
}

#remote-view {
  
  grid-column: 1;
  background-color: black;
  height: 100%;
  width: 100%;
}

#view-buttons {
  opacity: 0;
  transition: opacity 0.5s ease-out;
  position: absolute;
  border-radius: 3px;
  background-color: darkgray;
  bottom: 10px;
  padding: 10px;
  left: 0;
  right: 0;
  margin: 20px;
  text-align: center;
}

#view-buttons:hover {
  opacity: 0.7;
}

.view-button {
  background-color: darkgray;
  border-color: darkgray;
  border-radius: 3px;
  font-size: 20px;
  color: white;
  padding: 5px;
  border: none;
}

.view-button:hover {
  cursor: pointer;
  background-color: #757272;
}
</style>