/* =====================================================
 SAFARI AI V1 - COMPLETE SCRIPT
 Created by ICEBACK MASTER TECH
 Powered by SAFARI TECHNOLOGY & ICEBACK MASTER TECH
===================================================== */

"use strict";

const SAFARI = {
    chatAPI:"https://api.hostify.co.zw/api/ai/gemini",
    imageAPI:"https://image.pollinations.ai/prompt/",
    creator:"ICEBACK MASTER TECH",
    powered:"SAFARI TECHNOLOGY & ICEBACK MASTER TECH"
};


document.addEventListener("DOMContentLoaded",()=>{

    setupLogin();
    setupChat();
    setupImage();
    setupCode();
    setupTheme();
    setupLogout();
    loadChat();
    particles();

});



/* LOGIN */

function setupLogin(){

const btn=document.getElementById("loginBtn");
const overlay=document.getElementById("loginOverlay");
const app=document.getElementById("app");


if(!btn)return;


btn.onclick=()=>{

let email=document.getElementById("loginEmail").value.trim();
let pass=document.getElementById("loginPassword").value.trim();


if(!email || !pass){

alert("Enter email and password");
return;

}


localStorage.setItem("safari_user",email);

overlay.classList.add("hidden");
app.classList.remove("hidden");

notify("Welcome to SAFARI AI 🦁");

};


let user=localStorage.getItem("safari_user");

if(user){

overlay.classList.add("hidden");
app.classList.remove("hidden");

}

}



/* LOGOUT */

function setupLogout(){

let btn=document.getElementById("logoutBtn");

if(btn){

btn.onclick=()=>{

localStorage.removeItem("safari_user");

location.reload();

};

}

}





/* CHAT */

function setupChat(){

let send=document.getElementById("sendBtn");
let input=document.getElementById("userInput");


if(!send)return;


send.onclick=sendMessage;


input.addEventListener("keydown",e=>{

if(e.key==="Enter")sendMessage();

});

}



async function sendMessage(){

let input=document.getElementById("userInput");

let text=input.value.trim();


if(!text)return;


addMessage(text,"user");

input.value="";


let ai=addMessage("SAFARI AI thinking... 🤖","ai");


try{

let r=await fetch(SAFARI.chatAPI,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
message:text
})

});


let data=await r.json();


ai.innerHTML=data.reply || data.message || backup(text);


}catch(e){

ai.innerHTML=backup(text);

}


saveChat();

}




function addMessage(text,type){

let box=document.getElementById("chatMessages");

let div=document.createElement("div");

div.className=type==="user"?
"user-message":
"ai-message";

div.innerHTML=text;

box.appendChild(div);

box.scrollTop=box.scrollHeight;

return div;

}





function backup(t){

t=t.toLowerCase();


if(t.includes("hello"))
return "Hello 👋 I am SAFARI AI.";

if(t.includes("creator"))
return "Created by ICEBACK MASTER TECH. Powered by SAFARI TECHNOLOGY.";

if(t.includes("code"))
return "I can help with HTML, CSS, JavaScript and programming.";

if(t.includes("math"))
return "I can help solve mathematics problems.";

return "I am SAFARI AI 🦁. Ask me anything.";

}





/* IMAGE STUDIO */

function setupImage(){

let btn=document.getElementById("generateImage");


if(!btn)return;


btn.onclick=()=>{


let prompt=document.getElementById("imagePrompt").value;


if(!prompt){

alert("Enter image description");

return;

}


document.getElementById("generatedImage").src=
SAFARI.imageAPI+
encodeURIComponent(prompt);


notify("Creating image...");

};


}







/* CODE STUDIO */

function setupCode(){

let btn=document.getElementById("explainCode");


if(!btn)return;


btn.onclick=()=>{


let code=document.getElementById("codeInput").value;


document.getElementById("codeResult").innerHTML=

`
<b>SAFARI AI Code Assistant</b><br><br>
Your code was received.<br>
I can help debug, explain and improve it.
`;

};


}







/* THEME */

function setupTheme(){

let btn=document.getElementById("themeBtn");


if(!btn)return;


btn.onclick=()=>{


let html=document.documentElement;


html.dataset.theme=
html.dataset.theme==="dark"?
"light":
"dark";


};

}







/* CHAT MEMORY */


function saveChat(){

let box=document.getElementById("chatMessages");

if(box){

localStorage.setItem(
"safari_chat",
box.innerHTML
);

}

}



function loadChat(){

let old=localStorage.getItem("safari_chat");

let box=document.getElementById("chatMessages");


if(old && box){

box.innerHTML=old;

}

}





/* NOTIFICATION */


function notify(msg){

let n=document.createElement("div");

n.innerHTML=msg;

n.style.position="fixed";
n.style.bottom="20px";
n.style.right="20px";
n.style.padding="15px";
n.style.background="#6366f1";
n.style.color="white";
n.style.borderRadius="15px";
n.style.zIndex="9999";


document.body.appendChild(n);


setTimeout(()=>n.remove(),3000);

}





/* PARTICLES */

function particles(){

let c=document.getElementById("particlesCanvas");

if(!c)return;


let ctx=c.getContext("2d");

c.width=innerWidth;
c.height=innerHeight;


let p=[];


for(let i=0;i<60;i++){

p.push({

x:Math.random()*c.width,
y:Math.random()*c.height,
s:Math.random()*3

});

}


function draw(){

ctx.clearRect(0,0,c.width,c.height);


p.forEach(a=>{

ctx.beginPath();

ctx.arc(a.x,a.y,a.s,0,Math.PI*2);

ctx.fillStyle="rgba(99,102,241,.5)";

ctx.fill();


a.y--;

if(a.y<0)a.y=c.height;


});


requestAnimationFrame(draw);

}


draw();

}


console.log("🦁 SAFARI AI V1 Ready");
