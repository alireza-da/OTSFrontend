<template>
    <div class="whiteboard" v-show="role">
        <div class="header">
            <p class="title"> Whiteboard {{instanceNumber}}</p>
            <p style="font-size: 10px" class="title">Viewing as : {{userRoleType}}</p>
            <div id="tools">
                <button id="erase" v-bind:class="{disbaled: mode == 'erase' }" v-on:click="setMode('erase')" class="toolButton" v-if="showToolButtons"><span class="fas fa-eraser"></span></button>
                <button id="draw" v-bind:class="{disabled: mode == 'draw'}" v-on:click="setMode('draw')" class="toolButton" v-if="showToolButtons"><span class="fas fa-pencil-alt"></span></button>
                <label for="colorPicker" class="toolButton" id="colorPickerLabel" v-if="showToolButtons"><span class="fas fa-palette"></span></label>
                <input type="color" v-model="drawColor"  id="colorPicker" class="toolButton" v-if="showToolButtons">    
                <label for="backgroundImageUploader" class="toolButton" v-if="showToolButtons"><i class="fas fa-image"></i></label>
                <input id="backgroundImageUploader" type="file" v-on:input="setImageBackground" v-if="showToolButtons">
                <div class="dropdown" v-if="showToolButtons">
                    <button class="toolButton" id="shapeButton"><i class="far fa-circle" v-if="showToolButtons"></i></button>
                    <div class="dropdown-content-shapes">
                        <button class="toolButton" v-on:click="changeShape('rectangle')" id="rectangle" v-if="showToolButtons"><i class="far fa-square"></i></button>
                        <button class="toolButton" v-on:click="changeShape('triangle')" id="triangle" v-if="showToolButtons"><img src="../assets/bleach.svg"></button>
                        <button class="toolButton" v-on:click="changeShape('circle')" id="circle" v-if="showToolButtons"><i class="far fa-circle"></i></button>
                        <button class="toolButton" v-on:click="changeShape('line')" id="line" v-if="showToolButtons">|</button>
                    </div>
                </div>
                <div class="dropdown">
                    <button id="text" class="toolButton" style="font-weight:bold" v-on:click="setIsText" v-if="showToolButtons">T</button>
                    <div class="dropdown-content-shapes" style="display:none;border: 2px solid black; border-radius: 4px;padding :2px" id="inputTextDiv">
                        <input type="text" id="inputText" style="margin 2px; border:none; outline:none" v-on:input="drawText" placeholder="Text" onfocus="this.value=''" v-if="showToolButtons">
                    </div>
                </div>
                <button id="clear" v-on:click="clear" class="toolButton" v-if="showToolButtons"><span class="fa fa-trash" aria-hidden="true"></span></button>
                <div class="slidecontainer">
                    <label for="pencilThicknessInput" style="font-size: 10px; color: white; font-weight: bold; margin-left: 5px" v-if="showToolButtons"> Thickness </label>
                    <input v-on:input="changePencilThickness" type="range" min="1" max="50" value="5" id="pencilThicknessInput" v-if="showToolButtons">
                </div>
                
                <div class="dropdown">
                    <button class="toolButton" id="shareButton"><i class="fa fa-share-alt" aria-hidden="true"></i></button>
                    <div class="dropdown-content-shapes">
                        <button class="toolButton" v-on:click="share('screen')" id="screen"><i class="fas fa-desktop"></i></button>
                        <button class="toolButton" v-on:click="share('microphone')" id="microphone"><i class="fa fa-microphone"></i></button>
                    </div>
                </div>
                <button id="save" class="toolButton" v-on:click="save"><i class="fas fa-save"></i></button>
                <button id="record" class="toolButton" v-on:click="record"><i class="fas fa-circle"></i></button>
                <p id="recordTime">{{recordTime}}</p>

            </div>
            <button id="close" class="toolButton" v-on:click="closeWhiteBoard" ><i class="fa fa-window-close" aria-hidden="true"></i></button>
        </div>
        <canvas v-if="!isSharingScreen" width="400" height="400" id="whiteboard_canvas" ref="wb_canvas" v-on:mouseup="setIsDraw" v-on:mousemove="draw" v-on:mousedown="setIsDraw" v-on:mouseover="changeCursor" resize>Sorry, your browser does not support HTML5 canvas technology.</canvas>    
        <share-screen v-if="isSharingScreen" v-bind:username="username" v-bind:role="userRoleType" v-bind:mode="shareMode"/>
    </div>
    
</template>


<script>
import '@fortawesome/fontawesome-free/js/all';
import ShareScreen from './ShareScreen.vue';
import axios from 'axios'
import { createToast } from 'mosha-vue-toastify'
var canvas, ctx, canvasX, canvasY, imageData;
var intervalId;
var textCoordX, textCoordY;
var imageFrames = [];
var recordedChunks = [];
var isTextTemp;
var clickCounter = 0;
var lineStartPoint , lineEndPoint;


window.onresize = function () {
    canvas = document.getElementById("whiteboard_canvas");
    canvas.width = document.getElementsByClassName("whiteboard")[0].offsetWidth - 20
    canvas.height = document.getElementsByClassName("whiteboard")[0].offsetHeight
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.getAttribute("width"), canvas.getAttribute("height"));
    if(imageData !== undefined){
        ctx.putImageData(imageData, 0, 0)
    }
    
    
}
    

window.addEventListener('load', function(){
    canvas = document.getElementById("whiteboard_canvas");    
    canvas.width = document.getElementsByClassName("whiteboard")[0].offsetWidth - 20
    canvas.height = document.getElementsByClassName("whiteboard")[0].offsetHeight
    ctx = canvas.getContext("2d")
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    
}, false)

export default {
    components:{
        shareScreen: ShareScreen
    },
    data() {
        return {
            instanceNumber: 1,
            pencilColor: 'black',
            eraseColor: '#fff',
            mode: 'draw',
            isDrawing: false,
            pencilThickness: 5,
            drawColor: '#000',
            shape: "circle",
            recordTime: "0:0:0",
            isRecording: false,
            isText: false,
            showToolButtons: true,
            userRoleType: "",
            cStream: null,
            mediaRecorder: null,
            options: null,
            isSharingScreen: false,
            givenToken: "",
            username: "",
            api_user_info: "http://127.0.0.1:8000/user/me/",
            shareMode: ""
        }
    },
    watch: {
        drawColor: function(){
            this.changeIconColor("colorPickerLabel")
        },
    },
    
    methods: {
        share(source){
            this.isSharingScreen = !this.isSharingScreen
            this.shareMode = source
        },
        setIsDraw(e){
            if(e.type === 'mouseup'){
                this.isDrawing = false
            }else {
                if(typeof ctx !== 'undefined'){
                    this.isDrawing = true
                    ctx.beginPath();
                    canvasX = e.pageX - canvas.offsetLeft;
                    canvasY = e.pageY - canvas.offsetTop;
                    ctx.moveTo(canvasX, canvasY);   
                }
            }
        },
        setIsText(){
            document.getElementById("text").style.background = "#43e5f7"
            this.isText = true
            isTextTemp = this.isText
        },
        drawText(){
            document.getElementById("inputTextDiv").style.display = "block"
            var text = document.getElementById("inputText").value
            ctx.fillStyle = this.pencilColor
            ctx.font = "20px Arial";
            ctx.fillText(text,textCoordX,textCoordY)
        },
        changeIconColor(id){
            if (document.getElementById(id) !== null){
                document.getElementById(id).style.color = this.drawColor
            }            
        },
        draw(e){
            if(!this.showToolButtons){
                return
            }
            document.getElementById("inputText").onkeypress = function(e){
                if(e.key === "Enter"){
                    document.getElementById("text").style.background = "white"
                    isTextTemp = false
                    document.getElementById("inputTextDiv").style.display = "none"
                    document.getElementById("inputTextDiv").value = ''
                }                
            }
            if(isTextTemp === false){
                this.isText = false;
            }
            if(isTextTemp === true){
                this.isText = true;
            }
            ctx.lineWidth = this.pencilThickness;
            ctx.lineHeight = this.pencilThickness;
            if(canvas.width > 0){
                imageData = ctx.getImageData(0, 0, canvas.offsetWidth, canvas.offsetHeight)
            }
            
            if(this.mode === 'erase'){
                this.pencilColor = this.eraseColor
            }
            else if(this.mode === 'draw'){
                this.pencilColor = this.drawColor
            }
            if(typeof ctx !== 'undefined'){
                if(this.isDrawing !== false){
                    canvasX = e.pageX - canvas.offsetLeft;
                    canvasY = e.pageY - canvas.offsetTop;
                    
                    if (this.mode === "shape"){
                        this.drawShape(canvasX,canvasY);
                        return
                    }
                    if(this.isText){
                        textCoordX = canvasX
                        textCoordY = canvasY
                        this.drawText()
                        return
                    }
                    ctx.lineTo(canvasX, canvasY);
                    ctx.strokeStyle = this.pencilColor;
                    ctx.stroke();
                }
                else if(this.isDrawing === false){
                    ctx.closePath()
                }
            }
        },
        changeColor(color){
            this.pencilColor = color;
        },
        setMode(mode){
            this.mode = mode
            if (mode === 'erase'){
                document.getElementById(mode).disabled = true
                document.getElementById('draw').disabled = false
            }
            if (mode === 'draw'){
                document.getElementById(mode).disabled = true
                document.getElementById('erase').disabled = false
            }
            
        },
        changeCursor(){
            if( typeof canvas !== 'undefined'){
                canvas.style.cursor = 'crosshair'
            }
        },
        changePencilColor(){
            this.pencilColor = document.getElementById("colorPicker").value
        },
        clear(){
            ctx.fillStyle = '#fff'
            ctx.fillRect(0, 0, canvas.getAttribute("width"), canvas.getAttribute("height"));
        },
        changePencilThickness(){
            this.pencilThickness = document.getElementById("pencilThicknessInput").value
        },
        closeWhiteBoard(){
            document.getElementsByClassName("whiteboard")[0].style.display = "none"
        },
        setImageBackground(){
            const image =  new Image()
            const reader = new FileReader();
            reader.onloadend = () => {
                image.src = reader.result
                image.onload = function () {
                    ctx.drawImage(image, 0, 0, canvas.offsetWidth, canvas.offsetHeight)
                }
            }
            const file = document.getElementById("backgroundImageUploader").files[0];
            reader.readAsDataURL(file)
        },
        changeShape(shape){
            this.mode = "shape";
            this.shape = shape
            document.getElementsByClassName("dropdown-content-shapes")[0].childNodes.forEach((s) => s.disabled = false)
            document.getElementById(shape).disabled = true
        },
        drawLine(x, y){
            if(clickCounter === 0){
                lineStartPoint = x
                lineEndPoint = y
                clickCounter++
                return true
            }
            else if(clickCounter === 1){
                ctx.strokeStyle = this.pencilColor
                ctx.lineWidth = this.pencilThickness;
                ctx.lineHeight = this.pencilThickness;
                ctx.beginPath()
                ctx.moveTo(lineStartPoint, lineEndPoint)
                ctx.lineTo(x, y)
                ctx.stroke()
                clickCounter = 0
                this.mode = "draw"
                document.getElementsByClassName("dropdown-content-shapes")[0].childNodes.forEach((s) => s.disabled = false)
                return false
            }
        },
        drawShape(x, y){
            switch (this.shape) {
                case "circle":
                    ctx.beginPath();
                    ctx.arc(x, y, 50, 0, Math.PI * 2, true);
                    ctx.stroke();
                    break;
                case "rectangle":
                    ctx.beginPath();
                    ctx.strokeRect(x, y, 50, 50)
                    break;
                case "triangle":
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x-40, y-40);
                    ctx.lineTo(x-80, y)
                case "line":
                    this.drawLine(x, y)
                    return
                    break;
                default:
                    break;
            }
            this.mode = "draw"
            document.getElementsByClassName("dropdown-content-shapes")[0].childNodes.forEach((s) => s.disabled = false)
        },
        toggleRecordIcon(){
            this.isRecording = !this.isRecording
            if(this.isRecording){
                document.getElementById("record").innerHTML = '<i class="fas fa-square"></i>'
            }else{
                document.getElementById("record").innerHTML = '<i class="fas fa-circle"></i>'
            }
        },
        record(){
            // timer & icon
            this.toggleRecordIcon()
            document.getElementById("recordTime").style.display = "inline-block"
            let elapsedTime
            let startTime = Date.now()
            if(this.cStream === null){
                
                this.cStream = canvas.captureStream(60)
                this.options = { mimeType: "video/webm; codecs=vp9" }
                this.mediaRecorder = new MediaRecorder(this.cStream);
                this.mediaRecorder.ondataavailable = this.handleDataAvailable
                this.mediaRecorder.onstop = this.download
            }
            
            if(this.isRecording){
                intervalId = setInterval(function getRecordTime(){
                    elapsedTime = Date.now() - startTime
                    this.recordTime = timeToString(elapsedTime)
                    document.getElementById("recordTime").innerHTML = this.recordTime
                    //imageFrames.push(imageData)
                }, 1000)

                this.mediaRecorder.start()                

            }
            if(!this.isRecording){
                clearInterval(intervalId)
                this.mediaRecorder.stop()
                createToast("Recording paused. File will be downloaded soon.")
            }            
        },
        handleDataAvailable(event) {
            console.log("data-available");
            console.log(event.data);
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
                console.log(recordedChunks);
            }
        },
        download() {
            var blob = new Blob(recordedChunks, {'type':
                "video/webm; codecs=vp9"
            })
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = "record.webm";
            a.click();
            window.URL.revokeObjectURL(url);
            recordedChunks = []
        },
        save(){
            var imageUri = canvas.toDataURL("image/jpg")
            var link = document.createElement("a")
            link.download = "whiteboard"+this.instanceNumber+Date.now().toString+".png"
            link.href = imageUri
            link.click()
        },
        async fetchToken(){
            this.givenToken = this.$props.token
            return this.token
        },
        async getUsername(){
            await axios.get(this.api_user_info, {headers: {
                                    "Access-Control-Allow-Origin" : "*",
                                    "Content-type": "Application/json",
                                    "Authorization": `Token ${this.givenToken}`
                                }
                            }
                        ).then(
                            response => {
                                this.username = response.data["username"]
                            }
                        )
        }
    },
    props: [
        'userRole',
        'token'   
    ],
    computed:{
        role: async function(){
            
            await this.$props.userRole.then(value => {
                console.log(value);

                if(value === "listener"){
                    this.showToolButtons = false
                }
                else if(value === "host"){
                    this.showToolButtons = true
                }
                else if(value === "speaker"){
                    this.showToolButtons = false
                }
                else if(value === "presenter"){
                    this.showToolButtons = true
                }
                else this.showToolButtons = false

                this.userRoleType = value
                return value
            })
            
        }
    },
    mounted(){
        this.fetchToken()
        this.getUsername()
    }
}
function timeToString(time) {
    let diffInHrs = time / 3600000;
    let hh = Math.floor(diffInHrs);

    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);

    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);

    return `${hh}:${mm}:${ss}`;
}

</script>

<style scoped>

    .whiteboard {
        font-family: Arial, Helvetica, sans-serif;
        width: 100% ;
        height: 100%;
        background-color: rgb(38, 3, 95);
        border-radius: 5px;
        border-color: black;
        text-align: start;
        padding: 5px;
        margin: 5px;
        
    }
    p.title {
        color: rgb(255, 255, 255);
        font-weight: bold;
        align-content: center;
        margin: 5px;
        padding: 5px;
        display: inline-block;
    }
    #tools {
        margin: 5px;
        padding: 5px;
        justify-content: space-between;
        display: inline-block;
        align-items: flex-end;
    }
    #colorPicker {
        background: whitesmoke;  
        display: none;
    }
    #backgroundImage {
        display: inline-block;
        margin: 0;
        padding: 0;
        
    }
    #backgroundImageUploader {
        -webkit-appearance: none;
        display: none;
        
    }
    #record {
        color: red;
    }
    #recordTime {
        color: white;
        display: none;
    }
    .toolButton {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bold;
        background: white;
        padding: 5px;
        border-radius: 5px;
        border: 2px solid rgb(41, 40, 40);
        align-content: center;
        margin: 5px;
        color: black;
        width: 30px;
        height: 30px;
        
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
    .dropdown-content-shapes a {
        color: white;
        padding: 12px 16px;
        text-decoration: cadetblue;
        display: block;
    }
    
    /* Change color of dropdown links on hover */
    .dropdown-content-shapes a:hover {background-color:#43e5f7;}

    /* Show the dropdown menu on hover */
    .dropdown:hover .dropdown-content-shapes {
        display: block;
    }
    #close {
        float: right;
        
    }
    #close:hover {
        color: red;
        background: white;
    }
    .toolButton:hover {
        background: #43e5f7;
    }
    button[disabled]{
        background: gray;
    }
    button[hidden]{
        display: none;
    }
    .header {
        display: inline;
    }
    .slidecontainer {
        display: inline-block;
    }
    input[type='range'] {
      overflow: hidden;
      width: 80px;
      -webkit-appearance: none;
      background-color: #2e2e2e;
      border-radius: 2px;
    }
    
    input[type='range']::-webkit-slider-runnable-track {
      height: 10px;
      -webkit-appearance: none;
      color: #13bba4;
      margin-top: -1px;
      
    }
    input[type='range']::-webkit-slider-thumb {
      width: 10px;
      -webkit-appearance: none;
      height: 10px;
      cursor: ew-resize;
      background: rgb(0, 0, 0);
      box-shadow: -80px 0 0 80px #43e5f7;
    }
</style>
